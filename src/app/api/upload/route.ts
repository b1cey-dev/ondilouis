import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"
import crypto from "crypto"

type FileType = 'thumbnail' | 'product'

const allowedTypes: Record<FileType, readonly string[]> = {
  thumbnail: ["image/jpeg", "image/png", "image/webp"],
  product: ["application/zip", "application/x-zip-compressed", "application/pdf", "application/x-msdownload", "application/octet-stream"]
} as const

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as FileType

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 })
    }

    // Validate file type
    if (!type || !(type in allowedTypes)) {
      return new NextResponse("Invalid file type specified", { status: 400 })
    }

    if (!allowedTypes[type].includes(file.type)) {
      return new NextResponse(`Invalid file type. Allowed types for ${type}: ${allowedTypes[type].join(", ")}`, { status: 400 })
    }

    // Generate unique filename
    const randomBytes = crypto.randomBytes(16)
    const uniqueId = randomBytes.toString("hex")
    const fileName = `${uniqueId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    // Define upload directory based on type
    const uploadDir = join(process.cwd(), "public", "uploads", type)
    const filePath = join(uploadDir, fileName)

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(filePath, buffer)

    // Return the URL path
    const urlPath = `/uploads/${type}/${fileName}`
    return NextResponse.json({ url: urlPath })
  } catch (error) {
    console.error("Error uploading file:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 