/* ============================================================
   LEAD & RECORD MANAGEMENT — full functional module
   ============================================================ */

/* ---- Seed data ---- */
export const LEAD_SOURCES = ["CarWale", "CarDekho", "Website", "WhatsApp", "IndiaMART", "Walk-in"];
export const LEAD_PROC_STATES = ["success", "partial", "failed", "duplicate"];
export const LEAD_STATUSES = ["New", "Assigned", "Contacted", "Converted", "Lost"];
export const LEAD_TENANTS = ["MedLinks", "Varun Group", "Derma Purtitys", "Urban Autohub", "Rezoni", "BrightPath Edu"];

export const SEED_LEADS = [
  { id: "ld-001", name: "Arjun Sharma", phone: "+91-98765-43210", email: "arjun@example.com", source: "CarWale", tenant: "Varun Group", tenantId: 6, status: "New", procState: "success", duplicateOf: null, aiSummary: "High-intent buyer, interested in SUVs under ₹15L. Visited 3 times.", assignee: "Saif Sir", receivedAt: "13 May 2026 09:14", failureReason: null, history: [{ action: "Lead received", by: "system", when: "13 May 2026 09:14" }, { action: "AI summary generated", by: "system", when: "13 May 2026 09:15" }] },
  { id: "ld-002", name: "Priya Nair", phone: "+91-87654-32109", email: "priya@example.com", source: "CarDekho", tenant: "Urban Autohub", tenantId: 11, status: "Assigned", procState: "success", duplicateOf: null, aiSummary: "First-time buyer, exploring hatchbacks. Budget ₹8–10L.", assignee: "Luv", receivedAt: "13 May 2026 08:52", failureReason: null, history: [{ action: "Lead received", by: "system", when: "13 May 2026 08:52" }, { action: "Assigned to Luv", by: "Saif Sir", when: "13 May 2026 09:00" }] },
  { id: "ld-003", name: "Rohit Verma", phone: "+91-76543-21098", email: "rohit@example.com", source: "IndiaMART", tenant: "MedLinks", tenantId: 3, status: "New", procState: "failed", duplicateOf: null, aiSummary: null, assignee: null, receivedAt: "13 May 2026 08:30", failureReason: "Auth error: IndiaMART API token expired", history: [{ action: "Lead received", by: "system", when: "13 May 2026 08:30" }, { action: "Processing failed: Auth error", by: "system", when: "13 May 2026 08:30" }] },
  { id: "ld-004", name: "Kavita Reddy", phone: "+91-65432-10987", email: "kavita@example.com", source: "IndiaMART", tenant: "MedLinks", tenantId: 3, status: "New", procState: "failed", duplicateOf: null, aiSummary: null, assignee: null, receivedAt: "13 May 2026 08:28", failureReason: "Auth error: IndiaMART API token expired", history: [{ action: "Lead received", by: "system", when: "13 May 2026 08:28" }, { action: "Processing failed: Auth error", by: "system", when: "13 May 2026 08:28" }] },
  { id: "ld-005", name: "Suresh Patel", phone: "+91-54321-09876", email: "suresh@example.com", source: "WhatsApp", tenant: "Derma Purtitys", tenantId: 2, status: "Contacted", procState: "success", duplicateOf: null, aiSummary: "Returning patient, interested in skin rejuvenation. Has booked before.", assignee: "Luv", receivedAt: "13 May 2026 07:45", failureReason: null, history: [{ action: "Lead received", by: "system", when: "13 May 2026 07:45" }, { action: "Contacted via WhatsApp", by: "Luv", when: "13 May 2026 08:00" }] },
  { id: "ld-006", name: "Meera Iyer", phone: "+91-54321-09876", email: "meera@example.com", source: "Website", tenant: "Derma Purtitys", tenantId: 2, status: "New", procState: "duplicate", duplicateOf: "ld-005", aiSummary: "Phone matches existing lead ld-005 (Suresh Patel via WhatsApp).", assignee: null, receivedAt: "13 May 2026 07:40", failureReason: null, history: [{ action: "Lead received", by: "system", when: "13 May 2026 07:40" }, { action: "Duplicate detected: phone match with ld-005", by: "system", when: "13 May 2026 07:41" }] },
  { id: "ld-007", name: "Vikram Singh", phone: "+91-32109-87654", email: "vikram@example.com", source: "CarWale", tenant: "Varun Group", tenantId: 6, status: "Converted", procState: "success", duplicateOf: null, aiSummary: "Converted after 3 follow-ups. Booked Hyundai Creta.", assignee: "Saif Sir", receivedAt: "12 May 2026 16:20", failureReason: null, history: [{ action: "Lead received", by: "system", when: "12 May 2026 16:20" }, { action: "Converted", by: "Saif Sir", when: "13 May 2026 11:00" }] },
  { id: "ld-008", name: "Anita Joshi", phone: "+91-21098-76543", email: "anita@example.com", source: "Website", tenant: "MedLinks", tenantId: 3, status: "New", procState: "partial", duplicateOf: null, aiSummary: "Lead captured but AI enrichment incomplete — contact details valid.", assignee: null, receivedAt: "12 May 2026 15:55", failureReason: "AI enrichment timeout", history: [{ action: "Lead received", by: "system", when: "12 May 2026 15:55" }, { action: "Partial processing: AI enrichment timeout", by: "system", when: "12 May 2026 15:56" }] },
  { id: "ld-009", name: "Deepak Rao", phone: "+91-10987-65432", email: "deepak@example.com", source: "CarDekho", tenant: "Urban Autohub", tenantId: 11, status: "Assigned", procState: "success", duplicateOf: null, aiSummary: "Looking for family car, 7-seater preferred. Deadline: next month.", assignee: "Luv", receivedAt: "12 May 2026 14:30", failureReason: null, history: [{ action: "Lead received", by: "system", when: "12 May 2026 14:30" }] },
  { id: "ld-010", name: "Sunita Kapoor", phone: "+91-09876-54321", email: "sunita@example.com", source: "Walk-in", tenant: "Rezoni", tenantId: 1, status: "Lost", procState: "success", duplicateOf: null, aiSummary: "Walk-in visitor. Browsed but didn't proceed. Price sensitive.", assignee: "Saif Sir", receivedAt: "12 May 2026 12:10", failureReason: null, history: [{ action: "Lead received", by: "system", when: "12 May 2026 12:10" }, { action: "Marked Lost", by: "Saif Sir", when: "12 May 2026 17:00" }] },
  { id: "ld-011", name: "Rahul Mehta", phone: "+91-98001-23456", email: "rahul@example.com", source: "IndiaMART", tenant: "BrightPath Edu", tenantId: 8, status: "New", procState: "failed", duplicateOf: null, aiSummary: null, assignee: null, receivedAt: "12 May 2026 11:40", failureReason: "Auth error: IndiaMART API token expired", history: [{ action: "Lead received", by: "system", when: "12 May 2026 11:40" }, { action: "Processing failed", by: "system", when: "12 May 2026 11:40" }] },
  { id: "ld-012", name: "Pooja Sharma", phone: "+91-87001-23456", email: "pooja@example.com", source: "WhatsApp", tenant: "Varun Group", tenantId: 6, status: "Contacted", procState: "success", duplicateOf: null, aiSummary: "Interested in commercial vehicles. Fleet buyer potential.", assignee: "Saif Sir", receivedAt: "12 May 2026 10:05", failureReason: null, history: [{ action: "Lead received", by: "system", when: "12 May 2026 10:05" }] },
  { id: "ld-013", name: "Anil Kumar", phone: "+91-10987-65432", email: "anil@example.com", source: "CarWale", tenant: "Urban Autohub", tenantId: 11, status: "New", procState: "duplicate", duplicateOf: "ld-009", aiSummary: "Phone match with ld-009 (Deepak Rao via CarDekho).", assignee: null, receivedAt: "11 May 2026 18:30", failureReason: null, history: [{ action: "Lead received", by: "system", when: "11 May 2026 18:30" }, { action: "Duplicate detected", by: "system", when: "11 May 2026 18:31" }] },
  { id: "ld-014", name: "Geeta Singh", phone: "+91-65001-23456", email: "geeta@example.com", source: "Website", tenant: "Derma Purtitys", tenantId: 2, status: "New", procState: "partial", duplicateOf: null, aiSummary: null, assignee: null, receivedAt: "11 May 2026 16:00", failureReason: "AI enrichment timeout", history: [{ action: "Lead received", by: "system", when: "11 May 2026 16:00" }] },
  { id: "ld-015", name: "Sunil Desai", phone: "+91-54001-23456", email: "sunil@example.com", source: "CarDekho", tenant: "Varun Group", tenantId: 6, status: "Assigned", procState: "success", duplicateOf: null, aiSummary: "Budget buyer. Comparing 3 models. High follow-up priority.", assignee: "Saif Sir", receivedAt: "11 May 2026 14:22", failureReason: null, history: [{ action: "Lead received", by: "system", when: "11 May 2026 14:22" }] },
];

