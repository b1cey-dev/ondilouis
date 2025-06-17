"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User, 
  Briefcase, 
  Settings,
  LogOut,
  MessageSquare,
  Store,
  Star,
  Bell,
  Tag,
  UserCog,
  Upload
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Store", href: "/store", icon: Store },
    { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
    { name: "Portfolio", href: "/dashboard/portfolio", icon: Briefcase },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  const creatorNavigation = [
    { name: "Creator Dashboard", href: "/dashboard/creator", icon: Upload },
    { name: "Products", href: "/dashboard/creator/products", icon: ShoppingBag },
    { name: "Store Settings", href: "/dashboard/creator/store", icon: Store },
  ]

  const adminNavigation = [
    { name: "Roles", href: "/dashboard/admin", icon: UserCog },
    { name: "Teams", href: "/dashboard/admin/teams", icon: User },
    { name: "Products", href: "/dashboard/admin/products", icon: ShoppingBag },
    { name: "Announcements", href: "/dashboard/admin/announcements", icon: Bell },
    { name: "Affiliates", href: "/dashboard/admin/affiliates", icon: Tag },
    { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r bg-card h-screen p-4 fixed">
          <div className="space-y-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                {session.user.username}
              </h2>
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                ))}

                {/* Creator Navigation */}
                <div className="mt-6 mb-2 px-4 text-sm font-semibold text-muted-foreground">
                  Creator
                </div>
                {creatorNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                ))}

                {/* Admin Navigation */}
                {session.user.isAdmin && (
                  <>
                    <div className="mt-6 mb-2 px-4 text-sm font-semibold text-muted-foreground">
                      Admin
                    </div>
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    ))}
                  </>
                )}

                <div className="mt-6">
                  <Link
                    href="/api/auth/signout"
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-colors",
                      "hover:bg-destructive hover:text-destructive-foreground",
                      "focus:bg-destructive focus:text-destructive-foreground focus:outline-none"
                    )}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 pl-64">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 