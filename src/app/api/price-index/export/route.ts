import { NextRequest, NextResponse } from 'next/server'
import { productRepository } from '@/repositories/product.repository'
import { ensureInitialSnapshots } from '@/jobs/monthly-price-index'
import { verifyAccessToken } from '@/lib/jwt'
import { userRepository } from '@/repositories/user.repository'

export async function GET(request: NextRequest) {
  try {
    const accessToken =
      request.cookies.get('access_token')?.value ||
      request.cookies.get('accessToken')?.value ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

    let userRole: string | null = null
    if (accessToken) {
      try {
        const payload = await verifyAccessToken(accessToken)
        userRole = payload.role
        if (!userRole) {
          const dbUser = await userRepository.findById(payload.userId)
          userRole = dbUser?.role || null
        }
      } catch {
        userRole = null
      }
    }

    const normalizedRole = userRole?.toLowerCase()
    const isAuthorized =
      normalizedRole === 'pro' ||
      normalizedRole === 'admin' ||
      normalizedRole === 'super_admin'

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Pro subscription required for CSV export' },
        { status: 403 }
      )
    }

    await ensureInitialSnapshots()
    const snapshots = await productRepository.getAllSnapshots()

    let csvContent = 'Month,Category,AveragePrice_NPR,ProductCount,PctChangeVsLastMonth,MethodologyVersion,ComputedAt\n'

    for (const snap of snapshots) {
      for (const cat of snap.categories) {
        const momStr = cat.pctChangeVsLastMonth !== null ? `${cat.pctChangeVsLastMonth}%` : 'N/A'
        const computedStr = snap.computedAt ? new Date(snap.computedAt).toISOString() : ''
        csvContent += `"${snap.month}","${cat.category}",${cat.avgPrice},${cat.productCount},"${momStr}","${snap.methodologyVersion}","${computedStr}"\n`
      }
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="daraz_price_index_${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json({ error: 'Failed to generate CSV export' }, { status: 500 })
  }
}