export const LEAD_SOURCES_DATA = [
  { source: "CarWale", count: 18420, convPct: 4.2, costPerLead: 48 },
  { source: "CarDekho", count: 14100, convPct: 3.8, costPerLead: 52 },
  { source: "Website", count: 8900, convPct: 6.1, costPerLead: 18 },
  { source: "WhatsApp", count: 4200, convPct: 8.4, costPerLead: 5 },
  { source: "IndiaMART", count: 2100, convPct: 2.9, costPerLead: 35 },
  { source: "Walk-in", count: 2590, convPct: 12.1, costPerLead: 0 },
];

export const TENANT_TIER = { "MedLinks": "Enterprise", "Varun Group": "Enterprise", "Derma Purtitys": "Growth", "Urban Autohub": "Growth", "Rezoni": "Trial", "BrightPath Edu": "Trial" };
export const TIER_TONE = { Enterprise: "purple", Growth: "info", Trial: "gray" };
export const FILTER_PLURAL = { Source: "Sources", Tenant: "Tenants", Status: "Statuses", Processing: "Processing States" };

// Deterministic (non-cryptographic) hash so support can search a phone number without
// ever un-masking it — same digits always hash the same, but the hash can't be reversed.
export const simpleHash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h.toString(36); };
export const digitsOnly = (s) => (s || "").replace(/\D/g, "");
export const last4Hash = (phone) => simpleHash(digitsOnly(phone).slice(-4));

