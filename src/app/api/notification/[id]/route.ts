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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromRequest(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })

  try {
    await notificationService.markAsRead(id, userId)
    return NextResponse.json({ success: true, id, read: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to mark notification as read' }, { status: 500 })
  }
}
