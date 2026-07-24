/* ============================================================
   SYSTEM HEALTH — the aggregated ops dashboard for the LEDSAK platform.
   Deliberately does NOT duplicate QueuesPage (job-level detail), LogsPage
   (raw log rows), or IntegrationsPage (tenant-facing provider management) —
   this module rolls those up into service-level status + links out.
   State here is local to HealthPage (see QueuesPage's pattern) — this file
   is seed data + pure helpers only, reset on refresh by design.
   "Now" reuses LOGS_NOW (data/logs.js) — the app's shared pinned clock —
   so duration/staleness math stays consistent with every other module.
   ============================================================ */
import { LOGS_NOW } from "./logs.js";

/* ---- Enums & tone maps ---- */
export const SERVICE_CATEGORIES = ["Core", "AI/ML", "Messaging", "Database", "Jobs", "Payments", "Providers", "Storage"];
export const SERVICE_STATUSES = ["Operational", "Degraded", "Down", "Maintenance"];
export const SERVICE_STATUS_TONE = { Operational: "success", Degraded: "warning", Down: "danger", Maintenance: "info" };

export const INCIDENT_SEVERITIES = ["Low", "Medium", "High", "Critical"];
export const INCIDENT_SEVERITY_TONE = { Low: "gray", Medium: "warning", High: "danger", Critical: "dangerStrong" };
export const INCIDENT_STATUSES = ["Active", "Investigating", "Resolved", "Postmortem"];
export const INCIDENT_STATUS_TONE = { Active: "danger", Investigating: "warning", Resolved: "success", Postmortem: "info" };

export const DEPLOY_STATUSES = ["Success", "Rolled Back", "In Progress", "Failed"];
export const DEPLOY_STATUS_TONE = { Success: "success", "Rolled Back": "warning", "In Progress": "info", Failed: "danger" };
export const DEPLOY_ENVIRONMENTS = ["Production", "Staging", "Development"];
export const DEPLOY_ENV_TONE = { Production: "danger", Staging: "warning", Development: "gray" };

export const DEP_STATUSES = ["OK", "Slow", "Down", "Unknown"];
export const DEP_STATUS_TONE = { OK: "success", Slow: "warning", Down: "danger", Unknown: "gray" };

export const METHOD_TONE = { GET: "success", POST: "brand", PUT: "warning", PATCH: "purple", DELETE: "danger" };

// Admin roster this module's dropdowns draw from — same pool as Security & Access
// (data/security.js SEED_ADMIN_USERS), kept as plain names here since incidents/
// deployments are local state, not linked by adminId.
export const HEALTH_ADMINS = ["Saif Khan", "Ravi Kant", "Narender", "Luv Sharma", "Gaurav Sagar", "Abhishek"];

