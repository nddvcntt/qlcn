import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

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
    const action = searchParams.get("action")

    if (action === "categories") {
      const categories = await prisma.costCategory.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      })
      return NextResponse.json({ success: true, data: categories })
    }

    // Only ADMIN and BRANCH_DIRECTOR can view costs
    if (userRole !== "ADMIN" && userRole !== "BRANCH_DIRECTOR") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không có quyền xem chi phí" } },
        { status: 403 }
      )
    }

    const branchId = searchParams.get("branchId")
    const categoryId = searchParams.get("categoryId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const where: Record<string, unknown> = {}

    // Non-admin: force own branch
    if (userRole !== "ADMIN") {
      where.branchId = userBranchId
    } else if (branchId) {
      where.branchId = branchId
    }

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

    // Only ADMIN and BRANCH_DIRECTOR can create costs
    if (userRole !== "ADMIN" && userRole !== "BRANCH_DIRECTOR") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không có quyền thêm chi phí" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { categoryId, costDate, quantity, unitPrice, note } = body
    let { branchId } = body

    // Non-admin: force own branch
    if (userRole !== "ADMIN") {
      branchId = userBranchId
    }

    if (!branchId || !categoryId || !costDate || !quantity || !unitPrice) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu thông tin bắt buộc" } },
        { status: 400 }
      )
    }

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
        createdById: userId,
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

    const existing = await prisma.costRecord.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy chi phí" } },
        { status: 404 }
      )
    }

    if (userRole !== "ADMIN" && existing.branchId !== userBranchId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không thể xóa chi phí chi nhánh khác" } },
        { status: 403 }
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
