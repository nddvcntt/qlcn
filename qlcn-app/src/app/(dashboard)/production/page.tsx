"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Eye, Edit, Trash2, Check } from "lucide-react"

interface Production {
  id: string
  employeeId: string
  branchId: string
  sellingPointId: string
  workDate: string
  shift: "SANG" | "CHIEU"
  quantity: number
  baseSalary: number
  bonusAmount: number
  commissionAmount: number
  totalSalary: number
  employeeStatus: "PROBATION" | "TRIAL" | "OFFICIAL"
  isApproved: boolean
  employee: { fullName: string }
  sellingPoint: { name: string; code: string; group: string }
}

interface SellingPoint {
  id: string
  name: string
  code: string
  group: string
}

const STATUS_LABELS = {
  PROBATION: "Học việc",
  TRIAL: "Thử việc",
  OFFICIAL: "Chính thức",
}

export default function ProductionPage() {
  const [productions, setProductions] = useState<Production[]>([])
  const [sellingPoints, setSellingPoints] = useState<SellingPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState("")
  const [filterSellingPoint, setFilterSellingPoint] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    sellingPointId: "",
    workDate: "",
    shift: "SANG",
    quantity: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [prodRes, spRes] = await Promise.all([
        fetch("/api/production"),
        fetch("/api/selling-points"),
      ])
      const prodData = await prodRes.json()
      const spData = await spRes.json()
      if (prodData.success) setProductions(prodData.data)
      if (spData.success) setSellingPoints(spData.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProductions = productions.filter((p) => {
    const matchDate = !filterDate || p.workDate.startsWith(filterDate)
    const matchSP = !filterSellingPoint || p.sellingPointId === filterSellingPoint
    return matchDate && matchSP
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // In real app, get employeeId from session
    const employeeId = "current-user-id"
    
    try {
      const res = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          employeeId,
          branchId: "default-branch",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsDialogOpen(false)
        setFormData({ sellingPointId: "", workDate: "", shift: "SANG", quantity: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/production?id=${id}&approvedById=current-user-id`, {
        method: "PUT",
      })
      const data = await res.json()
      if (data.success) fetchData()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">Năng Suất Lao Động</h1>
          <p className="text-[#795548]">Nhập và quản lý năng suất làm việc</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nhập Năng Suất
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Tổng sản lượng</p>
            <p className="text-2xl font-bold text-[#3E2723] font-mono">
              {productions.reduce((sum, p) => sum + p.quantity, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Tổng lương</p>
            <p className="text-2xl font-bold text-[#43A047] font-mono">
              {formatCurrency(productions.reduce((sum, p) => sum + p.totalSalary, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Tổng thưởng</p>
            <p className="text-2xl font-bold text-[#F9A825] font-mono">
              {formatCurrency(productions.reduce((sum, p) => sum + p.bonusAmount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Số ca làm</p>
            <p className="text-2xl font-bold text-[#3E2723] font-mono">{productions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              type="date"
              label="Ngày"
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
                <TableHead>Ngày</TableHead>
                <TableHead>Ca</TableHead>
                <TableHead>Nhân Viên</TableHead>
                <TableHead>Điểm Bán</TableHead>
                <TableHead className="text-center">Số nắm</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Lương cơ bản</TableHead>
                <TableHead className="text-right">Thưởng</TableHead>
                <TableHead className="text-right">Tổng</TableHead>
                <TableHead className="text-center w-[80px]">Duyệt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-[#795548]">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredProductions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-[#795548]">
                    Chưa có dữ liệu năng suất
                  </TableCell>
                </TableRow>
              ) : (
                filteredProductions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.workDate)}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-[#FFF8E1] rounded text-xs">
                        {p.shift === "SANG" ? "Sáng" : "Chiều"}
                      </span>
                    </TableCell>
                    <TableCell>{p.employee?.fullName || "-"}</TableCell>
                    <TableCell className="font-medium">{p.sellingPoint?.name}</TableCell>
                    <TableCell className="text-center font-mono font-bold">{p.quantity}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        p.employeeStatus === "PROBATION" ? "bg-gray-100 text-gray-600" :
                        p.employeeStatus === "TRIAL" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {STATUS_LABELS[p.employeeStatus]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(p.baseSalary)}</TableCell>
                    <TableCell className="text-right font-mono text-[#F9A825]">{formatCurrency(p.bonusAmount)}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-[#43A047]">{formatCurrency(p.totalSalary)}</TableCell>
                    <TableCell className="text-center">
                      {p.isApproved ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="p-1.5 hover:bg-green-50 rounded transition-colors"
                        >
                          <Check className="w-5 h-5 text-gray-400 hover:text-green-600" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Input Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nhập Năng Suất</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Ngày làm việc"
              type="date"
              required
              value={formData.workDate}
              onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
            />
            <Select
              label="Ca làm việc"
              options={[
                { value: "SANG", label: "Ca Sáng (6h-14h)" },
                { value: "CHIEU", label: "Ca Chiều (14h-22h)" },
              ]}
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
            />
            <Select
              label="Điểm bán"
              required
              options={sellingPoints.map((sp) => ({
                value: sp.id,
                label: `${sp.name} (${sp.code})`,
              }))}
              value={formData.sellingPointId}
              onChange={(e) => setFormData({ ...formData, sellingPointId: e.target.value })}
              placeholder="Chọn điểm bán"
            />
            <Input
              label="Số nắm làm được"
              type="number"
              required
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
            <div className="p-3 bg-[#FFF8E1] rounded-lg text-sm text-[#795548]">
              <p className="font-medium text-[#3E2723] mb-1">Quy tắc tính lương:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Ngày 1: Học việc (0đ)</li>
                <li>Ngày 2-3: Thử việc (50,000đ)</li>
                <li>Từ ngày 4+: 70,000-80,000đ (tùy nhóm)</li>
                <li>≥ 50 suất: Thưởng 500đ/suất</li>
              </ul>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Import Dialog components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
