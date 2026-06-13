# Task: TASK_009_Cost_Module
## Mô tả
Xây dựng Module Chi Phí.

## Priority: MEDIUM
## Estimated Time: 4-5 hours
## Agent: AGENT_008_Cost
## Dependencies: TASK_001, TASK_002, TASK_003

## Subtasks

### 9.1 Cost API Routes

```typescript
// src/app/api/costs/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac"
import { Decimal } from "@prisma/client/runtime/library"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!hasPermission(session.user.role, "costs.read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const branchId = searchParams.get("branchId")
  const categoryId = searchParams.get("categoryId")
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  const where: any = {}
  if (branchId) where.branchId = branchId
  else if (session.user.branchId) where.branchId = session.user.branchId
  if (categoryId) where.categoryId = categoryId
  if (dateFrom) where.costDate = { ...where.costDate, gte: new Date(dateFrom) }
  if (dateTo) where.costDate = { ...where.costDate, lte: new Date(dateTo) }

  const costs = await prisma.costRecord.findMany({
    where,
    include: {
      category: true,
      createdBy: { select: { fullName: true } }
    },
    orderBy: { costDate: "desc" }
  })

  return NextResponse.json({ data: costs })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!hasPermission(session.user.role, "costs.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { branchId, categoryId, costDate, quantity, unitPrice, note } = body

  const totalAmount = new Decimal(quantity).mul(unitPrice)

  const cost = await prisma.costRecord.create({
    data: {
      branchId,
      categoryId,
      costDate: new Date(costDate),
      quantity,
      unitPrice,
      totalAmount,
      note,
      createdById: session.user.id
    },
    include: { category: true }
  })

  return NextResponse.json({ data: cost }, { status: 201 })
}
```

### 9.2 Cost Categories API

```typescript
// src/app/api/cost-categories/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const categories = await prisma.costCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  })

  return NextResponse.json({ data: categories })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!hasPermission(session.user.role, "costs.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { name, type, unit, defaultUnitPrice } = body

  const category = await prisma.costCategory.create({
    data: { name, type, unit, defaultUnitPrice, isActive: true }
  })

  return NextResponse.json({ data: category }, { status: 201 })
}
```

### 9.3 Cost Page UI

```typescript
// src/app/(dashboard)/chi-phi/page.tsx
"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CostDialog } from "./cost-dialog"

async function fetchCosts(params: string) {
  const res = await fetch(`/api/costs${params}`)
  return res.json()
}

async function fetchCategories() {
  const res = await fetch("/api/cost-categories")
  return res.json()
}

export default function CostPage() {
  const [filters, setFilters] = useState({ categoryId: "", dateFrom: "", dateTo: "" })
  const [dialogOpen, setDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const queryParams = new URLSearchParams(filters).toString()
  const { data, isLoading } = useQuery({
    queryKey: ["costs", queryParams],
    queryFn: () => fetchCosts(queryParams ? `?${queryParams}` : "")
  })

  const { data: categoriesData } = useQuery({
    queryKey: ["cost-categories"],
    queryFn: fetchCategories
  })

  const costs = data?.data || []
  const categories = categoriesData?.data || []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN")
  }

  // Calculate totals by category
  const totalsByCategory = costs.reduce((acc: any, cost: any) => {
    const catName = cost.category?.name || "Khác"
    acc[catName] = (acc[catName] || 0) + Number(cost.totalAmount)
    return acc
  }, {})

  const totalAmount = costs.reduce((sum: number, cost: any) => sum + Number(cost.totalAmount), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Chi Phí</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm chi phí
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-primary-light">Tổng chi phí</p>
            <p className="text-2xl font-bold font-mono text-danger">
              {formatCurrency(totalAmount)}
            </p>
          </CardContent>
        </Card>
        {Object.entries(totalsByCategory).slice(0, 2).map(([cat, amount]) => (
          <Card key={cat}>
            <CardContent className="p-4">
              <p className="text-sm text-primary-light">{cat}</p>
              <p className="text-xl font-bold font-mono text-primary">
                {formatCurrency(amount as number)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Select onValueChange={(v) => setFilters({ ...filters, categoryId: v })}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input 
              type="date" 
              className="w-[150px]"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
            <span className="self-center text-primary-light">-</span>
            <Input 
              type="date" 
              className="w-[150px]"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cost List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-3 text-left">Ngày</th>
                <th className="p-3 text-left">Danh mục</th>
                <th className="p-3 text-left">Loại</th>
                <th className="p-3 text-right">Số lượng</th>
                <th className="p-3 text-right">Đơn giá</th>
                <th className="p-3 text-right">Thành tiền</th>
                <th className="p-3 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {costs.map((cost: any) => (
                <tr key={cost.id} className="border-b border-border hover:bg-secondary-light/30">
                  <td className="p-3">{formatDate(cost.costDate)}</td>
                  <td className="p-3">{cost.category?.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      cost.category?.type === "FIXED" 
                        ? "bg-primary-light/20 text-primary" 
                        : "bg-secondary text-primary-dark"
                    }`}>
                      {cost.category?.type === "FIXED" ? "Cố định" : "Biến đổi"}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">{cost.quantity} {cost.category?.unit}</td>
                  <td className="p-3 text-right font-mono">{formatCurrency(cost.unitPrice)}</td>
                  <td className="p-3 text-right font-mono text-danger">{formatCurrency(cost.totalAmount)}</td>
                  <td className="p-3 text-primary-light">{cost.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <CostDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        categories={categories}
      />
    </div>
  )
}
```

## Deliverables
- [ ] Cost API (CRUD)
- [ ] Cost Categories API
- [ ] Cost page with filters
- [ ] Cost dialog for adding
- [ ] Summary by category
- [ ] Permission checks

## Verification
- [ ] Costs can be added and listed
- [ ] Totals calculated correctly
- [ ] Permissions enforced
- [ ] Branch isolation works

## Notes
- Cost types: FIXED, VARIABLE
- Variable costs tied to production
- Summary by category
