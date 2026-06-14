import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET /api/export-orders
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
    const sellingPointId = searchParams.get("sellingPointId")
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
    if (sellingPointId) where.sellingPointId = sellingPointId
    if (dateFrom || dateTo) {
      where.exportDate = {}
      if (dateFrom) where.exportDate.gte = new Date(dateFrom)
      if (dateTo) where.exportDate.lte = new Date(dateTo)
    }

    const orders = await prisma.exportOrder.findMany({
      where,
      include: {
        items: { include: { product: true } },
        sellingPoint: { select: { name: true, code: true } },
        createdBy: { select: { fullName: true } },
      },
      orderBy: { exportDate: "desc" },
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error("Get export orders error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// POST /api/export-orders
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

    // Only ADMIN and BRANCH_DIRECTOR can create export orders
    if (userRole !== "ADMIN" && userRole !== "BRANCH_DIRECTOR") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không có quyền tạo phiếu xuất" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { sellingPointId, exportDate, items, note } = body
    let { branchId } = body

    // Non-admin can only create for their branch
    if (userRole !== "ADMIN") {
      branchId = userBranchId
    }

    if (!branchId || !sellingPointId || !exportDate || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu thông tin bắt buộc" } },
        { status: 400 }
      )
    }

    // Verify selling point belongs to branch
    const sp = await prisma.sellingPoint.findUnique({ where: { id: sellingPointId } })
    if (!sp || sp.branchId !== branchId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Điểm bán không thuộc chi nhánh" } },
        { status: 400 }
      )
    }

    let totalRevenue = 0
    let totalDiscount = 0
    const orderItems = items.map((item: any) => {
      const qty = Number(item.quantity) || 0
      const price = Number(item.unitPrice) || 0
      const discount = Number(item.discountAmount || 0)
      if (discount < 0) {
        throw new Error("INVALID_DISCOUNT")
      }
      if (discount >= price) {
        throw new Error("DISCOUNT_EXCEEDS_PRICE")
      }
      const netPrice = price - discount
      const total = qty * netPrice
      const itemDiscountTotal = qty * discount
      totalRevenue += total
      totalDiscount += itemDiscountTotal
      return {
        productId: item.productId,
        quantity: qty,
        giftedQuantity: Number(item.giftedQuantity || 0),
        unitPrice: price,
        discountAmount: discount,
        totalAmount: total,
        bonusExcluded: discount > 0,
      }
    })

    const order = await prisma.exportOrder.create({
      data: {
        branchId,
        sellingPointId,
        exportDate: new Date(exportDate),
        totalRevenue,
        totalDiscount,
        note: note || null,
        createdById: userId,
        status: "APPROVED",
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    })

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error: any) {
    if (error.message === "INVALID_DISCOUNT") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Giảm giá không được âm" } },
        { status: 400 }
      )
    }
    if (error.message === "DISCOUNT_EXCEEDS_PRICE") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Giảm giá phải nhỏ hơn giá bán" } },
        { status: 400 }
      )
    }
    console.error("Create export order error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

// DELETE /api/export-orders
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

    const existing = await prisma.exportOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy phiếu xuất" } },
        { status: 404 }
      )
    }

    if (userRole !== "ADMIN" && existing.branchId !== userBranchId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không thể xóa phiếu xuất chi nhánh khác" } },
        { status: 403 }
      )
    }

    await prisma.exportOrder.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Xóa thành công" })
  } catch (error) {
    console.error("Delete export order error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}
