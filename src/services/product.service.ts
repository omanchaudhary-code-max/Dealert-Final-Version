import { productRepository } from '@/repositories/product.repository'
import { appConfig } from '@/config/app.config'

export class ProductService {
  async getProducts(options: {
    category?: string
    search?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    minDiscount?: number
  }) {
    const limit = Math.min(options.limit ?? appConfig.pagination.defaultLimit, appConfig.pagination.maxLimit)
    const page = Math.max(options.page ?? 1, 1)
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      productRepository.findMany({
        category: options.category,
        search: options.search,
        skip,
        limit,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder === 'asc' ? 1 : -1,
        minDiscount: options.minDiscount,
      }),
      productRepository.countMany({
        category: options.category,
        search: options.search,
        minDiscount: options.minDiscount,
      }),
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id)
    if (!product) throw new Error('Product not found')

    const priceHistory = await productRepository.getPriceHistory(product.itemId)
  return { ...product, priceHistory }
  }

  async getTrendingDeals(limit = 20) {
    return productRepository.findTrending(limit)
  }

  async getCategories() {
    return productRepository.getCategories()
  }

  async getPriceIndex(options?: { month?: string; category?: string; history?: boolean }) {
    const { ensureInitialSnapshots } = await import('@/jobs/monthly-price-index')
    await ensureInitialSnapshots()

    if (options?.history) {
      const allSnapshots = await productRepository.getAllSnapshots()
      return {
        snapshots: allSnapshots.map((s) => ({
          month: s.month,
          methodologyVersion: s.methodologyVersion,
          computedAt: s.computedAt,
          categoriesCount: s.categories.length,
          avgPriceOverall:
            s.categories.length > 0
              ? Math.round(s.categories.reduce((acc, c) => acc + c.avgPrice, 0) / s.categories.length)
              : 0,
          categories: s.categories,
        })),
      }
    }

    let snapshot = options?.month
      ? await productRepository.getSnapshotByMonth(options.month)
      : await productRepository.getLatestSnapshot()

    if (!snapshot) {
      const all = await productRepository.getAllSnapshots()
      snapshot = all[all.length - 1] || null
    }

    if (!snapshot) {
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      snapshot = {
        month: currentMonth,
        methodologyVersion: 'v1',
        computedAt: now,
        categories: [],
      }
    }

    let categories = snapshot.categories || []
    if (options?.category) {
      const filterCat = options.category.toLowerCase().trim()
      categories = categories.filter((c) => c.category.toLowerCase().trim().includes(filterCat))
    }

    const topMovers = [...snapshot.categories]
      .filter((c) => c.pctChangeVsLastMonth !== null)
      .sort((a, b) => Math.abs(b.pctChangeVsLastMonth || 0) - Math.abs(a.pctChangeVsLastMonth || 0))
      .slice(0, 5)

    return {
      month: snapshot.month,
      methodologyVersion: snapshot.methodologyVersion,
      computedAt: snapshot.computedAt,
      topMovers,
      categories,
    }
  }

  buildAffiliateUrl(productUrl: string): string {
    const url = new URL(productUrl)
    url.searchParams.set('aff_id', appConfig.daraz.affiliateTag)
    return url.toString()
  }
}

export const productService = new ProductService()