/* ============================================================
   LOGS & AUDIT — data module for all 7 log types
   Self-contained like data/leads.js: owns its own seed data,
   masking, storage, export, and health-rollup helpers. Mutable
   log state (error resolution, webhook retries, integration
   re-syncs, security/audit annotations) is persisted to
   localStorage and owned by LogsPage, not the global store —
   these are high-volume, page-scoped records, not entities the
   rest of the app needs to read.
   ============================================================ */
import { MONTHS_SHORT } from "../lib/format.js";

export const LOG_LEVELS = ["Debug", "Info", "Warning", "Error", "Critical"];
export const LEVEL_TONE = { Debug: "gray", Info: "brand", Warning: "warning", Error: "danger", Critical: "dangerStrong" };

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
export const METHOD_TONE = { GET: "success", POST: "brand", PUT: "warning", PATCH: "purple", DELETE: "danger" };

export function statusRangeTone(code) {
  if (code >= 500) return "danger";
  if (code >= 400) return "warning";
  if (code >= 300) return "gray";
  return "success";
}
export const statusRange = (code) => (code >= 500 ? "5xx" : code >= 400 ? "4xx" : code >= 300 ? "3xx" : "2xx");

export const DELIVERY_STATUSES = ["Delivered", "Failed", "Pending", "Retrying"];
export const DELIVERY_TONE = { Delivered: "success", Failed: "danger", Pending: "gray", Retrying: "warning" };

export const INTEGRATION_STATUSES = ["Success", "Partial", "Failed"];
export const INTEGRATION_STATUS_TONE = { Success: "success", Partial: "warning", Failed: "danger" };
export const INTEGRATION_HEALTH_TONE = { Connected: "success", Degraded: "warning", Down: "danger" };

export const SECURITY_OUTCOMES = ["Success", "Failure", "Blocked"];
export const OUTCOME_TONE = { Success: "success", Failure: "warning", Blocked: "danger" };

export const RESOLUTION_STATUSES = ["New", "Acknowledged", "Resolved"];
export const RESOLUTION_TONE = { New: "danger", Acknowledged: "warning", Resolved: "success" };

export const LOG_TABS = [
  { id: "system", label: "System" },
  { id: "api", label: "API" },
  { id: "webhook", label: "Webhook" },
  { id: "integration", label: "Integration" },
  { id: "security", label: "Security" },
  { id: "error", label: "Error" },
  { id: "audit", label: "Admin Audit" },
];

export const DATE_PRESETS = ["Last 1h", "Last 6h", "Last 24h", "Last 7d", "Last 30d", "Custom"];
// App-wide "now" is pinned to 13 May 2026 (see data/constants.js NOW / lib/format.js TODAY_DATE)
// — logs use the same fixed instant so preset ranges ("Last 1h" etc.) filter deterministically.
export const LOGS_NOW = new Date(2026, 4, 13, 10, 45, 0);
export function presetRangeMs(preset) {
  const end = LOGS_NOW.getTime();
  const hours = { "Last 1h": 1, "Last 6h": 6, "Last 24h": 24, "Last 7d": 24 * 7, "Last 30d": 24 * 30 }[preset];
  return hours ? { start: end - hours * 3600_000, end } : null;
}
export function fmtLogTime(iso) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0"), m = String(d.getMinutes()).padStart(2, "0"), s = String(d.getSeconds()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} · ${h}:${m}:${s}`;
}

/* ---- Sensitive-field masking (applies to all rawPayload/body fields) ---- */
const SENSITIVE_KEY = /^(password|token|secret|authorization|card_number|cvv|ssn)$|_secret$|_token$/i;
export function maskSensitive(value) {
  if (Array.isArray(value)) return value.map(maskSensitive);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, SENSITIVE_KEY.test(k) ? "••••••••" : maskSensitive(v)]));
  }
  return value;
}

/* ---- Retention policy (display-only — see docs/features/logs.md) ---- */
export const RETENTION_POLICY = {
  system: { hot: "30 days", cold: "6 months", purge: "Auto" },
  api: { hot: "30 days", cold: "3 months", purge: "Auto" },
  webhook: { hot: "60 days", cold: "6 months", purge: "Auto" },
  integration: { hot: "60 days", cold: "6 months", purge: "Auto" },
  security: { hot: "90 days", cold: "2 years", purge: "Manual only" },
  error: { hot: "60 days", cold: "1 year", purge: "Auto" },
  audit: { hot: "1 year", cold: "7 years", purge: "Never" },
};

/* ---- RBAC matrix (display + gate — see Cross-Cutting Requirements) ---- */
export const LOG_ROLE_ACCESS = {
  "Super Admin": new Set(["system", "api", "webhook", "integration", "security", "error", "audit"]),
  "Ops / Engineering": new Set(["system", "api", "webhook", "integration", "error"]),
  "CSM / Support": new Set(["webhook", "integration"]),
  "Security / Audit": new Set(["security", "audit"]),
};

/* ---- Admin Audit action taxonomy ---- */
export const ACTION_TAXONOMY = {
  "User Management": ["user.created", "user.deleted", "user.suspended", "user.reactivated", "user.role_changed", "user.password_reset", "user.invited", "user.impersonated"],
  "Tenant Management": ["tenant.created", "tenant.suspended", "tenant.reactivated", "tenant.deleted", "tenant.seats_added", "tenant.trial_extended", "tenant.plan_assigned"],
  Billing: ["plan.created", "plan.updated", "plan.archived", "plan.duplicated", "subscription.created", "subscription.updated", "subscription.cancelled", "discount.applied", "invoice.retried", "addon.updated"],
  Security: ["role.created", "role.updated", "role.deleted", "permission.granted", "permission.revoked", "policy.updated", "session.revoked", "2fa.enforced"],
  Data: ["data.exported", "data.imported", "data.deleted", "report.generated", "report.downloaded"],
  Configuration: ["setting.updated", "feature_flag.toggled", "integration.connected", "integration.disconnected", "template.updated", "automation.enabled", "automation.disabled"],
};
export const ACTION_CATEGORY_OF = Object.fromEntries(
  Object.entries(ACTION_TAXONOMY).flatMap(([cat, actions]) => actions.map((a) => [a, cat]))
);
// Actions dangerous enough to be alert-ready (see Alerting: architecture-ready section) —
// schema/UI already flags them so an alert rule can attach later without a refactor.
export const SENSITIVE_ADMIN_ACTIONS = new Set(["user.deleted", "user.role_changed", "data.exported", "tenant.deleted"]);

