#!/usr/bin/env tsx
/**
 * Excel Import Script - Import từ JSON dump của Python
 * Usage: npx tsx scripts/import-excel.ts
 */
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import * as fs from "fs"
import path from "path"

const prisma = new PrismaClient()
const DEFAULT_PASSWORD = "admin123"
const JSON_PATH = path.resolve(process.cwd(), "scripts", "excel-data.json")

type Row = any[]
type Sheet = Row[]

// ==================== HELPERS ====================

function vnSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase()
    .substring(0, 40)
}

function safeStr(v: any): string | null {
  if (v == null) return null
  const s = String(v).trim()
  return s.length ? s : null
}

function toNum(v: any, def = 0): number {
  if (v == null || v === "") return def
  const n = Number(v)
  return isNaN(n) ? def : n
}

function toDate(v: any): Date | null {
  if (!v) return null
  if (v instanceof Date) return v
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function findByNorm<T extends { name: string }>(items: T[], name: string): T | null {
  const n = normalizeName(name)
  // Exact match first
  const exact = items.find((i) => normalizeName(i.name) === n)
  if (exact) return exact
  // Partial match
  const partial = items.find(
    (i) =>
      normalizeName(i.name) &&
      (n.includes(normalizeName(i.name)) || normalizeName(i.name).includes(n)),
  )
  return partial || null
}

async function hashPassword(p: string): Promise<string> {
  return bcrypt.hash(p, 10)
}

// ==================== MAIN ====================
async function main() {
  console.log(`📊 Đọc JSON: ${JSON_PATH}`)
  const data: Record<string, Sheet> = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"))
  for (const [k, v] of Object.entries(data)) {
    console.log(`  ${k}: ${v.length} rows`)
  }

  const branch = await prisma.branch.findFirst()
  if (!branch) {
    console.log("❌ Không tìm thấy branch. Chạy seed trước.")
    return
  }
  const dept = await prisma.department.findFirst({ where: { branchId: branch.id } })
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } })
  if (!dept || !admin) {
    console.log("❌ Thiếu department hoặc admin")
    return
  }
  console.log(`\n📍 Branch: ${branch.name}\n`)

  // ============ 1. SELLING POINTS (TỪ Nhật ký bán hàng) ============
  console.log("🔄 [1/7] SellingPoints...")
  const spMap = new Map<string, string>() // name -> id
  const seenSP = new Set<string>()
  const diarySheets = ["Nhật ký bán hàng T3", "Nhật ký bán hàng T4"]
  for (const sn of diarySheets) {
    const rows = data[sn] || []
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i]
      const spName = safeStr(r[3])
      if (!spName || spName === "NGHỈ BÁN" || seenSP.has(spName)) continue
      seenSP.add(spName)
      const isFar = spName === "VTD"
      const group = isFar ? "GROUP_1" : "GROUP_2"
      const salaryPerShift = isFar ? 80000 : 70000
      const code = `SP_${vnSlug(spName).toUpperCase().substring(0, 20)}`
      try {
        const existing = await prisma.sellingPoint.findFirst({ where: { code, branchId: branch.id } })
        let id: string
        if (existing) {
          const upd = await prisma.sellingPoint.update({
            where: { id: existing.id },
            data: { name: spName, group, salaryPerShift },
          })
          id = upd.id
        } else {
          const created = await prisma.sellingPoint.create({
            data: { code, name: spName, branchId: branch.id, group, salaryPerShift },
          })
          id = created.id
        }
        spMap.set(spName, id)
      } catch (e) {
        console.warn(`  ! sp ${spName}: ${(e as Error).message}`)
      }
    }
  }
  console.log(`  ✓ ${spMap.size} điểm bán`)

  // ============ 2. EMPLOYEES ============
  console.log("🔄 [2/7] Employees...")
  const empMap = new Map<string, string>() // name -> id
  const seenEmp = new Set<string>()
  const empSources: { sheet: string; col: number }[] = [
    { sheet: "Lương&Thưởng", col: 1 },
    { sheet: "Nhật ký bán hàng T3", col: 4 },
    { sheet: "Nhật ký bán hàng T4", col: 4 },
  ]
  for (const { sheet, col } of empSources) {
    const rows = data[sheet] || []
    for (let i = 1; i < rows.length; i++) {
      const name = safeStr(rows[i]?.[col])
      if (!name || name === "NGHỈ BÁN" || name === "ONLINE" || name === "CT" || name === "TV" || name === "HV") continue
      const norm = normalizeName(name)
      if (!norm || seenEmp.has(norm)) continue
      seenEmp.add(norm)
      const existing = await prisma.user.findFirst({ where: { fullName: name } })
      if (existing) {
        empMap.set(name, existing.id)
        continue
      }
      const username = `emp_${vnSlug(name)}`.substring(0, 30)
      try {
        const created = await prisma.user.create({
          data: {
            username,
            email: `${username}@qlcn.vn`,
            password: await hashPassword(DEFAULT_PASSWORD),
            fullName: name,
            role: "EMPLOYEE",
            branchId: branch.id,
            departmentId: dept.id,
          },
        })
        empMap.set(name, created.id)
      } catch (e) {
        console.warn(`  ! emp ${name}: ${(e as Error).message}`)
      }
    }
  }
  console.log(`  ✓ ${empMap.size} nhân viên`)

  // ============ 3. PRODUCTS ============
  console.log("🔄 [3/7] Products...")
  const productMap = new Map<string, string>() // name -> id
  const allProducts = await prisma.product.findMany()
  const productRows = data["Giá NhậpXuất"] || []
  for (let i = 3; i < productRows.length; i++) {
    const [, name, cost, price] = productRows[i]
    if (!name || typeof name !== "string") continue
    const norm = normalizeName(name)
    if (!norm) continue
    const match = findByNorm(allProducts, name)
    try {
      let id: string
      if (match) {
        const upd = await prisma.product.update({
          where: { id: match.id },
          data: { costPrice: toNum(cost, 13000), sellingPrice: toNum(price, 20000) },
        })
        id = upd.id
        // Update map with new name (it might be the emoji version)
        productMap.set(name, id)
        productMap.set(match.name, id)
      } else {
        const code = `P_${vnSlug(name).toUpperCase()}`.substring(0, 20)
        const created = await prisma.product.create({
          data: {
            code,
            name: name.trim(),
            costPrice: toNum(cost, 13000),
            sellingPrice: toNum(price, 20000),
            unit: "nắm",
            type: "COM_NAM",
            bonusThreshold: 50,
            bonusPerUnit: 500,
            commissionRate: 0,
            branchId: null,
          },
        })
        id = created.id
        productMap.set(name, id)
      }
    } catch (e) {
      console.warn(`  ! product ${name}: ${(e as Error).message}`)
    }
  }
  // Reload all products to map
  const allProdsAfter = await prisma.product.findMany()
  for (const p of allProdsAfter) productMap.set(p.name, p.id)
  console.log(`  ✓ ${productMap.size} products (mapped)`)

  // ============ 4. COST CATEGORIES + RECORDS ============
  console.log("🔄 [4/7] Costs...")
  const categories = [
    { name: "Đồng phục", type: "FIXED", unit: "bộ", defaultUnitPrice: 200000 },
    { name: "Quầy kệ", type: "FIXED", unit: "cái", defaultUnitPrice: 1000000 },
    { name: "Lò vi sóng", type: "FIXED", unit: "cái", defaultUnitPrice: 1600000 },
    { name: "Thùng đá", type: "FIXED", unit: "cái", defaultUnitPrice: 300000 },
    { name: "Túi nilon", type: "VARIABLE", unit: "kg", defaultUnitPrice: 43000 },
    { name: "Túi mù", type: "VARIABLE", unit: "cái", defaultUnitPrice: 620 },
    { name: "Đồ chơi", type: "VARIABLE", unit: "cái", defaultUnitPrice: 3450 },
    { name: "Lego", type: "VARIABLE", unit: "cái", defaultUnitPrice: 1000 },
    { name: "Tờ rơi", type: "VARIABLE", unit: "tờ", defaultUnitPrice: 0 },
    { name: "Vận chuyển", type: "VARIABLE", unit: "nắm", defaultUnitPrice: 83 },
    { name: "Quà", type: "VARIABLE", unit: "nắm", defaultUnitPrice: 1000 },
    { name: "Túi", type: "VARIABLE", unit: "cái", defaultUnitPrice: 50 },
    { name: "Điện", type: "VARIABLE", unit: "nắm", defaultUnitPrice: 100 },
  ]
  const catMap = new Map<string, string>()
  for (const c of categories) {
    const existing = await prisma.costCategory.findFirst({ where: { name: c.name } })
    let id: string
    if (existing) {
      const upd = await prisma.costCategory.update({ where: { id: existing.id }, data: c })
      id = upd.id
    } else {
      const created = await prisma.costCategory.create({ data: c })
      id = created.id
    }
    catMap.set(c.name, id)
  }

  // Cost records from sheet "Chi Phí"
  const costRows = data["Chi Phí"] || []
  // R2 (index 2) = header date columns (col D=index 3+)
  // R3+ (index 3+) = data: [name, totalCP, unitPrice, ...dayQty]
  let costCount = 0
  for (let i = 3; i < costRows.length; i++) {
    const [name, , unitPrice, ...dayQty] = costRows[i]
    if (!name || typeof name !== "string") continue
    if (name === "Tổng" || name === "Cố định" || name === "Chi Phí") continue
    // Find category
    let catId: string | null = null
    for (const [cn, cid] of catMap) {
      const nn = normalizeName(String(name))
      const cn2 = normalizeName(cn)
      if (nn.includes(cn2) || cn2.includes(nn)) {
        catId = cid
        break
      }
    }
    if (!catId) continue
    for (let d = 0; d < dayQty.length; d++) {
      const qty = toNum(dayQty[d], 0)
      const date = toDate(costRows[2]?.[d + 3])
      if (qty <= 0 || !date) continue
      try {
        await prisma.costRecord.create({
          data: {
            branchId: branch.id,
            categoryId: catId,
            costDate: date,
            quantity: qty,
            unitPrice: toNum(unitPrice, 0),
            totalAmount: qty * toNum(unitPrice, 0),
            createdById: admin.id,
          },
        })
        costCount++
      } catch {
        // skip
      }
    }
  }
  console.log(`  ✓ ${costCount} cost records`)

  // ============ 5. IMPORT ORDERS ============
  console.log("🔄 [5/7] ImportOrders...")
  const importRows = data["Nhập hàng New"] || []
  const importMap = new Map<string, { date: Date; items: Map<string, { qty: number; gifted: number; unitPrice: number }> }>()
  const allProds = await prisma.product.findMany()
  for (let i = 1; i < importRows.length; i++) {
    const [date, productName, qty, total, unitPrice, , gifted] = importRows[i]
    if (!date || !productName || !qty) continue
    if (productName === "Tổng") continue
    const d = toDate(date)
    if (!d) continue
    const product = findByNorm(allProds, String(productName))
    if (!product) continue
    const dateKey = d.toISOString().slice(0, 10)
    if (!importMap.has(dateKey)) importMap.set(dateKey, { date: d, items: new Map() })
    const o = importMap.get(dateKey)!
    const q = toNum(qty, 0)
    const g = toNum(gifted, 0)
    const up = toNum(unitPrice, 0) || Number(product.costPrice)
    if (o.items.has(product.id)) {
      const ex = o.items.get(product.id)!
      ex.qty += q
      ex.gifted += g
    } else {
      o.items.set(product.id, { qty: q, gifted: g, unitPrice: up })
    }
  }
  let importCount = 0
  for (const [, o] of importMap) {
    if (o.items.size === 0) continue
    let totalAmount = 0
    const items = Array.from(o.items.entries()).map(([pid, it]) => {
      const total = it.qty * it.unitPrice
      totalAmount += total
      return {
        productId: pid,
        quantity: it.qty,
        giftedQuantity: it.gifted,
        unitPrice: it.unitPrice,
        totalAmount: total,
      }
    })
    try {
      await prisma.importOrder.create({
        data: {
          branchId: branch.id,
          importDate: o.date,
          totalAmount,
          status: "APPROVED",
          createdById: admin.id,
          items: { create: items },
        },
      })
      importCount++
    } catch (e) {
      // skip
    }
  }
  console.log(`  ✓ ${importCount} import orders`)

  // ============ 6. EXPORT ORDERS ============
  console.log("🔄 [6/7] ExportOrders...")
  const allShifts = await prisma.shift.findMany({ where: { branchId: branch.id } })
  const shiftMap = new Map(allShifts.map((s) => [s.code, s.id]))
  const exportMap = new Map<string, { date: Date; spId: string; shiftId: string; items: Map<string, { qty: number; giftedQty: number; unitPrice: number }> }>()
  for (const sn of diarySheets) {
    const rows = data[sn] || []
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i]
      const [, date, shift, spName, , productName, , , , , actualQty] = r
      if (!date || !shift || !spName || !productName) continue
      if (spName === "NGHỈ BÁN") continue
      const d = toDate(date)
      if (!d) continue
      const spId = spMap.get(String(spName))
      if (!spId) continue
      const product = findByNorm(allProds, String(productName))
      if (!product) continue
      const shiftCodeMap: Record<string, string> = { "Sáng": "SANG", "Chiều": "CHIEU", "Tối": "TOI" }
      const shiftCode = shiftCodeMap[String(shift)] || "SANG"
      const shiftId = shiftMap.get(shiftCode)
      if (!shiftId) continue
      const dateKey = d.toISOString().slice(0, 10)
      const key = `${dateKey}|${spId}|${shiftId}`
      if (!exportMap.has(key)) {
        exportMap.set(key, { date: d, spId, shiftId, items: new Map() })
      }
      const o = exportMap.get(key)!
      const qty = toNum(actualQty, 0)
      if (qty <= 0) continue
      if (o.items.has(product.id)) {
        const ex = o.items.get(product.id)!
        ex.qty += qty
      } else {
        o.items.set(product.id, {
          qty,
          giftedQty: 0,
          unitPrice: Number(product.sellingPrice),
        })
      }
    }
  }
  let exportCount = 0
  for (const [, o] of exportMap) {
    if (o.items.size === 0) continue
    let totalRevenue = 0
    const items = Array.from(o.items.entries()).map(([pid, it]) => {
      const total = it.qty * it.unitPrice
      totalRevenue += total
      return {
        productId: pid,
        quantity: it.qty,
        giftedQuantity: it.giftedQty,
        unitPrice: it.unitPrice,
        totalAmount: total,
      }
    })
    try {
      const shiftCode = (await prisma.shift.findUnique({ where: { id: o.shiftId } }))?.code || "SANG"
      await prisma.exportOrder.create({
        data: {
          branchId: branch.id,
          sellingPointId: o.spId,
          exportDate: o.date,
          totalRevenue,
          note: `Ca: ${shiftCode}`,
          status: "APPROVED",
          createdById: admin.id,
          items: { create: items },
        },
      })
      exportCount++
    } catch (e: any) {
      if (exportCount < 3 && !String(e).includes("Unique")) console.log(`  EXPORT ERR: ${String(e).slice(0, 200)}`)
    }
  }
  console.log(`  ✓ ${exportCount} export orders`)

  // ============ 7. WORK SCHEDULES ============
  console.log("🔄 [7/7] WorkSchedules...")
  const seenWS = new Set<string>()
  let wsCount = 0
  const shiftCodeMap: Record<string, string> = { "Sáng": "SANG", "Chiều": "CHIEU", "Tối": "TOI" }
  for (const sn of diarySheets) {
    const rows = data[sn] || []
    for (let i = 1; i < rows.length; i++) {
      const [, date, shift, spName, empName] = rows[i]
      if (!date || !shift || !spName || !empName) continue
      if (empName === "NGHỈ BÁN" || spName === "NGHỈ BÁN") continue
      if (empName === "ONLINE" || empName === "CT" || empName === "TV" || empName === "HV") continue
      const d = toDate(date)
      if (!d) continue
      const shiftCode = shiftCodeMap[String(shift)] || "SANG"
      const shiftId = shiftMap.get(shiftCode)
      if (!shiftId) continue
      const spId = spMap.get(String(spName))
      const empId = empMap.get(String(empName))
      if (!spId || !empId) continue
      const dateKey = d.toISOString().slice(0, 10)
      const key = `${empId}|${dateKey}|${shiftId}`
      if (seenWS.has(key)) continue
      seenWS.add(key)
      try {
        await prisma.workSchedule.create({
          data: {
            employeeId: empId,
            branchId: branch.id,
            sellingPointId: spId,
            shiftId,
            shiftCode,
            workDate: d,
            status: "APPROVED",
          },
        })
        wsCount++
      } catch (e: any) {
        if (e.code !== "P2002") console.log(`  WS ERR: ${String(e).slice(0, 200)}`)
      }
    }
  }
  console.log(`  ✓ ${wsCount} work schedules`)

  // ============ SUMMARY ============
  console.log("\n✅ Import hoàn tất!\n📋 Tổng kết DB:")
  const counts = {
    products: await prisma.product.count(),
    sellingPoints: await prisma.sellingPoint.count(),
    users: await prisma.user.count(),
    importOrders: await prisma.importOrder.count(),
    importOrderItems: await prisma.importOrderItem.count(),
    exportOrders: await prisma.exportOrder.count(),
    exportOrderItems: await prisma.exportOrderItem.count(),
    workSchedules: await prisma.workSchedule.count(),
    costRecords: await prisma.costRecord.count(),
    costCategories: await prisma.costCategory.count(),
    shifts: await prisma.shift.count(),
  }
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k}: ${v}`)
  }
}

main()
  .catch((e) => {
    console.error("❌", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
