import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
}

export function StatCard({ icon: Icon, label, value, hint, trend }: StatCardProps) {
  const displayHint = hint || trend;
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between text-muted-foreground mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-primary" />}
      </div>
      <div className="font-display font-mono-num text-2xl font-bold tracking-tight text-foreground">
        {value}
      </div>
      {displayHint && <div className="mt-1 text-xs text-muted-foreground font-medium">{displayHint}</div>}
    </div>
  );
}
