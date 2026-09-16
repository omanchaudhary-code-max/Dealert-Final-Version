// lib/signals/domain-age.ts
import { appConfig } from '@/config/app.config'
import { logger } from '@/lib/logger'
import type { SignalResult } from '@/types/trust'

export async function checkDomainAge(domain: string): Promise<SignalResult> {
  const base: Omit<SignalResult, 'score' | 'detail' | 'available'> = {
    name: 'Domain/page age',
    weight: 20,
  }

  try {
    const res = await fetch(
      `https://${appConfig.rapidapi.whoisHost}/domains/${domain}/whois?follow=1&raw=false`,
      {
        headers: {
          'x-rapidapi-host': appConfig.rapidapi.whoisHost,
          'x-rapidapi-key': appConfig.rapidapi.key,
        },
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) throw new Error(`WHOIS API returned ${res.status}`)

    const data = await res.json()

    // Response is wrapped under a dynamic top-level key (the WHOIS
    // server hostname, e.g. "whois.verisign-grs.com") — grab whichever
    // key is present rather than assuming a fixed name.
    const whoisServerKey = Object.keys(data)[0]
    const record = whoisServerKey ? data[whoisServerKey] : null
    const createdDateStr = record?.['Created Date']

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
    logger.warn('Domain age check failed', { domain, err: err instanceof Error ? err.message : err })
    return { ...base, score: 0, detail: 'Could not verify domain age', available: false }
  }
}