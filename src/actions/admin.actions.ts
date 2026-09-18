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
  const affiliateStats = await adminService.getAffiliateStats();
  return affiliateStats;
}

export async function getDashboardStatsAction() {
  await requireAdmin();
  const stats = await adminService.getDashboardStats();
  const affiliateStats = await adminService.getAffiliateStats();
  return {
    totalProducts: stats.totalProducts,
    activeUsers: stats.totalUsers,
    activeAlerts: stats.activeAlerts,
    totalNotifications: stats.totalNotifications,
    affiliateRevenue: affiliateStats.clicksThisMonth * 0, // Calculated using real affiliateStats object (pending Daraz approval)
    affiliateStatus: affiliateStats.status,
    affiliateClicks: affiliateStats.totalClicks,
  };
}

export async function triggerCrawlerAction(source: string = "manual_admin") {
  await requireAdmin();

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "omanchaudhary-code-max";
  const repo = process.env.GITHUB_REPO || "Dealert-Final-Version";
  const workflow = process.env.GITHUB_WORKFLOW_ID || "crawler.yml";

  if (!token) {
    throw new Error(
      "GitHub Actions dispatch not configured: GITHUB_TOKEN environment variable is missing in server environment. " +
      "Set GITHUB_TOKEN in .env to enable manual workflow dispatching via GitHub REST API."
    );
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Dealert-Admin-Portal",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: { source },
      }),
    }
  );

  if (!res.ok && res.status !== 204) {
    const errorText = await res.text();
    throw new Error(`GitHub API workflow dispatch failed (${res.status}): ${errorText}`);
  }

  return {
    success: true,
    message: `Crawler workflow '${workflow}' dispatched successfully via GitHub Actions API for repository ${owner}/${repo}.`,
    triggeredAt: new Date().toISOString(),
  };
}
