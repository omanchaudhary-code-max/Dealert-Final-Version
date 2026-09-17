import { checkSafeBrowsing } from '../src/lib/signals/safe-browsing'

async function main() {
  const result = await checkSafeBrowsing('https://www.daraz.com.np')
  console.log('checkSafeBrowsing result:', result)
}

main().catch(console.error)
