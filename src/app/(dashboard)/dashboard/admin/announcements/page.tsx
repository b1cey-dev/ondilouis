"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/hooks/use-toast"

interface Announcement {
  id: string
  title: string
  content: string
  type: "info" | "warning" | "success" | "error"
  isPublished: boolean
  createdAt: string
  createdBy: {
    username: string
  }
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    fetchAnnouncements()
  }, [session, router])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/admin/announcements")
      if (!response.ok) throw new Error("Failed to fetch announcements")
      const data = await response.json()
      setAnnouncements(data)
    } catch (error) {
      console.error("Error fetching announcements:", error)
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      type: formData.get("type") as string,
      isPublished: formData.get("isPublished") === "true",
    }

    try {
      const response = await fetch("/api/admin/announcements", {
        method: editingAnnouncement ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: editingAnnouncement?.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to save announcement")

      const savedAnnouncement = await response.json()

      if (editingAnnouncement) {
        setAnnouncements(announcements.map(a => 
          a.id === savedAnnouncement.id ? savedAnnouncement : a
        ))
      } else {
        setAnnouncements([savedAnnouncement, ...announcements])
      }

      setShowCreateDialog(false)
      setEditingAnnouncement(null)
      toast({
        title: "Success",
        description: `Announcement ${editingAnnouncement ? "updated" : "created"} successfully`,
      })
    } catch (error) {
      console.error("Error saving announcement:", error)
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      })
    }
  }

  const deleteAnnouncement = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete announcement")

      setAnnouncements(announcements.filter(a => a.id !== id))
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-500"
      case "warning":
        return "bg-yellow-500"
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="space-y-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-7 bg-muted rounded w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
          <p className="text-muted-foreground">
            Create and manage platform announcements
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAnnouncement(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
              </DialogTitle>
              <DialogDescription>
                {editingAnnouncement
                  ? "Edit the announcement details below"
                  : "Create a new announcement to share with users"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingAnnouncement?.title}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={editingAnnouncement?.content}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  name="type"
                  defaultValue={editingAnnouncement?.type || "info"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Published</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this announcement visible to users
                  </p>
                </div>
                <Switch
                  name="isPublished"
                  defaultChecked={editingAnnouncement?.isPublished}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingAnnouncement ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {announcement.title}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${getTypeColor(
                        announcement.type
                      )}`}
                    >
                      {announcement.type}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Created by {announcement.createdBy.username} on{" "}
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingAnnouncement(announcement)
                      setShowCreateDialog(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAnnouncement(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{announcement.content}</p>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                {announcement.isPublished ? (
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                )}
                {announcement.isPublished ? "Published" : "Draft"}
              </div>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && (
          <Card>
            <CardHeader>
              <CardDescription>No announcements found</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
} 