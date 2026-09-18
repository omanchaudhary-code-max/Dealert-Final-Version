import { prisma } from '../src/lib/prisma'
import { notificationRepository } from '../src/repositories/notification.repository'
import { notificationService } from '../src/services/notification.service'

async function testNotificationReadPersistence() {
  console.log('=== Testing Notification Read Persistence End-to-End ===\n')

  // 1. Get or create a test user and alert
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName: 'Test User',
        email: `test-${Date.now()}@dealert.com`,
      },
    })
  }

  let alert = await prisma.alert.findFirst({ where: { userId: user.id } })
  if (!alert) {
    alert = await prisma.alert.create({
      data: {
        userId: user.id,
        productId: 'prod-test-123',
        targetPrice: 1000,
      },
    })
  }

  // 2. Create notification logs with isRead = false
  console.log(`[TEST] Creating 3 unread test notification logs for user ${user.email}...`)
  const log1 = await prisma.notificationLog.create({
    data: {
      userId: user.id,
      alertId: alert.id,
      email: user.email,
      message: 'Test notification 1',
      isRead: false,
      status: 'SENT',
    },
  })

  const log2 = await prisma.notificationLog.create({
    data: {
      userId: user.id,
      alertId: alert.id,
      email: user.email,
      message: 'Test notification 2',
      isRead: false,
      status: 'SENT',
    },
  })

  const log3 = await prisma.notificationLog.create({
    data: {
      userId: user.id,
      alertId: alert.id,
      email: user.email,
      message: 'Test notification 3',
      isRead: false,
      status: 'SENT',
    },
  })

  // Verify initial unread count
  const initialUnreadCount = await notificationService.getUnreadCount(user.id)
  console.log(`[PASS] Initial unread count in DB: ${initialUnreadCount}`)

  // 3. Mark log1 as read
  console.log(`\n[TEST] Marking notification log1 (${log1.id}) as read...`)
  await notificationService.markAsRead(log1.id, user.id)

  // Direct database inspection of log1
  const updatedLog1 = await prisma.notificationLog.findUnique({ where: { id: log1.id } })
  console.log(`[DB VERIFY] log1 isRead status in DB: ${updatedLog1?.isRead}`)
  if (updatedLog1?.isRead !== true) {
    throw new Error('FAIL: log1 isRead was not set to true in database!')
  }

  // Verify unread count decreased by 1
  const unreadAfterSingleMark = await notificationService.getUnreadCount(user.id)
  console.log(`[PASS] Unread count after single mark: ${unreadAfterSingleMark} (decreased by 1)`)

  // 4. Test Bulk Mark All Read
  console.log(`\n[TEST] Executing bulk markAllAsRead for user ${user.id}...`)
  await notificationService.markAllAsRead(user.id)

  // Direct database inspection of log2 and log3
  const updatedLog2 = await prisma.notificationLog.findUnique({ where: { id: log2.id } })
  const updatedLog3 = await prisma.notificationLog.findUnique({ where: { id: log3.id } })
  console.log(`[DB VERIFY] log2 isRead status in DB: ${updatedLog2?.isRead}`)
  console.log(`[DB VERIFY] log3 isRead status in DB: ${updatedLog3?.isRead}`)

  if (updatedLog2?.isRead !== true || updatedLog3?.isRead !== true) {
    throw new Error('FAIL: Bulk markAllAsRead failed to set all logs to isRead: true in database!')
  }

  // Verify final unread count is 0 for these logs
  const finalUnreadCount = await notificationService.getUnreadCount(user.id)
  console.log(`[PASS] Final unread count in DB for user: ${finalUnreadCount}`)

  // Cleanup test logs
  await prisma.notificationLog.deleteMany({
    where: { id: { in: [log1.id, log2.id, log3.id] } },
  })

  console.log('\n=== ALL PERSISTENCE TESTS PASSED SUCCESSFULLY! ===')
}

testNotificationReadPersistence()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test failed with error:', err)
    process.exit(1)
  })
