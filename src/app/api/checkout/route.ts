import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import Stripe from "stripe"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CartItem, Product, Role } from "@prisma/client"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as const,
})

interface CartItemWithProduct extends CartItem {
  product: Product
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { discountCode } = await req.json()

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: true,
      },
    })

    if (cartItems.length === 0) {
      return new NextResponse("Cart is empty", { status: 400 })
    }

    // Calculate total and apply discounts
    let totalAmount = cartItems.reduce(
      (sum: number, item: CartItemWithProduct) =>
        sum + item.product.price * item.quantity,
      0
    )

    // Apply discount code if provided
    if (discountCode) {
      const discount = await prisma.discountCode.findUnique({
        where: { code: discountCode },
      })

      if (discount) {
        if (
          (!discount.maxUses || discount.usedCount < discount.maxUses) &&
          (!discount.expiresAt || new Date() < discount.expiresAt)
        ) {
          totalAmount = totalAmount * (1 - discount.discount)
          await prisma.discountCode.update({
            where: { id: discount.id },
            data: { usedCount: { increment: 1 } },
          })
        }
      }
    }

    // Apply role-based discounts
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: true },
    })

    const roleDiscount = user?.roles.reduce((max: number, role: Role) => {
      return role.discount && role.discount > max ? role.discount : max
    }, 0)

    if (roleDiscount) {
      totalAmount = totalAmount * (1 - roleDiscount)
    }

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cartItems.map((item: CartItemWithProduct) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.title,
            description: item.product.description,
            images: [item.product.imageUrl],
          },
          unit_amount: Math.round(item.product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/store/orders?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/store/cart?canceled=true`,
      metadata: {
        userId: session.user.id,
        cartItemIds: cartItems.map((item: CartItemWithProduct) => item.id).join(","),
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 