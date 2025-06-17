import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET: List all announcements (admin only)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check admin permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: true },
    })
    const isAdmin = user?.roles.some(role =>
      Array.isArray(role.permissions) &&
      (role.permissions as string[]).includes("manage_announcements")
    )
    if (!isAdmin) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    // Fetch all announcements with creator info
    const announcements = await prisma.announcement.findMany({
      include: {
        createdBy: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error("[ANNOUNCEMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * POST: Create a new announcement (admin only)
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check admin permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: true },
    })
    const isAdmin = user?.roles.some(role =>
      Array.isArray(role.permissions) &&
      (role.permissions as string[]).includes("manage_announcements")
    )
    if (!isAdmin) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    // Parse and validate body
    const { title, content, type, isPublished } = await req.json()
    if (!title || !content || !type) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type,
        isPublished,
        creatorId: session.user.id,
      },
      include: {
        createdBy: { select: { id: true, username: true } },
      },
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error("[ANNOUNCEMENTS_POST]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * PUT: Update an existing announcement (admin only)
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check admin permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: true },
    })
    const isAdmin = user?.roles.some(role =>
      Array.isArray(role.permissions) &&
      (role.permissions as string[]).includes("manage_announcements")
    )
    if (!isAdmin) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    // Parse and validate body
    const { id, title, content, type, isPublished } = await req.json()
    if (!id) {
      return new NextResponse("Announcement ID required", { status: 400 })
    }

    // Update announcement
    const announcement = await prisma.announcement.update({
      where: { id },
      data: { title, content, type, isPublished },
      include: {
        createdBy: { select: { id: true, username: true } },
      },
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error("[ANNOUNCEMENTS_PUT]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
