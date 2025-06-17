import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST: Upload attachment for chat
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

    // Verify chat exists and user has access
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [
          { userId: session.user.id },
          {
            order: {
              OR: [
                { userId: session.user.id },
                {
                  orderItems: {
                    some: {
                      product: { creatorId: session.user.id },
                    },
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

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    // TODO: Implement file upload to your preferred storage service
    // For now, return a mock URL
    const attachmentUrl = `/uploads/${file.name}`

    return NextResponse.json({ attachmentUrl })
  } catch (error) {
    console.error("[ATTACHMENT_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
