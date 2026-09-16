"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, Bell, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    currentPrice: number;
    originalPrice?: number;
    discountPercentage?: number;
    sellerName?: string;
    imageUrl?: string;
    category?: string;
  };
}

export function PriceCard({ product }: ProductCardProps) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wish = isWishlisted(product.id);
  const discount = product.discountPercentage ?? 
    (product.originalPrice && product.originalPrice > product.currentPrice
      ? Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)
      : 0);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-card hover:border-primary/50 transition-all hover:shadow-elevated">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/40">
        <Image
          src={product.imageUrl || "/placeholder.png"}
          alt={product.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <div className="absolute top-2.5 left-2.5">
            <Badge variant="destructive" className="font-mono-num font-bold text-xs shadow-xs px-2 py-0.5 gap-1">
              <ArrowDownRight className="h-3.5 w-3.5" />
              {discount}% OFF
            </Badge>
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-xl glass-strong transition-colors cursor-pointer ${
            wish ? "text-primary bg-primary/10 border-primary/30" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Toggle price alert"
          title={wish ? "Price Alert Active" : "Set Price Alert"}
        >
          <Bell className={`h-4 w-4 ${wish ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-between">
        <div>
          {product.category && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {product.category}
            </span>
          )}
          <Link
            href={`/deals`}
            className="mt-1 block font-display text-sm font-semibold tracking-tight text-foreground hover:text-primary transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          {product.sellerName && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {product.sellerName}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border/40 pt-3">
          <div>
            {product.originalPrice && product.originalPrice > product.currentPrice && (
              <span className="block font-mono-num text-xs text-muted-foreground line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            <span className="font-mono-num text-base font-bold text-foreground">
              {formatCurrency(product.currentPrice)}
            </span>
          </div>

          <Link href={`/deals`}>
            <Button size="sm" variant="outline" className="rounded-xl text-xs font-semibold gap-1">
              <LineChart className="h-3.5 w-3.5" /> Price History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
