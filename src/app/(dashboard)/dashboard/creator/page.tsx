"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Circle, Store, Upload, Briefcase, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CreatorStatus {
  hasPortfolio: boolean
  hasProducts: boolean
  hasStoreSetup: boolean
}

export default function CreatorPage() {
  const [creatorStatus, setCreatorStatus] = useState<CreatorStatus>({
    hasPortfolio: false,
    hasProducts: false,
    hasStoreSetup: false,
  })
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    const checkCreatorStatus = async () => {
      try {
        const response = await fetch("/api/creator/status")
        if (!response.ok) throw new Error("Failed to fetch creator status")
        const data = await response.json()
        setCreatorStatus(data)
      } catch (error) {
        console.error("Error checking creator status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkCreatorStatus()
  }, [session, router])

  if (loading) {
    return (
      <div className="container py-10">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-7 bg-muted rounded w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const steps = [
    {
      title: "Create Your Portfolio",
      description: "Showcase your work and build credibility",
      href: "/dashboard/portfolio",
      icon: Briefcase,
      completed: creatorStatus.hasPortfolio,
    },
    {
      title: "Set Up Your Store",
      description: "Configure your store settings and payment information",
      href: "/dashboard/creator/store",
      icon: Store,
      completed: creatorStatus.hasStoreSetup,
    },
    {
      title: "Add Your Products",
      description: "Start listing your digital products for sale",
      href: "/dashboard/creator/products",
      icon: ShoppingBag,
      completed: creatorStatus.hasProducts,
    },
  ]

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Become a Creator</h2>
          <p className="text-muted-foreground mt-2">
            Complete these steps to start selling your digital products
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                  <Button asChild variant={step.completed ? "secondary" : "default"}>
                    <Link href={step.href}>
                      {step.completed ? "View" : "Get Started"}
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {creatorStatus.hasPortfolio && 
         creatorStatus.hasStoreSetup && 
         creatorStatus.hasProducts && (
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-primary mb-2">
              🎉 Congratulations!
            </h3>
            <p className="text-muted-foreground mb-4">
              You've completed all the steps to become a creator.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/creator/products">
                Manage Your Products
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 