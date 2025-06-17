import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
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

    const { title, description, price, imageUrl, fileUrl, category } =
      await req.json()

    // Validate required fields
    if (!title || !description || !price || !imageUrl || !fileUrl || !category) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if user has permission to create products
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: true },
    })

    const canCreateProducts = user?.roles.some((role) => {
      const permissions = role.permissions as string[]
      return Array.isArray(permissions) && permissions.includes("create_products")
    })

    if (!canCreateProducts) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        imageUrl,
        fileUrl,
        category,
        creatorId: session.user.id,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 