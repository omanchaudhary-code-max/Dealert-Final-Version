"use client";

import { useAlerts } from "@/hooks/useAlerts";
import { formatCurrency } from "@/lib/format";
import { Bell, Trash2, Edit2, Plus, X, Search, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { INITIAL_PRODUCTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function AlertsPage() {
  const { alerts, createAlert, editAlert, deleteAlert, toggleAlert, loading } = useAlerts();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !targetPrice) return;

    const product = INITIAL_PRODUCTS.find((p) => p.id === selectedProductId);
    if (!product) return;

    createAlert(
      product.id,
      Number(targetPrice),
      product.currentPrice,
      product.name,
      product.imageUrl
    );

    setSelectedProductId("");
    setTargetPrice("");
    setCreateOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editPrice) return;
    editAlert(id, Number(editPrice));
    setEditPrice("");
    setEditOpen(null);
  };

  return (
    <div className="space-y-6 text-foreground pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <span>Price Track Alerts</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure target price triggers on tracked inventory. Receive notifications as soon as market prices drop.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="gap-1.5 self-start sm:self-auto font-bold px-4 h-9 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Alert</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, idx) => (
            <Card key={idx} className="h-20 bg-muted/40 animate-pulse border-border" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="p-10 text-center space-y-4 border border-border shadow-xs">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            <Bell className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-foreground text-base">No price alerts configured</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              You haven't set any price drop thresholds yet. Create an alert or browse live deals to start tracking.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 font-bold">
              <Plus className="h-4 w-4" />
              <span>Create Alert</span>
            </Button>
            <Link href="/deals">
              <Button variant="outline" size="sm" className="gap-1.5 font-bold">
                <Search className="h-4 w-4" />
                <span>Browse Hot Deals</span>
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Mobile Stacked Card View (< 768px) */}
          <div className="block md:hidden space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className="p-4 border border-border space-y-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <img
                    src={alert.productImage}
                    alt={alert.productName}
                    className="h-12 w-12 rounded-lg object-cover bg-muted shrink-0 border border-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-foreground line-clamp-1">{alert.productName}</p>
                    <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                      Checked {new Date(alert.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    disabled={loading}
                    className="shrink-0"
                    aria-label={`Toggle alert status for ${alert.productName}`}
                  >
                    <Badge variant={alert.isActive ? "success" : "outline"} className="text-[9px] py-0.5 px-2">
                      {alert.isActive ? "ENABLED" : "DISABLED"}
                    </Badge>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">Current Live</span>
                    <span className="font-bold text-foreground">{formatCurrency(alert.currentPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase block">Target Price</span>
                    <span className="font-bold text-primary">{formatCurrency(alert.targetPrice)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  {alert.isTriggered ? (
                    <Badge variant="success" className="text-[9px] py-0.5 px-2 font-bold">
                      Target Matched
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-mono">Monitoring...</span>
                  )}

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 gap-1"
                      onClick={() => {
                        setEditPrice(alert.targetPrice.toString());
                        setEditOpen(alert.id);
                      }}
                      title="Edit Target Price"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10 gap-1"
                      onClick={() => setDeleteConfirmId(alert.id)}
                      title="Delete Alert"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto border border-border rounded-xl shadow-xs bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-bold">Product Info</TableHead>
                  <TableHead className="text-xs font-bold">Current Price</TableHead>
                  <TableHead className="text-xs font-bold">Target Threshold</TableHead>
                  <TableHead className="text-xs font-bold text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={alert.productImage}
                          alt={alert.productName}
                          className="h-10 w-10 rounded-lg object-cover bg-muted shrink-0 border border-border"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-foreground truncate text-xs">{alert.productName}</p>
                          <span className="text-[10px] text-muted-foreground block font-mono">
                            Last checked: {new Date(alert.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-foreground font-mono">{formatCurrency(alert.currentPrice)}</span>
                      {alert.isTriggered && (
                        <Badge variant="success" className="ml-2 text-[9px] py-0 px-1 font-bold">
                          Triggered
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-primary font-mono">{formatCurrency(alert.targetPrice)}</span>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        disabled={loading}
                        className="cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded"
                        aria-label={`Toggle alert for ${alert.productName}`}
                      >
                        <Badge variant={alert.isActive ? "success" : "outline"} className="text-[9px] py-0.5 px-2 font-bold">
                          {alert.isActive ? "ENABLED" : "DISABLED"}
                        </Badge>
                      </button>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditPrice(alert.targetPrice.toString());
                            setEditOpen(alert.id);
                          }}
                          title="Edit Target Price"
                          aria-label={`Edit target price for ${alert.productName}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteConfirmId(alert.id)}
                          title="Delete Alert"
                          aria-label={`Delete alert for ${alert.productName}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* MODAL 1: Create Alert */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 relative space-y-4 shadow-2xl border border-border animate-in fade-in-50">
            <button
              onClick={() => setCreateOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <CardTitle className="text-base font-bold">Create Price Alert</CardTitle>
              <CardDescription className="text-xs">Select a product to start tracking price changes.</CardDescription>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Select Product</label>
                <Select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  aria-label="Select product for price alert"
                >
                  <option value="">Choose product...</option>
                  {INITIAL_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.currentPrice)})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Target Price Threshold (NPR)</label>
                <Input
                  type="number"
                  required
                  placeholder="e.g. 135000"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="text-xs font-mono"
                  aria-label="Target price threshold in NPR"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full font-bold gap-1.5">
                <Bell className="h-4 w-4" />
                <span>Start Tracking Alert</span>
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 2: Edit Target Price */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-sm p-6 relative space-y-4 shadow-2xl border border-border animate-in fade-in-50">
            <button
              onClick={() => setEditOpen(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md"
              aria-label="Close edit modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <CardTitle className="text-base font-bold">Edit Target Price</CardTitle>
              <CardDescription className="text-xs">Adjust target threshold for this price alert.</CardDescription>
            </div>

            <form onSubmit={(e) => handleEditSubmit(e, editOpen)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">New Target Price (NPR)</label>
                <Input
                  type="number"
                  required
                  placeholder="Enter target price..."
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="text-xs font-mono"
                  aria-label="New target price in NPR"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full font-bold">
                <span>Save Changes</span>
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-sm p-6 space-y-4 shadow-2xl border border-border animate-in fade-in-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Deactivate Price Alert?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This will stop price monitoring for this product. You can recreate it anytime.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  deleteAlert(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="text-xs font-bold gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Confirm Delete</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
