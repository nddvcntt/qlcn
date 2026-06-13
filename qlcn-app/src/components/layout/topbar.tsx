"use client"

import { Bell, User } from "lucide-react"
import { Session } from "next-auth"

interface TopbarProps {
  user?: Session["user"]
  branchName?: string
}

export function Topbar({ user, branchName = "Chi nhánh" }: TopbarProps) {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-primary">{branchName}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-secondary-light transition-colors">
          <Bell className="h-5 w-5 text-primary" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
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
