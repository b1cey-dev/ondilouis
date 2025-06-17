import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

/**
 * GET: Fetch sales analytics for completed orders (admin only)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user has super admin permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: true },
    })
    const isSuperAdmin = user?.roles.some(role =>
      Array.isArray(role.permissions) &&
      (role.permissions as string[]).includes("manage_roles")
    )
    if (!isSuperAdmin) {
      return new NextResponse("Permission denied", { status: 403 })
    }

    // Parse date range params
    const url = new URL(req.url)
    const startDateParam = url.searchParams.get("startDate")
    const endDateParam = url.searchParams.get("endDate")
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(new Date().setMonth(new Date().getMonth() - 1))
    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date()

    // Fetch completed orders within range
    const orders = await prisma.order.findMany({
      where: {
        status: "completed",
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                title: true,
                category: true,
                creator: { select: { username: true } },
              },
            },
          },
        },
      },
    })

    // Compute analytics
    const totalSales = orders.reduce((sum, o) => sum + o.totalPrice, 0)
    const totalOrders = orders.length

    const salesByCategory = orders.reduce<Record<string, number>>((acc, o) => {
      o.orderItems.forEach(i => {
        acc[i.product.category] = (acc[i.product.category] || 0) + i.price
      })
      return acc
    }, {})

    const salesByCreator = orders.reduce<Record<string, number>>((acc, o) => {
      o.orderItems.forEach(i => {
        const name = i.product.creator.username
        acc[name] = (acc[name] || 0) + i.price
      })
      return acc
    }, {})

    const dailySales = orders.reduce<Record<string, number>>((acc, o) => {
      const day = o.createdAt.toISOString().split('T')[0]
      acc[day] = (acc[day] || 0) + o.totalPrice
      return acc
    }, {})

    return NextResponse.json({
      totalSales,
      totalOrders,
      salesByCategory,
      salesByCreator,
      dailySales,
      startDate,
      endDate,
    })
  } catch (error) {
    console.error("[SALES_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
