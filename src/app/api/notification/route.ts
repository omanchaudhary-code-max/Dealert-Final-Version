import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/services/notification.service'
import { verifyAccessToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  const token =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { userId } = await verifyAccessToken(token)
    const notifications = await notificationService.getUserNotifications(userId)
    return NextResponse.json(notifications)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}