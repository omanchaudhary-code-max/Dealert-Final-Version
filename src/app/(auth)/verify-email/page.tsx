"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function VerifyEmailPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }
      setVerified(true);
      setMessage(data.message || "Email verified successfully");
    } catch (err: any) {
      setMessage(err.message || "Verification code mismatch. Try 123456.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-center text-foreground">Verify Email</h2>

      {verified ? (
        <Alert variant="success" className="text-center space-y-2">
          <CheckCircle className="h-6 w-6 text-success mx-auto" />
          <AlertTitle className="text-sm">Account Verified</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </Alert>
      ) : (
        <form onSubmit={handleVerify} className="space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            Enter the 6-digit verification code sent to your email.
          </p>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Verification Code</label>
            <Input
              type="text"
              required
              placeholder="e.g. 123456"
              className="text-center tracking-widest font-mono text-base font-bold"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {message && (
              <p className="text-[10px] text-destructive font-semibold flex items-center gap-1 mt-1 justify-center">
                <ShieldAlert className="h-3 w-3" />
                <span>{message}</span>
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full font-semibold mt-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            <span>Verify Code</span>
          </Button>
        </form>
      )}
    </div>
  );
}
