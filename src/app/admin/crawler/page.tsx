"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Database,
  AlertOctagon,
  Clock,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface CrawlRun {
  id: string;
  started_at: string;
  finished_at: string | null;
  categories: string[];
  total_products: number;
  total_new: number;
  total_updated: number;
  total_errors: number;
  status: string;
  failure_reason?: string;
}

interface CrawlError {
  id: string;
  crawl_run_id: string;
  category: string;
  url: string;
  reason: string;
  logged_at: string;
}

interface CrawlStatusResponse {
  latestRun: CrawlRun | null;
  isStale: boolean;
}

export default function AdminCrawlerPage() {
  const [statusData, setStatusData] = useState<CrawlStatusResponse | null>(null);
  const [runs, setRuns] = useState<CrawlRun[]>([]);
  const [errors, setErrors] = useState<CrawlError[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const [statusRes, runsRes, errorsRes] = await Promise.all([
        fetch("/api/admin/crawl-status"),
        fetch("/api/admin/crawl-runs?limit=20"),
        fetch("/api/admin/crawl-errors?limit=50"),
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        setStatusData(sData);
      }

      if (runsRes.ok) {
        const rData = await runsRes.json();
        setRuns(Array.isArray(rData) ? rData : []);
      }

      if (errorsRes.ok) {
        const eData = await errorsRes.json();
        setErrors(Array.isArray(eData) ? eData : []);
      }
    } catch (err) {
      console.error("Failed to load crawler monitoring data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const formatTimeAgo = (dateStr?: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours >= 24) {
      const days = Math.floor(diffHours / 24);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ${diffMins}m ago`;
    }
    return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  };

  return (
    <div className="space-y-6 text-foreground">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <span>Crawler Health & Activity</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time crawler execution status, scheduled run logs, and error diagnostic logs from MongoDB (`crawl_logs` & `errors`).
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAllData}
          disabled={refreshing}
          className="h-9 gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh Status</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground mt-3">Fetching crawler diagnostics...</p>
        </div>
      ) : (
        <>
          {/* Section 1 Banner: Health Status */}
          {statusData && (
            <Card
              className={`p-5 border shadow-sm transition-colors ${
                statusData.isStale
                  ? "bg-destructive/10 border-destructive/30 text-destructive-foreground"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
              }`}
            >
              <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                <div className="flex items-center space-x-3.5">
                  {statusData.isStale ? (
                    <div className="h-10 w-10 rounded-full bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}

                  <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                      {statusData.isStale ? (
                        <span className="text-destructive font-extrabold">
                          Stale — no successful run in over 36 hours
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                          Healthy — last run {formatTimeAgo(statusData.latestRun?.started_at)}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {statusData.isStale
                        ? "A scheduled daily crawl run appears to have been missed. Inspect crawler worker process or MongoDB storage."
                        : `Latest crawl run status: ${statusData.latestRun?.status ?? "completed"} (${statusData.latestRun?.total_products ?? 0} products processed).`}
                    </p>
                  </div>
                </div>

                {statusData.latestRun && (
                  <div className="text-left sm:text-right border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0 shrink-0">
                    <div className="text-[11px] font-medium text-muted-foreground flex items-center sm:justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Started: {new Date(statusData.latestRun.started_at).toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] font-medium text-muted-foreground mt-0.5">
                      {statusData.latestRun.finished_at
                        ? `Finished: ${new Date(statusData.latestRun.finished_at).toLocaleTimeString()}`
                        : "Status: Currently Running..."}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Section 1 Table: Recent Crawl Runs */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Recent Crawl Runs (`crawl_logs`)</span>
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  History of recent automated scraping runs across retail product categories.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Last {runs.length} runs
              </Badge>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs">Run ID / Started</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Categories Scraped</TableHead>
                    <TableHead className="text-xs text-right">Total</TableHead>
                    <TableHead className="text-xs text-right">New</TableHead>
                    <TableHead className="text-xs text-right">Updated</TableHead>
                    <TableHead className="text-xs text-right">Errors</TableHead>
                    <TableHead className="text-xs">Finished At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                        No crawl logs found in database.
                      </TableCell>
                    </TableRow>
                  ) : (
                    runs.map((run) => (
                      <TableRow key={run.id} className="text-xs">
                        <TableCell className="font-mono text-foreground font-medium">
                          <div>{run.id.slice(-8)}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(run.started_at).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              run.status === "completed" || run.status === "SUCCESS"
                                ? "success"
                                : run.status === "failed" || run.status === "FAILED"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-[9px] py-0 px-1.5 uppercase font-bold"
                          >
                            {run.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="flex flex-wrap gap-1">
                            {run.categories.length > 0 ? (
                              run.categories.map((c, idx) => (
                                <span
                                  key={idx}
                                  className="bg-muted px-1.5 py-0.5 rounded text-[10px] capitalize text-foreground"
                                >
                                  {c}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-[10px]">All categories</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">{run.total_products}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          +{run.total_new}
                        </TableCell>
                        <TableCell className="text-right font-mono text-blue-600 dark:text-blue-400">
                          {run.total_updated}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {run.total_errors > 0 ? (
                            <span className="text-destructive font-bold">{run.total_errors}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-[11px]">
                          {run.finished_at ? new Date(run.finished_at).toLocaleTimeString() : "In progress..."}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Section 1 Table: Recent Crawl Errors */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <AlertOctagon className="h-4 w-4 text-destructive" />
                  <span>Crawler Exception & Failure Logs (`errors`)</span>
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Logged failures, timeouts, and extraction errors from recent scraping sessions.
                </p>
              </div>
              <Badge variant="destructive" className="text-[10px]">
                {errors.length} errors logged
              </Badge>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs">Logged At</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Reason / Exception</TableHead>
                    <TableHead className="text-xs">Target URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                        No crawler errors logged in MongoDB. System running cleanly.
                      </TableCell>
                    </TableRow>
                  ) : (
                    errors.map((err) => (
                      <TableRow key={err.id} className="text-xs">
                        <TableCell className="font-mono text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">
                          {new Date(err.logged_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {err.category || "General"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-destructive max-w-xs">
                          {err.reason}
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate text-[11px] font-mono text-muted-foreground">
                          {err.url ? (
                            <a
                              href={err.url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline flex items-center gap-1 text-primary truncate"
                            >
                              <span className="truncate">{err.url}</span>
                              <ArrowUpRight className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
