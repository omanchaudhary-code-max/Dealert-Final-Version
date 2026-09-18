import { prisma } from '@/lib/prisma'
import type { NotificationLog, Prisma } from '@prisma/client'

export class NotificationRepository {
  async create(data: Prisma.NotificationLogCreateInput): Promise<NotificationLog> {
    return prisma.notificationLog.create({ data })
  }

  async findByUserId(userId: string, limit = 20): Promise<NotificationLog[]> {
    return prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: limit,
    })
  }

  async findByAlertId(alertId: string): Promise<NotificationLog[]> {
    return prisma.notificationLog.findMany({
      where: { alertId },
      orderBy: { sentAt: 'desc' },
    })
  }

  async updateStatus(id: string, status: 'SENT' | 'FAILED'): Promise<NotificationLog> {
    return prisma.notificationLog.update({ where: { id }, data: { status } })
  }

  async findRecentSent(userId: string, alertId: string, days = 7): Promise<NotificationLog | null> {
    try {
      const sevenDaysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      return await prisma.notificationLog.findFirst({
        where: {
          userId,
          alertId,
          status: 'SENT',
          sentAt: { gte: sevenDaysAgo },
        },
        orderBy: { sentAt: 'desc' },
      })
    } catch (err) {
      console.warn('Prisma notification fallback:', err instanceof Error ? err.message : err)
      return null
    }
  }

  async markAsRead(id: string, userId: string): Promise<NotificationLog> {
    return prisma.notificationLog.update({
      where: { id, userId },
      data: { isRead: true },
    })
  }

  async markAllAsRead(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.notificationLog.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return prisma.notificationLog.count({
      where: { userId, isRead: false },
    })
  }

  async clearByUserId(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.notificationLog.deleteMany({
      where: { userId },
    })
  }
}

export const notificationRepository = new NotificationRepository()