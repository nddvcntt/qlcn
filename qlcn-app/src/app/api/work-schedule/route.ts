import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET /api/work-schedule - Get work schedules
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    const userBranchId = (session.user as any)?.branchId
    const userId = (session.user as any)?.id

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")
    const employeeId = searchParams.get("employeeId")
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const where: any = {}

    // Role-based filtering
    if (userRole === "EMPLOYEE") {
      where.employeeId = userId
    } else if (userRole === "DEPARTMENT_HEAD") {
      where.branchId = userBranchId
    } else if (userRole === "BRANCH_DIRECTOR") {
      where.branchId = userBranchId
    }
    // ADMIN sees all

    if (branchId) {
      if (userRole !== "ADMIN" && branchId !== userBranchId) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Không có quyền xem chi nhánh khác" } },
          { status: 403 }
        )
      }
      where.branchId = branchId
    }
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.workDate = {}
      if (dateFrom) where.workDate.gte = new Date(dateFrom)
      if (dateTo) where.workDate.lte = new Date(dateTo)
    }

    const schedules = await prisma.workSchedule.findMany({
      where,
      include: {
        employee: { select: { id: true, fullName: true, role: true } },
        sellingPoint: { select: { id: true, name: true, code: true, group: true } },
        approvedBy: { select: { id: true, fullName: true } },
      },
      orderBy: { workDate: "desc" },
    })

    return NextResponse.json({ success: true, data: schedules })
  } catch (error) {
    console.error("Get work schedules error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// POST /api/work-schedule - Create work schedule (register)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    const userBranchId = (session.user as any)?.branchId
    const userId = (session.user as any)?.id

    const body = await request.json()
    const { sellingPointId, workDate, shift, note } = body
    let { employeeId, branchId } = body

    // EMPLOYEE can only register for themselves
    if (userRole === "EMPLOYEE") {
      employeeId = userId
    }

    // BRANCH_DIRECTOR/DEPARTMENT_HEAD can only register for users in their branch
    if (userRole !== "ADMIN" && userRole !== "EMPLOYEE") {
      branchId = userBranchId
    }
    if (!employeeId || !branchId || !sellingPointId || !workDate || !shift) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu thông tin bắt buộc" } },
        { status: 400 }
      )
    }

    // For non-admin, verify target employee is in their branch
    if (userRole !== "ADMIN" && userRole !== "EMPLOYEE") {
      const targetUser = await prisma.user.findUnique({
        where: { id: employeeId },
        select: { branchId: true },
      })
      if (!targetUser || targetUser.branchId !== userBranchId) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Không thể đăng ký cho nhân viên ngoài chi nhánh" } },
          { status: 403 }
        )
      }
    }

    // Check if already registered
    const existing = await prisma.workSchedule.findFirst({
      where: {
        employeeId,
        workDate: new Date(workDate),
        shift,
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "CONFLICT", message: "Đã đăng ký lịch này rồi" } },
        { status: 400 }
      )
    }

    const schedule = await prisma.workSchedule.create({
      data: {
        employeeId,
        branchId,
        sellingPointId,
        workDate: new Date(workDate),
        shift,
        note: note || null,
        status: "PENDING",
      },
    })

    return NextResponse.json({ success: true, data: schedule }, { status: 201 })
  } catch (error) {
    console.error("Create work schedule error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// PUT /api/work-schedule - Update or approve schedule
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    const userBranchId = (session.user as any)?.branchId
    const userId = (session.user as any)?.id

    const body = await request.json()
    const { id, status } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu ID" } },
        { status: 400 }
      )
    }

    // Verify the schedule exists and check branch access
    const existing = await prisma.workSchedule.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy lịch" } },
        { status: 404 }
      )
    }

    // Only ADMIN, BRANCH_DIRECTOR, DEPARTMENT_HEAD can approve
    if (status === "APPROVED" || status === "REJECTED") {
      if (userRole === "EMPLOYEE") {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Không có quyền duyệt lịch" } },
          { status: 403 }
        )
      }
      if (userRole !== "ADMIN" && existing.branchId !== userBranchId) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Không thể duyệt lịch chi nhánh khác" } },
          { status: 403 }
        )
      }
    }

    const schedule = await prisma.workSchedule.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(status === "APPROVED" || status === "REJECTED" ? { approvedById: userId } : {}),
      },
    })

    return NextResponse.json({ success: true, data: schedule })
  } catch (error) {
    console.error("Update work schedule error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// DELETE /api/work-schedule - Cancel schedule
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    const userBranchId = (session.user as any)?.branchId
    const userId = (session.user as any)?.id

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu ID" } },
        { status: 400 }
      )
    }

    const schedule = await prisma.workSchedule.findUnique({ where: { id } })
    if (!schedule) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy lịch" } },
        { status: 404 }
      )
    }

    // Only the owner, ADMIN, or same-branch BRANCH_DIRECTOR/DEPARTMENT_HEAD can cancel
    const isOwner = schedule.employeeId === userId
    const isAdmin = userRole === "ADMIN"
    const isSameBranchManager = (userRole === "BRANCH_DIRECTOR" || userRole === "DEPARTMENT_HEAD") && schedule.branchId === userBranchId

    if (!isOwner && !isAdmin && !isSameBranchManager) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không có quyền hủy lịch này" } },
        { status: 403 }
      )
    }

    // Only allow cancelling PENDING schedules (unless admin)
    if (schedule.status !== "PENDING" && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_STATUS", message: "Chỉ có thể hủy lịch đang chờ duyệt" } },
        { status: 400 }
      )
    }

    await prisma.workSchedule.update({
      where: { id },
      data: { status: "CANCELLED" },
    })

    return NextResponse.json({ success: true, message: "Hủy lịch thành công" })
  } catch (error) {
    console.error("Delete work schedule error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}
