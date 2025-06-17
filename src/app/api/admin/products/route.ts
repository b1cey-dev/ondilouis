import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET: List all products (admin only)
 */
export async function GET() {
  try {
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

    // Fetch all products with creator information
    const products = await prisma.product.findMany({
      include: {
        creator: {
          select: { id: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * DELETE: Remove a product (admin only)
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")
    if (!productId) {
      return new NextResponse("Product ID required", { status: 400 })
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

    // Delete the product
    await prisma.product.delete({ where: { id: productId } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
