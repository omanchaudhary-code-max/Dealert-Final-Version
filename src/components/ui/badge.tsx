import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "success"
    | "warning"
    | "info";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default:
      "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
    secondary:
      "bg-secondary/15 text-secondary-foreground border-secondary/20",
    outline: "border-border text-muted-foreground",
    destructive:
      "bg-destructive/10 text-destructive border-destructive/20",
    success:
      "bg-success/10 text-success border-success/20",
    warning:
      "bg-warning/10 text-warning border-warning/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shrink-0",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
