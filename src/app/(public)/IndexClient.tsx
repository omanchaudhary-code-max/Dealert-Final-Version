"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import heroImage from "@/assets/hero-dashboard.jpg";
import {
  ArrowRight,
  Bell,
  BellRing,
  CircleDollarSign,
  Globe2,
  History,
  LineChart,
  Plug,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Users,
  Zap,
  Laptop,
  Smartphone,
  Tv,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dealert/stat-card";
import { FeatureCard } from "@/components/dealert/feature-card";
import { PriceCard } from "@/components/dealert/price-card";
import { RiskMeter } from "@/components/dealert/risk-meter";
import { PricingCard, type PricingPlan } from "@/components/dealert/pricing-card";
import { PriceHistoryChart } from "@/components/dealert/price-history-chart";
import { IndexChart } from "@/components/dealert/index-chart";
import { useProducts } from "@/hooks/useProducts";
import { CATEGORIES } from "@/lib/constants";

const features = [
  {
    icon: LineChart,
    title: "Historical price intelligence",
    description:
      "See every price change across months — spot real discounts, ignore fake ones, and know when to buy.",
  },
  {
    icon: BellRing,
    title: "Instant deal alerts",
    description:
      "Get notified the moment a product hits your target price, an all-time low, or drops more than 10%.",
  },
  {
    icon: ShieldCheck,
    title: "Fake seller detector",
    description:
      "Scan suspicious online sellers, Facebook pages and websites with a 100-point trust analysis.",
  },
  {
    icon: Globe2,
    title: "Nepal price index",
    description:
      "Bloomberg-grade dashboard tracking inflation, deal density, and category trends across the country.",
  },
  {
    icon: Zap,
    title: "Smart buy/wait engine",
    description:
      "AI-powered recommendations based on seasonality, volatility, and confidence-scored predictions.",
  },
  {
    icon: Plug,
    title: "Browser & mobile ready",
    description:
      "PWA-ready experience optimized for Nepal's networks. Extension and mobile app coming soon.",
  },
];

const steps = [
  {
    num: "01",
    title: "Paste a product link",
    description: "Drop any Daraz Nepal URL — we start tracking instantly.",
  },
  {
    num: "02",
    title: "Set your target price",
    description: "Or let our smart engine recommend the best moment to buy.",
  },
  {
    num: "03",
    title: "Get alerted, save money",
    description: "Real-time push, email, and in-app alerts when the price drops.",
  },
];

const plans: PricingPlan[] = [
  {
    name: "Free",
    tagline: "For casual shoppers exploring Nepal's deals",
    price: "Rs 0",
    period: "/forever",
    features: [
      "Track up to 5 products",
      "30-day price history",
      "3 fake seller checks daily",
      "Daily summary digest",
      "Public price index",
    ],
    cta: "Start tracking free",
  },
  {
    name: "Pro",
    tagline: "For power shoppers and resellers",
    price: "Rs 299",
    period: "/month",
    features: [
      "Unlimited wishlists & alerts",
      "Full historical pricing",
      "Unlimited fake seller checks",
      "Premium real-time alerts",
      "CSV & API export",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Business",
    tagline: "For affiliates, journalists and analysts",
    price: "Rs 1,499",
    period: "/month",
    features: [
      "Everything in Pro",
      "Bulk product import",
      "White-label price widgets",
      "Advanced analytics dashboard",
      "Webhook integrations",
      "Dedicated account manager",
    ],
    cta: "Contact sales",
  },
];

const faqs = [
  {
    q: "Which stores does Dealert track?",
    a: "We currently support Daraz Nepal with full historical tracking, and are expanding to SastoDeal, HamroBazar, and major Nepali e-commerce stores in 2026.",
  },
  {
    q: "How is the trust score calculated?",
    a: "We combine 12+ signals — domain age, SSL, Google Safe Browsing, typosquatting checks, community reports, redirect chains, and seller verification — into a single 0–100 risk score.",
  },
  {
    q: "Will I get spammed with alerts?",
    a: "Never. You control thresholds (target price, % drop, all-time low) and frequency (instant, daily digest, weekly). You can pause any alert in one tap.",
  },
  {
    q: "Do you support payments in NPR?",
    a: "Yes — Pro and Business plans are billed in Nepali Rupees with eSewa, Khalti, and major card support.",
  },
];

const sampleHistory = Array.from({ length: 30 }).map((_, i) => ({
  date: `Day ${i + 1}`,
  price: 42999 - Math.sin(i / 4) * 1800 - i * 120 + (i > 22 ? 1500 : 0),
}));

export function IndexClient() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/deals?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const { data: fetchedProducts, isLoading } = useProducts(
    { sortBy: "random", minDiscount: 1, limit: 6 },
    { refetchOnMount: "always", staleTime: 0 }
  );

  const trendingProducts = fetchedProducts || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border/60 bg-gradient-hero">
          <div className="absolute inset-0 bg-grid opacity-[0.25] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" aria-hidden />
          <div className="relative mx-auto max-w-[1600px] px-4 pt-20 pb-24 sm:px-6 lg:px-10 lg:pt-28 lg:pb-32">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
              <div className="animate-fade-in-up">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  Live in Kathmandu — tracking 142,000+ products
                </span>

                <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                  Stop overpaying in Nepal.{" "}
                  <span className="gradient-text">Verify prices before you buy.</span>
                </h1>

                <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  Historical price intelligence, real-time deal alerts, and seller trust verification for Daraz e-commerce shoppers across Nepal.
                </p>

                {/* SEARCH FORM */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="mt-8 flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl border border-border/80 bg-card/90 shadow-elevated backdrop-blur"
                >
                  <div className="flex items-center gap-3 px-3 w-full sm:w-auto flex-1">
                    <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      placeholder="Paste Daraz product link or search keywords..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto font-semibold gap-2 shadow-glow rounded-xl px-6">
                    <span>Track Price</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground/80">Trending searches:</span>
                  {["MacBook Air M3", "iPhone 15 Pro Max", "Samsung Galaxy A55", "Sony WH-1000XM5"].map((term) => (
                    <Link
                      key={term}
                      href={`/deals?search=${encodeURIComponent(term)}`}
                      className="hover:text-primary transition-colors underline underline-offset-4"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </div>

              {/* HERO VISUAL PREVIEW */}
              <div className="relative animate-fade-in-up [animation-delay:200ms]">
                <div className="absolute -right-4 -top-6 hidden w-64 rounded-2xl glass-strong p-4 shadow-elevated sm:block z-20 border border-success/30">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-success">
                    <ShieldCheck className="h-4 w-4" /> Verified seller
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">Trust score 92/100</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[92%] bg-gradient-success" />
                  </div>
                </div>

                <div className="absolute -left-4 -bottom-6 hidden w-72 rounded-2xl glass-strong p-4 shadow-elevated sm:block animate-fade-in-up z-20 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-success">
                      <TrendingDown className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">AirPods Pro hit all-time low</p>
                      <p className="font-mono-num text-xs text-success">−27% · Rs 31,499</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/30 to-chart-2/30 blur-xl opacity-50" />
                <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-elevated backdrop-blur">
                  <img
                    src={typeof heroImage === "string" ? heroImage : heroImage.src}
                    alt="Live price tracking dashboard with historical charts and product alerts"
                    width={1600}
                    height={1024}
                    className="h-full w-full object-cover rounded-3xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS */}
        <section className="border-b border-border/60 bg-muted/20 py-12">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <StatCard label="Products Tracked" value="142,500+" trend="+1.2k this week" icon={CircleDollarSign} />
              <StatCard label="Price Checks Daily" value="38,400" trend="Real-time scraping" icon={History} />
              <StatCard label="Verified Savings" value="NPR 4.2M+" trend="In user purchases" icon={TrendingDown} />
              <StatCard label="Seller Risk Checks" value="12,800+" trend="100-point trust score" icon={ShieldCheck} />
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">Core Platform Capabilities</span>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                Everything you need to shop smart in Nepal
              </h2>
              <p className="text-sm text-muted-foreground">
                Built specifically for Nepal's e-commerce landscape to eliminate fake discounts, unverified sellers, and bad deals.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <FeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
              ))}
            </div>
          </div>
        </section>

        {/* LIVE TRENDING DEALS PREVIEW */}
        <section className="py-20 border-t border-border/60 bg-muted/10">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">Verified Deals</span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Trending Price Drops on Daraz Nepal</h2>
              </div>
              <Link href="/deals">
                <Button variant="outline" className="gap-2 font-semibold text-xs">
                  <span>Browse All Live Deals</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-64 rounded-2xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingProducts.slice(0, 6).map((product) => (
                  <PriceCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 border-t border-border/60 bg-background">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">Simple 3-Step Process</span>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">How Dealert protects your wallet</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
                <div key={i} className="relative rounded-3xl border border-border/60 bg-card p-8 shadow-card space-y-4">
                  <span className="font-mono text-4xl font-extrabold text-primary/30">{s.num}</span>
                  <h3 className="font-display text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING PREVIEW */}
        <section className="py-20 border-t border-border/60 bg-muted/10">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">Transparent Subscription</span>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Choose your intelligence level</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3 items-stretch">
              {plans.map((p, i) => (
                <PricingCard key={i} plan={p} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 border-t border-border/60 bg-background">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">Frequently Asked Questions</span>
              <h2 className="font-display text-3xl font-bold tracking-tight">Got questions? We've got answers.</h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-border/60 bg-card space-y-2">
                  <h3 className="font-display text-base font-bold text-foreground">{faq.q}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
