"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Download, MessageSquare, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/hooks/use-toast"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    title: string
    description: string
    imageUrl: string
    fileUrl: string | null
    price: number
    category: string
    creator: {
      id: string
      username: string
    }
  }
}

interface Order {
  id: string
  status: string
  totalPrice: number
  createdAt: string
  orderItems: OrderItem[]
  rating: {
    rating: number
    comment: string | null
  } | null
  chat: {
    id: string
    messages: {
      content: string
      createdAt: string
    }[]
  } | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    fetchOrders()
  }, [session, router])

    const fetchOrders = async () => {
      try {
      setLoading(true)
        const response = await fetch("/api/orders")
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to fetch orders")
      }
        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
        description: error instanceof Error ? error.message : "Failed to load orders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

  const handleChatClick = async (order: Order) => {
    try {
      if (order.chat) {
        router.push(`/dashboard/chat?selected=${order.chat.id}`)
        return
      }

      // Create new chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.id }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to create chat")
      }

      const chat = await response.json()
      router.push(`/dashboard/chat?selected=${chat.id}`)
    } catch (error) {
      console.error("Error handling chat:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open chat",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-7 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">View and manage your orders</p>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription>
                Status: {order.status} • Total: ${order.totalPrice}
                  </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{item.product.title}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChatClick(order)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {order.chat ? "Open Chat" : "Start Chat"}
                        </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && (
          <Card>
            <CardHeader>
              <CardDescription>No orders found</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
} 