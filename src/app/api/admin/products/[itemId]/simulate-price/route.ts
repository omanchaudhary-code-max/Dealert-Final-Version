/**
 * DEMO-SUPPORT ENDPOINT: Simulate Price Drop & Live Alert Pipeline Trigger
 * 
 * Purpose: Allows administrators to manually trigger a price change on any tracked product
 * to demonstrate the wishlist alert pipeline live during testing or presentations without
 * waiting for a real Python crawler execution cycle.
 * 
 * Data Integrity & Traceability Guard:
 * All price_history documents created via this endpoint are tagged with source: "manual_demo".
 * Real crawler ingestion entries are tagged with source: "crawler". This ensures synthetic demo
 * prices are permanently distinguishable from real crawled market data in MongoDB.
 * 
 * Environment Gate:
 * Execution is strictly restricted to environments where process.env.ENABLE_DEMO_TOOLS === 'true'.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminServerSession } from '@/lib/auth/admin-auth'
import { adminService } from '@/services/admin.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  // 1. Environment Gate Check
  if (process.env.ENABLE_DEMO_TOOLS !== 'true') {
    return NextResponse.json(
      { error: 'Demo tools are disabled in this environment.' },
      { status: 403 }
    )
  }

  // 2. Server-side Admin Auth Gate
  const auth = await requireAdminServerSession(request)
  if (!auth.isAuthorized) {
    return auth.errorResponse!
  }

  try {
    const { itemId } = await params
    const body = await request.json()
    const newPrice = Number(body.newPrice ?? body.current_price ?? body.price)

    if (isNaN(newPrice) || newPrice <= 0) {
      return NextResponse.json(
        { error: 'A valid positive newPrice number is required.' },
        { status: 400 }
      )
    }

    // 3. Update price in DB & invoke real alert-checker function
    const result = await adminService.simulatePriceDrop(itemId, newPrice)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('API simulate-price error:', error)
    const errorMsg = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
