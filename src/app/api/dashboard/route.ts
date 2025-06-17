import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get user with roles
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        roles: true,
        portfolio: true,
        storeSettings: true
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Get total orders (as buyer and seller)
    const [buyerOrders, sellerOrders] = await Promise.all([
      prisma.order.count({
        where: { userId: user.id }
      }),
      prisma.order.count({
        where: {
          orderItems: {
            some: {
              product: {
                creatorId: user.id
              }
            }
          }
        }
      })
    ])

    // Get average rating
    const ratings = await prisma.rating.findMany({
      where: { userId: user.id }
    })
    const averageRating = ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
      : 0

    // Get total customers (unique buyers)
    const uniqueOrders = await prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            product: {
              creatorId: user.id
            }
          }
        }
      },
      select: {
        userId: true
      }
    })
    const totalCustomers = new Set(uniqueOrders.map(order => order.userId)).size

    // Get total revenue
    const revenue = await prisma.order.aggregate({
      where: {
        orderItems: {
          some: {
            product: {
              creatorId: user.id
            }
          }
        },
        status: "completed"
      },
      _sum: {
        totalPrice: true
      }
    })

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          {
            orderItems: {
              some: {
                product: {
                  creatorId: user.id
                }
              }
            }
          }
        ]
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                title: true,
                price: true,
                creatorId: true,
                creator: {
                  select: {
                    username: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Get recent reviews
    const recentReviews = await prisma.rating.findMany({
      where: { userId: user.id },
      include: {
        rater: {
          select: {
            username: true,
            image: true
          }
        },
        order: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    title: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        roles: user.roles,
        hasPortfolio: !!user.portfolio,
        hasStoreSetup: !!user.storeSettings
      },
      stats: {
        totalOrders: buyerOrders + sellerOrders,
        averageRating,
        totalCustomers,
        totalRevenue: revenue._sum.totalPrice || 0
      },
      recentOrders,
      recentReviews
    })
  } catch (error) {
    console.error("[DASHBOARD_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 