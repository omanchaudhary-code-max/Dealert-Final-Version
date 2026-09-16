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
    const logs = await adminService.getCrawlLogs({
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 20),
      status: searchParams.get('status') ?? undefined,
    })
    return NextResponse.json(logs)
  } catch (error) {
    console.error('API /api/admin/logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}