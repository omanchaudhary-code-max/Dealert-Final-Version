import { prisma } from '@/lib/prisma'
import type { WishlistItem } from '@prisma/client'

const inMemoryWishlist: WishlistItem[] = [
  {
    id: 'wish-demo-1',
    userId: 'usr-demo-user-1',
    productId: 'prod-macbook-m3',
    itemId: 'manual-demo-1',
    targetPrice: 140000,
    wishlistedPrice: 145000,
    alertMode: 'immediate',
    createdAt: new Date(),
  },
  {
    id: 'wish-demo-2',
    userId: 'usr-demo-user-1',
    productId: 'prod-iphone-15',
    itemId: 'manual-demo-2',
    targetPrice: 110000,
    wishlistedPrice: 115000,
    alertMode: 'all_time_low',
    createdAt: new Date(),
  },
]

export interface CreateWishlistInput {
  productId: string
  itemId?: string
  wishlistedPrice: number
  targetPrice?: number
  alertMode?: string
}

export interface UpdateWishlistInput {
  targetPrice?: number | null
  alertMode?: string
}

export class WishlistRepository {
  async findByUserId(userId: string): Promise<WishlistItem[]> {
    try {
      return await prisma.wishlistItem.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
    } catch (err) {
      console.warn('Prisma Wishlist findByUserId fallback:', err instanceof Error ? err.message : err)
      return inMemoryWishlist.filter((w) => w.userId === userId)
    }
  }

  async findById(id: string): Promise<WishlistItem | null> {
    try {
      const item = await prisma.wishlistItem.findUnique({ where: { id } })
      if (item) return item
    } catch (err) {
      console.warn('Prisma Wishlist findById fallback:', err instanceof Error ? err.message : err)
    }
    return inMemoryWishlist.find((w) => w.id === id) ?? null
  }

  async findUnique(userId: string, productIdOrItemId: string): Promise<WishlistItem | null> {
    try {
      const items = await prisma.wishlistItem.findMany({
        where: {
          userId,
          OR: [
            { productId: productIdOrItemId },
            { itemId: productIdOrItemId },
          ],
        },
      })
      if (items[0]) return items[0]
    } catch (err) {
      console.warn('Prisma Wishlist findUnique fallback:', err instanceof Error ? err.message : err)
    }
    return (
      inMemoryWishlist.find(
        (w) => w.userId === userId && (w.productId === productIdOrItemId || w.itemId === productIdOrItemId)
      ) ?? null
    )
  }

  async countByUserId(userId: string): Promise<number> {
    try {
      return await prisma.wishlistItem.count({ where: { userId } })
    } catch (err) {
      console.warn('Prisma Wishlist countByUserId fallback:', err instanceof Error ? err.message : err)
      return inMemoryWishlist.filter((w) => w.userId === userId).length
    }
  }

  async create(userId: string, input: CreateWishlistInput): Promise<WishlistItem> {
    try {
      const item = await prisma.wishlistItem.create({
        data: {
          userId,
          productId: input.productId,
          itemId: input.itemId || input.productId,
          wishlistedPrice: input.wishlistedPrice,
          targetPrice: input.targetPrice ?? null,
          alertMode: input.alertMode || 'immediate',
        },
      })
      inMemoryWishlist.unshift(item)
      return item
    } catch (err) {
      console.warn('Prisma Wishlist create fallback:', err instanceof Error ? err.message : err)
      const existing = inMemoryWishlist.find(
        (w) => w.userId === userId && (w.productId === input.productId || w.itemId === input.itemId)
      )
      if (existing) return existing

      const newItem: WishlistItem = {
        id: `wish-mem-${Date.now()}`,
        userId,
        productId: input.productId,
        itemId: input.itemId || input.productId,
        wishlistedPrice: input.wishlistedPrice,
        targetPrice: input.targetPrice ?? null,
        alertMode: input.alertMode || 'immediate',
        createdAt: new Date(),
      }
      inMemoryWishlist.unshift(newItem)
      return newItem
    }
  }

  async update(id: string, userId: string, input: UpdateWishlistInput): Promise<WishlistItem> {
    try {
      const dataToUpdate: any = {}
      if (input.targetPrice !== undefined) dataToUpdate.targetPrice = input.targetPrice
      if (input.alertMode !== undefined) dataToUpdate.alertMode = input.alertMode

      const item = await prisma.wishlistItem.update({
        where: { id },
        data: dataToUpdate,
      })
      const idx = inMemoryWishlist.findIndex((w) => w.id === id)
      if (idx !== -1) inMemoryWishlist[idx] = item
      return item
    } catch (err) {
      console.warn('Prisma Wishlist update fallback:', err instanceof Error ? err.message : err)
      const item = inMemoryWishlist.find((w) => w.id === id && w.userId === userId)
      if (!item) throw new Error('Wishlist item not found')
      if (input.targetPrice !== undefined) item.targetPrice = input.targetPrice
      if (input.alertMode !== undefined) item.alertMode = input.alertMode
      return item
    }
  }

  async delete(id: string, userId: string): Promise<WishlistItem> {
    try {
      return await prisma.wishlistItem.delete({
        where: { id },
      })
    } catch (err) {
      console.warn('Prisma Wishlist delete fallback:', err instanceof Error ? err.message : err)
      const idx = inMemoryWishlist.findIndex((w) => w.id === id && w.userId === userId)
      if (idx !== -1) {
        const [removed] = inMemoryWishlist.splice(idx, 1)
        return removed
      }
      return {
        id,
        userId,
        productId: 'del',
        itemId: 'del',
        wishlistedPrice: 0,
        targetPrice: null,
        alertMode: 'immediate',
        createdAt: new Date(),
      }
    }
  }

  async bulkCreate(userId: string, productIds: string[]): Promise<{ count: number }> {
    try {
      return await prisma.$transaction(async (tx) => {
        let inserted = 0
        for (const productId of productIds) {
          const existing = await tx.wishlistItem.findFirst({
            where: { userId, productId },
          })

          if (!existing) {
            await tx.wishlistItem.create({
              data: {
                userId,
                productId,
                itemId: productId,
                wishlistedPrice: 0,
                alertMode: 'immediate',
              },
            })
            inserted++
          }
        }
        return { count: inserted }
      })
    } catch (err) {
      console.warn('Prisma Wishlist bulkCreate fallback:', err instanceof Error ? err.message : err)
      let inserted = 0
      for (const productId of productIds) {
        const existing = inMemoryWishlist.find((w) => w.userId === userId && w.productId === productId)
        if (!existing) {
          inMemoryWishlist.unshift({
            id: `wish-mem-${Date.now()}-${Math.random()}`,
            userId,
            productId,
            itemId: productId,
            wishlistedPrice: 0,
            targetPrice: null,
            alertMode: 'immediate',
            createdAt: new Date(),
          })
          inserted++
        }
      }
      return { count: inserted }
    }
  }
}

export const wishlistRepository = new WishlistRepository()
