import React, { useState } from "react";
import {
  Mail, Bell, ArrowRight, Plus, X, Lock, Pencil, Copy, Trash2, PlayCircle, Download,
  AlertTriangle, ChevronDown, Eye, Zap, Bot, Send,
} from "lucide-react";
import { T, cx } from "../theme.js";
import { daysUntil } from "../lib/format.js";
import { NOW, ADMIN, ONBOARD_STAGES } from "../data/constants.js";
import { SEED_CLIENTS, SEED_ONBOARDING, SEED_INVOICES, SEED_USERS, SEED_HISTORY } from "../data/seed.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  Modal, Button, Card, CardHeader, CardBody, Badge, Table, Td, Menu, Tabs, PageHeader,
  Drawer, usePagination, Pagination, Switch,
} from "../components/ui.jsx";
import { LOGS_NOW } from "../data/logs.js";
import {
  KPI_PERIODS, CURRENT_PERIOD, TENANT_CRM_MONTHLY, TENANT_CRM_CONFIGURED_COUNT,
  computeInternalOpsMonthly, combineMonthly, computeTenantsNeedingAttention, monthLabelOfWhen,
} from "../data/automationKpis.js";

export const OPS_TRIGGER_TYPES = [
  { id: "health_below", label: "Tenant health score crosses a threshold" },
  { id: "renewal_approaching", label: "Subscription/renewal date approaching" },
  { id: "payment_failed", label: "Payment failed / overdue" },
  { id: "onboarding_stalled", label: "Onboarding stalled" },
  { id: "status_change", label: "Tenant status changes" },
];
export const OPS_TRIGGER_LABEL = Object.fromEntries(OPS_TRIGGER_TYPES.map((t) => [t.id, t.label]));
export const TENANT_STATUSES_FOR_TRIGGER = ["Trial", "Active", "Suspended"];

// Internal staff only — tenants have no login/in-app presence in this admin tool, so a
// tenant-facing action can only ever be email. The action builder below enforces this
// rather than letting you configure an in-app notification that could never be delivered.
export const AM_EMAILS = { "Saif Sir": "saif@ledsak.com", "Luv": "luv@ledsak.com", "Vishal": "vishal@ledsak.com" };

export const OPS_AUTOMATIONS_KEY = "ledsak_ops_automations_v1";
export const AUTOMATION_LOGS_KEY = "ledsak_automation_logs_v1";
export const loadOpsAutomations = () => { try { const s = localStorage.getItem(OPS_AUTOMATIONS_KEY); return s ? JSON.parse(s) : null; } catch { return null; } };
export const saveOpsAutomations = (d) => { try { localStorage.setItem(OPS_AUTOMATIONS_KEY, JSON.stringify(d)); } catch {} };
export const loadAutomationLogs = () => { try { const s = localStorage.getItem(AUTOMATION_LOGS_KEY); return s ? JSON.parse(s) : null; } catch { return null; } };
export const saveAutomationLogs = (d) => { try { localStorage.setItem(AUTOMATION_LOGS_KEY, JSON.stringify(d)); } catch {} };

export const emptyOpsCondition = (triggerType) => ({
  health_below: { comparison: "below", threshold: 50 },
  renewal_approaching: { daysBefore: 30 },
  payment_failed: { overdueByDays: null },
  onboarding_stalled: { stage: "Any", stuckForDays: 7 },
  status_change: { fromStatus: "", toStatus: "Active" },
}[triggerType]);

export function describeOpsTrigger(triggerType, condition) {
  switch (triggerType) {
    case "health_below": return `Health score ${condition.comparison} ${condition.threshold}`;
    case "renewal_approaching": return `Renewal within ${condition.daysBefore} days`;
    case "payment_failed": return condition.overdueByDays ? `Payment overdue ${condition.overdueByDays}+ days` : "Payment failed";
    case "onboarding_stalled": return `Stuck in ${condition.stage === "Any" ? "any stage" : condition.stage}, ${condition.stuckForDays}+ days`;
    case "status_change": return condition.fromStatus ? `${condition.fromStatus} → ${condition.toStatus}` : `Any → ${condition.toStatus}`;
    default: return "—";
  }
}

// Onboarding records don't store a separate "stage entered at" field — this derives it from
// the latest matching activity log entry, so "stuck for N days" reflects real dwell time.
export function stageEnteredAt(record) {
  const entry = record.activity.find((a) => a.what === `Stage set to ${record.currentStage}` || a.what.endsWith(`→ ${record.currentStage}`));
  return entry ? entry.when.split(" ").slice(0, 3).join(" ") : record.startedAt;
}

// Resolves who an action actually reaches and whether that's even possible — mirrors real
// failure modes (empty AM field, no tenant contact on record, suspended contact user)
// instead of assuming every send succeeds.
export function resolveOpsRecipient(action, tenant, users) {
  if (action.recipientType === "am") {
    if (!tenant.am) return { ok: false, label: "Assigned AM", reason: "AM field empty on tenant record" };
    return { ok: true, label: tenant.am, email: AM_EMAILS[tenant.am] || null };
  }
  const contact = users.find((u) => u.tenant === tenant.name && /admin|ceo/i.test(u.role));
  if (!contact) return { ok: false, label: tenant.name, reason: "No tenant contact on record" };
  if (contact.status === "Suspended") return { ok: false, label: contact.email, reason: "Tenant contact user is suspended" };
  return { ok: true, label: contact.email, email: contact.email };
}

