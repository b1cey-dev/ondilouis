"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Download, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { formatPrice, formatDate } from "@/lib/utils"

interface Order {
  id: string
  productId: string
  product: {
    id: string
    title: string
    description: string
    price: number
    imageUrl: string
    fileUrl: string
  }
  status: string
  quantity: number
  totalPrice: number
  createdAt: string
  rating?: {
    rating: number
    comment: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders")
        if (!response.ok) throw new Error("Failed to fetch orders")
        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [session, router])

  const submitRating = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      })

      if (!response.ok) throw new Error("Failed to submit rating")

      const updatedOrders = orders.map((order) =>
        order.id === orderId
          ? { ...order, rating: { rating, comment } }
          : order
      )
      setOrders(updatedOrders)

      setRating(0)
      setComment("")

      toast({
        title: "Success",
        description: "Rating submitted successfully",
      })
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      })
    }
  }

  const downloadProduct = async (orderId: string, fileUrl: string) => {
    try {
      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error("Failed to download file")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileUrl.split("/").pop() || "download"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        title: "Error",
        description: "Failed to download file",
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
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-24 w-24 bg-muted rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>No orders found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You haven't placed any orders yet.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/store")}>
              Browse Products
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="relative h-24 w-24">
                <Image
                  src={order.product.imageUrl}
                  alt={order.product.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{order.product.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(order.totalPrice)} · {order.quantity} item(s)
                </p>
                <p className="text-sm text-muted-foreground">
                  Ordered on {formatDate(new Date(order.createdAt))}
                </p>
                <p className="text-sm font-medium mt-2">
                  Status: {order.status}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {order.status === "completed" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() =>
                        downloadProduct(order.id, order.product.fileUrl)
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    {!order.rating && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Star className="mr-2 h-4 w-4" />
                            Rate
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rate your purchase</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex justify-center gap-2">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <Button
                                  key={value}
                                  variant={
                                    rating >= value ? "default" : "outline"
                                  }
                                  size="icon"
                                  onClick={() => setRating(value)}
                                >
                                  <Star
                                    className={`h-4 w-4 ${
                                      rating >= value
                                        ? "fill-current"
                                        : "fill-none"
                                    }`}
                                  />
                                </Button>
                              ))}
                            </div>
                            <Textarea
                              placeholder="Write your review..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                            <Button
                              className="w-full"
                              onClick={() => submitRating(order.id)}
                            >
                              Submit Review
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 