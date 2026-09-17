import { Metadata } from 'next'
import { PricingClient } from './PricingClient'

export const metadata: Metadata = {
  title: "Dealert Free & Pro Subscription Plans | Daraz Price Tracker Nepal",
  description: "Compare Dealert Free and Pro plans for Daraz Nepal price tracking. Get unlimited wishlist slots, 10% price drop alerts, and priority seller trust verification.",
  alternates: {
    canonical: "https://www.dealertnepal.com/pricing",
  },
  openGraph: {
    title: "Dealert Free & Pro Subscription Plans | Daraz Price Tracker Nepal",
    description: "Compare Dealert Free and Pro plans for Daraz Nepal price tracking. Get unlimited wishlist slots, 10% price drop alerts, and priority seller trust verification.",
    url: "https://www.dealertnepal.com/pricing",
    siteName: "Dealert",
    images: [
      {
        url: "/dealert_logo.png",
        width: 1200,
        height: 630,
        alt: "Dealert Pricing & Subscriptions Nepal",
      },
    ],
    type: "website",
  },
}

export default function PricingPage() {
  return <PricingClient />
}
