import { z } from "zod"

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
  username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Password phải có ít nhất 6 ký tự"),
})

// ==================== USER SCHEMAS ====================

export const userCreateSchema = z.object({
  username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Password phải có ít nhất 6 ký tự"),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "BRANCH_DIRECTOR", "DEPARTMENT_HEAD", "EMPLOYEE"]),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  startDate: z.string().datetime().optional(),
})

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true })

// ==================== PRODUCT SCHEMAS ====================

export const productCreateSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  code: z.string().min(2, "Mã sản phẩm phải có ít nhất 2 ký tự").max(20),
  costPrice: z.number().positive("Giá vốn phải lớn hơn 0"),
  sellingPrice: z.number().positive("Giá bán phải lớn hơn 0"),
  unit: z.string().default("nắm"),
  type: z.enum(["COM_NAM", "WATER", "OTHER"]).default("COM_NAM"),
  bonusThreshold: z.number().int().positive().default(50),
  bonusPerUnit: z.number().positive().default(500),
  commissionRate: z.number().min(0).max(100).default(0),
  branchId: z.string().optional(),
})

export const productUpdateSchema = productCreateSchema.partial()

// ==================== SELLING POINT SCHEMAS ====================

export const sellingPointCreateSchema = z.object({
  name: z.string().min(2, "Tên điểm bán phải có ít nhất 2 ký tự"),
  code: z.string().min(2).max(20),
  address: z.string().optional(),
  group: z.enum(["GROUP_1", "GROUP_2"]).default("GROUP_2"),
  salaryPerShift: z.number().positive("Lương phải lớn hơn 0"),
})

export const sellingPointUpdateSchema = sellingPointCreateSchema.partial()

// ==================== IMPORT ORDER SCHEMAS ====================

export const importOrderItemSchema = z.object({
  productId: z.string().uuid("ID sản phẩm không hợp lệ"),
  quantity: z.number().int().positive("Số lượng phải lớn hơn 0"),
  giftedQuantity: z.number().int().min(0).default(0),
  unitPrice: z.number().positive("Đơn giá phải lớn hơn 0"),
})

export const importOrderCreateSchema = z.object({
  importDate: z.string().datetime(),
  items: z.array(importOrderItemSchema).min(1, "Phải có ít nhất 1 sản phẩm"),
  note: z.string().optional(),
})

// ==================== EXPORT ORDER SCHEMAS ====================

export const exportOrderItemSchema = z.object({
  productId: z.string().uuid("ID sản phẩm không hợp lệ"),
  quantity: z.number().int().positive("Số lượng phải lớn hơn 0"),
  giftedQuantity: z.number().int().min(0).default(0),
  unitPrice: z.number().positive("Đơn giá phải lớn hơn 0"),
})

export const exportOrderCreateSchema = z.object({
  sellingPointId: z.string().uuid("ID điểm bán không hợp lệ"),
  exportDate: z.string().datetime(),
  items: z.array(exportOrderItemSchema).min(1, "Phải có ít nhất 1 sản phẩm"),
  note: z.string().optional(),
})

// ==================== PRODUCTION SCHEMAS ====================

export const productionCreateSchema = z.object({
  employeeId: z.string().uuid("ID nhân viên không hợp lệ"),
  sellingPointId: z.string().uuid("ID điểm bán không hợp lệ"),
  workDate: z.string().datetime(),
  shift: z.enum(["SANG", "CHIEU", "FULL"]),
  quantity: z.number().int().min(0, "Số lượng không được âm"),
  note: z.string().optional(),
})

export const productionBatchSchema = z.object({
  date: z.string().datetime(),
  productions: z.array(productionCreateSchema),
})

// ==================== WORK SCHEDULE SCHEMAS ====================

export const workScheduleCreateSchema = z.object({
  employeeId: z.string().uuid("ID nhân viên không hợp lệ"),
  sellingPointId: z.string().uuid("ID điểm bán không hợp lệ"),
  workDate: z.string().datetime(),
  shift: z.enum(["SANG", "CHIEU"]),
  note: z.string().optional(),
})

export const workScheduleApprovalSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().optional(),
})

// ==================== SALARY SCHEMAS ====================

export const salaryCalculateSchema = z.object({
  employeeId: z.string().uuid("ID nhân viên không hợp lệ"),
  periodType: z.enum(["WEEKLY", "MONTHLY"]),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
})

export const salaryApprovalSchema = z.object({
  status: z.enum(["APPROVED_BY_BRANCH", "APPROVED_BY_ORG", "PAID"]),
})

export const salaryAdjustmentSchema = z.object({
  type: z.enum(["BONUS", "DEDUCTION", "ALLOWANCE", "ADJUSTMENT"]),
  amount: z.number(),
  reason: z.string().optional(),
})

// ==================== COST SCHEMAS ====================

export const costCategorySchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  type: z.enum(["FIXED", "VARIABLE"]),
  unit: z.string().min(1),
  defaultUnitPrice: z.number().min(0),
})

export const costRecordSchema = z.object({
  categoryId: z.string().uuid("ID danh mục không hợp lệ"),
  costDate: z.string().datetime(),
  quantity: z.number().int().positive("Số lượng phải lớn hơn 0"),
  unitPrice: z.number().positive("Đơn giá phải lớn hơn 0"),
  note: z.string().optional(),
})

// ==================== DASHBOARD SCHEMAS ====================

export const dashboardQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sellingPointId: z.string().optional(),
})

// ==================== PAGINATION SCHEMAS ====================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
})

// ==================== COMMON SCHEMAS ====================

export const idSchema = z.object({
  id: z.string().uuid("ID không hợp lệ"),
})

export const deleteSchema = z.object({
  id: z.string().uuid("ID không hợp lệ"),
})

// ==================== HELPER FUNCTIONS ====================

export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data)
  if (!result.success) {
    return {
      success: false as const,
      errors: result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    }
  }
  return {
    success: true as const,
    data: result.data,
  }
}

export function validateQuery<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data)
  if (!result.success) {
    return {
      success: false as const,
      errors: result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    }
  }
  return {
    success: true as const,
    data: result.data,
  }
}
