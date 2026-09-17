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

export const metadata: Metadata = {
  title: "Dealert - Nepal's Price Tracker & Deal Alert Platform",
  description: "Track prices, monitor drops, configure instant email and trigger alerts for items on Daraz e-commerce platforms in Nepal.",
   icons: {
    icon: '/dealert.ico',
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
