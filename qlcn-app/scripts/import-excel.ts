#!/usr/bin/env node

/**
 * Excel Import Script - Nhập dữ liệu từ file Excel vào database
 * Usage: npx ts-node scripts/import-excel.ts <path-to-excel-file>
 */

import * as XLSX from "xlsx"
import { PrismaClient, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

interface ImportResult {
  success: boolean
  recordsImported: number
  errors: string[]
}

async function importProducts(workbook: XLSX.WorkBook): Promise<ImportResult> {
  const result: ImportResult = { success: true, recordsImported: 0, errors: [] }
  
  const sheetName = "Giá NhậpXuất" // Tên sheet chứa danh mục sản phẩm
  const worksheet = workbook.Sheets[sheetName]
  
  if (!worksheet) {
    result.errors.push(`Sheet "${sheetName}" không tìm thấy`)
    result.success = false
    return result
  }

  const data = XLSX.utils.sheet_to_json(worksheet)
  
  for (const row of data) {
    const r = row as Record<string, any>
    try {
      // Map columns: STT, Mặt Hàng, Giá Vốn, Giá Bán
      const name = r["Mặt Hàng"] || r["Tên sản phẩm"] || r["Món"]
      const costPrice = r["Giá Vốn"] || r["Vốn"] || 0
      const sellingPrice = r["Giá Bán"] || r["Bán"] || 0
      
      if (!name) continue
      
      const code = name
        .toString()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_")
        .substring(0, 20)

      await prisma.product.upsert({
        where: { code },
        create: {
          name: name.toString(),
          code,
          costPrice: Number(costPrice),
          sellingPrice: Number(sellingPrice),
          unit: "nắm",
          type: "COM_NAM",
          bonusThreshold: 50,
          bonusPerUnit: 500,
          commissionRate: 0,
          branchId: null,
        },
        update: {
          costPrice: Number(costPrice),
          sellingPrice: Number(sellingPrice),
        },
      })
      result.recordsImported++
    } catch (error) {
      result.errors.push(`Lỗi import sản phẩm: ${JSON.stringify(r)}`)
    }
  }

  console.log(`✓ Đã import ${result.recordsImported} sản phẩm`)
  return result
}

async function importSellingPoints(workbook: XLSX.WorkBook, branchId: string): Promise<ImportResult> {
  const result: ImportResult = { success: true, recordsImported: 0, errors: [] }
  
  // Đọc từ sheet "Nhật ký bán hàng" để lấy danh sách điểm bán
  const sheetName = "Nhật ký bán hàng T4/T3"
  const worksheet = workbook.Sheets[sheetName]
  
  if (!worksheet) {
    // Tạo default selling points nếu không có sheet
    const defaultPoints = [
      { name: "Xuân La", code: "VTD", group: "GROUP_1", salaryPerShift: 80000 },
      { name: "Xuân Đỉnh", code: "XL", group: "GROUP_2", salaryPerShift: 75000 },
      { name: "Xuân Đỉnh Sau", code: "XD_SAU", group: "GROUP_2", salaryPerShift: 75000 },
      { name: "Cổ Nhuế A", code: "CN_A", group: "GROUP_2", salaryPerShift: 75000 },
      { name: "Cổ Nhuế B", code: "CN_B", group: "GROUP_2", salaryPerShift: 75000 },
      { name: "Đông Ngạc", code: "DA", group: "GROUP_2", salaryPerShift: 75000 },
      { name: "Đông Ngạc A", code: "DA_A", group: "GROUP_1", salaryPerShift: 80000 },
      { name: "Đông Ngạc B", code: "DA_B", group: "GROUP_1", salaryPerShift: 80000 },
      { name: "Thụy Phương", code: "TP", group: "GROUP_2", salaryPerShift: 75000 },
    ]

    for (const sp of defaultPoints) {
      try {
        await prisma.sellingPoint.upsert({
          where: { code_branchId: { code: sp.code, branchId } },
          create: { ...sp, branchId },
          update: { name: sp.name, group: sp.group, salaryPerShift: sp.salaryPerShift },
        })
        result.recordsImported++
      } catch (error) {
        result.errors.push(`Lỗi import điểm bán: ${sp.code}`)
      }
    }
    console.log(`✓ Đã import ${result.recordsImported} điểm bán (mặc định)`)
    return result
  }

  // Parse selling points từ header của sheet
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
  const headers = data[0] || []
  
  // Tìm các cột là điểm bán (VD: VTD, XL, CN_A...)
  const sellingPointCodes = headers.filter((h, i) => {
    if (i < 2) return false // Bỏ qua các cột đầu tiên
    const hStr = String(h || "").trim()
    return hStr.length > 0 && hStr !== "undefined"
  })

  for (const code of sellingPointCodes) {
    try {
      // Xác định group dựa trên tên
      const isFarLocation = code.includes("A") || code.includes("B") || code === "VTD"
      const group = isFarLocation ? "GROUP_1" : "GROUP_2"
      const salary = group === "GROUP_1" ? 80000 : 75000

      await prisma.sellingPoint.upsert({
        where: { code_branchId: { code: String(code), branchId } },
        create: {
          name: String(code),
          code: String(code),
          group,
          salaryPerShift: salary,
          branchId,
        },
        update: { group, salaryPerShift: salary },
      })
      result.recordsImported++
    } catch (error) {
      result.errors.push(`Lỗi import điểm bán: ${code}`)
    }
  }

  console.log(`✓ Đã import ${result.recordsImported} điểm bán`)
  return result
}

async function importProduction(workbook: XLSX.WorkBook, branchId: string): Promise<ImportResult> {
  const result: ImportResult = { success: true, recordsImported: 0, errors: [] }
  
  const sheetName = "Lương NV" // Sheet chứa năng suất
  const worksheet = workbook.Sheets[sheetName]
  
  if (!worksheet) {
    console.log("Sheet 'Lương NV' không tìm thấy, bỏ qua import năng suất")
    return result
  }

  const data = XLSX.utils.sheet_to_json(worksheet)
  
  for (const row of data) {
    const r = row as Record<string, any>
    try {
      const employeeName = r["Tên NV"] || r["Họ tên"] || r["Nhân viên"]
      const weekStr = Object.keys(r).find(k => k.includes("Tuần") || k.includes("Từ"))
      
      // Parse production data - các cột T2, T3, T4, T5, T6, T7, CN
      const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
      
      // Tìm hoặc tạo employee
      let employee = await prisma.user.findFirst({
        where: { fullName: { contains: String(employeeName) } }
      })
      
      if (!employee) {
        // Tạo employee mới
        const employeeCode = String(employeeName).toLowerCase().replace(/\s+/g, "_")
        employee = await prisma.user.create({
          data: {
            username: employeeCode,
            password: await hashPassword("password123"),
            fullName: String(employeeName),
            email: `${employeeCode}@qlcn.vn`,
            role: "EMPLOYEE",
            branchId,
          }
        })
      }

      // Parse dữ liệu theo từng ngày
      for (const day of days) {
        const morningQty = r[`Sáng ${day}`] || r[`NS Sáng ${day}`] || r[`${day} Sáng`] || 0
        const afternoonQty = r[`Chiều ${day}`] || r[`NS Chiều ${day}`] || r[`${day} Chiều`] || 0
        
        if (Number(morningQty) > 0) {
          const sellingPoint = await prisma.sellingPoint.findFirst({ where: { branchId } })
          if (sellingPoint) {
            await prisma.dailyProduction.create({
              data: {
                employeeId: employee.id,
                branchId,
                sellingPointId: sellingPoint.id,
                workDate: new Date(),
                shift: "SANG",
                quantity: Number(morningQty),
                employeeStatus: "OFFICIAL",
                baseSalary: Number(sellingPoint.salaryPerShift),
                bonusAmount: Number(morningQty) >= 50 ? Number(morningQty) * 500 : 0,
                commissionAmount: 0,
                totalSalary: Number(sellingPoint.salaryPerShift) + (Number(morningQty) >= 50 ? Number(morningQty) * 500 : 0),
              }
            })
            result.recordsImported++
          }
        }
        
        if (Number(afternoonQty) > 0) {
          const sellingPoint = await prisma.sellingPoint.findFirst({ where: { branchId } })
          if (sellingPoint) {
            await prisma.dailyProduction.create({
              data: {
                employeeId: employee.id,
                branchId,
                sellingPointId: sellingPoint.id,
                workDate: new Date(),
                shift: "CHIEU",
                quantity: Number(afternoonQty),
                employeeStatus: "OFFICIAL",
                baseSalary: Number(sellingPoint.salaryPerShift),
                bonusAmount: Number(afternoonQty) >= 50 ? Number(afternoonQty) * 500 : 0,
                commissionAmount: 0,
                totalSalary: Number(sellingPoint.salaryPerShift) + (Number(afternoonQty) >= 50 ? Number(afternoonQty) * 500 : 0),
              }
            })
            result.recordsImported++
          }
        }
      }
    } catch (error) {
      result.errors.push(`Lỗi import năng suất: ${JSON.stringify(r)}`)
    }
  }

  console.log(`✓ Đã import ${result.recordsImported} records năng suất`)
  return result
}

async function importCosts(workbook: XLSX.WorkBook, branchId: string): Promise<ImportResult> {
  const result: ImportResult = { success: true, recordsImported: 0, errors: [] }
  
  const sheetName = "Chi Phí"
  const worksheet = workbook.Sheets[sheetName]
  
  if (!worksheet) {
    // Tạo default cost categories
    const defaultCategories = [
      { name: "Đồng phục", type: "FIXED", unit: "bộ", defaultUnitPrice: 200000 },
      { name: "Quầy kệ", type: "FIXED", unit: "cái", defaultUnitPrice: 1000000 },
      { name: "Lò vi sóng", type: "FIXED", unit: "cái", defaultUnitPrice: 1600000 },
      { name: "Thùng đá", type: "FIXED", unit: "cái", defaultUnitPrice: 300000 },
      { name: "Túi nilon", type: "VARIABLE", unit: "kg", defaultUnitPrice: 43000 },
      { name: "Đồ chơi", type: "VARIABLE", unit: "cái", defaultUnitPrice: 3450 },
      { name: "Vận chuyển", type: "VARIABLE", unit: "nắm", defaultUnitPrice: 83 },
      { name: "Quà", type: "VARIABLE", unit: "nắm", defaultUnitPrice: 1000 },
      { name: "Điện", type: "VARIABLE", unit: "nắm", defaultUnitPrice: 100 },
    ]

    for (const cat of defaultCategories) {
      try {
        await prisma.costCategory.upsert({
          where: { name: cat.name },
          create: cat,
          update: cat,
        })
      } catch (error) {
        result.errors.push(`Lỗi import category: ${cat.name}`)
      }
    }
    console.log(`✓ Đã import ${defaultCategories.length} danh mục chi phí (mặc định)`)
    return result
  }

  const data = XLSX.utils.sheet_to_json(worksheet)
  
  for (const row of data) {
    const r = row as Record<string, any>
    try {
      const categoryName = r["Loại"] || r["Chi phí"] || r["Tên"]
      const quantity = r["SL"] || r["Số lượng"] || 1
      const unitPrice = r["Đơn giá"] || r["Giá"] || r["Chi phí"] || 0
      const date = r["Ngày"] || r["Date"] || new Date()
      
      // Tìm hoặc tạo category
      let category = await prisma.costCategory.findFirst({
        where: { name: { contains: String(categoryName) } }
      })
      
      if (!category) {
        category = await prisma.costCategory.create({
          data: {
            name: String(categoryName),
            type: "FIXED",
            unit: "cái",
            defaultUnitPrice: Number(unitPrice),
          }
        })
      }

      await prisma.costRecord.create({
        data: {
          branchId,
          categoryId: category.id,
          costDate: new Date(date),
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
          totalAmount: Number(quantity) * Number(unitPrice),
          createdById: (await getAdminUser()).id,
        }
      })
      result.recordsImported++
    } catch (error) {
      result.errors.push(`Lỗi import chi phí: ${JSON.stringify(r)}`)
    }
  }

  console.log(`✓ Đã import ${result.recordsImported} records chi phí`)
  return result
}

// Helper functions
async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs")
  return bcrypt.hash(password, 12)
}

