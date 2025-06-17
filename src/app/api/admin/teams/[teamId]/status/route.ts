import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PUT: Update the active status of a team (admin only)
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  // Unwrap params
  const { teamId } = await params

  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user has permission to manage teams
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: true },
    })
    const isAdmin = user?.roles.some(role =>
      Array.isArray(role.permissions) &&
      (role.permissions as string[]).includes("manage_teams")
    )
    if (!isAdmin) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    // Parse request body
    const { isActive } = await req.json()
    if (typeof isActive !== 'boolean') {
      return new NextResponse("Invalid isActive value", { status: 400 })
    }

    // Update team status
    const team = await prisma.team.update({
      where: { id: teamId },
      data: { isActive },
      include: { _count: { select: { members: true } } },
    })

    // Transform output to match frontend expectations
    const transformed = {
      id: team.id,
      name: team.name,
      description: team.description,
      membersCount: team._count.members,
      createdAt: team.createdAt,
      isActive: team.isActive,
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("[TEAM_STATUS_UPDATE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
