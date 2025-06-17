"use client"

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DashboardData {
  user: {
    id: string
    username: string
    email: string
    balance: number
    roles: Array<{
      id: string
      name: string
    }>
    hasPortfolio: boolean
    hasStoreSetup: boolean
  }
  stats: {
    totalOrders: number
    averageRating: number
    totalCustomers: number
    totalRevenue: number
  }
  recentOrders: Array<{
    id: string
    totalPrice: number
    status: string
    createdAt: string
    orderItems: Array<{
      product: {
        title: string
        price: number
        creatorId: string
        creator: {
          username: string
        }
      }
    }>
    user: {
      username: string
    }
  }>
  recentReviews: Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    rater: {
      username: string
      image: string | null
    }
    order: {
      orderItems: Array<{
        product: {
          title: string
        }
      }>
    }
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    fetchDashboardData()
  }, [session, router, status])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/dashboard")
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || "Failed to fetch dashboard data")
      }

      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch dashboard data")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-yellow-800 text-lg font-semibold">No Data Available</h2>
          <p className="text-yellow-600">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {data.user.username}!</p>
        </div>
        <Button size="lg" variant="default">Request Payout</Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your account details and status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground">Username</p>
              <p className="font-medium">{data.user.username}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{data.user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Roles</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {data.user.roles.map(role => (
                  <span key={role.id} className="px-2 py-1 bg-secondary rounded-full text-sm">
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your current earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">${data.user.balance.toFixed(2)}</p>
              <p className="text-muted-foreground">Available for withdrawal</p>
              <Button variant="outline" className="mt-4">
                View History
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common tasks and shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full justify-between" size="lg">
              Add New Product
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-2">Total orders placed</p>
            <p className="text-2xl font-bold">{data.stats.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-2">Average rating received</p>
            <p className="text-2xl font-bold">{data.stats.averageRating.toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-2">Unique customers</p>
            <p className="text-2xl font-bold">{data.stats.totalCustomers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-2">Total revenue earned</p>
            <p className="text-2xl font-bold">${data.stats.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your latest sales and transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground">No recent orders</p>
            ) : (
              <div className="space-y-4">
                {data.recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{order.orderItems[0]?.product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.orderItems[0]?.product.creatorId === data.user.id
                          ? `Purchased by ${order.user.username}`
                          : `From ${order.orderItems[0]?.product.creator.username}`}
                      </p>
                    </div>
                    <p className="font-medium">${order.totalPrice.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest feedback from customers</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentReviews.length === 0 ? (
              <p className="text-center text-muted-foreground">No recent reviews</p>
            ) : (
              <div className="space-y-4">
                {data.recentReviews.map(review => (
                  <div key={review.id} className="space-y-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{review.rater.username}</p>
                      <p className="text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 