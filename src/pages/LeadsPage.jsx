import React, { useState, useMemo, useCallback } from "react";
import {
  CheckCircle2, AlertTriangle, Copy, XCircle, Lock, X, Sparkles, RefreshCw, Plug,
  ArrowUpRight, ArrowDownRight, TriangleAlert, Hash, ChevronDown, Download, Eye, Building2,
  Tag, Flag,
} from "lucide-react";
import { T, cx } from "../theme.js";
import { ADMIN, ONBOARD_OWNERS } from "../data/constants.js";
import { SEED_CLIENTS } from "../data/seed.js";
import {
  LEAD_SOURCES, LEAD_PROC_STATES, LEAD_STATUSES, LEAD_TENANTS, SEED_LEADS,
  LEAD_SOURCES_DATA, TENANT_TIER, TIER_TONE, FILTER_PLURAL, simpleHash, digitsOnly, last4Hash,
  mockFailureDebug, mockMatchInfo, isAuthFailure, computeIntegrationHealth, maskPhone, maskName,
  maskEmail, loadLeads, saveLeads, loadLeadAudit, saveLeadAudit, loadPIIGrants, savePIIGrants,
} from "../data/leads.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  Modal, Button, Drawer, Avatar, Tabs, Badge, PageHeader, Card, CardHeader, CardBody, Table,
  Td, Menu, SearchInput, Pagination, usePagination, useRowSelection, SelectAllHeader,
  RowCheckbox,
} from "../components/ui.jsx";

/* ---- PII Access Request Modal ---- */
export function PIIAccessModal({ open, onClose, onGranted, leadId }) {
  const [justification, setJustification] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (!open) return null;
  const handleSubmit = () => {
    if (!justification.trim()) return;
    const grant = { id: "pii-" + Date.now(), requestedBy: ADMIN, justification, leadId: leadId || "all", grantedAt: new Date().toLocaleString("en-IN"), expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleString("en-IN"), status: "approved" };
    const existing = loadPIIGrants();
    savePIIGrants([grant, ...existing]);
    const audit = loadLeadAudit();
    saveLeadAudit([{ id: "audit-" + Date.now(), action: `PII access granted for ${leadId || "all leads"}`, by: ADMIN, justification, when: grant.grantedAt, type: "PII Access" }, ...audit]);
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setJustification(""); onGranted(grant); onClose(); }, 1200);
  };
  return (
    <Modal open={open} onClose={onClose} title="Request PII Access"
      footer={!submitted && <><Button onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!justification.trim()} onClick={handleSubmit}>Submit Request</Button></>}>
      {submitted ? (
        <div className="text-center py-4"><CheckCircle2 size={36} style={{ color: T.success }} className="mx-auto mb-2" /><p className="font-semibold" style={{ color: T.text }}>Access Granted (4 hours)</p><p className="text-[13px] mt-1" style={{ color: T.text2 }}>Logged to audit trail.</p></div>
      ) : (
        <div className="space-y-3">
          <p className="text-[13px]" style={{ color: T.text2 }}>PII access is gated and time-boxed to 4 hours. Your justification will be written to the audit log.</p>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Business Justification <span style={{ color: T.danger }}>*</span></label>
            <textarea value={justification} onChange={(e) => setJustification(e.target.value)} rows={3} placeholder="e.g. Investigating duplicate merge for Varun Group — support case TKT-812"
              className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none resize-none" style={{ borderColor: T.border }} />
          </div>
          <div className="rounded-lg px-3 py-2 text-[12px] flex items-start gap-2" style={{ background: T.warningSoft, color: T.warningFg }}>
            <AlertTriangle size={14} className="shrink-0 mt-0.5" /> Access is time-boxed (4h), role-checked, and logged. Unauthorized access triggers a security alert.
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ---- Duplicate Review Modal ---- */
// Contact fields render as match/mismatch indicators, never as raw values — a reviewer
// without PII access can still judge a duplicate off name/phone/email equality alone.
export function DuplicateReviewModal({ open, onClose, lead, leads, onMerge, onDismiss, piiGranted }) {
  if (!open || !lead) return null;
  const original = leads.find((l) => l.id === lead.duplicateOf);
  const match = mockMatchInfo(lead);
  const fields = original ? [
    { k: "Name", a: lead.name, b: original.name },
    { k: "Phone", a: lead.phone, b: original.phone },
    { k: "Email", a: lead.email, b: original.email },
  ] : [];
  return (
    <Modal open={open} onClose={onClose} title="Review Duplicate Lead"
      footer={<><Button onClick={() => onDismiss(lead.id)}>Not a duplicate — keep both</Button><Button variant="primary" onClick={() => onMerge(lead.id, lead.duplicateOf)}>Merge into original</Button></>}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: T.purpleSoft }}>
          <Copy size={14} style={{ color: T.purple }} />
          <span className="text-[12px]" style={{ color: T.purpleFg }}><strong>{match.reason}</strong> · {match.confidence}% confidence</span>
        </div>
        {original ? (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: T.border }}>
            <div className="grid grid-cols-3 text-[11px] font-semibold uppercase tracking-wider px-3 py-2" style={{ background: T.subtle, color: T.text3 }}>
              <span>Field</span><span>{lead.id} (duplicate)</span><span>{original.id} (original)</span>
            </div>
            {fields.map(({ k, a, b }) => {
              const isMatch = a === b;
              return (
                <div key={k} className="grid grid-cols-3 items-center px-3 py-2 border-t text-[13px]" style={{ borderColor: T.border }}>
                  <span style={{ color: T.text3 }}>{k}</span>
                  <span className="flex items-center gap-1.5" style={{ color: T.text }}>
                    {piiGranted ? a : "•• masked ••"}
                  </span>
                  <span className="flex items-center gap-1.5" style={{ color: T.text }}>
                    {isMatch ? <CheckCircle2 size={13} style={{ color: T.success }} /> : <XCircle size={13} style={{ color: T.danger }} />}
                    <span style={{ color: isMatch ? T.success : T.danger }}>{isMatch ? "Match" : "Differs"}</span>
                  </span>
                </div>
              );
            })}
            <div className="grid grid-cols-3 px-3 py-2 border-t text-[12px]" style={{ borderColor: T.border, color: T.text2 }}>
              <span style={{ color: T.text3 }}>Source → Tenant</span><span>{lead.source} → {lead.tenant}</span><span>{original.source} → {original.tenant}</span>
            </div>
            <div className="grid grid-cols-3 px-3 py-2 border-t text-[12px]" style={{ borderColor: T.border, color: T.text2 }}>
              <span style={{ color: T.text3 }}>Received</span><span>{lead.receivedAt}</span><span>{original.receivedAt}</span>
            </div>
          </div>
        ) : <p className="text-[13px]" style={{ color: T.text3 }}>Original lead record not found (may have been merged already).</p>}
        {!piiGranted && (
          <p className="text-[11px] flex items-center gap-1.5" style={{ color: T.text3 }}><Lock size={11} />Contact values stay masked here too — the match/mismatch verdict above is enough to review without exposing PII.</p>
        )}
        <p className="text-[12px]" style={{ color: T.text3 }}>Merging marks this lead resolved; either action is written to the audit trail.</p>
      </div>
    </Modal>
  );
}

