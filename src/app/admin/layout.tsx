"use client";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthLoadingScreen } from "@/components/ui/auth-loading-screen";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading, initialized, isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !isLoggingOut) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/admin");
      } else if (user?.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, loading, initialized, isLoggingOut, user, router]);

  if (!initialized || loading || isLoggingOut) {
    return (
      <AuthLoadingScreen
        message={isLoggingOut ? "Signing out..." : "Authorizing admin session..."}
      />
    );
  }

  if (!isAuthenticated) {
    return <AuthLoadingScreen message="Redirecting to sign in..." />;
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4 shadow-md">
          <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
          <h3 className="text-base font-bold">Admin Portal Restricted</h3>
          <p className="text-xs text-muted-foreground">
            This portal is restricted to system administrators. Please log in with an admin account (admin@dealert.com).
          </p>
          <Button variant="primary" size="sm" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 flex items-stretch">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
