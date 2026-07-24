import React, { useState, useMemo, useRef } from "react";
import {
  Mail, MessageSquare, Phone, CheckCircle2, XCircle, X, LogIn, Power, Ban, UserPlus,
  Clock, TriangleAlert, RefreshCw, Key, PhoneCall, Flag, GitBranch, ArrowRight,
  AlertTriangle, Eye, Download, Plus, ChevronDown, ChevronRight, ExternalLink,
} from "lucide-react";
import { T, cx } from "../theme.js";
import { fmtINR, parseDate, isTaskOverdue } from "../lib/format.js";
import { STEP_TYPE_ICON, NOW } from "../data/constants.js";
import { STATS } from "../data/seed.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  Drawer, Avatar, StarToggle, Button, Tabs, Card, CardHeader, CardBody, Field, Badge,
  Table, Td, NameCell, Menu, Kpi, Modal, PageHeader, SearchInput, FilterPill, Pagination,
  SelectAllHeader, RowCheckbox, usePagination, useRowSelection, BulkActionsMenu, Progress,
  statusBadge, taskStatusBadge,
} from "../components/ui.jsx";
import {
  TaskActionsMenu, AssignPlaybookModal, LogContactModal, TaskDoneModal, TaskSkipModal,
  TaskNoteModal,
} from "./CustomerSuccessPage.jsx";
import { loadAutomationLogs, SEED_AUTOMATION_LOGS, OPS_TRIGGER_LABEL, opsStatusTone } from "./AutomationPage.jsx";
import { LOGS_NOW } from "../data/logs.js";
import { computeTenantCrmSnapshot, fmtTenantCrmWhen, TENANT_CRM_TRIGGER_LABEL } from "../data/tenantCrmAutomations.js";

/* ============================================================
   CRM AUTOMATIONS (per-tenant, last 7d) — the tenant's own lead-routing/
   WhatsApp/field automations, distinct from the "Automations" tab above
   (which is Internal Ops — LEDSAK's own automations, not the tenant's).
   Row expansion is a plain inline toggle, not a shared drawer: the only
   existing "Run Details" UI (AutomationRunDrawer in AutomationPage.jsx) is
   hard-wired to Internal Ops' run shape (OPS_TRIGGER_LABEL, email/in-app
   actions to AM/Tenant) and isn't generic — see the doc's Open questions
   for generalizing it rather than duplicating that coupling here.
   ============================================================ */
