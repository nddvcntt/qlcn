"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { Plus, Edit, Trash2 } from "lucide-react"

const fetchUsersData = async (setUsers: any, setLoading: any) => {
  try {
    const params = new URLSearchParams()
    params.set("isActive", "true")
    const res = await fetch(`/api/users?${params.toString()}`)
    const data = await res.json()
    if (data.success) {
      setUsers(data.data)
    }
  } catch (error) {
    console.error("Error fetching users:", error)
  } finally {
    setLoading(false)
  }
}

const fetchCurrentUserSession = async (setCurrentUserRole: any) => {
  try {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    if (data?.user?.role) {
      setCurrentUserRole(data.user.role)
    }
  } catch (error) {
    console.error("Error fetching session:", error)
  }
}

interface User {
  id: string
  username: string
  fullName: string
  email: string
  phone: string | null
  role: "ADMIN" | "BRANCH_DIRECTOR" | "DEPARTMENT_HEAD" | "EMPLOYEE"
  branchId: string | null
  branch: { id: string; name: string; code: string } | null
  departmentId: string | null
  department: { id: string; name: string; code: string } | null
  isActive: boolean
  startDate: string | null
  createdAt: string
}

const ROLE_LABELS = {
  ADMIN: "Tổng Giám Đốc",
  BRANCH_DIRECTOR: "Giám Đốc CN",
  DEPARTMENT_HEAD: "Trưởng Phòng",
  EMPLOYEE: "Nhân Viên",
}

const ROLE_OPTIONS = [
  { value: "DEPARTMENT_HEAD", label: "Trưởng Phòng" },
  { value: "EMPLOYEE", label: "Nhân Viên" },
]

const STATUS_OPTIONS = [
  { value: "true", label: "Đang hoạt động" },
  { value: "false", label: "Đã khóa" },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState("")
  const [filterStatus, setFilterStatus] = useState("true")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<string>("")

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    role: "EMPLOYEE",
    departmentId: "",
    startDate: "",
  })

  useEffect(() => {
    fetchUsersData(setUsers, setLoading)
    fetchCurrentUserSession(setCurrentUserRole)
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [filterRole, filterStatus])

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      role: "EMPLOYEE",
      departmentId: "",
      startDate: new Date().toISOString().split("T")[0],
    })
    setEditingUser(null)
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: "",
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      departmentId: user.departmentId || "",
      startDate: user.startDate ? user.startDate.split("T")[0] : "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const method = editingUser ? "PUT" : "POST"
      const submitData: any = { ...formData }

      // Only include password if provided (for editing) or required (for creating)
      if (!submitData.password) {
        delete submitData.password
      }

      if (editingUser) {
        submitData.id = editingUser.id
      }

      const res = await fetch("/api/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const data = await res.json()
      if (data.success) {
        setIsDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        alert(data.error?.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Có lỗi xảy ra")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Xác nhận xóa tài khoản "${user.fullName}"?`)) return

    try {
      const res = await fetch(`/api/users?id=${user.id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        fetchUsers()
      } else {
        alert(data.error?.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Có lỗi xảy ra")
    }
  }

  const canManageUsers = currentUserRole === "ADMIN" || currentUserRole === "BRANCH_DIRECTOR"
  const canChangeRole = currentUserRole === "ADMIN"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3E272D]">Quản Lý Tài Khoản</h1>
          <p className="text-[#795548]">Tạo, sửa, xóa tài khoản nhân viên</p>
        </div>
        {canManageUsers && (
          <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm Tài Khoản
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Tìm theo tên, username, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[250px]"
            />
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-40"
            >
              <option value="">Tất cả vai trò</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-44"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ Tên</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai Trò</TableHead>
                <TableHead>Chi Nhánh</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Ngày Vào</TableHead>
                {canManageUsers && <TableHead className="text-center w-[100px]">Hành Động</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[#795548]">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[#795548]">
                    Không có tài khoản nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className={!user.isActive ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell className="font-mono text-sm">{user.username}</TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[#FFF8E1] text-[#F57C00]">
                        {ROLE_LABELS[user.role]}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{user.branch?.name || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{user.startDate ? formatDate(user.startDate) : "-"}</TableCell>
                    {canManageUsers && (
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => openEditDialog(user)}
                            className="p-1.5 hover:bg-[#FFF8E1] rounded transition-colors"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4 text-[#5D4037]" />
                          </button>
                          {user.id !== session?.user?.id && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Sửa Tài Khoản" : "Thêm Tài Khoản Mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Họ Tên *"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                label="Username *"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={!!editingUser}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={editingUser ? "Mật khẩu mới" : "Mật khẩu *"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Ngày vào làm"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <Select
              label="Vai trò *"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={!canChangeRole}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : editingUser ? "Lưu" : "Tạo Tài Khoản"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Add session type
declare global {
  interface Window {
    session?: { user?: { id: string } }
  }
}
