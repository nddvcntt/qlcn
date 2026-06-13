"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Eye } from "lucide-react"

const fetchExportData = async (setOrders: any, setSellingPoints: any, setLoading: any) => {
  try {
    const [ordersRes, spRes] = await Promise.all([
      fetch("/api/export-orders"),
      fetch("/api/selling-points"),
    ])
    const ordersData = await ordersRes.json()
    const spData = await spRes.json()
    if (ordersData.success) setOrders(ordersData.data)
    if (spData.success) setSellingPoints(spData.data)
  } catch (error) {
    console.error("Error fetching data:", error)
  } finally {
    setLoading(false)
  }
}

interface ExportOrder {
  id: string
  exportDate: string
  totalRevenue: number
  note: string | null
  status: string
  sellingPoint: { name: string; code: string }
  createdBy: { fullName: string }
  items: Array<{
    quantity: number
    unitPrice: number
    totalAmount: number
    product: { name: string; code: string }
  }>
}

interface SellingPoint {
  id: string
  name: string
  code: string
}

export default function ExportOrdersPage() {
  const [orders, setOrders] = useState<ExportOrder[]>([])
  const [sellingPoints, setSellingPoints] = useState<SellingPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState("")
  const [filterSellingPoint, setFilterSellingPoint] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<ExportOrder | null>(null)

  useEffect(() => {
    fetchExportData(setOrders, setSellingPoints, setLoading)
  }, [])

  const filteredOrders = orders.filter((o) => {
    const matchDate = !filterDate || o.exportDate.startsWith(filterDate)
    const matchSP = !filterSellingPoint || o.sellingPoint?.name?.includes(filterSellingPoint)
    return matchDate && matchSP
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">Xuất Hàng</h1>
          <p className="text-[#795548]">Quản lý phiếu xuất hàng và doanh thu</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Tạo Phiếu Xuất
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-[#795548]">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-[#43A047] font-mono">
              {formatCurrency(orders.reduce((sum, o) => sum + o.totalRevenue, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-[#795548]">Số đơn hàng</p>
            <p className="text-2xl font-bold text-[#3E2723] font-mono">{orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-[#795548]">Sản phẩm đã bán</p>
            <p className="text-2xl font-bold text-[#3E2723] font-mono">
              {orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              type="date"
              label="Ngày xuất"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-48"
            />
            <Select
              label="Điểm bán"
              options={sellingPoints.map((sp) => ({ value: sp.id, label: sp.name }))}
              value={filterSellingPoint}
              onChange={(e) => setFilterSellingPoint(e.target.value)}
              placeholder="Tất cả"
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Ngày xuất</TableHead>
                <TableHead>Điểm bán</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Người tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center w-[80px]">Xem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#795548]">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#795548]">
                    Chưa có phiếu xuất hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</TableCell>
                    <TableCell>{formatDate(order.exportDate)}</TableCell>
                    <TableCell className="font-medium">{order.sellingPoint?.name || "-"}</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-[#43A047]">
                      {formatCurrency(order.totalRevenue)}
                    </TableCell>
                    <TableCell>{order.createdBy?.fullName || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status === "APPROVED" ? "Đã duyệt" : "Nháp"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 hover:bg-[#FFF8E1] rounded transition-colors"
                      >
                        <Eye className="w-4 h-4 text-[#5D4037]" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
