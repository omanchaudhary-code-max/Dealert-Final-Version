import { checkDomainAge } from '../src/lib/signals/domain-age'
import { appConfig } from '../src/config/app.config'

async function main() {
  console.log('appConfig.rapidapi:', appConfig.rapidapi)
  const result = await checkDomainAge('daraz.com.np')
  console.log('checkDomainAge result:', result)
}

main().catch(console.error)