// Pure evaluation against live tenant/onboarding/invoice/history state — used by both
// "Run now" and to seed historical-looking log entries. entityId on Tenant history rows is
// the numeric client id, matched back to a live client record.
export function evaluateOpsTrigger(automation, { clients, onboarding, invoices, history }) {
  const { triggerType, condition } = automation;
  const matches = [];
  if (triggerType === "health_below") {
    clients.forEach((c) => {
      const hit = condition.comparison === "below" ? c.health < condition.threshold : c.health > condition.threshold;
      if (hit) matches.push({ tenant: c, firedValue: `health score: ${c.health}, threshold: ${condition.threshold}` });
    });
  } else if (triggerType === "renewal_approaching") {
    clients.forEach((c) => {
      const days = daysUntil(c.planEnd);
      if (days !== null && days >= 0 && days <= condition.daysBefore) matches.push({ tenant: c, firedValue: `renewal in ${days}d (${c.planEnd})` });
    });
  } else if (triggerType === "payment_failed") {
    invoices.filter((i) => i.status === "Failed").forEach((inv) => {
      const c = clients.find((x) => x.name === inv.client);
      if (!c) return;
      const overdueDays = -daysUntil(inv.date);
      if (condition.overdueByDays && overdueDays < condition.overdueByDays) return;
      matches.push({ tenant: c, firedValue: `${inv.id} failed — ${inv.failReason} (${overdueDays}d ago)` });
    });
  } else if (triggerType === "onboarding_stalled") {
    onboarding.forEach((rec) => {
      if (condition.stage !== "Any" && rec.currentStage !== condition.stage) return;
      const stuckDays = -daysUntil(stageEnteredAt(rec));
      if (stuckDays >= condition.stuckForDays) {
        const c = clients.find((x) => x.name === rec.clientName) || { name: rec.clientName, am: rec.owner, health: null };
        matches.push({ tenant: c, firedValue: `stuck in ${rec.currentStage} for ${stuckDays}d` });
      }
    });
  } else if (triggerType === "status_change") {
    history.filter((h) => h.entityType === "Tenant" && h.action === "Status changed").forEach((h) => {
      if (condition.fromStatus && h.prev.status !== condition.fromStatus) return;
      if (h.next.status !== condition.toStatus) return;
      const c = clients.find((x) => x.id === h.entityId);
      if (!c) return;
      matches.push({ tenant: c, firedValue: `${h.prev.status} → ${h.next.status} on ${h.changedDate}` });
    });
  }
  return matches;
}

export function simulateOpsRun(automation, match, users, runId, when) {
  const actionResults = automation.actions.map((action) => {
    const r = resolveOpsRecipient(action, match.tenant, users);
    return { actionType: action.type, recipientType: action.recipientType, recipient: r.email || r.label, status: r.ok ? "Sent" : "Failed", failReason: r.ok ? null : r.reason };
  });
  const sentCount = actionResults.filter((a) => a.status === "Sent").length;
  const overallStatus = sentCount === actionResults.length ? "Success" : sentCount === 0 ? "Failed" : "Partial";
  return { id: runId, automationId: automation.id, automationTitle: automation.title, tenantName: match.tenant.name, triggerType: automation.triggerType, firedValue: match.firedValue, when, actions: actionResults, overallStatus };
}

export const SEED_OPS_AUTOMATIONS = [
  { id: "auto-1", title: "Health score drop alert", triggerType: "health_below", condition: { comparison: "below", threshold: 50 }, actions: [{ id: "a1", type: "email", recipientType: "am" }, { id: "a2", type: "in_app", recipientType: "am" }], status: "Active", createdBy: "Saif Khan", createdAt: "01 May 2026" },
  { id: "auto-2", title: "Renewal reminder — 30 days out", triggerType: "renewal_approaching", condition: { daysBefore: 30 }, actions: [{ id: "a1", type: "email", recipientType: "tenant" }], status: "Active", createdBy: "Saif Khan", createdAt: "01 May 2026" },
  { id: "auto-3", title: "Payment failure escalation", triggerType: "payment_failed", condition: { overdueByDays: null }, actions: [{ id: "a1", type: "email", recipientType: "am" }, { id: "a2", type: "email", recipientType: "tenant" }], status: "Active", createdBy: "Luv", createdAt: "03 May 2026" },
  { id: "auto-4", title: "Onboarding stalled nudge", triggerType: "onboarding_stalled", condition: { stage: "Any", stuckForDays: 7 }, actions: [{ id: "a1", type: "email", recipientType: "am" }, { id: "a2", type: "in_app", recipientType: "am" }], status: "Active", createdBy: "Vishal", createdAt: "05 May 2026" },
  { id: "auto-5", title: "Trial → Active conversion notice", triggerType: "status_change", condition: { fromStatus: "Trial", toStatus: "Active" }, actions: [{ id: "a1", type: "in_app", recipientType: "am" }], status: "Draft", createdBy: "Saif Khan", createdAt: "10 May 2026" },
];

