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
];

export function PricingClient() {
  const [items, setItems] = useState<number>(10);
  const estimatedSavings = Math.round(items * 1850);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-hero">
        <div className="absolute inset-0 bg-grid opacity-[0.2]" aria-hidden />
        <div className="relative mx-auto max-w-[1200px] px-4 pt-16 pb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground glass">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Simple, Transparent NPR Pricing
          </span>

          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Invest a little. <span className="gradient-text">Save thousands.</span>
          </h1>

          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
            Choose the plan that fits your shopping volume. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        <div className="grid gap-8 md:grid-cols-3 items-stretch">
          {plansMonthly.map((plan, i) => (
            <PricingCard key={i} plan={plan} />
          ))}
        </div>

        {/* ROI Calculator */}
        <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Estimated Savings Calculator</h2>
              <p className="text-xs text-muted-foreground">See how much you could save using Dealert price drop alerts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Tracked Purchases Per Month:</span>
              <span className="font-mono-num font-bold text-foreground text-sm">{items} items</span>
            </div>
            <Slider
              value={[items]}
              min={1}
              max={50}
              step={1}
              onValueChange={(val) => setItems(val[0])}
            />
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[11px] text-muted-foreground font-mono uppercase block">Estimated Monthly Savings</span>
              <span className="font-mono-num text-2xl font-extrabold text-success">
                Rs {estimatedSavings.toLocaleString()}
              </span>
            </div>
            <Link href="/register">
              <Button size="sm" variant="primary" className="font-bold text-xs">
                Start Saving Today
              </Button>
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-card space-y-6">
          <h2 className="font-display text-xl font-bold text-foreground">Detailed Plan Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 font-mono uppercase text-[10px] text-muted-foreground">
                  <th className="py-3 font-semibold">Feature</th>
                  <th className="py-3 px-4 font-semibold text-center">Free</th>
                  <th className="py-3 px-4 font-semibold text-center text-primary font-bold">Pro</th>
                  <th className="py-3 px-4 font-semibold text-center">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {compare.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-3 font-semibold text-foreground">{row.f}</td>
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                      {typeof row.free === "boolean" ? (row.free ? <Check className="h-4 w-4 mx-auto text-success" /> : <Minus className="h-4 w-4 mx-auto text-muted-foreground/40" />) : row.free}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-foreground bg-primary/5">
                      {typeof row.pro === "boolean" ? (row.pro ? <Check className="h-4 w-4 mx-auto text-success" /> : <Minus className="h-4 w-4 mx-auto text-muted-foreground/40" />) : row.pro}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                      {typeof row.biz === "boolean" ? (row.biz ? <Check className="h-4 w-4 mx-auto text-success" /> : <Minus className="h-4 w-4 mx-auto text-muted-foreground/40" />) : row.biz}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-6">
          <h2 className="font-display text-xl font-bold text-foreground text-center">Loved by Nepali Shoppers & Resellers</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-border/60 bg-card space-y-3 shadow-xs">
                <p className="text-xs text-muted-foreground leading-relaxed">"{t.text}"</p>
                <div>
                  <span className="text-xs font-bold text-foreground block">{t.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <h2 className="font-display text-xl font-bold text-foreground text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-border/60 bg-card space-y-1.5">
                <h3 className="font-display text-xs font-bold text-foreground">{faq.q}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
