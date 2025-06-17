import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Message } from "@/types"

interface ChatWithRelations {
  id: string
  orderId: string
  userId: string
  messages: Array<Message & {
    user: {
      id: string
      username: string
      image: string | null
    }
  }>
  order?: {
    id: string
    orderItems: Array<{
      product: {
        title: string
        creatorId: string
      }
    }>
  }
  user?: {
    id: string
    username: string
  }
  createdAt: Date
  updatedAt: Date
}

interface TransformedChat extends ChatWithRelations {
  order: {
    id: string
    orderItems: Array<{
      product: {
        title: string
        creatorId: string
      }
    }>
  }
  user: {
    id: string
    username: string
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // First verify the user exists and get their roles
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        roles: true
      }
    })

    // Temporary fix: If user not found, create a default user
    if (!user) {
      // Generate a temporary hashed password
      const tempPassword = await bcrypt.hash("temp_" + session.user.id, 10)
      
      // Create user with a basic role
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || `${session.user.id}@temp.com`,
          username: session.user.username || `user_${session.user.id}`,
          name: session.user.name || "Default User",
          password: tempPassword,
          emailNotifications: true,
          roles: {
            create: [{
              name: `user_${session.user.id}`,
              description: "Basic user role",
              permissions: ["basic_access"],
              isTeam: false
            }]
          }
        },
        include: {
          roles: true
        }
      })
    }

    // Fetch all chats for the current user (both as buyer and seller)
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { userId: user.id }, // As buyer
          {
            order: {
              OR: [
                { userId: user.id }, // As buyer in order
                {
                  orderItems: {
                    some: {
                      product: {
                        creatorId: user.id // As seller
                      }
                    }
                  }
                }
              ]
            }
          }
        ]
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc"
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true
              }
            }
          }
        },
        order: {
          select: {
            id: true,
            orderItems: {
              include: {
                product: {
                  select: {
                    title: true,
                    creatorId: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    })

    // Transform the data to handle any missing relationships
    const transformedChats: TransformedChat[] = chats.map((chat: ChatWithRelations) => {
      const orderItems = chat.order?.orderItems || []
      
      return {
        ...chat,
        order: {
          id: chat.orderId,
          orderItems: orderItems
        },
        user: chat.user || {
          id: chat.userId,
          username: "Unknown User"
        }
      }
    })

    return NextResponse.json(transformedChats)
  } catch (error) {
    console.error("[CHAT_GET]", error)
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // First verify the user exists and get their roles
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        roles: true
      }
    })

    // Temporary fix: If user not found, create a default user
    if (!user) {
      // Generate a temporary hashed password
      const tempPassword = await bcrypt.hash("temp_" + session.user.id, 10)
      
      // Create user with a basic role
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || `${session.user.id}@temp.com`,
          username: session.user.username || `user_${session.user.id}`,
          name: session.user.name || "Default User",
          password: tempPassword,
          emailNotifications: true,
          roles: {
            create: [{
              name: `user_${session.user.id}`,
              description: "Basic user role",
              permissions: ["basic_access"],
              isTeam: false
            }]
          }
        },
        include: {
          roles: true
        }
      })
    }

    const { orderId } = await req.json()
    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 })
    }

    // Check if chat already exists
    const existingChat = await prisma.chat.findUnique({
      where: { orderId }
    })

    if (existingChat) {
      return NextResponse.json(existingChat)
    }

    // Get the order to verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                creatorId: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    // Check if user is either the buyer or seller
    const isAuthorized =
      order.userId === user.id ||
      order.orderItems.some((item: { product: { creatorId: string } }) => item.product.creatorId === user.id)

    if (!isAuthorized) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        orderId,
        userId: user.id
      },
      include: {
        messages: true,
        order: {
          select: {
            id: true,
            orderItems: {
              include: {
                product: {
                  select: {
                    title: true,
                    creatorId: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(chat)
  } catch (error) {
    console.error("[CHAT_POST]", error)
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
} 