function CrmCountTile({ label, value, tone, onClick, sub }) {
  const clickable = typeof onClick === "function";
  return (
    <div onClick={onClick} role={clickable ? "button" : undefined} tabIndex={clickable ? 0 : undefined}
      className={cx("rounded-xl border p-3.5", clickable && "cursor-pointer hover:-translate-y-0.5 transition-transform")}
      style={{ background: T.surface, borderColor: T.border, boxShadow: "0 1px 3px rgba(26,31,54,.06)" }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>{label}</div>
      <div className="text-[20px] leading-none font-bold mt-1.5" style={{ color: tone || T.text }}>{value}</div>
      {sub && <div className="text-[11px] mt-1" style={{ color: T.text2 }}>{sub}</div>}
    </div>
  );
}
// Automation names don't link anywhere yet — deep-linking into a tenant's own LEDSAK
// instance (their Automation/Flow Automations builder) is a separate integration this admin
// app doesn't have. Shown with a muted external-link glyph + tooltip rather than either
// faking a working link or hiding the intended affordance entirely.
function CrmAutomationName({ name }) {
  return (
    <span className="inline-flex items-center gap-1" title="Opens this automation's builder in the tenant's own LEDSAK instance — deep link not available yet" style={{ color: T.text }}>
      {name}<ExternalLink size={11} style={{ color: T.text3 }} />
    </span>
  );
}
function TenantCrmAutomationsPanel({ tenantName }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [automationFilter, setAutomationFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const tableRef = useRef(null);

  const { configuredCount, runs7d, failed7d, needsAttention } = useMemo(
    () => computeTenantCrmSnapshot(tenantName, LOGS_NOW.getTime()),
    [tenantName]
  );
  const automationNames = ["All", ...Array.from(new Set(runs7d.map((r) => r.automationName)))];
  const filtered = runs7d.filter((r) =>
    (statusFilter === "All" || r.status === statusFilter) &&
    (automationFilter === "All" || r.automationName === automationFilter)
  );

  const applyAndScroll = (status) => {
    setStatusFilter(status);
    setAutomationFilter("All");
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border px-3.5 py-2.5 flex items-start gap-2" style={{ borderColor: T.border, background: T.subtle }}>
        <AlertTriangle size={13} style={{ color: T.text3 }} className="shrink-0 mt-0.5" />
        <p className="text-[12px]" style={{ color: T.text2 }}>This tenant's own CRM automations (lead routing, WhatsApp sends, field updates) — a separate system from Internal Ops, above. Scoped to the last 7 days; manual (non-automated) operations aren't included.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <CrmCountTile label="Automations Configured" value={String(configuredCount)} />
        <CrmCountTile label="Runs (7d)" value={String(runs7d.length)} onClick={runs7d.length ? () => applyAndScroll("All") : undefined} />
        <CrmCountTile label="Failed (7d)" value={String(failed7d.length)} tone={failed7d.length ? T.danger : undefined} onClick={failed7d.length ? () => applyAndScroll("Failed") : undefined} />
      </div>
      {needsAttention && (
        <button onClick={() => applyAndScroll("Failed")} className="w-full flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-left" style={{ borderColor: T.dangerBorder, background: T.dangerSoft }}>
          <TriangleAlert size={14} style={{ color: T.dangerFg }} />
          <span className="text-[13px] font-medium" style={{ color: T.dangerFg }}>Needs attention — a CRM automation failed in the last 48h</span>
        </button>
      )}
      <Card>
        <div ref={tableRef} />
        <CardHeader title={`Last 7 Days (${runs7d.length} run${runs7d.length === 1 ? "" : "s"})`} />
        <div className="px-5 py-3 border-b flex flex-wrap gap-2 items-center" style={{ borderColor: T.border }}>
          <div className="relative">
            <select value={automationFilter} onChange={(e) => setAutomationFilter(e.target.value)} className="appearance-none pl-2.5 pr-6 py-1.5 rounded-lg border text-[12px] outline-none" style={{ borderColor: automationFilter !== "All" ? T.primary : T.border, background: automationFilter !== "All" ? T.primarySoft : T.surface, color: T.text }}>
              {automationNames.map((n) => <option key={n} value={n}>{n === "All" ? "All Automations" : n}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none pl-2.5 pr-6 py-1.5 rounded-lg border text-[12px] outline-none" style={{ borderColor: statusFilter !== "All" ? T.primary : T.border, background: statusFilter !== "All" ? T.primarySoft : T.surface, color: T.text }}>
              {["All", "Success", "Partial", "Failed"].map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
          </div>
          <span className="text-[12px] ml-auto" style={{ color: T.text3 }}>{filtered.length} of {runs7d.length} runs</span>
        </div>
        <Table head={["", "Automation", "Trigger", "Run Time", "Status"]}>
          {filtered.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-10 text-[13px]" style={{ color: T.text3 }}>{runs7d.length === 0 ? "No CRM automation runs in the last 7 days." : "No runs match the current filters."}</td></tr>
          ) : filtered.map((r) => (
            <React.Fragment key={r.id}>
              <tr onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="cursor-pointer hover:bg-[#F8F9FC]">
                <Td><button onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === r.id ? null : r.id); }} className="p-0.5 rounded hover:bg-[var(--t-hover)]">{expandedId === r.id ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</button></Td>
                <Td className="font-medium"><CrmAutomationName name={r.automationName} /></Td>
                <Td className="text-xs" style={{ color: T.text2 }}>{TENANT_CRM_TRIGGER_LABEL[r.triggerType] || r.triggerType}</Td>
                <Td className="text-xs font-mono" style={{ color: T.text2 }}>{fmtTenantCrmWhen(r.when)}</Td>
                <Td><Badge tone={opsStatusTone[r.status]}>{r.status}</Badge></Td>
              </tr>
              {expandedId === r.id && (
                <tr><Td colSpan={5} style={{ background: T.subtle }}>
                  <div className="py-1.5 space-y-1 text-[12px]" style={{ color: T.text2 }}>
                    <div><span style={{ color: T.text3 }}>Run ID:</span> <span className="font-mono">{r.id}</span></div>
                    <div><span style={{ color: T.text3 }}>Trigger type:</span> <span className="font-mono">{r.triggerType}</span></div>
                    {r.failReason && <div style={{ color: T.danger }}>{r.status === "Failed" ? "Failure" : "Note"} reason: {r.failReason}</div>}
                    {!r.failReason && r.status === "Success" && <div>Completed successfully.</div>}
                  </div>
                </Td></tr>
              )}
            </React.Fragment>
          ))}
        </Table>
      </Card>
    </div>
  );
}

export function Tenant360({ tenant, onClose, starred, onToggleStar, go }) {
  const store = useStore();
  const [tab, setTab] = useState("Overview");
  const [seatModal, setSeatModal] = useState(false);
  const [seatN, setSeatN] = useState(5);
  const [assignPlaybookOpen, setAssignPlaybookOpen] = useState(false);
  const [doneTask, setDoneTask] = useState(null);
  const [skipTask, setSkipTask] = useState(null);
  const [noteTask, setNoteTask] = useState(null);
  const [logContactOpen, setLogContactOpen] = useState(false);
  if (!tenant) return null;
  const c = store.clients.find((x) => x.id === tenant.id) || tenant;
  const tenantUsers = store.users.filter((u) => u.tenant === c.name);
  const tenantInvoices = store.invoices.filter((i) => i.client === c.name);
  const tenantTasks = store.tenantTasks.filter((t) => t.tenantId === c.id);
  const renewalDays = (() => {
    const [d, m, y] = c.planEnd.split("-").map(Number);
    return Math.round((new Date(y, m - 1, d) - new Date("2026-05-13")) / 864e5);
  })();
  const activityFeed = [
    ...store.contactLogs.filter((cl) => cl.tenantId === c.id).map((cl) => ({
      key: "cl-" + cl.id,
      icon: cl.type === "Call" ? Phone : cl.type === "Email" ? Mail : MessageSquare,
      color: cl.type === "Call" ? T.primary : cl.type === "Email" ? T.purple : T.text3,
      title: `${cl.type}: ${cl.notes}`,
      subtitle: `${cl.outcome} · ${cl.loggedBy} · ${cl.loggedDate}`,
      date: parseDate(cl.loggedDate),
    })),
    ...tenantTasks.filter((t) => t.status === "Done" || t.status === "Skipped").map((t) => ({
      key: "tk-" + t.id,
      icon: t.status === "Done" ? CheckCircle2 : XCircle,
      color: t.status === "Done" ? T.success : T.warning,
      title: `Task ${t.status}: ${t.title}`,
      subtitle: `${t.playbookName} · ${t.assignedTo} · ${t.completedDate || t.dueDate}`,
      date: parseDate(t.completedDate || t.dueDate),
    })),
  ].sort((a, b) => (b.date || 0) - (a.date || 0));

  return (
    <Drawer open={!!tenant} onClose={onClose}>
      {/* header */}
      <div className="sticky top-0 bg-[var(--t-surface)] border-b z-10" style={{ borderColor: T.border }}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <Avatar name={c.name} tone={c.industry === "Clinic" ? "purple" : "brand"} size={44} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold" style={{ color: T.text }}>{c.name}</h2>
                {statusBadge(c.status)}
                {onToggleStar && <StarToggle starred={starred} onToggle={() => onToggleStar(c.id)} />}
              </div>
              <div className="text-[13px]" style={{ color: T.text2 }}>{c.industry} · {c.branch} · {c.plan}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--t-hover)]"><X size={18} style={{ color: T.text3 }} /></button>
        </div>
        {/* quick actions */}
        <div className="flex gap-2 px-6 pb-3 flex-wrap">
          <Button size="sm" variant="primary" onClick={() => store.impersonate(c.name)}><LogIn size={13} /> Log in as client</Button>
          {c.status === "Suspended"
            ? <Button size="sm" onClick={() => store.setTenantStatus(c.id, "Active")}><Power size={13} /> Reactivate</Button>
            : <Button size="sm" variant="danger" onClick={() => store.setTenantStatus(c.id, "Suspended")}><Ban size={13} /> Suspend</Button>}
          <Button size="sm" onClick={() => setSeatModal(true)}><UserPlus size={13} /> Add seats</Button>
          {c.status === "Trial" && <Button size="sm" onClick={() => store.extendTrial(c.id, 14)}><Clock size={13} /> Extend trial</Button>}
        </div>
        <div className="px-6"><Tabs tabs={["Overview", "Users", "Billing", "Activity", "Tasks", "Automations", "CRM Automations"]} value={tab} onChange={setTab} /></div>
      </div>

      <div className="px-6 py-5">
        {tab === "Overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Kpi label="Leads (LTD)" value={c.leads.toLocaleString("en-IN")} />
              <Kpi label="MRR" value={c.mrr ? fmtINR(c.mrr) : "—"} />
              <Kpi label="Health" value={String(c.health)} trend={c.health >= 75 ? "pos" : "neg"} sub={c.churnRisk + " risk"} />
            </div>
            <Card><CardHeader title="Account Details" />
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Account Manager">{c.am}</Field>
                  <Field label="GST Number"><span className="font-mono text-xs">{c.gst}</span></Field>
                  <Field label="Seats">{tenantUsers.length} used / {c.seats} licensed</Field>
                  <Field label="AI Summaries Used">{c.aiUsed}</Field>
                  <Field label="Storage Usage">{c.usage} GB</Field>
                  <Field label="Last Login">{c.lastLogin}</Field>
                  <Field label="Plan Renewal">
                    <span style={{ color: renewalDays < 0 ? T.danger : renewalDays < 30 ? T.warning : T.text }}>
                      {c.planEnd} {renewalDays < 0 ? `(${-renewalDays}d overdue)` : `(${renewalDays}d left)`}
                    </span>
                  </Field>
                  <Field label="Lead Provider">
                    <span className="inline-flex items-center gap-1.5">{c.provider}
                      {c.providerOk ? <Badge tone="success">Synced</Badge> : <Badge tone="danger">Down</Badge>}</span>
                  </Field>
                </div>
              </CardBody>
            </Card>
            {!c.providerOk && (
              <div className="flex gap-3 items-center p-3.5 rounded-lg" style={{ background: T.dangerSoft, borderLeft: `3px solid ${T.danger}` }}>
                <TriangleAlert size={18} style={{ color: T.danger }} />
                <div className="flex-1"><div className="text-[13px] font-medium" style={{ color: T.text }}>{c.provider} lead feed is down</div><div className="text-xs" style={{ color: T.text2 }}>No leads received in 26 hours — reconnect required</div></div>
                <Button size="sm" onClick={() => store.notify("Reconnect link sent to tenant admin")}><RefreshCw size={13} /> Reconnect</Button>
              </div>
            )}
          </div>
        )}
        {tab === "Users" && (
          <Card>
            <CardHeader title={`Users (${tenantUsers.length})`} action={<Button size="sm" variant="primary" onClick={() => store.notify(`Invite sent for ${c.name}`)}><UserPlus size={13} /> Invite</Button>} />
            <Table head={["User", "Role", "Status", ""]}>
              {tenantUsers.length ? tenantUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F8F9FC]">
                  <Td><NameCell name={u.name} sub={u.email} /></Td>
                  <Td><Badge tone={u.role.includes("CMO") || u.role.includes("CEO") ? "brand" : "gray"}>{u.role}</Badge></Td>
                  <Td>{statusBadge(u.status)}</Td>
                  <Td><Menu items={[
                    { label: "Impersonate", icon: LogIn, onClick: () => store.impersonate(u) },
                    { label: "Reset password", icon: Key, onClick: () => store.resetPassword(u.name) },
                    { divider: true },
                    u.status === "Suspended"
                      ? { label: "Reactivate", icon: Power, onClick: () => store.setUserStatus(u.id, "Active") }
                      : { label: "Suspend", icon: Ban, danger: true, onClick: () => store.setUserStatus(u.id, "Suspended") },
                  ]} /></Td>
                </tr>
              )) : <tr><Td colSpan={4} className="text-center py-8" style={{ color: T.text3 }}>No users seeded for this tenant</Td></tr>}
            </Table>
          </Card>
        )}
        {tab === "Billing" && (
          <Card>
            <CardHeader title="Invoices" />
            <Table head={["Invoice", "Amount", "Date", "Status", ""]}>
              {tenantInvoices.length ? tenantInvoices.map((iv) => (
                <tr key={iv.id} className="hover:bg-[#F8F9FC]">
                  <Td className="font-mono text-xs">{iv.id}</Td>
                  <Td className="font-medium">{fmtINR(iv.amt)}</Td>
                  <Td className="text-xs" style={{ color: T.text2 }}>{iv.date}</Td>
                  <Td>{statusBadge(iv.status)}</Td>
                  <Td>{iv.status === "Failed" && <Button size="sm" onClick={() => store.retryInvoice(iv.id)}><RefreshCw size={13} /> Retry</Button>}</Td>
                </tr>
              )) : <tr><Td colSpan={5} className="text-center py-8" style={{ color: T.text3 }}>No invoices on record</Td></tr>}
            </Table>
          </Card>
        )}
        {tab === "Activity" && (
          <Card>
            <CardHeader title="Activity" action={<Button size="sm" onClick={() => setLogContactOpen(true)}><PhoneCall size={13} /> Log Contact</Button>} />
            <CardBody className="space-y-3">
              {!activityFeed.length && <div className="text-center py-6 text-[13px]" style={{ color: T.text3 }}>No activity recorded</div>}
              {activityFeed.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.key} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: T.subtle }}><Icon size={14} style={{ color: a.color }} /></div>
                    <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{a.title}</div><div className="text-xs" style={{ color: T.text2 }}>{a.subtitle}</div></div>
                  </div>
                );
              })}
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: T.subtle }}><Flag size={14} style={{ color: T.text3 }} /></div>
                <div><div className="text-[13px] font-medium" style={{ color: T.text }}>Account created</div><div className="text-xs" style={{ color: T.text2 }}>initial setup</div></div>
              </div>
            </CardBody>
          </Card>
        )}
        {tab === "Tasks" && (
          <Card>
            <CardHeader title={`Tasks (${tenantTasks.length})`} action={<Button size="sm" variant="primary" onClick={() => setAssignPlaybookOpen(true)}><GitBranch size={13} /> Assign Playbook</Button>} />
            <Table head={["Title", "Type", "Due Date", "Status", "Assigned To", ""]}>
              {tenantTasks.length ? tenantTasks.map((t) => {
                const overdue = isTaskOverdue(t);
                const Icon = STEP_TYPE_ICON[t.type];
                return (
                  <tr key={t.id} className="hover:bg-[#F8F9FC]" style={overdue ? { background: T.dangerSoft } : undefined}>
                    <Td className="font-medium">{t.title}</Td>
                    <Td><span className="inline-flex items-center gap-1.5 text-xs" style={{ color: T.text2 }}><Icon size={13} />{t.type}</span></Td>
                    <Td className="text-xs font-mono" style={{ color: overdue ? T.danger : T.text2 }}>{t.dueDate}{overdue ? " (overdue)" : ""}</Td>
                    <Td>{taskStatusBadge(t.status)}</Td>
                    <Td className="text-xs" style={{ color: T.text2 }}>{t.assignedTo}</Td>
                    <Td><TaskActionsMenu task={t}
                      onMarkDone={() => setDoneTask(t)}
                      onMarkInProgress={() => store.updateTaskStatus(t.id, "In Progress")}
                      onSkip={() => setSkipTask(t)}
                      onAddNote={() => setNoteTask(t)} /></Td>
                  </tr>
                );
              }) : <tr><Td colSpan={6} className="text-center py-8" style={{ color: T.text3 }}>No tasks assigned yet</Td></tr>}
            </Table>
          </Card>
        )}
        {tab === "Automations" && (() => {
          const tenantLogs = (loadAutomationLogs() || SEED_AUTOMATION_LOGS).filter((l) => l.tenantName === c.name);
          const counts = { Success: 0, Partial: 0, Failed: 0 };
          tenantLogs.forEach((l) => { counts[l.overallStatus] = (counts[l.overallStatus] || 0) + 1; });
          const needsReview = tenantLogs.filter((l) => l.overallStatus !== "Success");
          return (
            <div className="space-y-4">
              <div className="rounded-lg border px-3.5 py-2.5 flex items-start gap-2" style={{ borderColor: T.border, background: T.subtle }}>
                <AlertTriangle size={13} style={{ color: T.text3 }} className="shrink-0 mt-0.5" />
                <p className="text-[12px]" style={{ color: T.text2 }}>Internal Ops automation runs only (health/renewal/payment/onboarding/status) — LEDSAK's own automations, not the tenant's. For this tenant's own CRM automations (lead routing, WhatsApp, field updates), see the <strong>CRM Automations</strong> tab.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Kpi label="Success" value={String(counts.Success)} trend="pos" />
                <Kpi label="Partial" value={String(counts.Partial)} trend={counts.Partial > 0 ? "warn" : undefined} />
                <Kpi label="Failed" value={String(counts.Failed)} trend={counts.Failed > 0 ? "neg" : undefined} />
              </div>
              <Card>
                <CardHeader title="Runs needing review" sub={needsReview.length === 0 ? "All recent runs succeeded" : `${needsReview.length} partial/failed run(s)`}
                  action={<Button size="sm" onClick={() => go?.("automation", { tenant: c.name, tab: "Internal Ops Logs" })}>View full run history <ArrowRight size={13} /></Button>} />
                {needsReview.length > 0 && (
                  <CardBody className="space-y-2">
                    {needsReview.map((l) => (
                      <div key={l.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: T.border }}>
                        <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{l.automationTitle}</div><div className="text-xs" style={{ color: T.text2 }}>{OPS_TRIGGER_LABEL[l.triggerType]} · {l.when}</div></div>
                        <Badge tone={opsStatusTone[l.overallStatus]}>{l.overallStatus}</Badge>
                      </div>
                    ))}
                  </CardBody>
                )}
              </Card>
            </div>
          );
        })()}
        {tab === "CRM Automations" && <TenantCrmAutomationsPanel tenantName={c.name} />}
      </div>

      <AssignPlaybookModal tenant={assignPlaybookOpen ? c : null} onClose={() => setAssignPlaybookOpen(false)} />
      <TaskDoneModal task={doneTask} onClose={() => setDoneTask(null)} />
      <TaskSkipModal task={skipTask} onClose={() => setSkipTask(null)} />
      <TaskNoteModal task={noteTask} onClose={() => setNoteTask(null)} />
      <LogContactModal tenant={logContactOpen ? c : null} onClose={() => setLogContactOpen(false)} />

      <Modal open={seatModal} onClose={() => setSeatModal(false)} title={`Add seats — ${c.name}`}
        footer={<><Button onClick={() => setSeatModal(false)}>Cancel</Button><Button variant="primary" onClick={() => { store.addSeats(c.id, seatN); setSeatModal(false); }}>Add {seatN} seats</Button></>}>
        <Field label="Number of seats to add">
          <input type="number" value={seatN} onChange={(e) => setSeatN(Number(e.target.value))} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: T.border, "--tw-ring-color": T.ring }} />
        </Field>
        <p className="text-xs mt-3" style={{ color: T.text2 }}>Current: {c.seats} licensed · {tenantUsers.length} in use. Billing adjusts on next cycle.</p>
      </Modal>
    </Drawer>
  );
}

