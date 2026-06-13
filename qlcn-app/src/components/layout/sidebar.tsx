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
  ShoppingCart,
  MapPin,
  Calendar,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "../providers/ThemeToggle"

interface SidebarProps {
  userRole?: string
  branchName?: string
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Điểm Bán", href: "/selling-points", icon: MapPin },
  { name: "Sản Phẩm", href: "/products", icon: ShoppingCart },
  { name: "Nhập Hàng", href: "/import-orders", icon: PackagePlus },
  { name: "Xuất Hàng", href: "/export-orders", icon: PackageMinus },
  { name: "Tồn Kho", href: "/inventory", icon: Archive },
  { name: "Lịch Làm Việc", href: "/work-schedule", icon: Calendar },
  { name: "Năng Suất", href: "/production", icon: TrendingUp },
  { name: "Lương", href: "/salary", icon: DollarSign },
  { name: "Chi Phí", href: "/costs", icon: BarChart3 },
  { name: "Báo Cáo", href: "/reports", icon: ClipboardList },
]

export function Sidebar({ userRole, branchName }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-60 bg-[#5D4037] dark:bg-[#2D2D2D] text-white min-h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#4E342E] dark:border-[#3E2723]">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F9A825] dark:bg-[#FFB300] flex items-center justify-center">
              <span className="text-[#3E2723] dark:text-[#1A1A1A] font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold">QLCN</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Branch Name */}
      {branchName && (
        <div className="px-4 py-3 border-b border-[#4E342E] dark:border-[#3E2723]">
          <p className="text-xs text-[#D7CCC8] dark:text-gray-400">Chi nhánh:</p>
          <p className="text-sm font-medium truncate">{branchName}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#F9A825] dark:bg-[#FFB300] text-[#3E2723] dark:text-[#1A1A1A]"
                  : "text-white/80 hover:bg-[#4E342E] dark:hover:bg-[#3E2723] hover:text-white"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5", 
                isActive 
                  ? "text-[#3E2723] dark:text-[#1A1A1A]" 
                  : "text-[#D7CCC8] dark:text-gray-400"
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="p-3 border-t border-[#4E342E] dark:border-[#3E2723] space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-[#4E342E] dark:hover:bg-[#3E2723] hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5 text-[#D7CCC8] dark:text-gray-400" />
          Cài Đặt
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-[#4E342E] dark:hover:bg-[#3E2723] hover:text-white transition-colors w-full"
        >
          <LogOut className="h-5 w-5 text-[#D7CCC8] dark:text-gray-400" />
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
