import { NextRequest, NextResponse } from 'next/server'
import { requireAdminServerSession } from '@/lib/auth/admin-auth'
import { adminService } from '@/services/admin.service'

export async function GET(request: NextRequest) {
  const auth = await requireAdminServerSession(request)
  if (!auth.isAuthorized) {
    return auth.errorResponse!
  }

  try {
    const status = await adminService.getCrawlStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('API /api/admin/crawl-status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
