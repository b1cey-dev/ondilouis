import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the Promise-wrapped params to extract `id`
  const { id } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user has admin permissions
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

    // Delete announcement
    await prisma.announcement.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[ANNOUNCEMENT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
