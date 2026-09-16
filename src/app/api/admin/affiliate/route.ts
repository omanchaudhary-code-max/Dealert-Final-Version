import { NextRequest, NextResponse } from 'next/server'
import { requireAdminServerSession } from '@/lib/auth/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdminServerSession(request)
  if (!auth.isAuthorized) {
    return auth.errorResponse!
  }

  return NextResponse.json({
    status: 'pending_daraz_approval',
    message: 'Affiliate revenue tracking — pending Daraz Affiliate Program approval. This section will populate once affiliate link tracking is live.',
  })
}