
export function formatCurrency(
  value: number | null | undefined,
  options?: { decimals?: number }
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Rs. —";
  }

  const decimals = options?.decimals ?? 0;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return `Rs. ${formatted}`;
}


export function formatPercentage(
  value: number | null | undefined,
  options?: { showSign?: boolean }
): string {
  if (value === null || value === undefined || Number.isNaN(value) || value < 0) {
    return "0%";
  }
  const rounded = Math.round(value);
  const sign = options?.showSign ? "+" : "";
  return `${sign}${rounded}%`;
}

export function formatNotificationDate(
  rawDate: string | Date | number | null | undefined
): string {
  if (!rawDate) return "";
  const date = new Date(rawDate);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs >= 0 && diffSecs < 60) {
    return "Just now";
  } else if (diffMins > 0 && diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  } else if (diffHours > 0 && diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffDays > 0 && diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString();
}