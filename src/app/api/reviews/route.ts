import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const reviews = await prisma.rating.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 3,
      include: {
        rater: {
          select: {
            name: true,
            image: true,
            roles: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Transform the data to match the Review interface
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      name: review.rater.name || 'Anonymous',
      role: review.rater.roles[0]?.name || 'Member',
      content: review.comment || '',
      avatar: review.rater.image || '/avatars/default.png',
      rating: review.rating,
      createdAt: review.createdAt.toISOString()
    }))

    return NextResponse.json(formattedReviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
} 