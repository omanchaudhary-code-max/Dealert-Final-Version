import { notificationRepository } from '@/repositories/notification.repository'
import { getResend, FROM_EMAIL } from '@/lib/resend'
import { logger } from '@/lib/logger'
import { buildTargetPriceAlertMessage } from '@/lib/email'

export class NotificationService {
  async sendAlertEmail(options: {
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
  }) {
    let triggerLabel = 'has dropped to your target price.'

    if (options.triggerType === 'TARGET_PRICE' && options.targetPrice) {
      triggerLabel = buildTargetPriceAlertMessage({
        targetPrice: options.targetPrice,
        targetPriceMin: options.targetPriceMin,
        currentPrice: options.currentPrice,
      })
    } else if (options.triggerType === 'ALL_TIME_LOW') {
      triggerLabel = 'has reached an ALL-TIME LOW price!'
    } else if (options.triggerType === 'TEN_PERCENT_DROP') {
      triggerLabel = 'dropped by over 10% in the latest price check! (Pro Alert)'
    }

    const log = await notificationRepository.create({
      user: { connect: { id: options.userId } },
      alert: { connect: { id: options.alertId } },
      email: options.to,
      message: `${options.productName} ${triggerLabel}`,
      status: 'PENDING',
      sentAt: new Date(),
    })

    const subject = options.triggerType === 'ALL_TIME_LOW'
      ? `🔥 All-Time Low Alert: ${options.productName}`
      : options.triggerType === 'TEN_PERCENT_DROP'
      ? `⚡ 10%+ Drop Alert: ${options.productName}`
      : `🎉 Price Drop Alert: ${options.productName}`

    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: options.to,
        subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${subject}</h2>
            <p>Hi ${options.userName},</p>
            <p>Great news! <strong>${options.productName}</strong> ${triggerLabel}</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              ${
                options.targetPrice
                  ? `<tr>
                      <td style="padding: 8px; border: 1px solid #ddd;">Your target price</td>
                      <td style="padding: 8px; border: 1px solid #ddd;">Rs. ${options.targetPrice.toLocaleString()}${
                        options.targetPriceMin ? ` (Min: Rs. ${options.targetPriceMin.toLocaleString()})` : ''
                      }</td>
                    </tr>`
                  : ''
              }
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">Current price</td>
                <td style="padding: 8px; border: 1px solid #ddd; color: green;"><strong>Rs. ${options.currentPrice.toLocaleString()}</strong></td>
              </tr>
            </table>
            <a href="${options.productUrl}" style="background: #f57d00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Buy Now on Daraz
            </a>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              You're receiving this because you set a price alert on Dealert. Cooldown limit: 7 days per item.
            </p>
          </div>
        `,
      })

      await notificationRepository.updateStatus(log.id, 'SENT')
      logger.info('Alert email sent', { alertId: options.alertId, to: options.to, triggerType: options.triggerType })
    } catch (error) {
      await notificationRepository.updateStatus(log.id, 'FAILED')
      logger.error('Failed to send alert email', { alertId: options.alertId, error })
      throw error
    }
  }

  async getUserNotifications(userId: string) {
    return notificationRepository.findByUserId(userId)
  }

  async markAsRead(id: string, userId: string) {
    return notificationRepository.markAsRead(id, userId)
  }

  async markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId)
  }

  async getUnreadCount(userId: string) {
    return notificationRepository.countUnreadByUserId(userId)
  }

  async clearNotifications(userId: string) {
    return notificationRepository.clearByUserId(userId)
  }
}

export const notificationService = new NotificationService()