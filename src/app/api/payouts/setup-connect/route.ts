import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createConnectAccount, createAccountLink } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a Stripe account
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, stripeConnectId: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let accountId = user.stripeConnectId;

    if (!accountId) {
      // Create new Stripe Connect account
      const account = await createConnectAccount(user.id, session.user.email);
      accountId = account.id;

      // Save Stripe Connect ID to user
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeConnectId: accountId },
      });
    }

    // Create account link for onboarding
    const accountLink = await createAccountLink(
      accountId,
      `${process.env.NEXTAUTH_URL}/dashboard/payouts`,
      `${process.env.NEXTAUTH_URL}/dashboard/payouts`
    );

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error setting up Stripe Connect:', error);
    return NextResponse.json(
      { error: 'Failed to setup Stripe Connect' },
      { status: 500 }
    );
  }
} 