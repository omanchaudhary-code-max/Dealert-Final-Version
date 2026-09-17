import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/providers/LenisProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { ToastContainer } from "@/components/ui/toast-container";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.dealertnepal.com";
const title = "Dealert - Nepal's Price Tracker & Deal Alert Platform";
const description =
  "Track prices, monitor drops, configure instant email and trigger alerts for items on Daraz e-commerce platforms in Nepal.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: "/dealert.ico",
    shortcut: "/dealert.ico",
    apple: "/dealert_logo.png",
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Dealert",
    images: [
      {
        url: "/dealert_logo.png",
        width: 1200,
        height: 630,
        alt: "Dealert - Nepal's Price Tracker & Deal Alert Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/dealert_logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors">
        <QueryProvider>
          <LenisProvider>
            {children}
            <ToastContainer />
          </LenisProvider>
        </QueryProvider>
      </body>
    </html>
  );
}