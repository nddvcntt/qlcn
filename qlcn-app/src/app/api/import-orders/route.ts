import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET /api/import-orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    const userBranchId = (session.user as any)?.branchId

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const where: any = {}

    // Role-based filtering
    if (userRole !== "ADMIN") {
      where.branchId = userBranchId
    }

    if (branchId) {
      if (userRole !== "ADMIN" && branchId !== userBranchId) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Không có quyền xem chi nhánh khác" } },
          { status: 403 }
        )
      }
      where.branchId = branchId
    }
    if (dateFrom || dateTo) {
      where.importDate = {}
      if (dateFrom) where.importDate.gte = new Date(dateFrom)
      if (dateTo) where.importDate.lte = new Date(dateTo)
    }

    const orders = await prisma.importOrder.findMany({
      where,
      include: {
        items: { include: { product: true } },
        createdBy: { select: { fullName: true } },
        branch: { select: { name: true } },
      },
      orderBy: { importDate: "desc" },
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error("Get import orders error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// POST /api/import-orders
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    const userBranchId = (session.user as any)?.branchId
    const userId = (session.user as any)?.id

    // Only ADMIN and BRANCH_DIRECTOR can create import orders
    if (userRole !== "ADMIN" && userRole !== "BRANCH_DIRECTOR") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không có quyền tạo phiếu nhập" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { importDate, items, note } = body
    let { branchId } = body

    // Non-admin can only create for their branch
    if (userRole !== "ADMIN") {
      branchId = userBranchId
    }

    if (!branchId || !importDate || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu thông tin bắt buộc" } },
        { status: 400 }
      )
    }

    // Calculate total amount
    let totalAmount = 0
    const orderItems = items.map((item: any) => {
      const total = Number(item.quantity) * Number(item.unitPrice)
      totalAmount += total
      return {
        productId: item.productId,
        quantity: item.quantity,
        giftedQuantity: item.giftedQuantity || 0,
        unitPrice: item.unitPrice,
        totalAmount: total,
      }
    })

    const order = await prisma.importOrder.create({
      data: {
        branchId,
        importDate: new Date(importDate),
        totalAmount,
        note: note || null,
        createdById: userId,
        status: "APPROVED",
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    })

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    console.error("Create import order error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// DELETE /api/import-orders
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    const userBranchId = (session.user as any)?.branchId

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu ID" } },
        { status: 400 }
      )
    }

    // Check ownership
    const existing = await prisma.importOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy phiếu nhập" } },
        { status: 404 }
      )
    }

    if (userRole !== "ADMIN" && existing.branchId !== userBranchId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không thể xóa phiếu nhập chi nhánh khác" } },
        { status: 403 }
      )
    }

    await prisma.importOrder.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Xóa thành công" })
  } catch (error) {
    console.error("Delete import order error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}
