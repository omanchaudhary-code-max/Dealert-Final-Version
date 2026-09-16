"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Database,
  FolderTree,
  LineChart,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Loader2,
  Clock,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CrawlStatus {
  latestRun: {
    started_at: string;
    status: string;
    total_products: number;
    total_errors: number;
  } | null;
  isStale: boolean;
}

export default function AdminOverviewPage() {
  const [crawlStatus, setCrawlStatus] = useState<CrawlStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/crawl-status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setCrawlStatus(data);
      })
      .catch((err) => console.error("Error loading crawl status:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="destructive" className="text-[10px] px-2 py-0.5 uppercase font-bold">
              <ShieldCheck className="h-3 w-3 mr-1" /> Admin Control
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">SPTDAS Module</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">Admin Dashboard Overview</h1>
          <p className="text-xs text-muted-foreground">
            System administration portal for crawler log monitoring, product price testing, and affiliate tracking status.
          </p>
        </div>
      </div>

      {/* Crawler Status Quick Card */}
      {loading ? (
        <div className="p-6 bg-card border rounded-xl text-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground mt-2">Checking crawler health...</p>
        </div>
      ) : crawlStatus ? (
        <Card
          className={`p-5 border transition-all ${
            crawlStatus.isStale
              ? "bg-destructive/10 border-destructive/30"
              : "bg-emerald-500/10 border-emerald-500/30"
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              {crawlStatus.isStale ? (
                <div className="h-10 w-10 rounded-full bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
              <div>
                <div className="text-sm font-bold">
                  {crawlStatus.isStale ? (
                    <span className="text-destructive font-extrabold">Crawler Alert: Run Stale</span>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                      Crawler Status: Healthy
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {crawlStatus.latestRun
                    ? `Last run started at ${new Date(crawlStatus.latestRun.started_at).toLocaleString()} (${crawlStatus.latestRun.total_products} products processed).`
                    : "No crawl runs logged in MongoDB."}
                </div>
              </div>
            </div>

            <Link href="/admin/crawler">
              <Button size="sm" variant={crawlStatus.isStale ? "destructive" : "outline"} className="text-xs gap-1.5">
                <span>View Crawler Logs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      ) : null}

      {/* Main Scope Grid: 3 Modules per Final Report Scope */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Crawler Monitoring */}
        <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-all border border-border">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">1. Crawler Monitoring</h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Inspect raw execution logs (`crawl_logs`) and error exception logs (`errors`) written by the Python crawler worker.
              </p>
            </div>

            <div className="pt-2 text-[11px] font-mono text-muted-foreground space-y-1">
              <div className="flex items-center justify-between border-b border-border/40 pb-1">
                <span>Stale Threshold:</span>
                <span className="text-foreground font-semibold">&gt; 36 hours</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-1">
                <span>Data Source:</span>
                <span className="text-foreground font-semibold">MongoDB Atlas</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/admin/crawler" className="w-full block">
              <Button variant="outline" size="sm" className="w-full text-xs justify-between">
                <span>Monitor Crawler Logs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Module 2: Product Management & Demo Alert Pipeline */}
        <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-all border border-border">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">2. Product & Demo Tools</h2>
                <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                  Demo Tool
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Add products manually and simulate live price drops to test the wishlist alert pipeline without waiting for real crawl cycles.
              </p>
            </div>

            <div className="pt-2 text-[11px] font-mono text-muted-foreground space-y-1">
              <div className="flex items-center justify-between border-b border-border/40 pb-1">
                <span>Price History Tag:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">source: "manual_demo"</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-1">
                <span>Alert Pipeline:</span>
                <span className="text-foreground font-semibold">Real DRY Pipeline</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/admin/products" className="w-full block">
              <Button variant="outline" size="sm" className="w-full text-xs justify-between">
                <span>Manage & Simulate</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Module 3: Affiliate Earnings Stub */}
        <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-all border border-border">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <LineChart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">3. Affiliate Earnings</h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Affiliate revenue tracking status per Daraz Affiliate Program application guidelines.
              </p>
            </div>

            <div className="pt-2 text-[11px] font-mono text-muted-foreground space-y-1">
              <div className="flex items-center justify-between border-b border-border/40 pb-1">
                <span>Approval Status:</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Pending Approval</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-1">
                <span>Mock Data Policy:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Strictly Zero Mock</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/admin/affiliate" className="w-full block">
              <Button variant="outline" size="sm" className="w-full text-xs justify-between">
                <span>View Status</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}