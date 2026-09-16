import {
  productRepository,
  METHODOLOGY_VERSION,
  MIN_PRODUCTS_PER_CATEGORY,
  PriceIndexSnapshotDoc,
  CategorySnapshotItem,
} from '@/repositories/product.repository'
import { logger } from '@/lib/logger'

/**
 * MIGRATION GUARD: Per NFR-Maintainability (Section 4.2.1), existing stored snapshots
 * must NEVER be recomputed or retroactively updated when methodology changes.
 * If methodology updates, bump METHODOLOGY_VERSION constant (e.g., 'v2') for future
 * snapshots only.
 */

export async function buildMonthlyPriceIndex(targetMonthStr?: string): Promise<PriceIndexSnapshotDoc> {
  const now = new Date()
  const targetMonth = targetMonthStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  logger.info('Building monthly price index snapshot', { targetMonth, version: METHODOLOGY_VERSION })

  // 1. Guard against overwriting an existing snapshot
  const existingSnapshot = await productRepository.getSnapshotByMonth(targetMonth)
  if (existingSnapshot) {
    logger.info('Snapshot already exists for target month, skipping recomputation', { targetMonth })
    return existingSnapshot
  }

  // 2. Fetch category averages using existing aggregation pipeline logic
  const rawAverages = (await productRepository.getCategoryAveragesForMonth(targetMonth)) as Array<{
    _id: string
    avgPrice: number
    count: number
  }>

  // 3. Find immediately preceding stored snapshot (for MoM calculation)
  const allSnapshots = await productRepository.getAllSnapshots()
  const priorSnapshots = allSnapshots
    .filter((s) => s.month < targetMonth)
    .sort((a, b) => b.month.localeCompare(a.month))
  const lastSnapshot = priorSnapshots[0] || null

  const priorCategoryMap = new Map<string, number>()
  if (lastSnapshot) {
    for (const cat of lastSnapshot.categories) {
      priorCategoryMap.set(cat.category.toLowerCase().trim(), cat.avgPrice)
    }
  }

  // 4. Filter categories by MIN_PRODUCTS_PER_CATEGORY and compute pctChangeVsLastMonth
  const categories: CategorySnapshotItem[] = []

  for (const item of rawAverages) {
    const count = item.count
    if (count < MIN_PRODUCTS_PER_CATEGORY) {
      continue // Exclude categories below product threshold
    }

    const categoryName = item._id
    const avgPrice = Math.round(item.avgPrice * 100) / 100
    const prevPrice = priorCategoryMap.get(categoryName.toLowerCase().trim())

    let pctChangeVsLastMonth: number | null = null
    if (prevPrice !== undefined && prevPrice > 0) {
      const change = ((avgPrice - prevPrice) / prevPrice) * 100
      pctChangeVsLastMonth = Math.round(change * 10) / 10
    }

    categories.push({
      category: categoryName,
      avgPrice,
      productCount: count,
      pctChangeVsLastMonth,
    })
  }

  // 5. Construct single snapshot document
  const snapshot: PriceIndexSnapshotDoc = {
    month: targetMonth,
    methodologyVersion: METHODOLOGY_VERSION,
    computedAt: now,
    categories,
  }

  // 6. Save to MongoDB price_index_snapshots (only if qualifying categories exist)
  if (categories.length > 0) {
    await productRepository.saveSnapshot(snapshot)
    logger.info('Price index snapshot successfully created', {
      month: targetMonth,
      categoriesCount: categories.length,
    })
  } else {
    logger.info('Skipping save for empty snapshot (no qualifying categories)', {
      month: targetMonth,
    })
  }

  return snapshot
}

function buildMonthRange(startMonth: string, endMonth: string): string[] {
  const [startY, startM] = startMonth.split('-').map(Number)
  const [endY, endM] = endMonth.split('-').map(Number)

  const months: string[] = []
  let y = startY
  let m = startM

  while (y < endY || (y === endY && m <= endM)) {
    months.push(`${y}-${String(m).padStart(2, '0')}`)
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return months
}

/**
 * Auto-seeds historical monthly snapshots if the collection is completely
 * empty — but ONLY for months where real price_history data actually
 * exists. Never fabricates a month before crawling began.
 */
export async function ensureInitialSnapshots(): Promise<PriceIndexSnapshotDoc[]> {
  const existing = await productRepository.getAllSnapshots()
  if (existing.length > 0) {
    return existing
  }

  const earliestMonth = await productRepository.getEarliestPriceHistoryMonth()
  if (!earliestMonth) {
    logger.warn(
      'No price_history data found — skipping snapshot seeding entirely. ' +
        'Run the crawler first, then this will seed automatically on next request.'
    )
    return []
  }

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  logger.info('Seeding price index snapshots from earliest real crawl data', {
    earliestMonth,
    currentMonth,
  })

  const monthsToSeed = buildMonthRange(earliestMonth, currentMonth)

  for (const monthStr of monthsToSeed) {
    const snapshot = await buildMonthlyPriceIndex(monthStr)
    if (snapshot.categories.length === 0) {
      logger.info(
        `No qualifying categories for ${monthStr} (below MIN_PRODUCTS_PER_CATEGORY or no data) — saved as empty snapshot`
      )
    }
  }

  return productRepository.getAllSnapshots()
}