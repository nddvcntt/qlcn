# Task: TASK_008_Salary_Module
## Mô tả
Xây dựng Module Lương & Thưởng.

## Priority: MEDIUM
## Estimated Time: 5-6 hours
## Agent: AGENT_007_Salary
## Dependencies: TASK_001, TASK_002, TASK_003, TASK_007

## Subtasks

### 8.1 Salary API Routes

```typescript
// src/app/api/salary/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac"
import { Decimal } from "@prisma/client/runtime/library"
import { UserRole, SalaryStatus } from "@prisma/client"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get("employeeId")
  const periodStart = searchParams.get("periodStart")
  const periodEnd = searchParams.get("periodEnd")

  // Employees can only see their own salary
  if (session.user.role === UserRole.EMPLOYEE) {
    employeeId = session.user.id
  }

  const where: any = {}
  if (employeeId) where.employeeId = employeeId
  if (periodStart && periodEnd) {
    where.periodStart = { gte: new Date(periodStart) }
    where.periodEnd = { lte: new Date(periodEnd) }
  }
  if (session.user.branchId && session.user.role !== UserRole.ADMIN) {
    where.branchId = session.user.branchId
  }

  const salaries = await prisma.salaryRecord.findMany({
    where,
    include: {
      employee: { select: { fullName: true, departmentId: true } },
      adjustments: true
    },
    orderBy: { periodEnd: "desc" }
  })

  return NextResponse.json({ data: salaries })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!hasPermission(session.user.role, "salary.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { periodStart, periodEnd, branchId } = body

  // Calculate salary for all employees in branch
  const employees = await prisma.user.findMany({
    where: { 
      role: UserRole.EMPLOYEE,
      isActive: true,
      ...(branchId ? { branchId } : {})
    }
  })

  const results = []
  for (const employee of employees) {
    const result = await calculateEmployeeSalary(employee.id, new Date(periodStart), new Date(periodEnd))
    results.push(result)
  }

  return NextResponse.json({ data: results })
}

async function calculateEmployeeSalary(employeeId: string, periodStart: Date, periodEnd: Date) {
  // Get all approved productions in period
  const productions = await prisma.dailyProduction.findMany({
    where: {
      employeeId,
      productionDate: { gte: periodStart, lte: periodEnd },
      isApproved: true
    }
  })

  // Calculate production salary
  let totalProductionSalary = new Decimal(0)
  for (const p of productions) {
    totalProductionSalary = totalProductionSalary.add(p.totalSalary)
  }

  // Get adjustments
  const adjustments = await prisma.salaryAdjustment.groupBy({
    by: ["type"],
    where: {
      salaryRecord: {
        employeeId,
        periodStart,
        periodEnd
      }
    },
    _sum: { amount: true }
  })

  let allowances = new Decimal(0)
  let bonuses = new Decimal(0)
  let deductions = new Decimal(0)

  for (const adj of adjustments) {
    const amount = new Decimal(adj._sum.amount || 0)
    if (adj.type === "ALLOWANCE") allowances = allowances.add(amount)
    if (adj.type === "BONUS") bonuses = bonuses.add(amount)
    if (adj.type === "DEDUCTION") deductions = deductions.add(amount)
    if (adj.type === "ADJUSTMENT") deductions = deductions.add(amount)
  }

  // Calculate gross and net salary
  const grossSalary = totalProductionSalary.add(allowances).add(bonuses).sub(deductions)
  
  // Get advance amount
  const advances = await prisma.salaryAdjustment.findMany({
    where: {
      type: "ALLOWANCE", // Using ALLOWANCE for advances
      reason: { contains: "Tạm ứng" },
      salaryRecord: {
        employeeId,
        periodStart,
        periodEnd
      }
    }
  })
  const advanceAmount = advances.reduce((sum, a) => sum + Number(a.amount), 0)
  
  const netSalary = grossSalary.sub(advanceAmount)

  // Create or update salary record
  const employee = await prisma.user.findUnique({ where: { id: employeeId } })
  
  const salary = await prisma.salaryRecord.upsert({
    where: {
      employeeId_periodStart_periodEnd: { employeeId, periodStart, periodEnd }
    },
    create: {
      employeeId,
      branchId: employee!.branchId!,
      periodType: "WEEKLY",
      periodStart,
      periodEnd,
      totalProductionSalary,
      allowances,
      bonuses,
      deductions,
      advanceAmount,
      grossSalary,
      netSalary
    },
    update: {
      totalProductionSalary,
      allowances,
      bonuses,
      deductions,
      advanceAmount,
      grossSalary,
      netSalary
    }
  })

  return salary
}
```

