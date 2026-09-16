import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PricingPlan {
  name: string;
  tagline: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  href?: string;
}

export function PricingCard({ plan }: { plan: PricingPlan }) {
  const targetHref =
    plan.href ||
    (plan.name === "Free"
      ? "/register"
      : plan.name === "Pro"
      ? "/register?tier=pro"
      : "mailto:support@dealert.com.np");

  return (
    <div
      className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all ${
        plan.highlighted
          ? "border-2 border-primary bg-gradient-to-b from-primary/10 via-card to-card shadow-elevated"
          : "border border-border/60 bg-card shadow-card"
      }`}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">
          Most Popular
        </span>
      )}

      <div>
        <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">{plan.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{plan.tagline}</p>

        <div className="mt-6 flex items-baseline gap-1">
          <span className="font-display font-mono-num text-4xl font-extrabold tracking-tight text-foreground">
            {plan.price}
          </span>
          <span className="text-xs text-muted-foreground">{plan.period}</span>
        </div>

        <ul className="mt-8 space-y-3">
          {plan.features.map((feat) => (
            <li key={feat} className="flex items-center gap-2.5 text-xs text-foreground/90">
              <div className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                <Check className="h-2.5 w-2.5" />
              </div>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <Link href={targetHref} className="w-full block">
          <Button
            variant={plan.highlighted ? "primary" : "outline"}
            className={`w-full font-semibold rounded-2xl cursor-pointer ${plan.highlighted ? "shadow-glow" : ""}`}
          >
            {plan.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}
