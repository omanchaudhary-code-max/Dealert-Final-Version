import { wishlistRepository } from '@/repositories/wishlist.repository'
import { productRepository } from '@/repositories/product.repository'
import { userRepository } from '@/repositories/user.repository'
import { alertRepository } from '@/repositories/alert.repository'

const FREE_TIER_WISHLIST_LIMIT = 5

export interface AddWishlistServiceInput {
  itemId: string
  targetPrice?: number
  alertMode?: string
}

export interface UpdateWishlistServiceInput {
  targetPrice?: number | null
  alertMode?: string
}

export class WishlistService {
  async getWishlist(userId: string) {
    const items = await wishlistRepository.findByUserId(userId)
    if (items.length === 0) return []

    const formattedItems = await Promise.all(
      items.map(async (item) => {
        const targetId = item.itemId || item.productId
        const product =
          (await productRepository.findByItemId(targetId)) ||
          (await productRepository.findById(item.productId))

        const priceHistory = product ? await productRepository.getPriceHistory(product.itemId || product.id) : []
        const historicalPrices = priceHistory.map((ph) => ph.price)
        const allTimeLow =
          historicalPrices.length > 0
            ? Math.min(...historicalPrices)
            : product?.currentPrice ?? 0

        const currentPrice = product?.currentPrice ?? item.wishlistedPrice ?? 0
        const targetHit = item.targetPrice != null && currentPrice <= item.targetPrice
        const allTimeLowHit = currentPrice > 0 && currentPrice <= allTimeLow

        return {
          id: item.id,
          itemId: targetId,
          productId: product?.id || item.productId,
          productName: product?.name || 'Product',
          productImage: product?.imageUrl || '',
          productUrl: (product as any)?.affiliateUrl || product?.productUrl || 'https://www.daraz.com.np',
          sellerName: product?.sellerName || 'Daraz',
          currentPrice: currentPrice,
          originalPrice: product?.originalPrice || currentPrice,
          discountPercentage: product?.discountPercentage || 0,
          wishlistedPrice: item.wishlistedPrice || currentPrice,
          targetPrice: item.targetPrice,
          alertMode: item.alertMode || 'immediate',
          addedAt: item.createdAt,
          targetHit,
          allTimeLowHit,
        }
      })
    )

    return formattedItems
  }

  async getSlotUsage(userId: string) {
    const userPlan = await userRepository.getUserPlan(userId)
    const count = await wishlistRepository.countByUserId(userId)
    const isPro = userPlan === 'PRO'

    return {
      used: count,
      limit: isPro ? null : FREE_TIER_WISHLIST_LIMIT,
      plan: userPlan,
    }
  }

  async addToWishlist(userId: string, input: AddWishlistServiceInput) {
    const userPlan = await userRepository.getUserPlan(userId)
    const count = await wishlistRepository.countByUserId(userId)

    // Precondition check (UC-04): Free tier limit of 5 slots
    if (userPlan === 'FREE' && count >= FREE_TIER_WISHLIST_LIMIT) {
      throw new Error(`Free tier limit reached (5/5). Upgrade to Pro or remove an item.`)
    }

    const targetId = input.itemId
    const product =
      (await productRepository.findByItemId(targetId)) ||
      (await productRepository.findById(targetId))

    if (!product) {
      throw new Error('Product does not exist in the system catalog')
    }

    const existing = await wishlistRepository.findUnique(userId, product.itemId || product.id)
    if (existing) {
      throw new Error('Product is already in your wishlist')
    }

    // Snapshot current live price at the moment of addition
    const wishlistedPrice = product.currentPrice

    const wishlistItem = await wishlistRepository.create(userId, {
      productId: product.id,
      itemId: product.itemId || product.id,
      wishlistedPrice,
      targetPrice: input.targetPrice,
      alertMode: input.alertMode || 'immediate',
    })

    // Also sync/create alert entry so background alert-checker processes it
    if (input.targetPrice && input.targetPrice > 0) {
      try {
        await alertRepository.create({
          user: { connect: { id: userId } },
          productId: product.id,
          targetPrice: input.targetPrice,
          isActive: true,
        })
      } catch (err) {
        console.warn('Alert repository sync warning:', err)
      }
    }

    return wishlistItem
  }

  async updateWishlist(id: string, userId: string, input: UpdateWishlistServiceInput) {
    const existing = await wishlistRepository.findById(id)
    if (!existing || existing.userId !== userId) {
      throw new Error('Wishlist item not found or unauthorized')
    }

    if (input.targetPrice !== undefined && input.targetPrice !== null) {
      if (typeof input.targetPrice !== 'number' || isNaN(input.targetPrice) || input.targetPrice <= 0) {
        throw new Error('Target price must be a positive number')
      }
    }

    const updated = await wishlistRepository.update(id, userId, input)

    // Sync updated target price with alert repository for alert processing job
    if (input.targetPrice !== undefined) {
      try {
        const existingAlerts = await alertRepository.findByProductId(existing.productId)
        const userAlert = existingAlerts.find((a) => a.userId === userId)

        if (userAlert) {
          if (input.targetPrice && input.targetPrice > 0) {
            await alertRepository.update(userAlert.id, { targetPrice: input.targetPrice, isActive: true })
          } else {
            await alertRepository.deactivate(userAlert.id)
          }
        } else if (input.targetPrice && input.targetPrice > 0) {
          await alertRepository.create({
            user: { connect: { id: userId } },
            productId: existing.productId,
            targetPrice: input.targetPrice,
            isActive: true,
          })
        }
      } catch (err) {
        console.warn('Alert repository sync warning on update:', err)
      }
    }

    return updated
  }

  async removeFromWishlist(idOrProductId: string, userId: string) {
    let item = await wishlistRepository.findById(idOrProductId)
    if (!item) {
      item = await wishlistRepository.findUnique(userId, idOrProductId)
    }

    if (!item || item.userId !== userId) {
      throw new Error('Wishlist item not found or unauthorized')
    }

    const result = await wishlistRepository.delete(item.id, userId)

    // Deactivate/remove corresponding alert so alert pipeline stops checking
    try {
      const existingAlerts = await alertRepository.findByProductId(item.productId)
      const userAlert = existingAlerts.find((a) => a.userId === userId)
      if (userAlert) {
        await alertRepository.deactivate(userAlert.id)
      }
    } catch (err) {
      console.warn('Alert repository deactivation warning:', err)
    }

    return result
  }

  async bulkAddToWishlist(userId: string, productIds: string[]) {
    const deduplicatedIds = [...new Set(productIds)]
    if (deduplicatedIds.length === 0) return { count: 0 }

    const userPlan = await userRepository.getUserPlan(userId)
    const count = await wishlistRepository.countByUserId(userId)

    if (userPlan === 'FREE' && count + deduplicatedIds.length > FREE_TIER_WISHLIST_LIMIT) {
      throw new Error(`Free tier limit reached (5/5). Upgrade to Pro or remove an item.`)
    }

    const validProductIds: string[] = []
    for (const id of deduplicatedIds) {
      const p = (await productRepository.findByItemId(id)) || (await productRepository.findById(id))
      if (p) validProductIds.push(p.id)
    }

    if (validProductIds.length === 0) {
      throw new Error('None of the specified products exist in the catalog')
    }

    return wishlistRepository.bulkCreate(userId, validProductIds)
  }
}

export const wishlistService = new WishlistService()