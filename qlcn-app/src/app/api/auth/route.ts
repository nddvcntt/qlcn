import { signOut } from "@/lib/auth"
import { NextResponse } from "next/server"

// POST /api/auth - Logout (used by clients that POST to this endpoint)
export async function POST() {
  try {
    await signOut({ redirect: false })
    return NextResponse.json({ success: true, message: "Đăng xuất thành công" })
  } catch (error) {
    console.error("[/api/auth] Logout error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// GET /api/auth - Returns available auth endpoints
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      signin: "/api/auth/signin",
      signout: "/api/auth/signout",
      session: "/api/auth/session",
      me: "/api/me",
    },
  })
}
