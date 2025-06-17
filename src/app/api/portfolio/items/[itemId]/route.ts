import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { PortfolioItem } from "@prisma/client"

/**
 * DELETE: Remove a portfolio item
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get user's portfolio and items
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    })
    if (!portfolio) {
      return new NextResponse("Portfolio not found", { status: 404 })
    }

    // Check ownership of item
    const item = portfolio.items.find((it) => it.id === itemId)
    if (!item) {
      return new NextResponse("Item not found", { status: 404 })
    }

    // Delete the portfolio item
    await prisma.portfolioItem.delete({ where: { id: itemId } })

    // Return updated portfolio
    const updated = await prisma.portfolio.findUnique({
      where: { id: portfolio.id },
      include: { items: true },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("[PORTFOLIO_ITEM_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * PATCH: Update a portfolio item
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { title, description, mediaUrl, mediaType } = await req.json()

    // Get user's portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    })
    if (!portfolio) {
      return new NextResponse("Portfolio not found", { status: 404 })
    }

    // Check ownership of item
    const item = portfolio.items.find((it) => it.id === itemId)
    if (!item) {
      return new NextResponse("Item not found", { status: 404 })
    }

    // Update the portfolio item
    await prisma.portfolioItem.update({
      where: { id: itemId },
      data: { title, description, mediaUrl, mediaType },
    })

    // Return updated portfolio
    const updated = await prisma.portfolio.findUnique({
      where: { id: portfolio.id },
      include: { items: true },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("[PORTFOLIO_ITEM_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
