import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * DELETE: Remove a role (admin only)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  // Unwrap params
  const { roleId } = await params

  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user has permission to manage roles
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: true },
    })
    const canManageRoles = user?.roles.some(role =>
      Array.isArray(role.permissions) &&
      (role.permissions as string[]).includes("manage_roles")
    )
    if (!canManageRoles) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
    })
    if (!existingRole) {
      return new NextResponse("Role not found", { status: 404 })
    }

    // Delete the role
    await prisma.role.delete({ where: { id: roleId } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[ROLE_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