/* ============================================================
   ADD TENANT — modal form for provisioning a new client
   ============================================================ */
const TENANT_INDUSTRIES = ["Ecommerce", "Clinic", "Automotive", "Education", "Other"];
const TENANT_AMS = ["Saif Sir", "Luv", "Vishal"];
const TENANT_PROVIDERS = ["CarWale", "CarDekho", "Website", "WhatsApp", "Website + WhatsApp"];
const EMPTY_TENANT_FORM = { name: "", industry: "Ecommerce", branch: "", plan: "", am: "Saif Sir", provider: "Website", seats: 5, mrr: 5000, gst: "", isTrial: false };

export function AddTenantModal({ open, onClose, onCreated }) {
  const store = useStore();
  const [form, setForm] = useState(EMPTY_TENANT_FORM);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [errors, setErrors] = useState({});
  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const publishedPlans = (store.spPlans || []).filter((p) => p.planType === "Published" && p.status === "Active");
  const chosenPlan = publishedPlans.find((p) => String(p.id) === String(selectedPlanId));

  const handleClose = () => { setForm(EMPTY_TENANT_FORM); setSelectedPlanId(""); setBillingCycle("Monthly"); setErrors({}); onClose(); };

  const submit = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Client name is required";
    if (!form.branch.trim()) errs.branch = "Branch / city is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const planEnd = (() => {
      const d = new Date("2026-05-13"); d.setDate(d.getDate() + (form.isTrial ? 14 : 365));
      return d.toLocaleDateString("en-GB").split("/").join("-");
    })();
    const planName = chosenPlan ? chosenPlan.planName : (form.isTrial ? "Trial" : "");
    const client = store.addTenant({ ...form, name: form.name.trim(), branch: form.branch.trim(), plan: planName, planEnd });

    if (chosenPlan && client) {
      const price = billingCycle === "Yearly" ? chosenPlan.yearlyPrice : chosenPlan.monthlyPrice;
      store.createSubscription({
        companyId: client.id, companyName: client.name, planId: chosenPlan.id, planName: chosenPlan.planName,
        billingCycle, status: form.isTrial ? "Trial" : "Active", startDate: NOW,
        renewalDate: billingCycle === "Yearly" ? "13 May 2027" : "13 Jun 2026",
        isTrial: form.isTrial, trialEnd: form.isTrial ? planEnd : null,
        basePrice: price, addons: [], discount: null, subtotal: price, finalPrice: price, notes: "",
      });
    }

    handleClose();
    onCreated?.(client);
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Client"
      footer={<><Button onClick={handleClose}>Cancel</Button><Button variant="primary" onClick={submit}>Add Client</Button></>}>
      <div className="space-y-3">
        <Field label="Client name">
          <input value={form.name} onChange={(e) => u("name", e.target.value)} placeholder="e.g. Nexa Auto Group"
            className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: errors.name ? T.danger : T.border, "--tw-ring-color": T.ring }} />
          {errors.name && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.name}</div>}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Industry">
            <select value={form.industry} onChange={(e) => u("industry", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
              {TENANT_INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Branch / City">
            <input value={form.branch} onChange={(e) => u("branch", e.target.value)} placeholder="e.g. New Delhi"
              className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: errors.branch ? T.danger : T.border, "--tw-ring-color": T.ring }} />
            {errors.branch && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.branch}</div>}
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Account Manager">
            <select value={form.am} onChange={(e) => u("am", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
              {TENANT_AMS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Lead Provider">
            <select value={form.provider} onChange={(e) => u("provider", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
              {TENANT_PROVIDERS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
        </div>
        {/* Plan assignment */}
        <div className="rounded-xl border p-3 space-y-2" style={{ borderColor: T.ring, background: T.primarySoft }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Plan (optional)</div>
          <div className="grid grid-cols-2 gap-2">
            <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border, background: T.surface }}>
              <option value="">No plan yet</option>
              {publishedPlans.map((p) => <option key={p.id} value={p.id}>{p.planName} · {fmtINR(p.monthlyPrice)}/mo</option>)}
            </select>
            <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} disabled={!chosenPlan} className="px-3 py-2 rounded-lg border text-[13px] outline-none disabled:opacity-40" style={{ borderColor: T.border, background: T.surface }}>
              <option>Monthly</option><option>Yearly</option>
            </select>
          </div>
          {chosenPlan && (
            <div className="text-[12px] flex justify-between pt-1" style={{ color: T.text2 }}>
              <span>{chosenPlan.planName} · {billingCycle}</span>
              <span className="font-semibold" style={{ color: T.primary }}>{fmtINR(billingCycle === "Yearly" ? chosenPlan.yearlyPrice : chosenPlan.monthlyPrice)}{billingCycle === "Yearly" ? "/yr" : "/mo"}</span>
            </div>
          )}
        </div>
        <Field label="GST Number (optional)">
          <input value={form.gst} onChange={(e) => u("gst", e.target.value.toUpperCase())} placeholder="e.g. 07AAECR1234K1Z9"
            className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: T.border, "--tw-ring-color": T.ring }} />
        </Field>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isTrial} onChange={(e) => u("isTrial", e.target.checked)} className="w-4 h-4 rounded" /><span className="text-[13px]">Start as free trial (14 days)</span></label>
      </div>
    </Modal>
  );
}

