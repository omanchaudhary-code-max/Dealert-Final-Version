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

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const items = await wishlistService.getWishlist(userId)
    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/wishlist error:', error)
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const itemId = body.itemId || body.productId
    const targetPrice = body.targetPrice !== undefined && body.targetPrice !== null && body.targetPrice !== ''
      ? Number(body.targetPrice)
      : undefined
    const targetPriceMin = body.targetPriceMin !== undefined && body.targetPriceMin !== null && body.targetPriceMin !== ''
      ? Number(body.targetPriceMin)
      : undefined
    const alertMode = body.alertMode || 'immediate'

    if (!itemId) {
      return NextResponse.json({ error: 'itemId or productId is required' }, { status: 400 })
    }

    if (targetPrice !== undefined || targetPriceMin !== undefined) {
      const validation = await validateWishlistTargetPriceForProduct(itemId, targetPrice, targetPriceMin)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
    }

    const created = await wishlistService.addToWishlist(userId, {
      itemId,
      targetPrice,
      targetPriceMin,
      alertMode,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add item to wishlist'
    if (message.includes('Free tier limit reached')) {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
