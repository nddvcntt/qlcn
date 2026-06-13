import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/import-orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const where: any = {}
    if (branchId) where.branchId = branchId
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
    const body = await request.json()
    const { branchId, importDate, items, note, createdById } = body

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
        createdById,
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu ID" } },
        { status: 400 }
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
