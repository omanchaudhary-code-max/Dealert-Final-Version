"use client";

import { useAlerts } from "@/hooks/useAlerts";
import { formatCurrency } from "@/lib/format";
import { Bell, Trash2, Edit2, Plus, X } from "lucide-react";
import { useState } from "react";
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
    <div className="space-y-6 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Price Track Alerts</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure target price triggers on tracked inventory.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Alert</span>
        </Button>
      </div>

      {alerts.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Bell className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="font-semibold text-foreground text-sm">No active alerts configured</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            You don&apos;t have any price tracking alerts set up yet. Create an alert to get notified on price drops.
          </p>
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
            Create First Alert
          </Button>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Info</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Target Price</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={alert.productImage}
                      alt={alert.productName}
                      className="h-9 w-9 rounded-md object-cover bg-muted shrink-0"
                    />
                    <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                      <p className="font-semibold text-foreground truncate text-xs">{alert.productName}</p>
                      <span className="text-[10px] text-muted-foreground block font-mono">
                        Checked {new Date(alert.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    className="cursor-pointer"
                  >
                    <Badge variant={alert.isActive ? "success" : "outline"} className="text-[9px] py-0.5 px-2">
                      {alert.isActive ? "ENABLED" : "DISABLED"}
                    </Badge>
                  </button>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditPrice(alert.targetPrice.toString());
                        setEditOpen(alert.id);
                      }}
                      title="Edit Target Price"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteAlert(alert.id)}
                      title="Delete Alert"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* New Alert Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-md p-6 relative space-y-4 shadow-xl">
            <button
              onClick={() => setCreateOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <CardTitle>Create Price Alert</CardTitle>
              <CardDescription>Select a product to start tracking price changes.</CardDescription>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Select Product</label>
                <Select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
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
                <label className="text-xs font-semibold">Target Price Threshold (NPR)</label>
                <Input
                  type="number"
                  required
                  placeholder="e.g. 135000"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
              </div>

              <Button type="submit" variant="primary" className="w-full font-semibold gap-1.5">
                <Bell className="h-4 w-4" />
                <span>Start Tracking Alert</span>
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-sm p-6 relative space-y-4 shadow-xl">
            <button
              onClick={() => setEditOpen(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <CardTitle>Edit Target Price</CardTitle>
              <CardDescription>Adjust threshold for this item alert.</CardDescription>
            </div>

            <form onSubmit={(e) => handleEditSubmit(e, editOpen)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">New Target Price (NPR)</label>
                <Input
                  type="number"
                  required
                  placeholder="Enter target price..."
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              </div>

              <Button type="submit" variant="primary" className="w-full font-semibold">
                <span>Save Changes</span>
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
