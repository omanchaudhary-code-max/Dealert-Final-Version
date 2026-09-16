"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Flame,
  BarChart3,
  Lock,
  Download,
  Database,
  FileSpreadsheet,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
} from "lucide-react";
import { StatCard } from "@/components/dealert/stat-card";
import { IndexChart } from "@/components/dealert/index-chart";
import { PriceSparkline } from "@/components/dealert/price-sparkline";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface CategoryItem {
  category: string;
  avgPrice: number;
  productCount: number;
  pctChangeVsLastMonth: number | null;
}

interface PriceIndexResponse {
  month: string;
  methodologyVersion: string;
  computedAt: string;
  topMovers: CategoryItem[];
  categories: CategoryItem[];
}

interface CategorySnapshotDoc {
  month: string;
  categories?: CategoryItem[];
}

export default function PriceIndexPage() {
  const { user } = useAuth();
  const isPro = user?.role === "pro" || user?.role === "admin";
  const [snapshot, setSnapshot] = useState<PriceIndexResponse | null>(null);
  const [historySnapshots, setHistorySnapshots] = useState<CategorySnapshotDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonthSnapshot = (monthStr: string) => {
    setLoading(true);
    fetch(`/api/price-index?month=${monthStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.month) {
          setSnapshot(data);
        }
      })
      .catch((err) => console.warn("Failed to fetch price index snapshot:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/price-index").then((res) => res.json()),
      fetch("/api/price-index?history=true").then((res) => res.json()),
    ])
      .then(([latestData, historyData]) => {
        if (latestData && latestData.month) {
          setSnapshot(latestData);
        }
        if (historyData && Array.isArray(historyData.snapshots)) {
          setHistorySnapshots(historyData.snapshots);
        }
      })
      .catch((err) => console.warn("Failed to fetch price index data:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = snapshot?.categories || [];
  const topMovers = snapshot?.topMovers || [];
  const monthLabel = snapshot?.month || "2026-07";
  const versionLabel = snapshot?.methodologyVersion || "v1";

  const availableMonths = historySnapshots.map((s) => s.month);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-hero">
        <div className="absolute inset-0 bg-grid opacity-[0.18]" aria-hidden />
        <div className="relative mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 font-mono-num text-[11px] uppercase tracking-wider text-muted-foreground glass">
                <Activity className="h-3.5 w-3.5 text-primary" /> Stored Monthly Snapshot ({monthLabel}) · NPR
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Nepal E-Commerce <span className="gradient-text">Price Index</span>
              </h1>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                Persisted monthly inflation & price trends across Daraz categories — weighted by version-controlled methodology ({versionLabel}).
              </p>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-elevated min-w-[260px]">
              <p className="font-mono-num text-[11px] uppercase tracking-wider text-muted-foreground">
                Persisted Index ({monthLabel})
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display font-mono-num text-5xl font-bold tracking-tight">100.0</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 font-mono-num text-xs font-semibold text-success">
                  Methodology {versionLabel}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <Stat label="Month" value={monthLabel} />
                <Stat label="Version" value={versionLabel} tone="success" />
                <Stat label="Categories" value={String(categories.length)} />
                <Stat label="Status" value="Persisted" tone="success" />
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Tracked categories" value={String(categories.length || 0)} hint="≥5 products threshold" icon={BarChart3} />
            <StatCard label="Snapshot Month" value={monthLabel} hint="Immutable historical record" icon={Flame} />
            <StatCard label="Top Mover" value={topMovers[0]?.category || "N/A"} hint={topMovers[0]?.pctChangeVsLastMonth !== null && topMovers[0]?.pctChangeVsLastMonth !== undefined ? `${topMovers[0]?.pctChangeVsLastMonth}% MoM` : "MoM tracked"} icon={TrendingUp} />
            <StatCard label="Methodology" value={`Version ${versionLabel}`} hint="Section 4.2.1 compliant" icon={TrendingDown} />
          </div>
        </div>
      </section>

      {/* Main chart + Top Movers Table */}
      <section className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-border/60 bg-card p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Category Index — Monthly Time Series
                </h2>
                <p className="text-sm text-muted-foreground">Stored monthly snapshots from MongoDB price_index_snapshots</p>
              </div>
              {availableMonths.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 p-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground px-2">
                    Month:
                  </span>
                  {availableMonths.map((m) => {
                    const isSelected = m === monthLabel;
                    return (
                      <button
                        key={m}
                        onClick={() => fetchMonthSnapshot(m)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 font-mono-num text-xs font-bold cursor-pointer transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : "text-muted-foreground hover:text-foreground hover:bg-card"
                        )}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-6">
              <IndexChart onSelectMonth={fetchMonthSnapshot} />
            </div>
          </div>

          {/* Top Movers Table */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Top Movers ({monthLabel})</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono-num text-[11px] font-medium text-primary">
                  MoM Ranking
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Highest absolute Month-over-Month change</p>

              <div className="mt-5 space-y-3">
                {topMovers.length > 0 ? (
                  topMovers.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{item.category}</p>
                        <p className="font-mono-num text-xs text-muted-foreground">
                          Rs. {item.avgPrice.toLocaleString()} ({item.productCount} items)
                        </p>
                      </div>
                      <MoMBadge value={item.pctChangeVsLastMonth} />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No MoM data available yet</p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-muted/20 p-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <span>Snapshot stored under methodology version {versionLabel}</span>
            </div>
          </div>
        </div>

        {/* Category breakdown table */}
        <div className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Persisted Category Indices ({monthLabel})</h2>
              <p className="text-sm text-muted-foreground">Categories filtered by MIN_PRODUCTS_PER_CATEGORY (≥ 5 products)</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div
                key={c.category}
                className="group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-elevated"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-base font-semibold">{c.category}</p>
                  <span className="rounded-full bg-muted/50 px-2 py-0.5 font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
                    {c.productCount} products
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-display font-mono-num text-2xl font-bold tracking-tight">
                    Rs. {c.avgPrice.toLocaleString()}
                  </span>
                  <MoMBadge value={c.pctChangeVsLastMonth} />
                </div>
                <div className="mt-4">
                  <CategorySparkline history={historySnapshots} categoryName={c.category} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro vs Free Tier Export Distinction (Figure 4.7) */}
        <div className="mt-12 relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 shadow-elevated">
          <div
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 font-mono-num text-[11px] uppercase tracking-wider text-primary font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Dealert Data Access
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
                Export Persisted Monthly Snapshots
              </h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Pro tier users can download full raw CSV export datasets of persisted monthly snapshots across all recorded months.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  { icon: FileSpreadsheet, label: "CSV Index Snapshot Export" },
                  { icon: Database, label: "Version-controlled methodology data" },
                  { icon: Download, label: "Month-over-Month change analysis" },
                  { icon: BarChart3, label: "Full category breakdown" },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm shadow-xs"
                  >
                    {!isPro && <Lock className="h-3.5 w-3.5 text-amber-500" />}
                    <f.icon className="h-4 w-4 text-primary" />
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {isPro ? (
                <Button
                  size="lg"
                  onClick={() => {
                    window.location.href = "/api/price-index/export";
                  }}
                  className="shadow-glow font-semibold rounded-2xl flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Index CSV (Pro)</span>
                </Button>
              ) : (
                <div className="flex flex-col items-center sm:items-end gap-2">
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      className="font-semibold rounded-2xl flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Upgrade to Pro to Export</span>
                    </Button>
                  </Link>
                  <Link href="/pricing" className="text-xs font-semibold text-amber-500 hover:underline flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Upgrade to Pro to unlock CSV export
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Methodology Version Note */}
        <div className="mt-12 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground font-mono">
          Methodology v1 · Version-controlled monthly index snapshot calculated per Section 4.2.1 (NFR-Maintainability).
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div>
      <p className="font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-mono-num text-sm font-semibold",
          tone === "success" ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function MoMBadge({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 font-mono-num text-xs font-medium text-muted-foreground">
        <Minus className="h-3 w-3" /> N/A (1st Month)
      </span>
    );
  }

  const isPositive = value > 0;
  const isZero = value === 0;

  if (isZero) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 font-mono-num text-xs font-medium text-muted-foreground">
        0.0% MoM
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono-num text-xs font-semibold",
        isPositive ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
      )}
    >
      {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {isPositive ? `+${value}%` : `${value}%`} MoM
    </span>
  );
}

function CategorySparkline({
  history,
  categoryName,
}: {
  history: CategorySnapshotDoc[];
  categoryName: string;
}) {
  const prices = (history || [])
    .map((s) => {
      const target = categoryName.toLowerCase().trim();
      const found = s.categories?.find(
        (c) => c.category.toLowerCase().trim() === target
      );
      return found ? found.avgPrice : null;
    })
    .filter((val): val is number => val !== null);

  if (prices.length < 2) {
    return (
      <div className="h-12 w-full flex items-center justify-center text-[11px] text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/40 font-mono">
        Not enough history yet ({prices.length} month)
      </div>
    );
  }

  return <PriceSparkline data={prices} className="h-12" />;
}
