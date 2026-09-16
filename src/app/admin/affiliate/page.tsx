"use client";

import { LineChart, Clock, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminAffiliatePage() {
  return (
    <div className="space-y-6 text-foreground">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          <span>Affiliate Earnings & Revenue</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Daraz Affiliate Program monetization tracking status.
        </p>
      </div>

      {/* Static Pending Status Card - NO Mock Data / NO Fake Charts */}
      <Card className="p-8 text-center max-w-2xl mx-auto my-12 space-y-4 border border-border shadow-xs">
        <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <Clock className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-lg font-bold">Affiliate Revenue Tracking Pending</h2>
            <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
              Program Approval Pending
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Affiliate revenue tracking — pending Daraz Affiliate Program approval. This section will populate once affiliate link tracking is live.
          </p>
        </div>

        <div className="pt-4 border-t border-border/60 text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Synthetic or mock revenue figures are disabled per SPTDAS compliance standards.</span>
        </div>
      </Card>
    </div>
  );
}
