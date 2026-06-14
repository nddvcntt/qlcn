"use client"

import { SidebarProvider } from "@/components/layout/sidebar-context"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>
}
