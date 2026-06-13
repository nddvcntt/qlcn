# Task: TASK_010_Reports_Module
## Mô tả
Xây dựng Module Báo Cáo & Dashboard.

## Priority: MEDIUM
## Estimated Time: 5-6 hours
## Agent: AGENT_009_Reports
## Dependencies: TASK_001, TASK_002, TASK_003, TASK_006, TASK_007, TASK_008, TASK_009

## Subtasks

### 10.1 Report API Routes

#### Dashboard Overview
```typescript
// src/app/api/reports/dashboard/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const currentMonth = new Date()
  currentMonth.setDate(1)
  const lastMonth = new Date(currentMonth)
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  // Get branch filter
  const branchFilter = session.user.role === UserRole.ADMIN 
    ? {} 
    : { branchId: session.user.branchId }

  // Current month stats
  const [
    currentRevenue,
    currentImport,
    currentCost,
    currentProduction,
    lastRevenue
  ] = await Promise.all([
    // Current month revenue
    prisma.exportOrder.aggregate({
      where: {
        ...branchFilter,
        exportDate: { gte: currentMonth },
        status: "APPROVED"
      },
      _sum: { totalRevenue: true }
    }),
    // Current month import
    prisma.importOrder.aggregate({
      where: {
        ...branchFilter,
        importDate: { gte: currentMonth },
        status: "APPROVED"
      },
      _sum: { totalAmount: true }
    }),
    // Current month cost
    prisma.costRecord.aggregate({
      where: {
        ...branchFilter,
        costDate: { gte: currentMonth }
      },
      _sum: { totalAmount: true }
    }),
    // Current month production
    prisma.dailyProduction.aggregate({
      where: {
        ...branchFilter,
        productionDate: { gte: currentMonth }
      },
      _sum: { quantity: true }
    }),
    // Last month revenue for comparison
    prisma.exportOrder.aggregate({
      where: {
        ...branchFilter,
        exportDate: { gte: lastMonth, lt: currentMonth },
        status: "APPROVED"
      },
      _sum: { totalRevenue: true }
    })
  ])

  const revenue = Number(currentRevenue._sum.totalRevenue || 0)
  const importCost = Number(currentImport._sum.totalAmount || 0)
  const cost = Number(currentCost._sum.totalAmount || 0)
  const production = currentProduction._sum.quantity || 0
  const prevRevenue = Number(lastRevenue._sum.totalRevenue || 0)

  const profit = revenue - importCost - cost
  const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0

  return NextResponse.json({
    data: {
      currentMonth: {
        revenue,
        importCost,
        cost,
        profit,
        production
      },
      previousMonth: {
        revenue: prevRevenue
      },
      changes: {
        revenue: revenueChange
      }
    }
  })
}
```

#### Revenue Report
```typescript
// src/app/api/reports/revenue/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")
  const groupBy = searchParams.get("groupBy") // "day", "week", "month", "sellingPoint"

  const branchFilter = session.user.role === UserRole.ADMIN 
    ? {} 
    : { branchId: session.user.branchId }

  const where: any = {
    ...branchFilter,
    status: "APPROVED"
  }
  if (dateFrom) where.exportDate = { ...where.exportDate, gte: new Date(dateFrom) }
  if (dateTo) where.exportDate = { ...where.exportDate, lte: new Date(dateTo) }

  const orders = await prisma.exportOrder.findMany({
    where,
    include: {
      items: { include: { product: true } },
      sellingPoint: true
    },
    orderBy: { exportDate: "asc" }
  })

  // Group data
  let groupedData: any[] = []
  
  if (groupBy === "sellingPoint") {
    const bySp = await prisma.exportOrder.groupBy({
      by: ["sellingPointId"],
      where,
      _sum: { totalRevenue: true },
      _count: true
    })
    
    const spIds = bySp.map(s => s.sellingPointId)
    const sellingPoints = await prisma.sellingPoint.findMany({
      where: { id: { in: spIds } }
    })

    groupedData = bySp.map(s => ({
      name: sellingPoints.find(sp => sp.id === s.sellingPointId)?.name || "Unknown",
      revenue: Number(s._sum.totalRevenue || 0),
      orderCount: s._count
    }))
  } else {
    // Group by date
    const byDate: Record<string, number> = {}
    
    for (const order of orders) {
      const dateKey = order.exportDate.toISOString().split("T")[0]
      byDate[dateKey] = (byDate[dateKey] || 0) + Number(order.totalRevenue)
    }

    groupedData = Object.entries(byDate).map(([date, revenue]) => ({
      date,
      revenue
    }))
  }

  return NextResponse.json({ data: groupedData })
}
```

