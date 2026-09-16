"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Sparkles, Calculator, ChevronDown } from "lucide-react";
import { PricingCard, type PricingPlan } from "@/components/dealert/pricing-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const plansMonthly: PricingPlan[] = [
  {
    name: "Free",
    tagline: "For casual shoppers",
    price: "Rs 0",
    period: "/forever",
    features: [
      "5 wishlist slots",
      "30-day price history",
      "3 fake checks per day",
      "Summary price index",
      "Email alerts (daily)",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    tagline: "For power shoppers & resellers",
    price: "Rs 299",
    period: "/month",
    features: [
      "Unlimited wishlist",
      "Full price history",
      "Unlimited fake checks",
      "Real-time alerts",
      "CSV exports",
      "Premium analytics",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Business",
    tagline: "For affiliates & journalists",
    price: "Rs 1,499",
    period: "/month",
    features: [
      "Everything in Pro",
      "Raw data API",
      "White-label widgets",
      "Webhook integrations",
      "Dedicated success manager",
    ],
    cta: "Contact sales",
  },
];

const compare = [
  { f: "Wishlist slots", free: "5", pro: "Unlimited", biz: "Unlimited" },
  { f: "Price history depth", free: "30 days", pro: "Full history", biz: "Full history" },
  { f: "Fake seller checks", free: "3 / day", pro: "Unlimited", biz: "Unlimited" },
  { f: "Real-time alerts", free: false, pro: true, biz: true },
  { f: "Premium analytics", free: false, pro: true, biz: true },
  { f: "CSV / Parquet exports", free: false, pro: true, biz: true },
  { f: "Raw API access", free: false, pro: false, biz: true },
  { f: "Webhooks", free: false, pro: false, biz: true },
  { f: "Dedicated manager", free: false, pro: false, biz: true },
];

const testimonials = [
  {
    name: "Asmita K.",
    role: "Reseller, Kathmandu",
    text: "Dealert paid for itself in 3 days. I caught an AirPods drop instantly and resold 8 units.",
  },
  {
    name: "Bibek S.",
    role: "Software engineer",
    text: "Finally a Nepali tool that doesn't feel like a college project. Charts are TradingView-grade.",
  },
  {
    name: "Priya M.",
    role: "Journalist",
    text: "We use the Business plan for our weekly e-commerce inflation column. Data is rock solid.",
  },
];

const faqs = [
  {
    q: "Do you accept eSewa & Khalti?",
    a: "Yes — Pro and Business are billed in NPR via eSewa, Khalti and major cards. No hidden FX fees.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your dashboard in one click. You keep access until the end of the billing period.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Your wishlist stays. We trim history older than 30 days back to the Free tier window. Nothing is deleted.",
  },
  { q: "Is there a student discount?", a: "Yes — 50% off Pro with a valid .edu.np email." },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [items, setItems] = useState([6]);
  const [drop, setDrop] = useState([18]);
  const monthly = items[0] * 850 * (drop[0] / 100) * 4;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-hero">
        <div className="absolute inset-0 bg-grid opacity-[0.18]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 font-mono-num text-[11px] uppercase tracking-wider text-muted-foreground glass">
            <Sparkles className="h-3 w-3 text-primary" /> Transparent NPR pricing
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold tracking-tight sm:text-6xl">
            Save more. <span className="gradient-text">Shop smarter.</span>
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
            Start free forever. Upgrade when you need unlimited alerts, raw data, or advanced
            analytics.
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border/60 bg-card p-1">
            {(["Monthly", "Yearly · 2 months free"] as const).map((label, i) => {
              const active = (i === 1) === yearly;
              return (
                <button
                  key={label}
                  onClick={() => setYearly(i === 1)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    active
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {plansMonthly.map((p) => {
            const yearlyP =
              p.price === "Rs 0"
                ? p
                : {
                    ...p,
                    price: `Rs ${(parseInt(p.price.replace(/\D/g, "")) * 10).toLocaleString()}`,
                    period: "/year",
                  };
            return <PricingCard key={p.name} plan={yearly ? yearlyP : p} />;
          })}
        </div>

        {/* Savings calculator */}
        <div className="mt-16 grid gap-6 rounded-3xl border border-border/60 bg-card p-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-mono-num text-[11px] uppercase tracking-wider text-primary font-semibold">
              <Calculator className="h-3 w-3" /> Savings calculator
            </span>
            <h3 className="mt-3 font-display text-3xl font-bold tracking-tight">
              How much can you save?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Based on Dealert users tracking similar baskets across Daraz Nepal.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Items you track per month</span>
                  <span className="font-mono-num font-semibold">{items[0]}</span>
                </div>
                <Slider
                  value={items}
                  onValueChange={setItems}
                  min={1}
                  max={30}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Avg discount captured</span>
                  <span className="font-mono-num font-semibold">{drop[0]}%</span>
                </div>
                <Slider
                  value={drop}
                  onValueChange={setDrop}
                  min={5}
                  max={60}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-2xl bg-gradient-primary p-8 text-primary-foreground shadow-glow">
            <p className="font-mono-num text-xs uppercase tracking-wider opacity-80">
              Estimated monthly savings
            </p>
            <p className="mt-2 font-display text-6xl font-bold tracking-tight">
              Rs {Math.round(monthly).toLocaleString()}
            </p>
            <p className="mt-2 text-sm opacity-90">
              Average Dealert Pro user saves{" "}
              <strong>Rs {Math.round(monthly * 12).toLocaleString()}/year</strong> — 18× the Pro
              subscription.
            </p>
            <Link href="/register?tier=pro" className="mt-6 self-start">
              <Button variant="secondary" size="lg" className="font-semibold cursor-pointer">
                Start saving today
              </Button>
            </Link>
          </div>
        </div>

        {/* Compare table */}
        <div className="mt-16">
          <h2 className="font-display text-3xl font-bold tracking-tight">Compare plans</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="p-4 font-mono-num text-[11px] uppercase tracking-wider text-muted-foreground">
                    Feature
                  </th>
                  <th className="p-4 font-display font-semibold">Free</th>
                  <th className="p-4 font-display font-semibold text-primary">Pro</th>
                  <th className="p-4 font-display font-semibold">Business</th>
                </tr>
              </thead>
              <tbody>
                {compare.map((row) => (
                  <tr key={row.f} className="border-t border-border/60">
                    <td className="p-4 text-foreground/90">{row.f}</td>
                    <Cell v={row.free} />
                    <Cell v={row.pro} highlight />
                    <Cell v={row.biz} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-16">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Trusted by smart shoppers
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-border/60 bg-card p-6">
                <blockquote className="text-sm leading-relaxed text-foreground/90">
                  "{t.text}"
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground">
                    {t.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 mx-auto max-w-3xl">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-border/60 bg-card p-5 [&_summary]:cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 font-display text-base font-semibold">
                  {f.q}
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 text-muted-foreground" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Cell({ v, highlight }: { v: boolean | string; highlight?: boolean }) {
  return (
    <td className={cn("p-4", highlight && "bg-primary/5")}>
      {typeof v === "boolean" ? (
        v ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground" />
        )
      ) : (
        <span className="font-mono-num text-sm">{v}</span>
      )}
    </td>
  );
}