async function getAdminUser() {
  return prisma.user.findFirst({
    where: { role: "ADMIN" }
  }) || prisma.user.findFirst()
}

// Main import function
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log("Usage: npx ts-node scripts/import-excel.ts <path-to-excel-file>")
    console.log("")
    console.log("Ví dụ:")
    console.log("  npx ts-node scripts/import-excel.ts ./data/QLCN_2024.xlsx")
    console.log("")
    console.log("Sheets được hỗ trợ:")
    console.log("  - Giá NhậpXuất: Import sản phẩm")
    console.log("  - Nhật ký bán hàng: Import điểm bán")
    console.log("  - Lương NV: Import năng suất")
    console.log("  - Chi Phí: Import chi phí")
    return
  }

  const filePath = args[0]
  console.log(`\n📊 Đang đọc file Excel: ${filePath}\n`)

  try {
    // Read workbook
    const workbook = XLSX.readFile(filePath)
    console.log(`✓ Đã đọc workbook với ${workbook.SheetNames.length} sheets`)
    console.log(`   Sheets: ${workbook.SheetNames.join(", ")}\n`)

    // Get default branch
    const branch = await prisma.branch.findFirst()
    if (!branch) {
      console.log("❌ Không tìm thấy chi nhánh. Vui lòng chạy seed trước.")
      return
    }
    console.log(`📍 Chi nhánh mặc định: ${branch.name}\n`)

    // Import data
    console.log("🔄 Bắt đầu import...\n")

    const productsResult = await importProducts(workbook)
    const sellingPointsResult = await importSellingPoints(workbook, branch.id)
    const productionResult = await importProduction(workbook, branch.id)
    const costsResult = await importCosts(workbook, branch.id)

    // Summary
    console.log("\n" + "=".repeat(50))
    console.log("📋 KẾT QUẢ IMPORT")
    console.log("=".repeat(50))
    console.log(`Sản phẩm: ${productsResult.recordsImported} records`)
    console.log(`Điểm bán: ${sellingPointsResult.recordsImported} records`)
    console.log(`Năng suất: ${productionResult.recordsImported} records`)
    console.log(`Chi phí: ${costsResult.recordsImported} records`)

    // Show errors if any
    const allErrors = [
      ...productsResult.errors,
      ...sellingPointsResult.errors,
      ...productionResult.errors,
      ...costsResult.errors,
    ]

    if (allErrors.length > 0) {
      console.log("\n⚠️  LỖI:")
      allErrors.slice(0, 10).forEach(e => console.log(`   - ${e}`))
      if (allErrors.length > 10) {
        console.log(`   ... và ${allErrors.length - 10} lỗi khác`)
      }
    }

    console.log("\n✅ Import hoàn tất!\n")
  } catch (error) {
    console.error("❌ Lỗi import:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
