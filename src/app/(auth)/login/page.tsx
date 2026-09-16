"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  TrendingDown,
  AlertCircle,
  Mail,
  Lock,
  Zap,
  CheckCircle2,
  ArrowLeft,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { login, error: authError, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState("");

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password");
    setFormError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setFormError("Please enter your email address and password.");
      return;
    }

    setFormError("");
    try {
      await login({ email, password });
      router.push(redirectUrl);
    } catch (err: any) {
      setFormError(err?.message || "Invalid credentials. Please check your email and password.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="px-6 py-5 border-b border-border/40 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/dealert_logo.png" alt="Dealert Logo" className="h-8 w-auto transition-transform group-hover:scale-105" />
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
      </header>

      <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[1fr_1.1fr]">
        {/* Left Form Side */}
        <div className="order-2 flex items-center justify-center p-6 sm:p-12 lg:order-1">
          <div className="w-full max-w-md space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3.5 py-1 font-mono-num text-[11px] uppercase tracking-wider text-muted-foreground glass backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Welcome Back
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground">
                Sign in to <span className="gradient-text">Dealert.</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Don&apos;t have an account yet?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Create one for free
                </Link>
              </p>
            </div>

            {/* Quick Demo Pre-fill Pills */}
            <div className="rounded-2xl border border-border/60 bg-card/60 p-3 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-mono-num text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Zap className="h-3.5 w-3.5 text-warning" /> 1-Click Demo Logins:
                </span>
                <span>Click to auto-fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill("user@dealert.com")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5",
                    email === "user@dealert.com"
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50"
                  )}
                >
                  <UserCheck className="h-3.5 w-3.5" /> Demo User
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("admin@dealert.com")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5",
                    email === "admin@dealert.com"
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50"
                  )}
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Demo Admin
                </button>
              </div>
            </div>

            {/* Social Auth */}
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2 rounded-xl font-semibold border-border/60 shadow-xs hover:border-primary/40 cursor-pointer"
              onClick={() => {
                window.location.href = "/api/auth/google";
              }}
            >
              <GoogleGlyph /> Continue with Google
            </Button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border/60" /> OR EMAIL{" "}
              <span className="h-px flex-1 bg-border/60" />
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                  Email address
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 h-11 rounded-xl text-sm border-border/60 focus-visible:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pw" className="text-xs font-semibold text-foreground">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pw"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 rounded-xl text-sm border-border/60 focus-visible:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {(formError || authError) && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError || authError}</span>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full shadow-glow font-semibold rounded-xl h-11 gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Hero / Showcase Side */}
        <aside className="relative order-1 overflow-hidden border-b border-border/60 bg-gradient-hero p-8 lg:order-2 lg:border-b-0 lg:border-l lg:p-12 flex flex-col justify-between">
          <div className="absolute inset-0 bg-grid opacity-[0.18]" aria-hidden />
          <div
            className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl pointer-events-none"
            aria-hidden
          />

          <div className="relative z-10 space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 font-mono-num text-[11px] uppercase tracking-wider text-muted-foreground glass">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Live Price Intelligence
              </span>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Smart price drop radar for <span className="gradient-text">Nepal.</span>
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
                Log in to monitor live price reductions, target alert thresholds, seller trust scores, and historical price minimums.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric icon={Users} v="10,000+" l="Active Users" />
              <Metric icon={TrendingDown} v="Rs 14M+" l="Saved Annually" />
              <Metric icon={ShieldCheck} v="500K+" l="Tracked Items" />
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2.5 pt-2 border-t border-border/40">
              <FeatureItem text="Hourly automated price tracking across Daraz Nepal" />
              <FeatureItem text="Algorithmic protection against fake Dashain discounts" />
              <FeatureItem text="Instant email and push notifications when prices drop" />
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="relative z-10 pt-8 border-t border-border/50">
            <figure className="rounded-2xl border border-border/60 bg-card/70 p-4.5 glass shadow-card">
              <blockquote className="text-xs sm:text-sm text-foreground/90 italic">
                &quot;Dealert alerted me right when the laptop price dropped by Rs 12,000. Verified price history saved me from a fake sale!&quot;
              </blockquote>
              <figcaption className="mt-2.5 text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  <strong className="text-foreground font-semibold">Aarav Sharma</strong> · Kathmandu
                </span>
                <span className="text-[10px] font-bold text-success bg-success/15 px-2 py-0.5 rounded-full">
                  Verified Shopper
                </span>
              </figcaption>
            </figure>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-background text-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function Metric({
  icon: Icon,
  v,
  l,
}: {
  icon: React.ComponentType<{ className?: string }>;
  v: string;
  l: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 glass shadow-card">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 font-display text-lg font-bold tracking-tight text-foreground">{v}</p>
      <p className="font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
        {l}
      </p>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-foreground/90 font-medium">
      <div className="h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </div>
      <span>{text}</span>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.3 14.7 2.3 12 2.3 6.7 2.3 2.5 6.5 2.5 12s4.2 9.7 9.5 9.7c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}