/* ============================================================
   SEED DATA — 8-15 entries per type, LEDSAK-realistic
   ============================================================ */
export const SEED_SYSTEM_LOGS = [
  { id: "sys-1", timestamp: "2026-05-13T09:15:22.041Z", level: "Info", source: "scheduler", eventType: "job.completed", actor: "system", message: "Daily lead-sync completed: 14,230 records in 42s", durationMs: 42000, correlationId: "req-77f2a1", tenantId: null, metadata: { job: "daily-lead-sync", recordCount: 14230 }, rawPayload: { job: "daily-lead-sync", records: 14230, batches: 12 } },
  { id: "sys-2", timestamp: "2026-05-13T09:14:01.120Z", level: "Info", source: "deployer", eventType: "deploy.finished", actor: "system", message: "v2.14.3 deployed to production (3 pods)", durationMs: 68000, correlationId: "req-deploy-14-3", tenantId: null, metadata: { version: "v2.14.3", pods: 3 }, rawPayload: { version: "v2.14.3", pods: 3, region: "ap-south-1" } },
  { id: "sys-3", timestamp: "2026-05-13T09:12:30.880Z", level: "Warning", source: "cache", eventType: "cache.cleared", actor: "Saif Khan", message: "Redis cache flushed — cold start expected", durationMs: null, correlationId: null, tenantId: null, metadata: { cache: "redis-primary" }, rawPayload: { cache: "redis-primary", reason: "manual flush" } },
  { id: "sys-4", timestamp: "2026-05-13T09:10:05.330Z", level: "Info", source: "config", eventType: "config.updated", actor: "Saif Khan", message: "Feature flag 'AI Churn' enabled globally", durationMs: null, correlationId: null, tenantId: null, metadata: { key: "feature.ai_churn", value: true }, rawPayload: { key: "feature.ai_churn", oldValue: false, newValue: true } },
  { id: "sys-5", timestamp: "2026-05-13T09:08:44.210Z", level: "Error", source: "worker", eventType: "job.failed", actor: "system", message: "WhatsApp bulk-send failed: rate limit exceeded", durationMs: 12400, correlationId: "req-77f2a1", tenantId: 6, metadata: { job: "whatsapp-bulk-send", tenant: "Varun Group" }, rawPayload: { job: "whatsapp-bulk-send", error: "429 rate_limit_exceeded", queued: 320, sent: 84 } },
  { id: "sys-6", timestamp: "2026-05-13T08:55:01.770Z", level: "Info", source: "auth", eventType: "session.cleanup", actor: "system", message: "Expired 1,204 sessions older than 12h", durationMs: 3200, correlationId: null, tenantId: null, metadata: { expired: 1204 }, rawPayload: { expired: 1204, thresholdHours: 12 } },
  { id: "sys-7", timestamp: "2026-05-13T08:30:00.001Z", level: "Info", source: "scheduler", eventType: "job.started", actor: "system", message: "Nightly MRR calculation triggered", durationMs: null, correlationId: "req-mrr-calc-1", tenantId: null, metadata: { job: "mrr-calc" }, rawPayload: { job: "mrr-calc", tenants: 15 } },
  { id: "sys-8", timestamp: "2026-05-13T08:15:12.500Z", level: "Critical", source: "infra", eventType: "service.unhealthy", actor: "system", message: "AI Enrichment service: 3 consecutive health failures", durationMs: null, correlationId: "req-ai-oom-1", tenantId: null, metadata: { service: "ai-enrichment", failures: 3 }, rawPayload: { service: "ai-enrichment", failures: 3, lastError: "OOM killed" } },
  { id: "sys-9", timestamp: "2026-05-12T22:05:40.900Z", level: "Info", source: "scheduler", eventType: "job.completed", actor: "system", message: "Nightly MRR calculation completed", durationMs: 5100, correlationId: "req-mrr-calc-1", tenantId: null, metadata: { job: "mrr-calc" }, rawPayload: { job: "mrr-calc", totalMRR: 8452167 } },
  { id: "sys-10", timestamp: "2026-05-12T18:40:10.300Z", level: "Warning", source: "worker", eventType: "job.retried", actor: "system", message: "CarDekho lead-import retried (attempt 2/3)", durationMs: 8100, correlationId: "req-cardekho-retry", tenantId: 11, metadata: { job: "cardekho-import", attempt: 2 }, rawPayload: { job: "cardekho-import", attempt: 2, reason: "timeout" } },
];

