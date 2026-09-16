import { NextRequest, NextResponse } from 'next/server'
import { wishlistService } from '@/services/wishlist.service'
import { verifyAccessToken } from '@/lib/jwt'

async function getUserId(request: NextRequest): Promise<string | null> {
  const token =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!token) return null
  try {
    const payload = await verifyAccessToken(token)
    return payload.userId
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const usage = await wishlistService.getSlotUsage(userId)
    return NextResponse.json(usage)
  } catch (error) {
    console.error('GET /api/wishlist/count error:', error)
    return NextResponse.json({ error: 'Failed to fetch slot usage count' }, { status: 500 })
  }
}
