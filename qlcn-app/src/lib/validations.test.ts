import { describe, it, expect } from "vitest"
import {
  loginSchema,
  productCreateSchema,
  productionCreateSchema,
  salaryCalculateSchema,
  validateBody,
} from "@/lib/validations"

describe("loginSchema", () => {
  it("should validate correct login data", () => {
    const result = loginSchema.safeParse({
      username: "admin",
      password: "admin123",
    })
    expect(result.success).toBe(true)
  })

  it("should reject short username", () => {
    const result = loginSchema.safeParse({
      username: "ab",
      password: "admin123",
    })
    expect(result.success).toBe(false)
  })

  it("should reject short password", () => {
    const result = loginSchema.safeParse({
      username: "admin",
      password: "12345",
    })
    expect(result.success).toBe(false)
  })
})

describe("productCreateSchema", () => {
  it("should validate correct product data", () => {
    const result = productCreateSchema.safeParse({
      name: "Thanh cua",
      code: "TC001",
      costPrice: 13000,
      sellingPrice: 20000,
    })
    expect(result.success).toBe(true)
  })

  it("should reject negative price", () => {
    const result = productCreateSchema.safeParse({
      name: "Thanh cua",
      code: "TC001",
      costPrice: -1000,
      sellingPrice: 20000,
    })
    expect(result.success).toBe(false)
  })

  it("should reject invalid product type", () => {
    const result = productCreateSchema.safeParse({
      name: "Thanh cua",
      code: "TC001",
      costPrice: 13000,
      sellingPrice: 20000,
      type: "INVALID",
    })
    expect(result.success).toBe(false)
  })

  it("should use default values", () => {
    const result = productCreateSchema.safeParse({
      name: "Thanh cua",
      code: "TC001",
      costPrice: 13000,
      sellingPrice: 20000,
    })
    if (result.success) {
      expect(result.data.type).toBe("COM_NAM")
      expect(result.data.bonusThreshold).toBe(50)
      expect(result.data.bonusPerUnit).toBe(500)
    }
  })
})

describe("productionCreateSchema", () => {
  it("should validate correct production data", () => {
    const result = productionCreateSchema.safeParse({
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      sellingPointId: "123e4567-e89b-12d3-a456-426614174001",
      workDate: "2024-01-15T00:00:00.000Z",
      shift: "SANG",
      quantity: 50,
    })
    expect(result.success).toBe(true)
  })

  it("should reject invalid UUID", () => {
    const result = productionCreateSchema.safeParse({
      employeeId: "invalid-uuid",
      sellingPointId: "123e4567-e89b-12d3-a456-426614174001",
      workDate: "2024-01-15T00:00:00.000Z",
      shift: "SANG",
      quantity: 50,
    })
    expect(result.success).toBe(false)
  })

  it("should reject negative quantity", () => {
    const result = productionCreateSchema.safeParse({
      employeeId: "123e4567-e89b-12d3-a456-426614174000",
      sellingPointId: "123e4567-e89b-12d3-a456-426614174001",
      workDate: "2024-01-15T00:00:00.000Z",
      shift: "SANG",
      quantity: -10,
    })
    expect(result.success).toBe(false)
  })

  it("should accept valid shifts", () => {
    const shifts = ["SANG", "CHIEU", "FULL"]
    for (const shift of shifts) {
      const result = productionCreateSchema.safeParse({
        employeeId: "123e4567-e89b-12d3-a456-426614174000",
        sellingPointId: "123e4567-e89b-12d3-a456-426614174001",
        workDate: "2024-01-15T00:00:00.000Z",
        shift,
        quantity: 50,
      })
      expect(result.success).toBe(true)
    }
  })
})

describe("validateBody helper", () => {
  it("should return success with data for valid input", () => {
    const result = validateBody(loginSchema, {
      username: "admin",
      password: "admin123",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.username).toBe("admin")
    }
  })

  it("should return errors for invalid input", () => {
    const result = validateBody(loginSchema, {
      username: "ab",
      password: "123",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toBeDefined()
      expect(result.errors!.length).toBeGreaterThan(0)
    }
  })
})