// Mock ingestion debug info derived deterministically from the lead — a demo stand-in for
// what a real pipeline would log (raw payload, normalized payload, HTTP status, retry count).
export function mockFailureDebug(lead) {
  const n = parseInt(lead.id.replace(/\D/g, ""), 10) || 1;
  const httpStatus = /auth|token/i.test(lead.failureReason || "") ? 401 : /timeout/i.test(lead.failureReason || "") ? 504 : 422;
  return {
    httpStatus,
    attempt: 1 + (n % 3),
    nextRetryAt: `in ~${5 + (n % 10)} min`,
    rawPayload: `{ "name": "${lead.name}", "phone": "${lead.phone}", "source": "${lead.source}", "tenant_id": ${lead.tenantId} }`,
    normalizedPayload: httpStatus === 401 ? "null — auth failed before normalization" : `{ "full_name": "${lead.name}", "mobile": null, "tenant_id": ${lead.tenantId} }`,
  };
}

// Mock dedupe match metadata — the seed data already encodes the match via `duplicateOf`,
// this derives a stable confidence/reason label from it for display.
export function mockMatchInfo(lead) {
  const n = parseInt(lead.id.replace(/\D/g, ""), 10) || 1;
  return { reason: "Phone number — exact match", confidence: 94 + (n % 6) };
}

