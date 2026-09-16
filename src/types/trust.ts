export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH'

export interface SignalResult {
  name: string
  weight: number // % weight in final score (0-100)
  score: number // 0-100, higher = safer
  detail: string
  available: boolean // false if the signal failed/timed out
}

export interface TrustCheckResult {
  url: string
  domain: string
  riskTier: RiskTier
  overallScore: number
  signals: SignalResult[]
  overrideApplied: 'SAFE_BROWSING_FLAGGED' | 'VERIFIED_SELLER' | null
  checkedAt: Date
}

export interface SellerSnapshotDoc {
  _id?: string
  domain: string
  result: TrustCheckResult
  cachedAt: Date
  expiresAt: Date
}
