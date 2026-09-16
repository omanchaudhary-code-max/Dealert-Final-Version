import { appConfig } from '@/config/app.config'
import { logger } from '@/lib/logger'
import type { SignalResult } from '@/types/trust'

export async function checkSafeBrowsing(
  fullUrl: string
): Promise<SignalResult & { flaggedMalicious: boolean }> {
  const base: Omit<SignalResult, 'score' | 'detail' | 'available'> = {
    name: 'Google Safe Browsing',
    weight: 20,
  }

  const apiKey =
    appConfig.googleSafeBrowsing.apiKey ||
    process.env.GOOGLE_SAFE_BROWSING_KEY ||
    process.env.GOOGLE_SAFE_BROWSING_API_KEY
  if (!apiKey) {
    logger.warn('Safe Browsing API key missing from env (checked GOOGLE_SAFE_BROWSING_KEY & GOOGLE_SAFE_BROWSING_API_KEY)')
    return {
      ...base,
      score: 100,
      detail: 'Safe Browsing API key not configured',
      available: false,
      flaggedMalicious: false,
    }
  }

  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'dealert-sptdas', clientVersion: '1.0.0' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url: fullUrl }],
          },
        }),
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) throw new Error(`Safe Browsing API returned ${res.status}`)

    const data = await res.json()
    const isFlagged = Array.isArray(data.matches) && data.matches.length > 0

    return {
      ...base,
      score: isFlagged ? 0 : 100,
      detail: isFlagged
        ? `Flagged: ${data.matches[0]?.threatType ?? 'unknown threat'}`
        : 'Not listed on any known threat list',
      available: true,
      flaggedMalicious: isFlagged,
    }
  } catch (err) {
    logger.warn('Safe Browsing check failed', { fullUrl, err: err instanceof Error ? err.message : err })
    return { ...base, score: 0, detail: 'Could not check Safe Browsing', available: false, flaggedMalicious: false }
  }
}