/* ============================================================
   CLIENTS — full data, working filters, provisioning
   ============================================================ */

export function ClientsPage({ go }) {
  const store = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [risk, setRisk] = useState("All");
  const [industry, setIndustry] = useState("All");
  const [selected, setSelected] = useState(null);
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [starred, setStarred] = useState(() => new Set());
  const toggleStar = (id) => setStarred((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const usedSeatsMap = useMemo(() => {
    const m = {};
    store.users.forEach((u) => { m[u.tenant] = (m[u.tenant] || 0) + 1; });
    return m;
  }, [store.users]);

  const industries = ["All", ...Array.from(new Set(store.clients.map((c) => c.industry)))];

  const rows = useMemo(() => store.clients.filter((c) =>
    (c.name.toLowerCase().includes(q.toLowerCase()) || c.branch.toLowerCase().includes(q.toLowerCase())) &&
    (status === "All" || c.status === status) &&
    (risk === "All" || c.churnRisk === risk) &&
    (industry === "All" || c.industry === industry)
  ), [store.clients, q, status, risk, industry]);

  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(rows, 10);
  const sel = useRowSelection(pageRows, rows);

  const menuFor = (c) => (
    <Menu items={[
      { label: "View 360", icon: Eye, onClick: () => setSelected(c) },
      { label: "Log in as client", icon: LogIn, onClick: () => store.impersonate(c.name) },
      { label: "Add seats", icon: UserPlus, onClick: () => setSelected(c) },
      { divider: true },
      c.status === "Suspended"
        ? { label: "Reactivate", icon: Power, onClick: () => store.setTenantStatus(c.id, "Active") }
        : { label: "Suspend", icon: Ban, danger: true, onClick: () => store.setTenantStatus(c.id, "Suspended") },
    ]} />
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="Clients" desc={`${store.clients.length} shown · ${STATS.total} total · ${STATS.subscribed} paid`}
        actions={sel.isSome
          ? <BulkActionsMenu count={sel.selected.size} onAction={(kind) => { store.notify(`${kind === "whatsapp" ? "WhatsApp" : "Email"} queued for ${sel.selected.size} client(s)`); sel.clear(); }} />
          : <><Button onClick={() => store.notify("Clients exported")}><Download size={15} /> Export</Button><Button variant="primary" onClick={() => setAddTenantOpen(true)}><Plus size={15} /> Add Client</Button></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Total Clients" value={String(STATS.total)} sub={`${rows.length} shown`} />
        <Kpi label="Paid" value={String(STATS.subscribed)} sub={`${Math.round((STATS.subscribed / STATS.total) * 100)}% conversion`} trend="pos" />
        <Kpi label="Free Trial" value={String(STATS.free)} sub="on free plan" />
        <Kpi label="Blocked" value={String(STATS.blocked)} sub="suspended / churned" trend={STATS.blocked > 0 ? "neg" : undefined} />
      </div>
      <div className="flex gap-2 items-center mb-3.5 flex-wrap shrink-0">
        <SearchInput value={q} onChange={setQ} placeholder="Search name or branch…" />
        <span className="text-[11px] font-semibold uppercase tracking-wider ml-1" style={{ color: T.text3 }}>Status</span>
        {["All", "Active", "Trial", "Suspended"].map((f) => <FilterPill key={f} active={status === f} onClick={() => setStatus(f)}>{f}</FilterPill>)}
        <span className="text-[11px] font-semibold uppercase tracking-wider ml-1" style={{ color: T.text3 }}>Risk</span>
        {["All", "High", "Medium", "Low"].map((f) => <FilterPill key={f} active={risk === f} onClick={() => setRisk(f)}>{f}</FilterPill>)}
        <span className="text-[11px] font-semibold uppercase tracking-wider ml-1" style={{ color: T.text3 }}>Industry</span>
        <div className="relative">
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
            {industries.map((i) => <option key={i}>{i}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
        </div>
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} selectedCount={sel.selected.size} />
        <Table head={[<SelectAllHeader key="__all" sel={sel} />, "Client", "Industry", "Plan", "Leads", "AI", "Usage", "Seats", "MRR", "Health", "Risk", "Owner", "Status", ""]}>
          {pageRows.map((c) => (
            <tr key={c.id} className={cx("group hover:bg-[#F8F9FC]", sel.selected.has(c.id) && "bg-[#EEF2FF]")}>
              <Td><div className="flex items-center gap-1.5">
                <RowCheckbox checked={sel.selected.has(c.id)} onChange={(e, shiftKey) => sel.toggle(c.id, { shiftKey })} />
                <StarToggle starred={starred.has(c.id)} onToggle={() => toggleStar(c.id)} />
              </div></Td>
              <Td><NameCell name={c.name} sub={c.branch} hideAvatar onClick={() => setSelected(c)} /></Td>
              <Td><span style={{ color: T.text2 }}>{c.industry}</span></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{c.plan}</Td>
              <Td className="font-medium">{c.leads.toLocaleString("en-IN")}</Td>
              <Td>{c.aiUsed}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{c.usage} GB</Td>
              <Td className="text-xs">{usedSeatsMap[c.name] || 0}/{c.seats}</Td>
              <Td className="font-medium">{c.mrr ? fmtINR(c.mrr) : "—"}</Td>
              <Td><Progress value={c.health} /></Td>
              <Td>{statusBadge(c.churnRisk)}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{c.am}</Td>
              <Td>{statusBadge(c.status)}</Td>
              <Td>{menuFor(c)}</Td>
            </tr>
          ))}
          {!rows.length && <tr><Td colSpan={14} className="text-center py-10" style={{ color: T.text3 }}>No clients match these filters</Td></tr>}
        </Table>
      </Card>
      <Tenant360 tenant={selected} onClose={() => setSelected(null)} starred={selected ? starred.has(selected.id) : false} onToggleStar={toggleStar} go={go} />
      <AddTenantModal open={addTenantOpen} onClose={() => setAddTenantOpen(false)} onCreated={(client) => { setPage(1); setSelected(client); }} />
    </div>
  );
}
