import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num)
}

export function formatPercent(num: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num / 100)
}

// Calculate employee salary based on day of work
export function calculateEmployeeDailySalary(
  startDate: Date,
  workDate: Date,
  salaryPerShift: number
): { status: "PROBATION" | "TRIAL" | "OFFICIAL"; baseSalary: number } {
  const daysWorked = Math.floor((workDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  if (daysWorked <= 0) {
    return { status: "PROBATION", baseSalary: 0 }
  } else if (daysWorked === 1) {
    return { status: "PROBATION", baseSalary: 0 } // Học việc - ngày đầu
  } else if (daysWorked <= 3) {
    return { status: "TRIAL", baseSalary: 50000 } // Thử việc - ngày 2-3
  } else {
    return { status: "OFFICIAL", baseSalary: salaryPerShift } // Chính thức - ngày 4+
  }
}

// Calculate bonus for com nam product
export function calculateComNamBonus(quantity: number, bonusPerUnit: number = 500, threshold: number = 50): number {
  if (quantity >= threshold) {
    return quantity * bonusPerUnit
  }
  return 0
}