export const SEED_API_LOGS = [
  { id: "api-1", timestamp: "2026-05-13T10:42:18.330Z", level: "Info", source: "api-gateway", method: "POST", endpoint: "/api/v1/leads/import", statusCode: 500, responseTimeMs: 145, requestSize: 12480, responseSize: 210, clientId: "app:mobile-sdk", authenticatedUser: "tenant:varun-group", sourceIp: "103.21.244.12", userAgent: "LedsakSDK/2.1 (iOS 17.4)", correlationId: "req-77f2a1", tenantId: 6, message: "POST /api/v1/leads/import → 500", requestBody: { tenant_id: 6, source: "carwale", token: "sk_live_abc123", records: 142 }, responseBody: { error: "internal_error", correlation_id: "req-77f2a1" } },
  { id: "api-2", timestamp: "2026-05-13T10:41:55.100Z", level: "Info", source: "api-gateway", method: "GET", endpoint: "/api/v1/leads?page=2", statusCode: 200, responseTimeMs: 32, requestSize: 0, responseSize: 8420, clientId: "app:web-dashboard", authenticatedUser: "user:rahul@medlinks.in", sourceIp: "49.36.88.4", userAgent: "Mozilla/5.0 (Windows NT 10.0; Chrome/124)", correlationId: null, tenantId: 3, message: "GET /api/v1/leads?page=2 → 200", requestBody: null, responseBody: { count: 50, page: 2 } },
  { id: "api-3", timestamp: "2026-05-13T10:41:30.880Z", level: "Info", source: "api-gateway", method: "PUT", endpoint: "/api/v1/leads/8823", statusCode: 200, responseTimeMs: 88, requestSize: 640, responseSize: 640, clientId: "app:web-dashboard", authenticatedUser: "user:rahul@medlinks.in", sourceIp: "49.36.88.4", userAgent: "Mozilla/5.0 (Windows NT 10.0; Chrome/124)", correlationId: null, tenantId: 3, message: "PUT /api/v1/leads/8823 → 200", requestBody: { status: "Contacted" }, responseBody: { id: 8823, status: "Contacted" } },
  { id: "api-4", timestamp: "2026-05-13T10:40:12.220Z", level: "Warning", source: "api-gateway", method: "POST", endpoint: "/api/v1/auth/login", statusCode: 401, responseTimeMs: 210, requestSize: 96, responseSize: 64, clientId: "app:mobile-sdk", authenticatedUser: null, sourceIp: "185.42.11.9", userAgent: "LedsakSDK/2.1 (Android 14)", correlationId: "req-login-401-1", tenantId: null, message: "POST /api/v1/auth/login → 401", requestBody: { email: "unknown@example.com", password: "••••••••" }, responseBody: { error: "invalid_credentials" } },
  { id: "api-5", timestamp: "2026-05-13T10:39:50.010Z", level: "Warning", source: "api-gateway", method: "DELETE", endpoint: "/api/v1/users/412", statusCode: 403, responseTimeMs: 18, requestSize: 0, responseSize: 58, clientId: "key:partner-api", authenticatedUser: "key:partner-api", sourceIp: "92.12.55.3", userAgent: "curl/8.4.0", correlationId: null, tenantId: 11, message: "DELETE /api/v1/users/412 → 403", requestBody: null, responseBody: { error: "insufficient_scope" } },
  { id: "api-6", timestamp: "2026-05-13T10:38:22.770Z", level: "Info", source: "api-gateway", method: "GET", endpoint: "/api/v1/analytics/mrr", statusCode: 200, responseTimeMs: 1240, requestSize: 0, responseSize: 4200, clientId: "app:web-dashboard", authenticatedUser: "user:saif@ledsak.com", sourceIp: "103.21.244.9", userAgent: "Mozilla/5.0 (Macintosh; Chrome/124)", correlationId: null, tenantId: null, message: "GET /api/v1/analytics/mrr → 200", requestBody: null, responseBody: { mrr: 8452167 } },
  { id: "api-7", timestamp: "2026-05-13T10:37:01.550Z", level: "Info", source: "api-gateway", method: "POST", endpoint: "/api/v1/webhooks/test", statusCode: 200, responseTimeMs: 890, requestSize: 320, responseSize: 40, clientId: "key:internal-test", authenticatedUser: "user:saif@ledsak.com", sourceIp: "10.0.0.1", userAgent: "internal-tooling/1.0", correlationId: null, tenantId: null, message: "POST /api/v1/webhooks/test → 200", requestBody: { url: "https://hooks.aryaanya.com/lsk" }, responseBody: { ok: true } },
  { id: "api-8", timestamp: "2026-05-13T10:35:44.100Z", level: "Info", source: "api-gateway", method: "GET", endpoint: "/api/v1/health", statusCode: 200, responseTimeMs: 4, requestSize: 0, responseSize: 22, clientId: "app:monitoring", authenticatedUser: "key:monitoring", sourceIp: "10.0.0.5", userAgent: "uptime-checker/3.2", correlationId: null, tenantId: null, message: "GET /api/v1/health → 200", requestBody: null, responseBody: { status: "ok" } },
  { id: "api-9", timestamp: "2026-05-13T10:30:11.400Z", level: "Error", source: "api-gateway", method: "POST", endpoint: "/api/v1/payments/verify", statusCode: 504, responseTimeMs: 30020, requestSize: 380, responseSize: 0, clientId: "app:web-dashboard", authenticatedUser: "user:luv@ledsak.com", sourceIp: "103.21.244.9", userAgent: "Mozilla/5.0 (Macintosh; Chrome/124)", correlationId: "req-pay-timeout-1", tenantId: 2, message: "POST /api/v1/payments/verify → 504", requestBody: { order_id: "ord-9921", card_number: "4111111111111111", cvv: "123" }, responseBody: { error: "gateway_timeout" } },
  { id: "api-10", timestamp: "2026-05-13T10:12:03.700Z", level: "Info", source: "api-gateway", method: "PATCH", endpoint: "/api/v1/tenants/6/seats", statusCode: 200, responseTimeMs: 61, requestSize: 40, responseSize: 40, clientId: "app:web-dashboard", authenticatedUser: "user:saif@ledsak.com", sourceIp: "103.21.244.9", userAgent: "Mozilla/5.0 (Macintosh; Chrome/124)", correlationId: null, tenantId: 6, message: "PATCH /api/v1/tenants/6/seats → 200", requestBody: { seats: 40 }, responseBody: { seats: 40 } },
];

