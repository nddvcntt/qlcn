"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { Plus, Edit, Trash2 } from "lucide-react"

const fetchProductsData = async (setProducts: any, setLoading: any) => {
  try {
    const res = await fetch("/api/products")
    const data = await res.json()
    if (data.success) {
      setProducts(data.data)
    }
  } catch (error) {
    console.error("Error fetching products:", error)
  } finally {
    setLoading(false)
  }
}

interface Product {
  id: string
  name: string
  code: string
  costPrice: number
  sellingPrice: number
  unit: string
  type: "COM_NAM" | "WATER" | "OTHER"
  bonusThreshold: number
  bonusPerUnit: number
  commissionRate: number
  isActive: boolean
}

const PRODUCT_TYPES = [
  { value: "COM_NAM", label: "Cơm Nắm" },
  { value: "WATER", label: "Nước" },
  { value: "OTHER", label: "Khác" },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    costPrice: "",
    sellingPrice: "",
    unit: "nắm",
    type: "COM_NAM",
    bonusThreshold: "50",
    bonusPerUnit: "500",
    commissionRate: "0",
  })

  useEffect(() => {
    fetchProductsData(setProducts, setLoading)
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
    const matchType = !filterType || p.type === filterType
    return matchSearch && matchType
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingProduct ? "/api/products" : "/api/products"
      const method = editingProduct ? "PUT" : "POST"
      const body = editingProduct ? { ...formData, id: editingProduct.id } : formData

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (data.success) {
        setIsDialogOpen(false)
        setEditingProduct(null)
        resetForm()
        fetchProductsData(setProducts, setLoading)
      } else {
        alert(data.error?.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Có lỗi xảy ra")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      code: product.code,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      unit: product.unit,
      type: product.type,
      bonusThreshold: product.bonusThreshold.toString(),
      bonusPerUnit: product.bonusPerUnit.toString(),
      commissionRate: product.commissionRate.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        fetchProductsData(setProducts, setLoading)
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      costPrice: "",
      sellingPrice: "",
      unit: "nắm",
      type: "COM_NAM",
      bonusThreshold: "50",
      bonusPerUnit: "500",
      commissionRate: "0",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">Danh Mục Sản Phẩm</h1>
          <p className="text-[#795548]">Quản lý sản phẩm và bảng giá</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Sản Phẩm
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo tên, mã sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              options={PRODUCT_TYPES}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              placeholder="Lọc theo loại"
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
                <TableHead>Tên Sản Phẩm</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Giá Vốn</TableHead>
                <TableHead className="text-right">Giá Bán</TableHead>
                <TableHead className="text-right">Lợi Nhuận</TableHead>
                <TableHead className="text-center">Ngưỡng Thưởng</TableHead>
                <TableHead className="text-center">Thưởng/Sản phẩm</TableHead>
                <TableHead className="text-center w-[100px]">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-[#795548]">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-[#795548]">
                    Chưa có sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.code}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.type === "COM_NAM" ? "bg-[#FFF8E1] text-[#F9A825]" :
                        product.type === "WATER" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {PRODUCT_TYPES.find(t => t.value === product.type)?.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(product.costPrice)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(product.sellingPrice)}</TableCell>
                    <TableCell className={`text-right font-mono ${product.sellingPrice - product.costPrice > 0 ? "text-[#43A047]" : "text-[#E53935]"}`}>
                      {formatCurrency(product.sellingPrice - product.costPrice)}
                    </TableCell>
                    <TableCell className="text-center">{product.bonusThreshold} suất</TableCell>
                    <TableCell className="text-center font-mono">{formatCurrency(product.bonusPerUnit)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1 hover:bg-[#FFF8E1] rounded transition-colors"
                        >
                          <Edit className="w-4 h-4 text-[#5D4037]" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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
            <DialogTitle>{editingProduct ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tên sản phẩm"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Mã sản phẩm"
              required
              disabled={!!editingProduct}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Giá vốn"
                type="number"
                required
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              />
              <Input
                label="Giá bán"
                type="number"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Đơn vị"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
              <Select
                label="Loại sản phẩm"
                options={PRODUCT_TYPES}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            
            {formData.type === "COM_NAM" && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-[#FFF8E1] rounded-lg">
                <Input
                  label="Ngưỡng thưởng (suất)"
                  type="number"
                  value={formData.bonusThreshold}
                  onChange={(e) => setFormData({ ...formData, bonusThreshold: e.target.value })}
                />
                <Input
                  label="Thưởng/suất (VNĐ)"
                  type="number"
                  value={formData.bonusPerUnit}
                  onChange={(e) => setFormData({ ...formData, bonusPerUnit: e.target.value })}
                />
              </div>
            )}

            {formData.type === "WATER" && (
              <Input
                label="Hoa hồng (%)"
                type="number"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                {editingProduct ? "Lưu Thay Đổi" : "Thêm Mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
