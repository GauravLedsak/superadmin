import React, { useState } from "react";
import { X, Check, ArrowLeft, ArrowRight, Rocket, Search, Pencil, GripVertical, Plus } from "lucide-react";
import { T } from "../theme.js";
import { fmtINR } from "../lib/format.js";
import { ONBOARD_STAGES, ONBOARD_OWNERS, GOLIVE_REQUIRED_TASKS, NOW, ADMIN } from "../data/constants.js";
import { useStore } from "../store/StoreContext.jsx";
import { Modal, Button, Drawer, Avatar, Tabs, Badge, PageHeader, Kpi } from "../components/ui.jsx";

/* ============================================================
   ONBOARDING PIPELINE — kickoff → go-live
   ============================================================ */
/* ---- Confirm modal reused for advance-with-incomplete-tasks ---- */
export function ConfirmAdvanceModal({ open, onClose, onConfirm, clientName, fromStage, toStage, incompleteCount }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Advance with incomplete tasks?"
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={onConfirm}>Advance anyway</Button></>}>
      <p className="text-[13px]" style={{ color: T.text2 }}>
        <strong style={{ color: T.text }}>{clientName}</strong> has <strong style={{ color: T.warning }}>{incompleteCount} incomplete task{incompleteCount !== 1 ? "s" : ""}</strong> in <em>{fromStage}</em>.
        Advancing to <strong>{toStage}</strong> will not complete them automatically — they will remain open.
      </p>
    </Modal>
  );
}