// Sources that are real third-party integrations with credentials to rotate. Website and
// Walk-in are internal capture channels — there's nothing in Integrations to "fix" for them.
export const EXTERNAL_INTEGRATION_SOURCES = new Set(["IndiaMART", "CarWale", "CarDekho", "WhatsApp"]);

// A failed lead caused by expired/invalid credentials — reprocessing this is a guaranteed
// no-op until the token is rotated on the Integrations page, so the UI should never offer
// "reprocess" as if it were a fix for this class of failure.
export const isAuthFailure = (lead) => lead.procState === "failed" && mockFailureDebug(lead).httpStatus === 401;

// Integration-first health rollup — one row per lead source, not per tenant. This is what
// turns N per-tenant failure cards into a single "IndiaMART is down for 2 tenants" incident.
// Status reflects ingestion failures only (procState "failed"); AI-enrichment timeouts
// ("partial") are a downstream pipeline issue, not a sign the integration itself is broken.
export function computeIntegrationHealth(leads) {
  return LEAD_SOURCES.map((source) => {
    const rows = leads.filter((l) => l.source === source && !l.isTest);
    const failed = rows.filter((l) => l.procState === "failed");
    const successes = rows.filter((l) => l.procState === "success");
    const total = rows.length;
    const errorRate = total ? failed.length / total : 0;
    const status = failed.length === 0 ? "Healthy" : errorRate >= 0.5 ? "Down" : "Degraded";
    const reasonMap = new Map();
    failed.forEach((l) => {
      const reason = l.failureReason || "Unknown error";
      if (!reasonMap.has(reason)) reasonMap.set(reason, new Set());
      reasonMap.get(reason).add(l.tenant);
    });
    const failureGroups = Array.from(reasonMap.entries()).map(([reason, tenantSet]) => ({ reason, tenants: Array.from(tenantSet) }));
    const tenantsAffected = Array.from(new Set(failed.map((l) => l.tenant)));
    const lastSuccess = successes.reduce((latest, l) => {
      const t = new Date(l.receivedAt).getTime();
      return (!latest || t > latest.t) ? { t, label: l.receivedAt } : latest;
    }, null);
    return {
      source, status, total, failedCount: failed.length, tenantsAffected, failureGroups,
      lastSuccessAt: lastSuccess?.label || null,
      isExternal: EXTERNAL_INTEGRATION_SOURCES.has(source),
    };
  });
}

// Partial masks (last 2-4 chars visible) instead of a uniform block — enough for support to
// confirm identity on a call without a reveal request, and it doesn't repeat as visual noise.
export const maskPhone = (phone) => { const d = digitsOnly(phone); return `+91 ${"•".repeat(Math.max(0, d.length - 6))}${d.slice(-2)}`; };
export const maskName = (name) => { const parts = name.split(" "); return parts.map((p, i) => i === parts.length - 1 ? p[0] + "••••" : "••••").join(" "); };
export const maskEmail = (email) => { const [user, domain] = email.split("@"); return `${user.slice(0, 1)}••••@${domain || "•••"}`; };

export const LEADS_STORAGE_KEY = "ledsak_leads_v1";
export const LEADS_AUDIT_KEY = "ledsak_leads_audit_v1";
export const PII_GRANTS_KEY = "ledsak_pii_grants_v1";

export const loadLeads = () => { try { const s = localStorage.getItem(LEADS_STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; } };
export const saveLeads = (d) => { try { localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(d)); } catch {} };
export const loadLeadAudit = () => { try { const s = localStorage.getItem(LEADS_AUDIT_KEY); return s ? JSON.parse(s) : []; } catch { return []; } };
export const saveLeadAudit = (d) => { try { localStorage.setItem(LEADS_AUDIT_KEY, JSON.stringify(d)); } catch {} };
export const loadPIIGrants = () => { try { const s = localStorage.getItem(PII_GRANTS_KEY); return s ? JSON.parse(s) : []; } catch { return []; } };
export const savePIIGrants = (d) => { try { localStorage.setItem(PII_GRANTS_KEY, JSON.stringify(d)); } catch {} };

