import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// GET /api/auth/me - Get current user
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      )
    }

    // Find user by session token (simplified - in production use proper session management)
    const user = await prisma.user.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        branchId: true,
        departmentId: true,
        startDate: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            organization: {
              select: { id: true, name: true }
            }
          }
        },
        department: {
          select: { id: true, name: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Người dùng không tồn tại" } },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// POST /api/auth/logout - Logout
export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("session")

    return NextResponse.json({ success: true, message: "Đăng xuất thành công" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}
