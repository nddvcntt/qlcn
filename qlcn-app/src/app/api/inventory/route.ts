import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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
    const branchIdParam = searchParams.get("branchId")
    const productId = searchParams.get("productId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const latest = searchParams.get("latest") === "true"
    const lowStockOnly = searchParams.get("lowStock") === "true"

    const where: any = {}

    if (userRole === "ADMIN") {
      if (branchIdParam) where.branchId = branchIdParam
    } else if (userRole === "BRANCH_DIRECTOR" || userRole === "DEPARTMENT_HEAD" || userRole === "EMPLOYEE") {
      where.branchId = userBranchId
    } else {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không có quyền truy cập" } },
        { status: 403 }
      )
    }

    if (productId) where.productId = productId
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = new Date(dateFrom)
      if (dateTo) where.date.lte = new Date(dateTo)
    }

    const items = await prisma.inventory.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, code: true, type: true, costPrice: true, sellingPrice: true } },
        branch: { select: { id: true, name: true, code: true } },
      },
      orderBy: { date: "desc" },
    })

    let data = items

    if (latest) {
      const map = new Map<string, typeof items[number]>()
      for (const it of items) {
        const key = `${it.branchId}|${it.productId}`
        const cur = map.get(key)
        if (!cur || cur.date < it.date) map.set(key, it)
      }
      data = Array.from(map.values())
    }

    if (lowStockOnly) {
      data = data.filter((it) => it.closingStock <= 10)
    }

    const summary = {
      total: data.length,
      lowStock: data.filter((it) => it.closingStock <= 10).length,
      outOfStock: data.filter((it) => it.closingStock === 0).length,
      totalValue: data.reduce(
        (sum, it) => sum + it.closingStock * Number(it.product.costPrice || 0),
        0
      ),
    }

    return NextResponse.json({ success: true, data, summary })
  } catch (error) {
    console.error("Error fetching inventory:", error)
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
    if (userRole !== "ADMIN" && userRole !== "BRANCH_DIRECTOR") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Không có quyền điều chỉnh tồn kho" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { branchId: branchIdParam, productId, date, openingStock, importQuantity, exportQuantity, giftedQuantity, note } = body

    if (!productId || !date) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu productId hoặc date" } },
        { status: 400 }
      )
    }

    const branchId = userRole === "ADMIN" && branchIdParam ? branchIdParam : (session.user as any)?.branchId
    if (!branchId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Thiếu branchId" } },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Sản phẩm không tồn tại" } },
        { status: 404 }
      )
    }

    const open = Number(openingStock || 0)
    const imp = Number(importQuantity || 0)
    const exp = Number(exportQuantity || 0)
    const gift = Number(giftedQuantity || 0)
    const closing = open + imp - exp - gift

    if (closing < 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Tồn cuối không được âm" } },
        { status: 400 }
      )
    }

    const dateObj = new Date(date)
    const inventory = await prisma.inventory.upsert({
      where: {
        branchId_productId_date: {
          branchId,
          productId,
          date: dateObj,
        },
      },
      create: {
        branchId,
        productId,
        date: dateObj,
        openingStock: open,
        importQuantity: imp,
        exportQuantity: exp,
        giftedQuantity: gift,
        closingStock: closing,
      },
      update: {
        openingStock: open,
        importQuantity: imp,
        exportQuantity: exp,
        giftedQuantity: gift,
        closingStock: closing,
      },
      include: { product: true },
    })

    if (note) {
      await prisma.auditLog.create({
        data: {
          userId: (session.user as any).id,
          action: "ADJUST_INVENTORY",
          resource: "Inventory",
          resourceId: inventory.id,
          newValue: JSON.stringify({ branchId, productId, date: dateObj.toISOString(), openingStock: open, importQuantity: imp, exportQuantity: exp, giftedQuantity: gift, closingStock: closing, note }),
        },
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, data: inventory }, { status: 201 })
  } catch (error) {
    console.error("Error adjusting inventory:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hệ thống" } },
      { status: 500 }
    )
  }
}
