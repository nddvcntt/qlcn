import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/dashboard - Get dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    // Default to last 14 days
    const endDate = dateTo ? new Date(dateTo) : new Date()
    const startDate = dateFrom ? new Date(dateFrom) : new Date(endDate.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Get export orders data (sales)
    const exportOrders = await prisma.exportOrder.findMany({
      where: {
        branchId: branchId || undefined,
        exportDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Calculate daily revenue
    const dailyData: Record<string, { revenue: number; cost: number; profit: number; orders: number }> = {}
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split("T")[0]
      dailyData[dateKey] = { revenue: 0, cost: 0, profit: 0, orders: 0 }
    }

    let totalRevenue = 0
    let totalCost = 0

    exportOrders.forEach((order) => {
      const dateKey = new Date(order.exportDate).toISOString().split("T")[0]
      if (dailyData[dateKey]) {
        order.items.forEach((item) => {
          const revenue = Number(item.totalAmount)
          const cost = Number(item.quantity) * Number(item.product.costPrice)
          totalRevenue += revenue
          totalCost += cost
          dailyData[dateKey].revenue += revenue
          dailyData[dateKey].cost += cost
          dailyData[dateKey].profit += revenue - cost
        })
        dailyData[dateKey].orders += 1
      }
    })

    // Chart data
    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    }))

    // Stats
    const stats = {
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
      totalOrders: exportOrders.length,
      revenueChange: 0, // Calculate compared to previous period
      profitChange: 0,
    }

    // Top products
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {}
    exportOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.product.name,
            quantity: 0,
            revenue: 0,
          }
        }
        productSales[item.productId].quantity += item.quantity
        productSales[item.productId].revenue += Number(item.totalAmount)
      })
    })
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Selling points
    const sellingPoints = await prisma.sellingPoint.findMany({
      where: branchId ? { branchId } : undefined,
      select: { id: true, name: true },
    })

    // Recent orders
    const recentOrders = await prisma.exportOrder.findMany({
      where: branchId ? { branchId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        exportDate: true,
        totalRevenue: true,
        status: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        stats,
        chartData,
        topProducts,
        sellingPoints,
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          date: o.exportDate.toISOString().split("T")[0],
          amount: Number(o.totalRevenue),
          status: o.status,
        })),
      },
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}
