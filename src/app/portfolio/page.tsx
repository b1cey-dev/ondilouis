import Link from "next/link"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

export default async function PortfoliosPage() {
  // Fetch all users who have portfolios
  const users = await prisma.user.findMany({
    where: {
      portfolio: {
        isNot: null,
      },
    },
    include: {
      portfolio: true,
    },
  })

  return (
    <div className="container py-10">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">Portfolios</span>
        </nav>

        <div>
          <h1 className="text-3xl font-bold">Creator Portfolios</h1>
          <p className="text-muted-foreground">
            Browse portfolios from our talented creators
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Link key={user.id} href={`/portfolio/${user.username}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>{user.bio || "No bio provided"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {user.portfolio?.description || "No portfolio description"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 