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

async function runFullAudit() {
  const { getMongoDb } = await import('@/lib/mongodb')
  const { prisma } = await import('@/lib/prisma')

  const db = await getMongoDb()

  // 1. Products Tracked
  const totalProductsCount = await db.collection('products').countDocuments()
  const distinctItemsInPriceHistory = (await db.collection('price_history').distinct('item_id')).length

  // 2. Avg Savings (Latest price per product)
  const latestPricePipeline = [
    { $sort: { scraped_at: -1 } },
    {
      $group: {
        _id: '$item_id',
        latestDoc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$latestDoc' } },
    {
      $match: {
        original_price: { $ne: null },
        current_price: { $ne: null },
        $expr: { $gt: ['$original_price', '$current_price'] },
      },
    },
    {
      $group: {
        _id: null,
        avgSavings: { $avg: { $subtract: ['$original_price', '$current_price'] } },
        totalDiscountedProducts: { $sum: 1 },
      },
    },
  ]

  const avgSavingsResult = await db.collection('price_history').aggregate(latestPricePipeline).toArray()
  const avgSavings = Math.round(avgSavingsResult[0]?.avgSavings ?? 0)
  const totalDiscountedCount = avgSavingsResult[0]?.totalDiscountedProducts ?? 0

  // 3. Alerts Sent (Postgres notification_logs)
  let notificationLogsCount = 0
  try {
    notificationLogsCount = await prisma.notificationLog.count()
  } catch (e) {
    console.error('Prisma notificationLog count error:', e)
  }

  // 4. Fake Pages Flagged
  const sellerSnapshots = await db.collection('seller_snapshots').find({}).toArray()
  const flaggedSnapshotsCount = sellerSnapshots.filter(
    (s) => s.result?.riskTier === 'MEDIUM' || s.result?.riskTier === 'HIGH'
  ).length
  const communityReportsCount = await db.collection('community_reports').countDocuments()

  console.log('\n========================================')
  console.log('--- ACCURATE DB AUDIT RESULTS ---')
  console.log(`1. Products Tracked (MongoDB 'products'): ${totalProductsCount}`)
  console.log(`   Distinct items with price history: ${distinctItemsInPriceHistory}`)
  console.log(`2. Avg. Savings (Latest discount per item): Rs. ${avgSavings.toLocaleString()} (across ${totalDiscountedCount} discounted items)`)
  console.log(`3. Alerts Sent (PostgreSQL 'notification_logs'): ${notificationLogsCount}`)
  console.log(`4. Fake Pages Flagged (Snapshots Medium/High + Scam Reports): ${flaggedSnapshotsCount + communityReportsCount}`)
  console.log(`   - Medium/High risk snapshots: ${flaggedSnapshotsCount}`)
  console.log(`   - Community scam reports: ${communityReportsCount}`)
  console.log('========================================\n')

  await prisma.$disconnect()
  process.exit(0)
}

runFullAudit().catch(console.error)
