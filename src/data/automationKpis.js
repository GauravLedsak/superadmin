/* ============================================================
   AUTOMATION CENTER — global KPI aggregation
   Combines two data sources into one set of aggregate numbers:
   1. Internal-ops automations — real run logs (SEED_AUTOMATION_LOGS /
      localStorage, from pages/AutomationPage.jsx) bucketed by calendar month.
   2. Tenant-CRM automations — each tenant's own lead-routing/WhatsApp/field
      automations, run on a separate product with no shared API into this
      admin app (see AutomationLogsSection's banner). There is no real
      run-level data available for this source, only aggregate monthly
      totals — so it's mocked here as a monthly summary + a short list of
      recent per-tenant failures (just enough to drive the "needs attention"
      KPI), NOT a full run log. That's why only Internal Ops Logs is a valid
      KPI-drill-through target: it's the only source with real per-run rows.
   ============================================================ */
import { MONTHS_SHORT } from "../lib/format.js";

/* ---- Period definition ----
   Internal Ops Logs has no period/date filter of its own today, so this
   view establishes one: calendar month (not rolling 30d), because KPI #6
   (MTD vs full-month comparison) only makes sense against a calendar month. */
const CURRENT_YEAR = 2026, CURRENT_MONTH = 4; // May, 0-indexed
export const KPI_PERIODS = Array.from({ length: 6 }, (_, i) => {
  const idx = CURRENT_MONTH - (5 - i);
  const y = idx < 0 ? CURRENT_YEAR - 1 : CURRENT_YEAR;
  const m = ((idx % 12) + 12) % 12;
  return `${MONTHS_SHORT[m]} ${y}`;
}); // ["Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026"]
export const CURRENT_PERIOD = KPI_PERIODS[KPI_PERIODS.length - 1];

/* ---- Tenant-CRM automations (mocked aggregate — see module note above) ---- */
export const TENANT_CRM_MONTHLY = [
  { month: "Dec 2025", totalRuns: 21840, successRuns: 21120 },
  { month: "Jan 2026", totalRuns: 24310, successRuns: 23540 },
  { month: "Feb 2026", totalRuns: 22190, successRuns: 21080 },
  { month: "Mar 2026", totalRuns: 26770, successRuns: 25690 },
  { month: "Apr 2026", totalRuns: 28950, successRuns: 27400 },
  { month: "May 2026", totalRuns: 11280, successRuns: 10610 }, // MTD (pinned "now" = 13 May)
];
export const TENANT_CRM_CONFIGURED_COUNT = 187;
// Recent per-tenant failures — the only per-tenant granularity this mocked source carries,
// just enough to feed the "needs attention" KPI (#5). Not a run log.
export const TENANT_CRM_RECENT_FAILURES = [
  { tenantName: "Rezoni", automationName: "WhatsApp auto-reply", failedAt: "2026-05-12T18:40:00" },
  { tenantName: "Siama Skincare", automationName: "Lead round-robin", failedAt: "2026-05-13T06:10:00" },
  { tenantName: "Mahakumbh Motors", automationName: "Field sync — CarDekho", failedAt: "2026-05-11T22:15:00" },
];

/* ---- Internal-ops automations — historical months are mocked (the real seed log data only
   spans a few days around the pinned "now"); the current month is computed live from actual
   logs by computeInternalOpsMonthly() below, so it always matches what Internal Ops Logs shows. */
const INTERNAL_OPS_MONTHLY_HISTORICAL = {
  "Dec 2025": { totalRuns: 380, successRuns: 358 },
  "Jan 2026": { totalRuns: 410, successRuns: 392 },
  "Feb 2026": { totalRuns: 365, successRuns: 341 },
  "Mar 2026": { totalRuns: 432, successRuns: 410 },
  "Apr 2026": { totalRuns: 468, successRuns: 449 },
};

export function monthLabelOfWhen(whenStr) {
  const d = new Date(whenStr);
  if (isNaN(d.getTime())) return null;
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
// "Not failed" (Success + Partial) vs "Failed" — the binary split the KPI spec calls for
// (#3/#4 are framed as a straight success/failure pair, not a three-way Success/Partial/Failed
// split). A Partial run sent at least one action, so it counts toward "did not fail".
export function computeInternalOpsMonthly(logs) {
  return KPI_PERIODS.map((month) => {
    if (month === CURRENT_PERIOD) {
      const rows = logs.filter((l) => monthLabelOfWhen(l.when) === month);
      return { month, totalRuns: rows.length, successRuns: rows.filter((l) => l.overallStatus !== "Failed").length };
    }
    const hist = INTERNAL_OPS_MONTHLY_HISTORICAL[month] || { totalRuns: 0, successRuns: 0 };
    return { month, ...hist };
  });
}
export function combineMonthly(a, b) {
  return a.map((row, i) => ({ month: row.month, totalRuns: row.totalRuns + b[i].totalRuns, successRuns: row.successRuns + b[i].successRuns }));
}

// Tenants with >=1 failing automation (either source) in the last 48h — deduped by tenant,
// not by failure count, per the KPI spec ("1 tenant that needs attention, not 3").
export function computeTenantsNeedingAttention(logs, nowMs) {
  const cutoff = nowMs - 48 * 3600_000;
  const internalTenants = logs
    .filter((l) => l.overallStatus === "Failed")
    .filter((l) => { const d = new Date(l.when); return !isNaN(d.getTime()) && d.getTime() >= cutoff; })
    .map((l) => l.tenantName);
  const crmTenants = TENANT_CRM_RECENT_FAILURES
    .filter((f) => new Date(f.failedAt).getTime() >= cutoff)
    .map((f) => f.tenantName);
  return new Set([...internalTenants, ...crmTenants]);
}
