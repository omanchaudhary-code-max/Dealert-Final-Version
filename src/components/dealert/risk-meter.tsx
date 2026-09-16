import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";

interface RiskMeterProps {
  score: number;
}

export function RiskMeter({ score }: RiskMeterProps) {
  const getVerdict = (s: number) => {
    if (s >= 80) return { label: "High Trust / Safe", color: "text-success", bg: "bg-success", icon: ShieldCheck };
    if (s >= 50) return { label: "Moderate Risk", color: "text-warning", bg: "bg-warning", icon: AlertTriangle };
    return { label: "High Risk / Suspected Scam", color: "text-destructive", bg: "bg-destructive", icon: ShieldAlert };
  };

  const verdict = getVerdict(score);
  const Icon = verdict.icon;

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Trust Score Assessment
          </span>
          <h4 className={`mt-1 flex items-center gap-2 font-display text-xl font-bold ${verdict.color}`}>
            <Icon className="h-5 w-5" />
            {verdict.label}
          </h4>
        </div>
        <div className="text-right">
          <span className="font-display font-mono-num text-4xl font-extrabold tracking-tight text-foreground">
            {score}
          </span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted/60 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${verdict.bg}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between font-mono-num text-[10px] text-muted-foreground">
        <span>0 (Dangerous)</span>
        <span>50 (Caution)</span>
        <span>100 (Verified)</span>
      </div>
    </div>
  );
}
