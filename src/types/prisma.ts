export interface Role {
  id: string
  name: string
  description: string | null
  color: string | null
  permissions: string[]
  discount: number | null
  isTeam: boolean
  createdAt: Date
  updatedAt: Date
  users: User[]
}

export interface User {
  id: string
  name: string | null
  email: string | null
  username: string
  emailVerified: Date | null
  image: string | null
  bio: string | null
  password: string
  emailNotifications: boolean
  createdAt: Date
  updatedAt: Date
  roles: Role[]
  accounts: Account[]
  sessions: Session[]
  products: Product[]
  orders: Order[]
  portfolio: Portfolio | null
  ratings: Rating[]
  givenRatings: Rating[]
  chats: Chat[]
  messages: Message[]
  discountCodes: DiscountCode[]
  cartItems: CartItem[]
}

export interface Product {
  id: string
  name: string
  title: string
  description: string
  price: number
  imageUrl: string
  fileUrl: string | null
  category: string
  creatorId: string
  creator: User
  createdAt: Date
  updatedAt: Date
  orders: OrderItem[]
  cartItems: CartItem[]
}

export interface Order {
  id: string
  userId: string
  user: User
  items: OrderItem[]
  status: string
  totalPrice: number
  rating: Rating | null
  chat: Chat | null
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  order: Order
  productId: string
  product: Product
  quantity: number
  price: number
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  userId: string
  user: User
  productId: string
  product: Product
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export interface Rating {
  id: string
  orderId: string
  order: Order
  userId: string
  user: User
  raterId: string
  rater: User
  rating: number
  comment: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Chat {
  id: string
  orderId: string
  order: Order
  userId: string
  user: User
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  chatId: string
  chat: Chat
  userId: string
  user: User
  content: string
  attachmentUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface DiscountCode {
  id: string
  code: string
  discount: number
  maxUses: number | null
  usedCount: number
  expiresAt: Date | null
  createdById: string
  createdBy: User
  createdAt: Date
  updatedAt: Date
}

export interface Portfolio {
  id: string
  userId: string
  user: User
  title: string
  description: string
  items: PortfolioItem[]
  createdAt: Date
  updatedAt: Date
}

export interface PortfolioItem {
  id: string
  portfolioId: string
  portfolio: Portfolio
  title: string
  description: string
  mediaUrl: string
  mediaType: string
  createdAt: Date
  updatedAt: Date
}

export interface Account {
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
  user: User
}

export interface Session {
  id: string
  sessionToken: string
  userId: string
  expires: Date
  user: User
} 