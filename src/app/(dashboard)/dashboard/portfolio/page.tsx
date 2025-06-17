"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit, ExternalLink, Upload } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/hooks/use-toast"
import { Portfolio, PortfolioItem } from "@/types/prisma"

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTeamRole, setIsTeamRole] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    // Check if user has team role
    const checkTeamRole = async () => {
      try {
        const response = await fetch("/api/user/roles")
        if (response.ok) {
          const { roles } = await response.json()
          setIsTeamRole(roles.some((role: any) => role.isTeam))
        }
      } catch (error) {
        console.error("Error checking team role:", error)
      }
    }

    checkTeamRole()
    fetchPortfolio()
  }, [session, router, status])

  const fetchPortfolio = async () => {
    if (!session?.user) return

    try {
      console.log("Portfolio Page - Fetching portfolio for user:", session.user)
      const response = await fetch("/api/portfolio", {
        headers: {
          "Authorization": `Bearer ${session.user.id}`
        }
      })
      console.log("Portfolio Page - Response status:", response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Portfolio Page - Error response:", errorText)
        
        if (response.status === 404) {
          // No portfolio found - this is an expected case
          setPortfolio(null)
          setError(null)
        } else {
          throw new Error(errorText || "Failed to fetch portfolio")
        }
      } else {
        const data = await response.json()
        console.log("Portfolio Page - Fetched data:", data)
        setPortfolio(data)
        setError(null)
      }
    } catch (error) {
      console.error("Portfolio Page - Error:", error)
      setError("Failed to load portfolio")
      toast({
        title: "Error",
        description: "Failed to load portfolio. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createPortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
        }),
      })

      if (!response.ok) throw new Error("Failed to create portfolio")

      const newPortfolio = await response.json()
      setPortfolio(newPortfolio)

      toast({
        title: "Success",
        description: "Portfolio created successfully",
      })

      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error creating portfolio:", error)
      toast({
        title: "Error",
        description: "Failed to create portfolio",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (file: File, mediaType: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("mediaType", mediaType)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to upload file")

      const { url } = await response.json()
      return url
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  const addPortfolioItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const mediaType = formData.get("mediaType") as string
    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement
    const file = fileInput?.files?.[0]

    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    const mediaUrl = await handleFileUpload(file, mediaType)

    if (!mediaUrl) return

    try {
      const response = await fetch("/api/portfolio/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          mediaUrl,
          mediaType,
        }),
      })

      if (!response.ok) throw new Error("Failed to add portfolio item")

      const updatedPortfolio = await response.json()
      setPortfolio(updatedPortfolio)

      toast({
        title: "Success",
        description: "Portfolio item added successfully",
      })

      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error adding portfolio item:", error)
      toast({
        title: "Error",
        description: "Failed to add portfolio item",
        variant: "destructive",
      })
    }
  }

  const deletePortfolioItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/portfolio/items/${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete portfolio item")

      const updatedPortfolio = await response.json()
      setPortfolio(updatedPortfolio)

      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting portfolio item:", error)
      toast({
        title: "Error",
        description: "Failed to delete portfolio item",
        variant: "destructive",
      })
    }
  }

  if (status === "loading" || loading) {
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

  if (!isTeamRole) {
    return (
      <div className="container py-10">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Team Members Only</h2>
          <p className="text-muted-foreground">
            Only team members can create and manage portfolios.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground">
            Showcase your work and attract clients
          </p>
        </div>
        {!portfolio ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Portfolio</DialogTitle>
                <DialogDescription>
                  Create your portfolio to showcase your work
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={createPortfolio} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required />
                </div>
                <Button type="submit" className="w-full">
                  Create Portfolio
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Work
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Portfolio Item</DialogTitle>
                <DialogDescription>
                  Add a new piece of work to your portfolio
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={addPortfolioItem} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mediaType">Media Type</Label>
                  <select
                    id="mediaType"
                    name="mediaType"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Upload File</Label>
                  <Input id="file" name="file" type="file" required />
                </div>
                <Button type="submit" className="w-full">
                  Add Work
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {portfolio && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{portfolio.title}</CardTitle>
                  <CardDescription>{portfolio.description}</CardDescription>
                </div>
                <Link 
                  href={`/portfolio/${session?.user?.username}`}
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Public Page
                </Link>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {portfolio.items.map((item: PortfolioItem) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deletePortfolioItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {item.mediaType === "image" ? (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  ) : item.mediaType === "video" ? (
                    <video
                      src={item.mediaUrl}
                      controls
                      className="w-full rounded-md"
                    />
                  ) : item.mediaType === "audio" ? (
                    <audio
                      src={item.mediaUrl}
                      controls
                      className="w-full"
                    />
                  ) : (
                    <a
                      href={item.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      View Document
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 