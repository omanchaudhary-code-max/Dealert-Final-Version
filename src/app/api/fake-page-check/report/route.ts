import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import { assertPublicHost } from '@/lib/trust-score'
import { sellerRepository } from '@/repositories/seller.repository'

const MAX_REPORTS_PER_DAY = 5

export async function POST(request: NextRequest) {
  try {
    const accessToken =
      request.cookies.get('access_token')?.value ||
      request.cookies.get('accessToken')?.value ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required to submit report' }, { status: 401 })
    }

    let userId: string
    try {
      const payload = await verifyAccessToken(accessToken)
      userId = payload.userId
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session token' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { url, reason } = body

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    const { domain } = await assertPublicHost(url.trim())

    // Enforce rate limit (max 5 reports per user per 24h)
    const recentCount = await sellerRepository.countRecentReportsByUser(userId, 24)
    if (recentCount >= MAX_REPORTS_PER_DAY) {
      return NextResponse.json(
        { error: `Daily report limit reached (maximum ${MAX_REPORTS_PER_DAY} reports per 24 hours)` },
        { status: 429 }
      )
    }

    await sellerRepository.addCommunityReport(
      domain,
      url.trim(),
      userId,
      typeof reason === 'string' && reason.trim() ? reason.trim() : 'Suspicious e-commerce page'
    )

    return NextResponse.json(
      { success: true, message: 'Report submitted successfully. Thank you for keeping the community safe.' },
      { status: 200 }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit report'
    const status = message.includes('Blocked host') || message.includes('Invalid URL') || message.includes('Domain resolution')
      ? 400
      : 500

    return NextResponse.json({ error: message }, { status })
  }
}
