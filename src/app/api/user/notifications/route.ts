import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { emailNotifications } = body;

    // Update user notification settings
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email!,
      },
      data: {
        emailNotifications: emailNotifications,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 