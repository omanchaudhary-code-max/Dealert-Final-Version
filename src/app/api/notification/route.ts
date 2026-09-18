import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/services/notification.service'
import { verifyAccessToken } from '@/lib/jwt'

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const token =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!token) return null
  try {
    const { userId } = await verifyAccessToken(token)
    return userId
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const logs = await notificationService.getUserNotifications(userId)
  const notifications = logs.map((log) => ({
    id: log.id,
    userId: log.userId,
    alertId: log.alertId,
    email: log.email,
    message: log.message,
    read: log.isRead,
    status: log.status,
    sentAt: log.sentAt.toISOString(),
  }))

  return NextResponse.json(notifications)
}

export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json().catch(() => ({}))
    if (body.markAll) {
      await notificationService.markAllAsRead(userId)
      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }
    if (body.id) {
      await notificationService.markAsRead(body.id, userId)
      return NextResponse.json({ success: true, message: 'Notification marked as read' })
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update notification' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await notificationService.clearNotifications(userId)
    return NextResponse.json({ success: true, message: 'All notifications cleared' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to clear notifications' }, { status: 500 })
  }
}