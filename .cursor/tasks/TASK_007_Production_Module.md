# Task: TASK_007_Production_Module
## Mô tả
Xây dựng Module Năng Suất Lao Động.

## Priority: HIGH
## Estimated Time: 5-6 hours
## Agent: AGENT_006_Production
## Dependencies: TASK_001, TASK_002, TASK_003

## Subtasks

### 7.1 Production API Routes

```typescript
// src/app/api/production/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac"
import { Decimal } from "@prisma/client/runtime/library"
import { UserRole } from "@prisma/client"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get("employeeId")
  const branchId = searchParams.get("branchId")
  const sellingPointId = searchParams.get("sellingPointId")
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  // Employee can only see their own data
  if (session.user.role === UserRole.EMPLOYEE) {
    employeeId = session.user.id
  }

  const where: any = {}
  if (employeeId) where.employeeId = employeeId
  if (sellingPointId) where.sellingPointId = sellingPointId
  if (branchId) where.branchId = branchId
  if (dateFrom) where.productionDate = { ...where.productionDate, gte: new Date(dateFrom) }
  if (dateTo) where.productionDate = { ...where.productionDate, lte: new Date(dateTo) }

  // If not admin or branch director, only show their department's data
  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.BRANCH_DIRECTOR) {
    if (session.user.departmentId) {
      const deptEmployees = await prisma.user.findMany({
        where: { departmentId: session.user.departmentId },
        select: { id: true }
      })
      where.employeeId = { in: deptEmployees.map(e => e.id) }
    }
  }

  const productions = await prisma.dailyProduction.findMany({
    where,
    include: {
      employee: { select: { fullName: true, departmentId: true } },
      sellingPoint: { select: { name: true, code: true } }
    },
    orderBy: { productionDate: "desc" }
  })

  return NextResponse.json({ data: productions })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  if (!hasPermission(session.user.role, "production.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { employeeId, sellingPointId, productionDate, shift, quantity, salaryPerUnit, note } = body

  // Calculate total salary
  const totalSalary = new Decimal(quantity).mul(salaryPerUnit)

  const production = await prisma.dailyProduction.create({
    data: {
      employeeId,
      sellingPointId,
      productionDate: new Date(productionDate),
      shift,
      quantity,
      salaryPerUnit,
      totalSalary,
      note,
      branchId: session.user.branchId || body.branchId
    },
    include: {
      employee: { select: { fullName: true } },
      sellingPoint: { select: { name: true } }
    }
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE",
      resource: "DailyProduction",
      resourceId: production.id
    }
  })

  return NextResponse.json({ data: production }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { ids, approved } = body

  if (!hasPermission(session.user.role, "production.approve")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const updated = await prisma.dailyProduction.updateMany({
    where: { id: { in: ids } },
    data: {
      isApproved: approved,
      approvedById: approved ? session.user.id : null
    }
  })

  return NextResponse.json({ data: { count: updated.count } })
}
```

### 7.2 Production Summary API

```typescript
// src/app/api/production/summary/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const branchId = searchParams.get("branchId") || session.user.branchId
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  const where: any = { branchId }
  if (dateFrom) where.productionDate = { ...where.productionDate, gte: new Date(dateFrom) }
  if (dateTo) where.productionDate = { ...where.productionDate, lte: new Date(dateTo) }

  // Aggregate by employee
  const byEmployee = await prisma.dailyProduction.groupBy({
    by: ["employeeId"],
    where,
    _sum: { quantity: true, totalSalary: true },
    _count: true
  })

  // Get employee details
  const employeeIds = byEmployee.map(e => e.employeeId)
  const employees = await prisma.user.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, fullName: true, departmentId: true }
  })

  // Combine data
  const employeeSummary = byEmployee.map(e => {
    const employee = employees.find(emp => emp.id === e.employeeId)
    return {
      employeeId: e.employeeId,
      fullName: employee?.fullName,
      departmentId: employee?.departmentId,
      totalQuantity: e._sum.quantity || 0,
      totalSalary: e._sum.totalSalary || 0,
      workDays: e._count
    }
  })

  // Aggregate by selling point
  const bySellingPoint = await prisma.dailyProduction.groupBy({
    by: ["sellingPointId"],
    where,
    _sum: { quantity: true, totalSalary: true },
    _count: true
  })

  const spIds = bySellingPoint.map(s => s.sellingPointId)
  const sellingPoints = await prisma.sellingPoint.findMany({
    where: { id: { in: spIds } },
    select: { id: true, name: true, code: true }
  })

  const sellingPointSummary = bySellingPoint.map(s => {
    const sp = sellingPoints.find(p => p.id === s.sellingPointId)
    return {
      sellingPointId: s.sellingPointId,
      name: sp?.name,
      code: sp?.code,
      totalQuantity: s._sum.quantity || 0,
      totalSalary: s._sum.totalSalary || 0,
      workDays: s._count
    }
  })

  // Aggregate by shift
  const byShift = await prisma.dailyProduction.groupBy({
    by: ["shift"],
    where,
    _sum: { quantity: true, totalSalary: true },
    _count: true
  })

  return NextResponse.json({
    data: {
      byEmployee: employeeSummary,
      bySellingPoint: sellingPointSummary,
      byShift: byShift.map(s => ({
        shift: s.shift,
        totalQuantity: s._sum.quantity || 0,
        totalSalary: s._sum.totalSalary || 0,
        workDays: s._count
      })),
      totals: {
        quantity: byEmployee.reduce((sum, e) => sum + (e._sum.quantity || 0), 0),
        salary: byEmployee.reduce((sum, e) => sum + Number(e._sum.totalSalary || 0), 0),
        days: byEmployee.reduce((sum, e) => sum + e._count, 0)
      }
    }
  })
}
```

