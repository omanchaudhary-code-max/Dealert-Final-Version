"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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

export default function IndexPage() {
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
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  Live in Kathmandu — tracking 142,000+ products
                </span>
                <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[72px]">
                  Track real prices.
                  <br />
                  Avoid <span className="gradient-text">fake discounts</span>.
                  <br />
                  Shop smarter in Nepal.
                </h1>
                <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                  Dealert is Nepal's first smart price intelligence platform. Historical pricing,
                  fake seller detection, and real-time alerts — built for Daraz Nepal and beyond.
                </p>

                <form
                  onSubmit={handleSearchSubmit}
                  className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-2xl border border-border/60 bg-card/80 p-1.5 shadow-card backdrop-blur"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center text-muted-foreground">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Paste a Daraz link or search a product…"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    aria-label="Search products"
                  />
                  <Button type="submit" size="sm" className="shadow-glow font-semibold gap-1">
                    Track price <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
                <p className="mt-3 text-xs text-muted-foreground">
                  Try:{" "}
                  <button
                    onClick={() => router.push("/deals?search=AirPods")}
                    className="text-foreground/80 hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    AirPods Pro
                  </button>{" "}
                  ·{" "}
                  <button
                    onClick={() => router.push("/deals?search=Galaxy")}
                    className="text-foreground/80 hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Galaxy S24
                  </button>{" "}
                  ·{" "}
                  <button
                    onClick={() => router.push("/deals?search=Keyboard")}
                    className="text-foreground/80 hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Keyboard
                  </button>
                </p>

                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Products tracked", value: "142K+" },
                    { label: "Avg. savings", value: "Rs 4,820" },
                    { label: "Alerts sent", value: "1.2M" },
                    { label: "Fake pages flagged", value: "8,400" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="font-display font-mono-num text-2xl font-bold tracking-tight text-foreground">
                        {s.value}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Terminal Showcase */}
              <div className="relative">
                <div
                  className="absolute -inset-8 rounded-[40px] bg-gradient-primary opacity-20 blur-3xl"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-elevated">
                  <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <LineChart className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display text-sm font-semibold">Live Price Intelligence Dashboard</h4>
                        <p className="text-xs text-muted-foreground">Kathmandu Real-Time Crawlers</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-success/10 px-2.5 py-1 font-mono-num text-xs font-semibold text-success">
                      ● Active
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    <PriceHistoryChart data={sampleHistory} />
                  </div>
                </div>

                {/* Floating alert card */}
                <div className="absolute -left-4 -bottom-6 hidden w-72 rounded-2xl glass-strong p-4 shadow-elevated sm:block animate-fade-in-up">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-success">
                      <TrendingDown className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">AirPods Pro hit all-time low</p>
                      <p className="font-mono-num text-xs text-success">−27% · Rs 31,499</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 top-8 hidden w-64 rounded-2xl glass-strong p-4 shadow-elevated sm:block">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-success">
                    <ShieldCheck className="h-4 w-4" /> Verified seller
                  </div>
                  <p className="mt-1 text-sm font-medium">Trust score 92/100</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[92%] bg-gradient-success" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-t border-border/60 py-24">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <SectionHeading
              eyebrow="How it works"
              title="From link to savings in three steps"
              description="The fastest way to stop overpaying on Daraz Nepal."
            />
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-card hover:border-primary/40 transition-colors"
                >
                  <span className="font-mono-num text-sm font-semibold text-primary">
                    {step.num}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRENDING DEALS */}
        <section className="border-t border-border/60 py-24">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Trending right now"
                title="Today's biggest real drops"
                description="Verified against 90-day price history — no inflated fake discounts."
                align="left"
              />
              <Link href="/deals">
                <Button variant="outline" size="sm" className="rounded-xl font-semibold gap-1">
                  View all deals <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[360px] rounded-2xl bg-muted/20 animate-pulse border border-border/60"
                  />
                ))
              ) : trendingProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted-foreground text-sm border border-dashed rounded-2xl">
                  No products tracked yet. Use the search bar above to start.
                </div>
              ) : (
                trendingProducts.slice(0, 6).map((p) => <PriceCard key={p.id} product={p} />)
              )}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="border-t border-border/60 bg-card/30 py-24">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <SectionHeading
              eyebrow="Why Dealert"
              title="Built like a financial terminal. Designed for shoppers."
              description="Six pillars that turn impulse buys into informed decisions."
            />
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* PRICE INTELLIGENCE PREVIEW */}
        <section className="border-t border-border/60 py-24">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <SectionHeading
              eyebrow="Price intelligence"
              title="Every product gets a full intelligence dossier"
              description="Average, lowest, highest, predicted — with a verdict you can act on."
            />
            <div className="mt-14 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Daraz Mall · Apple
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                      AirPods Pro (2nd Gen) USB-C
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {["30D", "90D", "6M", "1Y", "ALL"].map((r, i) => (
                      <button
                        key={r}
                        className={
                          i === 1
                            ? "rounded-md bg-primary px-2.5 py-1 font-mono-num text-[11px] font-semibold text-primary-foreground"
                            : "rounded-md border border-border/60 px-2.5 py-1 font-mono-num text-[11px] font-semibold text-muted-foreground hover:bg-accent"
                        }
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Current", value: "Rs 31,499", tone: "text-foreground" },
                    { label: "Average", value: "Rs 38,200", tone: "text-foreground" },
                    { label: "All-time low", value: "Rs 31,499", tone: "text-success" },
                    { label: "All-time high", value: "Rs 45,500", tone: "text-destructive" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl bg-muted/40 p-3">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {m.label}
                      </div>
                      <div className={`mt-1 font-mono-num text-base font-bold ${m.tone}`}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <PriceHistoryChart data={sampleHistory} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-success/40 bg-gradient-to-br from-success/10 to-transparent p-6 shadow-card">
                  <div className="flex items-center gap-2 text-success">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Smart verdict
                    </span>
                  </div>
                  <p className="mt-3 font-display text-2xl font-bold tracking-tight">Buy now</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Currently at all-time low. 87% confidence price will rise within 14 days.
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs">
                    <div className="flex-1 rounded-lg bg-card p-3 border border-border/40">
                      <div className="text-muted-foreground">Confidence</div>
                      <div className="mt-0.5 font-mono-num text-base font-bold text-foreground">
                        87%
                      </div>
                    </div>
                    <div className="flex-1 rounded-lg bg-card p-3 border border-border/40">
                      <div className="text-muted-foreground">Volatility</div>
                      <div className="mt-0.5 font-mono-num text-base font-bold text-foreground">
                        Low
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
                  <div className="flex items-center gap-2 text-primary">
                    <Bell className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Set alert
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Get notified instantly when this drops below your target price.
                  </p>
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/60 bg-background p-2">
                    <span className="font-mono-num text-sm text-muted-foreground pl-1">Rs</span>
                    <input
                      type="text"
                      defaultValue="29,500"
                      className="min-w-0 flex-1 bg-transparent font-mono-num text-sm outline-none"
                      aria-label="Target price"
                    />
                    <Button size="sm" className="rounded-xl font-semibold">Notify me</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAKE SELLER + PRICE INDEX */}
        <section className="border-t border-border/60 bg-card/30 py-24">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <SectionHeading
                  eyebrow="Fake seller detector"
                  title="Scan any seller. Get a 100-point risk score in seconds."
                  description="Cross-checks SSL, domain age, Google Safe Browsing, typosquatting, redirect chains, and community reports."
                  align="left"
                />
                <div className="mt-8 flex items-center gap-2 rounded-2xl border border-border/60 bg-card p-1.5 shadow-card">
                  <div className="grid h-10 w-10 shrink-0 place-items-center text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Paste a website, Facebook or Instagram page URL"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    aria-label="Paste URL to scan"
                  />
                  <Button size="sm" className="rounded-xl font-semibold">Scan now</Button>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { l: "SSL", v: "Valid", ok: true },
                    { l: "Domain age", v: "3 months", ok: false },
                    { l: "Typosquat", v: "Detected", ok: false },
                    { l: "Safe Browsing", v: "Clean", ok: true },
                    { l: "Redirects", v: "2 hops", ok: false },
                    { l: "Reports", v: "12", ok: false },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl border border-border/60 bg-card p-3 shadow-xs">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {s.l}
                      </div>
                      <div
                        className={`mt-0.5 font-mono-num text-sm font-semibold ${s.ok ? "text-success" : "text-warning"}`}
                      >
                        {s.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <RiskMeter score={72} />
                <div className="rounded-2xl border border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent p-5">
                  <p className="text-sm font-semibold text-destructive">⚠ Warning</p>
                  <p className="mt-1 text-sm text-foreground/90 leading-relaxed">
                    This seller mimics a known brand domain and has multiple unresolved community
                    reports. Avoid placing orders or sharing payment information.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <SectionHeading
                  eyebrow="Nepal price index"
                  title="Nepal's first consumer price index for e-commerce"
                  description="Track inflation, deal density, and category trends — like a Bloomberg terminal for shoppers."
                  align="left"
                />
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <StatCard
                    icon={LineChart}
                    label="Index level"
                    value="98.4"
                    hint="Down 1.6% YoY"
                  />
                  <StatCard icon={TrendingDown} label="Avg discount" value="22%" hint="+3 pp MoM" />
                  <StatCard
                    icon={CircleDollarSign}
                    label="Median deal"
                    value="Rs 4.8k"
                    hint="Across 142k SKUs"
                  />
                  <StatCard icon={Users} label="Active trackers" value="38k" hint="Last 30 days" />
                </div>
              </div>
              <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Category index — 12 month
                  </p>
                  <p className="font-mono-num text-xs text-muted-foreground">Base 100 · Jan 2025</p>
                </div>
                <IndexChart />
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="border-t border-border/60 py-24">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <SectionHeading
              eyebrow="Pricing"
              title="Simple plans. Real savings."
              description="Start free. Upgrade when you want full historical pricing and unlimited alerts."
            />
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <PricingCard key={plan.name} plan={plan} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/60 bg-card/30 py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
            <SectionHeading
              eyebrow="FAQ"
              title="Questions, answered"
              description="If you don't see your question here, our team replies within hours."
            />
            <div className="mt-12 space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-border/60 bg-card p-5 transition-colors open:border-primary/40 shadow-xs"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-foreground select-none">
                    {f.q}
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border/60 text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="border-t border-border/60 py-24">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-10 text-center sm:p-16 shadow-elevated">
              <div
                className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
                aria-hidden
              />
              <div className="relative">
                <History className="mx-auto h-10 w-10 text-primary" />
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
                  Stop overpaying. Start tracking.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                  Join 38,000+ Nepali shoppers using Dealert to spot real discounts and dodge fake
                  ones — every single day.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link href="/auth/register">
                    <Button size="lg" className="shadow-glow font-semibold gap-2 rounded-2xl">
                      Start free <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/deals">
                    <Button size="lg" variant="outline" className="font-semibold rounded-2xl">
                      View live deals
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="font-mono-num text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base text-muted-foreground">{description}</p>}
    </div>
  );
}
