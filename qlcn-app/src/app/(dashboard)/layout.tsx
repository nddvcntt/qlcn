import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { DashboardShell } from "./dashboard-shell"

interface SessionUser {
  role?: string
  branch?: { name?: string }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const sessionUser = session.user as SessionUser
  const branchName = sessionUser?.branch?.name

  return (
    <DashboardShell>
      <div className="flex h-screen bg-background">
        <Sidebar
          userRole={session.user?.role}
          branchName={branchName}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Topbar user={session.user} branchName={branchName} />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </DashboardShell>
  )
}
