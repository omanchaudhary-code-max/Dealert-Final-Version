import dns from 'dns'
import net from 'net'
import { checkDomainAge } from '@/lib/signals/domain-age'
import { checkSslValidity } from '@/lib/signals/ssl-validity'
import { checkUrlPattern } from '@/lib/signals/url-pattern'
import { checkSafeBrowsing } from '@/lib/signals/safe-browsing'
import { sellerRepository, isSharedHostingDomain } from '@/repositories/seller.repository'
import type { RiskTier, SignalResult, TrustCheckResult } from '@/types/trust'

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number)
    const [a, b] = parts
    if (a === 10) return true
    if (a === 127) return true
    if (a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true
    if (a >= 224) return true
    return false
  }
  if (net.isIPv6(ip)) {
    const norm = ip.toLowerCase()
    if (norm === '::1' || norm === '::') return true
    if (norm.startsWith('fe80:') || norm.startsWith('fc') || norm.startsWith('fd')) return true
    return false
  }
  return false
}

export async function assertPublicHost(rawUrl: string): Promise<{ url: URL; domain: string }> {
  let parsed: URL
  const trimmed = rawUrl.trim()
  try {
    parsed = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`)
  } catch {
    throw new Error('Invalid URL format')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Invalid URL protocol. Only HTTP and HTTPS are supported.')
  }

  const hostname = parsed.hostname.toLowerCase()
  if (!hostname) throw new Error('Invalid domain or hostname')

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error('Blocked host: Private or internal IP address target')
    }
  } else {
    try {
      const addresses = await dns.promises.lookup(hostname, { all: true })
      for (const addr of addresses) {
        if (isPrivateIp(addr.address)) {
          throw new Error('Blocked host: Private or internal IP address target')
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes('Blocked host')) throw err
      throw new Error(`Domain resolution failed for "${hostname}"`)
    }
  }

  return { url: parsed, domain: hostname }
}

function scoreToTier(score: number): RiskTier {
  if (score >= 70) return 'LOW'
  if (score >= 40) return 'MEDIUM'
  return 'HIGH'
}

async function checkVerifiedSeller(domain: string, fullUrl: string): Promise<SignalResult & { isVerifiedMatch: boolean }> {
  try {
    const verified = await sellerRepository.findVerifiedSeller(domain, fullUrl)
    if (verified) {
      const sellerName = verified.sellerName || (verified as any).name || (verified as any).seller_type || 'Verified Merchant'
      return {
        name: 'Verified seller database match',
        weight: 25,
        score: 100,
        detail: `Matched with official Dealert Verified Seller database (${sellerName})`,
        available: true,
        isVerifiedMatch: true,
      }
    }
    return {
      name: 'Verified seller database match',
      weight: 25,
      score: 0,
      detail: 'Not listed in verified seller registry',
      available: true,
      isVerifiedMatch: false,
    }
  } catch {
    return {
      name: 'Verified seller database match',
      weight: 25,
      score: 0,
      detail: 'Could not query verified seller database',
      available: false,
      isVerifiedMatch: false,
    }
  }
}

async function checkCommunityReports(domain: string): Promise<SignalResult> {
  try {
    const count = await sellerRepository.getDistinctCommunityReportCount(domain, 90)
    let score = 100
    if (count === 1) score = 70
    else if (count === 2) score = 40
    else if (count >= 3) score = 0

    return {
      name: 'Community scam reports',
      weight: 5,
      score,
      detail: count === 0 ? 'No user scam reports in last 90 days' : `${count} distinct user report(s) in last 90 days`,
      available: true,
    }
  } catch {
    return {
      name: 'Community scam reports',
      weight: 5,
      score: 0,
      detail: 'Could not query community reports database',
      available: false,
    }
  }
}

export async function runTrustCheck(rawUrl: string): Promise<TrustCheckResult> {
  const { url, domain } = await assertPublicHost(rawUrl)
  const fullUrl = url.toString()
  const isSharedHosting = isSharedHostingDomain(domain)

  // 1. Check fresh snapshot cache (only for single-tenant sites)
  if (!isSharedHosting) {
    const cached = await sellerRepository.getFreshSnapshot(domain)
    if (cached) {
      return {
        ...cached,
        url: fullUrl,
      }
    }
  }

  // 2. Evaluate signals (exclude domain-age & SSL for shared-hosting platforms)
  const domainAgePromise = isSharedHosting
    ? Promise.resolve({
        name: 'Domain/page age',
        weight: 20,
        score: 0,
        detail: 'Not applicable — shared hosting platform',
        available: false,
      })
    : checkDomainAge(domain)

  const sslPromise = isSharedHosting
    ? Promise.resolve({
        name: 'SSL certificate validity',
        weight: 15,
        score: 0,
        detail: 'Not applicable — shared hosting platform',
        available: false,
      })
    : checkSslValidity(domain)

  const [domainAge, ssl, verifiedSeller, urlPattern, safeBrowsing, communityReports] = await Promise.all([
    domainAgePromise,
    sslPromise,
    checkVerifiedSeller(domain, fullUrl),
    checkUrlPattern(domain, isSharedHosting),
    checkSafeBrowsing(fullUrl),
    checkCommunityReports(domain),
  ])

  const signals: SignalResult[] = [
    domainAge,
    ssl,
    {
      name: verifiedSeller.name,
      weight: verifiedSeller.weight,
      score: verifiedSeller.score,
      detail: verifiedSeller.detail,
      available: verifiedSeller.available,
    },
    urlPattern,
    {
      name: safeBrowsing.name,
      weight: safeBrowsing.weight,
      score: safeBrowsing.score,
      detail: safeBrowsing.detail,
      available: safeBrowsing.available,
    },
    communityReports,
  ]

  // 3. Score calculation with weight redistribution across available signals
  const availableSignals = signals.filter((s) => s.available)
  const totalAvailableWeight = availableSignals.reduce((acc, s) => acc + s.weight, 0)

  let overallScore = 50
  if (totalAvailableWeight > 0) {
    const weightedSum = availableSignals.reduce((acc, s) => acc + s.score * s.weight, 0)
    overallScore = Math.round(weightedSum / totalAvailableWeight)
  }

  let overrideApplied: TrustCheckResult['overrideApplied'] = null
  let riskTier = scoreToTier(overallScore)

  if (verifiedSeller.isVerifiedMatch) {
    overrideApplied = 'VERIFIED_SELLER'
    riskTier = 'LOW'
    overallScore = 100
  }

  if (safeBrowsing.flaggedMalicious) {
    overrideApplied = 'SAFE_BROWSING_FLAGGED'
    riskTier = 'HIGH'
    overallScore = Math.min(overallScore, 10)
  }

  const result: TrustCheckResult = {
    url: fullUrl,
    domain,
    riskTier,
    overallScore,
    signals,
    overrideApplied,
    checkedAt: new Date(),
  }

  if (!isSharedHosting) {
    await sellerRepository.saveSnapshot(domain, result)
  }
  return result
}
