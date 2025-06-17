"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react"

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
import { toast } from "@/hooks/use-toast"

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  status: string
  imageUrl: string
  fileUrl: string
  createdAt: string
  updatedAt: string
  creatorId: string
}

export default function CreatorProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/creator/products")
        if (!response.ok) throw new Error("Failed to fetch products")
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [session, router])

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      // Upload thumbnail
      const thumbnailFile = formData.get("thumbnail") as File
      if (!thumbnailFile) {
        throw new Error("Thumbnail is required")
      }
      const thumbnailFormData = new FormData()
      thumbnailFormData.append("file", thumbnailFile)
      thumbnailFormData.append("type", "thumbnail")
      
      const thumbnailResponse = await fetch("/api/upload", {
        method: "POST",
        body: thumbnailFormData,
      })
      
      if (!thumbnailResponse.ok) {
        throw new Error("Failed to upload thumbnail")
      }
      
      const { url: thumbnailUrl } = await thumbnailResponse.json()

      // Upload product file
      const productFile = formData.get("productFile") as File
      if (!productFile) {
        throw new Error("Product file is required")
      }
      const productFormData = new FormData()
      productFormData.append("file", productFile)
      productFormData.append("type", "product")
      
      const productResponse = await fetch("/api/upload", {
        method: "POST",
        body: productFormData,
      })
      
      if (!productResponse.ok) {
        throw new Error("Failed to upload product file")
      }
      
      const { url: productUrl } = await productResponse.json()

      // Create product
      const response = await fetch("/api/creator/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          price: parseFloat(formData.get("price") as string),
          category: formData.get("category"),
          status: formData.get("status"),
          imageUrl: thumbnailUrl,
          fileUrl: productUrl,
        }),
      })

      if (!response.ok) throw new Error("Failed to create product")

      const newProduct = await response.json()
      setProducts([...products, newProduct])

      toast({
        title: "Success",
        description: "Product created successfully",
      })

      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/creator/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete product")

      setProducts(products.filter((product) => product.id !== productId))

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
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

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Products</h2>
          <p className="text-muted-foreground">
            Manage and create your digital products
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>
                Add a new digital product to your store
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Upload a thumbnail image for your product (JPEG, PNG, or WebP)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productFile">Product File</Label>
                <Input
                  id="productFile"
                  name="productFile"
                  type="file"
                  accept=".zip,.pdf,.exe"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Upload the file that customers will download (ZIP, PDF, or EXE)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="games">Games</SelectItem>
                    <SelectItem value="mods">Mods</SelectItem>
                    <SelectItem value="assets">Assets</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Create Product
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{product.title}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold">${product.price}</div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    (product.status || "draft") === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {(product.status || "draft").toUpperCase()}
                </div>
              </div>
              <Button asChild variant="secondary" className="w-full">
                <a href={`/store/products/${product.id}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View in Store
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}

        {products.length === 0 && (
          <Card className="col-span-full">
            <CardHeader>
              <CardDescription className="text-center">
                You haven't created any products yet. Click "Add Product" to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
} 