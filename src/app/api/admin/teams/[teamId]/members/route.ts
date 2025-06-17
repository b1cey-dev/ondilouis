import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET: List members of a team (admin only)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params

  try {
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

    // Fetch team members with their roles
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            email: true,
            roles: {
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
    })
    if (!team) {
      return new NextResponse("Team not found", { status: 404 })
    }

    return NextResponse.json(team.members)
  } catch (error) {
    console.error("[TEAM_MEMBERS_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * POST: Add a user to a team by email (admin only)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params

  try {
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

    const { email } = await req.json()
    if (!email) {
      return new NextResponse("Email required", { status: 400 })
    }

    // Find user by email
    const targetUser = await prisma.user.findUnique({
      where: { email },
      include: { roles: { select: { id: true, name: true, color: true } } },
    })
    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Add user to team
    await prisma.team.update({
      where: { id: teamId },
      data: { members: { connect: { id: targetUser.id } } },
    })

    return NextResponse.json({
      id: targetUser.id,
      username: targetUser.username,
      email: targetUser.email,
      roles: targetUser.roles,
    })
  } catch (error) {
    console.error("[TEAM_MEMBERS_POST]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
