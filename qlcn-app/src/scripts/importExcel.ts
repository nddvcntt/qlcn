import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Bắt đầu quá trình import dữ liệu...')

  // 1. Đọc file JSON
  const dataPath = path.resolve(__dirname, '../../../excel_data.json')
  if (!fs.existsSync(dataPath)) {
    console.error(`Không tìm thấy file ${dataPath}`)
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  console.log('Đã đọc file excel_data.json')

  // 2. Tạo Organization & Branch mặc định
  const org = await prisma.organization.upsert({
    where: { id: 'org-1' },
    update: {},
    create: {
      id: 'org-1',
      name: 'Hệ Thống Cơm Nắm',
    },
  })

  const branch = await prisma.branch.upsert({
    where: { code: 'CN01' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Chi Nhánh Trung Tâm',
      code: 'CN01',
    },
  })

  // Hash password mặc định
  const defaultPassword = await bcrypt.hash('123456', 10)

  // Tạo Admin mặc định nếu chưa có
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: defaultPassword,
      fullName: 'Quản trị viên',
      email: 'admin@comnam.vn',
      role: 'ADMIN',
      branchId: branch.id,
    },
  })

  // 3. Extract & Upsert Products (Sản phẩm)
  const productsSheet = data['Nhập hàng New'] || []
  const uniqueProducts = new Set<string>()
  productsSheet.forEach((row: any) => {
    if (row['Loại hàng'] && typeof row['Loại hàng'] === 'string') {
      uniqueProducts.add(row['Loại hàng'].trim())
    }
  })

  // Add products from sales logs as well
  const salesT3 = data['Nhật ký bán hàng T3'] || []
  const salesT4 = data['Nhật ký bán hàng T4'] || []
  const allSales = [...salesT3, ...salesT4]
  
  allSales.forEach((row: any) => {
    if (row['Loại hàng'] && typeof row['Loại hàng'] === 'string') {
      uniqueProducts.add(row['Loại hàng'].trim())
    }
  })

  console.log(`Đang import ${uniqueProducts.size} sản phẩm...`)
  const productMap = new Map<string, string>()
  
  for (const productName of uniqueProducts) {
    const code = 'SP_' + Math.random().toString(36).substr(2, 5).toUpperCase()
    const product = await prisma.product.upsert({
      where: { code: productName }, // Hack for unique constraint or use name if we change schema
      update: {},
      create: {
        branchId: branch.id,
        name: productName,
        code: productName, // Using name as code to make it easier to upsert
        costPrice: 10000, // Default fallback
        sellingPrice: 15000,
        type: productName.toLowerCase().includes('nước') ? 'WATER' : 'COM_NAM',
      },
    })
    productMap.set(productName, product.id)
  }

  // 4. Extract & Upsert Selling Points
  const uniquePoints = new Set<string>()
  allSales.forEach((row: any) => {
    if (row['Điểm bán'] && typeof row['Điểm bán'] === 'string') {
      uniquePoints.add(row['Điểm bán'].trim())
    }
  })

  console.log(`Đang import ${uniquePoints.size} điểm bán...`)
  const pointMap = new Map<string, string>()
  for (const pointName of uniquePoints) {
    // Generate a simple code
    const code = pointName.replace(/\\s+/g, '').toUpperCase().substring(0, 10)
    
    // Prisma unique constraint is [branchId, code]
    // Upsert isn't straightforward with compound unique key if we don't know ID, so we use findFirst + create
    let sp = await prisma.sellingPoint.findFirst({
      where: { branchId: branch.id, code: code }
    })
    
    if (!sp) {
      sp = await prisma.sellingPoint.create({
        data: {
          branchId: branch.id,
          name: pointName,
          code: code,
          group: 'GROUP_2',
          salaryPerShift: 70000,
        }
      })
    }
    pointMap.set(pointName, sp.id)
  }

  // 5. Extract & Upsert Users (Nhân viên)
  const uniqueUsers = new Set<string>()
  allSales.forEach((row: any) => {
    if (row['NV Bán'] && typeof row['NV Bán'] === 'string' && row['NV Bán'] !== 'NGHỈ BÁN') {
      uniqueUsers.add(row['NV Bán'].trim())
    }
  })

  console.log(`Đang import ${uniqueUsers.size} nhân viên...`)
  const userMap = new Map<string, string>()
  const admin = await prisma.user.findUnique({ where: { username: 'admin' } })

  // Build shift map (code → id)
  const allShifts = await prisma.shift.findMany()
  const shiftMap = new Map<string, string>(allShifts.map((s: any) => [s.code, s.id]))
  
  for (const fullName of uniqueUsers) {
    const username = fullName.toLowerCase().replace(/\\s+/g, '') + Math.floor(Math.random() * 1000)
    
    let user = await prisma.user.findFirst({
      where: { fullName: fullName }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: username,
          password: defaultPassword,
          fullName: fullName,
          email: username + '@comnam.vn',
          role: 'EMPLOYEE',
          branchId: branch.id,
        }
      })
    }
    userMap.set(fullName, user.id)
  }

  // 6. Import Daily Production & Work Schedule
  console.log("Đang import " + allSales.length + " bản ghi bán hàng...")
  let productionCount = 0
  
  for (const row of allSales) {
    const dateStr = row['Ngày']
    const shiftName = row['Ca Bán']
    const pointName = row['Điểm bán']?.trim()
    const employeeName = row['NV Bán']?.trim()
    const productName = row['Loại hàng']?.trim()
    const quantity = parseInt(row['Bán Thực']) || 0
    const revenue = parseFloat(row['Doanh Thu']) || 0

    if (!dateStr || !shiftName || !pointName || !employeeName || employeeName === 'NGHỈ BÁN') {
      continue
    }

    const employeeId = userMap.get(employeeName)
    const pointId = pointMap.get(pointName)
    const prodId = productMap.get(productName)

    if (!employeeId || !pointId || !prodId) continue

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) continue

    const shift = shiftName.toLowerCase().includes('sáng') ? 'SANG' : 'CHIEU'
    const shiftId = shiftMap.get(shift)
    if (!shiftId) continue

    try {
      // Create WorkSchedule
      const schedule = await prisma.workSchedule.upsert({
        where: {
          employeeId_workDate_shiftId: {
            employeeId,
            workDate: date,
            shiftId
          }
        },
        update: {},
        create: {
          employeeId,
          branchId: branch.id,
          sellingPointId: pointId,
          workDate: date,
          shiftId,
          shiftCode: shift,
          status: 'APPROVED',
          approvedById: admin!.id
        }
      })

      // Create Production
      await prisma.dailyProduction.create({
        data: {
          employeeId,
          branchId: branch.id,
          sellingPointId: pointId,
          workDate: date,
          shiftId,
          shiftCode: shift,
          quantity,
          baseSalary: 70000,
          bonusAmount: quantity >= 50 ? 500 * quantity : 0,
          commissionAmount: 0,
          totalSalary: 70000 + (quantity >= 50 ? 500 * quantity : 0),
          workScheduleId: schedule.id,
          isApproved: true,
          approvedById: admin!.id
        }
      })
      productionCount++
    } catch (err) {
      // Ignore duplicates
    }
  }
  
  console.log("Đã import thành công " + productionCount + " bản ghi năng suất.")

  // 7. Import Orders (Nhập hàng)
  console.log("Đang import đơn nhập hàng...")
  let importCount = 0
  for (const row of productsSheet) {
    const dateStr = row['Ngày Nhập']
    const productName = row['Loại hàng']?.trim()
    const qty = parseInt(row['Số lượng Nhập']) || 0
    const price = parseFloat(row['Đơn giá']) || 0
    const total = parseFloat(row['Thành Tiền']) || 0

    if (!dateStr || !productName || qty === 0) continue

    const prodId = productMap.get(productName)
    if (!prodId) continue
    
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) continue

    try {
      const order = await prisma.importOrder.create({
        data: {
          branchId: branch.id,
          importDate: date,
          totalAmount: total,
          createdById: admin!.id,
          status: 'APPROVED',
          items: {
            create: [
              {
                productId: prodId,
                quantity: qty,
                unitPrice: price,
                totalAmount: total
              }
            ]
          }
        }
      })
      importCount++
    } catch (e) {}
  }
  
  console.log("Đã import thành công " + importCount + " đơn nhập hàng.")
  console.log('Quá trình import hoàn tất!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
