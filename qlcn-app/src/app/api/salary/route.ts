import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET /api/salary
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
    const periodStart = searchParams.get("periodStart")
    const periodEnd = searchParams.get("periodEnd")

    const where: any = {}

    // Role-based filtering
    if (userRole === "EMPLOYEE") {
      // Employee can only see their own salary
      where.employeeId = userId
    } else if (userRole === "DEPARTMENT_HEAD" || userRole === "BRANCH_DIRECTOR") {
      // Manager can only see their branch
      where.branchId = userBranchId
    }
    // ADMIN sees all

    if (branchId) {
      // Non-admin cannot override branch filter
      if (userRole !== "ADMIN" && branchId !== userBranchId) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Không có quyền xem chi nhánh khác" } },
          { status: 403 }
        )
      }
      where.branchId = branchId
    }
    if (employeeId) where.employeeId = employeeId
    if (periodStart && periodEnd) {
      where.periodStart = new Date(periodStart)
      where.periodEnd = new Date(periodEnd)
    }

    const salaries = await prisma.salaryRecord.findMany({
      where,
      include: {
        employee: { select: { id: true, fullName: true, role: true } },
        adjustments: true,
      },
      orderBy: { periodEnd: "desc" },
    })

    return NextResponse.json({ success: true, data: salaries })
  } catch (error) {
    console.error("Get salary error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// POST /api/salary/calculate
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

    // Only ADMIN and BRANCH_DIRECTOR can calculate salary
    if (userRole !== "ADMIN" && userRole !== "BRANCH_DIRECTOR") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không có quyền tính lương" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { periodStart, periodEnd, branchId } = body

    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu kỳ lương" } },
        { status: 400 }
      )
    }

    // BRANCH_DIRECTOR can only calculate their own branch
    const targetBranchId = userRole === "ADMIN" ? branchId : userBranchId

    if (!targetBranchId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu chi nhánh" } },
        { status: 400 }
      )
    }

    // Get all productions in period
    const productions = await prisma.dailyProduction.findMany({
      where: {
        branchId: targetBranchId,
        workDate: {
          gte: new Date(periodStart),
          lte: new Date(periodEnd),
        },
        isApproved: true,
      },
      include: {
        employee: { select: { id: true, fullName: true, branchId: true } },
      },
    })

    // Group by employee
    const employeeData: Record<string, any> = {}
    productions.forEach((p) => {
      const empId = p.employeeId
      if (!employeeData[empId]) {
        employeeData[empId] = {
          employeeId: empId,
          employeeName: p.employee.fullName,
          branchId: p.employee.branchId,
          totalShifts: 0,
          totalQuantity: 0,
          baseSalary: 0,
          bonusAmount: 0,
          commissionAmount: 0,
        }
      }
      employeeData[empId].totalShifts += 1
      employeeData[empId].totalQuantity += p.quantity
      employeeData[empId].baseSalary += Number(p.baseSalary)
      employeeData[empId].bonusAmount += Number(p.bonusAmount)
      employeeData[empId].commissionAmount += Number(p.commissionAmount)
    })

    // Create salary records (upsert to allow re-calculation)
    const salaryRecords = []
    for (const emp of Object.values(employeeData)) {
      const e = emp as any
      const grossSalary = e.baseSalary + e.bonusAmount + e.commissionAmount

      const record = await prisma.salaryRecord.upsert({
        where: {
          employeeId_periodStart_periodEnd: {
            employeeId: e.employeeId,
            periodStart: new Date(periodStart),
            periodEnd: new Date(periodEnd),
          },
        },
        create: {
          employeeId: e.employeeId,
          branchId: e.branchId,
          periodType: "WEEKLY",
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          totalWorkDays: Math.ceil(e.totalShifts / 2),
          totalShifts: e.totalShifts,
          totalQuantity: e.totalQuantity,
          baseSalary: e.baseSalary,
          bonusAmount: e.bonusAmount,
          commissionAmount: e.commissionAmount,
          grossSalary,
          netSalary: grossSalary,
        },
        update: {
          totalWorkDays: Math.ceil(e.totalShifts / 2),
          totalShifts: e.totalShifts,
          totalQuantity: e.totalQuantity,
          baseSalary: e.baseSalary,
          bonusAmount: e.bonusAmount,
          commissionAmount: e.commissionAmount,
          grossSalary,
          netSalary: grossSalary,
        },
      })
      salaryRecords.push(record)
    }

    return NextResponse.json({ success: true, data: salaryRecords }, { status: 201 })
  } catch (error) {
    console.error("Calculate salary error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// PUT /api/salary/:id/approve
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const action = searchParams.get("action") // approve-branch, approve-org, mark-paid

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu ID" } },
        { status: 400 }
      )
    }

    // Verify the salary record and check branch access
    const existing = await prisma.salaryRecord.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy bảng lương" } },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (action === "approve-branch") {
      // BRANCH_DIRECTOR or ADMIN of that branch
      if (userRole !== "ADMIN" && (userRole !== "BRANCH_DIRECTOR" || existing.branchId !== userBranchId)) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Không có quyền duyệt" } },
          { status: 403 }
        )
      }
      updateData.status = "APPROVED_BY_BRANCH"
      updateData.approvedByBranchId = userId
    } else if (action === "approve-org") {
      // Only ADMIN can approve org-level
      if (userRole !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Chỉ Tổng GD mới có quyền duyệt" } },
          { status: 403 }
        )
      }
      updateData.status = "APPROVED_BY_ORG"
      updateData.approvedByOrgId = userId
    } else if (action === "mark-paid") {
      if (userRole !== "ADMIN" && (userRole !== "BRANCH_DIRECTOR" || existing.branchId !== userBranchId)) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Không có quyền đánh dấu đã thanh toán" } },
          { status: 403 }
        )
      }
      updateData.status = "PAID"
    } else {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Action không hợp lệ" } },
        { status: 400 }
      )
    }

    const record = await prisma.salaryRecord.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    console.error("Update salary error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}
