import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/export-orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")
    const sellingPointId = searchParams.get("sellingPointId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const where: any = {}
    if (branchId) where.branchId = branchId
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
    const body = await request.json()
    const { branchId, sellingPointId, exportDate, items, note, createdById } = body

    let totalRevenue = 0
    const orderItems = items.map((item: any) => {
      const total = Number(item.quantity) * Number(item.unitPrice)
      totalRevenue += total
      return {
        productId: item.productId,
        quantity: item.quantity,
        giftedQuantity: item.giftedQuantity || 0,
        unitPrice: item.unitPrice,
        totalAmount: total,
      }
    })

    const order = await prisma.exportOrder.create({
      data: {
        branchId,
        sellingPointId,
        exportDate: new Date(exportDate),
        totalRevenue,
        note: note || null,
        createdById,
        status: "APPROVED",
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    })

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu ID" } },
        { status: 400 }
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
