import { Metadata } from 'next'
import { PriceIndexClient } from './PriceIndexClient'

export const metadata: Metadata = {
  title: "Nepal E-Commerce Price Index & Market Inflation Trends | Dealert",
  description: "Monthly price index and market inflation analytics for Daraz e-commerce products in Nepal. Track category price trends across electronics, mobiles, and laptops.",
  alternates: {
    canonical: "https://www.dealertnepal.com/price-index",
  },
  openGraph: {
    title: "Nepal E-Commerce Price Index & Market Inflation Trends | Dealert",
    description: "Monthly price index and market inflation analytics for Daraz e-commerce products in Nepal. Track category price trends across electronics, mobiles, and laptops.",
    url: "https://www.dealertnepal.com/price-index",
    siteName: "Dealert",
    images: [
      {
        url: "/dealert_logo.png",
        width: 1200,
        height: 630,
        alt: "Nepal E-Commerce Price Index",
      },
    ],
    type: "website",
  },
}

export default function PriceIndexPage() {
  return <PriceIndexClient />
}
