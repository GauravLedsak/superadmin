/* ============================================================
   TENANT CRM AUTOMATIONS — per-tenant automation configs + run logs
   Each tenant's own `/automations` + `/flow-automations` (lead routing,
   WhatsApp sends, field updates) — distinct from Internal Ops (LEDSAK's own
   automations, seeded in pages/AutomationPage.jsx) and from the aggregate-only
   mock in data/automationKpis.js (that module intentionally has no run-level
   data; this module is the per-tenant run-level source that a later prompt
   asked to surface in the Clients detail drawer).
   Seeded for a representative subset of tenants, not all of SEED_CLIENTS —
   tenants not listed here render an empty state, they're not fabricated.
   Failure timing for Rezoni/Siama Skincare/Mahakumbh Motors intentionally
   matches data/automationKpis.js's TENANT_CRM_RECENT_FAILURES so the global
   KPI "Needs Attention" count and this per-tenant view never contradict
   each other for the same tenant.
   ============================================================ */
import { MONTHS_SHORT } from "../lib/format.js";

export const TENANT_CRM_TRIGGER_LABEL = {
  "lead.created": "New lead received",
  "lead.idle": "Lead idle 48h+",
  "lead.assigned": "Lead assigned",
  "whatsapp.reply": "WhatsApp message received",
  "field.updated": "Pipeline field updated",
  "provider.sync": "Lead-provider sync",
};

export const SEED_TENANT_CRM_AUTOMATIONS = {
  "Varun Group": [
    { id: "tca-vg-1", name: "New Lead → WhatsApp Welcome", triggerType: "lead.created" },
    { id: "tca-vg-2", name: "Idle Lead Nudge", triggerType: "lead.idle" },
    { id: "tca-vg-3", name: "Fleet Buyer Tag", triggerType: "field.updated" },
  ],
  "Rezoni": [
    { id: "tca-rz-1", name: "WhatsApp auto-reply", triggerType: "whatsapp.reply" },
    { id: "tca-rz-2", name: "Cart Abandon Follow-up", triggerType: "lead.idle" },
  ],
  "MedLinks": [
    { id: "tca-ml-1", name: "New Patient Intake", triggerType: "lead.created" },
    { id: "tca-ml-2", name: "Appointment Reminder", triggerType: "field.updated" },
  ],
  "Derma Purtitys": [
    { id: "tca-dp-1", name: "Returning Patient Tag", triggerType: "field.updated" },
    { id: "tca-dp-2", name: "New Lead → Assign Telecaller", triggerType: "lead.assigned" },
  ],
  "Siama Skincare": [
    { id: "tca-ss-1", name: "Lead round-robin", triggerType: "lead.assigned" },
    { id: "tca-ss-2", name: "New Lead → WhatsApp", triggerType: "lead.created" },
  ],
  "Mahakumbh Motors": [
    { id: "tca-mm-1", name: "Field sync — CarDekho", triggerType: "provider.sync" },
    { id: "tca-mm-2", name: "New Lead → WhatsApp Welcome", triggerType: "lead.created" },
  ],
  "Urban Autohub": [
    { id: "tca-ua-1", name: "New Lead → WhatsApp Welcome", triggerType: "lead.created" },
    { id: "tca-ua-2", name: "7-Seater Tag", triggerType: "field.updated" },
  ],
  "Aryaanya Group": [
    { id: "tca-ag-1", name: "New Lead → Assign", triggerType: "lead.assigned" },
  ],
};

