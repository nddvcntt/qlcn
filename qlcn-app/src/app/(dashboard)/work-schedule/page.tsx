"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { Plus, Check, X } from "lucide-react"

const fetchWorkScheduleData = async (setSchedules: any, setSellingPoints: any, setLoading: any) => {
  try {
    const [schedulesRes, sellingPointsRes] = await Promise.all([
      fetch("/api/work-schedule"),
      fetch("/api/selling-points"),
    ])
    const schedulesData = await schedulesRes.json()
    const sellingPointsData = await sellingPointsRes.json()
    if (schedulesData.success) setSchedules(schedulesData.data)
    if (sellingPointsData.success) setSellingPoints(sellingPointsData.data)
  } catch (error) {
    console.error("Error fetching data:", error)
  } finally {
    setLoading(false)
  }
}

interface WorkSchedule {
  id: string
  employeeId: string
  branchId: string
  sellingPointId: string
  workDate: string
  shift: "SANG" | "CHIEU"
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  note: string | null
  employee: { id: string; fullName: string; role: string }
  sellingPoint: { id: string; name: string; code: string; group: string }
  approvedBy: { id: string; fullName: string } | null
}

interface SellingPoint {
  id: string
  name: string
  code: string
  group: string
}

const SHIFTS = [
  { value: "SANG", label: "Ca Sáng (6h-14h)" },
  { value: "CHIEU", label: "Ca Chiều (14h-22h)" },
]

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
}

const STATUS_LABELS = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
}

export default function WorkSchedulePage() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([])
  const [sellingPoints, setSellingPoints] = useState<SellingPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    sellingPointId: "",
    workDate: "",
    shift: "SANG",
    note: "",
  })

  useEffect(() => {
    fetchWorkScheduleData(setSchedules, setSellingPoints, setLoading)
  }, [])

  const filteredSchedules = schedules.filter((s) => {
    const matchStatus = !filterStatus || s.status === filterStatus
    const matchDate = !filterDate || s.workDate.startsWith(filterDate)
    return matchStatus && matchDate
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // In real app, get employeeId from session
      const employeeId = "current-user-id"
      
      const res = await fetch("/api/work-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          employeeId,
          branchId: "default-branch",
        }),
      })

      const data = await res.json()
      if (data.success) {
        setIsDialogOpen(false)
        setFormData({ sellingPointId: "", workDate: "", shift: "SANG", note: "" })
        fetchData()
      } else {
        alert(data.error?.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Có lỗi xảy ra")
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/work-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "APPROVED",
          approvedById: "current-user-id",
        }),
      })
      const data = await res.json()
      if (data.success) fetchData()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const res = await fetch("/api/work-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "REJECTED",
          approvedById: "current-user-id",
        }),
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
          <h1 className="text-2xl font-bold text-[#3E2723]">Lịch Làm Việc</h1>
          <p className="text-[#795548]">Đăng ký và duyệt lịch làm việc</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Đăng Ký Lịch
        </Button>
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
              label="Trạng thái"
              options={[
                { value: "PENDING", label: "Chờ duyệt" },
                { value: "APPROVED", label: "Đã duyệt" },
                { value: "REJECTED", label: "Từ chối" },
                { value: "CANCELLED", label: "Đã hủy" },
              ]}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
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
                <TableHead>Nhóm</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Người Duyệt</TableHead>
                <TableHead className="text-center w-[140px]">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[#795548]">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredSchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[#795548]">
                    Chưa có lịch làm việc nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{formatDate(schedule.workDate)}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-[#FFF8E1] rounded text-xs font-medium">
                        {schedule.shift === "SANG" ? "Sáng" : "Chiều"}
                      </span>
                    </TableCell>
                    <TableCell>{schedule.employee?.fullName || "-"}</TableCell>
                    <TableCell className="font-medium">{schedule.sellingPoint?.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        schedule.sellingPoint?.group === "GROUP_1" 
                          ? "bg-purple-100 text-purple-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {schedule.sellingPoint?.group === "GROUP_1" ? "Nhóm 1" : "Nhóm 2"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[schedule.status]}`}>
                        {STATUS_LABELS[schedule.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#795548]">{schedule.approvedBy?.fullName || "-"}</TableCell>
                    <TableCell className="text-center">
                      {schedule.status === "PENDING" && (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(schedule.id)}
                            className="p-1.5 hover:bg-green-50 rounded transition-colors"
                            title="Duyệt"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleReject(schedule.id)}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors"
                            title="Từ chối"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Register Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đăng Ký Lịch Làm Việc</DialogTitle>
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
              required
              options={SHIFTS}
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
              label="Ghi chú"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="VD: Ca này tôi thay đổi..."
            />
            <div className="p-3 bg-[#FFF8E1] rounded-lg text-sm text-[#795548]">
              <p className="font-medium text-[#3E2723]">Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Ngày đầu: Học việc (không lương)</li>
                <li>Ngày 2-3: Thử việc (50,000đ/ca)</li>
                <li>Từ ngày 4+: Lương theo nhóm điểm bán</li>
              </ul>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Đăng Ký</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
