"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

interface StoreSettings {
  storeName: string
  storeDescription: string
  paymentEmail: string
  automaticDelivery: boolean
  notifyOnSale: boolean
  discordServer?: string
  socialLinks: {
    website?: string
    twitter?: string
  }
}

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "",
    storeDescription: "",
    paymentEmail: "",
    automaticDelivery: true,
    notifyOnSale: true,
    socialLinks: {},
  })
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/creator/store/settings")
        if (!response.ok) throw new Error("Failed to fetch store settings")
        const data = await response.json()
        setSettings(data)
      } catch (error) {
        console.error("Error fetching store settings:", error)
        toast({
          title: "Error",
          description: "Failed to load store settings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const updatedSettings = {
      ...settings,
      storeName: formData.get("storeName") as string,
      storeDescription: formData.get("storeDescription") as string,
      paymentEmail: formData.get("paymentEmail") as string,
      automaticDelivery: formData.get("automaticDelivery") === "on",
      notifyOnSale: formData.get("notifyOnSale") === "on",
      discordServer: formData.get("discordServer") as string,
      socialLinks: {
        website: formData.get("website") as string,
        twitter: formData.get("twitter") as string,
      },
    }

    try {
      const response = await fetch("/api/creator/store/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      })

      if (!response.ok) throw new Error("Failed to update store settings")

      setSettings(updatedSettings)
      toast({
        title: "Success",
        description: "Store settings updated successfully",
      })
    } catch (error) {
      console.error("Error updating store settings:", error)
      toast({
        title: "Error",
        description: "Failed to update store settings",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-7 bg-muted rounded w-1/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Store Settings</h2>
          <p className="text-muted-foreground mt-2">
            Configure your store's appearance and behavior
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Set your store's name and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    defaultValue={settings.storeName}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <Textarea
                    id="storeDescription"
                    name="storeDescription"
                    defaultValue={settings.storeDescription}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure your payment and delivery settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentEmail">Payment Email</Label>
                  <Input
                    id="paymentEmail"
                    name="paymentEmail"
                    type="email"
                    defaultValue={settings.paymentEmail}
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Delivery</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically deliver digital products after payment
                    </p>
                  </div>
                  <Switch
                    name="automaticDelivery"
                    checked={settings.automaticDelivery}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, automaticDelivery: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sale Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when products are sold
                    </p>
                  </div>
                  <Switch
                    name="notifyOnSale"
                    checked={settings.notifyOnSale}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notifyOnSale: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure community integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="discordServer">Discord Server</Label>
                  <Input
                    id="discordServer"
                    name="discordServer"
                    placeholder="discord.gg/your-invite-code"
                    defaultValue={settings.discordServer}
                  />
                  <p className="text-sm text-muted-foreground">
                    Add your Discord server invite link to build a community around your products
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Add your social media links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://"
                    defaultValue={settings.socialLinks.website}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    placeholder="@username"
                    defaultValue={settings.socialLinks.twitter}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 