// Seeds a realistic, time-spread log history by actually running the evaluator against the
// original seed data — so seeded logs can never drift out of sync with what the evaluator
// itself would produce for the same inputs.
export function seedAutomationLogs() {
  const ctx = { clients: SEED_CLIENTS, onboarding: SEED_ONBOARDING, invoices: SEED_INVOICES, history: SEED_HISTORY };
  const raw = [];
  let n = 0;
  SEED_OPS_AUTOMATIONS.filter((a) => a.status === "Active").forEach((automation) => {
    evaluateOpsTrigger(automation, ctx).forEach((m) => {
      n++;
      const d = new Date(2026, 4, 13, 9, 0, 0);
      d.setHours(d.getHours() - n * 9);
      raw.push({ automation, match: m, date: d });
    });
  });
  raw.sort((a, b) => b.date - a.date);
  return raw.map((r, i) => simulateOpsRun(r.automation, r.match, SEED_USERS, `run-${1001 + i}`, r.date.toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })));
}
export const SEED_AUTOMATION_LOGS = seedAutomationLogs();

export const opsStatusTone = { Success: "success", Partial: "warning", Failed: "danger", Sent: "success" };
export const opsActionIcon = { email: Mail, in_app: Bell };
export const opsActionLabel = { email: "Email", in_app: "In-app notification" };
export const opsRecipientLabel = { am: "Assigned Account Manager", tenant: "Tenant" };

