import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { successResponse, errorResponse, badRequestResponse, notFoundResponse } from "@/lib/api-response"
import { sellingPointCreateSchema, sellingPointUpdateSchema, validateBody } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""
    const group = searchParams.get("group") || ""

    const userRole = (session.user as any)?.role
    const userBranchId = (session.user as any)?.branchId

    // Build where clause
    const where: any = {}

    // Branch filtering based on role
    if (userRole === "ADMIN") {
      // Admin can see all
    } else if (userRole === "BRANCH_DIRECTOR") {
      where.branchId = userBranchId
    } else {
      return NextResponse.json(
        { success: false, error: "Không có quyền xem điểm bán" },
        { status: 403 }
      )
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ]
    }

    if (group) {
      where.group = group
    }

    const total = await prisma.sellingPoint.count({ where })

    const sellingPoints = await prisma.sellingPoint.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: sellingPoints,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching selling points:", error)
    return NextResponse.json(errorResponse("Lỗi khi lấy danh sách điểm bán"), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== "ADMIN" && userRole !== "BRANCH_DIRECTOR") {
      return NextResponse.json(
        { success: false, error: "Không có quyền thêm điểm bán" },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const validation = validateBody(sellingPointCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        badRequestResponse("Dữ liệu không hợp lệ", validation.errors),
        { status: 400 }
      )
    }

    const { name, code, address, group, salaryPerShift } = validation.data
    const branchId = (session.user as any)?.branchId

    // Check if code already exists in this branch
    const existing = await prisma.sellingPoint.findFirst({
      where: { code, branchId },
    })

    if (existing) {
      return NextResponse.json(
        badRequestResponse("Mã điểm bán đã tồn tại trong chi nhánh này"),
        { status: 400 }
      )
    }

    const sellingPoint = await prisma.sellingPoint.create({
      data: {
        name,
        code,
        address,
        group,
        salaryPerShift,
        branchId,
      },
    })

    return NextResponse.json(successResponse(sellingPoint), { status: 201 })
  } catch (error) {
    console.error("Error creating selling point:", error)
    return NextResponse.json(errorResponse("Lỗi khi tạo điểm bán"), { status: 500 })
  }
}
