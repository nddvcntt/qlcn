// Standard API response types and helpers

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  errors?: ValidationError[]
  meta?: PaginationMeta
}

export interface ValidationError {
  field: string
  message: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: PaginationMeta
}

// Success response
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
  }
}

// Paginated response
export function paginatedResponse<T>(
  data: T[],
  meta: PaginationMeta
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    meta,
  }
}

// Error response
export function errorResponse(
  error: string,
  errors?: ValidationError[]
): ApiResponse {
  return {
    success: false,
    error,
    errors,
  }
}

// Created response (201)
export function createdResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  }
}

// No content response (204)
export function noContentResponse(): Response {
  return new Response(null, { status: 204 })
}

// Not found response
export function notFoundResponse(resource: string = "Resource"): ApiResponse {
  return {
    success: false,
    error: `${resource} không tìm thấy`,
  }
}

// Unauthorized response
export function unauthorizedResponse(message: string = "Unauthorized"): ApiResponse {
  return {
    success: false,
    error: message,
  }
}

// Forbidden response
export function forbiddenResponse(message: string = "Forbidden"): ApiResponse {
  return {
    success: false,
    error: message,
  }
}

// Bad request response
export function badRequestResponse(
  error: string,
  errors?: ValidationError[]
): ApiResponse {
  return {
    success: false,
    error,
    errors,
  }
}

// Internal server error response
export function serverErrorResponse(error: string = "Internal Server Error"): ApiResponse {
  console.error("Server Error:", error)
  return {
    success: false,
    error: "Đã xảy ra lỗi server",
  }
}

// Helper to calculate pagination
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

// Helper to extract pagination from search params
export function getPaginationFromSearchParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}