### 7.3 Production Page UI

```typescript
// src/app/(dashboard)/nang-suat/page.tsx
"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Check, X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductionDialog } from "./production-dialog"

async function fetchProductions(params: string) {
  const res = await fetch(`/api/production${params}`)
  return res.json()
}

async function fetchSummary(params: string) {
  const res = await fetch(`/api/production/summary${params}`)
  return res.json()
}

async function fetchEmployees() {
  const res = await fetch("/api/users?role=EMPLOYEE")
  return res.json()
}

async function fetchSellingPoints() {
  const res = await fetch("/api/selling-points")
  return res.json()
}

export default function ProductionPage() {
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "" })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const queryClient = useQueryClient()

  const queryParams = new URLSearchParams(filters).toString()
  const { data, isLoading } = useQuery({
    queryKey: ["production", queryParams],
    queryFn: () => fetchProductions(queryParams ? `?${queryParams}` : "")
  })

  const { data: summaryData } = useQuery({
    queryKey: ["production-summary", queryParams],
    queryFn: () => fetchSummary(queryParams ? `?${queryParams}` : "")
  })

  const approveMutation = useMutation({
    mutationFn: async ({ ids, approved }: { ids: string[], approved: boolean }) => {
      const res = await fetch("/api/production", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, approved })
      })
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["production"] })
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN")
  }

  const productions = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Năng Suất Lao Động</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nhập năng suất
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-primary-light">Tổng sản lượng</p>
            <p className="text-2xl font-bold font-mono text-primary">
              {summaryData?.data?.totals?.quantity || 0} nắm
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-primary-light">Tổng lương</p>
            <p className="text-2xl font-bold font-mono text-success">
              {formatCurrency(summaryData?.data?.totals?.salary || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-primary-light">Ca Sáng</p>
            <p className="text-2xl font-bold font-mono text-primary">
              {summaryData?.data?.byShift?.find((s: any) => s.shift === "SANG")?.totalQuantity || 0} nắm
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-primary-light">Ca Chiều</p>
            <p className="text-2xl font-bold font-mono text-primary">
              {summaryData?.data?.byShift?.find((s: any) => s.shift === "CHIEU")?.totalQuantity || 0} nắm
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Input 
              type="date" 
              className="w-[150px]"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
            <span className="text-primary-light">-</span>
            <Input 
              type="date" 
              className="w-[150px]"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
            <div className="flex-1"></div>
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => approveMutation.mutate({ ids: selectedIds, approved: true })}
                >
                  <Check className="h-4 w-4 mr-1" /> Duyệt ({selectedIds.length})
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => approveMutation.mutate({ ids: selectedIds, approved: false })}
                >
                  <X className="h-4 w-4 mr-1" /> Từ chối
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Production List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-3 w-[40px]">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(productions.filter((p: any) => !p.isApproved).map((p: any) => p.id))
                      } else {
                        setSelectedIds([])
                      }
                    }}
                  />
                </th>
                <th className="p-3 text-left">Ngày</th>
                <th className="p-3 text-left">Nhân viên</th>
                <th className="p-3 text-left">Ca</th>
                <th className="p-3 text-left">Điểm bán</th>
                <th className="p-3 text-right">Số nắm</th>
                <th className="p-3 text-right">Lương/nắm</th>
                <th className="p-3 text-right">Tổng lương</th>
                <th className="p-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {productions.map((p: any) => (
                <tr key={p.id} className="border-b border-border hover:bg-secondary-light/30">
                  <td className="p-3">
                    {!p.isApproved && (
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, p.id])
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== p.id))
                          }
                        }}
                      />
                    )}
                  </td>
                  <td className="p-3">{formatDate(p.productionDate)}</td>
                  <td className="p-3">{p.employee?.fullName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.shift === "SANG" ? "bg-secondary-light text-primary" : "bg-primary-light/20 text-primary"
                    }`}>
                      {p.shift === "SANG" ? "Sáng" : "Chiều"}
                    </span>
                  </td>
                  <td className="p-3">{p.sellingPoint?.name}</td>
                  <td className="p-3 text-right font-mono">{p.quantity}</td>
                  <td className="p-3 text-right font-mono">{formatCurrency(p.salaryPerUnit)}</td>
                  <td className="p-3 text-right font-mono text-success">{formatCurrency(p.totalSalary)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.isApproved ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}>
                      {p.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ProductionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
```

## Deliverables
- [ ] Production API (CRUD + summary)
- [ ] Batch approval
- [ ] Production page
- [ ] Summary cards
- [ ] Filter by date/employee/selling point
- [ ] Permission-based data access

## Verification
- [ ] Employees see only their data
- [ ] Managers see their department data
- [ ] Admins see all data
- [ ] Approval workflow works

## Notes
- Shift types: SANG, CHIEU
- Salary per unit varies by shift and selling point
- Auto-calculate total salary
