// scripts/reset-discount.ts - Reset all discount to 0 for testing
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const r = await prisma.exportOrderItem.updateMany({
    where: {},
    data: { discountAmount: 0, bonusExcluded: false },
  })
  console.log("Reset discount:", r.count)
  await prisma.exportOrder.updateMany({ where: {}, data: { totalDiscount: 0 } })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
