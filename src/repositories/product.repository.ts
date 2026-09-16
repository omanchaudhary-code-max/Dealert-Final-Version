import { ObjectId } from 'mongodb'
import { getMongoDb } from '@/lib/mongodb'
import type { Product, PriceHistory } from '@/types/product'
import { INITIAL_PRODUCTS, type MockProduct } from '@/lib/constants'

function mockToProduct(p: MockProduct): Product {
  return {
    _id: p.id,
    id: p.id,
    itemId: p.id,
    name: p.name,
    currentPrice: p.currentPrice,
    originalPrice: p.originalPrice,
    discountPercentage: p.discountPercentage,
    imageUrl: p.imageUrl,
    productUrl: p.sellerUrl || 'https://www.daraz.com.np',
    category: p.category,
    sellerName: p.sellerName,
    inStock: p.inStock,
    lastCrawledAt: new Date(),
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
  }
}

function mockToPriceHistory(p: MockProduct): PriceHistory[] {
  return (p.priceHistory || []).map((ph, idx) => ({
    _id: `${p.id}-ph-${idx}`,
    productId: p.id,
    price: ph.price,
    recordedAt: new Date(Date.now() - (p.priceHistory.length - idx) * 7 * 24 * 3600 * 1000),
  }))
}

// ---------------------------------------------------------------------------
// Raw document shapes — exactly what the Python/Selenium crawler writes to
// MongoDB. All fields are snake_case. These interfaces never leave this file;
// every public method maps into the camelCase Product/PriceHistory types.
// ---------------------------------------------------------------------------

interface RawProduct {
  _id: ObjectId
  item_id: string
  title: string
  url: string
  category: string
  seller_name: string
  last_seen: Date
  last_price: number
  first_seen: Date
  image_url: string
  image_verified: boolean
  is_delisted: boolean
}

interface RawPriceHistory {
  _id: ObjectId
  item_id: string
  crawl_run_id: string
  scraped_at: Date
  current_price: number
  original_price: number
  is_promotional: boolean
  category: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function categoryFilter(category: string) {
  // Case-insensitive exact match: crawler stores 'laptops', UI sends 'Laptops'.
  return { $regex: `^${escapeRegex(category.trim())}$`, $options: 'i' }
}

function searchFilter(search: string) {
  return { $regex: escapeRegex(search.trim()), $options: 'i' }
}

// Valid camelCase sort fields that exist on the projected document shape.
// Anything not in this set falls back to lastCrawledAt.
const VALID_SORT_FIELDS = new Set([
  'lastCrawledAt',
  'currentPrice',
  'discountPercentage',
])

// ---------------------------------------------------------------------------
// Pipeline stage builders
// ---------------------------------------------------------------------------

function matchStages(match: Record<string, unknown>) {
  return [{ $match: match }]
}

function joinAndProjectStages() {
  return [
    {
      $lookup: {
        from: 'price_history',
        let: { itemId: '$item_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$item_id', '$$itemId'] } } },
          { $sort: { scraped_at: -1 } },
          { $limit: 1 },
        ],
        as: 'latestPrice',
      },
    },
    { $unwind: { path: '$latestPrice', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        computedCurrentPrice: {
          $ifNull: ['$latestPrice.current_price', '$last_price'],
        },
        computedOriginalPrice: {
          $ifNull: ['$latestPrice.original_price', '$last_price'],
        },
        computedDiscountPercentage: {
          $cond: [
            {
              $and: [
                { $ne: ['$latestPrice.original_price', null] },
                { $gt: ['$latestPrice.original_price', 0] },
              ],
            },
            {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $subtract: [
                            '$latestPrice.original_price',
                            '$latestPrice.current_price',
                          ],
                        },
                        '$latestPrice.original_price',
                      ],
                    },
                    100,
                  ],
                },
                0,
              ],
            },
            0,
          ],
        },
      },
    },
    {
      $project: {
        _id: { $toString: '$_id' },
        id: { $toString: '$_id' },
        itemId: '$item_id',
        name: '$title',
        currentPrice: '$computedCurrentPrice',
        originalPrice: '$computedOriginalPrice',
        discountPercentage: '$computedDiscountPercentage',
        imageUrl: '$image_url',
        productUrl: '$url',
        category: '$category',
        sellerName: '$seller_name',
        inStock: { $eq: ['$is_delisted', false] },
        lastCrawledAt: '$last_seen',
        createdAt: '$first_seen',
      },
    },
  ]
}

function buildProductPipeline(match: Record<string, unknown>) {
  return [...matchStages(match), ...joinAndProjectStages()]
}