export const SEED_WEBHOOK_LOGS = [
  { id: "wh-1", timestamp: "2026-05-13T10:42:00.000Z", level: "Info", source: "webhook-dispatcher", eventType: "lead.created", destinationUrl: "https://crm.varungroup.in/hooks", deliveryStatus: "Delivered", httpResponseCode: 200, attemptCount: 1, maxRetries: 3, nextRetryAt: null, tenantId: 6, message: "lead.created delivered to crm.varungroup.in", payloadSent: { event: "lead.created", lead_id: "ld-201", tenant: "Varun Group" }, responseBody: { received: true },
    attempts: [{ attempt: 1, at: "2026-05-13T10:42:00.000Z", result: "200 OK", latencyMs: 340 }] },
  { id: "wh-2", timestamp: "2026-05-13T10:38:15.000Z", level: "Error", source: "webhook-dispatcher", eventType: "payment.failed", destinationUrl: "https://billing.medlinks.in/wh", deliveryStatus: "Failed", httpResponseCode: 0, attemptCount: 3, maxRetries: 3, nextRetryAt: null, tenantId: 3, message: "payment.failed exhausted retries to billing.medlinks.in", payloadSent: { event: "payment.failed", invoice_id: "INV-2453", secret: "whsec_9182" }, responseBody: null,
    attempts: [
      { attempt: 1, at: "2026-05-13T10:20:15.000Z", result: "Connection refused", latencyMs: 900 },
      { attempt: 2, at: "2026-05-13T10:29:15.000Z", result: "Connection refused", latencyMs: 870 },
      { attempt: 3, at: "2026-05-13T10:38:15.000Z", result: "Connection refused", latencyMs: 910 },
    ] },
  { id: "wh-3", timestamp: "2026-05-13T10:35:22.000Z", level: "Info", source: "webhook-dispatcher", eventType: "subscription.renewed", destinationUrl: "https://hooks.aryaanya.com/lsk", deliveryStatus: "Delivered", httpResponseCode: 200, attemptCount: 1, maxRetries: 3, nextRetryAt: null, tenantId: 12, message: "subscription.renewed delivered to hooks.aryaanya.com", payloadSent: { event: "subscription.renewed", sub_id: "sub-004" }, responseBody: { received: true },
    attempts: [{ attempt: 1, at: "2026-05-13T10:35:22.000Z", result: "200 OK", latencyMs: 210 }] },
  { id: "wh-4", timestamp: "2026-05-13T10:30:01.000Z", level: "Warning", source: "webhook-dispatcher", eventType: "lead.created", destinationUrl: "https://api.carwale.com/callback", deliveryStatus: "Retrying", httpResponseCode: 500, attemptCount: 2, maxRetries: 3, nextRetryAt: "2026-05-13T10:45:01.000Z", tenantId: 6, message: "lead.created retrying to api.carwale.com (2/3)", payloadSent: { event: "lead.created", lead_id: "ld-198" }, responseBody: { error: "internal_server_error" },
    attempts: [
      { attempt: 1, at: "2026-05-13T10:30:01.000Z", result: "500 Internal Server Error", latencyMs: 1200 },
      { attempt: 2, at: "2026-05-13T10:35:01.000Z", result: "500 Internal Server Error", latencyMs: 900 },
      { attempt: 3, at: "2026-05-13T10:45:01.000Z", result: "Scheduled (next retry)", latencyMs: null },
    ] },
  { id: "wh-5", timestamp: "2026-05-13T10:25:40.000Z", level: "Info", source: "webhook-dispatcher", eventType: "user.created", destinationUrl: "https://slack.com/api/hooks/xyz", deliveryStatus: "Delivered", httpResponseCode: 200, attemptCount: 1, maxRetries: 3, nextRetryAt: null, tenantId: null, message: "user.created delivered to Slack", payloadSent: { event: "user.created", user: "priya@dermapuritys.com" }, responseBody: { ok: true },
    attempts: [{ attempt: 1, at: "2026-05-13T10:25:40.000Z", result: "200 OK", latencyMs: 180 }] },
  { id: "wh-6", timestamp: "2026-05-13T10:20:10.000Z", level: "Error", source: "webhook-dispatcher", eventType: "lead.assigned", destinationUrl: "https://crm.varungroup.in/hooks", deliveryStatus: "Failed", httpResponseCode: 408, attemptCount: 3, maxRetries: 3, nextRetryAt: null, tenantId: 6, message: "lead.assigned exhausted retries to crm.varungroup.in", payloadSent: { event: "lead.assigned", lead_id: "ld-190", assignee: "Saif Sir" }, responseBody: null,
    attempts: [
      { attempt: 1, at: "2026-05-13T10:05:10.000Z", result: "408 Request Timeout", latencyMs: 30000 },
      { attempt: 2, at: "2026-05-13T10:12:10.000Z", result: "408 Request Timeout", latencyMs: 30000 },
      { attempt: 3, at: "2026-05-13T10:20:10.000Z", result: "408 Request Timeout", latencyMs: 30000 },
    ] },
  { id: "wh-7", timestamp: "2026-05-13T09:58:00.000Z", level: "Info", source: "webhook-dispatcher", eventType: "subscription.renewed", destinationUrl: "https://hooks.aryaanya.com/lsk", deliveryStatus: "Delivered", httpResponseCode: 200, attemptCount: 1, maxRetries: 3, nextRetryAt: null, tenantId: 12, message: "subscription.renewed delivered to hooks.aryaanya.com", payloadSent: { event: "subscription.renewed", sub_id: "sub-011" }, responseBody: { received: true },
    attempts: [{ attempt: 1, at: "2026-05-13T09:58:00.000Z", result: "200 OK", latencyMs: 260 }] },
  { id: "wh-8", timestamp: "2026-05-13T09:40:00.000Z", level: "Info", source: "webhook-dispatcher", eventType: "lead.created", destinationUrl: "https://crm.varungroup.in/hooks", deliveryStatus: "Pending", httpResponseCode: null, attemptCount: 0, maxRetries: 3, nextRetryAt: null, tenantId: 6, message: "lead.created queued for delivery to crm.varungroup.in", payloadSent: { event: "lead.created", lead_id: "ld-185" }, responseBody: null, attempts: [] },
];

