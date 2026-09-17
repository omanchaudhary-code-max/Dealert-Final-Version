import { Metadata } from 'next'
import { FakePageDetectorClient } from './FakePageDetectorClient'

export const metadata: Metadata = {
  title: "Check If Daraz Page Is Fake — Seller Trust & Scam Checker Nepal | Dealert",
  description: "Check if a Daraz seller page or Nepalese e-commerce URL is fake. 6-signal seller trust verification scoring WHOIS age, SSL validity, typosquatting, and community scam reports.",
  alternates: {
    canonical: "https://www.dealertnepal.com/fake-page-detector",
  },
  openGraph: {
    title: "Check If Daraz Page Is Fake — Seller Trust & Scam Checker Nepal | Dealert",
    description: "Check if a Daraz seller page or Nepalese e-commerce URL is fake. 6-signal seller trust verification scoring WHOIS age, SSL validity, typosquatting, and community scam reports.",
    url: "https://www.dealertnepal.com/fake-page-detector",
    siteName: "Dealert",
    images: [
      {
        url: "/dealert_logo.png",
        width: 1200,
        height: 630,
        alt: "Fake Seller & Trust Checker Nepal",
      },
    ],
    type: "website",
  },
}

export default function FakePageDetectorPage() {
  return <FakePageDetectorClient />
}
