import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { 
  successResponse, 
  errorResponse, 
  badRequestResponse,
  notFoundResponse 
} from "@/lib/api-response"
import { 
  productCreateSchema, 
  productUpdateSchema,
  validateBody 
} from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(unauthorizedResponse("Vui lòng đăng nhập"), { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") === "asc" ? "asc" : "desc"

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ]
    }
    
    if (type) {
      where.type = type
    }

    // Get total count
    const total = await prisma.product.count({ where })

    // Get products
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
    })

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(errorResponse("Lỗi khi lấy danh sách sản phẩm"), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(unauthorizedResponse("Vui lòng đăng nhập"), { status: 401 })
    }

    // Check permission
    const userRole = (session.user as any)?.role
    if (userRole !== "ADMIN" && userRole !== "BRANCH_DIRECTOR") {
      return NextResponse.json(forbiddenResponse("Không có quyền thêm sản phẩm"), { status: 403 })
    }

    const body = await request.json()
    
    // Validate request body
    const validation = validateBody(productCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        badRequestResponse("Dữ liệu không hợp lệ", validation.errors),
        { status: 400 }
      )
    }

    const { name, code, costPrice, sellingPrice, unit, type, bonusThreshold, bonusPerUnit, commissionRate, branchId } = validation.data

    // Check if code already exists
    const existing = await prisma.product.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json(
        badRequestResponse("Mã sản phẩm đã tồn tại"),
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        code,
        costPrice,
        sellingPrice,
        unit,
        type,
        bonusThreshold,
        bonusPerUnit,
        commissionRate,
        branchId: branchId || null,
      },
    })

    // Create price history
    await prisma.priceHistory.create({
      data: {
        productId: product.id,
        costPrice,
        sellingPrice,
        changedById: (session.user as any)?.id,
      },
    })

    return NextResponse.json(successResponse(product), { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(errorResponse("Lỗi khi tạo sản phẩm"), { status: 500 })
  }
}

function unauthorizedResponse(message: string) {
  return { success: false, error: message }
}

function forbiddenResponse(message: string) {
  return { success: false, error: message }
}
