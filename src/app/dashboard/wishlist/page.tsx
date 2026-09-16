"use client";

import { useState } from "react";
import Link from "next/link";
import { useWishlist, WishlistFormattedItem } from "@/hooks/useWishlist";
import { formatCurrency } from "@/lib/format";
import {
  Heart,
  Trash2,
  ExternalLink,
  Sparkles,
  Flame,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Loader2,
  Edit2,
  Check,
  X,
  Search,
  Plus,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WishlistDashboardPage() {
  const {
    wishlistProducts,
    slotUsage,
    isLoading,
    updateWishlist,
    removeFromWishlist,
  } = useWishlist();

  // Inline target price edit state: { [itemId]: string }
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [targetInput, setTargetInput] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string>("");

  // Embedded Fake-Page Checker state
  const [checkUrl, setCheckUrl] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    domain?: string;
    riskTier?: "LOW" | "MEDIUM" | "HIGH";
    overallScore?: number;
    summary?: string;
  } | null>(null);
  const [checkError, setCheckError] = useState("");

  const usedSlots = slotUsage?.used ?? wishlistProducts.length;
  const isPro = slotUsage?.plan === "PRO";
  const slotLimit = isPro ? null : 5;

  // Target price update handler
  const handleSaveTargetPrice = async (item: WishlistFormattedItem) => {
    setUpdateError("");
    setUpdatingId(item.id);

    try {
      const priceNum = targetInput.trim() === "" ? null : parseFloat(targetInput);
      if (priceNum !== null && (isNaN(priceNum) || priceNum <= 0)) {
        throw new Error("Target price must be a positive number");
      }

      await updateWishlist({ id: item.id, targetPrice: priceNum });
      setEditingTargetId(null);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to update target price");
    } finally {
      setUpdatingId(null);
    }
  };

  // Alert mode toggle handler
  const handleToggleAlertMode = async (item: WishlistFormattedItem, newMode: string) => {
    setUpdatingId(item.id);
    try {
      await updateWishlist({ id: item.id, alertMode: newMode });
    } catch (err) {
      console.error("Alert mode update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Fake-page check submit handler
  const handleFakePageCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkUrl.trim()) return;
    setCheckError("");
    setCheckResult(null);
    setCheckLoading(true);

    try {
      const res = await fetch("/api/fake-page-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: checkUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to check store trust");
      }

      let summaryText = "Domain verified with clean security signals.";
      if (data.overrideApplied === "VERIFIED_SELLER") {
        summaryText = "Low risk — official verified seller database match.";
      } else if (data.overrideApplied === "SAFE_BROWSING_FLAGGED") {
        summaryText = "High risk — flagged by Google Safe Browsing threat lists.";
      } else if (data.riskTier === "HIGH") {
        summaryText = "High risk — multiple suspicious signals or typosquatting patterns detected.";
      } else if (data.riskTier === "MEDIUM") {
        summaryText = "Medium risk — proceed with caution, check seller details.";
      } else {
        const topSignals = (data.signals || []).filter((s: any) => s.available && s.score >= 70).map((s: any) => s.name);
        if (topSignals.length > 0) {
          summaryText = `Low risk — ${topSignals.slice(0, 2).join(" & ").toLowerCase()} verified.`;
        }
      }

      setCheckResult({
        domain: data.domain || checkUrl,
        riskTier: data.riskTier || "LOW",
        overallScore: data.overallScore ?? 85,
        summary: summaryText,
      });
    } catch (err) {
      setCheckError(err instanceof Error ? err.message : "Trust check failed");
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-foreground pb-12">
      {/* 1. Header Bar with Slot Usage Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary/20" />
            <span>My Wishlist</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor real-time prices against saved snapshots, set target alert thresholds, and verify seller legitimacy.
          </p>
        </div>

        {/* Slot Usage Banner per Section 4.6.2 */}
        <div className="flex items-center gap-2">
          {isPro ? (
            <Badge variant="success" className="text-xs px-3.5 py-1.5 font-bold shadow-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              <span>My Wishlist ({usedSlots} items — Pro Tier)</span>
            </Badge>
          ) : (
            <div className="flex items-center gap-2">
              <Badge
                variant={usedSlots >= 5 ? "destructive" : "secondary"}
                className="text-xs px-3 py-1.5 font-bold shadow-xs border"
              >
                <span>My Wishlist ({usedSlots} / 5 slots used — Free Tier)</span>
              </Badge>
              <Link href="/pricing">
                <Button size="sm" variant="primary" className="h-7 text-xs px-2.5 font-bold gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Upgrade to Pro</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Update Error Toast Alert */}
      {updateError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center justify-between">
          <span>{updateError}</span>
          <button onClick={() => setUpdateError("")} className="hover:opacity-75">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. Wishlist Items Section */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <Card key={idx} className="h-28 bg-muted/50 animate-pulse border-border" />
          ))}
        </div>
      ) : wishlistProducts.length === 0 ? (
        /* 3. Empty State per Wireframe */
        <Card className="p-12 text-center space-y-4 border border-border shadow-xs">
          <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            <Heart className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold">Your wishlist is empty</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Explore deals across electronics, gadgets, and appliances. Save products to track price drops and receive instant alerts.
            </p>
          </div>
          <Link href="/deals" className="inline-block pt-2">
            <Button variant="primary" size="sm" className="gap-2 font-bold px-5">
              <Search className="h-4 w-4" />
              <span>Browse Hot Deals</span>
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {wishlistProducts.map((item) => {
            const isEditingTarget = editingTargetId === item.id;
            const isUpdating = updatingId === item.id;

            return (
              <Card
                key={item.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-border hover:border-primary/40 transition-all shadow-xs"
              >
                {/* Left Column: Product Image & Info */}
                <div className="flex items-start space-x-4 min-w-0 flex-1">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-muted/60 shrink-0 border border-border relative">
                    <img
                      src={item.productImage || "/placeholder.png"}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                        {item.sellerName || "Daraz Store"}
                      </span>

                      {/* Cosmetic Badges per Figure 4.5 */}
                      {item.targetHit && (
                        <Badge variant="destructive" className="text-[9px] py-0 px-1.5 font-extrabold flex items-center gap-1">
                          <Flame className="h-3 w-3 fill-current" />
                          <span>Target Hit</span>
                        </Badge>
                      )}

                      {item.allTimeLowHit && (
                        <Badge variant="success" className="text-[9px] py-0 px-1.5 font-extrabold flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          <span>All-Time Low</span>
                        </Badge>
                      )}
                    </div>

                    <a
                      href={item.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5 group"
                    >
                      <span>{item.productName}</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </a>

                    {/* Price Comparison Display */}
                    <div className="flex items-baseline gap-3 flex-wrap pt-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-muted-foreground">Current Live:</span>
                        <span className="text-sm font-extrabold text-foreground font-mono">
                          {formatCurrency(item.currentPrice)}
                        </span>
                      </div>

                      <div className="text-[11px] text-muted-foreground border-l border-border pl-3 font-mono">
                        Wishlisted at: <span className="font-semibold text-foreground">{formatCurrency(item.wishlistedPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Column: Target Price & Alert Mode Config */}
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 bg-muted/40 p-3 rounded-lg border border-border/60 shrink-0">
                  {/* Inline Target Price Editor */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Target Price (NPR)
                    </label>

                    {isEditingTarget ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          placeholder="e.g. 140000"
                          value={targetInput}
                          onChange={(e) => setTargetInput(e.target.value)}
                          className="h-7 w-28 text-xs font-mono"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSaveTargetPrice(item)}
                          disabled={isUpdating}
                          className="h-7 px-2"
                          title="Save target price"
                        >
                          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTargetId(null)}
                          className="h-7 px-2"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-foreground">
                          {item.targetPrice ? formatCurrency(item.targetPrice) : "Not set"}
                        </span>
                        <button
                          onClick={() => {
                            setEditingTargetId(item.id);
                            setTargetInput(item.targetPrice ? String(item.targetPrice) : "");
                          }}
                          className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded"
                          title="Edit Target Price"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Alert Mode Selector per Figure 4.5 */}
                  <div className="space-y-1 sm:border-l border-border sm:pl-3 md:border-l-0 md:pl-0 lg:border-l lg:pl-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Alert Trigger
                    </label>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant={item.alertMode === "immediate" ? "primary" : "outline"}
                        className="h-6 text-[10px] px-2 py-0"
                        onClick={() => handleToggleAlertMode(item, "immediate")}
                        disabled={isUpdating}
                      >
                        Immediate
                      </Button>
                      <Button
                        size="sm"
                        variant={item.alertMode === "all_time_low" ? "primary" : "outline"}
                        className="h-6 text-[10px] px-2 py-0"
                        onClick={() => handleToggleAlertMode(item, "all_time_low")}
                        disabled={isUpdating}
                      >
                        On All-Time Low
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => removeFromWishlist(item.id)}
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. Embedded Fake-Page Checker Widget per Figure 4.5 */}
      <Card className="p-6 border border-border shadow-xs space-y-4 bg-card/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Merchant Trust & Fake-Page Checker</h3>
              <p className="text-[11px] text-muted-foreground">
                Surfaced directly on your wishlist dashboard for instant store safety verification before buying.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Security Utility
          </Badge>
        </div>

        <form onSubmit={handleFakePageCheck} className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="url"
              required
              placeholder="Paste seller URL or store domain (e.g., https://daraz.com.np/shop/...)"
              value={checkUrl}
              onChange={(e) => setCheckUrl(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <Button type="submit" variant="primary" size="sm" disabled={checkLoading} className="h-9 gap-1.5 px-4 font-bold shrink-0">
            {checkLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Shield className="h-4 w-4" />
                <span>Check Safety</span>
              </>
            )}
          </Button>
        </form>

        {checkError && (
          <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{checkError}</span>
          </div>
        )}

        {checkResult && (
          <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-start justify-between gap-4 flex-col sm:flex-row animate-in fade-in-50">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs font-mono text-foreground">{checkResult.domain}</span>
                <Badge
                  variant={
                    checkResult.riskTier === "LOW"
                      ? "success"
                      : checkResult.riskTier === "MEDIUM"
                      ? "warning"
                      : "destructive"
                  }
                  className="text-[9px] px-1.5 py-0 font-bold uppercase"
                >
                  {checkResult.riskTier} RISK TIER
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{checkResult.summary}</p>
              <div className="pt-1">
                <Link
                  href={`/fake-page-detector?url=${encodeURIComponent(checkUrl.trim())}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span>See full breakdown</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="text-right font-mono shrink-0">
              <div className="text-[10px] text-muted-foreground">Trust Score</div>
              <div className="text-base font-extrabold text-foreground">{checkResult.overallScore} / 100</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