export const SEED_INTEGRATION_LOGS = [
  { id: "int-1", timestamp: "2026-05-13T10:42:00.000Z", level: "Info", source: "integration-worker", integrationName: "CarWale", direction: "Inbound", operation: "lead.import", status: "Success", recordsProcessed: 142, recordsFailed: 0, errorDetail: null, durationMs: 12400, tenantId: 6, message: "CarWale lead.import: 142/142 succeeded" },
  { id: "int-2", timestamp: "2026-05-13T10:38:15.000Z", level: "Info", source: "integration-worker", integrationName: "WhatsApp Business", direction: "Outbound", operation: "message.send", status: "Success", recordsProcessed: 1, recordsFailed: 0, errorDetail: null, durationMs: 800, tenantId: 6, message: "WhatsApp Business message.send: 1/1 succeeded" },
  { id: "int-3", timestamp: "2026-05-13T10:35:22.000Z", level: "Warning", source: "integration-worker", integrationName: "CarDekho", direction: "Inbound", operation: "lead.import", status: "Partial", recordsProcessed: 89, recordsFailed: 6, errorDetail: "6 duplicates skipped", durationMs: 18200, tenantId: 11, message: "CarDekho lead.import: 89/95 succeeded" },
  { id: "int-4", timestamp: "2026-05-13T10:30:01.000Z", level: "Error", source: "integration-worker", integrationName: "Dealer DMS", direction: "Outbound", operation: "inventory.sync", status: "Failed", recordsProcessed: 0, recordsFailed: 48, errorDetail: "Connection timeout after 30s", durationMs: null, tenantId: 6, message: "Dealer DMS inventory.sync: 0/48 succeeded" },
  { id: "int-5", timestamp: "2026-05-13T10:25:40.000Z", level: "Info", source: "integration-worker", integrationName: "Razorpay", direction: "Inbound", operation: "payment.verify", status: "Success", recordsProcessed: 1, recordsFailed: 0, errorDetail: null, durationMs: 300, tenantId: 2, message: "Razorpay payment.verify: 1/1 succeeded" },
  { id: "int-6", timestamp: "2026-05-13T10:20:10.000Z", level: "Info", source: "integration-worker", integrationName: "Cliniceo EMR", direction: "Outbound", operation: "patient.sync", status: "Success", recordsProcessed: 23, recordsFailed: 0, errorDetail: null, durationMs: 4100, tenantId: 3, message: "Cliniceo EMR patient.sync: 23/23 succeeded" },
  { id: "int-7", timestamp: "2026-05-13T10:15:00.000Z", level: "Info", source: "integration-worker", integrationName: "CarWale", direction: "Inbound", operation: "token.refresh", status: "Success", recordsProcessed: null, recordsFailed: 0, errorDetail: null, durationMs: 200, tenantId: null, message: "CarWale token.refresh succeeded" },
  { id: "int-8", timestamp: "2026-05-13T10:10:30.000Z", level: "Error", source: "integration-worker", integrationName: "Dealer DMS", direction: "Outbound", operation: "inventory.sync", status: "Failed", recordsProcessed: 0, recordsFailed: 48, errorDetail: "Auth token expired", durationMs: null, tenantId: 6, message: "Dealer DMS inventory.sync: 0/48 succeeded" },
  { id: "int-9", timestamp: "2026-05-13T09:20:00.000Z", level: "Error", source: "integration-worker", integrationName: "IndiaMART", direction: "Inbound", operation: "lead.import", status: "Failed", recordsProcessed: 0, recordsFailed: 2, errorDetail: "Auth error: IndiaMART API token expired", durationMs: null, tenantId: 3, message: "IndiaMART lead.import: 0/2 succeeded" },
  { id: "int-10", timestamp: "2026-05-12T18:40:10.000Z", level: "Warning", source: "integration-worker", integrationName: "CarDekho", direction: "Inbound", operation: "lead.import", status: "Partial", recordsProcessed: 40, recordsFailed: 3, errorDetail: "3 timed out", durationMs: 9100, tenantId: 11, message: "CarDekho lead.import: 40/43 succeeded" },
];
export const INTEGRATION_NAMES = ["CarWale", "CarDekho", "WhatsApp Business", "Razorpay", "Cliniceo EMR", "Dealer DMS", "IndiaMART"];

// Health rollup for the Integration Logs header — one card per integration derived from the
// log rows themselves (mirrors data/leads.js's computeIntegrationHealth, but scoped to this
// module's richer per-run log rows rather than per-lead ingestion outcomes).
export function computeIntegrationHealthCards(logs) {
  return INTEGRATION_NAMES.map((name) => {
    const rows = logs.filter((l) => l.integrationName === name).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const last24h = rows.filter((l) => LOGS_NOW.getTime() - new Date(l.timestamp).getTime() <= 24 * 3600_000);
    const failures24h = last24h.filter((l) => l.status === "Failed").length;
    const lastRun = rows[0] || null;
    const consecutiveFailed = (() => { let n = 0; for (const r of rows) { if (r.status === "Failed") n++; else break; } return n; })();
    const health = consecutiveFailed >= 2 ? "Down" : failures24h > 0 ? "Degraded" : "Connected";
    const minsAgo = lastRun ? Math.max(0, Math.round((LOGS_NOW.getTime() - new Date(lastRun.timestamp).getTime()) / 60000)) : null;
    return { name, health, lastSyncMinsAgo: minsAgo, failures24h, lastRun };
  });
}

export const SEED_SECURITY_LOGS = [
  { id: "sec-1", timestamp: "2026-05-13T10:42:18.000Z", level: "Info", source: "auth-service", eventType: "login.success", actor: "rahul@medlinks.in", sourceIp: "103.21.244.12", geolocation: "New Delhi, IN", device: "Chrome · macOS", outcome: "Success", riskScore: 4, tenantId: 3, message: "rahul@medlinks.in logged in successfully" },
  { id: "sec-2", timestamp: "2026-05-13T10:41:30.000Z", level: "Warning", source: "auth-service", eventType: "login.failure", actor: "unknown", sourceIp: "185.42.11.9", geolocation: "São Paulo, BR", device: "curl/7.68.0", outcome: "Failure", riskScore: 62, tenantId: null, message: "Failed login attempt (unknown user)" },
  { id: "sec-3", timestamp: "2026-05-13T10:40:12.000Z", level: "Warning", source: "auth-service", eventType: "login.failure", actor: "unknown", sourceIp: "185.42.11.9", geolocation: "São Paulo, BR", device: "curl/7.68.0", outcome: "Failure", riskScore: 65, tenantId: null, message: "Failed login attempt (unknown user)" },
  { id: "sec-4", timestamp: "2026-05-13T10:39:50.000Z", level: "Warning", source: "auth-service", eventType: "login.failure", actor: "unknown", sourceIp: "185.42.11.9", geolocation: "São Paulo, BR", device: "curl/7.68.0", outcome: "Failure", riskScore: 68, tenantId: null, message: "Failed login attempt (unknown user)" },
  { id: "sec-5", timestamp: "2026-05-13T10:39:48.000Z", level: "Critical", source: "auth-service", eventType: "bruteforce.detected", actor: null, sourceIp: "185.42.11.9", geolocation: "São Paulo, BR", device: null, outcome: "Blocked", riskScore: 95, tenantId: null, correlationId: "req-bruteforce-1", message: "Brute-force pattern detected — 3 failed logins in under 3 min" },
  { id: "sec-6", timestamp: "2026-05-13T10:39:48.000Z", level: "Critical", source: "auth-service", eventType: "ip.blocked", actor: null, sourceIp: "185.42.11.9", geolocation: "São Paulo, BR", device: null, outcome: "Blocked", riskScore: 95, tenantId: null, correlationId: "req-bruteforce-1", message: "IP 185.42.11.9 auto-blocked for 24h" },
  { id: "sec-7", timestamp: "2026-05-13T10:35:22.000Z", level: "Warning", source: "auth-service", eventType: "mfa.disabled", actor: "sneha@rezoni.com", sourceIp: "49.36.12.7", geolocation: "Mumbai, IN", device: "Safari · iPhone", outcome: "Success", riskScore: 55, tenantId: 1, message: "sneha@rezoni.com disabled MFA on their account" },
  { id: "sec-8", timestamp: "2026-05-13T10:30:01.000Z", level: "Error", source: "auth-service", eventType: "session.hijack.suspected", actor: "arjun@varungroup.in", sourceIp: "92.12.55.3", geolocation: "Frankfurt, DE", device: "Unknown agent", outcome: "Failure", riskScore: 88, tenantId: 6, correlationId: "req-pay-timeout-1", message: "Session token used from an unrecognized location within 2 min of last known login" },
  { id: "sec-9", timestamp: "2026-05-13T10:25:40.000Z", level: "Info", source: "auth-service", eventType: "login.success", actor: "priya@dermapuritys.com", sourceIp: "103.21.244.5", geolocation: "New Delhi, IN", device: "Chrome · Windows", outcome: "Success", riskScore: 6, tenantId: 2, message: "priya@dermapuritys.com logged in successfully" },
  { id: "sec-10", timestamp: "2026-05-13T10:20:10.000Z", level: "Warning", source: "rate-limiter", eventType: "rate.limit.triggered", actor: "key:partner-api", sourceIp: "92.12.55.3", geolocation: "Frankfurt, DE", device: "API client", outcome: "Blocked", riskScore: 70, tenantId: 11, message: "Partner API key exceeded 100 req/min — throttled" },
].map((l) => ({ ...l, rawPayload: { eventType: l.eventType, actor: l.actor, sourceIp: l.sourceIp, outcome: l.outcome, riskScore: l.riskScore } }));

