"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { Plus, Edit, Trash2 } from "lucide-react"

const fetchSellingPointsData = async (setSellingPoints: any, setLoading: any) => {
  try {
    const res = await fetch("/api/selling-points")
    const data = await res.json()
    if (data.success) {
      setSellingPoints(data.data)
    }
  } catch (error) {
    console.error("Error fetching selling points:", error)
  } finally {
    setLoading(false)
  }
}

interface SellingPoint {
  id: string
  name: string
  code: string
  address: string | null
  group: "GROUP_1" | "GROUP_2"
  salaryPerShift: number
  isActive: boolean
  branch?: { id: string; name: string }
}

const GROUPS = [
  { value: "GROUP_1", label: "Nhóm 1 - Xa (80,000đ/ca)" },
  { value: "GROUP_2", label: "Nhóm 2 - Gần (70,000đ/ca)" },
]

export default function SellingPointsPage() {
  const [sellingPoints, setSellingPoints] = useState<SellingPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterGroup, setFilterGroup] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SellingPoint | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    group: "GROUP_2",
    salaryPerShift: "70000",
  })

  useEffect(() => {
    fetchSellingPointsData(setSellingPoints, setLoading)
  }, [])

  const filteredItems = sellingPoints.filter((sp) => {
    const matchSearch = sp.name.toLowerCase().includes(search.toLowerCase()) ||
      sp.code.toLowerCase().includes(search.toLowerCase())
    const matchGroup = !filterGroup || sp.group === filterGroup
    return matchSearch && matchGroup
  })

  const handleGroupChange = (group: string) => {
    setFormData({
      ...formData,
      group,
      salaryPerShift: group === "GROUP_1" ? "80000" : "70000",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingItem ? "PUT" : "POST"
      const body = editingItem ? { ...formData, id: editingItem.id } : formData

      const res = await fetch("/api/selling-points", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (data.success) {
        setIsDialogOpen(false)
        setEditingItem(null)
        resetForm()
        fetchSellingPoints()
      } else {
        alert(data.error?.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error saving:", error)
      alert("Có lỗi xảy ra")
    }
  }

  const handleEdit = (item: SellingPoint) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      code: item.code,
      address: item.address || "",
      group: item.group,
      salaryPerShift: item.salaryPerShift.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa điểm bán này?")) return
    try {
      const res = await fetch(`/api/selling-points?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        fetchSellingPoints()
      }
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      address: "",
      group: "GROUP_2",
      salaryPerShift: "70000",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">Điểm Bán Hàng</h1>
          <p className="text-[#795548]">Quản lý các điểm bán và nhóm lương</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Điểm Bán
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo tên, mã điểm bán..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              options={GROUPS}
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              placeholder="Lọc theo nhóm"
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
                <TableHead className="w-[100px]">Mã</TableHead>
                <TableHead>Tên Điểm Bán</TableHead>
                <TableHead>Địa Chỉ</TableHead>
                <TableHead className="text-center">Nhóm</TableHead>
                <TableHead className="text-right">Lương/Ca</TableHead>
                <TableHead className="text-center">Trạng Thái</TableHead>
                <TableHead className="text-center w-[100px]">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#795548]">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#795548]">
                    Chưa có điểm bán nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((sp) => (
                  <TableRow key={sp.id}>
                    <TableCell className="font-mono text-sm">{sp.code}</TableCell>
                    <TableCell className="font-medium">{sp.name}</TableCell>
                    <TableCell className="text-[#795548]">{sp.address || "-"}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        sp.group === "GROUP_1" 
                          ? "bg-purple-100 text-purple-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {sp.group === "GROUP_1" ? "Nhóm 1" : "Nhóm 2"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(sp.salaryPerShift)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sp.isActive 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {sp.isActive ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(sp)}
                          className="p-1 hover:bg-[#FFF8E1] rounded transition-colors"
                        >
                          <Edit className="w-4 h-4 text-[#5D4037]" />
                        </button>
                        <button
                          onClick={() => handleDelete(sp.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[#E53935]" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Sửa Điểm Bán" : "Thêm Điểm Bán Mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tên điểm bán"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Xuân La, Cổ Nhuế A..."
            />
            <Input
              label="Mã điểm bán"
              required
              disabled={!!editingItem}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="VD: VTD, CN_A..."
            />
            <Input
              label="Địa chỉ"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Select
              label="Nhóm lương"
              required
              options={GROUPS}
              value={formData.group}
              onChange={(e) => handleGroupChange(e.target.value)}
            />
            <Input
              label="Lương theo ca (VNĐ)"
              type="number"
              required
              value={formData.salaryPerShift}
              onChange={(e) => setFormData({ ...formData, salaryPerShift: e.target.value })}
            />
            <div className="p-3 bg-[#FFF8E1] rounded-lg text-sm text-[#795548]">
              <p className="font-medium text-[#3E2723] mb-1">Ghi chú về nhóm lương:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Nhóm 1:</strong> 80,000đ/ca (điểm bán xa/khó khăn)</li>
                <li><strong>Nhóm 2:</strong> 75,000đ/ca (điểm bán gần/hỗ trợ tốt)</li>
              </ul>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                {editingItem ? "Lưu Thay Đổi" : "Thêm Mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
