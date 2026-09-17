import { appConfig } from '../src/config/app.config'

async function testWhois(domain: string) {
  const apiKey = process.env.RAPIDAPI_KEY || appConfig.rapidapi?.key
  const whoisHost = process.env.RAPIDAPI_WHOIS_HOST || appConfig.rapidapi?.whoisHost

  console.log(`\n--- Testing domain: ${domain} ---`)
  const url = `https://${whoisHost}/domains/${domain}/whois?follow=1&raw=false`

  const res = await fetch(url, {
    headers: {
      'x-rapidapi-host': whoisHost!,
      'x-rapidapi-key': apiKey!,
    },
  })

  console.log('Response Status:', res.status, res.statusText)
  const text = await res.text()
  console.log('Response Body:', text)
}

async function main() {
  await testWhois('daraz.com.np')
  await testWhois('daraz.com')
  await testWhois('amazon.com')
}

main().catch(console.error)
