"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Lock,
  Calendar,
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Search,
  ExternalLink,
  Flag,
  Info,
  AlertOctagon,
  Building2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import type { TrustCheckResult } from "@/types/trust";

function FakePageDetectorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const initialUrl = searchParams.get("url") || "";

  const [urlInput, setUrlInput] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrustCheckResult | null>(null);

  // Report modal / form state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const runDetection = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setShowReportForm(false);
    setReportSuccess(null);
    setReportError(null);

    try {
      const res = await fetch("/api/fake-page-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to perform trust check");
      }

      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialUrl) {
      setUrlInput(initialUrl);
      runDetection(initialUrl);
    }
  }, [initialUrl]);

  const handleDetect = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      router.replace(`/fake-page-detector?url=${encodeURIComponent(urlInput.trim())}`);
      runDetection(urlInput);
    }
  };

  const handleSampleClick = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
    router.replace(`/fake-page-detector?url=${encodeURIComponent(sampleUrl)}`);
    runDetection(sampleUrl);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !reportReason.trim()) return;

    setReportSubmitting(true);
    setReportSuccess(null);
    setReportError(null);

    try {
      const res = await fetch("/api/fake-page-check/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: result.url,
          reason: reportReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      setReportSuccess(data.message || "Report submitted successfully. Thank you!");
      setReportReason("");
    } catch (err: unknown) {
      setReportError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setReportSubmitting(false);
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "LOW":
        return "success";
      case "MEDIUM":
        return "warning";
      case "HIGH":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-hero">
        <div className="absolute inset-0 bg-grid opacity-[0.2]" aria-hidden />
        <div className="relative mx-auto max-w-[1200px] px-4 pt-14 pb-16 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3.5 py-1 font-mono-num text-[11px] uppercase tracking-wider text-muted-foreground glass backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            6-Signal Rule-Based Weighted Trust Engine
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Merchant Trust & <span className="gradient-text">Fake-Page Checker</span>
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground sm:text-lg">
            Verify online sellers in Nepal. Evaluates WHOIS domain age, SSL validity, verified seller match, typosquatting patterns, Google Safe Browsing, and community scam reports.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleDetect}
            className="mt-8 mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-border/60 bg-card/90 p-2 shadow-elevated glass-strong"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <Input
              type="text"
              placeholder="Paste seller URL or store domain e.g. https://daraz.com.np"
              className="h-11 border-0 bg-transparent text-sm sm:text-base shadow-none focus-visible:ring-0"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <Button
              type="submit"
              disabled={loading}
              className="shadow-glow font-semibold rounded-xl gap-2 h-11 px-6 shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSearch className="h-4 w-4" />
              )}
              <span>Check Trust</span>
            </Button>
          </form>

          {/* Preset Samples */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="font-mono-num uppercase tracking-wider text-muted-foreground">
              Try testing:
            </span>
            {[
              { label: "daraz.com.np", desc: "Verified Store" },
              { label: "darazzz.com.np", desc: "Typosquatting Check" },
              { label: "scam-deals-nepal.xyz", desc: "Suspicious TLD" },
            ].map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleSampleClick(sample.label)}
                className="rounded-full border border-border/60 bg-card/60 px-3 py-1 font-mono-num text-[11px] text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Error State */}
        {error && !loading && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-destructive animate-fade-in-up space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>Trust Check Failed</span>
            </div>
            <p className="text-xs leading-relaxed text-destructive/90">{error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-border/60 bg-card p-10 text-center shadow-card animate-pulse space-y-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Evaluating 6 Risk Signals...</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Scanning WHOIS registration, SSL certificates, typosquatting vectors, Safe Browsing databases, and community scam reports...
            </p>
          </div>
        )}

        {/* Results View */}
        {result && !loading && (
          <div className="space-y-8 animate-fade-in-up">
            <Card className="rounded-3xl border border-border/60 bg-card shadow-elevated overflow-hidden">
              {/* Context Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/30 px-6 py-4">
                <div className="flex items-center gap-2 min-w-0">
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-mono-num text-xs sm:text-sm text-foreground font-semibold truncate">
                    URL checked: <a href={result.url} target="_blank" rel="noreferrer" className="underline hover:text-primary">{result.url}</a>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">Domain: {result.domain}</span>
                  <Badge variant={getTierBadgeVariant(result.riskTier)} className="font-mono-num font-bold text-xs px-3 py-1 uppercase">
                    {result.riskTier} RISK TIER
                  </Badge>
                </div>
              </div>

              {/* Main Gauge & Overview Section */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-12 items-center">
                  {/* Score Gauge */}
                  <div className="md:col-span-5 bg-muted/20 border border-border/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                      Overall Trust Score
                    </span>
                    <div className="flex items-baseline gap-1 font-display">
                      <span className="text-5xl font-extrabold font-mono-num text-foreground">{result.overallScore}</span>
                      <span className="text-base text-muted-foreground font-mono">/ 100</span>
                    </div>

                    {/* Hard Override Badge */}
                    {result.overrideApplied && (
                      <div className="mt-2 pt-2 border-t border-border/60 w-full">
                        {result.overrideApplied === "VERIFIED_SELLER" && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/15 text-success border border-success/30 text-xs font-bold">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Verified seller match — overrides signal scores</span>
                          </div>
                        )}
                        {result.overrideApplied === "SAFE_BROWSING_FLAGGED" && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/15 text-destructive border border-destructive/30 text-xs font-bold">
                            <AlertOctagon className="h-3.5 w-3.5" />
                            <span>Flagged by Google Safe Browsing — forced High Risk</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary Box */}
                  <div className="md:col-span-7 space-y-3">
                    <h3 className="font-display text-base font-bold text-foreground">
                      Security Assessment Verdict
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.riskTier === "LOW" &&
                        "This domain displays strong trust parameters, valid encryption, and clean reputation records across all automated signal checks."}
                      {result.riskTier === "MEDIUM" &&
                        "Moderate risk detected. Some signals (such as recent domain registration or unverified registry status) warrant caution before placing large orders."}
                      {result.riskTier === "HIGH" &&
                        "High risk identified! Suspicious signals or threat blacklists indicate potential fraud, phishing, or typosquatting."}
                    </p>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary shrink-0" />
                      <span>Evaluated rule-based across 6 independent security signals with proportional weight redistribution.</span>
                    </div>
                  </div>
                </div>

                {/* Six Signals List Breakdown */}
                <div className="space-y-4 pt-4 border-t border-border/60">
                  <h4 className="font-display text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>Detailed 6-Signal Breakdown</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.signals.map((sig, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          !sig.available
                            ? "bg-muted/30 border-border/40 opacity-70"
                            : sig.score >= 70
                            ? "bg-card border-border hover:border-success/30"
                            : sig.score >= 40
                            ? "bg-card border-border hover:border-warning/30"
                            : "bg-card border-border hover:border-destructive/30"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {sig.available ? (
                              sig.score >= 70 ? (
                                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                              ) : sig.score >= 40 ? (
                                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive shrink-0" />
                              )
                            ) : (
                              <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-xs font-bold text-foreground">{sig.name}</span>
                          </div>

                          <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            Weight: {sig.weight}%
                          </span>
                        </div>

                        {/* Visual Weight/Score Progress Bar */}
                        <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all ${
                              !sig.available
                                ? "bg-muted-foreground/30"
                                : sig.score >= 70
                                ? "bg-success"
                                : sig.score >= 40
                                ? "bg-warning"
                                : "bg-destructive"
                            }`}
                            style={{ width: `${sig.available ? sig.score : 0}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-end gap-2 text-xs">
                          <span className="text-[11px] text-muted-foreground leading-snug">
                            {sig.detail || (sig.available ? "" : "Could not verify this signal")}
                          </span>
                          <span className="font-mono text-xs font-bold shrink-0">
                            {sig.available ? `${sig.score}/100` : "N/A"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report Section */}
                <div className="pt-6 border-t border-border/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-4 rounded-2xl border border-border">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Encountered an unflagged scam or fraudulent store?</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Report suspicious URLs to help protect the buyer community in Nepal.
                      </p>
                    </div>

                    {!showReportForm && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowReportForm(true)}
                        className="gap-1.5 font-semibold text-xs shrink-0"
                      >
                        <Flag className="h-3.5 w-3.5 text-destructive" />
                        <span>Report This Page</span>
                      </Button>
                    )}
                  </div>

                  {showReportForm && (
                    <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4 animate-fade-in-up">
                      <div className="flex justify-between items-center border-b border-border pb-2">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Flag className="h-4 w-4 text-destructive" />
                          <span>Submit Community Scam Report</span>
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setShowReportForm(false)} className="h-6 text-xs">
                          Cancel
                        </Button>
                      </div>

                      {!isAuthenticated ? (
                        <div className="p-4 rounded-xl bg-muted/40 text-center space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Authentication is required to submit community scam reports to prevent spam.
                          </p>
                          <Link href={`/login?redirect=${encodeURIComponent(`/fake-page-detector?url=${encodeURIComponent(result.url)}`)}`}>
                            <Button size="sm" variant="primary" className="font-bold text-xs">
                              Sign In to Submit Report
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <form onSubmit={handleReportSubmit} className="space-y-3">
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                              Reason for reporting this seller / URL:
                            </label>
                            <Input
                              type="text"
                              required
                              placeholder="e.g. Received fake goods, fake payment request, or non-delivery"
                              value={reportReason}
                              onChange={(e) => setReportReason(e.target.value)}
                              className="text-xs"
                            />
                          </div>

                          {reportError && (
                            <p className="text-xs text-destructive font-medium">{reportError}</p>
                          )}

                          {reportSuccess && (
                            <p className="text-xs text-success font-medium">{reportSuccess}</p>
                          )}

                          <Button
                            type="submit"
                            size="sm"
                            variant="destructive"
                            disabled={reportSubmitting || !reportReason.trim()}
                            className="font-bold text-xs gap-1.5"
                          >
                            {reportSubmitting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Flag className="h-3.5 w-3.5" />
                            )}
                            <span>Submit Scam Report</span>
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Methodology Pillar Section */}
        <div className="mt-16 space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono-num text-xs font-semibold uppercase tracking-wider text-primary">
              System Architecture
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
              Rule-Based Weighted Scoring Model
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Per SPTDAS Section 1.3, evaluation uses deterministic weighted risk rules with proportional failover redistribution.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: "1. Domain Age (WHOIS) — 20%",
                desc: "Measures domain registration duration. Newly registered domains (<30 days) receive lower trust scores.",
              },
              {
                icon: Lock,
                title: "2. SSL Certificate — 15%",
                desc: "Verifies TLS protocol encryption, issuer authority, and valid domain matching.",
              },
              {
                icon: UserCheck,
                title: "3. Verified Seller DB — 25%",
                desc: "Cross-checks against Dealert's registry of official Nepalese merchants.",
              },
              {
                icon: ShieldAlert,
                title: "4. URL Typosquatting — 15%",
                desc: "Computes Levenshtein edit distance against major store domains (e.g. Daraz) to catch lookalikes.",
              },
              {
                icon: Search,
                title: "5. Safe Browsing — 20%",
                desc: "Queries Google Safe Browsing API for malware, phishing, and unwanted software flags.",
              },
              {
                icon: Flag,
                title: "6. Community Reports — 5%",
                desc: "Aggregates distinct user scam reports over the last 90 days to penalize repeated offenders.",
              },
            ].map((item) => (
              <Card key={item.title} className="p-5 border border-border/60 space-y-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <item.icon className="h-4 w-4" />
                </div>
                <h3 className="font-display text-xs font-bold text-foreground">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function FakePageDetector() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Loading Fake-Page Detector...</div>}>
      <FakePageDetectorContent />
    </Suspense>
  );
}
