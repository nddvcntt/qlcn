"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Calculator, Check, Eye } from "lucide-react"

interface SalaryRecord {
  id: string
  employeeId: string
  periodType: string
  periodStart: string
  periodEnd: string
  totalWorkDays: number
  totalShifts: number
  totalQuantity: number
  baseSalary: number
  bonusAmount: number
  commissionAmount: number
  allowances: number
  deductions: number
  advanceAmount: number
  grossSalary: number
  netSalary: number
  status: string
  employee: { fullName: string }
}

const STATUS_LABELS = {
  PENDING: "Chờ duyệt",
  APPROVED_BY_BRANCH: "Đã duyệt (CN)",
  APPROVED_BY_ORG: "Đã duyệt (Tổng)",
  PAID: "Đã thanh toán",
}

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED_BY_BRANCH: "bg-blue-100 text-blue-700",
  APPROVED_BY_ORG: "bg-green-100 text-green-700",
  PAID: "bg-purple-100 text-purple-700",
}

export default function SalaryPage() {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPeriod, setFilterPeriod] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    fetchSalaries()
  }, [])

  const fetchSalaries = async () => {
    try {
      const res = await fetch("/api/salary")
      const data = await res.json()
      if (data.success) {
        setSalaries(data.data)
      }
    } catch (error) {
      console.error("Error fetching salaries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCalculate = async () => {
    if (!filterPeriod) {
      alert("Vui lòng chọn kỳ lương")
      return
    }
    
    setIsCalculating(true)
    try {
      const [start, end] = filterPeriod.split("|")
      const res = await fetch("/api/salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodStart: start,
          periodEnd: end,
        }),
      })
      const data = await res.json()
      if (data.success) {
        fetchSalaries()
        alert("Tính lương thành công!")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Có lỗi xảy ra")
    } finally {
      setIsCalculating(false)
    }
  }

  // Calculate totals
  const totals = salaries.reduce(
    (acc, s) => ({
      baseSalary: acc.baseSalary + s.baseSalary,
      bonus: acc.bonus + s.bonusAmount,
      commission: acc.commission + s.commissionAmount,
      gross: acc.gross + s.grossSalary,
      net: acc.net + s.netSalary,
    }),
    { baseSalary: 0, bonus: 0, commission: 0, gross: 0, net: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">Bảng Lương</h1>
          <p className="text-[#795548]">Tính và quản lý lương nhân viên</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="week"
            label="Kỳ lương"
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleCalculate} disabled={isCalculating}>
            <Calculator className="w-4 h-4 mr-2" />
            {isCalculating ? "Đang tính..." : "Tính Lương"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Lương cơ bản</p>
            <p className="text-xl font-bold text-[#3E2723] font-mono">{formatCurrency(totals.baseSalary)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Thưởng</p>
            <p className="text-xl font-bold text-[#F9A825] font-mono">{formatCurrency(totals.bonus)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Hoa hồng</p>
            <p className="text-xl font-bold text-blue-600 font-mono">{formatCurrency(totals.commission)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Tổng lương</p>
            <p className="text-xl font-bold text-[#5D4037] font-mono">{formatCurrency(totals.gross)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-[#795548]">Thực nhận</p>
            <p className="text-xl font-bold text-[#43A047] font-mono">{formatCurrency(totals.net)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân Viên</TableHead>
                <TableHead className="text-center">Kỳ</TableHead>
                <TableHead className="text-center">Số ca</TableHead>
                <TableHead className="text-center">Sản lượng</TableHead>
                <TableHead className="text-right">Lương CB</TableHead>
                <TableHead className="text-right">Thưởng</TableHead>
                <TableHead className="text-right">Hoa hồng</TableHead>
                <TableHead className="text-right">Thực nhận</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center w-[80px]">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-[#795548]">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : salaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-[#795548]">
                    Chưa có bảng lương nào
                  </TableCell>
                </TableRow>
              ) : (
                salaries.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.employee?.fullName || "-"}</TableCell>
                    <TableCell className="text-center">
                      {formatDate(s.periodStart)} - {formatDate(s.periodEnd)}
                    </TableCell>
                    <TableCell className="text-center font-mono">{s.totalShifts}</TableCell>
                    <TableCell className="text-center font-mono">{s.totalQuantity}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(s.baseSalary)}</TableCell>
                    <TableCell className="text-right font-mono text-[#F9A825]">{formatCurrency(s.bonusAmount)}</TableCell>
                    <TableCell className="text-right font-mono text-blue-600">{formatCurrency(s.commissionAmount)}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-[#43A047]">{formatCurrency(s.netSalary)}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[s.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS[s.status as keyof typeof STATUS_LABELS] || s.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <button className="p-1.5 hover:bg-[#FFF8E1] rounded transition-colors">
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

      {/* Info Box */}
      <Card className="bg-[#FFF8E1] border-[#F9A825]">
        <CardContent className="p-4">
          <h3 className="font-semibold text-[#3E2723] mb-2">Quy tắc tính lương:</h3>
          <ul className="text-sm text-[#795548] space-y-1 list-disc list-inside">
            <li><strong>Ngày đầu tiên:</strong> Học việc - 0đ/ca</li>
            <li><strong>Ngày 2-3:</strong> Thử việc - 50,000đ/ca</li>
            <li><strong>Từ ngày 4+:</strong> Chính thức - 70,000-80,000đ/ca (tùy nhóm điểm bán)</li>
            <li><strong>Thưởng cơm nắm:</strong> 500đ/suất nếu bán ≥ 50 suất/ca</li>
            <li><strong>Hoa hồng nước:</strong> Theo % doanh số nước</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
