import { NextRequest, NextResponse } from 'next/server'
import { requireAdminServerSession } from '@/lib/auth/admin-auth'
import { productRepository } from '@/repositories/product.repository'
import { adminService } from '@/services/admin.service'

export async function GET(request: NextRequest) {
  const auth = await requireAdminServerSession(request)
  if (!auth.isAuthorized) {
    return auth.errorResponse!
  }

  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') ?? undefined
    const limit = Number(searchParams.get('limit') ?? 50)

    const products = await productRepository.findMany({ search, limit })
    return NextResponse.json({ products })
  } catch (error) {
    console.error('API GET /api/admin/products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminServerSession(request)
  if (!auth.isAuthorized) {
    return auth.errorResponse!
  }

  try {
    const body = await request.json()
    const { title, url, category, seller_name, sellerName, current_price, currentPrice } = body

    const productTitle = title?.trim()
    const productUrl = url?.trim() || 'https://www.daraz.com.np'
    const productCategory = category?.trim() || 'General'
    const seller = (seller_name || sellerName || 'Admin Listing')?.trim()
    const price = Number(current_price ?? currentPrice)

    if (!productTitle || isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Title and valid current_price (> 0) are required.' },
        { status: 400 }
      )
    }

    const created = await adminService.createProduct({
      title: productTitle,
      url: productUrl,
      category: productCategory,
      seller_name: seller,
      current_price: price,
    })

    return NextResponse.json({ success: true, product: created }, { status: 201 })
  } catch (error) {
    console.error('API POST /api/admin/products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
