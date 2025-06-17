import type { Portfolio, PortfolioItem, User, Role } from "./prisma"

export type {
  Portfolio,
  PortfolioItem,
  User,
  Role,
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  fileUrl: string
  images: string[]
  category: string
  creator: User
  creatorId: string
  createdAt: Date
  updatedAt: Date
}

export type Order = {
  id: string
  status: "pending" | "processing" | "completed" | "cancelled"
  totalAmount: number
  user: User
  userId: string
  product: Product
  productId: string
  createdAt: Date
  updatedAt: Date
}

export type Message = {
  id: string
  content: string
  fileUrl?: string | null
  createdAt: Date
  chatId: string
}

export type Chat = {
  id: string
  messages: Message[]
  order: Order
  orderId: string
  users: User[]
  createdAt: Date
  updatedAt: Date
}

export type Review = {
  id: string
  rating: number
  comment?: string
  user: User
  userId: string
  createdAt: Date
}

export type AffiliateCode = {
  id: string
  code: string
  discount: number
  usageCount: number
  maxUses?: number | null
  expiresAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export type Announcement = {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface UserSession {
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface Session {
  user: UserSession
  expires: string
}

export interface ChatMessage {
  id: string
  chatId: string
  userId: string
  content: string
  attachmentUrl?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ChatRoom {
  id: string
  orderId: string
  userId: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderDetails {
  id: string
  userId: string
  status: string
  totalPrice: number
  createdAt: Date
  updatedAt: Date
}

export interface UserRole {
  id: string
  name: string
  description?: string
  color?: string
  permissions: string[]
  discount?: number
  isTeam: boolean
  createdAt: Date
  updatedAt: Date
} 