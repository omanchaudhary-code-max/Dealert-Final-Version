import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/services/product.service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const minDiscountParam = searchParams.get('minDiscount')

    const result = await productService.getProducts({
      category: searchParams.get('category') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 20),
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
      minDiscount: minDiscountParam ? Number(minDiscountParam) : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
