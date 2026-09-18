"use client";

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useInfiniteProducts, useCategories, useProductDetails, Product } from "@/hooks/useProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowDownRight,
  Bell,
  Heart,
  Sparkles,
  Flame,
  TrendingDown,
  Clock,
  Tag,
  Filter,
  CheckCircle2,
  ExternalLink,
  Search,
  ShieldCheck,
  Shuffle,
  X,
  Loader2,
  SlidersHorizontal,
  ArrowUpDown,
  RefreshCw,
  LineChart,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dealert/stat-card";
import { PriceHistoryChart } from "@/components/dealert/price-history-chart";

type SortMode = "default" | "discount" | "price-low" | "price-high" | "lastCrawledAt";

const DISCOUNT_THRESHOLDS = [
  { label: "All Discounts", min: 0 },
  { label: "10%+ OFF", min: 10 },
  { label: "25%+ OFF", min: 25 },
  { label: "40%+ OFF", min: 40 },
];

function DealsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedMinDiscount, setSelectedMinDiscount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [randomSeed, setRandomSeed] = useState<number>(0);

  // Sync searchQuery from URL parameter if present (?search=...)
  useEffect(() => {
    const param = searchParams.get("search") || searchParams.get("q");
    if (param) {
      setSearchQuery(param);
      setDebouncedSearch(param);
    }
  }, [searchParams]);

  // Price history modal state
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);

  const { wishlistItems, toggleWishlist, isWishlisted } = useWishlist();
  const { isAuthenticated } = useAuth();

  // Fetch categories strictly from database
  const { data: dbCategories = [] } = useCategories();
  const categoryOptions = useMemo(() => ["All", ...dbCategories], [dbCategories]);

  // Debounce search query input by 300ms for backend API search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Infinite Scroll hook from backend API
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteProducts({
    search: debouncedSearch,
    category: selectedCategory,
    minDiscount: selectedMinDiscount,
    sortBy: sortMode === "default" && selectedCategory === "All" && !debouncedSearch ? "random" : sortMode,
  });

  // Flatten paginated products from infinite query
  const rawProducts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.products || []);
  }, [data]);

  // Client-side sort fallback if needed
  const displayProducts = useMemo(() => {
    let list = [...rawProducts];
    if (sortMode === "discount") {
      list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    } else if (sortMode === "price-low") {
      list.sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (sortMode === "price-high") {
      list.sort((a, b) => b.currentPrice - a.currentPrice);
    }
    return list;
  }, [rawProducts, sortMode]);

  // Intersection Observer for Infinite Scroll trigger
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Shuffle feed handler
  const handleShuffleFeed = () => {
    setRandomSeed((prev) => prev + 1);
    refetch();
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-hero">
        <div className="absolute inset-0 bg-grid opacity-[0.2]" aria-hidden />
        <div className="relative mx-auto max-w-[1600px] px-4 pt-14 pb-16 sm:px-6 lg:px-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3.5 py-1 font-mono-num text-[11px] uppercase tracking-wider text-muted-foreground glass backdrop-blur">
            <Flame className="h-3.5 w-3.5 text-primary animate-pulse" />
            Live Daraz Nepal Market Intelligence Feed
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Live Verified Deals & <span className="gradient-text">Price Drop Feed</span>
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground sm:text-lg">
            Real-time price history tracking for Daraz e-commerce in Nepal. Filter genuine discounts, track all-time lows, and set up instant price alerts.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 max-w-3xl mx-auto sm:grid-cols-4 text-center text-xs">
            <div className="p-3 rounded-2xl bg-card/70 border border-border/60 backdrop-blur">
              <span className="font-mono text-[10px] uppercase text-muted-foreground block">Active Tracked Items</span>
              <span className="font-mono-num font-bold text-foreground text-sm">142,500+</span>
            </div>
            <div className="p-3 rounded-2xl bg-card/70 border border-border/60 backdrop-blur">
              <span className="font-mono text-[10px] uppercase text-muted-foreground block">Avg Verified Savings</span>
              <span className="font-mono-num font-bold text-success text-sm">18.4%</span>
            </div>
            <div className="p-3 rounded-2xl bg-card/70 border border-border/60 backdrop-blur">
              <span className="font-mono text-[10px] uppercase text-muted-foreground block">Scrape Frequency</span>
              <span className="font-mono-num font-bold text-foreground text-sm">Continuous</span>
            </div>
            <div className="p-3 rounded-2xl bg-card/70 border border-border/60 backdrop-blur">
              <span className="font-mono text-[10px] uppercase text-muted-foreground block">Target Price Alerts</span>
              <span className="font-mono-num font-bold text-primary text-sm">Instant Email</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Deals Container */}
      <section className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10 space-y-8">
        {/* Search & Filter Control Bar */}
        <div className="rounded-3xl border border-border/60 bg-card p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input Box */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products by title, category, or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-background/80 pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort & Shuffle Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/60 text-xs">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground ml-2" />
                <span className="font-mono text-[11px] text-muted-foreground hidden sm:inline">Sort:</span>
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="bg-transparent border-0 text-xs font-semibold text-foreground pr-2 outline-none cursor-pointer"
                >
                  <option value="default" className="bg-card text-foreground">Featured (Default)</option>
                  <option value="discount" className="bg-card text-foreground">Highest % Discount</option>
                  <option value="price-low" className="bg-card text-foreground">Price: Low to High</option>
                  <option value="price-high" className="bg-card text-foreground">Price: High to Low</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShuffleFeed}
                disabled={isRefetching}
                className="rounded-2xl text-xs gap-1.5 font-semibold shrink-0 cursor-pointer"
              >
                <Shuffle className={cn("h-3.5 w-3.5 text-primary", isRefetching && "animate-spin")} />
                <span>Reshuffle Feed</span>
              </Button>
            </div>
          </div>

          {/* Discount Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
            <span className="font-mono text-[11px] uppercase text-muted-foreground mr-1">Minimum Savings:</span>
            {DISCOUNT_THRESHOLDS.map((thresh) => (
              <button
                key={thresh.min}
                type="button"
                onClick={() => setSelectedMinDiscount(thresh.min)}
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[11px] transition-all cursor-pointer border",
                  selectedMinDiscount === thresh.min
                    ? "bg-primary text-primary-foreground font-bold border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:border-primary/40"
                )}
              >
                {thresh.label}
              </button>
            ))}
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all cursor-pointer border",
                  selectedCategory === cat
                    ? "bg-foreground text-background font-bold border-foreground"
                    : "bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Live Deals Grid */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-72 rounded-3xl bg-card border border-border/60 animate-pulse p-4 space-y-3">
                  <div className="aspect-video w-full rounded-2xl bg-muted/60" />
                  <div className="h-4 w-3/4 rounded bg-muted/60" />
                  <div className="h-4 w-1/2 rounded bg-muted/60" />
                </div>
              ))}
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="rounded-3xl border border-border/60 bg-card p-12 text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-muted/40 text-muted-foreground">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">No matching deals found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try loosening your category filter, lowering the minimum discount threshold, or clearing your search term.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedMinDiscount(0);
                  setSearchQuery("");
                }}
                className="mt-2 text-xs font-semibold"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.map((product, index) => {
                const wish = isWishlisted(product.id);
                return (
                  <div
                    key={`${product.id}-${index}`}
                    className="group rounded-2xl border border-border/60 bg-card p-4 shadow-card hover:shadow-elevated hover:border-primary/40 transition-all flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Image & Discount Badge Overlay */}
                    <div>
                      <div className="aspect-video relative overflow-hidden rounded-xl bg-muted/40">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Sale Tag */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="inline-flex items-center gap-1 bg-destructive text-destructive-foreground font-mono-num text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            <ArrowDownRight className="h-3 w-3" />
                            {product.discountPercentage}% OFF
                          </span>
                        </div>

                        {/* Wishlist Quick Trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!isAuthenticated) {
                              router.push(`/login?redirect=${encodeURIComponent("/deals")}`);
                              return;
                            }
                            toggleWishlist(product.id);
                          }}
                          className={cn(
                            "absolute top-2.5 right-2.5 z-10 grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-card/80 backdrop-blur transition-all hover:scale-110 cursor-pointer shadow-xs",
                            wish ? "text-primary border-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                          )}
                          title={wish ? "In Wishlist" : "Add to Wishlist"}
                        >
                          <Heart className={cn("h-3.5 w-3.5", wish && "fill-current text-primary")} />
                        </button>
                      </div>

                      {/* Content Section */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                          <span className="truncate max-w-[140px]">{product.category || "General"}</span>
                          <span className="truncate max-w-[110px] text-right font-medium text-foreground/80">
                            {product.sellerName || "Daraz Store"}
                          </span>
                        </div>

                        <Link
                          href={`/products/${product.itemId || product.id}`}
                          className="font-display text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors block"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </div>

                    {/* Price & Action Footer */}
                    <div className="mt-4 pt-3 border-t border-border/40 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="font-mono-num text-lg font-extrabold text-foreground">
                            {formatCurrency(product.currentPrice)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.currentPrice && (
                            <span className="ml-2 font-mono-num text-xs text-muted-foreground line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedProductForHistory(product)}
                          className="rounded-xl text-[11px] font-semibold gap-1.5 cursor-pointer h-9 px-2"
                        >
                          <LineChart className="h-3.5 w-3.5 text-primary" />
                          <span>History</span>
                        </Button>

                        <a
                          href={product.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button
                            size="sm"
                            variant="primary"
                            className="w-full rounded-xl text-[11px] font-semibold gap-1 cursor-pointer h-9 px-2"
                          >
                            <span>Store</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Intersection Observer Target for Infinite Scroll */}
        <div ref={observerTarget} className="py-8 text-center">
          {isFetchingNextPage && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-card px-4 py-2 rounded-full border border-border/60 shadow-xs animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Loading more live Daraz deals...
            </div>
          )}
          {!hasNextPage && displayProducts.length > 0 && (
            <p className="text-xs text-muted-foreground font-mono">
              ✓ You've reached the end of the current deal feed.
            </p>
          )}
        </div>
      </section>

      {/* Price History Modal */}
      {selectedProductForHistory && (
        <PriceHistoryModal
          product={selectedProductForHistory}
          onClose={() => setSelectedProductForHistory(null)}
        />
      )}
    </div>
  );
}

// Sub-component: Price History Modal
function PriceHistoryModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { data: details, isLoading } = useProductDetails(product.id);
  const historyData = useMemo(() => {
    return (details?.priceHistory || []).map((ph: any) => ({
      date: ph.recordedAt ? new Date(ph.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ph.date || 'Date',
      price: ph.price,
    }));
  }, [details?.priceHistory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/60 bg-card p-4 sm:p-6 shadow-elevated space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <LineChart className="h-5 w-5 text-primary shrink-0" />
            <h3 className="font-display text-sm sm:text-base font-bold text-foreground truncate">
              Price History: {product.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-xs text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading price analytics...
          </div>
        ) : (
          <div className="space-y-4">
            <PriceHistoryChart data={historyData} height={240} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-muted/30 border border-border/40">
                <span className="text-[10px] text-muted-foreground font-mono uppercase block">Current Price</span>
                <span className="font-mono-num font-bold text-foreground">{formatCurrency(product.currentPrice)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/30 border border-border/40">
                <span className="text-[10px] text-muted-foreground font-mono uppercase block">Lowest Recorded</span>
                <span className="font-mono-num font-bold text-success">
                  {(details as any)?.analytics?.minPrice ? formatCurrency((details as any).analytics.minPrice) : formatCurrency(product.currentPrice)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/30 border border-border/40">
                <span className="text-[10px] text-muted-foreground font-mono uppercase block">Highest Recorded</span>
                <span className="font-mono-num font-bold text-muted-foreground">
                  {(details as any)?.analytics?.maxPrice ? formatCurrency((details as any).analytics.maxPrice) : formatCurrency(product.originalPrice || product.currentPrice)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pt-2 border-t border-border/40">
          <span className="text-[11px] text-muted-foreground font-mono">
            Scraped from Daraz Nepal product listing
          </span>
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button size="sm" className="w-full sm:w-auto rounded-xl font-semibold text-xs px-4 min-h-[40px] shadow-glow cursor-pointer gap-1.5">
              View on Store <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

export function DealsClient() {
  return (
    <Suspense fallback={<div className="min-h-screen p-12 text-center text-muted-foreground flex items-center justify-center">Loading deals...</div>}>
      <DealsPageContent />
    </Suspense>
  );
}
