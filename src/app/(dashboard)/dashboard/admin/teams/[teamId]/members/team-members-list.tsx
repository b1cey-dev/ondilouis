"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { UserPlus, UserMinus, ArrowLeft } from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TeamMember {
  id: string
  username: string
  email: string
  roles: {
    id: string
    name: string
    color: string
  }[]
}

interface Team {
  id: string
  name: string
  description: string
}

interface TeamMembersListProps {
  teamId: string
}

export default function TeamMembersList({ teamId }: TeamMembersListProps) {
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    fetchTeamData()
  }, [session, router, teamId])

  const fetchTeamData = async () => {
    try {
      // Fetch team details
      const teamResponse = await fetch(`/api/admin/teams/${teamId}`)
      if (!teamResponse.ok) throw new Error("Failed to fetch team details")
      const teamData = await teamResponse.json()
      setTeam(teamData)

      // Fetch team members
      const membersResponse = await fetch(
        `/api/admin/teams/${teamId}/members`
      )
      if (!membersResponse.ok) throw new Error("Failed to fetch team members")
      const membersData = await membersResponse.json()
      setMembers(membersData)
    } catch (error) {
      console.error("Error fetching team data:", error)
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addTeamMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    try {
      const response = await fetch(`/api/admin/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) throw new Error("Failed to add team member")

      const newMember = await response.json()
      setMembers([...members, newMember])
      toast({
        title: "Success",
        description: "Team member added successfully",
      })

      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error adding team member:", error)
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      })
    }
  }

  const removeTeamMember = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/admin/teams/${teamId}/members/${userId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) throw new Error("Failed to remove team member")

      setMembers(members.filter((member) => member.id !== userId))
      toast({
        title: "Success",
        description: "Team member removed successfully",
      })
    } catch (error) {
      console.error("Error removing team member:", error)
      toast({
        title: "Error",
        description: "Failed to remove team member",
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

  if (!team) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardDescription>Team not found</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push("/dashboard/admin/teams")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{team.name}</h2>
          <p className="text-muted-foreground">{team.description}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a new member to the team by their email
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addTeamMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="member@example.com"
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

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage members of {team.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{member.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {member.roles.map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                            style={{ backgroundColor: role.color || "#e5e7eb" }}
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeamMember(member.id)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {members.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No members found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 