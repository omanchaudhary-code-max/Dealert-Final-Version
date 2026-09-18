"use client";

import { useEffect, useState } from "react";
import {
  FolderTree,
  Search,
  Plus,
  TrendingDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface Product {
  id: string;
  itemId: string;
  name: string;
  currentPrice: number;
  originalPrice: number;
  discountPercentage: number;
  imageUrl: string;
  productUrl: string;
  category: string;
  sellerName?: string;
  lastCrawledAt?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Add Product Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    url: "",
    category: "Laptops",
    seller_name: "Daraz Official",
    current_price: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Simulate Price Modal state
  const [simulateProduct, setSimulateProduct] = useState<Product | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<{
    message: string;
    alertsSent: Array<{ userEmail: string; triggerType: string; productName: string }>;
  } | null>(null);
  const [simError, setSimError] = useState("");

  const fetchProducts = async (searchQuery = "") => {
    setLoading(true);
    try {
      const url = searchQuery
        ? `/api/admin/products?search=${encodeURIComponent(searchQuery)}`
        : `/api/admin/products`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(search);
  };

  // Add Product submit handler
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: addForm.title,
          url: addForm.url,
          category: addForm.category,
          seller_name: addForm.seller_name,
          current_price: parseFloat(addForm.current_price),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      setIsAddOpen(false);
      setAddForm({
        title: "",
        url: "",
        category: "Laptops",
        seller_name: "Daraz Official",
        current_price: "",
      });
      fetchProducts(search);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Error creating product");
    } finally {
      setAddLoading(false);
    }
  };

  // Simulate Price Drop submit handler
  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulateProduct) return;
    setSimError("");
    setSimResult(null);
    setSimLoading(true);

    try {
      const priceNum = parseFloat(newPrice);
      const targetItemId = simulateProduct.itemId || simulateProduct.id;

      const res = await fetch(`/api/admin/products/${encodeURIComponent(targetItemId)}/simulate-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPrice: priceNum }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Price simulation failed");
      }

      setSimResult({
        message: data.message,
        alertsSent: data.alertResult?.alertsSent || [],
      });
      fetchProducts(search);
    } catch (err) {
      setSimError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-foreground pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-primary" />
            <span>Product Management & Live Demo Tools</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manually add tracked products or simulate price changes live to test the wishlist alert pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchProducts(search)} className="h-9 font-bold" aria-label="Refresh products list">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)} className="h-9 gap-1.5 font-bold shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 border border-border shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products by title, category, or seller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
              aria-label="Search products input"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 text-xs px-4 font-bold">
            Search
          </Button>
        </form>
      </Card>

      {/* Products Table & Card Container */}
      <Card className="p-5 border border-border shadow-xs space-y-4">
        {/* Mobile Cards (< 768px) */}
        <div className="block md:hidden space-y-3">
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No products found matching query.</div>
          ) : (
            products.map((p) => (
              <div key={p.id || p.itemId} className="p-4 bg-muted/40 rounded-lg border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-foreground line-clamp-1">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">ID: {p.itemId || p.id}</div>
                  </div>
                  <Badge variant="outline" className="text-[9px] capitalize shrink-0">
                    {p.category}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <span className="text-muted-foreground">{p.sellerName || "Daraz"}</span>
                  <span className="font-bold font-mono text-foreground">NPR {p.currentPrice?.toLocaleString() ?? 0}</span>
                </div>

                <div className="pt-2 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1 hover:bg-primary/10 border-primary/30 text-primary font-bold h-8"
                    onClick={() => {
                      setSimulateProduct(p);
                      setNewPrice(String(p.currentPrice));
                      setSimResult(null);
                      setSimError("");
                    }}
                  >
                    <TrendingDown className="h-3.5 w-3.5 text-primary" />
                    <span>Simulate Price Drop</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto border border-border rounded-lg">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-bold">Product Details</TableHead>
                <TableHead className="text-xs font-bold">Category</TableHead>
                <TableHead className="text-xs font-bold">Seller</TableHead>
                <TableHead className="text-xs font-bold text-right">Current Price (NPR)</TableHead>
                <TableHead className="text-xs font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">Loading products...</p>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-xs text-muted-foreground">
                    No products found matching search query.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id || p.itemId} className="text-xs hover:bg-muted/30 transition-colors">
                    <TableCell className="max-w-[300px]">
                      <div className="font-bold text-foreground truncate">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">
                        ID: {p.itemId || p.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize font-medium">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.sellerName || "Daraz"}</TableCell>
                    <TableCell className="text-right font-mono font-extrabold text-foreground">
                      NPR {p.currentPrice?.toLocaleString() ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] gap-1 hover:bg-primary/10 border-primary/30 text-primary font-bold"
                          onClick={() => {
                            setSimulateProduct(p);
                            setNewPrice(String(p.currentPrice));
                            setSimResult(null);
                            setSimError("");
                          }}
                        >
                          <TrendingDown className="h-3 w-3 text-primary" />
                          <span>Simulate Price Drop</span>
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                            Demo Tool
                          </Badge>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* MODAL 1: Add Product */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
                <Plus className="h-4 w-4 text-primary" />
                <span>Add Tracked Product</span>
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Manually insert a product for Dealert price tracking. Generates initial price history tagged <code className="text-foreground bg-muted px-1 rounded font-mono">source: "manual_demo"</code>.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 py-2">
              {addError && (
                <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Product Title</label>
                <Input
                  required
                  type="text"
                  placeholder="e.g. Apple MacBook Air M3 (8GB / 256GB)"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  className="text-xs h-9"
                  aria-label="Product Title"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Category</label>
                  <Input
                    required
                    type="text"
                    placeholder="e.g. Laptops"
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="text-xs h-9"
                    aria-label="Category"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Initial Price (NPR)</label>
                  <Input
                    required
                    type="number"
                    placeholder="e.g. 145000"
                    value={addForm.current_price}
                    onChange={(e) => setAddForm({ ...addForm, current_price: e.target.value })}
                    className="text-xs h-9 font-mono"
                    aria-label="Initial Price in NPR"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Seller Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Oliz Store"
                    value={addForm.seller_name}
                    onChange={(e) => setAddForm({ ...addForm, seller_name: e.target.value })}
                    className="text-xs h-9"
                    aria-label="Seller Name"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Product URL</label>
                  <Input
                    type="url"
                    placeholder="https://www.daraz.com.np/products/..."
                    value={addForm.url}
                    onChange={(e) => setAddForm({ ...addForm, url: e.target.value })}
                    className="text-xs h-9"
                    aria-label="Product URL"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={addLoading} className="font-bold">
                  {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Simulate Price Drop */}
      {simulateProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
                <FlaskConical className="h-4 w-4 text-amber-500" />
                <span>Simulate Price Drop</span>
                <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold">
                  Demo Tool
                </Badge>
              </h2>
              <button
                onClick={() => setSimulateProduct(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Manually trigger a price drop on <span className="font-semibold text-foreground">{simulateProduct.name}</span> to test live wishlist email alerts.
            </p>

            <form onSubmit={handleSimulateSubmit} className="space-y-4 py-2">
              {simError && (
                <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{simError}</span>
                </div>
              )}

              {simResult && (
                <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{simResult.message}</span>
                  </div>

                  {simResult.alertsSent.length > 0 && (
                    <div className="text-[11px] space-y-1 pt-1 border-t border-emerald-500/20">
                      <div className="font-medium text-muted-foreground">Triggered Notifications:</div>
                      {simResult.alertsSent.map((a, idx) => (
                        <div key={idx} className="flex items-center justify-between font-mono bg-background/50 px-2 py-1 rounded">
                          <span>Alert sent to {a.userEmail}</span>
                          <Badge variant="outline" className="text-[9px] uppercase font-bold">
                            {a.triggerType}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-muted/50 p-3 rounded-lg border border-border space-y-1 text-xs">
                <div className="text-muted-foreground">Current DB Price:</div>
                <div className="text-sm font-extrabold font-mono text-foreground">
                  NPR {simulateProduct.currentPrice?.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">New Simulated Price (NPR)</label>
                <Input
                  required
                  type="number"
                  placeholder="Enter lower price to trigger alert..."
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="text-xs h-9 font-mono"
                  aria-label="New Simulated Price in NPR"
                />
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  Submitting writes a new price history record tagged <code className="text-foreground bg-muted px-1 rounded font-mono">source: "manual_demo"</code> and immediately invokes <code className="text-foreground bg-muted px-1 rounded font-mono">evaluateAlertsForProduct()</code>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setSimulateProduct(null)}>
                  Close
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={simLoading} className="gap-1.5 font-bold">
                  {simLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4" />
                      <span>Run Alert Pipeline</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
