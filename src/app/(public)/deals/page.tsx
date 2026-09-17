import { Metadata } from 'next'
import { DealsClient } from './DealsClient'

export const metadata: Metadata = {
  title: "Verified Daraz Price Drops & Live Deals Nepal | Dealert",
  description: "Browse live verified price drops, 10%+ discounts, and price history on Daraz Nepal products. Setup instant alerts for price drops.",
  alternates: {
    canonical: "https://www.dealertnepal.com/deals",
  },
  openGraph: {
    title: "Verified Daraz Price Drops & Live Deals Nepal | Dealert",
    description: "Browse live verified price drops, 10%+ discounts, and price history on Daraz Nepal products. Setup instant alerts for price drops.",
    url: "https://www.dealertnepal.com/deals",
    siteName: "Dealert",
    images: [
      {
        url: "/dealert_logo.png",
        width: 1200,
        height: 630,
        alt: "Dealert Nepal Live Deals & Price Drops",
      },
    ],
    type: "website",
  },
}

export default function DealsPage() {
  return <DealsClient />
}
