import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Getting Started with Digital Product Creation",
    excerpt: "Learn the essential steps to create and sell your first digital product online.",
    category: "Tutorials",
    date: "March 15, 2024",
    readTime: "5 min read"
  },
  {
    id: "2",
    title: "Maximizing Your Sales with Effective Product Descriptions",
    excerpt: "Tips and tricks for writing compelling product descriptions that convert.",
    category: "Marketing",
    date: "March 14, 2024",
    readTime: "7 min read"
  },
  {
    id: "3",
    title: "Building Your Creator Brand",
    excerpt: "A comprehensive guide to establishing your presence as a digital creator.",
    category: "Branding",
    date: "March 13, 2024",
    readTime: "10 min read"
  },
  {
    id: "4",
    title: "Understanding Platform Analytics",
    excerpt: "Make data-driven decisions by learning how to interpret your store analytics.",
    category: "Analytics",
    date: "March 12, 2024",
    readTime: "8 min read"
  }
]

export default function BlogPage() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="text-xl text-muted-foreground">
            Insights, tutorials, and updates from our team
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 justify-center flex-wrap">
          <Button variant="outline" className="rounded-full">All</Button>
          <Button variant="outline" className="rounded-full">Tutorials</Button>
          <Button variant="outline" className="rounded-full">Marketing</Button>
          <Button variant="outline" className="rounded-full">Branding</Button>
          <Button variant="outline" className="rounded-full">Analytics</Button>
        </div>

        {/* Blog Posts */}
        <div className="space-y-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">
                        {post.category}
                      </span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {post.date}
                      </span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {post.readTime}
                      </span>
                    </div>
                    <CardTitle className="text-2xl">{post.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
                <Button variant="link" className="mt-4 p-0">
                  Read more →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-muted p-8 rounded-lg text-center space-y-4">
          <h2 className="text-2xl font-bold">Subscribe to our newsletter</h2>
          <p className="text-muted-foreground">
            Get the latest articles and updates delivered to your inbox
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>
    </div>
  )
} 