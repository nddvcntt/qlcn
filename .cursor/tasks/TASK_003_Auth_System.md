# Task: TASK_003_Auth_System
## Mô tả
Xây dựng hệ thống Authentication và Authorization.

## Priority: CRITICAL
## Estimated Time: 4-5 hours
## Agent: AGENT_002_Auth
## Dependencies: TASK_001_Project_Setup, TASK_002_Database_Schema

## Subtasks

### 3.1 Setup NextAuth.js
```typescript
// src/lib/auth.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }
        
        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string }
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
          data: { lastLoginAt: new Date() }
        })
        
        return {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
          departmentId: user.departmentId
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.branchId = user.branchId
        token.departmentId = user.departmentId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.branchId = token.branchId as string | null
        session.user.departmentId = token.departmentId as string | null
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  }
})
```

### 3.2 Create Auth API Route
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

### 3.3 Create Types
```typescript
// src/types/auth.d.ts
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string
    username: string
    role: UserRole
    branchId: string | null
    departmentId: string | null
  }
  
  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    branchId: string | null
    departmentId: string | null
  }
}
```

### 3.4 Create RBAC System
```typescript
// src/lib/rbac.ts
import { UserRole } from "@prisma/client"

export const Permissions = {
  // Users
  "users.read": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR],
  "users.write": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR],
  "users.delete": [UserRole.ADMIN],
  
  // Products
  "products.read": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR, UserRole.DEPARTMENT_HEAD, UserRole.EMPLOYEE],
  "products.write": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR],
  "products.delete": [UserRole.ADMIN],
  
  // Import Orders
  "import.read": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR],
  "import.write": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR],
  
  // Export Orders
  "export.read": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR],
  "export.write": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR],
  
  // Inventory
  "inventory.read": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR, UserRole.DEPARTMENT_HEAD, UserRole.EMPLOYEE],
  "inventory.write": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR],
  
  // Production
  "production.read": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR, UserRole.DEPARTMENT_HEAD],
  "production.read.self": [UserRole.EMPLOYEE],
  "production.write": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR, UserRole.DEPARTMENT_HEAD, UserRole.EMPLOYEE],
  "production.approve": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR, UserRole.DEPARTMENT_HEAD],
  
  // Salary
  "salary.read": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR, UserRole.DEPARTMENT_HEAD],
  "salary.read.self": [UserRole.EMPLOYEE],
  "salary.write": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR],
  
  // Costs
  "costs.read": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR],
  "costs.write": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR],
  
  // Reports
  "reports.read": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR, UserRole.DEPARTMENT_HEAD],
  "reports.dashboard": [UserRole.ADMIN, UserRole.BRANCH_DIRECTOR, UserRole.DEPARTMENT_HEAD],
} as const

export type Permission = keyof typeof Permissions

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return Permissions[permission]?.includes(role) ?? false
}

export function canAccessBranch(
  userRole: UserRole,
  userBranchId: string | null,
  targetBranchId: string
): boolean {
  // Admin can access all branches
  if (userRole === UserRole.ADMIN) return true
  
  // Others can only access their own branch
  return userBranchId === targetBranchId
}

export function canAccessDepartment(
  userRole: UserRole,
  userDepartmentId: string | null,
  targetDepartmentId: string
): boolean {
  // Admin and Branch Director can access all departments in their branch
  if (userRole === UserRole.ADMIN || userRole === UserRole.BRANCH_DIRECTOR) return true
  
  // Others can only access their own department
  return userDepartmentId === targetDepartmentId
}
```

### 3.5 Create Middleware
```typescript
// src/middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")
  const isPublicRoute = req.nextUrl.pathname === "/"

  // Redirect to login if not authenticated
  if (!isLoggedIn && !isAuthPage && !isApiRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Redirect to dashboard if logged in and trying to access login page
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"]
}
```

### 3.6 Create Login Page
```typescript
// src/app/(auth)/login/page.tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false
    })

    if (result?.error) {
      setError("Tên đăng nhập hoặc mật khẩu không đúng")
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">
          Đăng nhập QLCN
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên đăng nhập
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Mật khẩu
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          {error && (
            <p className="text-danger text-sm">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-secondary text-primary-dark hover:bg-secondary/90"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
```

## Deliverables
- [ ] NextAuth.js configured với credentials provider
- [ ] JWT authentication hoạt động
- [ ] RBAC system với tất cả permissions
- [ ] Auth middleware hoạt động
- [ ] Login page với validation
- [ ] Session management

## Verification
- [ ] Admin có thể đăng nhập với credentials mặc định
- [ ] Unauthorized users bị redirect về login
- [ ] Role-based navigation hoạt động
- [ ] API routes protected đúng cách

## Notes
- Bảo mật: bcrypt cost factor 12
- JWT expiry: 8 giờ
- Không lưu plaintext password
- Rate limiting trên login endpoint
