import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST: Rate a completed order
export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { rating, comment } = await req.json()

    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return new NextResponse("Invalid rating", { status: 400 })
    }

    // Fetch the order with items and product creators
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: { select: { creatorId: true } }
          }
        }
      }
    })

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    if (order.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (order.status !== "completed") {
      return new NextResponse("Order not completed", { status: 400 })
    }

    // Rate the creator of the first item in the order
    const creatorId = order.orderItems[0]?.product.creatorId
    if (!creatorId) {
      return new NextResponse("No creator to rate", { status: 400 })
    }

    const newRating = await prisma.rating.create({
      data: {
        orderId,
        userId: creatorId,
        raterId: session.user.id,
        rating,
        comment,
      },
      include: {
        user: { select: { username: true } }
      }
    })

    return NextResponse.json(newRating)
  } catch (error) {
    console.error("[ORDER_RATE_POST]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