export const SEED_ERROR_LOGS = [
  { id: "err-1", timestamp: "2026-05-13T10:42:18.000Z", level: "Error", source: "lead-sync", errorType: "ConnectionRefused", errorCode: "E_CARWALE_001", message: "CarWale API: connection refused on lead.import", stackTrace: "ConnectionRefused: connect ECONNREFUSED 52.14.88.2:443\n    at TCPConnectWrap.afterConnect (node:net:1637:16)\n    at LeadSyncWorker.importFromCarWale (/srv/workers/lead-sync.js:88)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)", correlationId: "req-77f2a1", requestId: "req-77f2a1", environment: "production", affectedTenant: "Varun Group", affectedUser: null, resolutionStatus: "New", occurrenceCount: 142, firstSeen: "2026-05-11T06:10:00.000Z", lastSeen: "2026-05-13T10:42:18.000Z", tenantId: 6,
    instances: [{ at: "2026-05-13T10:42:18.000Z", requestId: "req-77f2a1" }, { at: "2026-05-13T09:58:02.000Z", requestId: "req-c1a902" }, { at: "2026-05-13T09:14:40.000Z", requestId: "req-9f0e11" }] },
  { id: "err-2", timestamp: "2026-05-13T10:38:15.000Z", level: "Critical", source: "ai-service", errorType: "OutOfMemory", errorCode: "E_MEM_001", message: "AI Enrichment: OOM killed at 4.2GB", stackTrace: "FatalError: JavaScript heap out of memory\n    at MarkCompactCollector (v8)\n    at AiEnrichmentWorker.summarize (/srv/workers/ai-enrichment.js:214)\n    at Object.<anonymous> (/srv/workers/ai-enrichment.js:340)", correlationId: "req-ai-oom-1", requestId: "req-ai-oom-1", environment: "production", affectedTenant: null, affectedUser: null, resolutionStatus: "Acknowledged", occurrenceCount: 3, firstSeen: "2026-05-13T07:40:00.000Z", lastSeen: "2026-05-13T10:38:15.000Z", tenantId: null,
    instances: [{ at: "2026-05-13T10:38:15.000Z", requestId: "req-ai-oom-1" }, { at: "2026-05-13T08:15:12.000Z", requestId: "req-ai-oom-0" }] },
  { id: "err-3", timestamp: "2026-05-13T10:35:22.000Z", level: "Error", source: "payments", errorType: "TimeoutError", errorCode: "E_PAY_002", message: "Razorpay verification timeout after 30s", stackTrace: "TimeoutError: Request to razorpay.com timed out after 30000ms\n    at PaymentGateway.verify (/srv/services/payments.js:142)\n    at PaymentController.confirm (/srv/controllers/payments.js:61)", correlationId: "req-pay-timeout-1", requestId: "req-pay-timeout-1", environment: "production", affectedTenant: "Derma Purtitys", affectedUser: "priya@dermapuritys.com", resolutionStatus: "New", occurrenceCount: 8, firstSeen: "2026-05-12T20:00:00.000Z", lastSeen: "2026-05-13T10:35:22.000Z", tenantId: 2,
    instances: [{ at: "2026-05-13T10:35:22.000Z", requestId: "req-pay-timeout-1" }, { at: "2026-05-13T04:12:00.000Z", requestId: "req-pay-timeout-0" }] },
  { id: "err-4", timestamp: "2026-05-13T10:30:01.000Z", level: "Error", source: "tenant-mgmt", errorType: "ValidationError", errorCode: "E_VAL_018", message: "Invalid GST format on tenant creation", stackTrace: "ValidationError: gst does not match pattern /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/\n    at validateTenant (/srv/services/tenants.js:44)\n    at TenantController.create (/srv/controllers/tenants.js:19)", correlationId: null, requestId: "req-val-018-7", environment: "production", affectedTenant: null, affectedUser: "saif@ledsak.com", resolutionStatus: "Resolved", occurrenceCount: 28, firstSeen: "2026-04-02T11:00:00.000Z", lastSeen: "2026-05-10T09:00:00.000Z", tenantId: null,
    instances: [{ at: "2026-05-10T09:00:00.000Z", requestId: "req-val-018-7" }] },
  { id: "err-5", timestamp: "2026-05-13T10:25:40.000Z", level: "Error", source: "notifications", errorType: "TypeError", errorCode: null, message: "Cannot read property 'email' of undefined", stackTrace: "TypeError: Cannot read properties of undefined (reading 'email')\n    at NotificationService.sendDigest (/srv/services/notifications.js:77)\n    at DigestJob.run (/srv/jobs/digest.js:22)", correlationId: null, requestId: "req-notif-typeerr-1", environment: "production", affectedTenant: null, affectedUser: null, resolutionStatus: "New", occurrenceCount: 1, firstSeen: "2026-05-13T10:25:40.000Z", lastSeen: "2026-05-13T10:25:40.000Z", tenantId: null,
    instances: [{ at: "2026-05-13T10:25:40.000Z", requestId: "req-notif-typeerr-1" }] },
  { id: "err-6", timestamp: "2026-05-13T10:20:10.000Z", level: "Critical", source: "infra", errorType: "DatabaseError", errorCode: "E_DB_001", message: "Primary DB replica lag > 30s", stackTrace: "DatabaseError: replica lag 34210ms exceeds threshold 30000ms\n    at ReplicaMonitor.check (/srv/infra/replica-monitor.js:31)", correlationId: null, requestId: "req-db-lag-1", environment: "production", affectedTenant: null, affectedUser: null, resolutionStatus: "Acknowledged", occurrenceCount: 2, firstSeen: "2026-05-13T09:55:00.000Z", lastSeen: "2026-05-13T10:20:10.000Z", tenantId: null,
    instances: [{ at: "2026-05-13T10:20:10.000Z", requestId: "req-db-lag-1" }] },
  { id: "err-7", timestamp: "2026-05-13T08:08:44.000Z", level: "Error", source: "worker", errorType: "RateLimitError", errorCode: "E_WA_429", message: "WhatsApp bulk-send failed: rate limit exceeded", stackTrace: "RateLimitError: 429 Too Many Requests\n    at WhatsAppClient.send (/srv/integrations/whatsapp.js:58)\n    at BulkSendWorker.process (/srv/workers/bulk-send.js:33)", correlationId: "req-77f2a1", requestId: "req-wa-429-1", environment: "production", affectedTenant: "Varun Group", affectedUser: null, resolutionStatus: "New", occurrenceCount: 4, firstSeen: "2026-05-12T14:00:00.000Z", lastSeen: "2026-05-13T08:08:44.000Z", tenantId: 6,
    instances: [{ at: "2026-05-13T08:08:44.000Z", requestId: "req-wa-429-1" }] },
].map((e) => ({ ...e, rawPayload: { errorType: e.errorType, errorCode: e.errorCode, requestId: e.requestId, environment: e.environment, stackTrace: e.stackTrace } }));
export const ERROR_TYPES = Array.from(new Set(SEED_ERROR_LOGS.map((e) => e.errorType)));

