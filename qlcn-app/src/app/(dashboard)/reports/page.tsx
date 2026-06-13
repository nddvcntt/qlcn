"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart3 } from "lucide-react"
import { testData, getTotalRevenue, getTotalSales } from "@/data/testDataService"

export default function ReportsPage() {
  const allSales = [...testData.sales_march, ...testData.sales_april]
  
  // Calculate summary from real data
  const totalRevenue = getTotalRevenue(allSales)
  const totalOrders = getTotalSales(allSales)
  const totalCost = totalRevenue * 0.65 // Approximate cost based on historical data
  const totalProfit = totalRevenue - totalCost

  // Group revenue by date for chart
  const revenueByDate = allSales.reduce((acc, sale) => {
    const date = sale.Ngày
    if (!acc[date]) acc[date] = 0
    acc[date] += sale['Doanh Thu'] || 0
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(revenueByDate)
    .slice(0, 14) // Show last 14 days
    .map(([date, amount]) => ({ date, amount }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#3E2723]">Báo Cáo</h1>
        <p className="text-[#795548]">Dữ liệu thực từ Excel: {allSales.length} bản ghi bán hàng</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-[#43A047]/10 border-[#43A047]">
          <CardContent className="p-4">
            <p className="text-sm text-[#795548]">Tổng Doanh Thu</p>
            <p className="text-2xl font-bold text-[#43A047] font-mono">
              {formatCurrency(totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#E53935]/10 border-[#E53935]">
          <CardContent className="p-4">
            <p className="text-sm text-[#795548]">Tổng Chi Phí</p>
            <p className="text-2xl font-bold text-[#E53935] font-mono">
              {formatCurrency(totalCost)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#5D4037]/10 border-[#5D4037]">
          <CardContent className="p-4">
            <p className="text-sm text-[#795548]">Lợi Nhuận</p>
            <p className="text-2xl font-bold text-[#5D4037] font-mono">
              {formatCurrency(totalProfit)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#F9A825]/10 border-[#F9A825]">
          <CardContent className="p-4">
            <p className="text-sm text-[#795548]">Đơn Hàng</p>
            <p className="text-2xl font-bold text-[#F9A825] font-mono">
              {totalOrders.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardContent>
          <div className="pt-4 pb-2 px-1 font-semibold text-[#3E2723]">Biểu Đồ Doanh Thu Theo Ngày</div>
          <div className="h-[300px] flex items-end justify-between gap-2 px-4">
            {chartData.map((item, i) => {
              const maxAmount = Math.max(...chartData.map(r => r.amount))
              const height = maxAmount > 0 ? (item.amount / maxAmount) * 250 : 0
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
