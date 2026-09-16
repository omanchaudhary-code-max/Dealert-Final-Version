import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/services/product.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await productService.getProductById(id)
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Product not found' },
      { status: 404 }
    )
  }
}
