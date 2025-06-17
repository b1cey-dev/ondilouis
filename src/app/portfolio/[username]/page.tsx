import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { Role, PortfolioItem } from "@prisma/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, ChevronRight } from "lucide-react"

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  // Fetch user and their portfolio
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      portfolio: {
        include: {
          items: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
      roles: true,
    },
  })

  if (!user || !user.portfolio) {
    notFound()
  }

  const isTeamMember = user.roles.some(role => role.isTeam)
  if (!isTeamMember) {
    notFound()
  }

  return (
    <div className="container py-10">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link href="/portfolio" className="hover:text-foreground">
            Portfolios
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">{user.name}</span>
        </nav>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground mt-2">{user.bio}</p>
          </div>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact for Work
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{user.portfolio.title}</CardTitle>
            <CardDescription>{user.portfolio.description}</CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Work</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {user.portfolio.items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  {item.mediaType === "image" ? (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : item.mediaType === "video" ? (
                    <video
                      src={item.mediaUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : item.mediaType === "audio" ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <audio
                        src={item.mediaUrl}
                        controls
                        className="w-3/4"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <a
                        href={item.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
