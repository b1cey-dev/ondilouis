import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Users, ArrowLeft } from "lucide-react"

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex-1 flex items-center justify-center space-x-4">
              <Link href="/portfolio">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  All Portfolios
                </Button>
              </Link>
              <Link href="/dashboard/portfolio">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  My Portfolio
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 