// ---------------------------------------------------------------------------
// Price Index Types & Constants
// ---------------------------------------------------------------------------

export const METHODOLOGY_VERSION = 'v1'
export const MIN_PRODUCTS_PER_CATEGORY = 5

export interface CategorySnapshotItem {
  category: string
  avgPrice: number
  productCount: number
  pctChangeVsLastMonth: number | null
}

export interface PriceIndexSnapshotDoc {
  _id?: ObjectId | string
  month: string
  methodologyVersion: string
  computedAt: Date
  categories: CategorySnapshotItem[]
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class ProductRepository {
  private async getCollection() {
    const db = await getMongoDb()
    return db.collection<RawProduct>('products')
  }

  private async getPriceHistoryCollection() {
    const db = await getMongoDb()
    return db.collection<RawPriceHistory>('price_history')
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const col = await this.getCollection()
      const match = { _id: ObjectId.isValid(id) ? new ObjectId(id) : id }
      const results = await col
        .aggregate<Product>(buildProductPipeline(match))
        .toArray()
      if (results[0]) return results[0]
    } catch (err) {
      console.warn('MongoDB findById fallback:', err instanceof Error ? err.message : err)
    }
    const mock = INITIAL_PRODUCTS.find((p) => p.id === id)
    return mock ? mockToProduct(mock) : null
  }

  async findByItemId(itemId: string): Promise<Product | null> {
    try {
      const col = await this.getCollection()
      const results = await col
        .aggregate<Product>(buildProductPipeline({ item_id: itemId }))
        .toArray()
      if (results[0]) return results[0]
    } catch (err) {
      console.warn('MongoDB findByItemId fallback:', err instanceof Error ? err.message : err)
    }
    const mock = INITIAL_PRODUCTS.find((p) => p.id === itemId)
    return mock ? mockToProduct(mock) : null
  }

  async findMany(options: {
    category?: string
    search?: string
    skip?: number
    limit?: number
    sortBy?: string
    sortOrder?: 1 | -1
    minDiscount?: number
  }): Promise<Product[]> {
    try {
      const col = await this.getCollection()

      const match: Record<string, unknown> = { is_delisted: false }
      if (options.category && options.category.toLowerCase() !== 'all') {
        match.category = categoryFilter(options.category)
      }
      if (options.search && options.search.trim()) {
        const sRegex = searchFilter(options.search)
        match.$or = [
          { title: sRegex },
          { category: sRegex },
          { seller_name: sRegex },
        ]
      }

      const limit = options.limit ?? 20
      const skip = options.skip ?? 0

      const extraMatch: Record<string, unknown> = {}
      if (options.minDiscount && options.minDiscount > 0) {
        extraMatch.discountPercentage = { $gte: options.minDiscount }
      }

      if (options.sortBy === 'random') {
        const results = await col
          .aggregate<Product>([
            ...matchStages(match),
            ...joinAndProjectStages(),
            ...(Object.keys(extraMatch).length > 0 ? [{ $match: extraMatch }] : []),
            { $sample: { size: limit } },
          ])
          .toArray()
        if (results.length > 0) return results
      } else {
        const sortField = VALID_SORT_FIELDS.has(options.sortBy ?? '')
          ? (options.sortBy as string)
          : 'lastCrawledAt'

        const results = await col
          .aggregate<Product>([
            ...buildProductPipeline(match),
            ...(Object.keys(extraMatch).length > 0 ? [{ $match: extraMatch }] : []),
            { $sort: { [sortField]: options.sortOrder ?? -1, _id: -1 } },
            { $skip: skip },
            { $limit: limit },
          ])
          .toArray()
        if (results.length > 0) return results
      }
    } catch (err) {
      console.warn('MongoDB findMany fallback:', err instanceof Error ? err.message : err)
    }

    // --- Mock Fallback ---
    let filtered = INITIAL_PRODUCTS.map(mockToProduct)
    if (options.category && options.category.toLowerCase() !== 'all') {
      const c = options.category.toLowerCase().trim()
      filtered = filtered.filter((p) => p.category.toLowerCase().trim() === c)
    }
    if (options.search && options.search.trim()) {
      const words = options.search.toLowerCase().trim().split(/\s+/).filter(Boolean)
      filtered = filtered.filter((p) => {
        const text = `${p.name} ${p.category} ${p.sellerName || ''}`.toLowerCase()
        return words.every((w) => text.includes(w))
      })
    }
    if (options.minDiscount && options.minDiscount > 0) {
      filtered = filtered.filter((p) => p.discountPercentage >= options.minDiscount!)
    }

    if (options.sortBy === 'random') {
      // Shuffle products randomly when random sort is requested
      filtered = [...filtered].sort(() => Math.random() - 0.5)
    } else if (options.sortBy === 'currentPrice') {
      filtered.sort((a, b) => (options.sortOrder === 1 ? a.currentPrice - b.currentPrice : b.currentPrice - a.currentPrice))
    } else if (options.sortBy === 'discountPercentage') {
      filtered.sort((a, b) => (options.sortOrder === 1 ? a.discountPercentage - b.discountPercentage : b.discountPercentage - a.discountPercentage))
    } else {
      filtered.sort((a, b) => b.discountPercentage - a.discountPercentage)
    }

    const skip = options.skip ?? 0
    const limit = options.limit ?? 20
    return filtered.slice(skip, skip + limit)
  }

