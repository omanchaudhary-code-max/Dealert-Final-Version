import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ShieldCheck, Tag, ExternalLink, TrendingDown, Clock, Bell } from 'lucide-react'
import { productRepository } from '@/repositories/product.repository'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = (await productRepository.findByItemId(id)) || (await productRepository.findById(id))

  if (!product) {
    return {
      title: 'Product Not Found | Dealert Nepal',
      description: 'The requested product could not be found in the Dealert Daraz Nepal catalog.',
      robots: { index: false },
    }
  }

  const title = `${product.name} Price History & Deal Alerts | Dealert Nepal`
  const description = `Track price history for ${product.name} on Daraz Nepal. Current price: ${formatCurrency(product.currentPrice)}. Verify real discounts, view all-time low, and configure instant price-drop alerts.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.dealertnepal.com/products/${product.itemId || product.id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.dealertnepal.com/products/${product.itemId || product.id}`,
      siteName: 'Dealert',
      images: [
        {
          url: product.imageUrl || 'https://www.dealertnepal.com/dealert_logo.png',
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.imageUrl || 'https://www.dealertnepal.com/dealert_logo.png'],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const product = (await productRepository.findByItemId(id)) || (await productRepository.findById(id))

  if (!product) {
    notFound()
  }

  const priceHistory = await productRepository.getPriceHistory(product.itemId || product.id)
  const historicalPrices = priceHistory.map((ph) => ph.price)
  const allTimeLow = historicalPrices.length > 0 ? Math.min(...historicalPrices) : product.currentPrice
  const allTimeHigh = historicalPrices.length > 0 ? Math.max(...historicalPrices) : product.currentPrice
  const avgPrice = historicalPrices.length > 0
    ? Math.round(historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length)
    : product.currentPrice

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: [product.imageUrl || 'https://www.dealertnepal.com/dealert_logo.png'],
    description: `Price tracking and historical analysis for ${product.name} on Daraz Nepal. Current price: ${formatCurrency(product.currentPrice)}.`,
    sku: product.itemId || product.id,
    brand: {
      '@type': 'Brand',
      name: product.sellerName || 'Dealert Verified Merchant',
    },
    offers: {
      '@type': 'Offer',
      url: `https://www.dealertnepal.com/products/${product.itemId || product.id}`,
      priceCurrency: 'NPR',
      price: product.currentPrice,
      priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.sellerName || 'Daraz Nepal Merchant',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background text-foreground pb-20">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <Link href="/deals" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Live Deals
            </Link>

            <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1 px-3">
              <Tag className="h-3.5 w-3.5 text-primary" />
              <span>Category: {product.category || 'General'}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 rounded-3xl border border-border/60 bg-card p-6 shadow-card space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-2xl bg-muted/30">
                <img
                  src={product.imageUrl || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between items-center">
                  <span>Seller Name:</span>
                  <span className="font-bold text-foreground">{product.sellerName || 'Daraz Nepal Seller'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>In Stock Status:</span>
                  <span className="font-bold text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Available on Daraz
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {product.name}
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Real-time price history tracking and deal verification for Daraz Nepal listings.
                </p>
              </div>

              <div className="p-6 rounded-3xl border border-border/60 bg-card shadow-card space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono-num text-foreground">
                    {formatCurrency(product.currentPrice)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.currentPrice && (
                    <span className="text-base font-mono-num text-muted-foreground line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                  {product.discountPercentage ? (
                    <Badge variant="destructive" className="font-mono-num font-bold text-xs">
                      {product.discountPercentage}% OFF
                    </Badge>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/60 text-center">
                  <div className="p-3 rounded-xl bg-muted/40">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block">All-Time Low</span>
                    <span className="text-xs font-bold text-success font-mono-num">{formatCurrency(allTimeLow)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block">Average Price</span>
                    <span className="text-xs font-bold text-foreground font-mono-num">{formatCurrency(avgPrice)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block">All-Time High</span>
                    <span className="text-xs font-bold text-muted-foreground font-mono-num">{formatCurrency(allTimeHigh)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={product.productUrl || 'https://www.daraz.com.np'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button variant="primary" className="w-full font-bold gap-2 h-11">
                      <ExternalLink className="h-4 w-4" />
                      <span>View Deal on Daraz Nepal</span>
                    </Button>
                  </a>
                  <Link href={`/fake-page-detector?url=${encodeURIComponent(product.productUrl || '')}`}>
                    <Button variant="outline" className="font-bold gap-2 h-11">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span>Verify Seller Trust</span>
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-border/60 bg-card shadow-card space-y-3">
                <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  <span>Historical Price Analytics</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Track price records scraped across verified crawl cycles. Verify whether this discount is genuine or an inflated seasonal promotion.
                </p>
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Recorded Price Data Points:</span>
                    <span className="font-mono font-bold text-foreground">{priceHistory.length} checkpoints</span>
                  </div>
                  <div className="flex justify-between">
                    <span>First Tracked:</span>
                    <span className="font-mono text-foreground">
                      {priceHistory[0] ? new Date((priceHistory[0] as any).recordedAt || (priceHistory[0] as any).scrapedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
