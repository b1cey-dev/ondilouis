import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createPayout } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await req.json();

    // Get user's Stripe Connect ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, stripeConnectId: true },
    });

    if (!user?.stripeConnectId) {
      return NextResponse.json(
        { error: 'Stripe Connect account not set up' },
        { status: 400 }
      );
    }

    // Create payout
    const payout = await createPayout(user.stripeConnectId, amount);

    // Record payout in database
    await prisma.payout.create({
      data: {
        amount,
        status: 'pending',
        stripePayoutId: payout.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, payout });
  } catch (error) {
    console.error('Error requesting payout:', error);
    return NextResponse.json(
      { error: 'Failed to request payout' },
      { status: 500 }
    );
  }
} 