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

  const sessionUser = session.user as any
  const branchName = sessionUser?.branch?.name

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        userRole={session.user?.role} 
        branchName={branchName} 
      />
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Topbar user={session.user} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
