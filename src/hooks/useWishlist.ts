import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/hooks/useAuth'

export interface WishlistFormattedItem {
  id: string
  itemId: string
  productId: string
  productName: string
  productImage: string
  productUrl: string
  sellerName?: string
  currentPrice: number
  originalPrice?: number
  discountPercentage?: number
  wishlistedPrice: number
  targetPrice?: number | null
  alertMode: 'immediate' | 'all_time_low' | string
  addedAt: string
  targetHit?: boolean
  allTimeLowHit?: boolean
}

export interface SlotUsageResponse {
  used: number
  limit: number | null
  plan: string
}

export function useWishlist() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data: rawWishlistItems = [], isLoading, error } = useQuery<WishlistFormattedItem[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await fetch('/api/wishlist')
      if (!res.ok) {
        if (res.status === 401) return []
        throw new Error('Failed to fetch wishlist')
      }
      return await res.json()
    },
    enabled: isAuthenticated,
    retry: false,
  })

  const { data: slotUsage } = useQuery<SlotUsageResponse>({
    queryKey: ['wishlist-count'],
    queryFn: async () => {
      const res = await fetch('/api/wishlist/count')
      if (!res.ok) return { used: rawWishlistItems.length, limit: 5, plan: 'FREE' }
      return await res.json()
    },
    enabled: isAuthenticated,
  })

  const wishlistedProductIds = rawWishlistItems.map((item) => item.itemId || item.productId || item.id)

  const isWishlisted = (productIdOrItemId: string) =>
    wishlistedProductIds.includes(productIdOrItemId) ||
    rawWishlistItems.some(
      (item) => item.productId === productIdOrItemId || item.itemId === productIdOrItemId || item.id === productIdOrItemId
    )

  const addMutation = useMutation({
    mutationFn: async ({
      productId,
      itemId,
      targetPrice,
      alertMode,
    }: {
      productId: string
      itemId?: string
      targetPrice?: number
      alertMode?: string
    }) => {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: itemId || productId,
          productId,
          targetPrice,
          alertMode,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add to wishlist')
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      targetPrice,
      alertMode,
    }: {
      id: string
      targetPrice?: number | null
      alertMode?: string
    }) => {
      const res = await fetch(`/api/wishlist/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPrice, alertMode }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update wishlist item')
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (idOrProductId: string) => {
      const targetItem = rawWishlistItems.find(
        (i) => i.id === idOrProductId || i.productId === idOrProductId || i.itemId === idOrProductId
      )
      const targetId = targetItem ? targetItem.id : idOrProductId

      const res = await fetch(`/api/wishlist/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        const fallbackRes = await fetch('/api/wishlist/remove', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: idOrProductId }),
        })
        if (!fallbackRes.ok) {
          throw new Error(data.error || 'Failed to remove from wishlist')
        }
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] })
    },
  })

  const toggleWishlist = async (productIdOrItemId: string) => {
    if (isWishlisted(productIdOrItemId)) {
      await removeMutation.mutateAsync(productIdOrItemId)
    } else {
      await addMutation.mutateAsync({ productId: productIdOrItemId })
    }
  }

  return {
    wishlistProducts: rawWishlistItems,
    wishlistItems: wishlistedProductIds,
    slotUsage,
    isLoading,
    error,
    isWishlisted,
    addToWishlist: (productId: string, options?: { targetPrice?: number; alertMode?: string }) =>
      addMutation.mutateAsync({ productId, ...options }),
    updateWishlist: updateMutation.mutateAsync,
    removeFromWishlist: removeMutation.mutateAsync,
    toggleWishlist,
  }
}