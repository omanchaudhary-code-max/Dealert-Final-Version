import type { MetadataRoute } from 'next'
import { productRepository } from '@/repositories/product.repository'

// MEMORY & PERFORMANCE FIX: Cache sitemap generation for 24h (86,400s)
// Prevents querying 1,000 product records from MongoDB on every request in dev/prod.
export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.dealertnepal.com'

  let products: Array<{ itemId?: string; id?: string; lastCrawledAt?: Date | string }> = []
  try {
    products = await productRepository.findMany({ limit: 1000 })
  } catch (err) {
    console.warn('Failed to fetch products for sitemap generation:', err)
  }

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.itemId || p.id}`,
    lastModified: p.lastCrawledAt ? new Date(p.lastCrawledAt) : new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/price-index`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/fake-page-detector`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  return [...staticUrls, ...productUrls]
}
