import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=')
      const key = trimmed.substring(0, idx).trim()
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  }
}

async function checkDatabaseStats() {
  console.log('--- STARTING DB STATS AUDIT ---')

  const { getMongoDb } = await import('@/lib/mongodb')
  const { prisma } = await import('@/lib/prisma')

  // 1. Products Tracked (MongoDB)
  let mongoProductCount = 0
  let discountedProductsCount = 0
  let avgSavings = 0

  try {
    console.log('Connecting to MongoDB...')
    const db = await getMongoDb()
    mongoProductCount = await db.collection('products').countDocuments()
    console.log(`[MongoDB] Total products count: ${mongoProductCount}`)

    const products = await db.collection('products').find({}).toArray()
    console.log(`[MongoDB] Fetched ${products.length} raw product documents`)

    const discountedProducts = products.filter(
      (p) => p.original_price && p.last_price && p.original_price > p.last_price
    )
    discountedProductsCount = discountedProducts.length
    if (discountedProducts.length > 0) {
      const totalSavings = discountedProducts.reduce(
        (sum, p) => sum + (p.original_price - p.last_price),
        0
      )
      avgSavings = totalSavings / discountedProducts.length
      console.log(`[MongoDB] Discounted products count: ${discountedProducts.length}`)
      console.log(`[MongoDB] Average product savings: Rs. ${Math.round(avgSavings)}`)
    } else {
      console.log('[MongoDB] No products with original_price > last_price found in DB.')
    }
  } catch (err) {
    console.error('[MongoDB] Error querying products:', err)
  }

  // 2. Seller Snapshots & Reports (MongoDB)
  let flaggedPagesCount = 0
  let reportsCount = 0
  try {
    const db = await getMongoDb()
    const snapshots = await db.collection('seller_snapshots').find({}).toArray()
    flaggedPagesCount = snapshots.filter(
      (s) => s.result?.riskTier === 'MEDIUM' || s.result?.riskTier === 'HIGH'
    ).length
    reportsCount = await db.collection('community_reports').countDocuments()
    console.log(`[MongoDB] Total seller snapshots: ${snapshots.length}`)
    console.log(`[MongoDB] Medium/High risk seller snapshots: ${flaggedPagesCount}`)
    console.log(`[MongoDB] Total community reports: ${reportsCount}`)
  } catch (err) {
    console.error('[MongoDB] Error checking seller snapshots:', err)
  }

  // 3. PostgreSQL (Wishlist & Notification Logs)
  let wishlistCount = 0
  let notificationCount = 0
  try {
    console.log('Connecting to PostgreSQL (Prisma)...')
    wishlistCount = await prisma.wishlistItem.count()
    console.log(`[PostgreSQL] Total wishlist_items count: ${wishlistCount}`)

    notificationCount = await prisma.notificationLog.count()
    console.log(`[PostgreSQL] Total notification_logs count: ${notificationCount}`)
  } catch (err) {
    console.error('[PostgreSQL] Error querying Prisma:', err)
  }

  console.log('\n========================================')
  console.log('--- FINAL DIRECT DATABASE COUNTS SUMMARY ---')
  console.log(`1. Products Tracked: ${mongoProductCount}`)
  console.log(`2. Average Product Savings: Rs. ${Math.round(avgSavings)} (across ${discountedProductsCount} discounted products)`)
  console.log(`3. Alerts Sent (notification_logs): ${notificationCount}`)
  console.log(`4. Fake Pages Flagged (Scam Snapshots + Community Reports): ${flaggedPagesCount + reportsCount}`)
  console.log('========================================\n')

  await prisma.$disconnect()
  process.exit(0)
}

checkDatabaseStats().catch((err) => {
  console.error(err)
  process.exit(1)
})
