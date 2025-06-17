import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: "josephrobinsonsimon@gmail.com" }
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Create portfolio if it doesn't exist
    const portfolio = await prisma.portfolio.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        title: "Joseph Robinson's Portfolio",
        description: "A showcase of my work and projects",
        userId: user.id,
        items: {
          create: [
            {
              title: "Sample Project 1",
              description: "A demonstration project",
              mediaUrl: "https://example.com/sample1",
              mediaType: "image",
            }
          ]
        }
      },
      include: {
        items: true
      }
    })

    console.log("Portfolio created:", portfolio)
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 