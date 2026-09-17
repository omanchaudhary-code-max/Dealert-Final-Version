import { NextRequest, NextResponse } from 'next/server'
import { wishlistService } from '@/services/wishlist.service'
import { verifyAccessToken } from '@/lib/jwt'
import { validateWishlistTargetPriceForProduct } from '@/lib/wishlist-validation'

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

export async function POST(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const targetId = body.itemId || body.productId
    const targetPrice = body.targetPrice !== undefined && body.targetPrice !== null && body.targetPrice !== ''
      ? Number(body.targetPrice)
      : undefined
    const targetPriceMin = body.targetPriceMin !== undefined && body.targetPriceMin !== null && body.targetPriceMin !== ''
      ? Number(body.targetPriceMin)
      : undefined

    if (!targetId) {
      return NextResponse.json({ error: 'productId or itemId is required' }, { status: 400 })
    }

    if (targetPrice !== undefined || targetPriceMin !== undefined) {
      const validation = await validateWishlistTargetPriceForProduct(targetId, targetPrice, targetPriceMin)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
    }

    const item = await wishlistService.addToWishlist(userId, {
      itemId: targetId,
      targetPrice,
      targetPriceMin,
      alertMode: body.alertMode || 'immediate',
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    if (message.includes('Free tier limit reached')) {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
