import { prisma } from '../src/lib/prisma'

async function testLiveDbQueries() {
  console.log('=== Testing Live Database Prisma Queries ===\n')

  // 1. Query wishlist_items with target_price_min
  console.log('1. Testing wishlistItem.findMany()...')
  const wishlistItems = await prisma.wishlistItem.findMany({ take: 5 })
  console.log(`   Found ${wishlistItems.length} wishlist items. TargetPriceMin accessible:`, wishlistItems.map(i => i.targetPriceMin))

  // 2. Query alerts with target_price_min
  console.log('2. Testing alert.findMany()...')
  const alerts = await prisma.alert.findMany({ take: 5 })
  console.log(`   Found ${alerts.length} alerts. TargetPriceMin accessible:`, alerts.map(a => a.targetPriceMin))

  // 3. Query notification_logs with message
  console.log('3. Testing notificationLog.findMany()...')
  const notifs = await prisma.notificationLog.findMany({ take: 5 })
  console.log(`   Found ${notifs.length} notification logs. Message accessible:`, notifs.map(n => n.message))

  // 4. Test wishlistItem.create with targetPriceMin
  console.log('4. Testing wishlistItem.create with targetPriceMin...')
  const testUser = await prisma.user.findFirst()
  if (testUser) {
    const testItemId = `test-prod-${Date.now()}`
    const created = await prisma.wishlistItem.create({
      data: {
        userId: testUser.id,
        productId: testItemId,
        itemId: testItemId,
        wishlistedPrice: 1000,
        targetPrice: 900,
        targetPriceMin: 800,
      }
    })
    console.log('   Successfully created item:', created.id, 'targetPriceMin:', created.targetPriceMin)

    // Clean up test item
    await prisma.wishlistItem.delete({ where: { id: created.id } })
    console.log('   Successfully cleaned up test item.')
  }

  console.log('\nAll database query tests passed successfully!')
}

testLiveDbQueries()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Database query test failed:', err)
    process.exit(1)
  })
