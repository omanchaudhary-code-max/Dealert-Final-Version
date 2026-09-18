"use client";

import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useAlerts } from "@/hooks/useAlerts";
import { formatCurrency } from "@/lib/format";
import {
  Heart,
  Bell,
  CheckCircle,
  PiggyBank,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_SAVINGS_HISTORY = [
  { month: "Jan", saved: 1200 },
  { month: "Feb", saved: 2500 },
  { month: "Mar", saved: 3200 },
  { month: "Apr", saved: 4800 },
  { month: "May", saved: 6900 },
  { month: "Jun", saved: 8500 },
];

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();
  const { alerts } = useAlerts();

  const activeAlerts = alerts.filter((a) => a.isActive).length;
  const triggeredAlerts = alerts.filter((a) => a.isTriggered).length;

  return (
    <div className="space-y-6 text-foreground">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hello, {user?.fullName}!
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Overview of your active price alerts, saved wishlist items, and triggered price drops.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Wishlist Items",
            val: wishlistItems.length,
            desc: "Monitored products",
            icon: Heart,
            variant: "default" as const,
            link: "/dashboard/wishlist",
          },
          {
            title: "Active Alerts",
            val: activeAlerts,
            desc: "Continuous price tracking",
            icon: Bell,
            variant: "info" as const,
            link: "/dashboard/alerts",
          },
          {
            title: "Triggered Alerts",
            val: triggeredAlerts,
            desc: "Bargains matched targets",
            icon: CheckCircle,
            variant: "success" as const,
            link: "/dashboard/notifications",
          },
          {
            title: "Total Savings",
            val: formatCurrency(user?.savedAmount || 0),
            desc: "Based on alert buying",
            icon: PiggyBank,
            variant: "warning" as const,
            link: "#",
          },
        ].map((card, idx) => (
          <Card key={idx} className="p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-1.5 rounded-md bg-muted text-foreground">
                <card.icon className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xl font-bold font-mono text-foreground">{card.val}</p>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground">{card.desc}</span>
                {card.link !== "#" && (
                  <Link href={card.link} className="text-primary font-bold hover:underline flex items-center gap-0.5">
                    <span>View</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <Card className="lg:col-span-7 p-5 flex flex-col justify-between">
          <div className="mb-3">
            <CardTitle>Cumulative Savings Curve</CardTitle>
            <CardDescription>Estimated savings achieved via target price notifications</CardDescription>
          </div>

          <div className="h-60 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={MOCK_SAVINGS_HISTORY} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="savedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const val = payload[0].value;
                    return (
                      <div className="rounded-xl border border-emerald-500/40 bg-card/95 px-3 py-2 shadow-xl backdrop-blur-md transition-all duration-200 ease-out animate-in fade-in-50 zoom-in-95 pointer-events-none">
                        <p className="font-mono-num text-[10px] uppercase font-bold text-muted-foreground">{label}</p>
                        <p className="font-display font-mono-num text-xs font-bold text-success mt-0.5">
                          Savings: {formatCurrency(val as number)}
                        </p>
                      </div>
                    );
                  }}
                  cursor={{ stroke: "#22c55e", strokeWidth: 1.5, strokeDasharray: "3 3", opacity: 0.6 }}
                  wrapperStyle={{ outline: "none", zIndex: 30 }}
                  animationDuration={200}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="saved"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#savedGradient)"
                  animationDuration={400}
                  animationEasing="ease-out"
                  activeDot={{
                    r: 6,
                    fill: "#22c55e",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                    className: "transition-all duration-150 ease-out",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-5 p-5 flex flex-col justify-between space-y-4">
          <div>
            <CardTitle>Recent Triggered Alerts</CardTitle>
            <CardDescription>Latest items that matched your price target</CardDescription>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-56 divide-y divide-border/60">
            {alerts.filter((a) => a.isTriggered).length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No alerts triggered yet. Matches will display here as prices fall.
              </div>
            ) : (
              alerts.filter((a) => a.isTriggered).slice(0, 3).map((alert) => (
                <div key={alert.id} className="pt-2 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={alert.productImage}
                      alt={alert.productName}
                      className="h-8 w-8 rounded-md object-cover bg-muted"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate max-w-[140px]">{alert.productName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">Target: {formatCurrency(alert.targetPrice)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-success font-mono">
                      {formatCurrency(alert.currentPrice)}
                    </span>
                    <Badge variant="success" className="text-[8px] py-0 px-1 block mt-0.5">
                      Triggered
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-muted/40 rounded-md border border-border flex items-center gap-2 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>Crawler schedule checks item prices automatically.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
