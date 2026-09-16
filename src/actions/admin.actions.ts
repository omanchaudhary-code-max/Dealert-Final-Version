"use server";

import { adminService } from "@/services/admin.service";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Unauthorized");
  try {
    const payload = await verifyAccessToken(token);
    const role = payload.role?.toUpperCase();
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      throw new Error("Forbidden");
    }
    return payload;
  } catch {
    throw new Error("Unauthorized");
  }
}

export async function getCrawlLogsAction() {
  await requireAdmin();
  const result = await adminService.getCrawlLogs({});
  return result.logs.map((log: any) => ({
    id: log.id || log._id?.toString(),
    source: "Python Crawler",
    status: log.status || "SUCCESS",
    startedAt: log.started_at ? new Date(log.started_at).toISOString() : new Date().toISOString(),
    finishedAt: log.finished_at ? new Date(log.finished_at).toISOString() : new Date().toISOString(),
    productsCrawled: log.total_products || 0,
    failureReason: log.failure_reason || null,
  }));
}

export async function getCrawlErrorsAction() {
  await requireAdmin();
  const errors = await adminService.getCrawlErrors(50);
  return errors.map((err: any) => ({
    id: err.id || err._id?.toString(),
    message: err.reason || "Crawler Exception",
    component: err.category || "Crawler",
    severity: "HIGH",
    stackTrace: err.url || null,
    timestamp: err.logged_at ? new Date(err.logged_at).toISOString() : new Date().toISOString(),
  }));
}

export async function getAffiliateStatsAction() {
  await requireAdmin();
  return [];
}

export async function getDashboardStatsAction() {
  await requireAdmin();
  const stats = await adminService.getDashboardStats();
  const affiliateStats = await adminService.getAffiliateStats();
  return {
    totalProducts: stats.totalProducts,
    activeUsers: stats.totalUsers,
    activeAlerts: stats.activeAlerts,
    affiliateRevenue: 0,
  };
}

export async function triggerCrawlerAction(source: string) {
  await requireAdmin();
  return {
    id: `log-${Date.now()}`,
    source,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    productsCrawled: 0,
    status: "SUCCESS",
    failureReason: null,
  };
}

export const AdminService = {
  getCrawlLogs: getCrawlLogsAction,
  getErrors: getCrawlErrorsAction,
  getOverview: getDashboardStatsAction,
  getAffiliateAnalytics: getAffiliateStatsAction,
  triggerCrawler: triggerCrawlerAction,
};
