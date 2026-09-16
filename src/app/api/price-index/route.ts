import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/services/product.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || undefined
    const category = searchParams.get('category') || undefined
    const history = searchParams.get('history') === 'true'

    const data = await productService.getPriceIndex({ month, category, history })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching price index:', error)
    return NextResponse.json({ error: 'Failed to fetch price index' }, { status: 500 })
  }
}