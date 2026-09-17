import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/hooks/useAuth'
import { useToastStore } from '@/hooks/useToast'

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
  targetPriceMin?: number | null
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

function showErrorToast(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage
  const isLimitError = message.includes('Free tier limit reached')

  useToastStore.getState().showToast({
    message: isLimitError
      ? "You've reached your Free tier limit (5/5). Upgrade to Pro for unlimited wishlist items."
      : message,
    actionUrl: isLimitError ? '/pricing' : undefined,
    actionLabel: isLimitError ? 'Upgrade to Pro' : undefined,
    variant: 'warning',
  })
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
      targetPriceMin,
      alertMode,
    }: {
      productId: string
      itemId?: string
      targetPrice?: number
      targetPriceMin?: number | null
      alertMode?: string
    }) => {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: itemId || productId,
          productId,
          targetPrice,
          targetPriceMin,
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
      const currentCount = slotUsage?.used ?? rawWishlistItems.length
      const isFreeTier = slotUsage?.plan !== 'PRO'

      // Invalidate BOTH query keys together after every add
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] })

      // Trigger toast specifically on transition to 5th item (Free tier cap)
      if (isFreeTier && currentCount === 4) {
        useToastStore.getState().showToast({
          message: "You've reached your Free tier limit (5/5). Upgrade to Pro for unlimited wishlist items.",
          actionUrl: '/pricing',
          actionLabel: 'Upgrade to Pro',
          variant: 'warning',
        })
      }
    },
    onError: (err) => {
      showErrorToast(err, 'Failed to add to wishlist')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      targetPrice,
      targetPriceMin,
      alertMode,
    }: {
      id: string
      targetPrice?: number | null
      targetPriceMin?: number | null
      alertMode?: string
    }) => {
      const res = await fetch(`/api/wishlist/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPrice, targetPriceMin, alertMode }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update wishlist item')
      }
      return data
    },
    onSuccess: () => {
      // Invalidate BOTH query keys together
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] })
    },
    onError: (err) => {
      showErrorToast(err, 'Failed to update wishlist item')
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
      // Invalidate BOTH query keys together after every remove
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] })
    },
    onError: (err) => {
      showErrorToast(err, 'Failed to remove from wishlist')
    },
  })

  const toggleWishlist = async (productIdOrItemId: string) => {
    try {
      if (isWishlisted(productIdOrItemId)) {
        await removeMutation.mutateAsync(productIdOrItemId)
      } else {
        await addMutation.mutateAsync({ productId: productIdOrItemId })
      }
    } catch {
      // Already surfaced via onError above; swallow here so callers
      // that don't await/catch toggleWishlist don't crash on rejection.
    }
  }

  return {
    wishlistProducts: rawWishlistItems,
    wishlistItems: wishlistedProductIds,
    slotUsage,
    isLoading,
    error,
    isWishlisted,
    addToWishlist: (productId: string, options?: { targetPrice?: number; targetPriceMin?: number | null; alertMode?: string }) =>
      addMutation.mutateAsync({ productId, ...options }).catch(() => undefined),
    updateWishlist: (...args: Parameters<typeof updateMutation.mutateAsync>) =>
      updateMutation.mutateAsync(...args).catch(() => undefined),
    removeFromWishlist: (...args: Parameters<typeof removeMutation.mutateAsync>) =>
      removeMutation.mutateAsync(...args).catch(() => undefined),
    toggleWishlist,
  }
}