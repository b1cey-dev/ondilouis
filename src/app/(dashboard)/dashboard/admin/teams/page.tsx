"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, UserPlus } from "lucide-react"

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
import { toast } from "@/components/hooks/use-toast"

interface User {
  id: string
  username: string
  email: string
  image: string | null
}

interface Team {
  id: string
  name: string
  color: string | null
  permissions: string[]
  discount: number | null
  users: User[]
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    fetchTeams()
  }, [session, router])

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/admin/teams")
      if (!response.ok) throw new Error("Failed to fetch teams")
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const color = formData.get("color") as string
    const discount = parseFloat(formData.get("discount") as string) / 100
    const permissions = Array.from(formData.getAll("permissions")) as string[]

    try {
      const response = await fetch("/api/admin/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          color,
          permissions,
          discount,
        }),
      })

      if (!response.ok) throw new Error("Failed to create team")

      const newTeam = await response.json()
      setTeams([...teams, newTeam])

      toast({
        title: "Success",
        description: "Team created successfully",
      })

      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error creating team:", error)
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      })
    }
  }

  const addMember = async (teamId: string, email: string) => {
    try {
      const response = await fetch(`/api/admin/teams/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to add member")
      }

      await fetchTeams()

      toast({
        title: "Success",
        description: "Member added successfully",
      })
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member",
        variant: "destructive",
      })
    }
  }

  const removeMember = async (teamId: string, userId: string) => {
    try {
      const response = await fetch(`/api/admin/teams/${teamId}/members/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to remove member")
      }

      await fetchTeams()

      toast({
        title: "Success",
        description: "Member removed successfully",
      })
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove member",
        variant: "destructive",
      })
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
        <h2 className="text-2xl font-bold tracking-tight">Teams</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Add a new team with custom permissions and settings
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  type="color"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  {[
                    "create_products",
                    "edit_products",
                    "delete_products",
                    "manage_users",
                    "manage_teams",
                  ].map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={permission}
                        name="permissions"
                        value={permission}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor={permission}>
                        {permission.replace("_", " ").toUpperCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create Team
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {teams.map((team) => (
          <Card key={team.id}>
        <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{team.name}</CardTitle>
          <CardDescription>
                    {team.users.length} member{team.users.length !== 1 && "s"}
          </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>
                        Add a new member to {team.name}
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value
                        addMember(team.id, email)
                        e.currentTarget.reset()
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Add Member
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: team.color || "#000000" }}
                  />
                  <span className="text-sm">
                    Discount: {((team.discount || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {team.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                      >
                      {permission}
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Members</h3>
                  <div className="space-y-2">
                    {team.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          {user.image && (
                            <img
                              src={user.image}
                              alt={user.username}
                              className="h-6 w-6 rounded-full"
                            />
                          )}
                          <span>{user.username}</span>
                          <span className="text-sm text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(team.id, user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
          </div>
        </CardContent>
      </Card>
        ))}

        {teams.length === 0 && (
          <Card>
            <CardHeader>
              <CardDescription>No teams available</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
} 