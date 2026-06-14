// scripts/cleanup-test-data.ts - Remove test data created during discount testing
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Remove test productions (created today with SANG shift + note starting with "Test")
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setUTCHours(23, 59, 59, 999)

  const testProds = await prisma.dailyProduction.findMany({
    where: {
      workDate: { gte: todayStart, lte: todayEnd },
      note: { contains: "Test" },
    },
    select: { id: true },
  })
  if (testProds.length) {
    const del = await prisma.dailyProduction.deleteMany({
      where: { id: { in: testProds.map((p) => p.id) } },
    })
    console.log(`Deleted ${del.count} test productions`)
  } else {
    console.log("No test productions to clean")
  }

  // Reset all discount to 0
  const r = await prisma.exportOrderItem.updateMany({
    where: {},
    data: { discountAmount: 0, bonusExcluded: false },
  })
  console.log(`Reset ${r.count} export order items discount`)
  await prisma.exportOrder.updateMany({ where: {}, data: { totalDiscount: 0 } })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
