import { alertRepository } from '@/repositories/alert.repository'
import { productRepository } from '@/repositories/product.repository'
import { userRepository } from '@/repositories/user.repository'
import { notificationRepository } from '@/repositories/notification.repository'
import { notificationService } from '@/services/notification.service'
import { logger } from '@/lib/logger'

export interface AlertTriggerResult {
  alertId: string
  userId: string
  userEmail: string
  productName: string
  targetPrice: number
  currentPrice: number
  triggerType: 'TARGET_PRICE' | 'ALL_TIME_LOW' | 'TEN_PERCENT_DROP'
  emailSent: boolean
}

export interface EvaluateAlertsResult {
  productId: string
  itemId: string
  evaluatedCount: number
  triggeredCount: number
  alerts: AlertTriggerResult[]
}

/**
 * Reusable alert evaluation pipeline for a single product.
 * Evaluates active wishlist alerts against a product's latest current price,
 * checking target price hits, all-time lows, and 10% drops (Pro tier).
 * Sends emails via notificationService when criteria are met.
 */
export async function evaluateAlertsForProduct(
  productIdOrItemId: string,
  options: { skipCooldown?: boolean } = {}
): Promise<EvaluateAlertsResult> {
  const product =
    (await productRepository.findById(productIdOrItemId)) ||
    (await productRepository.findByItemId(productIdOrItemId))

  if (!product) {
    logger.warn('evaluateAlertsForProduct: Product not found', { productIdOrItemId })
    return {
      productId: productIdOrItemId,
      itemId: productIdOrItemId,
      evaluatedCount: 0,
      triggeredCount: 0,
      alerts: [],
    }
  }

  // Find alerts matching this product ID or item ID
  const allActive = (await alertRepository.findActiveAlerts()) as any[]
  const productAlerts = allActive.filter(
    (a) => a.productId === product.id || a.productId === product.itemId
  )

  const results: AlertTriggerResult[] = []

  for (const alert of productAlerts) {
    try {
      if (!options.skipCooldown) {
        const recentNotification = await notificationRepository.findRecentSent(
          alert.userId,
          alert.id,
          7
        )
        if (recentNotification) {
          logger.info('Alert skipped due to 7-day cooldown', { alertId: alert.id, userId: alert.userId })
          continue
        }
      }

      const userPlan = await userRepository.getUserPlan(alert.userId)
      const priceHistory = await productRepository.getPriceHistory(product.itemId || product.id)

      const historicalPrices = priceHistory.map((ph) => ph.price)
      const allTimeLow = historicalPrices.length > 0 ? Math.min(...historicalPrices) : product.currentPrice
      const isAllTimeLow = product.currentPrice <= allTimeLow

      let isTenPercentDrop = false
      if (priceHistory.length >= 2) {
        const prevPrice = priceHistory[priceHistory.length - 2].price
        if (prevPrice > 0 && (prevPrice - product.currentPrice) / prevPrice >= 0.10) {
          isTenPercentDrop = true
        }
      }

      const isTargetHit = product.currentPrice <= alert.targetPrice

      let triggerType: 'TARGET_PRICE' | 'ALL_TIME_LOW' | 'TEN_PERCENT_DROP' | null = null

      if (isTargetHit) {
        triggerType = 'TARGET_PRICE'
      } else if (isAllTimeLow) {
        triggerType = 'ALL_TIME_LOW'
      } else if (userPlan === 'PRO' && isTenPercentDrop) {
        triggerType = 'TEN_PERCENT_DROP'
      }

      if (triggerType) {
        let recipientEmail = alert.user?.email
        let recipientName = alert.user?.fullName

        if (!recipientEmail) {
          const dbUser = await userRepository.findById(alert.userId)
          recipientEmail = dbUser?.email
          recipientName = dbUser?.fullName
        }

        const emailSent = await notificationService.sendAlertEmail({
          to: recipientEmail || 'user@example.com',
          userName: recipientName || 'User',
          productName: product.name,
          targetPrice: alert.targetPrice,
          currentPrice: product.currentPrice,
          productUrl: (product as any).affiliateUrl ?? product.productUrl,
          alertId: alert.id,
          userId: alert.userId,
          triggerType,
        })

        results.push({
          alertId: alert.id,
          userId: alert.userId,
          userEmail: recipientEmail || 'user@example.com',
          productName: product.name,
          targetPrice: alert.targetPrice,
          currentPrice: product.currentPrice,
          triggerType,
          emailSent: true,
        })
      }
    } catch (error) {
      logger.error('Failed evaluating alert for product', { alertId: alert.id, productId: product.id, error })
    }
  }

  return {
    productId: product.id,
    itemId: product.itemId,
    evaluatedCount: productAlerts.length,
    triggeredCount: results.length,
    alerts: results,
  }
}

/**
 * Full alert processing job (cron / post-crawl trigger).
 * Evaluates all active alerts across all products.
 */
export async function processAlerts() {
  logger.info('Starting alert processing job')

  const activeAlerts = (await alertRepository.findActiveAlerts()) as any[]
  const processedProductIds = new Set<string>()

  let processed = 0
  let triggered = 0

  for (const alert of activeAlerts) {
    if (processedProductIds.has(alert.productId)) continue
    processedProductIds.add(alert.productId)

    const result = await evaluateAlertsForProduct(alert.productId)
    processed += result.evaluatedCount
    triggered += result.triggeredCount
  }

  logger.info('Alert processing complete', { processed, triggered })
  return { processed, triggered }
}