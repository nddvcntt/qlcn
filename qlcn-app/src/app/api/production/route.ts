import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { successResponse, errorResponse, badRequestResponse } from "@/lib/api-response"
import { productionCreateSchema, validateBody } from "@/lib/validations"
import { calculateEmployeeDailySalary, calculateComNamBonus } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const skip = (page - 1) * limit
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const employeeId = searchParams.get("employeeId")

    const userRole = (session.user as any)?.role
    const userBranchId = (session.user as any)?.branchId

    // Build where clause
    const where: any = {}

    // Role-based filtering
    if (userRole === "ADMIN") {
      // Admin can see all
    } else if (userRole === "BRANCH_DIRECTOR" || userRole === "DEPARTMENT_HEAD") {
      where.branchId = userBranchId
    } else {
      // Employee can only see their own
      where.employeeId = (session.user as any)?.id
    }

    if (employeeId) {
      where.employeeId = employeeId
    }

    if (startDate) {
      where.workDate = { ...where.workDate, gte: new Date(startDate) }
    }

    if (endDate) {
      where.workDate = { ...where.workDate, lte: new Date(endDate) }
    }

    // Get total count
    const total = await prisma.dailyProduction.count({ where })

    // Get productions
    const productions = await prisma.dailyProduction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { workDate: "desc" },
      include: {
        employee: { select: { id: true, fullName: true, role: true } },
        sellingPoint: { select: { id: true, name: true, code: true, group: true } },
      },
    })

    // Calculate totals
    const totals = await prisma.dailyProduction.aggregate({
      where,
      _sum: {
        quantity: true,
        baseSalary: true,
        bonusAmount: true,
        commissionAmount: true,
        totalSalary: true,
      },
      _count: true,
    })

    return NextResponse.json({
      success: true,
      data: productions,
      totals: {
        quantity: totals._sum.quantity || 0,
        baseSalary: totals._sum.baseSalary || 0,
        bonusAmount: totals._sum.bonusAmount || 0,
        commissionAmount: totals._sum.commissionAmount || 0,
        totalSalary: totals._sum.totalSalary || 0,
      },
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching productions:", error)
    return NextResponse.json(errorResponse("Lỗi khi lấy danh sách năng suất"), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validation = validateBody(productionCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        badRequestResponse("Dữ liệu không hợp lệ", validation.errors),
        { status: 400 }
      )
    }

    const { employeeId, sellingPointId, workDate, shift, quantity, note } = validation.data
    const userRole = (session.user as any)?.role
    const userBranchId = (session.user as any)?.branchId

    // Check permission
    if (userRole === "EMPLOYEE" && (session.user as any)?.id !== employeeId) {
      return NextResponse.json(
        { success: false, error: "Không có quyền nhập năng suất cho người khác" },
        { status: 403 }
      )
    }

    // Get employee start date
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { id: true, fullName: true, startDate: true, branchId: true },
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy nhân viên" },
        { status: 404 }
      )
    }

    // Get selling point info
    const sellingPoint = await prisma.sellingPoint.findUnique({
      where: { id: sellingPointId },
    })

    if (!sellingPoint) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy điểm bán" },
        { status: 404 }
      )
    }

    const workDateObj = new Date(workDate)
    const startDate = employee.startDate ? new Date(employee.startDate) : workDateObj

    // Calculate salary based on day of work
    const { status: employeeStatus, baseSalary } = calculateEmployeeDailySalary(
      startDate,
      workDateObj,
      Number(sellingPoint.salaryPerShift)
    )

    // Calculate bonus (500đ/suất nếu >= 50)
    // Nếu ca này có ExportOrderItem với discount > 0 → loại khỏi thưởng
    const dayStart = new Date(workDateObj)
    dayStart.setUTCHours(0, 0, 0, 0)
    const dayEnd = new Date(workDateObj)
    dayEnd.setUTCHours(23, 59, 59, 999)
    const hasDiscount = await prisma.exportOrderItem.findFirst({
      where: {
        discountAmount: { gt: 0 },
        exportOrder: {
          branchId: employee.branchId || userBranchId,
          sellingPointId,
          exportDate: { gte: dayStart, lte: dayEnd },
          status: { in: ["APPROVED", "DRAFT"] },
        },
      },
      select: { id: true },
    })
    const excludedFromBonus = !!hasDiscount
    const bonusAmount = excludedFromBonus ? 0 : calculateComNamBonus(quantity)

    // Total salary = base salary + bonus
    const totalSalary = baseSalary + bonusAmount

    // Lookup shift by code
    const shiftRecord = await prisma.shift.findFirst({ where: { code: shift } })
    if (!shiftRecord) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy ca làm việc: ${shift}` },
        { status: 400 }
      )
    }

    const production = await prisma.dailyProduction.create({
      data: {
        employeeId,
        branchId: employee.branchId || userBranchId,
        sellingPointId,
        workDate: workDateObj,
        shiftId: shiftRecord.id,
        shiftCode: shift,
        quantity,
        employeeStatus,
        baseSalary,
        bonusAmount,
        commissionAmount: 0,
        excludedFromBonus,
        totalSalary,
        note,
      },
      include: {
        employee: { select: { id: true, fullName: true } },
        sellingPoint: { select: { id: true, name: true, code: true } },
      },
    })

    return NextResponse.json(successResponse(production), { status: 201 })
  } catch (error) {
    console.error("Error creating production:", error)
    return NextResponse.json(errorResponse("Lỗi khi tạo năng suất"), { status: 500 })
  }
}
