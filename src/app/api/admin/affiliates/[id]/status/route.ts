import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/types/prisma"

export async function PUT(
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
      role.permissions.includes("manage_affiliates")
    )

    if (!isAdmin) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    const { isActive } = await req.json()

    // Update affiliate status
    const affiliate = await prisma.affiliate.update({
      where: { id },
      data: { isActive },
      include: {
        user: {
          select: { id: true, username: true, email: true },
        },
      },
    })

    return NextResponse.json(affiliate)
  } catch (error) {
    console.error("[AFFILIATE_STATUS_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

