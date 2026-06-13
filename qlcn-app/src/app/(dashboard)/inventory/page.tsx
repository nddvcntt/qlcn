"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface InventoryItem {
  productId: string
  productName: string
  openingStock: number
  importQuantity: number
  exportQuantity: number
  giftedQuantity: number
  closingStock: number
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demo
    setTimeout(() => {
      setInventory([
        { productId: "1", productName: "Thanh cua trứng Mayo", openingStock: 50, importQuantity: 100, exportQuantity: 80, giftedQuantity: 5, closingStock: 65 },
        { productId: "2", productName: "Pate phô mai kéo sợi", openingStock: 45, importQuantity: 90, exportQuantity: 70, giftedQuantity: 3, closingStock: 62 },
        { productId: "3", productName: "Heo cao bồi xúc xích", openingStock: 60, importQuantity: 110, exportQuantity: 95, giftedQuantity: 8, closingStock: 67 },
        { productId: "4", productName: "Gà tomyum", openingStock: 40, importQuantity: 80, exportQuantity: 65, giftedQuantity: 4, closingStock: 51 },
        { productId: "5", productName: "Gà teriyaki", openingStock: 55, importQuantity: 100, exportQuantity: 85, giftedQuantity: 6, closingStock: 64 },
      ])
      setLoading(false)
    }, 500)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#3E2723]">Tồn Kho</h1>
        <p className="text-[#795548]">Theo dõi tồn kho theo thời gian thực</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Tổng tồn đầu</p>
            <p className="text-2xl font-bold text-[#3E2723] font-mono">
              {inventory.reduce((sum, i) => sum + i.openingStock, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Tổng nhập</p>
            <p className="text-2xl font-bold text-blue-600 font-mono">
              {inventory.reduce((sum, i) => sum + i.importQuantity, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Tổng xuất</p>
            <p className="text-2xl font-bold text-[#F9A825] font-mono">
              {inventory.reduce((sum, i) => sum + i.exportQuantity, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Tổng tặng</p>
            <p className="text-2xl font-bold text-purple-600 font-mono">
              {inventory.reduce((sum, i) => sum + i.giftedQuantity, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Tổng tồn cuối</p>
            <p className="text-2xl font-bold text-[#43A047] font-mono">
              {inventory.reduce((sum, i) => sum + i.closingStock, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#5D4037] text-white">
                  <th className="text-left py-3 px-4 font-medium">Sản phẩm</th>
                  <th className="text-right py-3 px-4 font-medium">Tồn đầu</th>
                  <th className="text-right py-3 px-4 font-medium">Nhập</th>
                  <th className="text-right py-3 px-4 font-medium">Xuất</th>
                  <th className="text-right py-3 px-4 font-medium">Tặng</th>
                  <th className="text-right py-3 px-4 font-medium">Tồn cuối</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#795548]">
                      Đang tải...
                    </td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#795548]">
                      Chưa có dữ liệu tồn kho
                    </td>
                  </tr>
                ) : (
                  inventory.map((item, i) => (
                    <tr key={item.productId} className="border-b border-[#D7CCC8] hover:bg-[#FFF8E1]/50">
                      <td className="py-3 px-4 font-medium">{item.productName}</td>
                      <td className="py-3 px-4 text-right font-mono">{item.openingStock}</td>
                      <td className="py-3 px-4 text-right font-mono text-blue-600">{item.importQuantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#F9A825]">{item.exportQuantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-purple-600">{item.giftedQuantity}</td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${
                        item.closingStock < 20 ? "text-red-600" : "text-[#43A047]"
                      }`}>
                        {item.closingStock}
                        {item.closingStock < 20 && (
                          <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                            Cảnh báo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Formula Info */}
      <Card className="bg-[#FFF8E1] border-[#F9A825]">
        <CardContent className="p-4">
          <h3 className="font-semibold text-[#3E2723] mb-2">Công thức tính tồn kho:</h3>
          <p className="text-[#795548]">
            <code className="bg-white px-2 py-1 rounded">Tồn cuối = Tồn đầu + Nhập - Xuất - Tặng</code>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
