import { prisma } from '@/lib/prisma'
import type { Alert, Prisma } from '@prisma/client'

const inMemoryAlerts: Alert[] = [
  {
    id: 'alt-demo-1',
    userId: 'usr-demo-user-1',
    productId: 'prod-macbook-m3',
    targetPrice: 150000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export class AlertRepository {
  async findById(id: string): Promise<Alert | null> {
    try {
      const alert = await prisma.alert.findUnique({ where: { id } })
      if (alert) return alert
    } catch (err) {
      console.warn('Prisma Alert findById fallback:', err instanceof Error ? err.message : err)
    }
    return inMemoryAlerts.find((a) => a.id === id) ?? null
  }

  async findByUserId(userId: string): Promise<Alert[]> {
    try {
      return await prisma.alert.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
    } catch (err) {
      console.warn('Prisma Alert findByUserId fallback:', err instanceof Error ? err.message : err)
      return inMemoryAlerts.filter((a) => a.userId === userId)
    }
  }

  async findActiveAlerts(): Promise<Alert[]> {
    try {
      return await prisma.alert.findMany({
        where: { isActive: true },
        include: { user: { select: { email: true, fullName: true } } },
      })
    } catch (err) {
      console.warn('Prisma Alert findActiveAlerts fallback:', err instanceof Error ? err.message : err)
      return inMemoryAlerts.filter((a) => a.isActive)
    }
  }

  async findByProductId(productId: string): Promise<Alert[]> {
    try {
      return await prisma.alert.findMany({ where: { productId, isActive: true } })
    } catch (err) {
      console.warn('Prisma Alert findByProductId fallback:', err instanceof Error ? err.message : err)
      return inMemoryAlerts.filter((a) => a.productId === productId && a.isActive)
    }
  }

  async create(data: Prisma.AlertCreateInput): Promise<Alert> {
    try {
      const alert = await prisma.alert.create({ data })
      inMemoryAlerts.unshift(alert)
      return alert
    } catch (err) {
      console.warn('Prisma Alert create fallback:', err instanceof Error ? err.message : err)
      const newAlert: Alert = {
        id: `alt-mem-${Date.now()}`,
        userId: (data.user?.connect?.id as string) || 'usr-demo-user-1',
        productId: data.productId,
        targetPrice: data.targetPrice,
        isActive: data.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      inMemoryAlerts.unshift(newAlert)
      return newAlert
    }
  }

  async update(id: string, data: Prisma.AlertUpdateInput): Promise<Alert> {
    try {
      const alert = await prisma.alert.update({ where: { id }, data })
      const idx = inMemoryAlerts.findIndex((a) => a.id === id)
      if (idx !== -1) inMemoryAlerts[idx] = alert
      return alert
    } catch (err) {
      console.warn('Prisma Alert update fallback:', err instanceof Error ? err.message : err)
      const alert = inMemoryAlerts.find((a) => a.id === id)
      if (!alert) throw new Error('Alert not found')
      if (typeof data.targetPrice === 'number') alert.targetPrice = data.targetPrice
      if (typeof data.isActive === 'boolean') alert.isActive = data.isActive
      alert.updatedAt = new Date()
      return alert
    }
  }

  async delete(id: string): Promise<Alert> {
    try {
      return await prisma.alert.delete({ where: { id } })
    } catch (err) {
      console.warn('Prisma Alert delete fallback:', err instanceof Error ? err.message : err)
      const idx = inMemoryAlerts.findIndex((a) => a.id === id)
      if (idx === -1) throw new Error('Alert not found')
      const [removed] = inMemoryAlerts.splice(idx, 1)
      return removed
    }
  }

  async deactivate(id: string): Promise<Alert> {
    return this.update(id, { isActive: false })
  }
}

export const alertRepository = new AlertRepository()