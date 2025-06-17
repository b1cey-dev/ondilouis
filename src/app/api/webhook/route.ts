import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"

import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as const,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

interface CartItemWithProduct {
  id: string
  productId: string
  quantity: number
  product: {
    price: number
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      return new NextResponse("No signature", { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      const { userId, cartItemIds } = session.metadata || {}
      if (!userId || !cartItemIds) {
        throw new Error("Missing metadata")
      }

      // Get cart items
      const cartItems = await prisma.cartItem.findMany({
        where: {
          id: { in: cartItemIds.split(",") },
        },
        include: {
          product: true,
        },
      })

      // Create orders
      await Promise.all(
        cartItems.map((item: CartItemWithProduct) =>
          prisma.order.create({
            data: {
              userId,
              totalPrice: item.product.price * item.quantity,
              status: "completed",
              orderItems: {
                create: {
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.product.price
                }
              }
            },
          })
        )
      )

      // Clear cart
      await prisma.cartItem.deleteMany({
        where: {
          id: { in: cartItemIds.split(",") },
        },
      })
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return new NextResponse(
      "Webhook error: " + (error as Error).message,
      { status: 400 }
    )
  }
} 