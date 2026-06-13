import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "categories") {
      const categories = await prisma.costCategory.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      })
      return NextResponse.json({ success: true, data: categories })
    }

    const branchId = searchParams.get("branchId")
    const categoryId = searchParams.get("categoryId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const where: Record<string, unknown> = {}
    if (branchId) where.branchId = branchId
    if (categoryId) where.categoryId = categoryId
    if (dateFrom || dateTo) {
      where.costDate = {}
      if (dateFrom) (where.costDate as Record<string, Date>).gte = new Date(dateFrom)
      if (dateTo) (where.costDate as Record<string, Date>).lte = new Date(dateTo)
    }

    const costs = await prisma.costRecord.findMany({
      where,
      include: {
        category: true,
        createdBy: { select: { fullName: true } },
      },
      orderBy: { costDate: "desc" },
    })

    return NextResponse.json({ success: true, data: costs })
  } catch (error) {
    console.error("Get costs error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { branchId, categoryId, costDate, quantity, unitPrice, note, createdById } = body

    const totalAmount = quantity * unitPrice

    const cost = await prisma.costRecord.create({
      data: {
        branchId,
        categoryId,
        costDate: new Date(costDate),
        quantity,
        unitPrice,
        totalAmount,
        note: note || null,
        createdById,
      },
    })

    return NextResponse.json({ success: true, data: cost }, { status: 201 })
  } catch (error) {
    console.error("Create cost error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}

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

    await prisma.costRecord.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Xóa thành công" })
  } catch (error) {
    console.error("Delete cost error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}
