import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/creator/store/settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get store settings for the user
    const storeSettings = await prisma.storeSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    // If no settings exist, return default settings
    if (!storeSettings) {
      return NextResponse.json({
        storeName: "",
        storeDescription: "",
        paymentEmail: session.user.email || "",
        automaticDelivery: true,
        notifyOnSale: true,
        discordServer: "",
        socialLinks: {
          website: "",
          twitter: "",
        },
      })
    }

    return NextResponse.json(storeSettings)
  } catch (error) {
    console.error("[STORE_SETTINGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// PUT /api/creator/store/settings
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    // Validate required fields
    if (!body.storeName || !body.storeDescription || !body.paymentEmail) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Update or create store settings
    const storeSettings = await prisma.storeSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        storeName: body.storeName,
        storeDescription: body.storeDescription,
        paymentEmail: body.paymentEmail,
        automaticDelivery: body.automaticDelivery,
        notifyOnSale: body.notifyOnSale,
        discordServer: body.discordServer,
        socialLinks: body.socialLinks,
      },
      create: {
        userId: session.user.id,
        storeName: body.storeName,
        storeDescription: body.storeDescription,
        paymentEmail: body.paymentEmail,
        automaticDelivery: body.automaticDelivery,
        notifyOnSale: body.notifyOnSale,
        discordServer: body.discordServer,
        socialLinks: body.socialLinks,
      },
    })

    return NextResponse.json(storeSettings)
  } catch (error) {
    console.error("[STORE_SETTINGS_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 