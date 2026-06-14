// scripts/seed-inventory.ts - Insert test inventory records
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Get first branch
  const branch = await prisma.branch.findFirst()
  if (!branch) {
    console.log("No branch found")
    return
  }
  // Get all products
  const products = await prisma.product.findMany({ take: 5 })
  if (products.length === 0) {
    console.log("No products found")
    return
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  let count = 0
  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const opening = 100 - i * 10
    const importQty = 50
    const exportQty = 30 + i * 5
    const gifted = 2
    const closing = opening + importQty - exportQty - gifted

    // Today
    await prisma.inventory.upsert({
      where: {
        branchId_productId_date: {
          branchId: branch.id,
          productId: p.id,
          date: today,
        },
      },
      create: {
        branchId: branch.id,
        productId: p.id,
        date: today,
        openingStock: opening,
        importQuantity: importQty,
        exportQuantity: exportQty,
        giftedQuantity: gifted,
        closingStock: closing,
      },
      update: {
        openingStock: opening,
        importQuantity: importQty,
        exportQuantity: exportQty,
        giftedQuantity: gifted,
        closingStock: closing,
      },
    })
    count++

    // Low stock scenario for first product
    if (i === 0) {
      await prisma.inventory.upsert({
        where: {
          branchId_productId_date: {
            branchId: branch.id,
            productId: p.id,
            date: yesterday,
          },
        },
        create: {
          branchId: branch.id,
          productId: p.id,
          date: yesterday,
          openingStock: 50,
          importQuantity: 0,
          exportQuantity: 48,
          giftedQuantity: 0,
          closingStock: 2, // low stock
        },
        update: {
          closingStock: 2,
        },
      })
    }
  }
  console.log(`Seeded ${count} inventory records for branch ${branch.name}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