/* ---- Time helpers ---- */
// Seed timestamps are plain "YYYY-MM-DD HH:mm" local strings — parsed manually (not via
// `new Date(str)`) so the format doesn't depend on the host's date-string parser.
export function parseHealthTs(s) {
  if (!s) return null;
  const [datePart, timePart] = s.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = (timePart || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}
export function fmtAgo(mins) {
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
export function fmtHealthTs(s) {
  const d = parseHealthTs(s);
  if (!d) return s;
  const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const h = d.getHours(), mm = String(d.getMinutes()).padStart(2, "0");
  const hh = ((h + 11) % 12) + 1, ap = h >= 12 ? "PM" : "AM";
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm} ${ap}`;
}
// "2h 14m" / "22m" — from startedAt to resolvedAt, or to LOGS_NOW if still open.
export function fmtDuration(startedAt, resolvedAt) {
  const start = parseHealthTs(startedAt);
  const end = resolvedAt ? parseHealthTs(resolvedAt) : LOGS_NOW;
  if (!start || !end) return "—";
  const mins = Math.max(0, Math.round((end - start) / 60000));
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/* ---- 30-day uptime history generator ---- */
// `overrides` maps day-index (0 = 30 days ago … 29 = today) to a non-"ok" status.
function mkHistory(overrides = {}) {
  const days = Array(30).fill("ok");
  Object.entries(overrides).forEach(([i, status]) => { days[Number(i)] = status; });
  return days;
}

/* ============================================================
   SERVICES (20, across 8 categories)
   ============================================================ */
export const SEED_SERVICES = [
  // Core
  { id: "svc-api-gateway", name: "API Gateway", category: "Core", status: "Operational", uptime30d: 99.98, latencyP95: 45, lastCheckedMinutesAgo: 2, description: "Primary API router — all inbound traffic", dependencies: ["svc-postgres-primary", "svc-redis"], icon: "Server", uptimeHistory: mkHistory() },
  { id: "svc-lead-ingestion", name: "Lead Ingestion Worker", category: "Core", status: "Operational", uptime30d: 99.95, latencyP95: null, lastCheckedMinutesAgo: 3, description: "Processes inbound leads from all providers", dependencies: ["svc-postgres-primary", "svc-redis", "svc-bullmq-workers"], icon: "Download", uptimeHistory: mkHistory({ 24: "degraded" }) },
  { id: "svc-webhook-delivery", name: "Webhook Delivery", category: "Core", status: "Operational", uptime30d: 99.90, latencyP95: 150, lastCheckedMinutesAgo: 1, description: "Outbound webhook dispatcher", dependencies: ["svc-bullmq-workers", "svc-redis"], icon: "Webhook", uptimeHistory: mkHistory({ 18: "degraded", 19: "degraded" }) },
  { id: "svc-scheduler", name: "Background Scheduler", category: "Core", status: "Operational", uptime30d: 99.92, latencyP95: null, lastCheckedMinutesAgo: 4, description: "Cron jobs, recurring tasks", dependencies: ["svc-postgres-primary", "svc-bullmq-workers"], icon: "Clock", uptimeHistory: mkHistory({ 11: "degraded" }) },

  // AI/ML
  { id: "svc-ai-enrichment", name: "AI Enrichment (GPT-4o)", category: "AI/ML", status: "Degraded", uptime30d: 97.20, latencyP95: 1240, lastCheckedMinutesAgo: 2, description: "Lead summarization + auto-reply", dependencies: ["svc-bullmq-workers"], icon: "Bot", uptimeHistory: mkHistory({ 8: "degraded", 25: "degraded", 28: "degraded", 29: "degraded" }) },
  { id: "svc-churn-ml", name: "Churn Prediction ML", category: "AI/ML", status: "Operational", uptime30d: 99.80, latencyP95: 890, lastCheckedMinutesAgo: 5, description: "Customer success scoring", dependencies: ["svc-postgres-replica"], icon: "TrendingDown", uptimeHistory: mkHistory({ 6: "degraded" }) },
  { id: "svc-lead-scoring-ml", name: "Lead Scoring ML", category: "AI/ML", status: "Operational", uptime30d: 99.90, latencyP95: 320, lastCheckedMinutesAgo: 3, description: "Lead quality scoring", dependencies: ["svc-postgres-replica"], icon: "Target", uptimeHistory: mkHistory() },

  // Messaging
  { id: "svc-whatsapp", name: "WhatsApp Business API", category: "Messaging", status: "Operational", uptime30d: 99.92, latencyP95: 210, lastCheckedMinutesAgo: 2, description: "Template + session messages", dependencies: ["svc-bullmq-workers"], icon: "MessageCircle", uptimeHistory: mkHistory({ 14: "degraded" }) },
  { id: "svc-sms-gateway", name: "SMS Gateway (MSG91)", category: "Messaging", status: "Operational", uptime30d: 99.88, latencyP95: 180, lastCheckedMinutesAgo: 4, description: "OTP + notifications", dependencies: ["svc-bullmq-workers"], icon: "MessageSquare", uptimeHistory: mkHistory({ 20: "degraded" }) },
  { id: "svc-email-delivery", name: "Email Delivery (Postmark)", category: "Messaging", status: "Operational", uptime30d: 99.95, latencyP95: 95, lastCheckedMinutesAgo: 3, description: "Transactional email", dependencies: ["svc-bullmq-workers"], icon: "Mail", uptimeHistory: mkHistory() },

  // Database
  { id: "svc-postgres-primary", name: "PostgreSQL Primary", category: "Database", status: "Operational", uptime30d: 99.99, latencyP95: 12, lastCheckedMinutesAgo: 1, description: "Main transactional DB", dependencies: [], icon: "Database", uptimeHistory: mkHistory({ 15: "maintenance" }) },
  { id: "svc-postgres-replica", name: "PostgreSQL Replica", category: "Database", status: "Operational", uptime30d: 99.99, latencyP95: 15, lastCheckedMinutesAgo: 1, description: "Read replica, 0.3s lag", dependencies: ["svc-postgres-primary"], icon: "Copy", uptimeHistory: mkHistory({ 15: "maintenance" }) },
  { id: "svc-redis", name: "Redis Cache", category: "Database", status: "Operational", uptime30d: 99.97, latencyP95: 2, lastCheckedMinutesAgo: 1, description: "Session store + query cache", dependencies: [], icon: "Zap", uptimeHistory: mkHistory({ 22: "degraded" }) },

  // Jobs
  { id: "svc-bullmq-workers", name: "BullMQ Workers", category: "Jobs", status: "Operational", uptime30d: 99.91, latencyP95: null, lastCheckedMinutesAgo: 2, description: "Job processing (→ Queue Monitor for detail)", dependencies: ["svc-postgres-primary", "svc-redis"], icon: "Layers", uptimeHistory: mkHistory({ 12: "degraded", 13: "degraded" }) },

  // Payments
  { id: "svc-razorpay", name: "Razorpay Payments", category: "Payments", status: "Operational", uptime30d: 99.96, latencyP95: 340, lastCheckedMinutesAgo: 3, description: "Payment verification + webhooks", dependencies: ["svc-postgres-primary"], icon: "CreditCard", uptimeHistory: mkHistory({ 9: "degraded" }) },

  // Providers
  { id: "svc-carwale", name: "CarWale Feed", category: "Providers", status: "Down", uptime30d: 97.10, latencyP95: null, lastCheckedMinutesAgo: 1560, description: "Lead ingestion — automotive. Last data 26h ago", dependencies: ["svc-bullmq-workers"], icon: "Car", uptimeHistory: mkHistory({ 24: "down", 25: "down", 26: "down", 27: "down", 28: "down", 29: "down" }) },
  { id: "svc-cardekho", name: "CarDekho Feed", category: "Providers", status: "Operational", uptime30d: 99.85, latencyP95: null, lastCheckedMinutesAgo: 8, description: "Lead ingestion — automotive. 8m ago", dependencies: ["svc-bullmq-workers"], icon: "Car", uptimeHistory: mkHistory({ 17: "degraded" }) },
  { id: "svc-cliniceo", name: "Cliniceo EMR Bridge", category: "Providers", status: "Operational", uptime30d: 99.60, latencyP95: 520, lastCheckedMinutesAgo: 5, description: "Patient sync for clinic tenants", dependencies: ["svc-postgres-primary"], icon: "Stethoscope", uptimeHistory: mkHistory({ 10: "degraded", 21: "degraded" }) },

  // Storage
  { id: "svc-s3", name: "File Storage (S3)", category: "Storage", status: "Operational", uptime30d: 99.99, latencyP95: 28, lastCheckedMinutesAgo: 2, description: "Documents, exports, attachments", dependencies: [], icon: "HardDrive", uptimeHistory: mkHistory() },
  { id: "svc-cdn", name: "CDN (CloudFront)", category: "Storage", status: "Operational", uptime30d: 99.99, latencyP95: 8, lastCheckedMinutesAgo: 1, description: "Static assets, images", dependencies: ["svc-s3"], icon: "Globe", uptimeHistory: mkHistory() },
];

/* ============================================================
   INCIDENTS (6)
   ============================================================ */
export const SEED_INCIDENTS = [
  {
    id: "inc-1",
    title: "AI Enrichment — elevated latency and timeout errors",
    description: "GPT-4o responses exceeding 3s consistently since 08:28. Lead enrichment queue backing up. Cause suspected: OpenAI rate limiting on our tier.",
    severity: "Medium", status: "Active",
    affectedServices: ["svc-ai-enrichment", "svc-lead-scoring-ml"],
    startedAt: "2026-05-13 08:28", resolvedAt: null,
    owner: "Ravi Kant", createdBy: "Monitoring",
    timeline: [
      { timestamp: "2026-05-13 08:28", actor: "Monitoring", text: "Incident opened — AI Enrichment latency exceeded 3s threshold" },
      { timestamp: "2026-05-13 08:30", actor: "System", text: "Auto-assigned to Ravi Kant (Engineering Admin on-call)" },
      { timestamp: "2026-05-13 08:35", actor: "Ravi Kant", text: "Investigating — OpenAI dashboard shows elevated p95 on their side" },
      { timestamp: "2026-05-13 08:42", actor: "Ravi Kant", text: "Root cause confirmed: OpenAI rate limit on GPT-4o tier. Evaluating throttle backoff." },
      { timestamp: "2026-05-13 09:15", actor: "Ravi Kant", text: "Severity escalated to Medium — lead enrichment queue at 142 pending" },
    ],
  },
  {
    id: "inc-2",
    title: "CarWale feed interruption",
    description: "CarWale lead feed stopped delivering data. No inbound leads from this source since interruption began.",
    severity: "Low", status: "Resolved",
    affectedServices: ["svc-carwale"],
    startedAt: "2026-05-11 07:00", resolvedAt: "2026-05-11 11:10",
    owner: "Narender", createdBy: "Monitoring",
    timeline: [
      { timestamp: "2026-05-11 07:00", actor: "Monitoring", text: "Incident opened — CarWale feed returning no data" },
      { timestamp: "2026-05-11 07:20", actor: "Narender", text: "Confirmed with CarWale support — their export pipeline is down on their end" },
      { timestamp: "2026-05-11 09:45", actor: "Narender", text: "CarWale support estimates fix within 2 hours" },
      { timestamp: "2026-05-11 11:10", actor: "Narender", text: "Feed resumed — backfilled leads from CarWale's replay window. Resolved." },
    ],
  },
  {
    id: "inc-3",
    title: "Redis OOM — cache flush",
    description: "Redis hit its memory ceiling and evicted the session cache, causing a burst of re-logins platform-wide.",
    severity: "High", status: "Resolved",
    affectedServices: ["svc-redis", "svc-api-gateway"],
    startedAt: "2026-05-08 03:12", resolvedAt: "2026-05-08 03:34",
    owner: "Ravi Kant", createdBy: "Monitoring",
    timeline: [
      { timestamp: "2026-05-08 03:12", actor: "Monitoring", text: "Incident opened — Redis memory usage at 100%, evictions detected" },
      { timestamp: "2026-05-08 03:15", actor: "System", text: "Auto-assigned to Ravi Kant (Engineering Admin on-call)" },
      { timestamp: "2026-05-08 03:20", actor: "Ravi Kant", text: "Severity escalated to High — session cache flushed, elevated login traffic" },
      { timestamp: "2026-05-08 03:28", actor: "Ravi Kant", text: "Increased Redis memory limit and restarted with eviction policy tuned" },
      { timestamp: "2026-05-08 03:34", actor: "Ravi Kant", text: "Memory stable at 45%, login traffic normalized. Resolved." },
    ],
  },
  {
    id: "inc-4",
    title: "WhatsApp rate limit",
    description: "WhatsApp Business API began rejecting outbound template messages after a sudden send-volume spike from one tenant.",
    severity: "Low", status: "Resolved",
    affectedServices: ["svc-whatsapp"],
    startedAt: "2026-05-03 12:00", resolvedAt: "2026-05-03 12:45",
    owner: "Luv Sharma", createdBy: "Monitoring",
    timeline: [
      { timestamp: "2026-05-03 12:00", actor: "Monitoring", text: "Incident opened — WhatsApp API returning 429 rate-limit errors" },
      { timestamp: "2026-05-03 12:10", actor: "Luv Sharma", text: "Traced to a single tenant's bulk broadcast — throttled that tenant's send queue" },
      { timestamp: "2026-05-03 12:45", actor: "Luv Sharma", text: "Send rate back within Meta's allowance. Resolved." },
    ],
  },
  {
    id: "inc-5",
    title: "Scheduled DB maintenance",
    description: "Planned PostgreSQL Primary maintenance window for a minor-version patch and index rebuild.",
    severity: "Low", status: "Postmortem",
    affectedServices: ["svc-postgres-primary", "svc-postgres-replica"],
    startedAt: "2026-04-28 02:00", resolvedAt: "2026-04-28 02:35",
    owner: "Narender", createdBy: "Narender",
    timeline: [
      { timestamp: "2026-04-28 02:00", actor: "Narender", text: "Maintenance window started — PostgreSQL Primary taken to read-only" },
      { timestamp: "2026-04-28 02:18", actor: "Narender", text: "Minor-version patch applied, index rebuild in progress" },
      { timestamp: "2026-04-28 02:35", actor: "Narender", text: "Maintenance complete, writes re-enabled. No customer impact observed." },
      { timestamp: "2026-04-29 10:00", actor: "Narender", text: "Postmortem: window ran within the 45-minute budget, no follow-ups required." },
    ],
  },
  {
    id: "inc-6",
    title: "Lead ingestion spike — CarDekho bulk import",
    description: "A tenant's CarDekho bulk CSV import created a sudden spike in lead-ingestion volume, backing up the queue.",
    severity: "Medium", status: "Resolved",
    affectedServices: ["svc-lead-ingestion", "svc-bullmq-workers"],
    startedAt: "2026-04-22 16:00", resolvedAt: "2026-04-22 17:15",
    owner: "Narender", createdBy: "Monitoring",
    timeline: [
      { timestamp: "2026-04-22 16:00", actor: "Monitoring", text: "Incident opened — Lead Ingestion Worker backlog exceeding normal range" },
      { timestamp: "2026-04-22 16:10", actor: "Narender", text: "Identified source — Urban Autohub's bulk CarDekho CSV import (18k rows)" },
      { timestamp: "2026-04-22 16:20", actor: "Narender", text: "Scaled ingestion workers temporarily to clear backlog faster" },
      { timestamp: "2026-04-22 17:15", actor: "Narender", text: "Backlog cleared, workers scaled back down. Resolved." },
    ],
  },
];

/* ============================================================
   DEPLOYMENTS (8)
   ============================================================ */
export const SEED_DEPLOYMENTS = [
  { id: "dep-1", version: "v2.14.3", environment: "Production", deployedBy: "Narender", timestamp: "2026-05-13 08:15", duration: "68s", status: "Success", services: ["API Gateway", "Lead Ingestion Worker"], changelog: "Churn prediction model v2 update, improved accuracy by 12%. Minor fix to lead dedup logic.", linkedIncidentId: "inc-1", postDeployHealth: { before: { "API Latency (P95)": "320ms", "Error Rate": "0.04%", "Queue Backlog": "0" }, after: { "API Latency (P95)": "380ms ⚠", "Error Rate": "0.08% ⚠", "Queue Backlog": "0" } } },
  { id: "dep-2", version: "v2.14.2", environment: "Production", deployedBy: "Ravi Kant", timestamp: "2026-05-12 14:30", duration: "52s", status: "Success", services: ["Lead Ingestion Worker", "PostgreSQL Primary"], changelog: "Lead sync performance fix — resolved N+1 query pattern in the bulk import path.", linkedIncidentId: null, postDeployHealth: { before: { "API Latency (P95)": "410ms", "Error Rate": "0.06%", "Queue Backlog": "12" }, after: { "API Latency (P95)": "320ms", "Error Rate": "0.05%", "Queue Backlog": "0" } } },
  { id: "dep-3", version: "v2.14.2-rc1", environment: "Staging", deployedBy: "Ravi Kant", timestamp: "2026-05-12 09:00", duration: "61s", status: "Success", services: ["Lead Ingestion Worker"], changelog: "Release candidate testing for v2.14.2 — staging validation only.", linkedIncidentId: null, postDeployHealth: { before: { "API Latency (P95)": "300ms", "Error Rate": "0.03%", "Queue Backlog": "0" }, after: { "API Latency (P95)": "295ms", "Error Rate": "0.03%", "Queue Backlog": "0" } } },
  { id: "dep-4", version: "v2.14.1", environment: "Production", deployedBy: "Narender", timestamp: "2026-05-10 11:00", duration: "74s", status: "Rolled Back", services: ["AI Enrichment (GPT-4o)"], changelog: "Memory leak in enrichment — reverted after 20 min once worker memory was seen climbing unbounded.", linkedIncidentId: null, postDeployHealth: { before: { "API Latency (P95)": "1180ms", "Error Rate": "1.10%", "Queue Backlog": "8" }, after: { "API Latency (P95)": "1180ms", "Error Rate": "1.10%", "Queue Backlog": "8" } } },
  { id: "dep-5", version: "v2.14.0", environment: "Production", deployedBy: "Narender", timestamp: "2026-05-08 10:00", duration: "180s", status: "Success", services: ["API Gateway", "Background Scheduler", "PostgreSQL Primary"], changelog: "Major: custom entities v2, automation rules engine.", linkedIncidentId: null, postDeployHealth: { before: { "API Latency (P95)": "350ms", "Error Rate": "0.05%", "Queue Backlog": "0" }, after: { "API Latency (P95)": "365ms", "Error Rate": "0.05%", "Queue Backlog": "0" } } },
  { id: "dep-6", version: "v2.13.9", environment: "Production", deployedBy: "Ravi Kant", timestamp: "2026-05-05 15:20", duration: "58s", status: "Success", services: ["WhatsApp Business API"], changelog: "WhatsApp template approval flow — auto-syncs template status from Meta.", linkedIncidentId: null, postDeployHealth: { before: { "API Latency (P95)": "340ms", "Error Rate": "0.06%", "Queue Backlog": "0" }, after: { "API Latency (P95)": "330ms", "Error Rate": "0.05%", "Queue Backlog": "0" } } },
  { id: "dep-7", version: "v2.13.8-hotfix", environment: "Production", deployedBy: "Narender", timestamp: "2026-05-03 02:10", duration: "34s", status: "Success", services: ["Lead Ingestion Worker"], changelog: "Emergency: fix lead assignment null pointer causing dropped assignments.", linkedIncidentId: null, postDeployHealth: { before: { "API Latency (P95)": "310ms", "Error Rate": "2.40%", "Queue Backlog": "4" }, after: { "API Latency (P95)": "305ms", "Error Rate": "0.10%", "Queue Backlog": "0" } } },
  { id: "dep-8", version: "v2.13.8", environment: "Production", deployedBy: "Ravi Kant", timestamp: "2026-05-02 18:45", duration: "12s", status: "Failed", services: ["API Gateway"], changelog: "Build failed — reverted to v2.13.7.", linkedIncidentId: null, postDeployHealth: { before: { "API Latency (P95)": "300ms", "Error Rate": "0.04%", "Queue Backlog": "0" }, after: { "API Latency (P95)": "300ms", "Error Rate": "0.04%", "Queue Backlog": "0" } } },
];

/* ============================================================
   EXTERNAL DEPENDENCIES (10)
   ============================================================ */
export const SEED_DEPENDENCIES = [
  { id: "dep-openai", name: "OpenAI API (GPT-4o)", category: "AI Provider", status: "Slow", currentLatency: 1240, baselineLatency: 400, lastCheckedMinutesAgo: 2, statusPageUrl: "https://status.openai.com", dependents: ["AI Enrichment", "Lead Scoring", "Auto-reply Drafts"], note: "Elevated latency since 08:28 — correlates with AI Enrichment degradation" },
  { id: "dep-razorpay", name: "Razorpay API", category: "Payments", status: "OK", currentLatency: 340, baselineLatency: 300, lastCheckedMinutesAgo: 3, statusPageUrl: "https://status.razorpay.com", dependents: ["Payments", "Subscription Billing"], note: "" },
  { id: "dep-whatsapp", name: "WhatsApp Cloud API", category: "Messaging", status: "OK", currentLatency: 210, baselineLatency: 200, lastCheckedMinutesAgo: 2, statusPageUrl: "https://developers.facebook.com/status/dashboard/", dependents: ["Messaging", "Lead Notifications"], note: "" },
  { id: "dep-msg91", name: "MSG91 (SMS)", category: "Messaging", status: "OK", currentLatency: 180, baselineLatency: 160, lastCheckedMinutesAgo: 4, statusPageUrl: "https://status.msg91.com", dependents: ["SMS Notifications", "OTP"], note: "" },
  { id: "dep-s3", name: "AWS S3", category: "Cloud", status: "OK", currentLatency: 28, baselineLatency: 25, lastCheckedMinutesAgo: 2, statusPageUrl: "https://health.aws.amazon.com/health/status", dependents: ["File Storage", "Exports"], note: "" },
  { id: "dep-carwale", name: "CarWale API", category: "Lead Provider", status: "Down", currentLatency: null, baselineLatency: 450, lastCheckedMinutesAgo: 1560, statusPageUrl: "https://www.carwale.com", dependents: ["Lead Ingestion (automotive)"], note: "Unreachable for 26h — export pipeline down on CarWale's end (see resolved incident from 11 May)" },
  { id: "dep-cardekho", name: "CarDekho API", category: "Lead Provider", status: "OK", currentLatency: 350, baselineLatency: 320, lastCheckedMinutesAgo: 8, statusPageUrl: "https://www.cardekho.com", dependents: ["Lead Ingestion (automotive)"], note: "" },
  { id: "dep-cliniceo", name: "Cliniceo EMR API", category: "Lead Provider", status: "OK", currentLatency: 520, baselineLatency: 480, lastCheckedMinutesAgo: 5, statusPageUrl: "https://cliniceo.com", dependents: ["Patient Sync (clinic tenants)"], note: "" },
  { id: "dep-postmark", name: "Postmark (SMTP)", category: "Cloud", status: "OK", currentLatency: 95, baselineLatency: 90, lastCheckedMinutesAgo: 3, statusPageUrl: "https://status.postmarkapp.com", dependents: ["Email Delivery"], note: "" },
  { id: "dep-maps", name: "Google Maps API", category: "Cloud", status: "OK", currentLatency: 120, baselineLatency: 100, lastCheckedMinutesAgo: 4, statusPageUrl: "https://status.cloud.google.com", dependents: ["Branch Geolocation"], note: "" },
];
export const DEPENDENCY_CATEGORIES = ["AI Provider", "Payments", "Messaging", "Cloud", "Lead Provider"];

/* ============================================================
   API PERFORMANCE
   ============================================================ */
export const API_PERFORMANCE = {
  requests24h: 142800, avgResponseTime: 142, p95Latency: 380, p99Latency: 1240,
  errorRate: 0.08, peakThroughput: 2400,
};

export const SLOWEST_ENDPOINTS = [
  { method: "POST", endpoint: "/api/v1/ai/enrich", avgLatency: 1240, p95: 2800, calls24h: 4830, errorPct: 2.1 },
  { method: "GET", endpoint: "/api/v1/analytics/mrr", avgLatency: 890, p95: 1500, calls24h: 342, errorPct: 0.0 },
  { method: "POST", endpoint: "/api/v1/leads/import", avgLatency: 680, p95: 1200, calls24h: 12400, errorPct: 0.4 },
  { method: "POST", endpoint: "/api/v1/whatsapp/send", avgLatency: 210, p95: 450, calls24h: 48200, errorPct: 0.3 },
  { method: "GET", endpoint: "/api/v1/leads", avgLatency: 32, p95: 85, calls24h: 68400, errorPct: 0.0 },
  { method: "POST", endpoint: "/api/v1/auth/login", avgLatency: 180, p95: 340, calls24h: 890, errorPct: 3.2 },
  { method: "PUT", endpoint: "/api/v1/leads/:id", avgLatency: 88, p95: 210, calls24h: 34200, errorPct: 0.1 },
];

export const DB_METRICS = {
  primaryConnections: { current: 42, max: 100 },
  replicaLag: "0.3s",
  queryP95: 28,
  slowQueries24h: 3,
  cacheHitRate: 94.2,
  redisMemory: { current: 1.8, max: 4.0 },
};

export const JOBS_SUMMARY = { completed24h: 14, waiting: 0, failed: 0 };

/* ============================================================
   HELPERS
   ============================================================ */
export function computeOverallStatus(services) {
  if (services.some((s) => s.status === "Down")) return "Partial Outage";
  if (services.some((s) => s.status === "Degraded")) return "Partial Degradation";
  if (services.some((s) => s.status === "Maintenance")) return "Maintenance";
  return "All Systems Operational";
}
export function overallStatusTone(status) {
  if (status.includes("Outage")) return "danger";
  if (status.includes("Degradation")) return "warning";
  if (status.includes("Maintenance")) return "info";
  return "success";
}
export function computeAvgUptime(services) {
  return (services.reduce((sum, s) => sum + s.uptime30d, 0) / services.length).toFixed(2);
}
export function countActiveIncidents(incidents) {
  return incidents.filter((i) => i.status === "Active" || i.status === "Investigating").length;
}
export function countResolvedThisWeek(incidents) {
  const weekAgo = LOGS_NOW.getTime() - 7 * 24 * 3600_000;
  return incidents.filter((i) => i.resolvedAt && parseHealthTs(i.resolvedAt).getTime() >= weekAgo).length;
}
// "YYYY-MM-DD HH:mm" for LOGS_NOW — used to timestamp new timeline entries the same way
// the seed data is formatted.
export function nowHealthTs() {
  const d = LOGS_NOW;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
let _hid = 100;
export const nextHealthId = () => ++_hid;
