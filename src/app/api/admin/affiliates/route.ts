import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateAffiliateCode } from "@/lib/utils"

/**
 * GET: List all affiliates (admin only)
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
      (role.permissions as string[]).includes("manage_affiliates")
    )
    if (!isAdmin) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    // Fetch affiliates
    const affiliates = await prisma.affiliate.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(affiliates)
  } catch (error) {
    console.error("[AFFILIATES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * POST: Create a new affiliate (admin only)
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
      (role.permissions as string[]).includes("manage_affiliates")
    )
    if (!isAdmin) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    // Parse request
    const { email, commission } = await req.json()

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { email },
      include: { affiliate: true },
    })
    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 })
    }
    if (targetUser.affiliate) {
      return new NextResponse("User is already an affiliate", { status: 400 })
    }

    // Create affiliate
    const affiliate = await prisma.affiliate.create({
      data: {
        userId: targetUser.id,
        code: generateAffiliateCode(),
        commission,
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    })

    return NextResponse.json(affiliate)
  } catch (error) {
    console.error("[AFFILIATES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
