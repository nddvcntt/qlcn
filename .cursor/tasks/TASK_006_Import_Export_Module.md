# Task: TASK_006_Import_Export_Module
## Mô tả
Xây dựng Module Nhập Hàng và Module Xuất Hàng.

## Priority: HIGH
## Estimated Time: 6-8 hours
## Agent: AGENT_004_Import_Export
## Dependencies: TASK_001, TASK_002, TASK_003, TASK_005

## Subtasks

### 6.1 Import Order API Routes

```typescript
// src/app/api/import-orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission, canAccessBranch } from "@/lib/rbac"
import { Decimal } from "@prisma/client/runtime/library"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  if (!hasPermission(session.user.role, "import.read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const branchId = searchParams.get("branchId")
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  if (branchId && !canAccessBranch(session.user.role, session.user.branchId, branchId)) {
    return NextResponse.json({ error: "Branch access denied" }, { status: 403 })
  }

  const where: any = {}
  if (branchId) where.branchId = branchId
  else if (session.user.branchId) where.branchId = session.user.branchId

  if (dateFrom) where.importDate = { ...where.importDate, gte: new Date(dateFrom) }
  if (dateTo) where.importDate = { ...where.importDate, lte: new Date(dateTo) }

  const orders = await prisma.importOrder.findMany({
    where,
    include: {
      items: { include: { product: true } },
      createdBy: { select: { fullName: true } }
    },
    orderBy: { importDate: "desc" }
  })

  return NextResponse.json({ data: orders })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  if (!hasPermission(session.user.role, "import.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { branchId, importDate, items, note } = body

  // Validate branch access
  if (!canAccessBranch(session.user.role, session.user.branchId, branchId)) {
    return NextResponse.json({ error: "Branch access denied" }, { status: 403 })
  }

  // Calculate total amount
  let totalAmount = new Decimal(0)
  for (const item of items) {
    const amount = new Decimal(item.quantity).mul(item.unitPrice || item.costPrice)
    totalAmount = totalAmount.add(amount)
  }

  // Create order with items
  const order = await prisma.importOrder.create({
    data: {
      branchId,
      importDate: new Date(importDate),
      totalAmount,
      note,
      createdById: session.user.id,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          giftedQuantity: item.giftedQuantity || 0,
          unitPrice: item.unitPrice || item.costPrice,
          totalAmount: new Decimal(item.quantity).mul(item.unitPrice || item.costPrice)
        }))
      }
    },
    include: { items: { include: { product: true } } }
  })

  // Update inventory
  for (const item of items) {
    await updateInventory(branchId, item.productId, new Date(importDate), item.quantity, item.giftedQuantity || 0)
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE",
      resource: "ImportOrder",
      resourceId: order.id,
      newValue: { totalAmount: totalAmount.toNumber(), itemCount: items.length }
    }
  })

  return NextResponse.json({ data: order }, { status: 201 })
}

async function updateInventory(
  branchId: string,
  productId: string,
  date: Date,
  importQty: number,
  giftedQty: number
) {
  const existing = await prisma.inventory.findUnique({
    where: {
      branchId_productId_date: { branchId, productId, date }
    }
  })

  if (existing) {
    await prisma.inventory.update({
      where: { id: existing.id },
      data: {
        importQuantity: existing.importQuantity + importQty,
        giftedQuantity: existing.giftedQuantity + giftedQty,
        closingStock: existing.openingStock + existing.importQuantity + importQty + giftedQty - existing.exportQuantity - existing.giftedQuantity
      }
    })
  } else {
    // Get previous closing stock
    const prevDay = new Date(date)
    prevDay.setDate(prevDay.getDate() - 1)
    
    const prevInventory = await prisma.inventory.findFirst({
      where: { branchId, productId, date: { lte: prevDay } },
      orderBy: { date: "desc" }
    })

    const openingStock = prevInventory?.closingStock || 0

    await prisma.inventory.create({
      data: {
        branchId,
        productId,
        date,
        openingStock,
        importQuantity: importQty,
        giftedQuantity: giftedQty,
        closingStock: openingStock + importQty + giftedQty
      }
    })
  }
}
```

### 6.2 Export Order API Routes

