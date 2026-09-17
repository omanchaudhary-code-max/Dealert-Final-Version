import { runTrustCheck } from '../src/lib/trust-score'

async function main() {
  const result = await runTrustCheck('https://www.daraz.com.np')
  console.log('E2E Trust Check Result for daraz.com.np:')
  console.log(JSON.stringify(result, null, 2))
}

main().catch(console.error)
