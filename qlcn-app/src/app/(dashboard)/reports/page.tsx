"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/input"
import { formatCurrency, formatDate } from "@/lib/utils"
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react"

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [reportType, setReportType] = useState("revenue")
  const [loading, setLoading] = useState(false)

  // Mock data for demo
  const mockData = {
    revenue: [
      { date: "2026-06-01", amount: 1250000 },
      { date: "2026-06-02", amount: 1480000 },
      { date: "2026-06-03", amount: 1320000 },
      { date: "2026-06-04", amount: 1590000 },
      { date: "2026-06-05", amount: 1450000 },
      { date: "2026-06-06", amount: 1680000 },
      { date: "2026-06-07", amount: 1720000 },
    ],
    summary: {
      totalRevenue: 10490000,
      totalCost: 7200000,
      totalProfit: 3290000,
      totalOrders: 127,
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#3E2723]">Báo Cáo</h1>
        <p className="text-[#795548]">Xem và xuất báo cáo tổng hợp</p>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${reportType === "revenue" ? "ring-2 ring-[#F9A825]" : ""}`}
          onClick={() => setReportType("revenue")}
        >
          <CardContent className="p-4 text-center">
            <p className="text-2xl mb-1">💰</p>
            <p className="font-medium text-[#3E2723]">Doanh Thu</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${reportType === "profit" ? "ring-2 ring-[#F9A825]" : ""}`}
          onClick={() => setReportType("profit")}
        >
          <CardContent className="p-4 text-center">
            <p className="text-2xl mb-1">📈</p>
            <p className="font-medium text-[#3E2723]">Lợi Nhuận</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${reportType === "salary" ? "ring-2 ring-[#F9A825]" : ""}`}
          onClick={() => setReportType("salary")}
        >
          <CardContent className="p-4 text-center">
            <p className="text-2xl mb-1">👥</p>
            <p className="font-medium text-[#3E2723]">Lương</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${reportType === "cost" ? "ring-2 ring-[#F9A825]" : ""}`}
          onClick={() => setReportType("cost")}
        >
          <CardContent className="p-4 text-center">
            <p className="text-2xl mb-1">📊</p>
            <p className="font-medium text-[#3E2723]">Chi Phí</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <Input
              type="date"
              label="Từ ngày"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-48"
            />
            <Input
              type="date"
              label="Đến ngày"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-48"
            />
            <Select
              label="Chi nhánh"
              options={[{ value: "all", label: "Tất cả" }]}
              placeholder="Chọn chi nhánh"
              className="w-48"
            />
            <Button>
              <BarChart3 className="w-4 h-4 mr-2" />
              Xem Báo Cáo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-[#43A047]/10 border-[#43A047]">
          <CardContent className="p-4">
            <p className="text-sm text-[#795548]">Tổng Doanh Thu</p>
            <p className="text-2xl font-bold text-[#43A047] font-mono">
              {formatCurrency(mockData.summary.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#E53935]/10 border-[#E53935]">
          <CardContent className="p-4">
            <p className="text-sm text-[#795548]">Tổng Chi Phí</p>
            <p className="text-2xl font-bold text-[#E53935] font-mono">
              {formatCurrency(mockData.summary.totalCost)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#5D4037]/10 border-[#5D4037]">
          <CardContent className="p-4">
            <p className="text-sm text-[#795548]">Lợi Nhuận</p>
            <p className="text-2xl font-bold text-[#5D4037] font-mono">
              {formatCurrency(mockData.summary.totalProfit)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#F9A825]/10 border-[#F9A825]">
          <CardContent className="p-4">
            <p className="text-sm text-[#795548]">Đơn Hàng</p>
            <p className="text-2xl font-bold text-[#F9A825] font-mono">
              {mockData.summary.totalOrders}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Biểu Đồ Doanh Thu Theo Ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-end justify-between gap-2 px-4">
            {mockData.revenue.map((item, i) => {
              const maxAmount = Math.max(...mockData.revenue.map(r => r.amount))
              const height = (item.amount / maxAmount) * 250
              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-[#F9A825] rounded-t hover:bg-[#E6970F] transition-all cursor-pointer"
                    style={{ height: `${height}px` }}
                    title={formatCurrency(item.amount)}
                  />
                  <span className="text-xs text-[#795548] mt-2">
                    {new Date(item.date).getDate()}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          Xuất Excel
        </Button>
        <Button variant="outline">
          Xuất PDF
        </Button>
      </div>
    </div>
  )
}