  async countMany(options: { category?: string; search?: string; minDiscount?: number }) {
    try {
      const col = await this.getCollection()
      const filter: Record<string, unknown> = { is_delisted: false }
      if (options.category && options.category.toLowerCase() !== 'all') {
        filter.category = categoryFilter(options.category)
      }
      if (options.search && options.search.trim()) {
        const sRegex = searchFilter(options.search)
        filter.$or = [
          { title: sRegex },
          { category: sRegex },
          { seller_name: sRegex },
        ]
      }

      if (!options.minDiscount) {
        const count = await col.countDocuments(filter)
        if (count > 0) return count
      } else {
        const extraMatch: Record<string, unknown> = { discountPercentage: { $gte: options.minDiscount } }
        const res = await col
          .aggregate([
            ...buildProductPipeline(filter),
            { $match: extraMatch },
            { $count: 'total' },
          ])
          .toArray()
        if (res[0]?.total) return res[0].total
      }
    } catch (err) {
      console.warn('MongoDB countMany fallback:', err instanceof Error ? err.message : err)
    }

    let filtered = INITIAL_PRODUCTS
    if (options.category && options.category.toLowerCase() !== 'all') {
      const c = options.category.toLowerCase().trim()
      filtered = filtered.filter((p) => p.category.toLowerCase().trim() === c)
    }
    if (options.search && options.search.trim()) {
      const words = options.search.toLowerCase().trim().split(/\s+/).filter(Boolean)
      filtered = filtered.filter((p) => {
        const text = `${p.name} ${p.category} ${p.sellerName || ''} ${p.description || ''}`.toLowerCase()
        return words.every((w) => text.includes(w))
      })
    }
    if (options.minDiscount && options.minDiscount > 0) {
      filtered = filtered.filter((p) => p.discountPercentage >= options.minDiscount!)
    }
    return filtered.length
  }

  async getCategories(): Promise<string[]> {
    try {
      const col = await this.getCollection()
      const rawCategories = await col.distinct('category', { is_delisted: false })
      if (rawCategories && rawCategories.length > 0) {
        const unique = Array.from(
          new Set(
            rawCategories
              .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
              .map((c) => c.trim())
          )
        ).sort((a, b) => a.localeCompare(b))
        if (unique.length > 0) return unique
      }
    } catch (err) {
      console.warn('MongoDB getCategories fallback:', err instanceof Error ? err.message : err)
    }

    // Mock fallback: distinct categories from INITIAL_PRODUCTS only
    const mockCats = Array.from(new Set(INITIAL_PRODUCTS.map((p) => p.category))).sort((a, b) => a.localeCompare(b))
    return mockCats
  }

