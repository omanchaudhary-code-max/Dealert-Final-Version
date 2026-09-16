import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import type { Product, PriceHistory, ProductWithHistory } from '@/types/product'

export type { Product, PriceHistory, ProductWithHistory }

export interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const PAGE_LIMIT = 20

function buildParams(
  filters: {
    search?: string
    category?: string
    sortBy?: string
    limit?: number
    minDiscount?: number
    seed?: number | string
  } | undefined,
  page: number
): URLSearchParams {
  const params = new URLSearchParams()
  if (filters?.search) params.append('search', filters.search)
  if (filters?.category && filters.category !== 'All') {
    params.append('category', filters.category)
  }
  if (filters?.minDiscount && filters.minDiscount > 0) {
    params.append('minDiscount', String(filters.minDiscount))
  }
  if (filters?.sortBy && filters.sortBy !== 'default') {
    if (filters.sortBy === 'price-low') {
      params.append('sortBy', 'currentPrice')
      params.append('sortOrder', 'asc')
    } else if (filters.sortBy === 'price-high') {
      params.append('sortBy', 'currentPrice')
      params.append('sortOrder', 'desc')
    } else if (filters.sortBy === 'discount') {
      params.append('sortBy', 'discountPercentage')
      params.append('sortOrder', 'desc')
    } else {
      params.append('sortBy', filters.sortBy)
    }
  } else {
    // "default" / no sort → tell backend to randomize
    params.append('sortBy', 'random')
  }
  if (filters?.seed) {
    params.append('_t', String(filters.seed))
  } else if (filters?.sortBy === 'random') {
    params.append('_t', String(Date.now()))
  }
  params.append('limit', String(filters?.limit ?? PAGE_LIMIT))
  params.append('page', String(page))
  return params
}

function normalizeProduct(p: Product & { _id?: string }): Product {
  return { ...p, id: p._id || p.id }
}

/** Infinite-scroll version — use this on the full products listing page */
export function useInfiniteProducts(filters?: {
  search?: string
  category?: string
  sortBy?: string
  minDiscount?: number
  seed?: number | string
}) {
  return useInfiniteQuery<ProductsResponse>({
    queryKey: ['products-infinite', filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = buildParams(filters, pageParam as number)
      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data: ProductsResponse = await res.json()
      return {
        ...data,
        products: data.products.map(normalizeProduct),
      }
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
  })
}

/** Simple single-page version — kept for landing page / small slices */
export function useProducts(
  filters?: {
    search?: string
    category?: string
    sortBy?: string
    limit?: number
    minDiscount?: number
    seed?: number | string
  },
  options?: {
    refetchOnMount?: boolean | 'always'
    staleTime?: number
    gcTime?: number
  }
) {
  return useQuery<Product[]>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = buildParams(filters, 1)
      if (filters?.limit) params.set('limit', String(filters.limit))
      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data: ProductsResponse = await res.json()
      return data.products.map(normalizeProduct)
    },
    ...options,
  })
}

export function useProductDetails(itemId: string) {
  return useQuery<ProductWithHistory>({
    queryKey: ['product', itemId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${itemId}`)
      if (!res.ok) throw new Error('Product not found')
      const p = await res.json()
      return { ...p, id: p._id || p.id }
    },
    enabled: !!itemId,
  })
}

export function useCategories() {
  return useQuery<string[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}