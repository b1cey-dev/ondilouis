import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log("Portfolio GET - Session:", session?.user)
    
    if (!session?.user) {
      console.log("Portfolio GET - No session user")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    console.log("Portfolio GET - Fetching portfolio for user:", session.user.id)
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })
    console.log("Portfolio GET - Result:", portfolio)

    if (!portfolio) {
      return new NextResponse("Portfolio not found", { status: 404 })
    }

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { title, description } = await req.json()

    // Validate required fields
    if (!title || !description) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if user already has a portfolio
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
    })

    if (existingPortfolio) {
      return new NextResponse("Portfolio already exists", { status: 400 })
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        title,
        description,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error("Error creating portfolio:", error)
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    )
  }
} 