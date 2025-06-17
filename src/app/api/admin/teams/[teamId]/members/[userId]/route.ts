import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * DELETE: Remove a user from a team (admin only)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ teamId: string; userId: string }> }
) {
  // Unwrap params
  const { teamId, userId } = await params

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

    // Remove user from team
    await prisma.team.update({
      where: { id: teamId },
      data: {
        members: { disconnect: { id: userId } },
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TEAM_MEMBER_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
