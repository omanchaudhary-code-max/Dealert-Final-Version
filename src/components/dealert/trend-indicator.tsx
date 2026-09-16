import { TrendingDown, TrendingUp } from "lucide-react";

interface TrendIndicatorProps {
  value: number;
  size?: "sm" | "md";
}

export function TrendIndicator({ value, size = "md" }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isZero = value === 0;

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono-num ${
        size === "sm" ? "text-xs" : "text-sm"
      } ${
        isZero
          ? "text-muted-foreground"
          : isPositive
          ? "text-destructive font-semibold"
          : "text-success font-semibold"
      }`}
    >
      {!isZero && (
        isPositive ? (
          <TrendingUp className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
        ) : (
          <TrendingDown className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
        )
      )}
      {value > 0 ? `+${value}%` : `${value}%`}
    </span>
  );
}
