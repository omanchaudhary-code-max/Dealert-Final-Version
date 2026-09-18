import { NextRequest, NextResponse } from 'next/server'
import { runTrustCheck } from '@/lib/trust-score'
import { verifyAccessToken } from '@/lib/jwt'
import { userRepository } from '@/repositories/user.repository'
import { sellerRepository } from '@/repositories/seller.repository'

async function getAuthContext(request: NextRequest): Promise<{ userId: string | null; ip: string; plan: 'FREE' | 'PRO' | 'ENTERPRISE' }> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1'
  const token =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return { userId: null, ip, plan: 'FREE' }
  }

  try {
    const payload = await verifyAccessToken(token)
    const plan = await userRepository.getUserPlan(payload.userId)
    return { userId: payload.userId, ip, plan }
  } catch {
    return { userId: null, ip, plan: 'FREE' }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId, ip, plan } = await getAuthContext(request)
    if (plan === 'PRO' || plan === 'ENTERPRISE') {
      return NextResponse.json({
        plan,
        used: 0,
        limit: null,
        remaining: null,
      })
    }

    const used = await sellerRepository.countRecentFakePageChecks(userId, ip, 24)
    const limit = 3
    const remaining = Math.max(0, limit - used)

    return NextResponse.json({
      plan,
      used,
      limit,
      remaining,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch check quota' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { url } = body

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    const { userId, ip, plan } = await getAuthContext(request)

    // Check rolling 24-hour limit BEFORE making any WHOIS/SSL/Safe Browsing external calls
    if (plan === 'FREE') {
      const usedCount = await sellerRepository.countRecentFakePageChecks(userId, ip, 24)
      if (usedCount >= 3) {
        return NextResponse.json(
          {
            error: "Free tier limit reached. You've used all 3 free trust checks today. Upgrade to Pro for unlimited checks.",
            limitReached: true,
            used: usedCount,
            limit: 3,
            remaining: 0,
          },
          { status: 403 }
        )
      }
    }

    // Run trust check (external calls happen ONLY after limit check passes)
    const result = await runTrustCheck(url.trim())

    // Log the check to record usage in the rolling window
    await sellerRepository.logFakePageCheck(userId, ip, url.trim())

    const updatedUsed = plan === 'FREE' ? await sellerRepository.countRecentFakePageChecks(userId, ip, 24) : 0
    const remaining = plan === 'FREE' ? Math.max(0, 3 - updatedUsed) : null

    return NextResponse.json(
      {
        ...result,
        quota: {
          plan,
          used: updatedUsed,
          limit: plan === 'FREE' ? 3 : null,
          remaining,
        },
      },
      { status: 200 }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to perform trust check'
    const status = message.includes('Blocked host') || message.includes('Invalid URL') || message.includes('Domain resolution')
      ? 400
      : 500

    return NextResponse.json({ error: message }, { status })
  }
}