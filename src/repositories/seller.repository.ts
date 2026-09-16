import { getMongoDb } from '@/lib/mongodb'
import type { SellerSnapshotDoc, TrustCheckResult } from '@/types/trust'

const SNAPSHOT_TTL_MS = 48 * 60 * 60 * 1000 // 48h — domain-level signals rarely change faster than this

export interface VerifiedSellerDoc {
  _id?: string
  domain: string
  sellerName: string
  verifiedAt: Date
}

export interface CommunityReportDoc {
  _id?: string
  domain: string
  url: string
  userId: string
  reason: string
  reportedAt: Date
}

export const SHARED_HOSTING_DOMAINS = [
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'instagram.com',
  'www.instagram.com',
  'tiktok.com',
  'www.tiktok.com',
  'youtube.com',
  'www.youtube.com',
]

export function isSharedHostingDomain(domain: string): boolean {
  const d = domain.toLowerCase().trim()
  return SHARED_HOSTING_DOMAINS.some((shd) => d === shd || d.endsWith('.' + shd))
}

export function normalizeUrlKey(rawUrl: string): string {
  try {
    const trimmed = rawUrl.trim()
    const parsed = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
    let path = parsed.pathname.toLowerCase().replace(/\/$/, '')

    if (path.includes('profile.php') && parsed.searchParams.has('id')) {
      path = `${path}?id=${parsed.searchParams.get('id')}`
    }

    return `${host}${path}`
  } catch {
    return rawUrl.toLowerCase().trim()
  }
}

export class SellerRepository {
  private async sellers() {
    const db = await getMongoDb()
    return db.collection<VerifiedSellerDoc>('sellers')
  }

  private async snapshots() {
    const db = await getMongoDb()
    return db.collection<SellerSnapshotDoc>('seller_snapshots')
  }

  private async communityReports() {
    const db = await getMongoDb()
    return db.collection<CommunityReportDoc>('community_reports')
  }

  async findVerifiedSeller(domain: string, fullUrl?: string): Promise<VerifiedSellerDoc | null> {
    try {
      const col = await this.sellers()
      const d = domain.toLowerCase().trim()

      if (isSharedHostingDomain(d)) {
        if (!fullUrl) return null
        const normKey = normalizeUrlKey(fullUrl)
        return await col.findOne({
          $or: [
            { urlKey: normKey },
            { url: fullUrl },
            { social_url: fullUrl },
            { website_url: fullUrl },
            { urlKey: { $regex: new RegExp(normKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
          ],
        })
      }

      return await col.findOne({
        $or: [
          { domain: d },
          { domain: `www.${d.replace(/^www\./, '')}` },
          { domain: d.replace(/^www\./, '') },
        ],
      })
    } catch {
      return null
    }
  }

  async getFreshSnapshot(domain: string): Promise<TrustCheckResult | null> {
    try {
      const col = await this.snapshots()
      const doc = await col.findOne({ domain: domain.toLowerCase(), expiresAt: { $gt: new Date() } })
      return doc?.result ?? null
    } catch {
      return null
    }
  }

  async saveSnapshot(domain: string, result: TrustCheckResult): Promise<void> {
    try {
      const col = await this.snapshots()
      const now = new Date()
      const d = domain.toLowerCase()
      await col.updateOne(
        { domain: d },
        {
          $set: {
            domain: d,
            result,
            cachedAt: now,
            expiresAt: new Date(now.getTime() + SNAPSHOT_TTL_MS),
          },
        },
        { upsert: true }
      )
    } catch (err) {
      console.warn('Failed to cache trust snapshot', err instanceof Error ? err.message : err)
    }
  }

  async getDistinctCommunityReportCount(domain: string, sinceDays = 90): Promise<number> {
    try {
      const col = await this.communityReports()
      const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000)
      const result = await col
        .aggregate([
          { $match: { domain: domain.toLowerCase(), reportedAt: { $gte: since } } },
          { $group: { _id: '$userId' } }, // dedupe by user
          { $count: 'total' },
        ])
        .toArray()
      return result[0]?.total ?? 0
    } catch {
      return 0
    }
  }

  async addCommunityReport(domain: string, url: string, userId: string, reason: string): Promise<void> {
    try {
      const col = await this.communityReports()
      await col.insertOne({ domain: domain.toLowerCase(), url, userId, reason, reportedAt: new Date() })
    } catch (err) {
      console.warn('Failed to add community report', err instanceof Error ? err.message : err)
    }
  }

  async countRecentReportsByUser(userId: string, sinceHours = 24): Promise<number> {
    try {
      const col = await this.communityReports()
      const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000)
      return await col.countDocuments({ userId, reportedAt: { $gte: since } })
    } catch {
      return 0
    }
  }
}

export const sellerRepository = new SellerRepository()
