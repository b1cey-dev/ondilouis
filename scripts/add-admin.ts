const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

type Role = {
  name: string;
  id: string;
};

async function main() {
  const email = "josephrobinsonsimon@gmail.com";
  const username = "josephadmin";
  const password = "admin123"; // You should change this password after first login

  try {
    // Check if admin role exists, if not create it
    let adminRole = await prisma.role.findUnique({
      where: { name: "admin" },
    });

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: "admin",
          description: "Administrator role with full access",
          color: "#FF0000",
          permissions: [
            "manage_roles",
            "manage_users",
            "manage_teams",
            "manage_products",
            "manage_orders",
            "manage_settings"
          ],
          isTeam: false,
        },
      });
      console.log("Created admin role");
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user) {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          name: username,
          roles: {
            connect: { id: adminRole.id },
          },
        },
        include: { roles: true },
      });
      console.log("Created new admin user:", email);
    } else {
      // Update existing user to have admin role if they don't already
      const hasAdminRole = user.roles.some((role: Role) => role.name === "admin");
      if (!hasAdminRole) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            roles: {
              connect: { id: adminRole.id },
            },
          },
        });
        console.log("Updated existing user to admin:", email);
      } else {
        console.log("User is already an admin:", email);
      }
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 