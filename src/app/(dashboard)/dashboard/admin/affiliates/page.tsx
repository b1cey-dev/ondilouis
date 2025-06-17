"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Ban, CheckCircle, DollarSign } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"

interface Affiliate {
  id: string
  code: string
  commission: number
  earnings: number
  clicks: number
  conversions: number
  isActive: boolean
  createdAt: string
  user: {
    id: string
    username: string
    email: string
  }
}

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    fetchAffiliates()
  }, [session, router])

  const fetchAffiliates = async () => {
    try {
      const response = await fetch("/api/admin/affiliates")
      if (!response.ok) throw new Error("Failed to fetch affiliates")
      const data = await response.json()
      setAffiliates(data)
    } catch (error) {
      console.error("Error fetching affiliates:", error)
      toast({
        title: "Error",
        description: "Failed to load affiliates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createAffiliate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get("email") as string,
      commission: parseFloat(formData.get("commission") as string) / 100,
    }

    try {
      const response = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to create affiliate")

      const newAffiliate = await response.json()
      setAffiliates([newAffiliate, ...affiliates])
      toast({
        title: "Success",
        description: "Affiliate created successfully",
      })

      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error creating affiliate:", error)
      toast({
        title: "Error",
        description: "Failed to create affiliate",
        variant: "destructive",
      })
    }
  }

  const toggleAffiliateStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/affiliates/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) throw new Error("Failed to update affiliate status")

      setAffiliates(
        affiliates.map((affiliate) =>
          affiliate.id === id ? { ...affiliate, isActive } : affiliate
        )
      )

      toast({
        title: "Success",
        description: `Affiliate ${isActive ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      console.error("Error updating affiliate status:", error)
      toast({
        title: "Error",
        description: "Failed to update affiliate status",
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Affiliates</h2>
          <p className="text-muted-foreground">
            Manage affiliate partners and their commissions
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Affiliate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Affiliate</DialogTitle>
              <DialogDescription>
                Create a new affiliate partner account
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createAffiliate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="affiliate@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission">Commission (%)</Label>
                <Input
                  id="commission"
                  name="commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="10"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Affiliate
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Partners</CardTitle>
          <CardDescription>
            Overview of all affiliate partners and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{affiliate.user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {affiliate.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        {affiliate.code}
                      </code>
                    </TableCell>
                    <TableCell>{(affiliate.commission * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="mr-1 h-4 w-4 text-green-500" />
                        {affiliate.earnings.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">
                          {affiliate.conversions} sales from {affiliate.clicks} clicks
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {((affiliate.conversions / affiliate.clicks) * 100 || 0).toFixed(1)}% conversion rate
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={affiliate.isActive ? "bg-green-500" : "bg-red-500"}
                      >
                        {affiliate.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleAffiliateStatus(affiliate.id, !affiliate.isActive)
                        }
                      >
                        {affiliate.isActive ? (
                          <Ban className="mr-2 h-4 w-4" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        {affiliate.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {affiliates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No affiliates found
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