import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin role if it doesn't exist
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      permissions: ["manage_teams", "manage_users", "manage_roles"],
    },
  })

  // Hash password
  const hashedPassword = await bcrypt.hash("admin123", 12)

  // Create or update user
  const user = await prisma.user.upsert({
    where: { email: "josephrobinsonsimon@gmail.com" },
    update: {
      roles: {
        connect: { id: adminRole.id }
      }
    },
    create: {
      email: "josephrobinsonsimon@gmail.com",
      name: "Joseph Robinson Simon",
      username: "josephrobinson",
      password: hashedPassword,
      roles: {
        connect: { id: adminRole.id }
      }
    },
  })

  console.log("Admin user created:", user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 