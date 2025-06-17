import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

type OrderItemWithProduct = Prisma.OrderItemGetPayload<{
  include: { product: true }
}>

interface OrderWithItems {
  id: string
  userId: string
  status: string
  orderItems: OrderItemWithProduct[]
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get the order
    const order = (await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: true } },
      },
    })) as OrderWithItems | null

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    if (order.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (order.status !== "completed") {
      return new NextResponse("Order not completed", { status: 400 })
    }

    // Get all download URLs
    const downloads = order.orderItems.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      fileUrl: item.product.fileUrl,
    }))

    return NextResponse.json(downloads)
  } catch (error) {
    console.error("[ORDER_DOWNLOAD_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
