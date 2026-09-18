import { getMongoDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface CrawlLogDoc {
  _id: ObjectId | string
  started_at: Date
  finished_at: Date | null
  categories: string[]
  total_products: number
  total_new: number
  total_updated: number
  total_errors: number
  status: string
  failure_reason?: string
}

export interface CrawlErrorDoc {
  _id: ObjectId | string
  crawl_run_id?: string
  category: string
  url: string
  reason: string
  logged_at?: Date
  createdAt?: Date
}

export interface AdminCreateProductInput {
  title: string
  url: string
  category: string
  seller_name: string
  current_price: number
}

export class AdminRepository {
  private async getDb() {
    return await getMongoDb()
  }

  async getCrawlStatus() {
    const db = await this.getDb()
    const latestRun = await db
      .collection<CrawlLogDoc>('crawl_logs')
      .find({})
      .sort({ started_at: -1 })
      .limit(1)
      .toArray()

    const doc = latestRun[0] || null

    let isStale = true
    if (doc && doc.started_at) {
      const startedAtTime = new Date(doc.started_at).getTime()
      const hoursAgo = (Date.now() - startedAtTime) / (1000 * 60 * 60)
      isStale = hoursAgo > 36
    }

    return {
      latestRun: doc
        ? {
            id: String(doc._id),
            started_at: doc.started_at,
            finished_at: doc.finished_at,
            categories: doc.categories || [],
            total_products: doc.total_products || 0,
            total_new: doc.total_new || 0,
            total_updated: doc.total_updated || 0,
            total_errors: doc.total_errors || 0,
            status: doc.status || 'unknown',
            failure_reason: doc.failure_reason,
          }
        : null,
      isStale,
    }
  }

  async getDashboardCounts() {
    const db = await this.getDb()
    const totalProducts = await db.collection('products').countDocuments({ is_delisted: { $ne: true } })
    const status = await this.getCrawlStatus()
    return {
      totalProducts,
      status,
    }
  }

  async getCrawlRuns(limit = 20) {
    const db = await this.getDb()
    const runs = await db
      .collection<CrawlLogDoc>('crawl_logs')
      .find({})
      .sort({ started_at: -1 })
      .limit(limit)
      .toArray()

    return runs.map((r) => ({
      id: String(r._id),
      started_at: r.started_at,
      finished_at: r.finished_at,
      categories: r.categories || [],
      total_products: r.total_products || 0,
      total_new: r.total_new || 0,
      total_updated: r.total_updated || 0,
      total_errors: r.total_errors || 0,
      status: r.status || 'unknown',
      failure_reason: r.failure_reason,
    }))
  }

  async getCrawlErrors(limit = 50) {
    const db = await this.getDb()
    const errors = await db
      .collection<CrawlErrorDoc>('errors')
      .find({})
      .sort({ logged_at: -1, _id: -1 })
      .limit(limit)
      .toArray()

    return errors.map((e) => ({
      id: String(e._id),
      crawl_run_id: e.crawl_run_id || 'N/A',
      category: e.category || 'General',
      url: e.url || '',
      reason: e.reason || 'Unknown crawler error',
      logged_at: e.logged_at || e.createdAt || new Date(),
    }))
  }

  async createProduct(input: AdminCreateProductInput) {
    const db = await this.getDb()
    const itemId = `manual-demo-${Date.now()}`
    const now = new Date()

    const productDoc = {
      item_id: itemId,
      title: input.title,
      url: input.url,
      category: input.category,
      seller_name: input.seller_name,
      last_seen: now,
      last_price: input.current_price,
      first_seen: now,
      image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80',
      image_verified: true,
      is_delisted: false,
    }

    await db.collection('products').insertOne(productDoc)

    const historyDoc = {
      item_id: itemId,
      crawl_run_id: 'manual_demo',
      scraped_at: now,
      current_price: input.current_price,
      original_price: input.current_price,
      is_promotional: false,
      category: input.category,
      is_delisted: false,
      source: 'manual_demo',
    }

    await db.collection('price_history').insertOne(historyDoc)

    return {
      itemId,
      title: input.title,
      url: input.url,
      category: input.category,
      sellerName: input.seller_name,
      currentPrice: input.current_price,
      lastCrawledAt: now,
    }
  }

  async simulatePriceUpdate(itemId: string, newPrice: number) {
    const db = await this.getDb()
    const now = new Date()

    // Find existing product by item_id or _id
    let product = await db.collection('products').findOne({ item_id: itemId })
    if (!product && ObjectId.isValid(itemId)) {
      product = await db.collection('products').findOne({ _id: new ObjectId(itemId) })
    }

    if (!product) {
      throw new Error(`Product not found for itemId: ${itemId}`)
    }

    const actualItemId = product.item_id || itemId

    // 1. Insert new price_history document tagged source: "manual_demo"
    const historyDoc = {
      item_id: actualItemId,
      crawl_run_id: 'manual_demo',
      scraped_at: now,
      current_price: newPrice,
      original_price: product.last_price || newPrice,
      is_promotional: false,
      category: product.category || 'General',
      is_delisted: false,
      source: 'manual_demo',
    }

    await db.collection('price_history').insertOne(historyDoc)

    // 2. Update product's last_price and last_seen
    await db.collection('products').updateOne(
      { _id: product._id },
      {
        $set: {
          last_price: newPrice,
          last_seen: now,
        },
      }
    )

    return {
      itemId: actualItemId,
      productId: String(product._id),
      title: product.title,
      oldPrice: product.last_price,
      newPrice: newPrice,
      updatedAt: now,
    }
  }
}

export const adminRepository = new AdminRepository()
