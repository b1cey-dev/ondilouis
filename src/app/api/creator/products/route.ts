import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: {
        creatorId: session.user.id
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { title, description, price, imageUrl, fileUrl, category, status } = json

    // Validate required fields
    if (!title || !description || !price || !imageUrl || !fileUrl || !category) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price.toString()),
        imageUrl,
        fileUrl,
        category,
        status: status || "draft",
        creatorId: session.user.id
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 