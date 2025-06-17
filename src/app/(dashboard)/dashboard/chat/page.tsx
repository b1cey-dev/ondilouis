"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { MessageSquare, Paperclip } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/hooks/use-toast"

interface ChatMessage {
  id: string
  userId: string
  content: string
  attachmentUrl?: string | null
  createdAt: Date
  user: {
    id: string
    username: string
    image: string | null
  }
}

interface OrderItem {
  product: {
    title: string
    creatorId: string
  }
}

interface Order {
  id: string
  title: string
  orderItems: OrderItem[]
}

interface User {
  id: string
  username: string
}

interface ChatRoom {
  id: string
  orderId: string
  userId: string
  messages: ChatMessage[]
  order: Order
  user: User
  createdAt: Date
  updatedAt: Date
}

export default function ChatPage() {
  const [chats, setChats] = useState<ChatRoom[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    fetchChats()
  }, [session, router])

  useEffect(() => {
    const selectedId = searchParams.get("selected")
    if (selectedId && chats.length > 0) {
      const chat = chats.find(c => c.id === selectedId)
      if (chat) {
        setSelectedChat(chat)
      }
    }
  }, [searchParams, chats])

    const fetchChats = async () => {
      try {
      setLoading(true)
        const response = await fetch("/api/chat")
        if (!response.ok) {
          const error = await response.text()
          throw new Error(error || "Failed to fetch chats")
        }
        const data = await response.json()
        setChats(data)
      } catch (error) {
        console.error("Error fetching chats:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load chats",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

  const sendMessage = async (content: string, attachmentUrl?: string) => {
    if (!selectedChat) return

    try {
      const response = await fetch(`/api/chat/${selectedChat.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, attachmentUrl }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to send message")
      }

      // Fetch the updated chat
      const chatResponse = await fetch(`/api/chat/${selectedChat.id}`)
      if (!chatResponse.ok) {
        const error = await chatResponse.text()
        throw new Error(error || "Failed to fetch updated chat")
      }

      const updatedChat = await chatResponse.json()
      setSelectedChat(updatedChat)
      
      // Update the chat in the list
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === updatedChat.id ? updatedChat : chat
        )
      )
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const content = formData.get("message") as string

    if (!content.trim()) return

    await sendMessage(content)
    e.currentTarget.reset()
  }

  const handleFileUpload = async (file: File) => {
    if (!selectedChat) return

    try {
    const formData = new FormData()
    formData.append("file", file)

      const response = await fetch(`/api/chat/${selectedChat.id}/attachments`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to upload file")
      }

      const { attachmentUrl } = await response.json()
      await sendMessage("Attachment", attachmentUrl)
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
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

  const getChatTitle = (chat: ChatRoom) => {
    const product = chat.order.orderItems[0]?.product
    if (!product) return `Order #${chat.orderId.slice(0, 8)}`
    
    const isSeller = product.creatorId === session?.user?.id
    const title = product.title || `Order #${chat.orderId.slice(0, 8)}`
    const withUser = isSeller ? chat.user.username : "You"
    
    return `${title} - Chat with ${withUser}`
  }

  return (
    <div className="container py-10">
      <div className="grid grid-cols-12 gap-6">
        {/* Chat List */}
        <div className="col-span-4 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Chats</h2>
          <div className="space-y-4">
            {chats.map((chat) => (
              <Card
                key={chat.id}
                className={`cursor-pointer transition-colors hover:bg-muted ${
                  selectedChat?.id === chat.id ? "bg-muted" : ""
                }`}
                onClick={() => {
                  setSelectedChat(chat)
                  router.push(`/dashboard/chat?selected=${chat.id}`, { scroll: false })
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {getChatTitle(chat)}
                  </CardTitle>
                  <CardDescription>
                    {chat.messages[chat.messages.length - 1]?.content ||
                      "No messages"}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
            {chats.length === 0 && (
              <Card>
                <CardHeader>
                  <CardDescription>No chats available</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="col-span-8">
          {selectedChat ? (
            <Card>
              <CardHeader>
                <CardTitle>{getChatTitle(selectedChat)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[500px] overflow-y-auto space-y-4 p-4 border rounded-lg">
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.userId === session?.user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.userId === session?.user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.attachmentUrl ? (
                          <a
                            href={message.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-500 hover:underline"
                          >
                            <Paperclip className="h-4 w-4" />
                            <span>View Attachment</span>
                          </a>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    type="text"
                    name="message"
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                      e.target.value = ""
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      document.getElementById("file-upload")?.click()
                    }}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button type="submit">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a chat to start messaging</CardTitle>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 