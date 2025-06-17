import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PUT: Update the status of a product (admin only)
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  // Await and extract productId
  const { productId } = await params

  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user has permission to manage products
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: true },
    })
    const canManageProducts = user?.roles.some(role =>
      Array.isArray(role.permissions) &&
      (role.permissions as string[]).includes("manage_products")
    )
    if (!canManageProducts) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    // Parse and validate request body
    const { status } = await req.json()
    if (!status || !["approved", "rejected"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 })
    }

    // Update product status
    const product = await prisma.product.update({
      where: { id: productId },
      data: { status },
      include: {
        creator: {
          select: { id: true, username: true, email: true },
        },
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("[PRODUCT_STATUS_UPDATE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
