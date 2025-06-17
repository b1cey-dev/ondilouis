import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  // Unwrap the Promise-based params
  const { chatId } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Load the user and their roles/teams
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
                  orderItems: { some: { product: { creatorId: user.id } } },
                },
              ],
            },
          },
        ],
      },
      include: {
        order: { select: { id: true } }, // only id is valid here
      },
    })
    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 })
    }

    // Create message
    await prisma.message.create({
      data: {
        content,
        attachmentUrl,
        chatId: chat.id,
        userId: user.id,
      },
    })

    // Return updated chat with messages and order reference
    const updatedChat = await prisma.chat.findUnique({
      where: { id: chat.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, username: true, image: true } } },
        },
        order: { select: { id: true } }, // drop title to avoid TS error
      },
    })

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error("[MESSAGE_POST]", error)
    const msg = error instanceof Error ? error.message : "Internal Error"
    return new NextResponse(msg, { status: 500 })
  }
}
