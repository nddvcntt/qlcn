# Task: TASK_004_UI_Components
## Mô tả
Xây dựng UI Components và Layout system.

## Priority: HIGH
## Estimated Time: 5-6 hours
## Agent: AGENT_003_UI_UX
## Dependencies: TASK_001_Project_Setup, TASK_003_Auth_System

## Subtasks

### 4.1 Create UI Components

#### Button Component
```typescript
// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-secondary text-primary-dark hover:bg-secondary/90",
        secondary: "bg-white border border-primary text-primary hover:bg-primary-light/10",
        danger: "bg-danger text-white hover:bg-danger/90",
        ghost: "hover:bg-primary-light/10 text-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={twMerge(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### Card Component
```typescript
// src/components/ui/card.tsx
import * as React from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge(
      "rounded-xl border border-border bg-surface text-primary shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={twMerge("text-lg font-semibold leading-none", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={twMerge("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
```

#### Table Component
```typescript
// src/components/ui/table.tsx
import * as React from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={twMerge("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={twMerge("bg-primary text-white", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={twMerge(
      "border-b border-border transition-colors hover:bg-secondary-light/50",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={twMerge(
      "h-12 px-4 text-left align-middle font-medium text-white",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={twMerge("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={twMerge("p-4 align-middle", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell }
```

#### Input Component
```typescript
// src/components/ui/input.tsx
import * as React from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={twMerge(
          "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

#### Select Component
```typescript
// src/components/ui/select.tsx
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={twMerge(
      "flex h-10 w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-primary-light focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={twMerge(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface text-primary shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={twMerge(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={twMerge(
      "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-secondary-light/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem }
```

### 4.2 Create Layout Components

#### Sidebar
```typescript
// src/components/layout/sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  PackagePlus,
  PackageMinus,
  Archive,
  TrendingUp,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react"
import { clsx } from "clsx"
import { signOut } from "next-auth/react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Nhập Hàng", href: "/dashboard/nhap-hang", icon: PackagePlus },
  { name: "Xuất Hàng", href: "/dashboard/xuat-hang", icon: PackageMinus },
  { name: "Tồn Kho", href: "/dashboard/ton-kho", icon: Archive },
  { name: "Năng Suất", href: "/dashboard/nang-suat", icon: TrendingUp },
  { name: "Lương", href: "/dashboard/luong", icon: DollarSign },
  { name: "Chi Phí", href: "/dashboard/chi-phi", icon: DollarSign },
  { name: "Báo Cáo", href: "/dashboard/bao-cao", icon: BarChart3 },
  { name: "Cài Đặt", href: "/dashboard/cai-dat", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-60 bg-primary text-white min-h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-primary-light">
        <span className="text-xl font-bold">QLCN</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-primary-dark"
                  : "text-white/80 hover:bg-primary-light hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-primary-light">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-primary-light hover:text-white transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
```

#### Topbar
```typescript
// src/components/layout/topbar.tsx
"use client"

import { Bell, User } from "lucide-react"
import { Session } from "next-auth"

interface TopbarProps {
  user: Session["user"]
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-primary">Chi nhánh Hà Nội</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-secondary-light transition-colors">
          <Bell className="h-5 w-5 text-primary" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-primary">{user?.fullName}</p>
            <p className="text-xs text-primary-light">{user?.role}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-5 w-5 text-primary-dark" />
          </div>
        </div>
      </div>
    </header>
  )
}
```

#### Main Layout
```typescript
// src/app/(dashboard)/layout.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar user={session.user} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

## Deliverables
- [ ] Button component với variants
- [ ] Card component
- [ ] Table component
- [ ] Input component
- [ ] Select component
- [ ] Modal/Dialog component
- [ ] Sidebar navigation
- [ ] Topbar
- [ ] Dashboard layout

## Verification
- [ ] Components render đúng với design system
- [ ] Responsive layout hoạt động
- [ ] Navigation hoạt động
- [ ] Role-based menu items hiển thị đúng

## Notes
- Sử dụng shadcn/ui pattern
- Follow design system từ SPEC.md
- Responsive breakpoints: mobile < 768px, tablet 768-1024px, desktop > 1024px
