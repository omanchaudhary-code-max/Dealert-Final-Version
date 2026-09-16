import { NextResponse } from 'next/server'
import { productService } from '@/services/product.service'

export async function GET() {
  try {
    const categories = await productService.getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