/* ---- Lead Detail Drawer ---- */
export function LeadDetailDrawer({ lead, leads, open, onClose, piiGranted, onRequestPII, onReprocess, onStatusChange, onAssign, goToTenant, goToIntegrations }) {
  const [histTab, setHistTab] = useState("details");
  if (!open || !lead) return null;
  const masked = !piiGranted;
  const duplicate = leads.find((l) => l.id === lead.duplicateOf);
  const tier = TENANT_TIER[lead.tenant] || "Growth";
  const procIcon = { success: CheckCircle2, partial: AlertTriangle, failed: XCircle, duplicate: Copy }[lead.procState];
  const procColor = { success: T.success, partial: T.warning, failed: T.danger, duplicate: T.purple };
  return (
    <Drawer open={open} onClose={onClose} width={560}>
      <div className="sticky top-0 bg-[var(--t-surface)] border-b z-10 px-6 pt-5 pb-4 flex items-start justify-between" style={{ borderColor: T.border }}>
        <div className="flex items-center gap-3">
          <Avatar name={lead.name} tone="brand" size={40} />
          <div>
            <div className="text-[15px] font-semibold" style={{ color: T.text }}>{masked ? maskName(lead.name) : lead.name}{lead.isTest && <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: T.warningSoft, color: T.warningFg }}>TEST</span>}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-[12px] font-medium" style={{ color: procColor[lead.procState] }}>{React.createElement(procIcon, { size: 13 })}{lead.procState}</span>
              <span className="text-[12px]" style={{ color: T.text3 }}>{lead.id}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--t-hover)]"><X size={18} style={{ color: T.text3 }} /></button>
      </div>
      <div className="px-6 py-5 space-y-4">
        <Tabs tabs={["details", "history"]} value={histTab} onChange={setHistTab} />
        {histTab === "details" && (
          <div className="space-y-4">
            {masked && (
              <div className="rounded-lg border px-4 py-3 flex items-center justify-between" style={{ borderColor: T.border, background: T.warningSoft }}>
                <div className="text-[12px]" style={{ color: T.warningFg }}><Lock size={13} className="inline mr-1" />PII masked — request access to view contact details</div>
                <button onClick={onRequestPII} className="text-[12px] font-semibold hover:underline" style={{ color: T.primary }}>Request access</button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[["Phone", masked ? maskPhone(lead.phone) : lead.phone], ["Email", masked ? maskEmail(lead.email) : lead.email], ["Source", lead.source], ["Assignee", lead.assignee || "Unassigned"]].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>{k}</div>
                  <div className="text-[13px] mt-0.5" style={{ color: T.text }}>{v}</div>
                </div>
              ))}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Tenant</div>
                <button onClick={() => goToTenant?.()} className="text-[13px] mt-0.5 flex items-center gap-1 hover:underline" style={{ color: T.primary }}>{lead.tenant}<Badge tone={TIER_TONE[tier]}>{tier}</Badge></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg border p-3" style={{ borderColor: T.border }} title="Asia/Kolkata (IST)">
              {[["Received", lead.receivedAt, true], ["Processed", lead.procState === "failed" ? "—" : "+" + (3 + (parseInt(lead.id.replace(/\D/g, ""), 10) % 5)) + "s", false], ["Delivered", lead.procState === "success" ? "+" + (8 + (parseInt(lead.id.replace(/\D/g, ""), 10) % 6)) + "s" : "—", false]].map(([k, v, primary]) => (
                <div key={k}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>{k}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: primary ? T.text : (v === "—" ? T.text3 : T.text) }}>{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Status</div>
              <select value={lead.status} onChange={(e) => onStatusChange(lead.id, e.target.value)} className="border rounded-lg px-3 py-1.5 text-[13px] outline-none" style={{ borderColor: T.border }}>
                {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Assign to</div>
              <select value={lead.assignee || ""} onChange={(e) => onAssign(lead.id, e.target.value)} className="border rounded-lg px-3 py-1.5 text-[13px] outline-none" style={{ borderColor: T.border }}>
                <option value="">Unassigned</option>
                {ONBOARD_OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {lead.aiSummary && (
              <div className="rounded-xl p-4" style={{ background: T.primarySoft, border: `1px solid ${T.border}` }}>
                <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.accentText }}><Sparkles size={12} />AI Summary</div>
                <p className="text-[13px]" style={{ color: T.text }}>{lead.aiSummary}</p>
              </div>
            )}
            {lead.procState === "failed" && (() => {
              const dbg = mockFailureDebug(lead);
              return (
                <div className="rounded-xl p-4 space-y-2" style={{ background: T.dangerSoft, border: `1px solid #F3C6C6` }}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.danger }}>Failure Reason</div>
                  <p className="text-[13px]" style={{ color: T.text }}>{lead.failureReason}</p>
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1" style={{ color: T.text2 }}>
                    <span><span style={{ color: T.text3 }}>HTTP</span> {dbg.httpStatus}</span>
                    <span><span style={{ color: T.text3 }}>Attempt</span> {dbg.attempt}</span>
                    <span><span style={{ color: T.text3 }}>Next retry</span> {dbg.nextRetryAt}</span>
                  </div>
                  <details className="text-[11px]">
                    <summary className="cursor-pointer select-none" style={{ color: T.text2 }}>Raw → normalized payload</summary>
                    <div className="mt-1.5 space-y-1 font-mono text-[10px] break-all rounded-lg p-2" style={{ background: T.surface, color: T.text2 }}>
                      <div>{dbg.rawPayload}</div>
                      <div style={{ color: T.text3 }}>↓</div>
                      <div>{dbg.normalizedPayload}</div>
                    </div>
                  </details>
                  {isAuthFailure(lead) ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => goToIntegrations?.(lead)}><Plug size={13} />Fix in Integrations</Button>
                      <span className="text-[11px]" style={{ color: T.text3 }}>Reprocessing a token-expired lead is a guaranteed no-op</span>
                    </div>
                  ) : (
                    <Button size="sm" variant="danger" onClick={() => onReprocess([lead.id])}><RefreshCw size={13} />Reprocess this lead</Button>
                  )}
                </div>
              );
            })()}
            {lead.procState === "duplicate" && duplicate && (() => {
              const match = mockMatchInfo(lead);
              return (
                <div className="rounded-xl p-4" style={{ background: T.purpleSoft, border: `1px solid #C4B5FD` }}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.purple }}>Duplicate Match</div>
                  <p className="text-[13px]" style={{ color: T.text }}>{match.reason} · {match.confidence}% confidence — matches <strong>{duplicate.id}</strong> ({duplicate.source} → {duplicate.tenant})</p>
                </div>
              );
            })()}
          </div>
        )}
        {histTab === "history" && (
          <div className="space-y-2">
            {lead.history.map((h, i) => (
              <div key={i} className="flex gap-3 py-2.5 border-b last:border-0" style={{ borderColor: T.border }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px]" style={{ background: T.primarySoft, color: T.accentText }}>{h.by.charAt(0).toUpperCase()}</div>
                <div><div className="text-[13px]" style={{ color: T.text }}>{h.action}</div><div className="text-[11px] mt-0.5" style={{ color: T.text3 }}>{h.by} · {h.when}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* ---- Main LeadsPage ---- */
export function LeadsPage({ go }) {
  const store = useStore();
  const [leads, setLeadsRaw] = useState(() => loadLeads() || SEED_LEADS);
  const [audit, setAudit] = useState(() => loadLeadAudit());
  const [piiGrants, setPIIGrants] = useState(() => loadPIIGrants());
  const [refreshTick, setRefreshTick] = useState(0);

  const setLeads = useCallback((updater) => {
    setLeadsRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveLeads(next);
      return next;
    });
  }, []);

  const addAudit = useCallback((entry) => {
    setAudit((prev) => {
      const next = [{ id: "audit-" + Date.now(), when: new Date().toLocaleString("en-IN"), ...entry }, ...prev];
      saveLeadAudit(next);
      return next;
    });
  }, []);

  // Auto-refresh every 30s (simulated)
  React.useEffect(() => {
    const t = setInterval(() => setRefreshTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // Default view is exceptions ("Needs attention"), not the full firehose — healthy volume
  // is a number in a KPI tile, not something you scroll through row by row.
  const [view, setView] = useState("attention"); // "attention" | "all"

  // Filters
  const [search, setSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState(""); // hashed — never unmasks
  const [filterSource, setFilterSource] = useState("All");
  const [filterTenant, setFilterTenant] = useState("All");
  const [filterState, setFilterState] = useState("All"); // proc state
  const [filterStatus, setFilterStatus] = useState("All");

  // UI state
  const [detailLead, setDetailLead] = useState(null);
  const [piiModal, setPIIModal] = useState(false);
  const [piiLeadId, setPIILeadId] = useState(null);
  const [reprocessConfirm, setReprocessConfirm] = useState(null); // { ids: [] }
  const [dupModal, setDupModal] = useState(null); // lead
  const [reassignLead, setReassignLead] = useState(null); // lead
  const [reprocessing, setReprocessing] = useState(false);

  // Check if current user has active PII grant
  const now = Date.now();
  const activePIIGrant = piiGrants.find((g) => g.status === "approved" && new Date(g.grantedAt).getTime() + 4 * 60 * 60 * 1000 > now);
  const piiGranted = !!activePIIGrant;

  // Test-tagged leads are excluded from headline metrics but stay visible in the table.
  const realLeads = leads.filter((l) => !l.isTest);
  const failedLeads = realLeads.filter((l) => l.procState === "failed");
  const dupLeads = realLeads.filter((l) => l.procState === "duplicate");
  const partialLeads = realLeads.filter((l) => l.procState === "partial");
  const successLeads = realLeads.filter((l) => l.procState === "success");
  const aiSummarized = realLeads.filter((l) => l.aiSummary);
  // Failed leads it's actually worth offering a reprocess for — auth failures are a
  // guaranteed no-op until the credential is rotated in Integrations.
  const reprocessableFailedLeads = failedLeads.filter((l) => !isAuthFailure(l));

  // Integration-first health rollup — one row per source (IndiaMART, CarWale, ...), tenants
  // affected shown as a count + drill-down list within that row, not as separate rows/cards.
  const integrationHealth = useMemo(() => computeIntegrationHealth(realLeads), [realLeads]);

  // Filtered table rows
  const filtered = leads.filter((l) => {
    if (view === "attention" && !["failed", "partial", "duplicate"].includes(l.procState)) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.tenant.toLowerCase().includes(search.toLowerCase()) && !l.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (phoneSearch && last4Hash(l.phone) !== simpleHash(digitsOnly(phoneSearch).slice(-4))) return false;
    if (filterSource !== "All" && l.source !== filterSource) return false;
    if (filterTenant !== "All" && l.tenant !== filterTenant) return false;
    if (filterState !== "All" && l.procState !== filterState) return false;
    if (filterStatus !== "All" && l.status !== filterStatus) return false;
    return true;
  });

  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  const sel = useRowSelection(pageRows, filtered, "id");

  // Switching view resets the secondary filters — landing on "All leads" with three stale
  // filters already applied is confusing, not powerful.
  const changeView = (label) => {
    setView(label === "Needs attention" ? "attention" : "all");
    setFilterState("All"); setFilterSource("All"); setFilterTenant("All"); setFilterStatus("All"); setSearch(""); setPhoneSearch("");
    setPage(1);
  };

  // Tile / row click → filter (always drops into "All leads" since the target state, e.g.
  // "success", may be excluded from the "Needs attention" view)
  const setTileFilter = (stateOrSetter, value) => {
    setView("all");
    if (typeof stateOrSetter === "function") stateOrSetter(value);
    else setFilterState((cur) => cur === stateOrSetter ? "All" : stateOrSetter);
    setPage(1);
  };

  // Reprocess
  const triggerReprocess = (ids) => {
    setReprocessConfirm({ ids });
  };

  const doReprocess = () => {
    const ids = reprocessConfirm.ids;
    setReprocessConfirm(null);
    setReprocessing(true);
    setTimeout(() => {
      setLeads((prev) => prev.map((l) => {
        if (!ids.includes(l.id)) return l;
        const newEntry = { action: "Reprocessed successfully", by: ADMIN, when: new Date().toLocaleString("en-IN") };
        return { ...l, procState: "success", failureReason: null, aiSummary: "Lead recovered via manual reprocess. Contact details valid.", history: [...l.history, newEntry] };
      }));
      addAudit({ action: `Reprocessed ${ids.length} failed lead(s)`, by: ADMIN, type: "Reprocess", ids });
      store.notify(`${ids.length} lead(s) reprocessed successfully`);
      setReprocessing(false);
    }, 1800);
  };

  // Export
  const handleExport = () => {
    const rows = filtered.map((l) => ({
      id: l.id, source: l.source, tenant: l.tenant, status: l.status, procState: l.procState,
      name: piiGranted ? l.name : "[MASKED]",
      phone: piiGranted ? l.phone : "[MASKED]",
      email: piiGranted ? l.email : "[MASKED]",
      receivedAt: l.receivedAt, assignee: l.assignee || "",
    }));
    const header = Object.keys(rows[0]).join(",");
    const csv = [header, ...rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `leads-export-${Date.now()}.csv`; a.click();
    addAudit({ action: `Exported ${rows.length} leads (PII ${piiGranted ? "included" : "masked"})`, by: ADMIN, type: "Export" });
    store.notify(`${rows.length} leads exported${piiGranted ? "" : " (PII masked)"}`);
  };

  // Merge / dismiss duplicates
  const handleMerge = (dupId, originalId) => {
    setLeads((prev) => prev.map((l) => {
      if (l.id !== dupId) return l;
      return { ...l, procState: "success", duplicateOf: null, status: "Lost", history: [...l.history, { action: `Merged into ${originalId}`, by: ADMIN, when: new Date().toLocaleString("en-IN") }] };
    }));
    addAudit({ action: `Merged duplicate ${dupId} into ${originalId}`, by: ADMIN, type: "Duplicate Merge" });
    store.notify("Duplicate merged");
    setDupModal(null);
    if (detailLead?.id === dupId) setDetailLead(null);
  };

  const handleDismiss = (dupId) => {
    setLeads((prev) => prev.map((l) => {
      if (l.id !== dupId) return l;
      return { ...l, procState: "success", duplicateOf: null, history: [...l.history, { action: "Duplicate dismissed — kept as separate lead", by: ADMIN, when: new Date().toLocaleString("en-IN") }] };
    }));
    addAudit({ action: `Dismissed duplicate ${dupId} (kept separate)`, by: ADMIN, type: "Duplicate Dismiss" });
    store.notify("Duplicate dismissed");
    setDupModal(null);
  };

  const handleStatusChange = (id, status) => {
    setLeads((prev) => prev.map((l) => l.id !== id ? l : { ...l, status, history: [...l.history, { action: `Status changed to ${status}`, by: ADMIN, when: new Date().toLocaleString("en-IN") }] }));
    addAudit({ action: `Lead ${id} status → ${status}`, by: ADMIN, type: "Status Change" });
  };

  const handleAssign = (id, assignee) => {
    setLeads((prev) => prev.map((l) => l.id !== id ? l : { ...l, assignee, history: [...l.history, { action: `Assigned to ${assignee || "Unassigned"}`, by: ADMIN, when: new Date().toLocaleString("en-IN") }] }));
    addAudit({ action: `Lead ${id} assigned to ${assignee || "nobody"}`, by: ADMIN, type: "Assignment" });
    store.notify("Assigned");
  };

  const handlePIIGranted = (grant) => {
    setPIIGrants((prev) => { const next = [grant, ...prev]; savePIIGrants(next); return next; });
  };

  const handleReassignTenant = (id, tenant) => {
    const t = SEED_CLIENTS.find((c) => c.name === tenant);
    setLeads((prev) => prev.map((l) => l.id !== id ? l : { ...l, tenant, tenantId: t ? t.id : l.tenantId, history: [...l.history, { action: `Reassigned from ${l.tenant} to ${tenant}`, by: ADMIN, when: new Date().toLocaleString("en-IN") }] }));
    addAudit({ action: `Lead ${id} reassigned to tenant ${tenant}`, by: ADMIN, type: "Reassign Tenant" });
    store.notify(`Reassigned to ${tenant}`);
    setReassignLead(null);
  };

  const handleMarkTest = (id) => {
    setLeads((prev) => prev.map((l) => l.id !== id ? l : { ...l, isTest: !l.isTest, history: [...l.history, { action: l.isTest ? "Unmarked as test data" : "Marked as test data — excluded from metrics", by: ADMIN, when: new Date().toLocaleString("en-IN") }] }));
    addAudit({ action: `Lead ${id} test-data flag toggled`, by: ADMIN, type: "Mark Test Data" });
  };

  const handleEscalate = (l) => {
    addAudit({ action: `Escalated ${l.id} to engineering (${l.failureReason || "processing issue"}) — payload attached`, by: ADMIN, type: "Escalation" });
    store.notify(`${l.id} escalated to engineering`);
  };

  const handleExportRow = (l) => {
    const row = { id: l.id, source: l.source, tenant: l.tenant, status: l.status, procState: l.procState, name: piiGranted ? l.name : "[MASKED]", phone: piiGranted ? l.phone : "[MASKED]", email: piiGranted ? l.email : "[MASKED]", receivedAt: l.receivedAt };
    const csv = [Object.keys(row).join(","), Object.values(row).map((v) => `"${v}"`).join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${l.id}.csv`; a.click();
    addAudit({ action: `Exported single lead ${l.id} (PII ${piiGranted ? "included" : "masked"})`, by: ADMIN, type: "Export" });
  };

  const bulkReprocessSelected = () => {
    const ids = [...sel.selected].filter((id) => reprocessableFailedLeads.some((f) => f.id === id));
    if (ids.length) triggerReprocess(ids);
  };
  const bulkExportSelected = () => {
    const rows = filtered.filter((l) => sel.selected.has(l.id));
    if (!rows.length) return;
    const cols = rows.map((l) => ({ id: l.id, source: l.source, tenant: l.tenant, status: l.status, procState: l.procState, name: piiGranted ? l.name : "[MASKED]", phone: piiGranted ? l.phone : "[MASKED]", email: piiGranted ? l.email : "[MASKED]", receivedAt: l.receivedAt }));
    const csv = [Object.keys(cols[0]).join(","), ...cols.map((r) => Object.values(r).map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `leads-selected-${Date.now()}.csv`; a.click();
    addAudit({ action: `Exported ${rows.length} selected leads (PII ${piiGranted ? "included" : "masked"})`, by: ADMIN, type: "Export" });
    store.notify(`${rows.length} leads exported`);
    sel.clear();
  };

  const statusTone = { New: "gray", Assigned: "info", Contacted: "warning", Converted: "success", Lost: "danger" };
  const procMeta = { success: { icon: CheckCircle2, color: T.success }, partial: { icon: AlertTriangle, color: T.warning }, failed: { icon: XCircle, color: T.danger }, duplicate: { icon: Copy, color: T.purple } };
  const selectedFailedCount = [...sel.selected].filter((id) => reprocessableFailedLeads.some((f) => f.id === id)).length;
  const downOrDegraded = integrationHealth.filter((h) => h.status !== "Healthy");

  return (
    <>
      <PageHeader title="Lead & Record Management" desc="Internal tool — lead records across tenants and whether provider integrations are actually delivering leads"
        actions={<>
          {reprocessing && <span className="text-[12px] flex items-center gap-1.5" style={{ color: T.warning }}><RefreshCw size={13} className="animate-spin" />Reprocessing…</span>}
          {reprocessableFailedLeads.length > 0 && (
            <Button onClick={() => triggerReprocess(reprocessableFailedLeads.map((l) => l.id))} style={{ borderColor: T.dangerBorder, color: T.danger }}>
              <RefreshCw size={14} />Reprocess failed ({reprocessableFailedLeads.length})
            </Button>
          )}
          <Button onClick={handleExport}><Download size={14} />Export {filtered.length > 0 ? `(${filtered.length})` : ""}</Button>
          <button onClick={() => setRefreshTick((n) => n + 1)} className="p-2 rounded-lg border hover:bg-[var(--t-subtle)]" title="Refresh" style={{ borderColor: T.border }}><RefreshCw size={14} style={{ color: T.text3 }} /></button>
        </>} />

      {/* KPI tiles — clickable to filter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Leads (24h)", value: String(realLeads.filter((l) => l.receivedAt.includes("13 May")).length), sub: "+8 vs yesterday", trend: "pos", filter: null },
          { label: "AI Summarized", value: `${aiSummarized.length}/${realLeads.length}`, sub: `${Math.round(aiSummarized.length / realLeads.length * 100)}% enriched`, trend: "pos", filter: null },
          { label: "Failed Processing", value: String(failedLeads.length), sub: "click to filter", trend: failedLeads.length > 0 ? "neg" : "pos", filter: "failed" },
          { label: "Duplicates", value: String(dupLeads.length), sub: "awaiting review", trend: dupLeads.length > 0 ? "warn" : "pos", filter: "duplicate" },
        ].map(({ label, value, sub, trend, filter }) => (
          <div key={label} onClick={filter ? () => setTileFilter(filter) : undefined}
            className={cx("rounded-lg border bg-[var(--t-surface)] transition-all hover:-translate-y-0.5", filter && "cursor-pointer")}
            style={{ borderColor: filterState === filter && filter ? T.primary : T.border, boxShadow: filterState === filter && filter ? `0 0 0 2px ${T.primarySoft}` : "0 1px 2px rgba(26,31,54,.05)", padding: "20px 22px" }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>{label}{filter && filterState === filter ? " ✕" : ""}</div>
            <div className="text-[26px] leading-none font-semibold mt-3 tracking-tight" style={{ color: T.text }}>{value}</div>
            {sub && <div className="text-xs mt-2.5 flex items-center gap-1" style={{ color: trend === "pos" ? T.success : trend === "neg" ? T.danger : trend === "warn" ? T.warning : T.text2 }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Integration Health — alert-only: a row only exists here for a source that's currently
          broken, source-grouped (2 tenants failing the same way on IndiaMART is one alert, not
          two). Healthy sources render nothing — that's what "no row" means. Per-source config,
          credentials, and status detail live on the Integrations page only, not here. */}
      {downOrDegraded.length > 0 && (
        <div className="mb-4 space-y-2">
          {downOrDegraded.map((h) => {
            const canFix = h.isExternal;
            const reason = h.failureGroups.length === 0 ? "Unknown issue" : h.failureGroups.length === 1 ? h.failureGroups[0].reason : `${h.failureGroups.length} distinct issues`;
            return (
              <div key={h.source} className="flex items-center gap-2.5 p-3 rounded-lg text-[13px]" style={{ background: T.dangerSoft, borderLeft: `3px solid ${T.danger}` }}>
                <TriangleAlert size={15} style={{ color: T.danger }} className="shrink-0" />
                <div className="flex-1" style={{ color: T.text }}>
                  <strong>{h.source}</strong> down{h.tenantsAffected.length > 0 ? ` — ${h.tenantsAffected.length} tenant${h.tenantsAffected.length !== 1 ? "s" : ""} affected (${h.tenantsAffected.join(", ")})` : ""} — {reason}
                </div>
                {canFix ? (
                  <button onClick={() => go?.("integrations", { source: h.source, tenants: h.tenantsAffected })} className="text-[12px] font-semibold whitespace-nowrap shrink-0 hover:underline" style={{ color: T.primary }}>Fix in Integrations →</button>
                ) : (
                  <button onClick={() => go?.("integrations")} className="text-[12px] font-semibold whitespace-nowrap shrink-0 hover:underline" style={{ color: T.primary }}>Integrations →</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Processing status + Source table row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Processing overview — pipeline health signal, distinct from Integration Health above:
            a "partial" here is an AI-enrichment timeout downstream of a successful ingest, not
            proof a source is broken. Trend is vs the prior 24h so a count reads as normal or a spike. */}
        <Card>
          <CardHeader title="Lead Processing Overview" sub="Pipeline health signal · click to filter" />
          <CardBody className="space-y-2">
            {[
              { label: "Successful", count: successLeads.length, state: "success", color: T.success, trendDelta: "+3", trendGood: true },
              { label: "Partial (AI timeout)", count: partialLeads.length, state: "partial", color: T.warning, trendDelta: "steady", trendGood: null },
              { label: "Failed Ingestion", count: failedLeads.length, state: "failed", color: T.danger, trendDelta: "+3", trendGood: false },
              { label: "Duplicate Flagged", count: dupLeads.length, state: "duplicate", color: T.purple, trendDelta: "+1", trendGood: false },
            ].map(({ label, count, state, color, trendDelta, trendGood }) => {
              const active = filterState === state;
              return (
                <div key={state} onClick={() => setTileFilter(state)} className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-[var(--t-subtle)] transition-colors" style={{ background: active ? T.primarySoft : undefined, border: `1px solid ${active ? T.primary : "transparent"}` }}>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[13px] flex-1" style={{ color: T.text }}>{label}</span>
                  <span className="text-[11px] flex items-center gap-0.5" style={{ color: trendGood === null ? T.text3 : trendGood ? T.success : T.danger }} title="vs prior 24h">
                    {trendDelta !== "steady" && (trendGood ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} className="rotate-90" />)}
                    {trendDelta === "steady" ? "steady" : `${trendDelta} vs prior 24h`}
                  </span>
                  <span className="text-[13px] font-semibold" style={{ color }}>{count}</span>
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
                    <div className="h-full rounded-full" style={{ width: `${(count / realLeads.length) * 100}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* Lead sources — a business/performance view (volume, conversion, cost), not the
            integration-health view above; kept separate so the two aren't read as the same thing. */}
        <Card>
          <CardHeader title="Lead Sources (30d)" sub="Volume & conversion — performance view, not integration health" />
          <CardBody className="p-0">
            <div className="overflow-auto">
              <table className="w-full text-[13px] border-separate" style={{ borderSpacing: 0 }}>
                <thead><tr>{["Source", "Leads", "Conv%", "Cost/Lead"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5" style={{ color: T.text3, boxShadow: `inset 0 -1px 0 ${T.border}`, background: T.subtle }}>{h}</th>
                ))}</tr></thead>
                <tbody>
                  {LEAD_SOURCES_DATA.map((s) => (
                    <tr key={s.source} className="hover:bg-[var(--t-subtle)] cursor-pointer" onClick={() => setTileFilter(setFilterSource, filterSource === s.source ? "All" : s.source)} style={{ background: filterSource === s.source ? T.primarySoft : undefined }}>
                      <td className="px-4 py-2.5 font-medium" style={{ boxShadow: `inset 0 -1px 0 ${T.border}`, color: T.text }}>{s.source}</td>
                      <td className="px-4 py-2.5" style={{ boxShadow: `inset 0 -1px 0 ${T.border}`, color: T.text }}>{s.count.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-2.5" style={{ boxShadow: `inset 0 -1px 0 ${T.border}`, color: s.convPct >= 5 ? T.success : T.text }}>{s.convPct}%</td>
                      <td className="px-4 py-2.5" style={{ boxShadow: `inset 0 -1px 0 ${T.border}`, color: T.text }}>{s.costPerLead ? `₹${s.costPerLead}` : "Free"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Leads table */}
      <Card className="flex flex-col">
        <CardHeader title="Recent Leads"
          sub={piiGranted ? `PII visible · expires ${activePIIGrant?.expiresAt?.split(",")[1]?.trim() || "soon"}` : "PII masked · request access to view contact details"}
          action={
            <div className="flex items-center gap-2">
              {(filterState !== "All" || filterSource !== "All" || filterTenant !== "All" || filterStatus !== "All" || search || phoneSearch) && (
                <button onClick={() => { setFilterState("All"); setFilterSource("All"); setFilterTenant("All"); setFilterStatus("All"); setSearch(""); setPhoneSearch(""); }} className="text-[12px] flex items-center gap-1 px-2 py-1 rounded" style={{ background: T.primarySoft, color: T.accentText }}><X size={11} />Clear filters</button>
              )}
              {!piiGranted && <button onClick={() => { setPIILeadId(null); setPIIModal(true); }} className="text-[12px] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border" style={{ borderColor: T.border, color: T.primary }}><Lock size={12} />Request PII access</button>}
            </div>
          }
        />
        <Tabs tabs={["Needs attention", "All leads"]} value={view === "attention" ? "Needs attention" : "All leads"} onChange={changeView} />
        {/* Search + filters */}
        <div className="px-5 py-3 border-b flex flex-wrap gap-2 items-center" style={{ borderColor: T.border }}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search leads, tenant, ID…" />
          <div className="relative max-w-[220px]">
            <Hash size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
            <input value={phoneSearch} onChange={(e) => { setPhoneSearch(e.target.value); setPage(1); }} placeholder="Search by phone (last 4) — hashed"
              className="pl-7 pr-2 py-1.5 rounded-lg border text-[12px] outline-none w-full" style={{ borderColor: phoneSearch ? T.primary : T.border }} title="Matches on a one-way hash of the last 4 digits — never unmasks PII" />
          </div>
          {[
            { label: "Source", value: filterSource, set: setFilterSource, opts: ["All", ...LEAD_SOURCES] },
            { label: "Tenant", value: filterTenant, set: setFilterTenant, opts: ["All", ...LEAD_TENANTS] },
            { label: "Processing", value: filterState, set: setFilterState, opts: ["All", ...LEAD_PROC_STATES] },
            { label: "Status", value: filterStatus, set: setFilterStatus, opts: ["All", ...LEAD_STATUSES] },
          ].map(({ label, value, set, opts }) => (
            <div key={label} className="relative">
              <select value={value} onChange={(e) => { setView("all"); set(e.target.value); setPage(1); }}
                className="appearance-none pl-2.5 pr-6 py-1.5 rounded-lg border text-[12px] outline-none" style={{ borderColor: value !== "All" ? T.primary : T.border, background: value !== "All" ? T.primarySoft : T.surface, color: T.text }}>
                {opts.map((o) => <option key={o} value={o}>{o === "All" ? `All ${FILTER_PLURAL[label] || label + "s"}` : o}</option>)}
              </select>
              <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
            </div>
          ))}
          <span className="text-[12px] ml-auto" style={{ color: T.text3 }}>{filtered.length} leads</span>
        </div>
        {sel.isSome && (
          <div className="px-5 py-2.5 border-b flex items-center gap-3" style={{ background: T.primarySoft, borderColor: T.border }}>
            <span className="text-[12px] font-medium" style={{ color: T.accentText }}>{sel.selected.size} selected</span>
            {selectedFailedCount > 0 && <button onClick={bulkReprocessSelected} className="text-[12px] flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-[var(--t-surface)]" style={{ borderColor: T.danger, color: T.danger }}><RefreshCw size={12} />Reprocess failed ({selectedFailedCount})</button>}
            <button onClick={bulkExportSelected} className="text-[12px] flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-[var(--t-surface)]" style={{ borderColor: T.border, color: T.text }}><Download size={12} />Export selected</button>
            <button onClick={sel.clear} className="text-[12px] ml-auto" style={{ color: T.text3 }}>Clear</button>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} selectedCount={sel.selected.size} />
        <Table head={[<SelectAllHeader key="sel" sel={sel} />, "Lead ID", "Source", "Tenant", "Contact (PII)", "Status", "Processing", "Received / Processed / Delivered", "Actions"]}>
          {pageRows.length === 0 ? (
            <tr><td colSpan={9} className="text-center py-10 text-[13px]" style={{ color: T.text3 }}>No leads match the current filters.</td></tr>
          ) : pageRows.map((l) => {
            const tier = TENANT_TIER[l.tenant] || "Growth";
            const pm = procMeta[l.procState];
            const idNum = parseInt(l.id.replace(/\D/g, ""), 10);
            return (
            <tr key={l.id} className="hover:bg-[#F8F9FC] cursor-pointer group" onClick={() => setDetailLead(l)}>
              <Td onClick={(e) => e.stopPropagation()}><RowCheckbox checked={sel.selected.has(l.id)} onChange={(e, shift) => sel.toggle(l.id, { shiftKey: shift })} /></Td>
              <Td className="font-mono text-xs" style={{ color: T.text2 }}>{l.id}{l.isTest && <span className="ml-1.5 text-[9px] font-semibold px-1 py-0.5 rounded" style={{ background: T.warningSoft, color: T.warningFg }}>TEST</span>}</Td>
              <Td><Badge tone="gray">{l.source}</Badge></Td>
              <Td>
                <button onClick={(e) => { e.stopPropagation(); go?.("clients"); }} className="text-[13px] flex items-center gap-1.5 hover:underline" style={{ color: T.text }}>
                  {l.tenant}<Badge tone={TIER_TONE[tier]}>{tier}</Badge>
                </button>
              </Td>
              <Td>
                {piiGranted ? (
                  <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{l.name}</div><div className="text-[11px]" style={{ color: T.text3 }}>{l.phone}</div></div>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); setPIILeadId(l.id); setPIIModal(true); }}
                    className="text-[12px] text-left" style={{ color: T.text2 }} title="Click to request PII access">
                    <div>{maskName(l.name)}</div><div className="text-[11px]" style={{ color: T.text3 }}>{maskPhone(l.phone)}</div>
                  </button>
                )}
              </Td>
              <Td><Badge tone={statusTone[l.status] || "gray"}>{l.status}</Badge></Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 text-[12px] font-medium" style={{ color: pm.color }}><pm.icon size={13} />{l.procState}</span>
                  {l.procState === "duplicate" && (
                    <button onClick={(e) => { e.stopPropagation(); setDupModal(l); }} className="text-[11px] underline" style={{ color: T.purple }}>Review</button>
                  )}
                </div>
              </Td>
              <Td className="text-[11px] whitespace-nowrap" style={{ color: T.text2 }} title="Asia/Kolkata (IST)">
                <div>{l.receivedAt}</div>
                <div style={{ color: T.text3 }}>
                  processed {l.procState === "failed" ? "—" : `+${3 + (idNum % 5)}s`} · delivered {l.procState === "success" ? `+${8 + (idNum % 6)}s` : "—"}
                </div>
              </Td>
              <Td onClick={(e) => e.stopPropagation()}>
                <Menu items={[
                  { label: "View details", icon: Eye, onClick: () => setDetailLead(l) },
                  ...(l.procState === "failed" ? (isAuthFailure(l)
                    ? [{ label: "Fix in Integrations →", icon: Plug, onClick: () => go?.("integrations", { source: l.source, tenants: [l.tenant] }) }]
                    : [{ label: "Retry ingestion", icon: RefreshCw, onClick: () => triggerReprocess([l.id]) }]) : []),
                  { label: "Reassign tenant", icon: Building2, onClick: () => setReassignLead(l) },
                  { label: l.isTest ? "Unmark test data" : "Mark as test data", icon: Tag, onClick: () => handleMarkTest(l.id) },
                  { label: "Escalate to engineering", icon: Flag, onClick: () => handleEscalate(l) },
                  { label: "Export row", icon: Download, onClick: () => handleExportRow(l) },
                ]} />
              </Td>
            </tr>
          );})}
        </Table>
      </Card>

      {/* Reprocess confirm */}
      {reprocessConfirm && (
        <Modal open={!!reprocessConfirm} onClose={() => setReprocessConfirm(null)} title="Confirm Reprocessing"
          footer={<><Button onClick={() => setReprocessConfirm(null)}>Cancel</Button><Button variant="primary" onClick={doReprocess}><RefreshCw size={13} />Reprocess {reprocessConfirm.ids.length} lead(s)</Button></>}>
          <p className="text-[13px]" style={{ color: T.text2 }}>
            This will re-run ingestion for <strong style={{ color: T.text }}>{reprocessConfirm.ids.length} failed lead{reprocessConfirm.ids.length !== 1 ? "s" : ""}</strong>. The action is logged to the audit trail. Failed leads that succeed will move to "success" state.
          </p>
          <div className="mt-3 rounded-lg px-3 py-2 text-[12px]" style={{ background: T.primarySoft, color: T.accentText }}>
            Credential/auth failures aren't offered here — those need the token rotated in Integrations first, not a reprocess.
          </div>
        </Modal>
      )}

      {/* Reassign tenant modal */}
      {reassignLead && (
        <Modal open={!!reassignLead} onClose={() => setReassignLead(null)} title={`Reassign ${reassignLead.id}`}>
          <p className="text-[13px] mb-3" style={{ color: T.text2 }}>Move this lead to a different tenant. Misrouted leads are common in multi-tenant ingestion — this is logged to the audit trail.</p>
          <div className="space-y-1.5">
            {LEAD_TENANTS.filter((t) => t !== reassignLead.tenant).map((t) => (
              <button key={t} onClick={() => handleReassignTenant(reassignLead.id, t)} className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg border hover:bg-[var(--t-subtle)]" style={{ borderColor: T.border }}>
                <span className="text-[13px]" style={{ color: T.text }}>{t}</span>
                <Badge tone={TIER_TONE[TENANT_TIER[t] || "Growth"]}>{TENANT_TIER[t] || "Growth"}</Badge>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* PII access modal */}
      <PIIAccessModal open={piiModal} onClose={() => setPIIModal(false)} onGranted={handlePIIGranted} leadId={piiLeadId} />

      {/* Lead detail drawer */}
      <LeadDetailDrawer
        lead={detailLead ? leads.find((l) => l.id === detailLead.id) || detailLead : null}
        leads={leads}
        open={!!detailLead}
        onClose={() => setDetailLead(null)}
        piiGranted={piiGranted}
        onRequestPII={() => { setPIILeadId(detailLead?.id); setPIIModal(true); }}
        onReprocess={triggerReprocess}
        onStatusChange={handleStatusChange}
        onAssign={handleAssign}
        goToTenant={() => go?.("clients")}
        goToIntegrations={(l) => go?.("integrations", { source: l.source, tenants: [l.tenant] })}
      />

      {/* Duplicate review modal */}
      <DuplicateReviewModal open={!!dupModal} onClose={() => setDupModal(null)} lead={dupModal} leads={leads} onMerge={handleMerge} onDismiss={handleDismiss} piiGranted={piiGranted} />
    </>
  );
}
