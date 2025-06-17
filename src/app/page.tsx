"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              Onidolus
            </Link>
            <div className="flex items-center space-x-4">
              {session ? (
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                Your Digital Content{" "}
                <span className="block">Marketplace</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Discover, buy, and sell high-quality digital content, mods, and assets.
                Join our growing community of creators and users.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/store">
                  <Button size="lg">Browse Store</Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline">Become a Creator</Button>
                </Link>
              </div>
            </div>

            <div className="relative lg:h-[700px] hidden lg:block">
              <Image
                src="https://i.imgur.com/2QYWU84.png"
                alt="Digital content creator working on laptop"
                fill
                className="object-cover rounded-3xl"
                priority
                quality={100}
              />
              {/* Review notification */}
              <div className="absolute top-4 right-4 bg-[#0B1121] text-white px-4 py-2 rounded-full shadow-lg z-10">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[15px]">Review successfully sent!</span>
                </div>
              </div>

              {/* B1cey Card */}
              <div className="absolute top-[35%] right-4 bg-[#0B1121] text-white px-4 py-2.5 rounded-[20px] shadow-lg z-20">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-medium">B1cey</h4>
                    <p className="text-gray-400 text-[14px]">Freelance Artist</p>
                  </div>
                  <svg className="w-5 h-5 text-blue-500 ml-auto" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Discord platform */}
              <div className="absolute bottom-6 right-4 bg-[#0B1121] text-white px-4 py-2.5 rounded-[20px] shadow-lg z-10">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-[15px]">Popular platform</span>
                  <span className="text-[15px]">Discord</span>
                  <svg className="w-5 h-5 text-blue-500 ml-auto" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary/50 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose Onidolus?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We provide the tools and platform you need to showcase, sell, and manage your digital content.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Secure Transactions",
                  description: "Built-in payment processing and content delivery system to keep both buyers and sellers protected.",
                  icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ),
                },
                {
                  title: "Creator Dashboard",
                  description: "Powerful analytics and management tools to help you understand and grow your business.",
                  icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                },
                {
                  title: "Community First",
                  description: "Connect with other creators, share insights, and grow together in our thriving community.",
                  icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                },
              ].map((feature, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { number: "10K+", label: "Active Users" },
                { number: "50K+", label: "Digital Assets" },
                { number: "1M+", label: "Downloads" },
                { number: "99%", label: "Satisfaction Rate" },
              ].map((stat, index) => (
                <div key={index} className="p-6">
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Creating?</h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already selling their digital content on Onidolus.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary">Get Started Now</Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 hover:bg-primary-foreground/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
