import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Bắt đầu seed database...\n")

  // 1. Tạo Organization
  const org = await prisma.organization.create({
    data: { name: "Cơm Nắm Việt Nam" },
  })
  console.log("✅ Created Organization:", org.name)

  // 2. Tạo Branch
  const branch = await prisma.branch.create({
    data: {
      organizationId: org.id,
      name: "Chi nhánh Hà Nội",
      code: "CN_HN_01",
    },
  })
  console.log("✅ Created Branch:", branch.name)

  // 3. Tạo Departments
  const deptProduction = await prisma.department.create({
    data: { branchId: branch.id, name: "Phòng Sản Xuất", code: "SX" },
  })
  const deptSales = await prisma.department.create({
    data: { branchId: branch.id, name: "Phòng Kinh Doanh", code: "KD" },
  })
  console.log("✅ Created Departments:", deptProduction.name, deptSales.name)

  // 4. Tạo SellingPoints với groups
  // GROUP_1: Xa - 80k/ca | GROUP_2: Gần - 70k/ca
  const sellingPoints = [
    { name: "Xuân La (VTD)", code: "VTD", group: "GROUP_1", salaryPerShift: 80000 },
    { name: "Xuân Đỉnh (XL)", code: "XL", group: "GROUP_2", salaryPerShift: 70000 },
    { name: "Xuân Đỉnh Sau", code: "XD_SAU", group: "GROUP_2", salaryPerShift: 70000 },
    { name: "Cổ Nhuế A", code: "CN_A", group: "GROUP_2", salaryPerShift: 70000 },
    { name: "Cổ Nhuế B", code: "CN_B", group: "GROUP_2", salaryPerShift: 70000 },
    { name: "Đông Ngạc", code: "DA", group: "GROUP_2", salaryPerShift: 70000 },
    { name: "Đông Ngạc A", code: "DA_A", group: "GROUP_1", salaryPerShift: 80000 },
    { name: "Đông Ngạc B", code: "DA_B", group: "GROUP_1", salaryPerShift: 80000 },
    { name: "Thụy Phương", code: "TP", group: "GROUP_2", salaryPerShift: 70000 },
  ]

  for (const sp of sellingPoints) {
    await prisma.sellingPoint.create({
      data: { ...sp, branchId: branch.id },
    })
  }
  console.log("✅ Created SellingPoints:", sellingPoints.length, "điểm bán")

  // 5. Tạo Products
  const products = [
    { name: "Thanh cua trứng Mayo", code: "TC_MAYO", costPrice: 13000, sellingPrice: 20000 },
    { name: "Pate phô mai kéo sợi", code: "PATE", costPrice: 13000, sellingPrice: 20000 },
    { name: "Heo cao bồi xúc xích", code: "HEO", costPrice: 13000, sellingPrice: 20000 },
    { name: "Gà tomyum", code: "GA_TOMYUM", costPrice: 13000, sellingPrice: 20000 },
    { name: "Gà teriyaki", code: "GA_TERI", costPrice: 13000, sellingPrice: 20000 },
    { name: "Bò BBQ", code: "BO_BBQ", costPrice: 13000, sellingPrice: 20000 },
    { name: "Tôm đút lò", code: "TOM", costPrice: 13000, sellingPrice: 20000 },
    { name: "Cá ngừ", code: "CA_NGU", costPrice: 16000, sellingPrice: 22000 },
    { name: "Chả cá xốt cay", code: "CHA_CA", costPrice: 13000, sellingPrice: 20000 },
    { name: "Trứng xúc xích mayo", code: "TRUNG", costPrice: 13000, sellingPrice: 20000 },
    { name: "Cá hồi mayo", code: "CA_HOI", costPrice: 16000, sellingPrice: 20000 },
    { name: "Xúc xích siêu phomai", code: "XX_PHAI", costPrice: 13000, sellingPrice: 20000 },
  ]

  for (const p of products) {
    await prisma.product.create({
      data: { ...p, branchId: null },
    })
  }
  console.log("✅ Created Products:", products.length, "sản phẩm")

  // 6. Tạo CostCategories
  const costCategories = [
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

  for (const c of costCategories) {
    await prisma.costCategory.create({ data: c })
  }
  console.log("✅ Created CostCategories:", costCategories.length, "danh mục")

  // 7. Tạo Users
  const hashedPassword = await bcrypt.hash("admin123", 12)

  // Admin (Tổng GD)
  await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      fullName: "Nguyễn Văn Admin",
      email: "admin@qlcn.vn",
      role: "ADMIN",
      branchId: null,
    },
  })

  // Branch Director
  await prisma.user.create({
    data: {
      username: "gdcn",
      password: hashedPassword,
      fullName: "Trần Thị GD",
      email: "gdcn@qlcn.vn",
      role: "BRANCH_DIRECTOR",
      branchId: branch.id,
    },
  })

  // Department Head
  await prisma.user.create({
    data: {
      username: "tp",
      password: hashedPassword,
      fullName: "Lê Văn TP",
      email: "tp@qlcn.vn",
      role: "DEPARTMENT_HEAD",
      branchId: branch.id,
      departmentId: deptProduction.id,
    },
  })

  // Employee
  await prisma.user.create({
    data: {
      username: "nv",
      password: hashedPassword,
      fullName: "Phạm Thị NV",
      email: "nv@qlcn.vn",
      role: "EMPLOYEE",
      branchId: branch.id,
      departmentId: deptProduction.id,
    },
  })

  console.log("✅ Created Users: admin, gdcn, tp, nv")
  console.log("\n🎉 Seed hoàn tất!")
  console.log("\n📝 Tài khoản đăng nhập:")
  console.log("   Admin: admin / admin123")
  console.log("   GD CN: gdcn / admin123")
  console.log("   Trưởng Phòng: tp / admin123")
  console.log("   Nhân Viên: nv / admin123")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
