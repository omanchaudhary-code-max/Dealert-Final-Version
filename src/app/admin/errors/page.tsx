"use client";

import { useEffect, useState } from "react";
import { AdminService } from "@/actions/admin.actions";
import { SystemError } from "@/types/admin";
import { Loader2, Bug, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ErrorsPage() {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchErrors = () => {
    setLoading(true);
    AdminService.getErrors()
      .then((data) => {
        setErrors(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "warning";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Exceptions</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logs of server exceptions, database pool timeouts, and crawler parsing errors.
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={fetchErrors}
          title="Refresh Errors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground mt-2">Loading system exceptions log...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {errors.map((err) => (
            <Card key={err.id} className="overflow-hidden">
              <div
                onClick={() => setExpandedId(expandedId === err.id ? null : err.id)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-md bg-destructive/10 text-destructive shrink-0">
                    <Bug className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-xs sm:max-w-md">
                      {err.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] mt-0.5 flex-wrap text-muted-foreground font-mono">
                      <span className="font-medium text-foreground">Component: {err.component}</span>
                      <span>•</span>
                      <span>Logged: {new Date(err.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={getSeverityBadgeVariant(err.severity)} className="text-[9px] py-0 px-1.5 font-bold">
                    {err.severity}
                  </Badge>
                  {expandedId === err.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              {expandedId === err.id && (
                <div className="p-4 border-t border-border bg-muted/30 space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Error Diagnostic Stack Trace
                  </h4>
                  {err.stackTrace ? (
                    <pre className="p-3 bg-card border border-border rounded-md text-[10px] text-destructive leading-relaxed overflow-x-auto font-mono">
                      {err.stackTrace}
                    </pre>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No stack trace logged for this record.</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
