import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Prisma, Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string | null;
    username: string;
    roles: Role[];
    isTeamMember: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    permissions: string[];
  }
  
  interface Session {
    user: User;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.email },
                { username: credentials.email }
              ]
            },
            include: {
              roles: true
            }
          });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            return null;
          }

          // Calculate user permissions and roles
          const isTeamMember = user.roles.some(role => role.isTeam);
          const isAdmin = user.roles.some(role => {
            const perms = role.permissions as Prisma.JsonValue as string[];
            return Array.isArray(perms) && perms.includes('admin');
          });
          const isSuperAdmin = user.roles.some(role => {
            const perms = role.permissions as Prisma.JsonValue as string[];
            return Array.isArray(perms) && perms.includes('super_admin');
          });
          const permissions = Array.from(new Set(
            user.roles.flatMap(role => {
              const perms = role.permissions as Prisma.JsonValue as string[];
              return Array.isArray(perms) ? perms : [];
            })
          ));

          return {
            id: user.id,
            email: user.email || "",
            name: user.name,
            username: user.username,
            roles: user.roles,
            isTeamMember,
            isAdmin,
            isSuperAdmin,
            permissions
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = user.username;
        token.roles = user.roles;
        token.isTeamMember = user.isTeamMember;
        token.isAdmin = user.isAdmin;
        token.isSuperAdmin = user.isSuperAdmin;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.username = token.username as string;
        session.user.roles = token.roles as Role[];
        session.user.isTeamMember = token.isTeamMember as boolean;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isSuperAdmin = token.isSuperAdmin as boolean;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};