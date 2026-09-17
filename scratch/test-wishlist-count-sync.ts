import { useToastStore } from '../src/hooks/useToast'

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

console.log('=== Testing Wishlist Count Sync & Free-Tier Cap Toast ===\n')

// Test 1: Initial toast store state
assertEqual(useToastStore.getState().toast, null, 'Initial toast is null')

// Test 2: Trigger Free-tier cap toast on 5th item add
useToastStore.getState().showToast({
  message: "You've reached your Free tier limit (5/5). Upgrade to Pro for unlimited wishlist items.",
  actionUrl: '/pricing',
  actionLabel: 'Upgrade to Pro',
  variant: 'warning',
})

const activeToast = useToastStore.getState().toast
assertEqual(
  activeToast?.message,
  "You've reached your Free tier limit (5/5). Upgrade to Pro for unlimited wishlist items.",
  'Toast message text matches'
)
assertEqual(activeToast?.actionUrl, '/pricing', 'Toast action URL points to /pricing')
assertEqual(activeToast?.actionLabel, 'Upgrade to Pro', 'Toast action label matches')

// Test 3: Dismiss toast
useToastStore.getState().hideToast()
assertEqual(useToastStore.getState().toast, null, 'Dismissing toast sets state to null')

console.log('\nAll tests completed!')
process.exit(0)
