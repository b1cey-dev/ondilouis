import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { title, description, mediaUrl, mediaType } = await req.json()

    // Validate required fields
    if (!title || !description || !mediaUrl || !mediaType) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Get user's portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
    })

    if (!portfolio) {
      return new NextResponse("Portfolio not found", { status: 404 })
    }

    // Create portfolio item
    await prisma.portfolioItem.create({
      data: {
        title,
        description,
        mediaUrl,
        mediaType,
        portfolioId: portfolio.id,
      },
    })

    // Return updated portfolio with items
    const updatedPortfolio = await prisma.portfolio.findUnique({
      where: { id: portfolio.id },
      include: {
        items: true,
      },
    })

    return NextResponse.json(updatedPortfolio)
  } catch (error) {
    console.error("Error creating portfolio item:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 