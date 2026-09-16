"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Heart,
  Bell,
  User,
  ShieldAlert,
  FolderTree,
  Database,
  LineChart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  History,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isAdminPath = pathname.startsWith("/admin");

  const adminLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/crawler", label: "Crawler Health", icon: Database },
    { href: "/admin/products", label: "Products & Demo", icon: FolderTree },
    { href: "/admin/affiliate", label: "Affiliate Earnings", icon: LineChart },
  ];

  const userLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/wishlist", label: "My Wishlist", icon: Heart },
    { href: "/dashboard/alerts", label: "Price Alerts", icon: Bell },
    { href: "/dashboard/notifications", label: "Alert History", icon: History },
    { href: "/dashboard/profile", label: "Account Profile", icon: User },
  ];

  const links = isAdminPath ? adminLinks : userLinks;

  return (
    <aside
      className={cn(
        "bg-card border-r border-border min-h-[calc(100vh-3.5rem)] transition-all duration-200 relative flex flex-col justify-between hidden md:flex shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="py-4 flex-1 flex flex-col gap-4">
        {/* User Card */}
        {!collapsed && user && (
          <div className="px-3">
            <div className="p-2.5 bg-muted/50 rounded-lg border border-border flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-md bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs shrink-0">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate leading-snug">{user.fullName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Section Title */}
        <div className="px-4 flex items-center justify-between">
          {!collapsed && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {isAdminPath ? "Admin Control" : "User Portal"}
            </span>
          )}
          {isAdminPath && !collapsed && (
            <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
              <ShieldCheck className="h-2.5 w-2.5 mr-0.5" /> Admin
            </Badge>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 px-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors group",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title={collapsed ? link.label : undefined}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "" : "text-muted-foreground group-hover:text-foreground")} />
                {!collapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin / User Switcher */}
      {!collapsed && user?.role === "ADMIN" && (
        <div className="p-3 border-t border-border">
          <Link
            href={isAdminPath ? "/dashboard" : "/admin"}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted text-foreground transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>{isAdminPath ? "Switch to User Portal" : "Switch to Admin Portal"}</span>
          </Link>
        </div>
      )}

      {/* Toggle Collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-6 -right-3 h-6 w-6 rounded-full border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shadow-xs cursor-pointer transition-colors"
        aria-label="Toggle sidebar collapse"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
