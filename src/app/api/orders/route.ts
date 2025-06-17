import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                fileUrl: true,
                price: true,
                category: true,
                creator: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
        rating: true,
        chat: {
          include: {
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { productId, quantity } = await req.json()
    if (!productId || !quantity || quantity < 1) {
      return new NextResponse("Invalid request", { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return new NextResponse("Product not found", { status: 404 })
    }

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalPrice: product.price * quantity,
        orderItems: {
          create: {
            productId: productId,
            quantity: quantity,
            price: product.price
          }
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                price: true,
                imageUrl: true,
                fileUrl: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 