### 10.2 Dashboard Page

```typescript
// src/app/(dashboard)/dashboard/page.tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { TrendingUp, TrendingDown, Package, Users, DollarSign, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

async function fetchDashboard() {
  const res = await fetch("/api/reports/dashboard")
  return res.json()
}

async function fetchRevenue(groupBy: string) {
  const res = await fetch(`/api/reports/revenue?groupBy=${groupBy}`)
  return res.json()
}

export default function DashboardPage() {
  const [revenueGroupBy, setRevenueGroupBy] = useState("day")
  
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard
  })

  const { data: revenueData } = useQuery({
    queryKey: ["revenue", revenueGroupBy],
    queryFn: () => fetchRevenue(revenueGroupBy)
  })

  const stats = data?.data

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { 
      style: "currency", 
      currency: "VND",
      maximumFractionDigits: 0
    }).format(value)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-light">Doanh thu tháng</p>
                <p className="text-2xl font-bold font-mono text-primary mt-1">
                  {formatCurrency(stats?.currentMonth?.revenue || 0)}
                </p>
                <div className={`flex items-center mt-2 text-sm ${
                  (stats?.changes?.revenue || 0) >= 0 ? "text-success" : "text-danger"
                }`}>
                  {(stats?.changes?.revenue || 0) >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(stats?.changes?.revenue || 0).toFixed(1)}% so với tháng trước
                </div>
              </div>
              <div className="p-3 bg-secondary-light rounded-lg">
                <DollarSign className="h-8 w-8 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-light">Giá vốn hàng bán</p>
                <p className="text-2xl font-bold font-mono text-danger mt-1">
                  {formatCurrency(stats?.currentMonth?.importCost || 0)}
                </p>
              </div>
              <div className="p-3 bg-danger/10 rounded-lg">
                <Package className="h-8 w-8 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-light">Chi phí</p>
                <p className="text-2xl font-bold font-mono text-danger mt-1">
                  {formatCurrency(stats?.currentMonth?.cost || 0)}
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <BarChart3 className="h-8 w-8 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-light">Lợi nhuận gộp</p>
                <p className="text-2xl font-bold font-mono text-success mt-1">
                  {formatCurrency(stats?.currentMonth?.profit || 0)}
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Sản lượng tháng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-5xl font-bold font-mono text-primary">
                {stats?.currentMonth?.production?.toLocaleString() || 0}
              </p>
              <p className="text-primary-light mt-2">nắm</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Doanh thu</CardTitle>
            <Select value={revenueGroupBy} onValueChange={setRevenueGroupBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Theo ngày</SelectItem>
                <SelectItem value="week">Theo tuần</SelectItem>
                <SelectItem value="month">Theo tháng</SelectItem>
                <SelectItem value="sellingPoint">Theo điểm bán</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Simple bar chart visualization */}
          <div className="h-64 flex items-end gap-2">
            {revenueData?.data?.slice(-7).map((item: any, index: number) => {
              const maxValue = Math.max(...revenueData.data.map((d: any) => d.revenue))
              const height = maxValue > 0 ? (item.revenue / maxValue) * 100 : 0
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-secondary rounded-t transition-all hover:bg-secondary/80"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-primary-light mt-2 truncate">
                    {item.date || item.name}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Deliverables
- [ ] Dashboard API
- [ ] Revenue report API
- [ ] Dashboard page with stats cards
- [ ] Revenue chart
- [ ] Date range filtering
- [ ] Branch filtering

## Verification
- [ ] Dashboard shows correct stats
- [ ] Charts render correctly
- [ ] Date filtering works
- [ ] Branch isolation works

## Notes
- Role-based dashboard (employees see limited data)
- Real-time calculations from database
- Charts using simple div-based visualization
