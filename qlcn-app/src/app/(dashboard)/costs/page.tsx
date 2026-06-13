"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"

const fetchData = async (setCosts: any, setCategories: any, setLoading: any) => {
  try {
    const [costsRes, catRes] = await Promise.all([
      fetch("/api/costs"),
      fetch("/api/costs?action=categories"),
    ])
    const costsData = await costsRes.json()
    const catData = await catRes.json()
    if (costsData.success) setCosts(costsData.data)
    if (catData.success) setCategories(catData.data)
  } catch (error) {
    console.error("Error fetching data:", error)
  } finally {
    setLoading(false)
  }
}

interface CostRecord {
  id: string
  costDate: string
  quantity: number
  unitPrice: number
  totalAmount: number
  note: string | null
  category: { name: string; type: string; unit: string }
  createdBy: { fullName: string }
}

interface CostCategory {
  id: string
  name: string
  type: string
  unit: string
  defaultUnitPrice: number
}

export default function CostsPage() {
  const [costs, setCosts] = useState<CostRecord[]>([])
  const [categories, setCategories] = useState<CostCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    categoryId: "",
    costDate: "",
    quantity: "",
    unitPrice: "",
    note: "",
  })

  useEffect(() => {
    fetchData(setCosts, setCategories, setLoading)
  }, [])

  const filteredCosts = costs.filter((c) => {
    const matchDate = !filterDate || c.costDate.startsWith(filterDate)
    const matchCat = !filterCategory || c.category?.name === filterCategory
    return matchDate && matchCat
  })

  const handleCategoryChange = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    setFormData({
      ...formData,
      categoryId,
      unitPrice: cat?.defaultUnitPrice.toString() || "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          createdById: "current-user-id",
          branchId: "default-branch",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsDialogOpen(false)
        setFormData({ categoryId: "", costDate: "", quantity: "", unitPrice: "", note: "" })
        fetchData(setCosts, setCategories, setLoading)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return
    try {
      await fetch(`/api/costs?id=${id}`, { method: "DELETE" })
      fetchData(setCosts, setCategories, setLoading)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  // Stats
  const fixedCosts = filteredCosts.filter((c) => c.category?.type === "FIXED").reduce((sum, c) => sum + c.totalAmount, 0)
  const variableCosts = filteredCosts.filter((c) => c.category?.type === "VARIABLE").reduce((sum, c) => sum + c.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">Chi Phí</h1>
          <p className="text-[#795548]">Quản lý chi phí hoạt động</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Chi Phí
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Chi phí cố định</p>
            <p className="text-2xl font-bold text-[#E53935] font-mono">{formatCurrency(fixedCosts)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Chi phí biến đổi</p>
            <p className="text-2xl font-bold text-[#FB8C00] font-mono">{formatCurrency(variableCosts)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Tổng chi phí</p>
            <p className="text-2xl font-bold text-[#E53935] font-mono">{formatCurrency(fixedCosts + variableCosts)}</p>
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
              label="Danh mục"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
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
                <TableHead>Danh mục</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-center w-[80px]">Xóa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[#795548]">Đang tải...</TableCell>
                </TableRow>
              ) : filteredCosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[#795548]">Chưa có chi phí nào</TableCell>
                </TableRow>
              ) : (
                filteredCosts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{formatDate(c.costDate)}</TableCell>
                    <TableCell className="font-medium">{c.category?.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        c.category?.type === "FIXED" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {c.category?.type === "FIXED" ? "Cố định" : "Biến đổi"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">{c.quantity} {c.category?.unit}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(c.unitPrice)}</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-[#E53935]">{formatCurrency(c.totalAmount)}</TableCell>
                    <TableCell className="text-[#795548]">{c.note || "-"}</TableCell>
                    <TableCell className="text-center">
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-[#E53935]" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Chi Phí</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Danh mục"
              required
              options={categories.map((c) => ({ value: c.id, label: `${c.name} (${c.unit})` }))}
              value={formData.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              placeholder="Chọn danh mục"
            />
            <Input
              label="Ngày"
              type="date"
              required
              value={formData.costDate}
              onChange={(e) => setFormData({ ...formData, costDate: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Số lượng"
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
              <Input
                label="Đơn giá"
                type="number"
                required
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              />
            </div>
            <Input
              label="Ghi chú"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
            <div className="p-3 bg-[#FFF8E1] rounded-lg text-sm">
              <p className="font-medium text-[#3E2723]">Tổng: {formatCurrency(parseFloat(formData.quantity || "0") * parseFloat(formData.unitPrice || "0"))}</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
