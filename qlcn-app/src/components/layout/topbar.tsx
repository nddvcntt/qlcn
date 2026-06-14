"use client"

import { Bell, User, Menu } from "lucide-react"
import { Session } from "next-auth"
import { useSidebar } from "./sidebar-context"

interface TopbarProps {
  user?: Session["user"]
  branchName?: string
}

export function Topbar({ user, branchName = "Chi nhánh" }: TopbarProps) {
  const { toggle, collapsed, isMobile } = useSidebar()
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-secondary-light transition-colors shrink-0"
          aria-label={isMobile ? "Mở menu" : collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
          title={isMobile ? "Mở menu" : collapsed ? "Mở rộng" : "Thu nhỏ"}
        >
          <Menu className="h-5 w-5 text-primary" />
        </button>
        <h1 className="text-base md:text-lg font-semibold text-primary truncate">
          {branchName}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button
          className="relative p-2 rounded-lg hover:bg-secondary-light transition-colors"
          aria-label="Thông báo"
        >
          <Bell className="h-5 w-5 text-primary" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-primary">{user?.name || "User"}</p>
            <p className="text-xs text-primary-light capitalize">
              {user?.role?.toLowerCase()?.replace("_", " ") || "Guest"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-5 w-5 text-primary-dark" />
          </div>
        </div>
      </div>
    </header>
  )
}
