import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailNotifications: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { emailNotifications } = await req.json();
    if (typeof emailNotifications !== "boolean") {
      return new NextResponse("Invalid request", { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { emailNotifications },
      select: {
        emailNotifications: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 