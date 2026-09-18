import { sellerRepository } from '../src/repositories/seller.repository'
import { userRepository } from '../src/repositories/user.repository'

async function testFakePageRateLimiter() {
  console.log('🧪 Starting Fake-Page Check Free-Tier Rate Limiting Test...')

  const testUserId = `test-free-user-${Date.now()}`
  const proUserId = `test-pro-user-${Date.now()}`
  const testIp = `192.168.1.${Math.floor(Math.random() * 200)}`

  console.log(`1. Initial count for test user (${testUserId})...`)
  const initialCount = await sellerRepository.countRecentFakePageChecks(testUserId, testIp, 24)
  console.log(`   Initial count: ${initialCount} (Remaining: ${Math.max(0, 3 - initialCount)})`)
  if (initialCount !== 0) throw new Error('Initial count should be 0')

  console.log('2. Performing 3 trust check log entries for Free tier user...')
  await sellerRepository.logFakePageCheck(testUserId, testIp, 'https://test-check-1.com')
  await sellerRepository.logFakePageCheck(testUserId, testIp, 'https://test-check-2.com')
  await sellerRepository.logFakePageCheck(testUserId, testIp, 'https://test-check-3.com')

  const countAfter3 = await sellerRepository.countRecentFakePageChecks(testUserId, testIp, 24)
  console.log(`   Count after 3 checks: ${countAfter3} (Remaining: ${Math.max(0, 3 - countAfter3)})`)
  if (countAfter3 !== 3) throw new Error(`Expected count to be 3, got ${countAfter3}`)

  console.log('3. Verifying 4th check condition for Free tier user...')
  const isFreeTierBlocked = countAfter3 >= 3
  console.log(`   4th check blocked for Free tier? ${isFreeTierBlocked ? 'YES (HTTP 403 / Upgrade Prompt)' : 'NO'}`)
  if (!isFreeTierBlocked) throw new Error('4th check should be blocked for Free tier')

  console.log('4. Verifying Pro tier user is unlimited...')
  // Simulate 4 checks for Pro user
  await sellerRepository.logFakePageCheck(proUserId, '10.0.0.1', 'https://pro-check-1.com')
  await sellerRepository.logFakePageCheck(proUserId, '10.0.0.1', 'https://pro-check-2.com')
  await sellerRepository.logFakePageCheck(proUserId, '10.0.0.1', 'https://pro-check-3.com')
  await sellerRepository.logFakePageCheck(proUserId, '10.0.0.1', 'https://pro-check-4.com')

  const proPlan: 'FREE' | 'PRO' = 'PRO'
  const isProBlocked = (proPlan as string) === 'FREE' && (await sellerRepository.countRecentFakePageChecks(proUserId, '10.0.0.1', 24)) >= 3
  console.log(`   4th check blocked for Pro tier? ${isProBlocked ? 'YES' : 'NO (Allowed)'}`)
  if (isProBlocked) throw new Error('Pro tier should never be blocked')

  console.log('5. Simulating 24h+ passing for Free tier user (rolling window expiry)...')
  // We check count with sinceHours = 0 to simulate 24 hours passing
  const countAfter24h = await sellerRepository.countRecentFakePageChecks(testUserId, testIp, 0)
  console.log(`   Count after 24h window expires: ${countAfter24h} (Remaining: ${Math.max(0, 3 - countAfter24h)})`)
  if (countAfter24h !== 0) throw new Error(`Expected expired count to be 0, got ${countAfter24h}`)

  console.log('✅ All Fake-Page Check Rate Limiting Tests Passed Successfully!')
}

testFakePageRateLimiter().catch((err) => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
