import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Get cart items
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error("Error fetching cart items:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Add item to cart
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { productId } = await req.json()
    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return new NextResponse("Product not found", { status: 404 })
    }

    // Check if item already in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
      },
    })

    if (existingCartItem) {
      // Update quantity
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + 1,
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      })

      return NextResponse.json(updatedCartItem)
    }

    // Add new item to cart
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        quantity: 1,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error("Error adding item to cart:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Update cart item quantity
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id, quantity } = await req.json()
    if (!id || typeof quantity !== "number" || quantity < 1) {
      return new NextResponse("Invalid request", { status: 400 })
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    })

    if (!cartItem || cartItem.userId !== session.user.id) {
      return new NextResponse("Cart item not found", { status: 404 })
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json(updatedCartItem)
  } catch (error) {
    console.error("Error updating cart item:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Remove item from cart
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await req.json()
    if (!id) {
      return new NextResponse("Cart item ID is required", { status: 400 })
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    })

    if (!cartItem || cartItem.userId !== session.user.id) {
      return new NextResponse("Cart item not found", { status: 404 })
    }

    await prisma.cartItem.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error removing item from cart:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 