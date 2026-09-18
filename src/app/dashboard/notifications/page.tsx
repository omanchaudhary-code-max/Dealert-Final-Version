"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { Bell, MailCheck, ShieldCheck, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { formatNotificationDate } from "@/lib/format";

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useNotifications();

  const simulatedEmailLogs = useMemo(() => [
    {
      id: "email-1",
      recipient: "user@dealert.com",
      subject: "Price Drop Alert: iPhone 15 Pro",
      sentAt: new Date(1773631000000).toISOString(),
      status: "DELIVERED",
      body: "Good news! iPhone 15 Pro (128GB, Natural Titanium) has hit your target of NPR 175,000. Current price is NPR 172,999 at Oliz Store."
    },
    {
      id: "email-2",
      recipient: "user@dealert.com",
      subject: "Welcome to Dealert Nepal!",
      sentAt: new Date(1773458000000).toISOString(),
      status: "DELIVERED",
      body: "Thank you for creating an account with Dealert. Start comparing online prices and setting alerts to save money."
    }
  ], []);

  return (
    <div className="space-y-6 text-foreground pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <span>Alert & Email Logs</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            History of triggered price alerts, push notifications, and email dispatch records.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllNotificationsRead}
              className="text-xs font-semibold"
            >
              Mark All Read
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={clearNotifications}
              title="Clear All Notifications"
              aria-label="Clear all notifications"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* In-App Notifications */}
        <Card className="lg:col-span-6 p-5 space-y-4 border border-border shadow-xs">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold">In-App Notifications</CardTitle>
          </div>

          <div className="space-y-3 divide-y divide-border/60 max-h-[400px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-xs text-muted-foreground">No new notifications. You're all caught up!</p>
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
                    onClick={() => markNotificationRead(notif.id)}
                    className={`pt-3 first:pt-0 text-xs cursor-pointer ${
                      !notif.read ? "bg-primary/5 p-3 rounded-lg border border-primary/20" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className={`font-semibold ${!notif.read ? "text-primary font-bold" : "text-foreground"}`}>
                        {titleText}
                      </span>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{messageText}</p>
                    {formattedDate && (
                      <span className="text-[9px] text-muted-foreground/80 mt-1 block font-mono">
                        {formattedDate}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Email Alert Logs */}
        <Card className="lg:col-span-6 p-5 space-y-4 border border-border shadow-xs">
          <div className="flex items-center gap-2">
            <MailCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base font-bold">Email Alert Dispatch Logs</CardTitle>
          </div>

          <div className="space-y-3 divide-y divide-border/60 max-h-[400px] overflow-y-auto pr-1">
            {simulatedEmailLogs.map((email: any) => (
              <div key={email.id} className="pt-3 first:pt-0 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[10px] font-semibold">
                  <span className="text-foreground truncate font-mono">To: {email.recipient}</span>
                  <Badge variant="success" className="text-[8px] py-0 px-1.5 font-bold">
                    {email.status}
                  </Badge>
                </div>
                <p className="font-bold text-foreground">{email.subject}</p>
                <div className="p-2.5 bg-muted/50 rounded-md text-[11px] text-muted-foreground leading-relaxed font-mono border border-border/40">
                  {email.body}
                </div>
                <span className="text-[9px] text-muted-foreground/80 block font-mono">
                  Dispatched {new Date(email.sentAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-muted/40 rounded-md border border-border flex items-center gap-2 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Alert notifications use secure email delivery channels.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
