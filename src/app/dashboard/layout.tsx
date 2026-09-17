"use client";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthLoadingScreen } from "@/components/ui/auth-loading-screen";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, initialized, isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated && !isLoggingOut) {
      router.push("/login?redirect=/dashboard");
    }
  }, [isAuthenticated, loading, initialized, isLoggingOut, router]);

  if (!initialized || loading || isLoggingOut) {
    return (
      <AuthLoadingScreen
        message={isLoggingOut ? "Signing out..." : "Authenticating session..."}
      />
    );
  }

  if (!isAuthenticated) {
    return <AuthLoadingScreen message="Redirecting to sign in..." />;
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
