"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Settings, ShieldCheck, DollarSign } from "lucide-react"

import { cn } from "@/lib/utils"
import { ExtendedToken } from "@/types/next-auth"

interface SidebarNavItem {
  title: string
  href: string
  icon: React.ReactNode
  requiresSuperAdmin?: boolean
}

const sidebarNavItems: SidebarNavItem[] = [
  {
    title: "Teams",
    href: "/dashboard/admin/teams",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Roles",
    href: "/dashboard/admin/roles",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    title: "Sales",
    href: "/dashboard/admin/sales",
    icon: <DollarSign className="h-4 w-4" />,
    requiresSuperAdmin: true,
  },
  {
    title: "Settings",
    href: "/dashboard/admin/settings",
    icon: <Settings className="h-4 w-4" />,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Safely cast session.user to ExtendedToken
  const token = session?.user as unknown as ExtendedToken
  const isSuperAdmin = Boolean(token?.isSuperAdmin)

  useEffect(() => {
    if (!session) {
      router.push("/login")
    }
  }, [session, router])

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {sidebarNavItems
              .filter(item => !item.requiresSuperAdmin || isSuperAdmin)
              .map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "transparent"
                  )}
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </Link>
              ))}
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
