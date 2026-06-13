import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { UserRole } from "./rbac"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
          include: {
            branch: { select: { id: true, name: true, code: true } },
          },
        })

        if (!user || !user.isActive) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          username: user.username,
          name: user.fullName,
          email: user.email,
          role: user.role as UserRole,
          branchId: user.branchId,
          departmentId: user.departmentId,
          branch: user.branch,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role as UserRole
        token.branchId = (user as any).branchId as string | null
        token.departmentId = (user as any).departmentId as string | null
        token.branch = (user as any).branch
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as UserRole
        ;(session.user as any).branchId = token.branchId as string | null
        ;(session.user as any).departmentId = token.departmentId as string | null
        ;(session.user as any).branch = token.branch
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
})
