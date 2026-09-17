import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RiskMeterProps {
  score: number;
  riskTier?: "LOW" | "MEDIUM" | "HIGH";
  summary?: string;
  overrideApplied?: string;
}

export function RiskMeter({ score, riskTier, summary, overrideApplied }: RiskMeterProps) {
  const getVerdict = (s: number, tier?: string) => {
    if (tier === "HIGH" || s < 50) {
      return {
        label: "High Risk / Suspected Scam",
        tierLabel: "HIGH RISK TIER",
        badgeVariant: "destructive" as const,
        color: "text-destructive",
        bg: "bg-destructive",
        icon: ShieldAlert,
        description: "Multiple high-risk indicators detected. Avoid entering payment details or credentials on this page."
      };
    }
    if (tier === "MEDIUM" || s < 80) {
      return {
        label: "Medium Risk / Exercise Caution",
        tierLabel: "MEDIUM RISK TIER",
        badgeVariant: "warning" as const,
        color: "text-amber-500 dark:text-amber-400",
        bg: "bg-amber-500",
        icon: AlertTriangle,
        description: "Some unverified or mixed signals found. Double-check seller background before making purchases."
      };
    }
    return {
      label: "Low Risk / Verified Trust",
      tierLabel: "LOW RISK TIER",
      badgeVariant: "success" as const,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500",
      icon: ShieldCheck,
      description: "Passed security checks with valid SSL, domain age, and clean threat intelligence records."
    };
  };

  const verdict = getVerdict(score, riskTier);
  const Icon = verdict.icon;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-card space-y-4">
      <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              100-Point Seller Trust Score
            </span>
            <Badge variant={verdict.badgeVariant} className="text-[9px] px-2 py-0.5 font-bold uppercase">
              {verdict.tierLabel}
            </Badge>
            {overrideApplied && (
              <Badge variant="outline" className="text-[9px] px-2 py-0.5 font-mono">
                Rule: {overrideApplied}
              </Badge>
            )}
          </div>
          <h4 className={`mt-1 flex items-center gap-2 font-display text-lg sm:text-xl font-extrabold ${verdict.color}`}>
            <Icon className="h-5 w-5 shrink-0" />
            <span>{verdict.label}</span>
          </h4>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <div className="font-display font-mono-num text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {score}
            <span className="text-sm font-normal text-muted-foreground"> / 100</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-3 overflow-hidden rounded-full bg-muted p-0.5 border border-border/40">
          <div
            className={`h-full rounded-full transition-all duration-500 ${verdict.bg}`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>0 (High Risk)</span>
          <span>50 (Caution)</span>
          <span>100 (Safe / Verified)</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">Evaluation Summary: </span>
        {summary || verdict.description}
      </div>
    </div>
  );
}