```typescript
// src/app/api/export-orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission, canAccessBranch } from "@/lib/rbac"
import { Decimal } from "@prisma/client/runtime/library"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  if (!hasPermission(session.user.role, "export.read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const branchId = searchParams.get("branchId")
  const sellingPointId = searchParams.get("sellingPointId")
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  if (branchId && !canAccessBranch(session.user.role, session.user.branchId, branchId)) {
    return NextResponse.json({ error: "Branch access denied" }, { status: 403 })
  }

  const where: any = {}
  if (branchId) where.branchId = branchId
  else if (session.user.branchId) where.branchId = session.user.branchId
  if (sellingPointId) where.sellingPointId = sellingPointId
  if (dateFrom) where.exportDate = { ...where.exportDate, gte: new Date(dateFrom) }
  if (dateTo) where.exportDate = { ...where.exportDate, lte: new Date(dateTo) }

  const orders = await prisma.exportOrder.findMany({
    where,
    include: {
      items: { include: { product: true } },
      sellingPoint: true,
      createdBy: { select: { fullName: true } }
    },
    orderBy: { exportDate: "desc" }
  })

  return NextResponse.json({ data: orders })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  if (!hasPermission(session.user.role, "export.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { branchId, sellingPointId, exportDate, items, note } = body

  if (!canAccessBranch(session.user.role, session.user.branchId, branchId)) {
    return NextResponse.json({ error: "Branch access denied" }, { status: 403 })
  }

  // Calculate total revenue
  let totalRevenue = new Decimal(0)
  for (const item of items) {
    const revenue = new Decimal(item.quantity).mul(item.unitPrice || item.sellingPrice)
    totalRevenue = totalRevenue.add(revenue)
  }

  // Create order
  const order = await prisma.exportOrder.create({
    data: {
      branchId,
      sellingPointId,
      exportDate: new Date(exportDate),
      totalRevenue,
      note,
      createdById: session.user.id,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          giftedQuantity: item.giftedQuantity || 0,
          unitPrice: item.unitPrice || item.sellingPrice,
          totalAmount: new Decimal(item.quantity).mul(item.unitPrice || item.sellingPrice)
        }))
      }
    },
    include: { items: { include: { product: true } } }
  })

  // Update inventory (negative)
  for (const item of items) {
    await updateExportInventory(branchId, item.productId, new Date(exportDate), item.quantity, item.giftedQuantity || 0)
  }

  return NextResponse.json({ data: order }, { status: 201 })
}

async function updateExportInventory(
  branchId: string,
  productId: string,
  date: Date,
  exportQty: number,
  giftedQty: number
) {
  const existing = await prisma.inventory.findUnique({
    where: {
      branchId_productId_date: { branchId, productId, date }
    }
  })

  if (existing) {
    await prisma.inventory.update({
      where: { id: existing.id },
      data: {
        exportQuantity: existing.exportQuantity + exportQty,
        giftedQuantity: existing.giftedQuantity + giftedQty,
        closingStock: existing.openingStock + existing.importQuantity - existing.exportQuantity - exportQty - existing.giftedQuantity - giftedQty
      }
    })
  } else {
    // Get previous closing stock
    const prevDay = new Date(date)
    prevDay.setDate(prevDay.getDate() - 1)
    
    const prevInventory = await prisma.inventory.findFirst({
      where: { branchId, productId, date: { lte: prevDay } },
      orderBy: { date: "desc" }
    })

    const openingStock = prevInventory?.closingStock || 0

    await prisma.inventory.create({
      data: {
        branchId,
        productId,
        date,
        openingStock,
        exportQuantity: exportQty,
        giftedQuantity: giftedQty,
        closingStock: openingStock - exportQty - giftedQty
      }
    })
  }
}
```

### 6.3 Import Page UI
```typescript
// src/app/(dashboard)/nhap-hang/page.tsx
"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Plus, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImportOrderDialog } from "./import-order-dialog"

async function fetchImportOrders(params: string) {
  const res = await fetch(`/api/import-orders${params}`)
  return res.json()
}

async function fetchProducts() {
  const res = await fetch("/api/products")
  return res.json()
}

async function fetchBranches() {
  const res = await fetch("/api/branches")
  return res.json()
}

export default function ImportOrdersPage() {
  const [filters, setFilters] = useState({ branchId: "", dateFrom: "", dateTo: "" })
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const queryParams = new URLSearchParams(filters).toString()
  const { data, isLoading } = useQuery({
    queryKey: ["import-orders", queryParams],
    queryFn: () => fetchImportOrders(queryParams ? `?${queryParams}` : "")
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Nhập Hàng</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo phiếu nhập
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Select onValueChange={(v) => setFilters({ ...filters, branchId: v })}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                {/* Branches will be loaded */}
              </SelectContent>
            </Select>
            
            <Input 
              type="date" 
              className="w-[150px]"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
            <span className="self-center">-</span>
            <Input 
              type="date" 
              className="w-[150px]"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-3 text-left">Ngày</th>
                <th className="p-3 text-left">Chi nhánh</th>
                <th className="p-3 text-right">Tổng tiền</th>
                <th className="p-3 text-left">Người tạo</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((order: any) => (
                <tr key={order.id} className="border-b border-border hover:bg-secondary-light/30">
                  <td className="p-3">{formatDate(order.importDate)}</td>
                  <td className="p-3">{order.branch?.name}</td>
                  <td className="p-3 text-right font-mono">{formatCurrency(order.totalAmount)}</td>
                  <td className="p-3">{order.createdBy?.fullName}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === "APPROVED" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}>
                      {order.status === "APPROVED" ? "Đã duyệt" : "Nháp"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ImportOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
```

## Deliverables
- [ ] Import Orders API (CRUD)
- [ ] Export Orders API (CRUD)
- [ ] Auto-update inventory
- [ ] Import Orders page
- [ ] Export Orders page
- [ ] Order dialogs
- [ ] Permission checks

## Verification
- [ ] Orders can be created with items
- [ ] Inventory updates automatically
- [ ] Permissions enforced
- [ ] Branch isolation works

## Notes
- Stock cannot go negative
- Auto-calculate totals
- Audit logging for all operations