const AUDIT_TENANT_ID = { "Sneha Kapoor (sneha@rezoni.com)": 1, "MedLinks": 3, "Varun Group": 6 };
export const SEED_ADMIN_AUDIT_LOGS_RAW = [
  { id: "aud-1", timestamp: "2026-05-13T10:42:18.000Z", actor: "Saif Khan", actorEmail: "saif@ledsak.com", actorRole: "Super Admin", action: "plan.updated", target: "Growth", targetId: "sp-growth", targetType: "Plan", beforeValues: { monthlyPrice: 6999 }, afterValues: { monthlyPrice: 7999 }, sourceIp: "103.21.244.9", device: "Chrome · macOS", correlationId: null, message: "Updated plan Growth (sp-growth)" },
  { id: "aud-2", timestamp: "2026-05-13T10:40:12.000Z", actor: "Saif Khan", actorEmail: "saif@ledsak.com", actorRole: "Super Admin", action: "user.suspended", target: "Sneha Kapoor (sneha@rezoni.com)", targetId: "4", targetType: "User", beforeValues: { status: "Active" }, afterValues: { status: "Suspended" }, sourceIp: "103.21.244.9", device: "Chrome · macOS", correlationId: null, message: "Suspended user Sneha Kapoor" },
  { id: "aud-3", timestamp: "2026-05-13T10:38:15.000Z", actor: "Luv", actorEmail: "luv@ledsak.com", actorRole: "CSM", action: "subscription.created", target: "Dermalife", targetId: "sub-002", targetType: "Subscription", beforeValues: null, afterValues: { plan: "Growth", mrr: 12149 }, sourceIp: "103.21.244.9", device: "Chrome · Windows", correlationId: null, message: "Created subscription for Dermalife" },
  { id: "aud-4", timestamp: "2026-05-13T10:35:22.000Z", actor: "Saif Khan", actorEmail: "saif@ledsak.com", actorRole: "Super Admin", action: "feature_flag.toggled", target: "AI Churn Prediction", targetId: "feature.ai_churn", targetType: "Setting", beforeValues: { enabled: false }, afterValues: { enabled: true }, sourceIp: "103.21.244.9", device: "Chrome · macOS", correlationId: "req-flag-ai-churn", message: "Enabled feature flag AI Churn Prediction" },
  { id: "aud-5", timestamp: "2026-05-13T10:30:01.000Z", actor: "Vishal", actorEmail: "vishal@ledsak.com", actorRole: "CSM", action: "data.exported", target: "Revenue Report (PDF)", targetId: "rpt-rev-0513", targetType: "Report", beforeValues: null, afterValues: null, sourceIp: "49.36.12.9", device: "Safari · macOS", correlationId: null, message: "Exported Revenue Report as PDF" },
  { id: "aud-6", timestamp: "2026-05-13T10:25:40.000Z", actor: "Saif Khan", actorEmail: "saif@ledsak.com", actorRole: "Super Admin", action: "tenant.seats_added", target: "MedLinks", targetId: "3", targetType: "Tenant", beforeValues: { seats: 45 }, afterValues: { seats: 50 }, sourceIp: "103.21.244.9", device: "Chrome · macOS", correlationId: null, message: "Added 5 seats to MedLinks" },
  { id: "aud-7", timestamp: "2026-05-13T10:20:10.000Z", actor: "Luv", actorEmail: "luv@ledsak.com", actorRole: "CSM", action: "user.impersonated", target: "priya@dermapuritys.com", targetId: "2", targetType: "User", beforeValues: null, afterValues: null, sourceIp: "103.21.244.9", device: "Chrome · Windows", correlationId: null, message: "Impersonated priya@dermapuritys.com" },
  { id: "aud-8", timestamp: "2026-05-13T10:15:00.000Z", actor: "Saif Khan", actorEmail: "saif@ledsak.com", actorRole: "Super Admin", action: "discount.applied", target: "Varun Group", targetId: "sub-003", targetType: "Subscription", beforeValues: { discount: 0 }, afterValues: { discount: 50000, reason: "Strategic" }, sourceIp: "103.21.244.9", device: "Chrome · macOS", correlationId: null, message: "Applied ₹50,000 strategic discount to Varun Group" },
  { id: "aud-9", timestamp: "2026-05-13T10:10:30.000Z", actor: "Saif Khan", actorEmail: "saif@ledsak.com", actorRole: "Super Admin", action: "policy.updated", target: "Enforce 2FA for admins", targetId: "policy-2fa-admins", targetType: "Setting", beforeValues: { enabled: false }, afterValues: { enabled: true }, sourceIp: "103.21.244.9", device: "Chrome · macOS", correlationId: "req-bruteforce-1", message: "Enabled policy: Enforce 2FA for admins" },
  { id: "aud-10", timestamp: "2026-05-13T10:05:00.000Z", actor: "Vishal", actorEmail: "vishal@ledsak.com", actorRole: "CSM", action: "report.downloaded", target: "Churn cohort analysis", targetId: "rpt-churn-0513", targetType: "Report", beforeValues: null, afterValues: { format: "PDF" }, sourceIp: "49.36.12.9", device: "Safari · macOS", correlationId: null, message: "Downloaded Churn cohort analysis (PDF)" },
  { id: "aud-11", timestamp: "2026-05-12T19:00:00.000Z", actor: "Saif Khan", actorEmail: "saif@ledsak.com", actorRole: "Super Admin", action: "user.role_changed", target: "Arjun Nair (arjun@varungroup.in)", targetId: "3", targetType: "User", beforeValues: { role: "Telecaller", scope: "Own leads" }, afterValues: { role: "Team Lead", scope: "Team" }, sourceIp: "103.21.244.9", device: "Chrome · macOS", correlationId: null, message: "Changed role for Arjun Nair: Telecaller → Team Lead" },
];
// Derives the common fields (level, source, tenantId, rawPayload) rather than repeating
// them by hand on every literal above — level escalates for SENSITIVE_ADMIN_ACTIONS so the
// severity filter surfaces them the same way it would a real security-relevant admin action.
export const SEED_ADMIN_AUDIT_LOGS = SEED_ADMIN_AUDIT_LOGS_RAW.map((a) => ({
  ...a,
  level: SENSITIVE_ADMIN_ACTIONS.has(a.action) ? "Warning" : "Info",
  source: "admin-console",
  tenantId: AUDIT_TENANT_ID[a.target] ?? null,
  rawPayload: { action: a.action, target: a.target, targetType: a.targetType, before: a.beforeValues, after: a.afterValues },
}));

