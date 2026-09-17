import { Metadata } from 'next'
import { IndexClient } from './IndexClient'

export const metadata: Metadata = {
  title: "Daraz Price History & Instant Deal Alert Platform | Dealert Nepal",
  description: "Track Daraz Nepal price history, verify real discounts, setup instant email price-drop alerts, and check seller trust scores before buying.",
  alternates: {
    canonical: "https://www.dealertnepal.com",
  },
  openGraph: {
    title: "Daraz Price History & Instant Deal Alert Platform | Dealert Nepal",
    description: "Track Daraz Nepal price history, verify real discounts, setup instant email price-drop alerts, and check seller trust scores before buying.",
    url: "https://www.dealertnepal.com",
    siteName: "Dealert",
    images: [
      {
        url: "/dealert_logo.png",
        width: 1200,
        height: 630,
        alt: "Dealert Nepal - Daraz Price Tracker & Deal Alerts",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}

export default function IndexPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dealert Nepal',
    url: 'https://www.dealertnepal.com',
    logo: 'https://www.dealertnepal.com/dealert_logo.png',
    description: "Nepal's price tracking, deal alert, and seller trust verification platform for Daraz e-commerce.",
    sameAs: [],
  }

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dealert Nepal',
    url: 'https://www.dealertnepal.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.dealertnepal.com/deals?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <IndexClient />
    </>
  )
}
