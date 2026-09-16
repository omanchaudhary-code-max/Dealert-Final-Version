"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send link");
      }
      setMessage(data.message);
    } catch (err: any) {
      setMessage(err.message || "Failed to send link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-center text-foreground">Recover Password</h2>

      {message ? (
        <Alert variant="success" className="text-center space-y-2">
          <CheckCircle className="h-6 w-6 text-success mx-auto" />
          <AlertTitle className="text-sm">Request Processed</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="primary" size="sm">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            Enter your email address to receive a password reset link.
          </p>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Email Address</label>
            <Input
              type="email"
              required
              placeholder="e.g. ram@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full font-semibold mt-2 gap-1.5"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            <span>Send Recovery Link</span>
          </Button>
        </form>
      )}

      {!message && (
        <div className="text-center text-xs text-muted-foreground pt-3 border-t border-border">
          <Link href="/login" className="text-primary font-bold hover:underline">
            Back to Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
