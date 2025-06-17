import { Role } from "@prisma/client"
import NextAuth from "next-auth"
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    name: string | null
    email: string
    username: string
    roles: Role[]
    isTeamMember: boolean
    isAdmin: boolean
    isSuperAdmin: boolean
    permissions: string[]
  }

  interface Session {
    user: {
      id: string
      username: string
      isAdmin: boolean
      permissions: string[]
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    name: string | null
    email: string
    username: string
    roles: Role[]
    isTeamMember: boolean
    isAdmin: boolean
    isSuperAdmin: boolean
    permissions: string[]
  }
}

export interface ExtendedToken {
  id: string
  username: string
  email: string
  roles: Role[]
  isAdmin: boolean
  isSuperAdmin: boolean
  permissions: string[]
  iat: number
  exp: number
  jti: string
} 