"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Eye } from "lucide-react"

const fetchImportOrders = async (setOrders: any, setLoading: any) => {
  try {
    const res = await fetch("/api/import-orders")
    const data = await res.json()
    if (data.success) {
      setOrders(data.data)
    }
  } catch (error) {
    console.error("Error fetching orders:", error)
  } finally {
    setLoading(false)
  }
}

interface ImportOrder {
  id: string
  importDate: string
  totalAmount: number
  note: string | null
  status: string
  createdBy: { fullName: string }
  branch: { name: string }
  items: Array<{
    id: string
    quantity: number
    giftedQuantity: number
    unitPrice: number
    totalAmount: number
    product: { name: string; code: string }
  }>
}

export default function ImportOrdersPage() {
  const [orders, setOrders] = useState<ImportOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<ImportOrder | null>(null)

  useEffect(() => {
    fetchImportOrders(setOrders, setLoading)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">Nhập Hàng</h1>
          <p className="text-[#795548]">Quản lý phiếu nhập hàng</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Tạo Phiếu Nhập
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              type="date"
              label="Ngày nhập"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
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
                <TableHead>Ngày nhập</TableHead>
                <TableHead>Chi nhánh</TableHead>
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
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#795548]">
                    Chưa có phiếu nhập hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</TableCell>
                    <TableCell>{formatDate(order.importDate)}</TableCell>
                    <TableCell>{order.branch?.name || "-"}</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-[#E53935]">
                      {formatCurrency(order.totalAmount)}
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