/* ============================================================
   localStorage persistence — only for fields the UI mutates
   ============================================================ */
const KEY = {
  errorState: "ledsak_logs_error_state_v1",
  webhookState: "ledsak_logs_webhook_state_v1",
  integrationState: "ledsak_logs_integration_state_v1",
  securityAnnotations: "ledsak_logs_security_annotations_v1",
  auditAnnotations: "ledsak_logs_audit_annotations_v1",
  auditMeta: "ledsak_logs_audit_meta_v1",
};
function load(key, fallback) { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; } }
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

export const loadErrorLogs = () => load(KEY.errorState, null) || SEED_ERROR_LOGS;
export const saveErrorLogs = (d) => save(KEY.errorState, d);
export const loadWebhookLogs = () => load(KEY.webhookState, null) || SEED_WEBHOOK_LOGS;
export const saveWebhookLogs = (d) => save(KEY.webhookState, d);
export const loadIntegrationLogs = () => load(KEY.integrationState, null) || SEED_INTEGRATION_LOGS;
export const saveIntegrationLogs = (d) => save(KEY.integrationState, d);
export const loadSecurityAnnotations = () => load(KEY.securityAnnotations, []);
export const saveSecurityAnnotations = (d) => save(KEY.securityAnnotations, d);
// Append-only: admin-audit entries themselves are never persisted/mutated — only two
// append-only side-tables are: annotations, and meta-audit entries created by exporting.
export const loadAuditAnnotations = () => load(KEY.auditAnnotations, []);
export const saveAuditAnnotations = (d) => save(KEY.auditAnnotations, d);
export const loadAuditMetaEntries = () => load(KEY.auditMeta, []);
export const saveAuditMetaEntries = (d) => save(KEY.auditMeta, d);

/* ---- Shared filter application — every tab's filter bar reduces to this ---- */
export function inDateRange(timestamp, range) {
  if (!range || !range.preset) return true;
  const t = new Date(timestamp).getTime();
  if (range.preset === "Custom") {
    const start = range.start ? new Date(range.start).getTime() : -Infinity;
    const end = range.end ? new Date(range.end).getTime() : Infinity;
    return t >= start && t <= end;
  }
  const r = presetRangeMs(range.preset);
  return r ? t >= r.start && t <= r.end : true;
}
export function applyLogFilters(rows, { search, searchFields = [], dateRange, severity, source, sourceField = "source" } = {}) {
  const q = (search || "").toLowerCase().trim();
  return rows.filter((r) => {
    if (q && !searchFields.some((f) => String(r[f] ?? "").toLowerCase().includes(q))) return false;
    if (!inDateRange(r.timestamp, dateRange)) return false;
    if (severity && severity.length && !severity.includes(r.level)) return false;
    if (source && source !== "All" && r[sourceField] !== source) return false;
    return true;
  });
}
export function sortRows(rows, sortKey, sortDir) {
  return [...rows].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = sortKey === "timestamp" ? new Date(av) - new Date(bv) : av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });
}

/* ---- Export (CSV + JSON), scoped to whatever `rows` the caller already filtered ---- */
export function exportLogs(rows, logType, format, dateRangeLabel) {
  const filename = `${logType}_logs_${dateRangeLabel || "all"}.${format}`;
  let blob;
  if (format === "json") {
    blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  } else {
    const cols = Array.from(rows.reduce((set, r) => { Object.keys(r).forEach((k) => set.add(k)); return set; }, new Set()));
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`).join(","))].join("\n");
    blob = new Blob([csv], { type: "text/csv" });
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
