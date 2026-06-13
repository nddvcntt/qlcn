import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/salary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")
    const employeeId = searchParams.get("employeeId")
    const periodStart = searchParams.get("periodStart")
    const periodEnd = searchParams.get("periodEnd")

    const where: any = {}
    if (branchId) where.branchId = branchId
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
    const body = await request.json()
    const { periodStart, periodEnd, branchId } = body

    // Get all productions in period
    const productions = await prisma.dailyProduction.findMany({
      where: {
        branchId: branchId || undefined,
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

    // Create salary records
    const salaryRecords = []
    for (const emp of Object.values(employeeData)) {
      const e = emp as any
      const grossSalary = e.baseSalary + e.bonusAmount + e.commissionAmount

      const record = await prisma.salaryRecord.create({
        data: {
          employeeId: e.employeeId,
          branchId: e.branchId,
          periodType: "WEEKLY",
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          totalWorkDays: Math.ceil(e.totalShifts / 2), // Approximate
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const action = searchParams.get("action") // approve-branch, approve-org, mark-paid

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu ID" } },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (action === "approve-branch") {
      updateData.status = "APPROVED_BY_BRANCH"
      updateData.approvedByBranchId = "current-user-id"
    } else if (action === "approve-org") {
      updateData.status = "APPROVED_BY_ORG"
      updateData.approvedByOrgId = "current-user-id"
    } else if (action === "mark-paid") {
      updateData.status = "PAID"
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
