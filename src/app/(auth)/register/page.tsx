"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Users,
  TrendingDown,
  AlertCircle,
  Mail,
  Lock,
  User,
  ArrowLeft,
  XCircle,
  Bell,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function scorePw(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

const strengthLabel = ["Too short", "Weak", "Medium", "Strong", "Excellent"];
const strengthTone = ["bg-muted", "bg-destructive", "bg-warning", "bg-primary", "bg-success"];

export default function RegisterPage() {
  const router = useRouter();
  const { register: signup, error: authError, loading } = useAuth();

  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const strength = useMemo(() => scorePw(pw), [pw]);
  const match = confirm.length > 0 && confirm === pw;

  const hasMinLength = pw.length >= 8;
  const hasMixedCase = /[A-Z]/.test(pw) && /[a-z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (strength < 2) {
      setFormError("Password is too weak. Make it at least 8 characters.");
      return;
    }
    if (!match) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormError("");
    setIsSuccess(false);

    try {
      await signup({ fullName: name, email, password: pw, phoneNumber: "9800000000" });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setFormError(err?.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Navigation Header */}
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
        {/* Left Form Container */}
        <div className="order-2 flex items-center justify-center p-6 sm:p-12 lg:order-1">
          <div className="w-full max-w-md space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3.5 py-1 font-mono-num text-[11px] uppercase tracking-wider text-muted-foreground glass backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Free Account
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground">
                Start saving <span className="gradient-text">today.</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
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
              <span className="h-px flex-1 bg-border/60" /> OR REGISTER WITH EMAIL{" "}
              <span className="h-px flex-1 bg-border/60" />
            </div>

            {/* Registration Form */}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                  Full name
                </Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className="pl-10 h-11 rounded-xl text-sm border-border/60 focus-visible:ring-primary/40"
                  />
                </div>
              </div>

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
                <Label htmlFor="pw" className="text-xs font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pw"
                    type={show ? "text" : "password"}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    placeholder="Min 8 characters"
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

                {/* Password Strength Indicator */}
                {pw.length > 0 && (
                  <div className="mt-2.5 space-y-2 p-3 rounded-xl border border-border/50 bg-muted/20 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px] font-mono-num">
                      <span className="text-muted-foreground">Strength:</span>
                      <span className="font-bold text-foreground">{strengthLabel[strength]}</span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-all duration-300",
                            i < strength ? strengthTone[strength] : "bg-muted/60"
                          )}
                        />
                      ))}
                    </div>

                    {/* Password Requirements Checklist */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                      <Requirement text="8+ Characters" met={hasMinLength} />
                      <Requirement text="Upper & Lowercase" met={hasMixedCase} />
                      <Requirement text="At least 1 Number" met={hasNumber} />
                      <Requirement text="Special Symbol" met={hasSpecial} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirm" className="text-xs font-semibold text-foreground">
                  Confirm password
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type={show ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className={cn(
                      "pl-10 h-11 rounded-xl text-sm border-border/60 focus-visible:ring-primary/40",
                      confirm.length > 0 && !match && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                {confirm.length > 0 && (
                  <p className="mt-1.5 text-[11px] flex items-center gap-1 font-medium">
                    {match ? (
                      <span className="text-success flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-destructive flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Passwords do not match yet
                      </span>
                    )}
                  </p>
                )}
              </div>

              {(formError || authError) && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError || authError}</span>
                </div>
              )}

              {isSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3.5 py-2.5 text-xs text-success animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Account created successfully! Redirecting...
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
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
                  </>
                ) : (
                  <>
                    Create free account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground">
                By creating an account, you agree to our Terms & Privacy Policy.
              </p>
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
                <Users className="h-3.5 w-3.5 text-primary" /> Join 10,000+ Smart Shoppers
              </span>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Never overpay on <span className="gradient-text">e-commerce again.</span>
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
                Dealert continuously tracks prices across Nepal&apos;s leading online stores so you buy at historical minimums.
              </p>
            </div>

            {/* Features */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ValueCard
                icon={BarChart3}
                title="Historical Price Graphs"
                description="View 30-day price trends to catch inflated sale prices before checkout."
              />
              <ValueCard
                icon={Bell}
                title="Target Price Alerts"
                description="Set custom price drop targets and receive instant email alerts."
              />
              <ValueCard
                icon={ShieldCheck}
                title="Seller Trust Scores"
                description="Algorithmic legitimacy verification for online shops and stores."
              />
              <ValueCard
                icon={TrendingDown}
                title="100% Free Service"
                description="No hidden fees or subscriptions required for price alerts."
              />
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground font-mono-num">
            <span>🇳🇵 Nepal Price Intelligence</span>
            <span>⚡ Hourly Sync Engine</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Requirement({ text, met }: { text: string; met: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {met ? (
        <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
      ) : (
        <XCircle className="h-3 w-3 text-muted-foreground/50 shrink-0" />
      )}
      <span className={cn(met ? "text-foreground font-medium" : "text-muted-foreground/70")}>
        {text}
      </span>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 glass shadow-card space-y-1.5">
      <div className="h-8 w-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <h4 className="font-display text-sm font-bold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.3 14.7 2.3 12 2.3 6.7 2.3 2.5 6.5 2.5 12s4.2 9.7 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}
