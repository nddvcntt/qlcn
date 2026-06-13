# Task: TASK_005_Products_Module
## Mô tả
Xây dựng Module Danh Mục Sản Phẩm và Bảng Giá.

## Priority: HIGH
## Estimated Time: 3-4 hours
## Agent: AGENT_004_Import_Export
## Dependencies: TASK_001, TASK_002, TASK_003

## Subtasks

### 5.1 Create Product API Routes

#### List Products
```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission, canAccessBranch } from "@/lib/rbac"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const branchId = searchParams.get("branchId")

  // Permission check
  if (!hasPermission(session.user.role, "products.read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Branch access check
  if (branchId && !canAccessBranch(session.user.role, session.user.branchId, branchId)) {
    return NextResponse.json({ error: "Branch access denied" }, { status: 403 })
  }

  const where = branchId 
    ? { branchId: branchId || undefined, isActive: true }
    : { isActive: true }

  const products = await prisma.product.findMany({
    where,
    orderBy: { name: "asc" }
  })

  return NextResponse.json({ data: products })
}
```

#### Create Product
```typescript
// src/app/api/products/route.ts (POST)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!hasPermission(session.user.role, "products.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { name, code, costPrice, sellingPrice, branchId, unit } = body

  // Check if code already exists
  const existing = await prisma.product.findUnique({ where: { code } })
  if (existing) {
    return NextResponse.json({ error: "Mã sản phẩm đã tồn tại" }, { status: 409 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      code,
      costPrice,
      sellingPrice,
      branchId: branchId || null,
      unit: unit || "nắm"
    }
  })

  return NextResponse.json({ data: product }, { status: 201 })
}
```

#### Update Product
```typescript
// src/app/api/products/[id]/route.ts
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || !hasPermission(session.user.role, "products.write")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, costPrice, sellingPrice, unit } = body

  const product = await prisma.product.update({
    where: { id: params.id },
    data: { name, costPrice, sellingPrice, unit }
  })

  // Save price history
  await prisma.priceHistory.create({
    data: {
      productId: params.id,
      costPrice,
      sellingPrice,
      changedById: session.user.id
    }
  })

  return NextResponse.json({ data: product })
}
```

### 5.2 Create Products Page UI
```typescript
// src/app/(dashboard)/products/page.tsx
"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductDialog } from "./product-dialog"

async function fetchProducts(branchId?: string) {
  const url = branchId ? `/api/products?branchId=${branchId}` : "/api/products"
  const res = await fetch(url)
  return res.json()
}

export default function ProductsPage() {
  const [branchFilter, setBranchFilter] = useState<string>("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  
  const { data, isLoading } = useQuery({
    queryKey: ["products", branchFilter],
    queryFn: () => fetchProducts(branchFilter || undefined)
  })

  const products = data?.data || []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Danh Mục Sản Phẩm</h1>
        <Button onClick={() => { setEditingProduct(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Mã SP</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead className="text-right">Giá vốn</TableHead>
                <TableHead className="text-right">Giá bán</TableHead>
                <TableHead className="text-right">Lợi nhuận</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: any, index: number) => (
                <TableRow key={product.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-mono">{product.code}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(product.costPrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(product.sellingPrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-success">
                    {formatCurrency(product.sellingPrice - product.costPrice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => { setEditingProduct(product); setDialogOpen(true) }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
      />
    </div>
  )
}
```

### 5.3 Product Dialog Component
```typescript
// src/app/(dashboard)/products/product-dialog.tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  code: z.string().min(1, "Mã sản phẩm không được để trống"),
  costPrice: z.coerce.number().positive("Giá vốn phải lớn hơn 0"),
  sellingPrice: z.coerce.number().positive("Giá bán phải lớn hơn 0"),
})

type ProductForm = z.infer<typeof productSchema>

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const [loading, setLoading] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      code: product.code,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
    } : undefined
  })

  async function onSubmit(data: ProductForm) {
    setLoading(true)
    try {
      const url = product ? `/api/products/${product.id}` : "/api/products"
      const method = product ? "PUT" : "POST"
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      
      onOpenChange(false)
      reset()
      // Refresh data
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {product ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mã sản phẩm</label>
            <Input {...register("code")} placeholder="VD: TC001" />
            {errors.code && <p className="text-danger text-sm mt-1">{errors.code.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
            <Input {...register("name")} placeholder="VD: Thanh cua trứng Mayo" />
            {errors.name && <p className="text-danger text-sm mt-1">{errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Giá vốn (VNĐ)</label>
              <Input type="number" {...register("costPrice")} />
              {errors.costPrice && <p className="text-danger text-sm mt-1">{errors.costPrice.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Giá bán (VNĐ)</label>
              <Input type="number" {...register("sellingPrice")} />
              {errors.sellingPrice && <p className="text-danger text-sm mt-1">{errors.sellingPrice.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

## Deliverables
- [ ] Products API routes (GET, POST, PUT, DELETE)
- [ ] Products list page
- [ ] Product dialog for add/edit
- [ ] Price history tracking
- [ ] Permission checks

## Verification
- [ ] CRUD operations work correctly
- [ ] Permissions enforced
- [ ] Price history saved on updates
- [ ] UI matches design system

## Notes
- Branch isolation enforced
- Price history for audit
- Currency formatting in VND
