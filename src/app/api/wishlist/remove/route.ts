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

export async function DELETE(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const targetId = body.id || body.productId || body.itemId
    if (!targetId) {
      return NextResponse.json({ error: 'id, productId, or itemId is required' }, { status: 400 })
    }

    await wishlistService.removeFromWishlist(targetId, userId)
    return NextResponse.json({ message: 'Product removed from wishlist successfully' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
