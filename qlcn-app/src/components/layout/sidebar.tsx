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
  Users,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "../providers/ThemeToggle"
import { useSidebar } from "./sidebar-context"

interface SidebarProps {
  userRole?: string
  branchName?: string
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tài Khoản", href: "/users", icon: Users, roles: ["ADMIN", "BRANCH_DIRECTOR"] },
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
  const { collapsed, mobileOpen, setMobileOpen, isMobile } = useSidebar()

  // Desktop: width changes. Mobile: drawer overlay
  const widthClass = isMobile
    ? "w-72"
    : collapsed
      ? "w-16"
      : "w-60"

  const transformClass = isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0"

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "flex flex-col bg-[#5D4037] dark:bg-[#2D2D2D] text-white min-h-screen transition-all duration-200 ease-in-out z-40",
          isMobile
            ? cn("fixed top-0 left-0 h-full", widthClass, transformClass)
            : cn("relative", widthClass)
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-[#4E342E] dark:border-[#3E2723]">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-[#F9A825] dark:bg-[#FFB300] flex items-center justify-center">
                <span className="text-[#3E2723] dark:text-[#1A1A1A] font-bold text-sm">C</span>
              </div>
              {(!collapsed || isMobile) && (
                <span className="text-xl font-bold truncate">QLCN</span>
              )}
            </div>
            {isMobile ? (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md hover:bg-[#4E342E] dark:hover:bg-[#3E2723]"
                aria-label="Đóng menu"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <ThemeToggle />
            )}
          </div>
        </div>

        {/* Branch Name */}
        {branchName && (!collapsed || isMobile) && (
          <div className="px-4 py-3 border-b border-[#4E342E] dark:border-[#3E2723]">
            <p className="text-xs text-[#D7CCC8] dark:text-gray-400">Chi nhánh:</p>
            <p className="text-sm font-medium truncate">{branchName}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation
            .filter((item) => {
              if (item.roles) {
                return item.roles.includes(userRole || "")
              }
              return true
            })
            .map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => isMobile && setMobileOpen(false)}
                  title={collapsed && !isMobile ? item.name : undefined}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-colors",
                    collapsed && !isMobile
                      ? "justify-center px-2 py-2.5"
                      : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-[#F9A825] dark:bg-[#FFB300] text-[#3E2723] dark:text-[#1A1A1A]"
                      : "text-white/80 hover:bg-[#4E342E] dark:hover:bg-[#3E2723] hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive
                        ? "text-[#3E2723] dark:text-[#1A1A1A]"
                        : "text-[#D7CCC8] dark:text-gray-400"
                    )}
                  />
                  {(!collapsed || isMobile) && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              )
            })}
        </nav>

        {/* Settings & Logout */}
        <div className="p-3 border-t border-[#4E342E] dark:border-[#3E2723] space-y-1">
          <Link
            href="/settings"
            onClick={() => isMobile && setMobileOpen(false)}
            title={collapsed && !isMobile ? "Cài Đặt" : undefined}
            className={cn(
              "flex items-center rounded-lg text-sm font-medium text-white/80 hover:bg-[#4E342E] dark:hover:bg-[#3E2723] hover:text-white transition-colors",
              collapsed && !isMobile
                ? "justify-center px-2 py-2.5"
                : "gap-3 px-3 py-2.5"
            )}
          >
            <Settings className="h-5 w-5 shrink-0 text-[#D7CCC8] dark:text-gray-400" />
            {(!collapsed || isMobile) && <span>Cài Đặt</span>}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={collapsed && !isMobile ? "Đăng xuất" : undefined}
            className={cn(
              "flex items-center rounded-lg text-sm font-medium text-white/80 hover:bg-[#4E342E] dark:hover:bg-[#3E2723] hover:text-white transition-colors w-full",
              collapsed && !isMobile
                ? "justify-center px-2 py-2.5"
                : "gap-3 px-3 py-2.5"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0 text-[#D7CCC8] dark:text-gray-400" />
            {(!collapsed || isMobile) && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>
    </>
  )
}
