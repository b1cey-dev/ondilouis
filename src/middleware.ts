import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                      req.nextUrl.pathname.startsWith("/register")
    const isAdminPage = req.nextUrl.pathname.startsWith("/dashboard/admin")

    // If on auth page and logged in, redirect to dashboard
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Check admin access
    if (isAdminPage && !token?.isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                         req.nextUrl.pathname.startsWith("/register")
        const isAdminPage = req.nextUrl.pathname.startsWith("/dashboard/admin")
                         
        // Allow public access to auth pages
        if (isAuthPage) {
          return true
        }

        // Require admin role for admin pages
        if (isAdminPage) {
          return !!token?.isAdmin
        }

        // Require auth for all other pages
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
} 