import { notificationService } from '@/services/notification.service'

export interface PriceAlertEmailOptions {
  to: string
  userName: string
  productName: string
  targetPrice?: number
  targetPriceMin?: number | null
  currentPrice: number
  productUrl: string
  alertId: string
  userId: string
  triggerType?: 'TARGET_PRICE' | 'ALL_TIME_LOW' | 'TEN_PERCENT_DROP'
}

/**
 * Builds the notification message text for target price alerts based on range floor (targetPriceMin).
 */
export function buildTargetPriceAlertMessage(options: {
  targetPrice: number
  targetPriceMin?: number | null
  currentPrice: number
}): string {
  const { targetPrice, targetPriceMin, currentPrice } = options

  if (targetPriceMin === null || targetPriceMin === undefined) {
    return 'has dropped to or below your target price!'
  }

  if (currentPrice >= targetPriceMin) {
    return `Price dropped into your target range (Rs. ${targetPriceMin}–${targetPrice}) — now at Rs. ${currentPrice}`
  } else {
    return `Price dropped even lower than expected — now at Rs. ${currentPrice} (below your Rs. ${targetPriceMin}–${targetPrice} target range)`
  }
}

/**
 * Sends a price alert email via NotificationService.
 */
export async function sendPriceAlertEmail(options: PriceAlertEmailOptions) {
  return notificationService.sendAlertEmail(options)
}
