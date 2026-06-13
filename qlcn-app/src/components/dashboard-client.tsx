import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/input"
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface DashboardStats {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  totalOrders: number
  revenueChange: number
  profitChange: number
}

interface ChartDataPoint {
  date: string
  revenue: number
  cost: number
  profit: number
  orders: number
}

interface DashboardClientProps {
  stats: DashboardStats
  chartData: ChartDataPoint[]
  sellingPoints: { id: string; name: string }[]
  topProducts: { name: string; quantity: number; revenue: number }[]
  recentOrders: { id: string; date: string; amount: number; status: string }[]
}

export function DashboardClient({ stats, chartData, sellingPoints, topProducts, recentOrders }: DashboardClientProps) {
  // Transform sellingPoints for Select component
  const sellingPointOptions = sellingPoints.map((sp) => ({ value: sp.id, label: sp.name }))
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#3E2723]">Dashboard</h1>
        <p className="text-[#795548]">Tổng quan hoạt động kinh doanh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#795548]">Tổng Doanh Thu</p>
                <p className="text-2xl font-bold text-[#3E2723] font-mono">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-[#FFF8E1] rounded-full">
                <DollarSign className="w-6 h-6 text-[#F9A825]" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {stats.revenueChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[#43A047] mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#E53935] mr-1" />
              )}
              <span className={`text-sm ${stats.revenueChange >= 0 ? "text-[#43A047]" : "text-[#E53935]"}`}>
                {stats.revenueChange >= 0 ? "+" : ""}{stats.revenueChange.toFixed(1)}%
              </span>
              <span className="text-xs text-[#795548] ml-1">so với tuần trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#795548]">Chi Phí</p>
                <p className="text-2xl font-bold text-[#E53935] font-mono">
                  {formatCurrency(stats.totalCost)}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <ShoppingCart className="w-6 h-6 text-[#E53935]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#795548]">Lợi Nhuận</p>
                <p className="text-2xl font-bold text-[#43A047] font-mono">
                  {formatCurrency(stats.totalProfit)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-[#43A047]" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {stats.profitChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[#43A047] mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#E53935] mr-1" />
              )}
              <span className={`text-sm ${stats.profitChange >= 0 ? "text-[#43A047]" : "text-[#E53935]"}`}>
                {stats.profitChange >= 0 ? "+" : ""}{stats.profitChange.toFixed(1)}%
              </span>
              <span className="text-xs text-[#795548] ml-1">so với tuần trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#795548]">Đơn Hàng</p>
                <p className="text-2xl font-bold text-[#3E2723] font-mono">
                  {formatNumber(stats.totalOrders)}
                </p>
              </div>
              <div className="p-3 bg-[#FFF8E1] rounded-full">
                <Users className="w-6 h-6 text-[#5D4037]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14-Day Chart - Main */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Doanh Số 14 Ngày</CardTitle>
              <div className="flex gap-2">
                <Select
                  options={sellingPointOptions}
                  placeholder="Tất cả điểm bán"
                  className="w-40 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-[#FFFDF7] rounded-lg">
              <div className="text-center text-[#795548]">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-[#F9A825]" />
                <p className="font-medium">Biểu đồ doanh số 14 ngày</p>
                <p className="text-sm">Dữ liệu sẽ hiển thị khi có API</p>
              </div>
            </div>
            {/* Simple bar representation */}
            <div className="mt-4 flex items-end justify-between h-20 gap-1">
              {chartData.slice(-14).map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-[#F9A825] rounded-t hover:bg-[#E6970F] transition-colors"
                    style={{ height: `${Math.max(10, (item.revenue / Math.max(...chartData.map(d => d.revenue))) * 80)}px` }}
                  />
                  <span className="text-xs text-[#795548] mt-1">
                    {new Date(item.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Sản Phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#D7CCC8] last:border-0">
                  <div>
                    <p className="font-medium text-[#3E2723]">{product.name}</p>
                    <p className="text-xs text-[#795548]">{formatNumber(product.quantity)} nắm</p>
                  </div>
                  <p className="font-semibold text-[#43A047] font-mono">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-center text-[#795548] py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn Hàng Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D7CCC8]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#795548]">Mã đơn</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#795548]">Ngày</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#795548]">Số tiền</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#795548]">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr key={i} className="border-b border-[#D7CCC8] hover:bg-[#FFF8E1]/50">
                    <td className="py-3 px-4 font-mono text-sm">{order.id}</td>
                    <td className="py-3 px-4 text-sm">{order.date}</td>
                    <td className="py-3 px-4 text-right font-mono text-sm">{formatCurrency(order.amount)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        order.status === "APPROVED" ? "bg-green-100 text-green-700" :
                        order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {order.status === "APPROVED" ? "Đã duyệt" :
                         order.status === "PENDING" ? "Chờ duyệt" : "Đã hủy"}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#795548]">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
