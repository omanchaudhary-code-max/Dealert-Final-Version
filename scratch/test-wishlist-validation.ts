process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dealert'

import { validateWishlistTargetPrice, MIN_ENTRIES } from '../src/lib/wishlist-validation'
import { buildTargetPriceAlertMessage } from '../src/lib/email'

function assertEqual(actual: any, expected: any, testName: string) {
  if (actual === expected) {
    console.log(`✅ [PASS] ${testName}`)
  } else {
    console.error(`❌ [FAIL] ${testName}`)
    console.error(`   Expected: ${JSON.stringify(expected)}`)
    console.error(`   Actual:   ${JSON.stringify(actual)}`)
    process.exitCode = 1
  }
}

console.log('=== Running Wishlist Target-Price Realism Validation Tests ===\n')

// Test 1: Target price >= current price (Rule 1)
{
  const res = validateWishlistTargetPrice({
    targetPrice: 155000,
    currentPrice: 155000,
    allTimeLow: 150000,
    historyCount: 10,
  })
  assertEqual(res.valid, false, 'Rule 1: Equal price rejected')
  assertEqual(
    res.error,
    'Target price must be below the current price (Rs. 155000).',
    'Rule 1: Error message text'
  )
}

{
  const res = validateWishlistTargetPrice({
    targetPrice: 160000,
    currentPrice: 155000,
    allTimeLow: 150000,
    historyCount: 10,
  })
  assertEqual(res.valid, false, 'Rule 1: Higher price rejected')
  assertEqual(
    res.error,
    'Target price must be below the current price (Rs. 155000).',
    'Rule 1: Higher price message'
  )
}

// Test 2: Target price > 10% below all-time low (historyCount >= MIN_ENTRIES) (Rule 2)
{
  // allTimeLow = 150000 -> floorBound = 150000 * 0.9 = 135000
  const res = validateWishlistTargetPrice({
    targetPrice: 130000, // < 135000
    currentPrice: 155000,
    allTimeLow: 150000,
    historyCount: 8,
  })
  assertEqual(res.valid, false, 'Rule 2: >10% below all-time low rejected')
  assertEqual(
    res.error,
    'This product has never been priced below Rs. 150000 — try a target closer to that (minimum realistic target: Rs. 135000).',
    'Rule 2: Error message text'
  )
}

{
  // Valid target price (within 10% of allTimeLow)
  const res = validateWishlistTargetPrice({
    targetPrice: 140000, // >= 135000 and < 155000
    currentPrice: 155000,
    allTimeLow: 150000,
    historyCount: 8,
  })
  assertEqual(res.valid, true, 'Rule 2: Valid target price accepted')
}

// Test 3: Sparse history (< MIN_ENTRIES) 50% fallback rule (Rule 3)
{
  // currentPrice = 100000 -> fallbackFloor = 50000
  const res = validateWishlistTargetPrice({
    targetPrice: 40000, // < 50000
    currentPrice: 100000,
    allTimeLow: 90000,
    historyCount: 4, // < MIN_ENTRIES (7)
  })
  assertEqual(res.valid, false, 'Rule 3: Sparse history target < 50% current price rejected')
  assertEqual(
    res.error,
    'Not enough price history yet for this product to validate a target that far below the current price (Rs. 100000). Try a target no lower than Rs. 50000.',
    'Rule 3: Error message text'
  )
}

{
  // Valid target price for sparse history
  const res = validateWishlistTargetPrice({
    targetPrice: 60000, // >= 50000 and < 100000
    currentPrice: 100000,
    allTimeLow: 90000,
    historyCount: 4,
  })
  assertEqual(res.valid, true, 'Rule 3: Sparse history valid target accepted')
}

// Test 4a: targetPriceMin >= targetPrice (Rule 4a)
{
  const res = validateWishlistTargetPrice({
    targetPrice: 140000,
    targetPriceMin: 145000, // >= 140000
    currentPrice: 155000,
    allTimeLow: 150000,
    historyCount: 10,
  })
  assertEqual(res.valid, false, 'Rule 4a: targetPriceMin >= targetPrice rejected')
  assertEqual(
    res.error,
    'Your minimum price must be lower than your target price.',
    'Rule 4a: Error message text'
  )
}

// Test 4b: targetPriceMin below floor bound (Rule 4b)
{
  const res = validateWishlistTargetPrice({
    targetPrice: 140000,
    targetPriceMin: 120000, // < floorBound (135000)
    currentPrice: 155000,
    allTimeLow: 150000,
    historyCount: 10,
  })
  assertEqual(res.valid, false, 'Rule 4b: targetPriceMin below floor bound rejected')
  assertEqual(
    res.error,
    'This product has never been priced below Rs. 150000 — try a target closer to that (minimum realistic target: Rs. 135000).',
    'Rule 4b: Error message text'
  )
}

{
  // Valid range (floor and ceiling both valid)
  const res = validateWishlistTargetPrice({
    targetPrice: 140000,
    targetPriceMin: 136000,
    currentPrice: 155000,
    allTimeLow: 150000,
    historyCount: 10,
  })
  assertEqual(res.valid, true, 'Rule 4: Valid price range accepted')
}

console.log('\n=== Running Notification Message Wording Tests ===\n')

// Notification test 1: targetPriceMin is null (unbounded floor)
{
  const msg = buildTargetPriceAlertMessage({
    targetPrice: 140000,
    targetPriceMin: null,
    currentPrice: 138000,
  })
  assertEqual(msg, 'has dropped to or below your target price!', 'Notification: targetPriceMin null keeps original message')
}

// Notification test 2: currentPrice inside target range (targetPriceMin <= currentPrice <= targetPrice)
{
  const msg = buildTargetPriceAlertMessage({
    targetPrice: 140000,
    targetPriceMin: 130000,
    currentPrice: 135000,
  })
  assertEqual(
    msg,
    'Price dropped into your target range (Rs. 130000–140000) — now at Rs. 135000',
    'Notification: Inside target range message'
  )
}

// Notification test 3: currentPrice undershot target range (currentPrice < targetPriceMin)
{
  const msg = buildTargetPriceAlertMessage({
    targetPrice: 140000,
    targetPriceMin: 130000,
    currentPrice: 125000,
  })
  assertEqual(
    msg,
    'Price dropped even lower than expected — now at Rs. 125000 (below your Rs. 130000–140000 target range)',
    'Notification: Undershot target range message'
  )
}

console.log('\nAll tests completed!')
process.exit(0)