export function OnboardingDetail({ item, onClose }) {
  const store = useStore();
  const o = store.onboarding.find((x) => x.id === item?.id) || item;
  const [tab, setTab] = useState("checklist");
  const [confirmState, setConfirmState] = useState(null); // { toStage, incompleteCount }
  const [editMRR, setEditMRR] = useState(false);
  const [mrrDraft, setMRRDraft] = useState("");
  const [editProvider, setEditProvider] = useState(false);
  const [providerDraft, setProviderDraft] = useState("");

  if (!item || !o) return null;

  const stageIdx = ONBOARD_STAGES.indexOf(o.currentStage);
  const tasksDone = o.checklist.filter((c) => c.completed).length;
  const tasksTotal = o.checklist.length;
  const pct = Math.round((tasksDone / tasksTotal) * 100);

  const incompleteInCurrentStage = o.checklist.filter((c) => c.stage === o.currentStage && !c.completed).length;
  const missingGoLive = o.currentStage === "Training"
    ? GOLIVE_REQUIRED_TASKS.filter((tid) => !o.checklist.find((c) => c.id === tid)?.completed)
    : [];

  const doChangeStage = (newStage) => {
    const newIdx = ONBOARD_STAGES.indexOf(newStage);
    const moving = newIdx > stageIdx;
    if (moving && incompleteInCurrentStage > 0) {
      setConfirmState({ toStage: newStage, incompleteCount: incompleteInCurrentStage });
      return;
    }
    store.updateOnboardingStage(o.id, newStage);
  };

  const confirmAdvance = () => {
    store.updateOnboardingStage(o.id, confirmState.toStage);
    setConfirmState(null);
  };

  const stageByGroup = ONBOARD_STAGES.reduce((acc, s) => {
    acc[s] = o.checklist.filter((c) => c.stage === s);
    return acc;
  }, {});

  return (
    <>
      <Drawer open={!!item} onClose={onClose} width={580}>
        {/* Header */}
        <div className="sticky top-0 bg-[var(--t-surface)] border-b z-10 px-6 pt-5 pb-4" style={{ borderColor: T.border }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar name={o.clientName} tone={o.industry === "Clinic" ? "purple" : "brand"} size={44} />
              <div>
                <h2 className="text-lg font-semibold" style={{ color: T.text }}>{o.clientName}</h2>
                <div className="text-[13px] flex items-center gap-2" style={{ color: T.text2 }}>
                  <span>{o.industry}</span>
                  <span>·</span>
                  {/* Owner dropdown */}
                  <select value={o.owner} onChange={(e) => store.updateOnboardingField(o.id, "owner", e.target.value)}
                    className="border rounded px-1.5 py-0.5 text-[12px] outline-none" style={{ borderColor: T.border, color: T.text }}>
                    {ONBOARD_OWNERS.map((ow) => <option key={ow} value={ow}>{ow}</option>)}
                  </select>
                  <span>· started {o.startedAt}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--t-hover)]"><X size={18} style={{ color: T.text3 }} /></button>
          </div>
          {/* Stage dropdown */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Stage</span>
            <select value={o.currentStage} onChange={(e) => doChangeStage(e.target.value)}
              className="border rounded-lg px-2.5 py-1 text-[12px] font-medium outline-none" style={{ borderColor: T.border, color: T.text }}>
              {ONBOARD_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Stage stepper — clickable */}
          <div className="flex items-center gap-1">
            {ONBOARD_STAGES.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1 flex-1 cursor-pointer group" onClick={() => doChangeStage(s)}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all group-hover:scale-110"
                    style={i < stageIdx ? { background: T.success, color: "#fff" } : i === stageIdx ? { background: T.primary, color: "#fff" } : { background: T.border, color: T.text3 }}>
                    {i < stageIdx ? <Check size={13} /> : i + 1}
                  </div>
                  <span className="text-[10px] text-center leading-tight" style={{ color: i <= stageIdx ? T.text : T.text3 }}>{s}</span>
                </div>
                {i < ONBOARD_STAGES.length - 1 && <div className="h-0.5 flex-1 -mt-4" style={{ background: i < stageIdx ? T.success : T.border }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* KPI row — inline editable MRR & provider */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border bg-[var(--t-surface)] p-4" style={{ borderColor: T.border }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.text3 }}>Deal MRR</div>
              {editMRR ? (
                <div className="flex items-center gap-1">
                  <input autoFocus value={mrrDraft} onChange={(e) => setMRRDraft(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => { if (e.key === "Enter") { store.updateOnboardingField(o.id, "dealMRR", Number(mrrDraft)); setEditMRR(false); } if (e.key === "Escape") setEditMRR(false); }}
                    className="border rounded px-2 py-0.5 text-[13px] w-24 outline-none" style={{ borderColor: T.primary }} />
                  <button onClick={() => { store.updateOnboardingField(o.id, "dealMRR", Number(mrrDraft)); setEditMRR(false); }} style={{ color: T.success }}><Check size={14} /></button>
                  <button onClick={() => setEditMRR(false)} style={{ color: T.text3 }}><X size={13} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => { setMRRDraft(String(o.dealMRR)); setEditMRR(true); }}>
                  <span className="text-[20px] font-semibold" style={{ color: T.text }}>{fmtINR(o.dealMRR)}</span>
                  <Pencil size={12} className="opacity-0 group-hover:opacity-100" style={{ color: T.text3 }} />
                </div>
              )}
            </div>
            <div className="rounded-lg border bg-[var(--t-surface)] p-4" style={{ borderColor: T.border }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.text3 }}>Tasks</div>
              <div className="text-[20px] font-semibold" style={{ color: T.text }}>{tasksDone}/{tasksTotal}</div>
            </div>
            <div className="rounded-lg border bg-[var(--t-surface)] p-4" style={{ borderColor: T.border }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.text3 }}>Provider</div>
              {editProvider ? (
                <div className="flex items-center gap-1">
                  <input autoFocus value={providerDraft} onChange={(e) => setProviderDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { store.updateOnboardingField(o.id, "provider", providerDraft); setEditProvider(false); } if (e.key === "Escape") setEditProvider(false); }}
                    className="border rounded px-2 py-0.5 text-[12px] w-24 outline-none" style={{ borderColor: T.primary }} />
                  <button onClick={() => { store.updateOnboardingField(o.id, "provider", providerDraft); setEditProvider(false); }} style={{ color: T.success }}><Check size={14} /></button>
                  <button onClick={() => setEditProvider(false)} style={{ color: T.text3 }}><X size={13} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1 cursor-pointer group" onClick={() => { setProviderDraft(o.provider); setEditProvider(true); }} title={o.provider}>
                  <span className="text-[13px] font-semibold truncate" style={{ color: T.text }}>{o.provider.split(" ")[0]}</span>
                  <Pencil size={12} className="opacity-0 group-hover:opacity-100 shrink-0" style={{ color: T.text3 }} />
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs tabs={["checklist", "activity"]} value={tab} onChange={setTab} />

          {tab === "checklist" && (
            <div className="space-y-4">
              {ONBOARD_STAGES.map((s) => {
                const items = stageByGroup[s];
                if (!items?.length) return null;
                const stageDone = items.filter((c) => c.completed).length;
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>{s}</span>
                      <span className="text-[11px]" style={{ color: stageDone === items.length ? T.success : T.text3 }}>{stageDone}/{items.length}</span>
                    </div>
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: T.border }}>
                      {items.map((c, idx) => (
                        <label key={c.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--t-subtle)] transition-colors"
                          style={{ borderTop: idx > 0 ? `1px solid ${T.border}` : "none" }}>
                          <input type="checkbox" checked={c.completed} onChange={() => store.toggleChecklistItem(o.id, c.id)}
                            className="w-4 h-4 rounded cursor-pointer shrink-0" style={{ accentColor: T.primary }} />
                          <span className="text-[13px] flex-1" style={{ color: c.completed ? T.text3 : T.text, textDecoration: c.completed ? "line-through" : "none" }}>
                            {c.label}
                          </span>
                          {c.completed && <Check size={14} style={{ color: T.success }} />}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "activity" && (
            <div className="space-y-2">
              {(o.activity || []).length === 0 && <p className="text-[13px] text-center py-6" style={{ color: T.text3 }}>No activity yet</p>}
              {(o.activity || []).map((a) => (
                <div key={a.id} className="flex gap-3 py-2.5 border-b last:border-0" style={{ borderColor: T.border }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold" style={{ background: T.primarySoft, color: T.accentText }}>{a.who.charAt(0)}</div>
                  <div>
                    <div className="text-[13px]" style={{ color: T.text }}>{a.what}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: T.text3 }}>{a.who} · {a.when}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {stageIdx > 0 && (
              <Button onClick={() => doChangeStage(ONBOARD_STAGES[stageIdx - 1])}>
                <ArrowLeft size={14} /> Move back
              </Button>
            )}
            {stageIdx < ONBOARD_STAGES.length - 1 ? (
              <Button variant="primary" className="flex-1 justify-center"
                disabled={o.currentStage === "Training" && missingGoLive.length > 0}
                title={o.currentStage === "Training" && missingGoLive.length > 0 ? "Complete required Go-Live tasks first" : undefined}
                onClick={() => doChangeStage(ONBOARD_STAGES[stageIdx + 1])}>
                <ArrowRight size={15} /> Advance to {ONBOARD_STAGES[stageIdx + 1]}
              </Button>
            ) : (
              <Button variant="primary" className="flex-1 justify-center" onClick={() => store.notify(`${o.clientName} promoted to live tenant`)}>
                <Rocket size={15} /> Promote to live tenant
              </Button>
            )}
          </div>
          {o.currentStage === "Training" && missingGoLive.length > 0 && (
            <p className="text-[12px] text-center" style={{ color: T.warning }}>
              ⚠ Complete {missingGoLive.length} required Go-Live task{missingGoLive.length !== 1 ? "s" : ""} before advancing
            </p>
          )}
        </div>
      </Drawer>

      <ConfirmAdvanceModal
        open={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={confirmAdvance}
        clientName={o.clientName}
        fromStage={o.currentStage}
        toStage={confirmState?.toStage}
        incompleteCount={confirmState?.incompleteCount}
      />
    </>
  );
}

export function StartOnboardingModal({ open, onClose, onCreated }) {
  const store = useStore();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [owner, setOwner] = useState(ADMIN);
  const [startedAt, setStartedAt] = useState(NOW);
  const [targetGoLive, setTargetGoLive] = useState("");
  const [startingStage, setStartingStage] = useState("Kickoff");
  const [submitting, setSubmitting] = useState(false);
  const [dupError, setDupError] = useState(false);

  const alreadyOnboarding = new Set(store.onboarding.map((o) => o.clientId));

  const eligibleClients = store.clients.filter(
    (c) => c.status !== "Suspended" && !alreadyOnboarding.has(c.id)
  );

  const filtered = search.trim()
    ? eligibleClients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase()))
    : eligibleClients;

  const reset = () => {
    setStep(1); setSearch(""); setSelectedClient(null);
    setOwner(ADMIN); setStartedAt(NOW); setTargetGoLive("");
    setStartingStage("Kickoff"); setSubmitting(false); setDupError(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    if (!selectedClient || !owner || !startedAt) return;
    if (alreadyOnboarding.has(selectedClient.id)) { setDupError(true); return; }
    setSubmitting(true);
    store.createOnboarding({
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      industry: selectedClient.industry,
      owner,
      startedAt,
      targetGoLive,
      dealMRR: selectedClient.mrr,
      provider: selectedClient.provider,
      contact: "",
      startingStage,
    }, (newRecord) => {
      setSubmitting(false);
      reset();
      onClose();
      if (onCreated) onCreated(newRecord);
    });
  };

  if (!open) return null;
  const canSubmit = selectedClient && owner && startedAt && !submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0" style={{ background: "rgba(26,31,54,.4)" }} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--t-surface)] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.border }}>
          <div>
            <h3 className="text-[15px] font-semibold" style={{ color: T.text }}>Start Onboarding</h3>
            <p className="text-[12px] mt-0.5" style={{ color: T.text2 }}>
              {step === 1 ? "Step 1 of 2 — Select an existing client account" : "Step 2 of 2 — Configure the onboarding"}
            </p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-[var(--t-hover)]"><X size={16} style={{ color: T.text3 }} /></button>
        </div>

        {/* Step indicator */}
        <div className="flex" style={{ background: T.subtle }}>
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 h-1" style={{ background: s <= step ? T.primary : T.border }} />
          ))}
        </div>

        <div className="px-6 py-5">
          {/* ── STEP 1: Select client ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Search client accounts</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type client name or industry…"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2"
                    style={{ borderColor: T.border, "--tw-ring-color": T.primary }}
                  />
                </div>
              </div>

              {/* Client list */}
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: T.border, maxHeight: 280, overflowY: "auto" }}>
                {filtered.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-[13px] font-medium mb-1" style={{ color: T.text }}>No eligible clients found</p>
                    <p className="text-[12px]" style={{ color: T.text3 }}>
                      {eligibleClients.length === 0
                        ? "All active clients already have onboardings in progress."
                        : "No clients match your search."}
                    </p>
                  </div>
                ) : (
                  filtered.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClient(c)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--t-subtle)]"
                      style={{
                        borderTop: idx > 0 ? `1px solid ${T.border}` : "none",
                        background: selectedClient?.id === c.id ? T.primarySoft : undefined,
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[13px] shrink-0"
                        style={{ background: T.primarySoft, color: T.accentText }}>{c.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate" style={{ color: T.text }}>{c.name}</div>
                        <div className="text-[11px]" style={{ color: T.text3 }}>{c.industry} · {c.plan}</div>
                      </div>
                      <div className="text-[12px] font-semibold shrink-0" style={{ color: T.primary }}>
                        {c.mrr ? "₹" + Number(c.mrr).toLocaleString("en-IN") : "Trial"}
                      </div>
                      {selectedClient?.id === c.id && <Check size={15} style={{ color: T.primary }} />}
                    </button>
                  ))
                )}
              </div>

              {/* Helper text */}
              <p className="text-[12px]" style={{ color: T.text3 }}>
                Client not here?{" "}
                <span style={{ color: T.primary }}>They must complete signup first.</span>{" "}
                Check the <strong>Clients</strong> module for account status. Clients already in the pipeline are excluded.
              </p>
            </div>
          )}

          {/* ── STEP 2: Configure ── */}
          {step === 2 && selectedClient && (
            <div className="space-y-4">
              {/* Read-only client facts */}
              <div className="rounded-xl p-4 grid grid-cols-2 gap-3" style={{ background: T.subtle, border: `1px solid ${T.border}` }}>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: T.text3 }}>Client</div>
                  <div className="text-[13px] font-medium" style={{ color: T.text }}>{selectedClient.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: T.text3 }}>Industry</div>
                  <div className="text-[13px]" style={{ color: T.text }}>{selectedClient.industry}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: T.text3 }}>Plan</div>
                  <div className="text-[13px] truncate" style={{ color: T.text }}>{selectedClient.plan}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: T.text3 }}>Deal MRR</div>
                  <div className="text-[13px] font-semibold" style={{ color: T.primary }}>
                    {selectedClient.mrr ? "₹" + Number(selectedClient.mrr).toLocaleString("en-IN") : "—"}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: T.text3 }}>Provider</div>
                  <div className="text-[13px]" style={{ color: T.text }}>{selectedClient.provider || "—"}</div>
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Owner / CSM <span style={{ color: T.danger }}>*</span></label>
                  <select value={owner} onChange={(e) => setOwner(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: T.border }}>
                    {ONBOARD_OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Starting Stage</label>
                  <select value={startingStage} onChange={(e) => setStartingStage(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: T.border }}>
                    {ONBOARD_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Start Date <span style={{ color: T.danger }}>*</span></label>
                  <input type="text" value={startedAt} onChange={(e) => setStartedAt(e.target.value)}
                    placeholder="e.g. 13 May 2026"
                    className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: T.border }} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Target Go-Live</label>
                  <input type="text" value={targetGoLive} onChange={(e) => setTargetGoLive(e.target.value)}
                    placeholder="e.g. 03 Jun 2026"
                    className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: T.border }} />
                </div>
              </div>

              {dupError && (
                <p className="text-[12px] rounded-lg px-3 py-2" style={{ background: T.dangerSoft, color: T.dangerFg }}>
                  This client already has an onboarding in progress. Only one active onboarding is allowed per client.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: T.border }}>
          <button onClick={handleClose} className="text-[13px] font-medium hover:underline" style={{ color: T.text3 }}>Cancel</button>
          <div className="flex gap-2">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-lg border"
                style={{ borderColor: T.border, color: T.text2 }}>
                <ArrowLeft size={13} /> Back
              </button>
            )}
            {step === 1 ? (
              <button
                disabled={!selectedClient}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg disabled:opacity-40"
                style={{ background: T.primary, color: "#fff" }}>
                Next <ArrowRight size={13} />
              </button>
            ) : (
              <button
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg disabled:opacity-40"
                style={{ background: T.primary, color: "#fff" }}>
                {submitting ? "Starting…" : <><Rocket size={13} /> Start Onboarding</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OnboardingPage() {
  const store = useStore();
  const [detail, setDetail] = useState(null);
  const [startModal, setStartModal] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const stageTone = { Kickoff: "gray", Configuring: "info", "Data Import": "purple", Training: "warning", "Go-Live": "success" };

  const pipelineMRR = store.onboarding.reduce((s, o) => s + o.dealMRR, 0);
  const goLiveCount = store.onboarding.filter((o) => o.currentStage === "Go-Live").length;

  const handleDrop = (stage) => {
    if (dragId == null) return;
    const o = store.onboarding.find((x) => x.id === dragId);
    if (!o || o.currentStage === stage) { setDragId(null); setDragOver(null); return; }
    const fromIdx = ONBOARD_STAGES.indexOf(o.currentStage);
    const toIdx = ONBOARD_STAGES.indexOf(stage);
    const moving = toIdx > fromIdx;
    const incompleteInCurrent = o.checklist.filter((c) => c.stage === o.currentStage && !c.completed).length;
    if (moving && incompleteInCurrent > 0) {
      // For drag-drop, confirm inline via simple confirm dialog (reuse same state mechanism via setDetail then confirm)
      if (!window.confirm(`${incompleteInCurrent} task(s) in "${o.currentStage}" aren't done — advance anyway?`)) { setDragId(null); setDragOver(null); return; }
    }
    store.updateOnboardingStage(dragId, stage);
    setDragId(null);
    setDragOver(null);
  };

  return (
    <>
      <PageHeader title="Client Onboarding" desc="New clients from signed deal to go-live — kickoff, config, import, training"
        actions={<Button variant="primary" onClick={() => setStartModal(true)}><Plus size={15} /> Start Onboarding</Button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi label="In Pipeline" value={String(store.onboarding.length)} sub="active onboardings" />
        <Kpi label="Pipeline MRR" value={fmtINR(pipelineMRR)} sub="combined deal value" trend="pos" />
        <Kpi label="Avg Time to Live" value="16 days" sub="target 21" trend="pos" />
        <Kpi label="Go-Live Ready" value={String(goLiveCount)} sub="awaiting sign-off" trend={goLiveCount > 0 ? "warn" : undefined} />
      </div>
      {/* Kanban board */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${ONBOARD_STAGES.length}, minmax(200px, 1fr))`, overflowX: "auto" }}>
        {ONBOARD_STAGES.map((stage) => {
          const items = store.onboarding.filter((o) => o.currentStage === stage);
          const isOver = dragOver === stage;
          return (
            <div key={stage} className="rounded-xl border transition-colors"
              style={{ borderColor: isOver ? T.primary : T.border, background: isOver ? T.primarySoft : T.subtle }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(stage)}>
              <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: T.border }}>
                <span className="text-[12px] font-semibold" style={{ color: T.text }}>{stage}</span>
                <Badge tone={stageTone[stage]}>{items.length}</Badge>
              </div>
              <div className="p-2 space-y-2 min-h-[120px]">
                {items.map((o) => {
                  const done = o.checklist.filter((c) => c.completed).length;
                  const total = o.checklist.length;
                  return (
                    <div key={o.id}
                      draggable
                      onDragStart={() => setDragId(o.id)}
                      onDragEnd={() => { setDragId(null); setDragOver(null); }}
                      onClick={() => setDetail(o)}
                      className="rounded-lg border bg-[var(--t-surface)] p-3 cursor-pointer hover:shadow-md transition-shadow"
                      style={{ borderColor: T.border, opacity: dragId === o.id ? 0.4 : 1 }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <GripVertical size={12} style={{ color: T.text3 }} className="shrink-0 cursor-grab" />
                        <Avatar name={o.clientName} tone={o.industry === "Clinic" ? "purple" : "brand"} size={22} />
                        <span className="text-[13px] font-medium leading-tight flex-1 truncate" style={{ color: T.text }}>{o.clientName}</span>
                      </div>
                      <div className="text-[11px] mb-2" style={{ color: T.text2 }}>{o.industry} · {o.owner}</div>
                      <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${(done / total) * 100}%`, background: done === total ? T.success : T.primary }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px]" style={{ color: T.text3 }}>
                        <span>{done}/{total} tasks</span>
                        <span className="font-medium" style={{ color: T.text2 }}>{fmtINR(o.dealMRR)}</span>
                      </div>
                    </div>
                  );
                })}
                {!items.length && <div className="text-center text-[11px] py-6" style={{ color: T.text3 }}>Drop here</div>}
              </div>
            </div>
          );
        })}
      </div>
      <OnboardingDetail item={detail ? store.onboarding.find((x) => x.id === detail.id) || detail : null} onClose={() => setDetail(null)} />
      <StartOnboardingModal open={startModal} onClose={() => setStartModal(false)} onCreated={(rec) => setDetail(rec)} />
    </>
  );
}

