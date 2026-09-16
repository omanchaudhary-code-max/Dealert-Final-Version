import type { SignalResult } from '@/types/trust'

const IP_HOST_PATTERN = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
const SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top']
const LEGIT_DOMAIN_REFERENCE = 'daraz.com.np'

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}

export function checkUrlPattern(domain: string, isSharedHosting = false): SignalResult {
  const base: Omit<SignalResult, 'score' | 'detail' | 'available'> = {
    name: 'URL pattern / typosquatting',
    weight: 15,
  }

  const flags: string[] = []
  let score = 100

  if (IP_HOST_PATTERN.test(domain)) {
    flags.push('hostname is a raw IP address')
    score -= 50
  }

  if (SUSPICIOUS_TLDS.some((tld) => domain.endsWith(tld))) {
    flags.push('uses a commonly-abused free TLD')
    score -= 30
  }

  const hyphenCount = (domain.match(/-/g) || []).length
  if (hyphenCount >= 3) {
    flags.push('excessive hyphens')
    score -= 15
  }

  const digitCount = (domain.match(/\d/g) || []).length
  if (digitCount >= 4) {
    flags.push('excessive digits')
    score -= 10
  }

  // Typosquat check: close-but-not-exact match to daraz.com.np (skip for shared hosting like Facebook/Instagram)
  if (!isSharedHosting) {
    const dist = levenshtein(domain, LEGIT_DOMAIN_REFERENCE)
    if (dist > 0 && dist <= 3 && domain !== LEGIT_DOMAIN_REFERENCE) {
      flags.push(`suspiciously close to "${LEGIT_DOMAIN_REFERENCE}" (edit distance ${dist})`)
      score -= 60
    }
  }

  score = Math.max(0, score)

  return {
    ...base,
    score,
    detail: flags.length > 0 ? flags.join('; ') : isSharedHosting ? 'Clean page URL structure' : 'No red flags detected',
    available: true,
  }
}
