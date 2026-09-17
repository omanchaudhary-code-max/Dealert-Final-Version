import { NextRequest, NextResponse } from 'next/server'
import { wishlistService } from '@/services/wishlist.service'
import { wishlistRepository } from '@/repositories/wishlist.repository'
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const existing = await wishlistRepository.findById(id)
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Wishlist item not found or unauthorized' }, { status: 403 })
    }

    let targetPrice: number | null | undefined = undefined
    if (body.targetPrice !== undefined) {
      if (body.targetPrice === null || body.targetPrice === '') {
        targetPrice = null
      } else {
        targetPrice = Number(body.targetPrice)
        if (isNaN(targetPrice) || targetPrice <= 0) {
          return NextResponse.json(
            { error: 'targetPrice must be a positive number' },
            { status: 400 }
          )
        }
      }
    }

    let targetPriceMin: number | null | undefined = undefined
    if (body.targetPriceMin !== undefined) {
      if (body.targetPriceMin === null || body.targetPriceMin === '') {
        targetPriceMin = null
      } else {
        targetPriceMin = Number(body.targetPriceMin)
        if (isNaN(targetPriceMin) || targetPriceMin <= 0) {
          return NextResponse.json(
            { error: 'targetPriceMin must be a positive number' },
            { status: 400 }
          )
        }
      }
    }

    const effectiveTargetPrice = targetPrice !== undefined ? targetPrice : existing.targetPrice
    const effectiveTargetPriceMin = targetPriceMin !== undefined ? targetPriceMin : existing.targetPriceMin

    if (effectiveTargetPrice !== null || effectiveTargetPriceMin !== null) {
      const validation = await validateWishlistTargetPriceForProduct(
        existing.productId || existing.itemId || id,
        effectiveTargetPrice,
        effectiveTargetPriceMin
      )
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
    }

    const updated = await wishlistService.updateWishlist(id, userId, {
      targetPrice,
      targetPriceMin,
      alertMode: body.alertMode,
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update wishlist item'
    const status = message.includes('unauthorized') || message.includes('not found') ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const deleted = await wishlistService.removeFromWishlist(id, userId)
    return NextResponse.json({ success: true, deleted }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove wishlist item'
    const status = message.includes('unauthorized') || message.includes('not found') ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
