import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/work-schedule - Get work schedules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")
    const employeeId = searchParams.get("employeeId")
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const where: any = {}
    if (branchId) where.branchId = branchId
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
    const body = await request.json()
    const { employeeId, branchId, sellingPointId, workDate, shift, note } = body

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
    const body = await request.json()
    const { id, status, approvedById } = body

    const schedule = await prisma.workSchedule.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(approvedById && { approvedById }),
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu ID" } },
        { status: 400 }
      )
    }

    // Only allow cancelling PENDING schedules
    const schedule = await prisma.workSchedule.findUnique({ where: { id } })
    if (!schedule) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy lịch" } },
        { status: 404 }
      )
    }

    if (schedule.status !== "PENDING") {
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