  async findTrending(limit = 10): Promise<Product[]> {
    try {
      const col = await this.getCollection()
      const results = await col
        .aggregate<Product>([
          ...buildProductPipeline({ is_delisted: false }),
          { $match: { discountPercentage: { $gte: 10 } } },
          { $sort: { discountPercentage: -1, _id: -1 } },
          { $limit: limit },
        ])
        .toArray()
      if (results.length > 0) return results
    } catch (err) {
      console.warn('MongoDB findTrending fallback:', err instanceof Error ? err.message : err)
    }

    return INITIAL_PRODUCTS.map(mockToProduct)
      .filter((p) => p.discountPercentage >= 10)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)
      .slice(0, limit)
  }

  async getPriceHistory(itemId: string): Promise<PriceHistory[]> {
    try {
      const col = await this.getPriceHistoryCollection()
      const results = await col
        .aggregate<PriceHistory>([
          { $match: { item_id: itemId } },
          { $sort: { scraped_at: 1 } },
          {
            $project: {
              _id: { $toString: '$_id' },
              productId: '$item_id',
              price: '$current_price',
              recordedAt: '$scraped_at',
            },
          },
        ])
        .toArray()
      if (results.length > 0) return results
    } catch (err) {
      console.warn('MongoDB getPriceHistory fallback:', err instanceof Error ? err.message : err)
    }

    const mock = INITIAL_PRODUCTS.find((p) => p.id === itemId)
    return mock ? mockToPriceHistory(mock) : []
  }

  /**
   * Returns the earliest calendar month (YYYY-MM) with real price_history
   * data, or null if the collection is empty. Used to bound snapshot
   * seeding to months that actually have crawled data — never fabricate
   * a month that predates real crawling.
   */
  async getEarliestPriceHistoryMonth(): Promise<string | null> {
    try {
      const col = await this.getPriceHistoryCollection()
      const doc = await col
        .find({}, { projection: { scraped_at: 1 } })
        .sort({ scraped_at: 1 })
        .limit(1)
        .toArray()

      if (doc.length === 0 || !doc[0].scraped_at) return null

      const d = new Date(doc[0].scraped_at)
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    } catch (err) {
      console.warn('MongoDB getEarliestPriceHistoryMonth error:', err instanceof Error ? err.message : err)
      return null
    }
  }

  async getCategoryAverages() {
    try {
      const col = await this.getPriceHistoryCollection()
      const results = await col
        .aggregate([
          { $sort: { scraped_at: -1 } },
          {
            $group: {
              _id: '$item_id',
              category: { $first: '$category' },
              current_price: { $first: '$current_price' },
            },
          },
          {
            $group: {
              _id: '$category',
              avgPrice: { $avg: '$current_price' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray()
      return results
    } catch (err) {
      console.warn('MongoDB getCategoryAverages error:', err instanceof Error ? err.message : err)
      return []
    }
  }

  async getCategoryAveragesForMonth(monthStr: string) {
    try {
      const [yearStr, monthNumStr] = monthStr.split('-')
      const year = parseInt(yearStr, 10)
      const monthNum = parseInt(monthNumStr, 10)

      if (isNaN(year) || isNaN(monthNum)) {
        console.warn(`getCategoryAveragesForMonth: invalid month string "${monthStr}"`)
        return []
      }

      const startOfMonth = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0))
      const endOfMonth = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999))

      const col = await this.getPriceHistoryCollection()
      const results = await col
        .aggregate([
          { $match: { scraped_at: { $gte: startOfMonth, $lte: endOfMonth } } },
          { $sort: { scraped_at: -1 } },
          {
            $group: {
              _id: '$item_id',
              category: { $first: '$category' },
              current_price: { $first: '$current_price' },
            },
          },
          {
            $group: {
              _id: '$category',
              avgPrice: { $avg: '$current_price' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray()
      return results
    } catch (err) {
      console.warn('MongoDB getCategoryAveragesForMonth error:', err instanceof Error ? err.message : err)
      return []
    }
  }

  private async getSnapshotCollection() {
    const db = await getMongoDb()
    return db.collection<PriceIndexSnapshotDoc>('price_index_snapshots')
  }

  async getSnapshotByMonth(month: string): Promise<PriceIndexSnapshotDoc | null> {
    try {
      const col = await this.getSnapshotCollection()
      const doc = await col.findOne({ month })
      if (doc) return doc
    } catch (err) {
      console.warn('MongoDB getSnapshotByMonth error:', err instanceof Error ? err.message : err)
    }
    return null
  }

  async getLatestSnapshot(): Promise<PriceIndexSnapshotDoc | null> {
    try {
      const col = await this.getSnapshotCollection()
      const docs = await col.find({}).sort({ month: -1 }).limit(1).toArray()
      if (docs.length > 0) return docs[0]
    } catch (err) {
      console.warn('MongoDB getLatestSnapshot error:', err instanceof Error ? err.message : err)
    }
    return null
  }

  async getAllSnapshots(): Promise<PriceIndexSnapshotDoc[]> {
    try {
      const col = await this.getSnapshotCollection()
      return await col.find({}).sort({ month: 1 }).toArray()
    } catch (err) {
      console.warn('MongoDB getAllSnapshots error:', err instanceof Error ? err.message : err)
    }
    return []
  }

  async saveSnapshot(snapshot: PriceIndexSnapshotDoc): Promise<void> {
    try {
      const col = await this.getSnapshotCollection()
      const existing = await col.findOne({ month: snapshot.month })
      if (!existing) {
        await col.insertOne(snapshot)
      }
    } catch (err) {
      console.warn('MongoDB saveSnapshot error:', err instanceof Error ? err.message : err)
    }
  }
}

export const productRepository = new ProductRepository()