import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Role } from "@/types/prisma"

interface ExtendedSession {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    roles: Role[]
  }
}

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const { data: session } = useSession() as { data: ExtendedSession | null }

  const isAdmin = session?.user?.roles?.some((role) =>
    role.permissions.includes("manage_teams")
  )

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Overview
      </Link>
      <Link
        href="/store"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/store"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Store
      </Link>
      <Link
        href="/dashboard/orders"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/orders"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Orders
      </Link>
      <Link
        href="/dashboard/chat"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/chat"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Chat
      </Link>
      {isAdmin && (
        <Link
          href="/dashboard/admin"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname.startsWith("/dashboard/admin")
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          Admin
        </Link>
      )}
    </nav>
  )
} 