### 8.2 Salary Approval API

```typescript
// src/app/api/salary/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac"
import { UserRole } from "@prisma/client"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const level = searchParams.get("level") // "branch" or "org"

  const salary = await prisma.salaryRecord.findUnique({
    where: { id: params.id }
  })

  if (!salary) {
    return NextResponse.json({ error: "Không tìm thấy bản ghi lương" }, { status: 404 })
  }

  if (level === "branch") {
    if (!hasPermission(session.user.role, "salary.write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const updated = await prisma.salaryRecord.update({
      where: { id: params.id },
      data: {
        status: "APPROVED_BY_BRANCH",
        approvedByBranchId: session.user.id
      }
    })
    return NextResponse.json({ data: updated })
  }

  if (level === "org") {
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const updated = await prisma.salaryRecord.update({
      where: { id: params.id },
      data: {
        status: "APPROVED_BY_ORG",
        approvedByOrgId: session.user.id
      }
    })
    return NextResponse.json({ data: updated })
  }

  return NextResponse.json({ error: "Invalid approval level" }, { status: 400 })
}
```

### 8.3 Salary Adjustment API

```typescript
// src/app/api/salary/[id]/adjust/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac"
import { AdjustmentType } from "@prisma/client"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!hasPermission(session.user.role, "salary.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { type, amount, reason } = body

  const adjustment = await prisma.salaryAdjustment.create({
    data: {
      salaryRecordId: params.id,
      type: type as AdjustmentType,
      amount,
      reason,
      createdById: session.user.id
    }
  })

  // Recalculate salary
  await recalculateSalary(params.id)

  return NextResponse.json({ data: adjustment }, { status: 201 })
}

async function recalculateSalary(salaryId: string) {
  const salary = await prisma.salaryRecord.findUnique({
    where: { id: salaryId },
    include: { adjustments: true }
  })

  if (!salary) return

  let allowances = 0, bonuses = 0, deductions = 0
  
  for (const adj of salary.adjustments) {
    if (adj.type === "ALLOWANCE") allowances += Number(adj.amount)
    if (adj.type === "BONUS") bonuses += Number(adj.amount)
    if (adj.type === "DEDUCTION" || adj.type === "ADJUSTMENT") deductions += Number(adj.amount)
  }

  const grossSalary = Number(salary.totalProductionSalary) + allowances + bonuses - deductions
  const netSalary = grossSalary - Number(salary.advanceAmount)

  await prisma.salaryRecord.update({
    where: { id: salaryId },
    data: { allowances, bonuses, deductions, grossSalary, netSalary }
  })
}
```

## Deliverables
- [ ] Salary API (GET, POST for calculation)
- [ ] Approval workflow (2 levels)
- [ ] Salary adjustments
- [ ] Salary list page
- [ ] Salary detail page
- [ ] Payslip view
- [ ] Auto-calculation from production data

## Verification
- [ ] Salary auto-calculates from production
- [ ] 2-level approval works
- [ ] Adjustments update salary correctly
- [ ] Employees see only their own salary

## Notes
- Salary = Production Salary + Allowances + Bonuses - Deductions - Advance
- 2-level approval: Branch Director → Organization Admin
- Auto-recalculate on adjustments
