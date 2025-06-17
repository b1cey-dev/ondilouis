import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET: List all roles (admin only)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user can manage roles
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

    // Fetch and return roles
    const roles = await prisma.role.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json(roles)
  } catch (error) {
    console.error("[ADMIN_ROLES_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * POST: Create a new role (admin only)
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user can manage roles
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

    // Parse body
    const { name, description, color, permissions, discount, isTeam } =
      await req.json()
    if (!name || !description || !color || !Array.isArray(permissions)) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Prevent duplicates
    const existing = await prisma.role.findUnique({ where: { name } })
    if (existing) {
      return new NextResponse("Role already exists", { status: 400 })
    }

    // Create and return new role
    const role = await prisma.role.create({
      data: { name, description, color, permissions, discount, isTeam },
    })
    return NextResponse.json(role)
  } catch (error) {
    console.error("[ADMIN_ROLES_POST]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
