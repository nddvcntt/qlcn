import { describe, it, expect } from "vitest"
import {
  calculateEmployeeDailySalary,
  calculateComNamBonus,
  formatNumber,
  formatPercent,
  cn,
} from "@/lib/utils"

describe("calculateEmployeeDailySalary", () => {
  it("should return 0 VND for day 1 (training)", () => {
    const startDate = new Date("2024-01-01")
    const workDate = new Date("2024-01-01")
    const result = calculateEmployeeDailySalary(startDate, workDate, 80000)
    
    expect(result.status).toBe("PROBATION")
    expect(result.baseSalary).toBe(0)
  })

  it("should return 50,000 VND for days 2-3 (trial)", () => {
    const startDate = new Date("2024-01-01")
    
    // Day 2
    const workDate2 = new Date("2024-01-02")
    const result2 = calculateEmployeeDailySalary(startDate, workDate2, 75000)
    expect(result2.status).toBe("TRIAL")
    expect(result2.baseSalary).toBe(50000)
    
    // Day 3
    const workDate3 = new Date("2024-01-03")
    const result3 = calculateEmployeeDailySalary(startDate, workDate3, 75000)
    expect(result3.status).toBe("TRIAL")
    expect(result3.baseSalary).toBe(50000)
  })

  it("should return full salary (80k) for GROUP_1 from day 4+", () => {
    const startDate = new Date("2024-01-01")
    const workDate = new Date("2024-01-04")
    const result = calculateEmployeeDailySalary(startDate, workDate, 80000)
    
    expect(result.status).toBe("OFFICIAL")
    expect(result.baseSalary).toBe(80000)
  })

  it("should return full salary (75k) for GROUP_2 from day 4+", () => {
    const startDate = new Date("2024-01-01")
    const workDate = new Date("2024-01-04")
    const result = calculateEmployeeDailySalary(startDate, workDate, 75000)
    
    expect(result.status).toBe("OFFICIAL")
    expect(result.baseSalary).toBe(75000)
  })

  it("should return 0 for workDate before startDate", () => {
    const startDate = new Date("2024-01-05")
    const workDate = new Date("2024-01-01")
    const result = calculateEmployeeDailySalary(startDate, workDate, 80000)
    
    expect(result.status).toBe("PROBATION")
    expect(result.baseSalary).toBe(0)
  })

  it("should calculate correctly for long-term employees", () => {
    const startDate = new Date("2023-01-01")
    const workDate = new Date("2024-06-15")
    const result = calculateEmployeeDailySalary(startDate, workDate, 80000)
    
    expect(result.status).toBe("OFFICIAL")
    expect(result.baseSalary).toBe(80000)
  })
})

describe("calculateComNamBonus", () => {
  it("should return 0 bonus for quantity < 50", () => {
    expect(calculateComNamBonus(49)).toBe(0)
    expect(calculateComNamBonus(0)).toBe(0)
    expect(calculateComNamBonus(1)).toBe(0)
  })

  it("should return 500 VND per unit for quantity >= 50", () => {
    expect(calculateComNamBonus(50)).toBe(25000)  // 50 * 500
    expect(calculateComNamBonus(51)).toBe(25500)  // 51 * 500
    expect(calculateComNamBonus(100)).toBe(50000) // 100 * 500
  })

  it("should use custom bonus per unit", () => {
    expect(calculateComNamBonus(50, 1000)).toBe(50000) // 50 * 1000
    expect(calculateComNamBonus(50, 600)).toBe(30000)  // 50 * 600
  })

  it("should use custom threshold", () => {
    expect(calculateComNamBonus(20, 500, 20)).toBe(10000) // 20 * 500
    expect(calculateComNamBonus(19, 500, 20)).toBe(0)
  })
})

describe("cn utility", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
    expect(cn("foo", undefined, "bar")).toBe("foo bar")
    expect(cn("foo", false, "bar")).toBe("foo bar")
  })

  it("should handle conditional classes", () => {
    const isActive = true
    expect(cn("base", isActive && "active")).toBe("base active")
    expect(cn("base", !isActive && "inactive")).toBe("base")
  })
})
