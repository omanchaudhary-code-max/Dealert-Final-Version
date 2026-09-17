"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Sun,
  Moon,
  Search,
  Menu,
  X,
  Heart,
  User,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useProducts } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNotificationDate } from "@/lib/format";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    isAuthenticated,
    notifications,
    logout,
    markNotificationRead,
  } = useAuth();

  const { wishlistItems } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = searchQuery.trim();
  const { data: dbSearchResults = [] } = useProducts(
    trimmedQuery.length >= 2 ? { search: trimmedQuery, limit: 5 } : undefined
  );

  const searchSuggestions = trimmedQuery.length >= 2 ? dbSearchResults : [];

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark");
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/deals?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    router.push(`/deals?search=${encodeURIComponent(name)}`);
    setSearchQuery("");
    setMobileMenuOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { href: "/deals", label: "Deals" },
    { href: "/price-index", label: "Price Index" },
    { href: "/fake-page-detector", label: "Fake Page Check" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-xs">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <Image
              src="/dealert_logo.png"
              alt="Dealert"
              width={110}
              height={32}
              priority
              className="h-8 w-auto object-contain"
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? "text-primary font-semibold bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div ref={searchRef} className="hidden md:flex flex-1 max-w-sm relative">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Daraz products..."
                className="w-full pl-9 pr-4 py-1.5 rounded-md bg-muted/60 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </form>

          {searchSuggestions.length > 0 && (
            <div className="absolute top-11 left-0 right-0 bg-card border border-border rounded-md shadow-md z-50 py-1 overflow-hidden">
              {searchSuggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSuggestionClick(item.name)}
                  className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between text-xs text-foreground cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="truncate font-medium">{item.name}</span>
                    {item.category && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground uppercase shrink-0">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-primary font-bold shrink-0">
                    {formatCurrency(item.currentPrice)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
          </Button>

          <Link href={isAuthenticated ? "/dashboard/wishlist" : "/login?redirect=/dashboard/wishlist"}>
            <Button variant="ghost" size="icon" className="relative" title="Wishlist" aria-label="Wishlist">
              <Heart className="h-4 w-4 text-muted-foreground" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Button>
          </Link>

          <div ref={notifRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 py-2">
                <div className="px-4 py-2 border-b border-border flex justify-between items-center">
                  <span className="font-semibold text-xs text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => notifications.forEach((n) => { if (!n.read) markNotificationRead(n.id); })}
                      className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-border/50">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const formattedDate = formatNotificationDate(
                        notif.sentAt || notif.createdAt || (notif as any).alertedAt || (notif as any).alerted_at
                      );
                      const titleText = notif.title || "Price Alert Triggered";
                      const messageText =
                        notif.message ||
                        (notif.email ? `Alert sent to ${notif.email}` : "Price alert triggered for your wishlist item.");

                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.link) router.push(notif.link);
                            setNotifOpen(false);
                          }}
                          className={`px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors flex flex-col gap-0.5 ${
                            !notif.read ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-xs font-semibold ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                              {titleText}
                            </span>
                            {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">{messageText}</p>
                          {formattedDate && (
                            <span className="text-[9px] text-muted-foreground/70 mt-0.5 font-mono">
                              {formattedDate}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 cursor-pointer p-1 rounded-md hover:bg-muted transition-colors"
              >
                <div className="h-7 w-7 rounded-md bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-semibold text-foreground truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    <Badge variant={user?.role === "ADMIN" ? "destructive" : "default"} className="mt-1 text-[9px] py-0 px-1.5">
                      {user?.role === "ADMIN" ? "Admin" : (user as any)?.tier === "PRO" ? "Pro Tier" : "Free Tier"}
                    </Badge>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted text-foreground transition-colors"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>User Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/wishlist"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted text-foreground transition-colors"
                    >
                      <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Wishlist</span>
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted text-foreground transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Account Settings</span>
                    </Link>
                    {user?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted text-foreground transition-colors font-medium text-destructive"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Admin Portal</span>
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-border pt-1">
                    <button
                      onClick={async () => {
                        setProfileOpen(false);
                        await logout("/");
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="primary" className="font-semibold text-xs">
                Sign In
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Daraz products..."
                className="w-full pl-9 pr-4 py-2 rounded-md bg-muted border border-border text-xs text-foreground"
              />
            </div>
          </form>
          <nav className="flex flex-col space-y-1 font-medium text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md ${
                  pathname === link.href ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
