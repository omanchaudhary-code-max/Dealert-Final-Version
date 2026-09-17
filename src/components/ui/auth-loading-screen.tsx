"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthLoadingScreenProps {
  message?: string;
  showFallbackAfterMs?: number;
}

export function AuthLoadingScreen({
  message = "Authenticating session...",
  showFallbackAfterMs = 5000,
}: AuthLoadingScreenProps) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, showFallbackAfterMs);

    return () => clearTimeout(timer);
  }, [showFallbackAfterMs]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center space-y-4 max-w-sm w-full animate-in fade-in-50">
        <div className="flex justify-center mb-2">
          <Image
            src="/dealert_logo.png"
            alt="Dealert Logo"
            width={130}
            height={38}
            priority
            className="h-9 w-auto object-contain"
          />
        </div>

        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-card space-y-3">
          <div className="relative flex justify-center py-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">{message}</h3>
            <p className="text-xs text-muted-foreground">
              Connecting to Dealert secure session manager...
            </p>
          </div>

          {timedOut && (
            <div className="pt-3 border-t border-border space-y-2 animate-in fade-in">
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Authentication taking longer than expected.
              </p>
              <div className="flex justify-center gap-2">
                <Link href="/login">
                  <Button size="sm" variant="outline" className="text-xs font-semibold">
                    Return to Sign In
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => window.location.reload()}
                  className="text-xs font-semibold"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>Encrypted Session Verification</span>
        </div>
      </div>
    </div>
  );
}
