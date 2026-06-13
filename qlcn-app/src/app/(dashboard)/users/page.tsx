"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, UserX } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"

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

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Tổng GD",
  BRANCH_DIRECTOR: "GD CN",
  DEPARTMENT_HEAD: "Trưởng Phòng",
  EMPLOYEE: "Nhân Viên",
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  BRANCH_DIRECTOR: "bg-blue-100 text-blue-700",
  DEPARTMENT_HEAD: "bg-amber-100 text-amber-700",
  EMPLOYEE: "bg-green-100 text-green-700",
}

const PAGE_SIZE = 20

export default function UsersPage() {
  const { data: session } = useSession()
  const toast = useToast()
  const currentUserRole = session?.user?.role || ""
  const currentUserId = session?.user?.id || ""

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filterRole, setFilterRole] = useState("")
  const [filterStatus, setFilterStatus] = useState("true")
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPagination(p => ({ ...p, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch users with server-side filtering & pagination
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", pagination.page.toString())
      params.set("limit", PAGE_SIZE.toString())
      if (debouncedSearch) params.set("search", debouncedSearch)
      if (filterRole) params.set("role", filterRole)
      if (filterStatus) params.set("isActive", filterStatus)

      const res = await fetch(`/api/users?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
        if (data.pagination) {
          setPagination(prev => ({ ...prev, ...data.pagination }))
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Không thể tải danh sách tài khoản")
    } finally {
      setLoading(false)
    }
  }, [pagination.page, debouncedSearch, filterRole, filterStatus])

  useEffect(() => {
    const handle = setTimeout(() => {
      void fetchUsers()
    }, 0)
    return () => clearTimeout(handle)
  }, [fetchUsers])

  // Role options based on current user's role
  const roleOptions = currentUserRole === "ADMIN"
    ? [
        { value: "ADMIN", label: "Tổng Giám Đốc" },
        { value: "BRANCH_DIRECTOR", label: "Giám Đốc CN" },
        { value: "DEPARTMENT_HEAD", label: "Trưởng Phòng" },
        { value: "EMPLOYEE", label: "Nhân Viên" },
      ]
    : [
        { value: "DEPARTMENT_HEAD", label: "Trưởng Phòng" },
        { value: "EMPLOYEE", label: "Nhân Viên" },
      ]

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
      const submitData: Record<string, unknown> = { ...formData }

      // Parse numeric fields
      if (submitData.departmentId === "") {
        delete submitData.departmentId
      }

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
        toast.success(editingUser ? "Đã cập nhật tài khoản" : "Đã tạo tài khoản mới")
        setIsDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        toast.error("Có lỗi xảy ra", data.error?.message)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Có lỗi xảy ra")
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
        toast.success("Đã xóa tài khoản")
        fetchUsers()
      } else {
        toast.error("Có lỗi xảy ra", data.error?.message)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Có lỗi xảy ra")
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
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#795548]" />
              <Input
                placeholder="Tìm theo tên, username, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={[{ value: "", label: "Tất cả vai trò" }, ...roleOptions]}
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
              className="w-44"
            />
            <Select
              options={[
                { value: "", label: "Tất cả trạng thái" },
                { value: "true", label: "Đang hoạt động" },
                { value: "false", label: "Đã khóa" },
              ]}
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
              className="w-44"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#FFF8E1]">
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
                // Skeleton Loading
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    {canManageUsers && <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#FFF8E1] flex items-center justify-center">
                        <UserX className="w-8 h-8 text-[#F9A825]" />
                      </div>
                      <div>
                        <p className="text-[#5D4037] font-medium">Không có tài khoản nào</p>
                        <p className="text-sm text-[#795548]">
                          {debouncedSearch || filterRole || filterStatus !== "true"
                            ? "Thử thay đổi bộ lọc tìm kiếm"
                            : "Tạo tài khoản đầu tiên của bạn"}
                        </p>
                      </div>
                      {canManageUsers && !debouncedSearch && !filterRole && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { resetForm(); setIsDialogOpen(true) }}
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm Tài Khoản
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className={!user.isActive ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell className="font-mono text-sm">{user.username}</TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={ROLE_COLORS[user.role] || "bg-gray-100"} variant="secondary">
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.branch?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        }
                      >
                        {user.isActive ? "Hoạt động" : "Đã khóa"}
                      </Badge>
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
                          {user.id !== currentUserId && (
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

          {/* Pagination */}
          {!loading && users.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E8D5B7]">
              <p className="text-sm text-[#795548]">
                Hiển thị {users.length} / {pagination.total} tài khoản
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-[#5D4037]">
                  Trang {pagination.page} / {pagination.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
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
              options={roleOptions}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={!canChangeRole}
            />

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
