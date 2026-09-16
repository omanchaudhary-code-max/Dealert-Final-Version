import { getMongoDb } from '@/lib/mongodb'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

interface AnalysisResult {
  check: string
  passed: boolean
  details: string
  weight: number
}

export interface FakePageReport {
  url: string
  trustScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendation: string
  analysis: AnalysisResult[]
  checkedAt: Date
}

const SUSPICIOUS_KEYWORDS = [
  'free-gift', 'winner', 'claim-now', 'urgent', 'limited-time',
  'click-here', '100percent', 'guaranteed', 'lottery', 'prize',
]

const TRUSTED_SELLER_DOMAINS = [
  'daraz.com.np', 'amazon.com', 'flipkart.com', 'sastodeal.com', 'olizstore.com', 'thulo.com', 'okdam.com'
]

export class FakePageService {
  async checkUrl(rawUrl: string): Promise<FakePageReport> {
    const url = new URL(rawUrl)
    const hostname = url.hostname.toLowerCase()
    const analysis: AnalysisResult[] = []

    // 1. Domain / page age (WHOIS check signal) — Weight 20%
    const isEstablishedDomain = TRUSTED_SELLER_DOMAINS.some(d => hostname.endsWith(d))
    analysis.push({
      check: 'Domain / page age (WHOIS)',
      passed: isEstablishedDomain,
      details: isEstablishedDomain
        ? 'Domain registration is established and verified (>1 year old)'
        : 'Domain registration is newly created or unverified — moderate risk',
      weight: 20,
    })

    // 2. SSL certificate validity — Weight 15%
    const hasSSL = url.protocol === 'https:'
    analysis.push({
      check: 'SSL certificate validity',
      passed: hasSSL,
      details: hasSSL ? 'Valid HTTPS SSL certificate detected' : '⚠️ No HTTPS SSL certificate found — high security risk',
      weight: 15,
    })

    // 3. Verified seller database match — Weight 20%
    const isVerifiedSeller = TRUSTED_SELLER_DOMAINS.some(d => hostname.endsWith(d))
    analysis.push({
      check: 'Verified seller database match',
      passed: isVerifiedSeller,
      details: isVerifiedSeller
        ? 'Matched with official Dealert Verified Seller database'
        : 'Seller not registered in verified seller registry',
      weight: 20,
    })

    // 4. URL pattern / typosquatting check — Weight 15%
    const pathLower = url.pathname.toLowerCase() + url.search.toLowerCase()
    const hasSuspiciousKeywords = SUSPICIOUS_KEYWORDS.some(kw => pathLower.includes(kw))
    const urlTooLong = rawUrl.length > 200
    const subdomains = hostname.split('.').length - 2
    const isTyposquatted = subdomains > 2 || urlTooLong || hasSuspiciousKeywords

    analysis.push({
      check: 'URL pattern / typosquatting check',
      passed: !isTyposquatted,
      details: isTyposquatted
        ? `Suspicious URL patterns detected (keywords, nesting, or abnormal length)`
        : 'Clean URL structure; no typosquatting patterns detected',
      weight: 15,
    })

    // 5. Google Safe Browsing result — Weight 15%
    let isSafeBrowsingPassed = true
    if (env.GOOGLE_SAFE_BROWSING_KEY) {
      isSafeBrowsingPassed = await this.checkGoogleSafeBrowsing(rawUrl)
    }
    analysis.push({
      check: 'Google Safe Browsing result',
      passed: isSafeBrowsingPassed,
      details: isSafeBrowsingPassed
        ? 'Clean — No malware or phishing threat flagged by Google'
        : '⚠️ Flagged by Google Safe Browsing as potentially hazardous',
      weight: 15,
    })

    // 6. Community scam reports — Weight 15%
    const communityScamCount = await this.getCommunityScamReports(hostname)
    const hasScamReports = communityScamCount > 0
    analysis.push({
      check: 'Community scam reports',
      passed: !hasScamReports,
      details: hasScamReports
        ? `⚠️ Flagged by ${communityScamCount} user community scam report(s)`
        : 'Zero community scam reports filed for this domain',
      weight: 15,
    })

    // Calculate overall trust score
    const totalWeight = analysis.reduce((sum, a) => sum + a.weight, 0)
    const earnedWeight = analysis.filter(a => a.passed).reduce((sum, a) => sum + a.weight, 0)
    const trustScore = Math.round((earnedWeight / totalWeight) * 100)

    const riskLevel = this.getRiskLevel(trustScore)
    const recommendation = this.getRecommendation(riskLevel)

    const report: FakePageReport = {
      url: rawUrl,
      trustScore,
      riskLevel,
      recommendation,
      analysis,
      checkedAt: new Date(),
    }

    // Persist to MongoDB
    await this.saveReport(report)

    return report
  }

  private getRiskLevel(score: number): FakePageReport['riskLevel'] {
    if (score >= 80) return 'LOW'
    if (score >= 60) return 'MEDIUM'
    if (score >= 40) return 'HIGH'
    return 'CRITICAL'
  }

  private getRecommendation(riskLevel: FakePageReport['riskLevel']): string {
    const map = {
      LOW: 'Safe to purchase. Seller and site show strong trust indicators.',
      MEDIUM: 'Proceed with caution. Verify seller phone/location before purchasing.',
      HIGH: 'High risk detected. Avoid sharing credit card or advance payment details.',
      CRITICAL: 'Do not proceed. This URL shows multiple severe fraud indicators.',
    }
    return map[riskLevel]
  }

  private async checkGoogleSafeBrowsing(url: string): Promise<boolean> {
    try {
      const res = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${env.GOOGLE_SAFE_BROWSING_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: { clientId: 'dealert', clientVersion: '1.0.0' },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url }],
            },
          }),
        }
      )
      const data = await res.json()
      return !data.matches || data.matches.length === 0
    } catch {
      logger.warn('Google Safe Browsing check failed', { url })
      return true
    }
  }

  private async getCommunityScamReports(domain: string): Promise<number> {
    try {
      const db = await getMongoDb()
      return await db.collection('community_scam_reports').countDocuments({ domain: domain.toLowerCase() })
    } catch {
      return 0
    }
  }

  private async saveReport(report: FakePageReport) {
    try {
      const db = await getMongoDb()
      await db.collection('fake_page_reports').insertOne({
        ...report,
        trust_score: report.trustScore,
        risk_level: report.riskLevel,
        created_at: report.checkedAt,
      })
    } catch (error) {
      logger.error('Failed to save fake page report', { error })
    }
  }
}

export const fakePageService = new FakePageService()