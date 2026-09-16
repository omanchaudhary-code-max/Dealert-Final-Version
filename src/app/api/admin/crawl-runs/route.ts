import { NextRequest, NextResponse } from 'next/server'
import { requireAdminServerSession } from '@/lib/auth/admin-auth'
import { adminService } from '@/services/admin.service'

export async function GET(request: NextRequest) {
  const auth = await requireAdminServerSession(request)
  if (!auth.isAuthorized) {
    return auth.errorResponse!
  }

  try {
    const { searchParams } = request.nextUrl
    const limit = Number(searchParams.get('limit') ?? 20)
    const runs = await adminService.getCrawlRuns(limit)
    return NextResponse.json(runs)
  } catch (error) {
    console.error('API /api/admin/crawl-runs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
