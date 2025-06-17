import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: Retrieve chat with attachments
export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify user and fetch roles/teams
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: true, teams: true },
    })
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Fetch chat with messages and attachments
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [
          { userId: user.id },
          {
            order: {
              OR: [
                { userId: user.id },
                {
                  orderItems: {
                    some: {
                      product: { creatorId: user.id },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, username: true, image: true } } },
        },
        order: {
          select: {
            id: true,
            userId: true,
            orderItems: {
              include: {
                product: {
                  select: { title: true, creatorId: true },
                },
              },
            },
          },
        },
        user: { select: { id: true, username: true } },
      },
    })

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 })
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error("[CHAT_GET]", error)
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error",
      { status: 500 }
    )
  }
}

// POST: Send a message with optional attachment
export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify user and fetch roles/teams
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: true, teams: true },
    })
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const { content, attachmentUrl } = await req.json()
    if (!content && !attachmentUrl) {
      return new NextResponse("Message content required", { status: 400 })
    }

    // Verify chat exists and user has access
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [
          { userId: user.id },
          {
            order: {
              OR: [
                { userId: user.id },
                {
                  orderItems: {
                    some: { product: { creatorId: user.id } },
                  },
                },
              ],
            },
          },
        ],
      },
    })

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 })
    }

    // Create message
    await prisma.message.create({
      data: { content, attachmentUrl, chatId: chat.id, userId: user.id },
    })

    // Return updated chat
    const updatedChat = await prisma.chat.findUnique({
      where: { id: chat.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, username: true, image: true } } },
        },
        order: { select: { id: true } }, // dropped title to satisfy Prisma
      },
    })

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error("[CHAT_POST]", error)
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error",
      { status: 500 }
    )
  }
}