/* ---- Condition fields, rendered per selected trigger type ---- */
export function OpsConditionFields({ triggerType, condition, onChange }) {
  const fieldCls = "border rounded-lg px-2.5 py-1.5 text-[13px] outline-none";
  const fieldStyle = { borderColor: T.border };
  if (triggerType === "health_below") return (
    <div className="flex items-center gap-2">
      <span className="text-[13px]" style={{ color: T.text2 }}>Health score</span>
      <select value={condition.comparison} onChange={(e) => onChange({ ...condition, comparison: e.target.value })} className={fieldCls} style={fieldStyle}>
        <option value="below">below</option><option value="above">above</option>
      </select>
      <input type="number" value={condition.threshold} onChange={(e) => onChange({ ...condition, threshold: +e.target.value })} className={cx(fieldCls, "w-20")} style={fieldStyle} />
    </div>
  );
  if (triggerType === "renewal_approaching") return (
    <div className="flex items-center gap-2">
      <span className="text-[13px]" style={{ color: T.text2 }}>Days before expiry</span>
      <input type="number" value={condition.daysBefore} onChange={(e) => onChange({ ...condition, daysBefore: +e.target.value })} className={cx(fieldCls, "w-20")} style={fieldStyle} />
    </div>
  );
  if (triggerType === "payment_failed") return (
    <div className="flex items-center gap-2">
      <span className="text-[13px]" style={{ color: T.text2 }}>Overdue by (days) — optional</span>
      <input type="number" placeholder="Any" value={condition.overdueByDays ?? ""} onChange={(e) => onChange({ ...condition, overdueByDays: e.target.value ? +e.target.value : null })} className={cx(fieldCls, "w-24")} style={fieldStyle} />
    </div>
  );
  if (triggerType === "onboarding_stalled") return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[13px]" style={{ color: T.text2 }}>Stage</span>
      <select value={condition.stage} onChange={(e) => onChange({ ...condition, stage: e.target.value })} className={fieldCls} style={fieldStyle}>
        <option value="Any">Any stage</option>{ONBOARD_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <span className="text-[13px]" style={{ color: T.text2 }}>stuck for (days)</span>
      <input type="number" value={condition.stuckForDays} onChange={(e) => onChange({ ...condition, stuckForDays: +e.target.value })} className={cx(fieldCls, "w-20")} style={fieldStyle} />
    </div>
  );
  if (triggerType === "status_change") return (
    <div className="flex items-center gap-2 flex-wrap">
      <select value={condition.fromStatus} onChange={(e) => onChange({ ...condition, fromStatus: e.target.value })} className={fieldCls} style={fieldStyle}>
        <option value="">Any status</option>{TENANT_STATUSES_FOR_TRIGGER.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <ArrowRight size={14} style={{ color: T.text3 }} />
      <select value={condition.toStatus} onChange={(e) => onChange({ ...condition, toStatus: e.target.value })} className={fieldCls} style={fieldStyle}>
        {TENANT_STATUSES_FOR_TRIGGER.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
  return null;
}

/* ---- Create / Edit automation modal ---- */
export function OpsAutomationModal({ onClose, onSave, initial }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [triggerType, setTriggerType] = useState(initial?.triggerType || "health_below");
  const [condition, setCondition] = useState(initial?.condition || emptyOpsCondition("health_below"));
  const [actions, setActions] = useState(initial?.actions || [{ id: "a-" + Date.now(), type: "email", recipientType: "am" }]);
  const [status, setStatus] = useState(initial?.status || "Draft");

  const handleTriggerChange = (t) => { setTriggerType(t); setCondition(emptyOpsCondition(t)); };
  const updateAction = (i, patch) => setActions((prev) => prev.map((a, idx) => idx !== i ? a : { ...a, ...patch, ...(patch.type === "in_app" && a.recipientType === "tenant" ? { recipientType: "am" } : {}) }));
  const addAction = () => setActions((prev) => [...prev, { id: "a-" + Date.now(), type: "email", recipientType: "am" }]);
  const removeAction = (i) => setActions((prev) => prev.filter((_, idx) => idx !== i));

  const canSave = title.trim() && actions.length > 0;
  const handleSave = () => {
    if (!canSave) return;
    onSave({ id: initial?.id || "auto-" + Date.now(), title: title.trim(), triggerType, condition, actions, status, createdBy: initial?.createdBy || ADMIN, createdAt: initial?.createdAt || NOW });
  };

  return (
    <Modal open onClose={onClose} title={initial ? "Edit Automation" : "New Automation"}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!canSave} onClick={handleSave}>Save</Button></>}>
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Health score drop alert" className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none" style={{ borderColor: T.border }} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Trigger</label>
          <select value={triggerType} onChange={(e) => handleTriggerChange(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none mb-2.5" style={{ borderColor: T.border }}>
            {OPS_TRIGGER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <div className="rounded-lg border p-3" style={{ borderColor: T.border, background: T.subtle }}>
            <OpsConditionFields triggerType={triggerType} condition={condition} onChange={setCondition} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Actions</label>
            <button onClick={addAction} className="text-[12px] font-semibold flex items-center gap-1" style={{ color: T.primary }}><Plus size={13} />Add action</button>
          </div>
          <div className="space-y-2">
            {actions.map((a, i) => (
              <div key={a.id} className="rounded-lg border p-2.5 space-y-1.5" style={{ borderColor: T.border }}>
                <div className="flex items-center gap-2">
                  <select value={a.type} onChange={(e) => updateAction(i, { type: e.target.value })} className="border rounded-lg px-2 py-1.5 text-[12px] outline-none flex-1" style={{ borderColor: T.border }}>
                    <option value="email">Email</option><option value="in_app">In-app notification</option>
                  </select>
                  <select value={a.recipientType} onChange={(e) => updateAction(i, { recipientType: e.target.value })} className="border rounded-lg px-2 py-1.5 text-[12px] outline-none flex-1" style={{ borderColor: T.border }}>
                    <option value="am">Assigned Account Manager</option>
                    <option value="tenant" disabled={a.type === "in_app"}>Tenant</option>
                  </select>
                  {actions.length > 1 && <button onClick={() => removeAction(i)} className="p-1 rounded hover:bg-[var(--t-hover)] shrink-0"><X size={14} style={{ color: T.text3 }} /></button>}
                </div>
                {a.type === "in_app" && (
                  <div className="text-[11px] flex items-start gap-1" style={{ color: T.text3 }}><Lock size={11} className="shrink-0 mt-0.5" />Tenants have no in-app presence in this admin tool — in-app notifications can only reach internal staff.</div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Status</label>
          <div className="flex gap-2">
            {["Draft", "Active"].map((s) => (
              <button key={s} onClick={() => setStatus(s)} className="px-3 py-1.5 rounded-lg text-[13px] font-medium border" style={status === s ? { borderColor: T.primary, background: T.primarySoft, color: T.accentText } : { borderColor: T.border, color: T.text2 }}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ---- Automations list (Title, Trigger, Status, Actions) ---- */
export function OpsAutomationsSection() {
  const store = useStore();
  const [automations, setAutomationsRaw] = useState(() => loadOpsAutomations() || SEED_OPS_AUTOMATIONS);
  const [logs, setLogsRaw] = useState(() => loadAutomationLogs() || SEED_AUTOMATION_LOGS);
  const [modal, setModal] = useState(null); // { mode: "create" | "edit", automation }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [running, setRunning] = useState(null);

  const setAutomations = (updater) => setAutomationsRaw((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveOpsAutomations(next); return next; });
  const setLogs = (updater) => setLogsRaw((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveAutomationLogs(next); return next; });

  const handleSave = (automation) => {
    setAutomations((prev) => prev.some((a) => a.id === automation.id) ? prev.map((a) => a.id === automation.id ? automation : a) : [automation, ...prev]);
    store.notify(`"${automation.title}" saved`);
    setModal(null);
  };

  const handleDuplicate = (a) => {
    const copy = { ...a, id: "auto-" + Date.now(), title: a.title + " (copy)", status: "Draft" };
    setAutomations((prev) => [copy, ...prev]);
    store.notify(`Duplicated as "${copy.title}"`);
  };

  const handleDelete = () => {
    setAutomations((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    store.notify(`"${deleteTarget.title}" deleted`);
    setDeleteTarget(null);
  };

  const toggleStatus = (a) => {
    const next = { ...a, status: a.status === "Active" ? "Draft" : "Active" };
    setAutomations((prev) => prev.map((x) => x.id === a.id ? next : x));
    store.notify(next.status === "Active" ? `"${a.title}" activated` : `"${a.title}" set to draft`);
  };

  const runNow = (automation) => {
    setRunning(automation.id);
    setTimeout(() => {
      const matches = evaluateOpsTrigger(automation, { clients: store.clients, onboarding: store.onboarding, invoices: store.invoices, history: store.history });
      const newLogs = matches.map((m, i) => simulateOpsRun(automation, m, store.users, `run-${Date.now()}-${i}`, new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })));
      setLogs((prev) => [...newLogs, ...prev]);
      const sent = newLogs.reduce((s, l) => s + l.actions.filter((a) => a.status === "Sent").length, 0);
      const failed = newLogs.reduce((s, l) => s + l.actions.filter((a) => a.status === "Failed").length, 0);
      store.notify(matches.length === 0 ? `"${automation.title}" — no tenants currently match` : `"${automation.title}" ran: ${matches.length} tenant(s) matched · ${sent} sent, ${failed} failed`);
      setRunning(null);
    }, 900);
  };

  return (
    <>
      <Card>
        <CardHeader title="Internal Ops Automation" sub="Watches tenant health, renewals, payments and onboarding — notifies the assigned AM or the tenant"
          action={<Button variant="primary" onClick={() => setModal({ mode: "create" })}><Plus size={15} />New Automation</Button>} />
        <Table head={["Title", "Trigger", "Actions", "Status", ""]}>
          {automations.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-10 text-[13px]" style={{ color: T.text3 }}>No automations yet.</td></tr>
          ) : automations.map((a) => (
            <tr key={a.id} className="hover:bg-[#F8F9FC]">
              <Td className="font-medium">{a.title}</Td>
              <Td>
                <div className="text-[13px]" style={{ color: T.text }}>{OPS_TRIGGER_LABEL[a.triggerType]}</div>
                <div className="text-[11px]" style={{ color: T.text3 }}>{describeOpsTrigger(a.triggerType, a.condition)}</div>
              </Td>
              <Td>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {a.actions.map((act) => { const Icon = opsActionIcon[act.type]; return (
                    <span key={act.id} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full" style={{ background: T.subtle, color: T.text2 }}><Icon size={11} />{opsRecipientLabel[act.recipientType]}</span>
                  ); })}
                </div>
              </Td>
              <Td>
                <button onClick={() => toggleStatus(a)}><Badge tone={a.status === "Active" ? "success" : "gray"}>{a.status}</Badge></button>
              </Td>
              <Td>
                <div className="flex items-center gap-1">
                  {a.status === "Active" && (
                    <button onClick={() => runNow(a)} disabled={running === a.id} title="Run now" className="p-1 rounded hover:bg-[var(--t-hover)]"><PlayCircle size={15} className={running === a.id ? "animate-pulse" : ""} style={{ color: T.success }} /></button>
                  )}
                  <Menu items={[
                    { label: "Edit", icon: Pencil, onClick: () => setModal({ mode: "edit", automation: a }) },
                    { label: "Duplicate", icon: Copy, onClick: () => handleDuplicate(a) },
                    { label: "Delete", icon: Trash2, danger: true, onClick: () => setDeleteTarget(a) },
                  ]} />
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {modal && (
        <OpsAutomationModal
          initial={modal.mode === "edit" ? modal.automation : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <Modal open onClose={() => setDeleteTarget(null)} title="Delete Automation"
          footer={<><Button onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" onClick={handleDelete}><Trash2 size={13} />Delete</Button></>}>
          <p className="text-[13px]" style={{ color: T.text2 }}>Delete <strong style={{ color: T.text }}>{deleteTarget.title}</strong>? Its past run logs stay in Automation Logs, but it will stop firing.</p>
        </Modal>
      )}
    </>
  );
}

/* ---- Run detail drawer — mirrors Queue Monitor's Failed Jobs pattern: exact failure
   reason and payload-equivalent (per-action breakdown), not a bare status badge. ---- */
export function AutomationRunDrawer({ run, open, onClose }) {
  if (!open || !run) return null;
  return (
    <Drawer open={open} onClose={onClose} width={480}>
      <div className="sticky top-0 bg-[var(--t-surface)] border-b z-10 px-6 pt-5 pb-4 flex items-start justify-between" style={{ borderColor: T.border }}>
        <div>
          <div className="text-[15px] font-semibold" style={{ color: T.text }}>{run.automationTitle}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge tone={opsStatusTone[run.overallStatus]}>{run.overallStatus}</Badge>
            <span className="text-[12px]" style={{ color: T.text3 }}>{run.id}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--t-hover)]"><X size={18} style={{ color: T.text3 }} /></button>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[["Tenant", run.tenantName], ["Run Time", run.when], ["Trigger", OPS_TRIGGER_LABEL[run.triggerType]], ["Fired on", run.firedValue]].map(([k, v]) => (
            <div key={k} className={k === "Fired on" ? "col-span-2" : ""}>
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>{k}</div>
              <div className="text-[13px] mt-0.5" style={{ color: T.text }}>{v}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Actions</div>
          <div className="space-y-2">
            {run.actions.map((a, i) => { const Icon = opsActionIcon[a.actionType]; return (
              <div key={i} className="rounded-lg p-3 space-y-1" style={{ background: a.status === "Sent" ? T.successSoft : T.dangerSoft, border: `1px solid ${a.status === "Sent" ? T.successBorder : T.dangerBorder}` }}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: T.text }}><Icon size={13} />{opsActionLabel[a.actionType]} → {opsRecipientLabel[a.recipientType]}</span>
                  <Badge tone={a.status === "Sent" ? "success" : "danger"}>{a.status}</Badge>
                </div>
                <div className="text-[12px]" style={{ color: T.text2 }}>{a.recipient || "—"}</div>
                {a.failReason && <div className="text-[11px] px-2 py-1 rounded mt-1" style={{ background: T.dangerStrong, color: T.dangerStrongFg }}>{a.failReason}</div>}
              </div>
            ); })}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

/* ---- Automation Logs — Failed/Partial surfaced first, same lesson as Queue Monitor and
   Lead & Record Mgmt: don't bury the runs that need attention in a table of healthy ones. ---- */
export function AutomationLogsSection({ openTenant, initialTenantFilter, initialStatusFilter, initialPeriod }) {
  const store = useStore();
  const [logs] = useState(() => loadAutomationLogs() || SEED_AUTOMATION_LOGS);
  // A preset status/period (arriving from a KPI click above) means we're looking for a
  // specific slice, not just what needs review — "Needs review" would hide Success rows and
  // make a "Success rate" drill-through land on an empty table.
  const [view, setView] = useState(initialStatusFilter || initialPeriod ? "all" : "attention");
  const [filterAutomation, setFilterAutomation] = useState("All");
  const [filterTenant, setFilterTenant] = useState(initialTenantFilter || "All");
  const [filterStatus, setFilterStatus] = useState(initialStatusFilter || "All");
  const [filterPeriod, setFilterPeriod] = useState(initialPeriod || "All time");
  const [selectedRun, setSelectedRun] = useState(null);

  const automationTitles = ["All", ...Array.from(new Set(logs.map((l) => l.automationTitle)))];
  const tenantNames = ["All", ...Array.from(new Set(logs.map((l) => l.tenantName)))];
  const periodOptions = ["All time", ...KPI_PERIODS];

  const filtered = logs.filter((l) => {
    if (view === "attention" && l.overallStatus === "Success") return false;
    if (filterAutomation !== "All" && l.automationTitle !== filterAutomation) return false;
    if (filterTenant !== "All" && l.tenantName !== filterTenant) return false;
    if (filterStatus !== "All" && l.overallStatus !== filterStatus) return false;
    if (filterPeriod !== "All time" && monthLabelOfWhen(l.when) !== filterPeriod) return false;
    return true;
  });
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);

  const handleExport = () => {
    const rows = filtered.map((l) => ({ id: l.id, automation: l.automationTitle, tenant: l.tenantName, trigger: OPS_TRIGGER_LABEL[l.triggerType], firedValue: l.firedValue, when: l.when, status: l.overallStatus }));
    const csv = [Object.keys(rows[0] || { id: "" }).join(","), ...rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `automation-logs-${Date.now()}.csv`; a.click();
  };

  return (
    <Card className="flex flex-col">
      <CardHeader title="Internal Ops Automation Logs" sub="Every trigger evaluation and action attempt — Internal Ops automations only" action={<Button onClick={handleExport}><Download size={14} />Export CSV</Button>} />
      <div className="mx-5 mt-4 rounded-lg border px-3.5 py-2.5 flex items-start gap-2" style={{ borderColor: T.border, background: T.subtle }}>
        <AlertTriangle size={14} style={{ color: T.text3 }} className="shrink-0 mt-0.5" />
        <p className="text-[12px]" style={{ color: T.text2 }}>
          This table covers <strong>Internal Ops run history only</strong> (health/renewal/payment/onboarding/status) — the only source with real per-run rows. LEDSAK's tenant-facing CRM automation system (lead routing, WhatsApp sends, pipeline updates) runs on a separate product with no shared pipeline or API into this admin app, so its individual runs can't be listed here; the KPI panel above folds its aggregate monthly totals into the combined numbers, but only Internal Ops runs are ever listed row-by-row.
        </p>
      </div>
      <Tabs tabs={["Needs review", "All runs"]} value={view === "attention" ? "Needs review" : "All runs"} onChange={(v) => { setView(v === "Needs review" ? "attention" : "all"); setPage(1); }} />
      <div className="px-5 py-3 border-b flex flex-wrap gap-2 items-center" style={{ borderColor: T.border }}>
        {[
          { label: "Automation", value: filterAutomation, set: setFilterAutomation, opts: automationTitles },
          { label: "Tenant", value: filterTenant, set: setFilterTenant, opts: tenantNames },
          { label: "Status", value: filterStatus, set: setFilterStatus, opts: ["All", "Success", "Partial", "Failed"] },
          { label: "Period", value: filterPeriod, set: setFilterPeriod, opts: periodOptions },
        ].map(({ label, value, set, opts }) => (
          <div key={label} className="relative">
            <select value={value} onChange={(e) => { set(e.target.value); setPage(1); }} className="appearance-none pl-2.5 pr-6 py-1.5 rounded-lg border text-[12px] outline-none" style={{ borderColor: value !== "All" && value !== "All time" ? T.primary : T.border, background: value !== "All" && value !== "All time" ? T.primarySoft : T.surface, color: T.text }}>
              {opts.map((o) => <option key={o} value={o}>{o === "All" ? `All ${label === "Status" ? "Statuses" : label + "s"}` : o}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
          </div>
        ))}
        <span className="text-[12px] ml-auto" style={{ color: T.text3 }}>{filtered.length} runs</span>
      </div>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
      <Table head={["Automation", "Tenant", "Trigger", "Run Time", "Status", ""]}>
        {pageRows.length === 0 ? (
          <tr><td colSpan={6} className="text-center py-10 text-[13px]" style={{ color: T.text3 }}>No runs match the current filters.</td></tr>
        ) : pageRows.map((l) => (
          <tr key={l.id} className="hover:bg-[#F8F9FC] cursor-pointer" onClick={() => setSelectedRun(l)}>
            <Td className="font-medium">{l.automationTitle}</Td>
            <Td>
              <button onClick={(e) => { e.stopPropagation(); const c = store.clients.find((x) => x.name === l.tenantName); if (c) openTenant?.(c); }} className="hover:underline" style={{ color: openTenant ? T.primary : T.text }}>{l.tenantName}</button>
            </Td>
            <Td className="text-[12px]" style={{ color: T.text2 }}>{OPS_TRIGGER_LABEL[l.triggerType]}</Td>
            <Td className="text-[11px] whitespace-nowrap" style={{ color: T.text2 }}>{l.when}</Td>
            <Td><Badge tone={opsStatusTone[l.overallStatus]}>{l.overallStatus}</Badge></Td>
            <Td><button onClick={(e) => { e.stopPropagation(); setSelectedRun(l); }} className="p-1 rounded hover:bg-[var(--t-hover)]"><Eye size={14} style={{ color: T.text3 }} /></button></Td>
          </tr>
        ))}
      </Table>
      <AutomationRunDrawer run={selectedRun} open={!!selectedRun} onClose={() => setSelectedRun(null)} />
    </Card>
  );
}

/* ---- Global Automation KPIs — combines Internal Ops (real run logs) + Tenant-CRM
   (mocked aggregate, no run-level access — see data/automationKpis.js) into one set of
   totals. Sits above the tab bar so it's visible regardless of which tab is active; this is
   the "expansion" of the old static "Every trigger evaluation and action attempt" line. ---- */
function Sparkline({ values, tone }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-7">
      {values.map((v, i) => {
        const pct = Math.max(0.1, v / max);
        const isLast = i === values.length - 1;
        return <div key={i} title={String(Math.round(v * 10) / 10)} className="flex-1 rounded-sm" style={{ height: `${pct * 100}%`, background: tone, opacity: isLast ? 1 : 0.3 + pct * 0.35 }} />;
      })}
    </div>
  );
}
function KpiTile({ label, value, sub, sparkValues, sparkTone, onClick }) {
  return (
    <div onClick={onClick} className={cx("rounded-xl border p-4 text-left", onClick && "cursor-pointer hover:-translate-y-0.5 transition-transform")}
      style={{ background: T.surface, borderColor: T.border, boxShadow: "0 2px 8px rgba(26,31,54,.07)" }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>{label}</div>
      <div className="text-[22px] leading-none font-bold mt-2 tracking-tight" style={{ color: T.text }}>{value}</div>
      {sub && <div className="text-[11px] mt-1.5" style={{ color: T.text2 }}>{sub}</div>}
      {sparkValues && <div className="mt-3"><Sparkline values={sparkValues} tone={sparkTone || T.primary} /></div>}
    </div>
  );
}
function GlobalAutomationKpis({ onDrill, onNeedsAttention }) {
  const logs = loadAutomationLogs() || SEED_AUTOMATION_LOGS;
  const automations = loadOpsAutomations() || SEED_OPS_AUTOMATIONS;

  const internalMonthly = computeInternalOpsMonthly(logs);
  const combined = combineMonthly(internalMonthly, TENANT_CRM_MONTHLY);
  const current = combined[combined.length - 1]; // May 2026, MTD
  const prevFull = combined[combined.length - 2]; // Apr 2026, full month — the "this period" reference for KPIs 2-4

  const totalConfigured = automations.length + TENANT_CRM_CONFIGURED_COUNT;
  const successRate = (row) => (row.totalRuns ? Math.round((row.successRuns / row.totalRuns) * 100) : 0);
  const failRate = (row) => 100 - successRate(row);

  const needsAttention = computeTenantsNeedingAttention(logs, LOGS_NOW.getTime());

  const runsSpark = combined.map((r) => r.totalRuns);
  const successSpark = combined.map(successRate);
  const failSpark = combined.map(failRate);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
      <KpiTile label="Automations Configured" value={String(totalConfigured)} sub={`${automations.length} internal ops · ${TENANT_CRM_CONFIGURED_COUNT} tenant CRM`} />
      <KpiTile label={`Total Runs — ${CURRENT_PERIOD}`} value={current.totalRuns.toLocaleString("en-IN")} sub={`vs ${prevFull.totalRuns.toLocaleString("en-IN")} in ${prevFull.month}`} sparkValues={runsSpark} sparkTone={T.primary} onClick={() => onDrill({ status: "All", period: CURRENT_PERIOD })} />
      <KpiTile label={`Success Rate — ${CURRENT_PERIOD}`} value={`${successRate(current)}%`} sub="Did not fail" sparkValues={successSpark} sparkTone={T.success} onClick={() => onDrill({ status: "Success", period: CURRENT_PERIOD })} />
      <KpiTile label={`Failure Rate — ${CURRENT_PERIOD}`} value={`${failRate(current)}%`} sub="Failed outright" sparkValues={failSpark} sparkTone={T.danger} onClick={() => onDrill({ status: "Failed", period: CURRENT_PERIOD })} />
      <KpiTile label="Needs Attention" value={String(needsAttention.size)} sub="Tenants with a failure in the last 48h" onClick={needsAttention.size ? onNeedsAttention : undefined} />
      <KpiTile label={`MTD — ${CURRENT_PERIOD}`} value={`${current.totalRuns.toLocaleString("en-IN")} runs`} sub={`${successRate(current)}% success so far this month`} />
    </div>
  );
}

export function AutomationPage({ go, openTenant, filter }) {
  const store = useStore();
  const [tab, setTab] = useState(filter?.tab || "Lead Routing");
  const [pendingLogsFilter, setPendingLogsFilter] = useState(null); // { status, period } from a KPI click
  const [rules, setRules] = useState([
    { id: 1, name: "Auto-assign leads", trigger: "New lead", on: true }, { id: 2, name: "Idle lead nudge", trigger: "48h no contact", on: true },
    { id: 3, name: "Churn watch", trigger: "Health < 50", on: true }, { id: 4, name: "Renewal reminder", trigger: "30d before expiry", on: false },
  ]);
  const steps = [{ icon: Zap, t: "Trigger: New lead from CarWale", d: "Webhook received", tone: T.primary }, { icon: Bot, t: "AI: Summarize & score", d: "OpenAI enrichment", tone: T.purple }, { icon: Send, t: "Assign to telecaller", d: "Round-robin by brand", tone: T.success }];

  const drillIntoLogs = (preset) => { setPendingLogsFilter(preset); setTab("Internal Ops Logs"); window.scrollTo(0, 0); };

  return (<>
    <PageHeader title="Automation Center" desc={tab === "Lead Routing" ? "Workflows, triggers and lead-routing rules" : tab === "Internal Ops" ? "LEDSAK's own tenant-state automations — not tenant-facing" : "Every trigger evaluation and action attempt — Internal Ops only"} />
    <GlobalAutomationKpis onDrill={drillIntoLogs} onNeedsAttention={() => go?.("clients")} />
    <Tabs tabs={["Lead Routing", "Internal Ops", "Internal Ops Logs"]} value={tab} onChange={setTab} />
    {tab === "Lead Routing" && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2"><CardHeader title="Lead Routing Workflow" sub="Active · 12,480 runs this month" action={<Badge tone="success">Running</Badge>} /><CardBody className="space-y-2">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex gap-3 items-center rounded-lg border p-3.5" style={{ borderColor: i === 0 ? T.primary : T.border, boxShadow: "0 1px 2px rgba(26,31,54,.05)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}><s.icon size={18} style={{ color: s.tone }} /></div>
                <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{s.t}</div><div className="text-xs" style={{ color: T.text2 }}>{s.d}</div></div>
              </div>
              {i < steps.length - 1 && <div className="text-center text-sm" style={{ color: T.text3 }}>↓</div>}
            </React.Fragment>
          ))}
        </CardBody></Card>
        <Card><CardHeader title="Active Rules" /><CardBody className="space-y-1">
          {rules.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: T.border }}>
              <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{r.name}</div><div className="text-xs" style={{ color: T.text2 }}><Zap size={11} style={{ color: T.primary, display: "inline", marginRight: 3 }} />{r.trigger}</div></div>
              <Switch on={r.on} onClick={() => { setRules((rs) => rs.map((x) => x.id === r.id ? { ...x, on: !x.on } : x)); store.notify(r.on ? "Rule paused" : "Rule enabled"); }} />
            </div>
          ))}
        </CardBody></Card>
      </div>
    )}
    {tab === "Internal Ops" && <OpsAutomationsSection />}
    {tab === "Internal Ops Logs" && (
      <AutomationLogsSection
        key={pendingLogsFilter ? JSON.stringify(pendingLogsFilter) : "logs-default"}
        openTenant={openTenant}
        initialTenantFilter={filter?.tenant}
        initialStatusFilter={pendingLogsFilter?.status}
        initialPeriod={pendingLogsFilter?.period}
      />
    )}
  </>);
}
