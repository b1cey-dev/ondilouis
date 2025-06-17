"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/footer"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")

  return (
    <>
      <main className="flex-1">
        {children}
      </main>
      {!isDashboard && <Footer />}
    </>
  )
} 