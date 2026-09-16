import { adminRepository, AdminCreateProductInput } from '@/repositories/admin.repository'
import { evaluateAlertsForProduct } from '@/jobs/process-alerts'

export class AdminService {
  async getCrawlStatus() {
    return await adminRepository.getCrawlStatus()
  }

  async getCrawlRuns(limit = 20) {
    return await adminRepository.getCrawlRuns(limit)
  }

  async getCrawlLogs(options: { page?: number; limit?: number; status?: string } = {}) {
    const limit = options.limit ?? 20
    const logs = await adminRepository.getCrawlRuns(limit)
    return { logs, total: logs.length, page: options.page ?? 1, limit }
  }

  async getCrawlErrors(limit = 50) {
    return await adminRepository.getCrawlErrors(limit)
  }

  async createProduct(input: AdminCreateProductInput) {
    return await adminRepository.createProduct(input)
  }

  /**
   * Simulates a manual price change on a product (Demo capability).
   * Inserts a price_history document tagged source: "manual_demo",
   * updates product current price, and IMMEDIATELY invokes the real
   * alert checking pipeline via evaluateAlertsForProduct.
   */
  async simulatePriceDrop(itemId: string, newPrice: number) {
    const updateResult = await adminRepository.simulatePriceUpdate(itemId, newPrice)
    const alertResult = await evaluateAlertsForProduct(updateResult.itemId)

    return {
      success: true,
      product: updateResult,
      alertResult: {
        evaluatedCount: alertResult.evaluatedCount,
        triggeredCount: alertResult.triggeredCount,
        alertsSent: alertResult.alerts,
      },
      message:
        alertResult.triggeredCount > 0
          ? `Price updated to NPR ${newPrice.toLocaleString()}. ${alertResult.triggeredCount} alert(s) triggered & sent.`
          : `Price updated to NPR ${newPrice.toLocaleString()}. No wishlist target price thresholds reached.`,
    }
  }

  async getDashboardStats() {
    const status = await this.getCrawlStatus()
    return {
      totalUsers: 0,
      totalProducts: 0,
      activeAlerts: 0,
      totalNotifications: 0,
      crawlStatus: status,
    }
  }

  async getAffiliateStats() {
    return {
      totalClicks: 0,
      clicksToday: 0,
      clicksThisMonth: 0,
      topProducts: [],
      status: 'pending_daraz_approval',
    }
  }
}

export const adminService = new AdminService()