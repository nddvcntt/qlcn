"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"

interface SidebarContextValue {
  collapsed: boolean
  mobileOpen: boolean
  toggle: () => void
  setMobileOpen: (open: boolean) => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const STORAGE_KEY = "qlcn.sidebar.collapsed"

function readInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false
  const isMobile = window.matchMedia("(max-width: 767px)").matches
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored === "1"
  return isMobile
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 767px)").matches)
    setCollapsed(readInitialCollapsed())

    const mq = window.matchMedia("(max-width: 767px)")
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (e.matches) {
        setCollapsed(true)
        setMobileOpen(false)
      }
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0")
  }, [collapsed])

  const toggle = useCallback(() => {
    if (isMobile) {
      setMobileOpen((v) => !v)
    } else {
      setCollapsed((v) => !v)
    }
  }, [isMobile])

  return (
    <SidebarContext.Provider
      value={{ collapsed, mobileOpen, toggle, setMobileOpen, isMobile }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}
