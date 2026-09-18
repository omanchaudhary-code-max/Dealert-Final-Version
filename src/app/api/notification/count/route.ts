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
  if (!userId) return NextResponse.json({ unreadCount: 0 })

  try {
    const unreadCount = await notificationService.getUnreadCount(userId)
    return NextResponse.json({ unreadCount })
  } catch {
    return NextResponse.json({ unreadCount: 0 })
  }
}
