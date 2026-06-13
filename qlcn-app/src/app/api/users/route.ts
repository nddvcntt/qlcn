import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"

// GET /api/users - Get all users (with branch filter for non-admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const userRole = session?.user?.role as string

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")
    const role = searchParams.get("role")
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    // Build where clause
    const where: any = {}

    // Non-admin users can only see users in their branch
    if (userRole !== "ADMIN") {
      if (session.user?.branchId) {
        where.branchId = session.user.branchId
      } else {
        return NextResponse.json({ success: true, data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } })
      }
    } else if (branchId) {
      where.branchId = branchId
    }

    if (role) where.role = role
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === "true"

    // Search filter
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where })

    const users = await prisma.user.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: [{ role: "asc" }, { fullName: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Remove password from response
    const sanitizedUsers = users.map(({ password, ...user }) => user)

    return NextResponse.json({
      success: true,
      data: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userRole = session?.user?.role as string

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      )
    }

    // Only ADMIN and BRANCH_DIRECTOR can create users
    if (userRole !== "ADMIN" && userRole !== "BRANCH_DIRECTOR") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không có quyền" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { username, password, fullName, email, phone, role, branchId, departmentId, startDate } = body

    // Validation
    if (!username || !password || !fullName || !email || !role) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu thông tin bắt buộc" } },
        { status: 400 }
      )
    }

    // BRANCH_DIRECTOR can only create users for their branch
    const targetBranchId = userRole === "ADMIN" ? branchId : session.user?.branchId

    // BRANCH_DIRECTOR can only create DEPARTMENT_HEAD and EMPLOYEE
    if (userRole === "BRANCH_DIRECTOR" && (role === "ADMIN" || role === "BRANCH_DIRECTOR")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không thể tạo tài khoản cấp cao hơn" } },
        { status: 403 }
      )
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE", message: "Username hoặc email đã tồn tại" } },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        email,
        phone: phone || null,
        role,
        branchId: targetBranchId,
        departmentId: departmentId || null,
        startDate: startDate ? new Date(startDate) : new Date(),
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    })

    const { password: _, ...sanitizedUser } = user

    return NextResponse.json({ success: true, data: sanitizedUser }, { status: 201 })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// PUT /api/users - Update user
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    const userRole = session?.user?.role as string

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      )
    }

    if (userRole !== "ADMIN" && userRole !== "BRANCH_DIRECTOR") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không có quyền" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, username, password, fullName, email, phone, role, departmentId, startDate, isActive } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu ID người dùng" } },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Người dùng không tồn tại" } },
        { status: 404 }
      )
    }

    // BRANCH_DIRECTOR can only update users in their branch
    if (userRole === "BRANCH_DIRECTOR" && existingUser.branchId !== session.user?.branchId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không thể sửa tài khoản ngoài chi nhánh" } },
        { status: 403 }
      )
    }

    // BRANCH_DIRECTOR cannot modify ADMIN or BRANCH_DIRECTOR
    if (userRole === "BRANCH_DIRECTOR" && (existingUser.role === "ADMIN" || existingUser.role === "BRANCH_DIRECTOR")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không thể sửa tài khoản cấp cao hơn" } },
        { status: 403 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (fullName !== undefined) updateData.fullName = fullName
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (departmentId !== undefined) updateData.departmentId = departmentId
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (isActive !== undefined) updateData.isActive = isActive

    // Only ADMIN can change role
    if (role !== undefined && userRole === "ADMIN") {
      updateData.role = role
    }

    // Only ADMIN can change username
    if (username !== undefined && userRole === "ADMIN") {
      // Check if username is taken
      const usernameExists = await prisma.user.findFirst({
        where: { username, NOT: { id } }
      })
      if (usernameExists) {
        return NextResponse.json(
          { success: false, error: { code: "DUPLICATE", message: "Username đã tồn tại" } },
          { status: 400 }
        )
      }
      updateData.username = username
    }

    // Only ADMIN and BRANCH_DIRECTOR can change password (their own or lower roles)
    if (password && existingUser.role !== "ADMIN" && existingUser.role !== "BRANCH_DIRECTOR") {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        branch: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    })

    const { password: _, ...sanitizedUser } = user

    return NextResponse.json({ success: true, data: sanitizedUser })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// DELETE /api/users - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    const userRole = session?.user?.role as string

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      )
    }

    if (userRole !== "ADMIN" && userRole !== "BRANCH_DIRECTOR") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không có quyền" } },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu ID người dùng" } },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Người dùng không tồn tại" } },
        { status: 404 }
      )
    }

    // Prevent self-deletion
    if (id === session.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không thể tự xóa tài khoản" } },
        { status: 403 }
      )
    }

    // BRANCH_DIRECTOR can only delete users in their branch
    if (userRole === "BRANCH_DIRECTOR" && existingUser.branchId !== session.user?.branchId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không thể xóa tài khoản ngoài chi nhánh" } },
        { status: 403 }
      )
    }

    // BRANCH_DIRECTOR cannot delete ADMIN or BRANCH_DIRECTOR
    if (userRole === "BRANCH_DIRECTOR" && (existingUser.role === "ADMIN" || existingUser.role === "BRANCH_DIRECTOR")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không thể xóa tài khoản cấp cao hơn" } },
        { status: 403 }
      )
    }

    // Soft delete - set isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, message: "Đã xóa tài khoản" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}
