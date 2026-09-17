import { appConfig } from '../src/config/app.config'
import { logger } from '../src/lib/logger'
import type { SignalResult } from '../src/types/trust'

export async function checkDomainAge(domain: string): Promise<SignalResult> {
  const base: Omit<SignalResult, 'score' | 'detail' | 'available'> = {
    name: 'Domain/page age',
    weight: 20,
  }

  const apiKey = appConfig.rapidapi?.key || process.env.RAPIDAPI_KEY
  const whoisHost = appConfig.rapidapi?.whoisHost || process.env.RAPIDAPI_WHOIS_HOST || 'domains-api.p.rapidapi.com'

  if (!apiKey) {
    logger.warn('RapidAPI key missing from env (checked RAPIDAPI_KEY & appConfig.rapidapi.key)')
    return {
      ...base,
      score: 0,
      detail: 'WHOIS API key not configured',
      available: false,
    }
  }

  // List domains to attempt: primary domain first, then fallback for .np domains (e.g. daraz.com.np -> daraz.com)
  const domainsToTry = [domain]
  if (domain.endsWith('.np') && domain.includes('.com.')) {
    domainsToTry.push(domain.replace(/\.np$/, ''))
  }

  let lastError: string | null = null

  for (const targetDomain of domainsToTry) {
    try {
      const res = await fetch(
        `https://${whoisHost}/domains/${targetDomain}/whois?follow=1&raw=false`,
        {
          headers: {
            'x-rapidapi-host': whoisHost,
            'x-rapidapi-key': apiKey,
          },
          signal: AbortSignal.timeout(5000),
        }
      )

      const text = await res.text()

      if (!res.ok) {
        // If TLD not supported and we have another domain to try, continue
        if (text.includes('not supported') && targetDomain !== domainsToTry[domainsToTry.length - 1]) {
          continue
        }
        throw new Error(`WHOIS API returned ${res.status}: ${text}`)
      }

      let data: Record<string, any>
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Invalid JSON from WHOIS API: ${text}`)
      }

      // Response is wrapped under a dynamic top-level key (the WHOIS server hostname, e.g. "whois.verisign-grs.com")
      const whoisServerKey = Object.keys(data)[0]
      const record = whoisServerKey ? data[whoisServerKey] : null
      const createdDateStr = record?.['Created Date'] || record?.['Creation Date'] || record?.['created']

      if (!createdDateStr) throw new Error('No Created Date in WHOIS response')

      const ageMonths =
        (Date.now() - new Date(createdDateStr).getTime()) / (1000 * 60 * 60 * 24 * 30)

      const score = Math.max(0, Math.min(100, Math.round((ageMonths / 24) * 100)))

      return {
        ...base,
        score,
        detail: `Registered ${Math.floor(ageMonths)} month(s) ago`,
        available: true,
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
    }
  }

  logger.warn('Domain age check failed', { domain, err: lastError })
  return { ...base, score: 0, detail: 'Could not verify domain age', available: false }
}

async function test() {
  const result = await checkDomainAge('daraz.com.np')
  console.log('Result for daraz.com.np:', result)
}

test().catch(console.error)