// `when` is a plain ISO-local string (no trailing Z — deliberately parsed as local time via
// `new Date(str)`, same convention as the rest of this module's 7d/48h math).
export const SEED_TENANT_CRM_RUNS = {
  "Varun Group": [
    { id: "tcr-vg-1", automationId: "tca-vg-1", automationName: "New Lead → WhatsApp Welcome", triggerType: "lead.created", when: "2026-05-13T09:20:00", status: "Success" },
    { id: "tcr-vg-2", automationId: "tca-vg-2", automationName: "Idle Lead Nudge", triggerType: "lead.idle", when: "2026-05-12T14:10:00", status: "Success" },
    { id: "tcr-vg-3", automationId: "tca-vg-1", automationName: "New Lead → WhatsApp Welcome", triggerType: "lead.created", when: "2026-05-11T08:05:00", status: "Partial", failReason: "1 of 2 recipients had an invalid phone number" },
    { id: "tcr-vg-4", automationId: "tca-vg-3", automationName: "Fleet Buyer Tag", triggerType: "field.updated", when: "2026-05-09T16:40:00", status: "Success" },
  ],
  "Rezoni": [
    { id: "tcr-rz-1", automationId: "tca-rz-1", automationName: "WhatsApp auto-reply", triggerType: "whatsapp.reply", when: "2026-05-12T18:40:00", status: "Failed", failReason: "WhatsApp Business API token expired" },
    { id: "tcr-rz-2", automationId: "tca-rz-1", automationName: "WhatsApp auto-reply", triggerType: "whatsapp.reply", when: "2026-05-12T09:15:00", status: "Success" },
    { id: "tcr-rz-3", automationId: "tca-rz-2", automationName: "Cart Abandon Follow-up", triggerType: "lead.idle", when: "2026-05-10T11:00:00", status: "Success" },
  ],
  "MedLinks": [
    { id: "tcr-ml-1", automationId: "tca-ml-1", automationName: "New Patient Intake", triggerType: "lead.created", when: "2026-05-13T08:50:00", status: "Success" },
    { id: "tcr-ml-2", automationId: "tca-ml-2", automationName: "Appointment Reminder", triggerType: "field.updated", when: "2026-05-11T17:30:00", status: "Success" },
  ],
  "Derma Purtitys": [
    { id: "tcr-dp-1", automationId: "tca-dp-2", automationName: "New Lead → Assign Telecaller", triggerType: "lead.assigned", when: "2026-05-13T07:45:00", status: "Success" },
    { id: "tcr-dp-2", automationId: "tca-dp-1", automationName: "Returning Patient Tag", triggerType: "field.updated", when: "2026-05-08T13:20:00", status: "Success" },
  ],
  "Siama Skincare": [
    { id: "tcr-ss-1", automationId: "tca-ss-1", automationName: "Lead round-robin", triggerType: "lead.assigned", when: "2026-05-13T06:10:00", status: "Failed", failReason: "No active telecaller available in rotation" },
    { id: "tcr-ss-2", automationId: "tca-ss-2", automationName: "New Lead → WhatsApp", triggerType: "lead.created", when: "2026-05-12T10:00:00", status: "Success" },
    { id: "tcr-ss-3", automationId: "tca-ss-1", automationName: "Lead round-robin", triggerType: "lead.assigned", when: "2026-05-09T09:30:00", status: "Success" },
  ],
  "Mahakumbh Motors": [
    { id: "tcr-mm-1", automationId: "tca-mm-1", automationName: "Field sync — CarDekho", triggerType: "provider.sync", when: "2026-05-11T22:15:00", status: "Failed", failReason: "CarDekho API returned 500" },
    { id: "tcr-mm-2", automationId: "tca-mm-1", automationName: "Field sync — CarDekho", triggerType: "provider.sync", when: "2026-05-10T22:00:00", status: "Success" },
    { id: "tcr-mm-3", automationId: "tca-mm-2", automationName: "New Lead → WhatsApp Welcome", triggerType: "lead.created", when: "2026-05-08T12:00:00", status: "Success" },
  ],
  "Urban Autohub": [
    { id: "tcr-ua-1", automationId: "tca-ua-1", automationName: "New Lead → WhatsApp Welcome", triggerType: "lead.created", when: "2026-05-13T09:00:00", status: "Success" },
    { id: "tcr-ua-2", automationId: "tca-ua-2", automationName: "7-Seater Tag", triggerType: "field.updated", when: "2026-05-07T15:00:00", status: "Success" },
  ],
  "Aryaanya Group": [
    { id: "tcr-ag-1", automationId: "tca-ag-1", automationName: "New Lead → Assign", triggerType: "lead.assigned", when: "2026-05-12T11:00:00", status: "Success" },
  ],
};

export const getTenantCrmAutomations = (tenantName) => SEED_TENANT_CRM_AUTOMATIONS[tenantName] || [];
export const getTenantCrmRuns = (tenantName) => SEED_TENANT_CRM_RUNS[tenantName] || [];

export function fmtTenantCrmWhen(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const h = d.getHours(), m = String(d.getMinutes()).padStart(2, "0");
  const hh = ((h + 11) % 12) + 1, ap = h >= 12 ? "PM" : "AM";
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} · ${hh}:${m} ${ap}`;
}

// Everything the "CRM Automations" tab needs, computed against a caller-supplied "now" so it
// stays testable/consistent with the rest of the app's pinned-clock convention (LOGS_NOW).
export function computeTenantCrmSnapshot(tenantName, nowMs) {
  const automations = getTenantCrmAutomations(tenantName);
  const allRuns = getTenantCrmRuns(tenantName);
  const sevenDaysAgo = nowMs - 7 * 24 * 3600_000;
  const cutoff48h = nowMs - 48 * 3600_000;
  const runs7d = allRuns
    .filter((r) => new Date(r.when).getTime() >= sevenDaysAgo)
    .sort((a, b) => new Date(b.when) - new Date(a.when));
  const failed7d = runs7d.filter((r) => r.status === "Failed");
  const needsAttention = allRuns.some((r) => r.status === "Failed" && new Date(r.when).getTime() >= cutoff48h);
  return { configuredCount: automations.length, runs7d, failed7d, needsAttention };
}
