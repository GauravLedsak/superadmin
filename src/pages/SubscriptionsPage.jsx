import React, { useState, useMemo } from "react";
import {
  Plug, Trash2, Plus, Briefcase, UserPlus, Check, Eye, Pencil, Copy, Archive, X, ArrowLeft,
  ArrowRight, CheckCircle2, Tag, XCircle, History,
} from "lucide-react";
import { T, cx } from "../theme.js";
import { fmtINR, fmtLakh, fmtRecords } from "../lib/format.js";
import { NOW, ADMIN } from "../data/constants.js";
import { PricingEngine, CUSTOM_RESOURCES, INTEGRATION_OPTIONS, BLANK_PLAN } from "../data/seed.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  Button, Card, CardHeader, CardBody, Field, Badge, Table, Td, Menu, Drawer, Modal,
  SearchInput, FilterPill, Pagination, usePagination, statusBadge, Avatar, Kpi, BarList,
  Tabs, PageHeader,
} from "../components/ui.jsx";

export const SP_TABS = ["Overview", "Plan Library", "Addon Pricing", "Client Subscriptions", "Revenue"];

/* --- PLAN FORM (Create / Edit / Duplicate) --- */
// Total monthly cost implied by the resource builder (both plan types price this way) —
// shared by the live summary panel and the auto-synced Monthly Price field.
export function planResourceTotal(f) {
  return CUSTOM_RESOURCES.reduce((s, r) => s + (Number(f[r.qtyK]) || 0) * (Number(f[r.priceK]) || 0), 0) +
    (f.integrationsList || []).reduce((s, it) => s + (Number(it.price) || 0), 0) +
    (f.dealsModuleEnabled ? (Number(f.dealsModulePrice) || 0) : 0);
}
export const YEARLY_DISCOUNT_OPTIONS = [0, 5, 10, 15, 20, 25];

export function PlanForm({ initial, onSave, onCancel, onAssign, mode, clients }) {
  const [f, setF] = useState(initial || { ...BLANK_PLAN });
  const [assignClientId, setAssignClientId] = useState("");
  const u = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const num = (k) => (e) => u(k, Number(e.target.value) || 0);
  const [errors, setErrors] = useState({});
  const isNewCustomPlan = mode === "create" && f.planType === "Custom";

  // Monthly/Yearly Price are computed from the resource builder, not typed in — the plan's
  // price and its line-item breakdown can never disagree. Yearly applies the chosen discount.
  React.useEffect(() => {
    const total = planResourceTotal(f);
    const yearly = Math.round(total * 12 * (1 - (Number(f.yearlyDiscountPct) || 0) / 100));
    if (total !== f.monthlyPrice || yearly !== f.yearlyPrice) setF((p) => ({ ...p, monthlyPrice: total, yearlyPrice: yearly }));
  }, [JSON.stringify(CUSTOM_RESOURCES.map((r) => [f[r.qtyK], f[r.priceK]])), JSON.stringify(f.integrationsList), f.yearlyDiscountPct, f.dealsModuleEnabled, f.dealsModulePrice]);

  const validateCore = () => {
    const e = {};
    if (!f.planName.trim()) e.planName = "Required";
    if (f.usersIncluded < 1) e.usersIncluded = "Min 1";
    return e;
  };
  const validate = () => {
    const e = validateCore();
    if (isNewCustomPlan && !assignClientId) e.assignClientId = "Pick the client this plan is for";
    setErrors(e); return Object.keys(e).length === 0;
  };
  const submit = () => { if (validate()) onSave(isNewCustomPlan ? { ...f, assignClientId } : f); };
  // "Save & Assign" skips the inline client picker — the full assignment wizard picks the
  // company (and, for Custom plans, is where pricing actually gets confirmed), so it doesn't
  // need assignClientId set here.
  const submitAndAssign = () => {
    const e = validateCore();
    setErrors(e);
    if (Object.keys(e).length === 0) onAssign(f);
  };
  const Inp = ({ label, k, type = "number", err }) => (
    <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>{label}{err && <span style={{ color: T.danger }}> — {err}</span>}</label>
      <input type={type} value={f[k]} onChange={type === "number" ? num(k) : (e) => u(k, e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: errors[k] ? T.danger : T.border, "--tw-ring-color": T.ring }} /></div>
  );
  const Chk = ({ label, k }) => (
    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={f[k]} onChange={(e) => u(k, e.target.checked)} className="w-4 h-4 rounded" /><span className="text-[13px]" style={{ color: T.text }}>{label}</span></label>
  );
  return (
    <div className="space-y-5">
      <div className="text-lg font-semibold" style={{ color: T.text }}>{mode === "create" ? "Create Plan" : mode === "duplicate" ? "Duplicate Plan" : "Edit Plan"}</div>
      {/* Core */}
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Plan Name" k="planName" type="text" err={errors.planName} />
        <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Plan Type</label>
          <select value={f.planType} onChange={(e) => {
            const pt = e.target.value;
            if (pt === "Custom") {
              setF((p) => ({ ...p, planType: pt, usersMaximum: p.usersIncluded, recordsMaximum: p.recordsIncluded, integrationsMaximum: p.integrationsIncluded }));
            } else { u("planType", pt); }
          }} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
            <option>Published</option><option>Custom</option>
          </select></div>
      </div>
      {isNewCustomPlan && (
        <div className="rounded-xl border p-4" style={{ borderColor: errors.assignClientId ? T.danger : T.ring, background: T.primarySoft }}>
          <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Client{errors.assignClientId && <span style={{ color: T.danger }}> — {errors.assignClientId}</span>}</label>
          <select value={assignClientId} onChange={(e) => setAssignClientId(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: errors.assignClientId ? T.danger : T.border, background: T.surface }}>
            <option value="">Select the client this plan is being built for…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.industry}</option>)}
          </select>
          <p className="text-[11px] mt-1.5" style={{ color: T.text2 }}>Custom plans are built one-off, per client — this one will be created and assigned to them in a single step.</p>
        </div>
      )}
      <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Description</label>
        <textarea value={f.description} onChange={(e) => u("description", e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none resize-none" style={{ borderColor: T.border }} /></div>
      {/* Pricing — always derived from the resource builder; only the yearly discount is chosen */}
      <div className="border-t pt-4" style={{ borderColor: T.border }}>
        <div className="text-[13px] font-semibold mb-3" style={{ color: T.text }}>Pricing</div>
        <div className="grid grid-cols-4 gap-3">
          <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Monthly Price (₹)</label>
            <div className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px]" style={{ borderColor: T.border, background: T.subtle, color: T.text }}>{fmtINR(f.monthlyPrice)}</div>
            <p className="text-[10px] mt-1" style={{ color: T.text3 }}>From resources below</p></div>
          <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Yearly Discount</label>
            <select value={f.yearlyDiscountPct} onChange={(e) => u("yearlyDiscountPct", Number(e.target.value))} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
              {YEARLY_DISCOUNT_OPTIONS.map((pct) => <option key={pct} value={pct}>{pct === 0 ? "No discount" : pct + "% off"}</option>)}
            </select>
            <p className="text-[10px] mt-1" style={{ color: T.text3 }}>Applied to yearly billing</p></div>
          <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Yearly Price (₹)</label>
            <div className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px]" style={{ borderColor: T.border, background: T.subtle, color: T.text }}>{fmtINR(f.yearlyPrice)}</div>
            {f.yearlyDiscountPct > 0 && <p className="text-[10px] mt-1" style={{ color: T.success }}>Saves {fmtINR(f.monthlyPrice * 12 - f.yearlyPrice)} vs monthly</p>}</div>
          <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Status</label>
            <select value={f.status} onChange={(e) => u("status", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
              <option>Active</option><option>Inactive</option><option>Archived</option>
            </select></div>
        </div>
      </div>
      {/* Resources */}
      <div className="border-t pt-4" style={{ borderColor: T.border }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] font-semibold" style={{ color: T.text }}>Resources & Limits</div>
          {f.planType === "Custom"
            ? <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: T.purpleSoft, color: T.purpleFg }}>Custom — priced per resource for this client</span>
            : <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: T.primarySoft, color: T.accentText }}>Published — reusable template, priced per resource</span>}
        </div>
        {/* Both plan types build price the same way: every resource priced individually */}
        {(
          <div className="space-y-3">
            {CUSTOM_RESOURCES.map((r) => {
              const qty = Number(f[r.qtyK]) || 0;
              const price = Number(f[r.priceK]) || 0;
              const subtotal = qty * price;
              const Icon = r.icon;
              return (
                <div key={r.key} className="rounded-xl border p-4" style={{ borderColor: T.border }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: T.primarySoft, color: T.primary }}><Icon size={18} /></div>
                      <div><div className="text-[13px] font-semibold" style={{ color: T.text }}>{r.label}</div><div className="text-[11px]" style={{ color: T.text3 }}>{r.unit}</div></div>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: T.primarySoft, color: T.primary }}>{fmtINR(subtotal)}/mo</span>
                  </div>
                  <div className={cx("grid gap-3", r.perUnit ? "grid-cols-3" : "grid-cols-2")}>
                    {r.perUnit && <Inp label={r.perUnit.label} k={r.perUnit.k} />}
                    <Inp label={r.qtyLabel} k={r.qtyK} err={errors[r.qtyK]} />
                    <Inp label="Cost per Unit (₹)" k={r.priceK} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <Chk label="Enable overage / addon pricing" k={r.enableK} />
                    <div className="text-right"><div className="text-[10px] uppercase tracking-wider" style={{ color: T.text3 }}>Subtotal</div><div className="text-[14px] font-semibold" style={{ color: T.text }}>{fmtINR(subtotal)}</div></div>
                  </div>
                </div>
              );
            })}
            {/* Integrations: not a quantity — a selectable, growable list, each priced on its own */}
            <div className="rounded-xl border p-4" style={{ borderColor: T.border }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: T.primarySoft, color: T.primary }}><Plug size={18} /></div>
                  <div><div className="text-[13px] font-semibold" style={{ color: T.text }}>Integrations</div><div className="text-[11px]" style={{ color: T.text3 }}>priced per integration / mo</div></div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: T.primarySoft, color: T.primary }}>{fmtINR((f.integrationsList || []).reduce((s, it) => s + (Number(it.price) || 0), 0))}/mo</span>
              </div>
              <div className="space-y-2">
                {(f.integrationsList || []).map((it, i) => (
                  <div key={it.id} className="flex items-end gap-2">
                    <div className="flex-1"><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Integration</label>
                      <select value={it.name} onChange={(e) => u("integrationsList", f.integrationsList.map((x, xi) => xi === i ? { ...x, name: e.target.value } : x))}
                        className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
                        {INTEGRATION_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="w-36"><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Cost (₹)</label>
                      <input type="number" value={it.price} onChange={(e) => u("integrationsList", f.integrationsList.map((x, xi) => xi === i ? { ...x, price: Number(e.target.value) || 0 } : x))}
                        className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} />
                    </div>
                    <button onClick={() => u("integrationsList", f.integrationsList.filter((_, xi) => xi !== i))} className="p-2 rounded-lg hover:bg-[var(--t-hover)]" title="Remove"><Trash2 size={15} style={{ color: T.danger }} /></button>
                  </div>
                ))}
                {!(f.integrationsList || []).length && <div className="text-[12px] py-2" style={{ color: T.text3 }}>No integrations added yet.</div>}
              </div>
              <button onClick={() => u("integrationsList", [...(f.integrationsList || []), { id: "int-" + Date.now() + Math.random().toString(36).slice(2, 6), name: INTEGRATION_OPTIONS[0], price: 0 }])}
                className="mt-3 flex items-center gap-1.5 text-[12px] font-medium" style={{ color: T.primary }}><Plus size={14} /> Add Integration</button>
            </div>
            {/* Deals Module: an optional priced add-on module, not a free flag */}
            <div className="rounded-xl border p-4" style={{ borderColor: T.border }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: T.primarySoft, color: T.primary }}><Briefcase size={18} /></div>
                  <div>
                    <Chk label="Deals Module" k="dealsModuleEnabled" />
                    <div className="text-[11px] mt-0.5" style={{ color: T.text3 }}>separate module · priced per month when added</div>
                  </div>
                </div>
                {f.dealsModuleEnabled && (
                  <div className="w-40"><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Module Price (₹/mo)</label>
                    <input type="number" value={f.dealsModulePrice} onChange={num("dealsModulePrice")} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} />
                  </div>
                )}
              </div>
            </div>
            {/* Resource pricing summary */}
            <div className="rounded-xl border-2 p-4" style={{ borderColor: T.ring, background: T.primarySoft }}>
              <div className="text-[13px] font-semibold mb-2" style={{ color: T.text }}>Resource pricing summary</div>
              {CUSTOM_RESOURCES.map((r) => {
                const qty = Number(f[r.qtyK]) || 0; const price = Number(f[r.priceK]) || 0;
                return (
                  <div key={r.key} className="flex justify-between text-[13px] py-1 border-b" style={{ borderColor: T.border, color: T.text2 }}>
                    <span>{r.label} ({qty} × {fmtINR(price)})</span><span className="font-medium" style={{ color: T.text }}>{fmtINR(qty * price)}</span>
                  </div>
                );
              })}
              {(f.integrationsList || []).map((it) => (
                <div key={it.id} className="flex justify-between text-[13px] py-1 border-b" style={{ borderColor: T.border, color: T.text2 }}>
                  <span>{it.name}</span><span className="font-medium" style={{ color: T.text }}>{fmtINR(Number(it.price) || 0)}</span>
                </div>
              ))}
              {f.dealsModuleEnabled && (
                <div className="flex justify-between text-[13px] py-1 border-b" style={{ borderColor: T.border, color: T.text2 }}>
                  <span>Deals Module</span><span className="font-medium" style={{ color: T.text }}>{fmtINR(Number(f.dealsModulePrice) || 0)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-[14px] font-semibold" style={{ color: T.text }}>
                <span>Total resource cost / mo</span>
                <span style={{ color: T.primary }}>{fmtINR(planResourceTotal(f))}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Actions */}
      <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: T.border }}>
        <Button onClick={onCancel}>Cancel</Button>
        {onAssign && <Button onClick={submitAndAssign}><UserPlus size={15} /> {mode === "create" ? "Create & Assign Subscription" : "Save & Assign Subscription"}</Button>}
        <Button variant="primary" onClick={submit}><Check size={15} /> {mode === "create" ? "Create Plan" : "Save Changes"}</Button>
      </div>
    </div>
  );
}

/* --- PLAN LIBRARY --- */
export function PlanLibrary({ onAssignSubscription }) {
  const store = useStore();
  const [q, setQ] = useState("");
  const [typeF, setTypeF] = useState("All");
  const [statusF, setStatusF] = useState("All");
  const [drawer, setDrawer] = useState(null); // { mode, plan }
  const [viewPlan, setViewPlan] = useState(null);

  const rows = useMemo(() => store.spPlans.filter((p) =>
    p.planName.toLowerCase().includes(q.toLowerCase()) &&
    (typeF === "All" || p.planType === typeF) &&
    (statusF === "All" || p.status === statusF)
  ), [store.spPlans, q, typeF, statusF]);

  const clientCount = (planId) => store.subscriptions.filter((s) => s.planId === planId && s.status !== "Cancelled").length;
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(rows, 10);

  const handleSave = (plan) => {
    const { assignClientId, ...planData } = plan;
    if (drawer.mode === "create" || drawer.mode === "duplicate") {
      const created = store.createPlan(planData);
      if (assignClientId) {
        // <option value={c.id}> always serializes to a string, but client ids are numbers —
        // compare as strings so the lookup doesn't silently miss on strict equality.
        const company = store.clients.find((c) => String(c.id) === String(assignClientId));
        if (company && created) {
          store.createSubscription({
            companyId: company.id, companyName: company.name, planId: created.id, planName: created.planName,
            billingCycle: "Monthly", status: "Active", startDate: NOW, renewalDate: "13 Jun 2026",
            isTrial: false, trialEnd: null, basePrice: created.monthlyPrice, addons: [], discount: null,
            subtotal: created.monthlyPrice, finalPrice: created.monthlyPrice, notes: "",
          });
        }
      }
    } else {
      store.updatePlan(drawer.plan.id, planData, "Edited");
    }
    setDrawer(null);
  };
  const handleDuplicate = (p) => {
    const dup = store.duplicatePlan(p.id);
    if (dup) setDrawer({ mode: "duplicate", plan: dup });
  };
  const handleCreateAndAssign = (planData) => {
    let plan;
    if (drawer.mode === "create" || drawer.mode === "duplicate") {
      plan = store.createPlan(planData);
    } else {
      store.updatePlan(drawer.plan.id, planData, "Edited");
      plan = { ...drawer.plan, ...planData };
    }
    setDrawer(null);
    onAssignSubscription?.(plan);
  };

  // "Add Client" — assign a Published plan to an existing client or create a new one.
  const [assignPlan, setAssignPlan] = useState(null);
  const [assignMode, setAssignMode] = useState("existing"); // "existing" | "new"
  const [assignClient, setAssignClient] = useState("");
  const [assignCycle, setAssignCycle] = useState("Monthly");
  const [newClientName, setNewClientName] = useState("");
  const [newClientIndustry, setNewClientIndustry] = useState("");
  const openAssign = (p) => {
    setAssignPlan(p); setAssignMode("existing"); setAssignClient("");
    setAssignCycle("Monthly"); setNewClientName(""); setNewClientIndustry("");
  };
  const confirmAssign = () => {
    const price = assignCycle === "Yearly" ? assignPlan.yearlyPrice : assignPlan.monthlyPrice;
    let company;
    if (assignMode === "existing") {
      company = store.clients.find((c) => String(c.id) === String(assignClient));
      if (!company) return;
    } else {
      if (!newClientName.trim()) return;
      company = store.createClient({ name: newClientName.trim(), industry: newClientIndustry || "Other", status: "Active", branch: "", riskLevel: "Low", accountManager: "" });
    }
    if (!company || !assignPlan) return;
    store.createSubscription({
      companyId: company.id, companyName: company.name, planId: assignPlan.id, planName: assignPlan.planName,
      billingCycle: assignCycle, status: "Active", startDate: NOW, renewalDate: assignCycle === "Yearly" ? "13 May 2027" : "13 Jun 2026",
      isTrial: false, trialEnd: null, basePrice: price, addons: [], discount: null,
      subtotal: price, finalPrice: price, notes: "",
    });
    setAssignPlan(null);
  };
  const assignCanConfirm = assignMode === "existing" ? !!assignClient : !!newClientName.trim();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex gap-2 items-center mb-3.5 flex-wrap shrink-0">
        <SearchInput value={q} onChange={setQ} placeholder="Search plans…" />
        <span className="text-[11px] font-semibold uppercase tracking-wider ml-1" style={{ color: T.text3 }}>Type</span>
        {["All", "Published", "Custom"].map((f) => <FilterPill key={f} active={typeF === f} onClick={() => setTypeF(f)}>{f}</FilterPill>)}
        <span className="text-[11px] font-semibold uppercase tracking-wider ml-1" style={{ color: T.text3 }}>Status</span>
        {["All", "Active", "Inactive", "Archived"].map((f) => <FilterPill key={f} active={statusF === f} onClick={() => setStatusF(f)}>{f}</FilterPill>)}
        <Button variant="primary" className="ml-auto" onClick={() => setDrawer({ mode: "create", plan: null })}><Plus size={15} /> Create Plan</Button>
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={["Plan Name", "Type", "Monthly", "Yearly", "Users", "Records", "Status", "Clients", "Created By", ""]}>
          {pageRows.map((p) => (
            <tr key={p.id} className="hover:bg-[#F8F9FC]">
              <Td><button onClick={() => setViewPlan(p)} className="font-medium hover:underline" style={{ color: T.primary }}>{p.planName}</button></Td>
              <Td><Badge tone={p.planType === "Published" ? "brand" : "purple"}>{p.planType}</Badge></Td>
              <Td className="font-medium">{fmtINR(p.monthlyPrice)}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{fmtINR(p.yearlyPrice)}</Td>
              <Td className="text-xs">{p.usersIncluded}–{p.usersMaximum}</Td>
              <Td className="text-xs">{fmtRecords(p.recordsIncluded)}</Td>
              <Td>{statusBadge(p.status)}</Td>
              <Td>{clientCount(p.id)}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{p.createdBy}</Td>
              <Td><div className="flex items-center gap-1.5 justify-end">
                {p.planType === "Published" && p.status === "Active" && (
                  <Button size="sm" onClick={() => openAssign(p)}><UserPlus size={13} /> Add Client</Button>
                )}
                <Menu items={[
                  { label: "View", icon: Eye, onClick: () => setViewPlan(p) },
                  { label: "Edit", icon: Pencil, onClick: () => setDrawer({ mode: "edit", plan: p }) },
                  { label: "Duplicate", icon: Copy, onClick: () => handleDuplicate(p) },
                  { divider: true },
                  p.status !== "Archived" ? { label: "Archive", icon: Archive, onClick: () => store.archivePlan(p.id) } : null,
                  clientCount(p.id) === 0 ? { label: "Delete", icon: Trash2, danger: true, onClick: () => store.deletePlan(p.id) } : null,
                ].filter(Boolean)} />
              </div></Td>
            </tr>
          ))}
          {!rows.length && <tr><Td colSpan={10} className="text-center py-10" style={{ color: T.text3 }}>No plans match filters</Td></tr>}
        </Table>
      </Card>
      {/* Create/Edit Drawer */}
      <Drawer open={!!drawer} onClose={() => setDrawer(null)} width={700}>
        {drawer && <div className="p-6"><PlanForm initial={drawer.mode === "create" ? null : drawer.plan} mode={drawer.mode} onSave={handleSave} onAssign={handleCreateAndAssign} onCancel={() => setDrawer(null)} clients={store.clients} /></div>}
      </Drawer>
      {/* Add Client to a Published plan */}
      <Modal open={!!assignPlan} onClose={() => setAssignPlan(null)} title={`Assign ${assignPlan?.planName || ""}`}
        footer={<><Button onClick={() => setAssignPlan(null)}>Cancel</Button><Button variant="primary" disabled={!assignCanConfirm} onClick={confirmAssign}><Check size={15} /> Confirm</Button></>}>
        <div className="space-y-3">
          {/* mode toggle */}
          <div className="flex rounded-lg border overflow-hidden text-[12px] font-medium" style={{ borderColor: T.border }}>
            {[["existing", "Existing Client"], ["new", "New Client"]].map(([v, lbl]) => (
              <button key={v} onClick={() => setAssignMode(v)}
                className="flex-1 py-1.5 transition-colors"
                style={{ background: assignMode === v ? T.primary : T.surface, color: assignMode === v ? "#fff" : T.text2 }}>
                {lbl}
              </button>
            ))}
          </div>

          {assignMode === "existing" ? (
            <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Client</label>
              <select value={assignClient} onChange={(e) => setAssignClient(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
                <option value="">Select a client…</option>
                {store.clients.filter((c) => c.status !== "Suspended").map((c) => <option key={c.id} value={c.id}>{c.name} · {c.industry}</option>)}
              </select></div>
          ) : (
            <div className="space-y-2">
              <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Company Name</label>
                <input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="e.g. Sunrise Motors" className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} /></div>
              <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Industry</label>
                <select value={newClientIndustry} onChange={(e) => setNewClientIndustry(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
                  <option value="">Select industry…</option>
                  {["Automotive", "Real Estate", "Finance", "Healthcare", "Retail", "Education", "Logistics", "Other"].map((i) => <option key={i}>{i}</option>)}
                </select></div>
            </div>
          )}

          <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Billing Cycle</label>
            <select value={assignCycle} onChange={(e) => setAssignCycle(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
              <option>Monthly</option><option>Yearly</option>
            </select></div>

          {assignPlan && (
            <div className="rounded-lg border p-3 text-[13px] flex justify-between" style={{ borderColor: T.border, background: T.subtle }}>
              <span style={{ color: T.text2 }}>{assignCycle} billing</span>
              <span className="font-semibold" style={{ color: T.primary }}>{fmtINR(assignCycle === "Yearly" ? assignPlan.yearlyPrice : assignPlan.monthlyPrice)}{assignCycle === "Yearly" ? "/yr" : "/mo"}</span>
            </div>
          )}
        </div>
      </Modal>
      {/* View Plan Drawer */}
      <Drawer open={!!viewPlan} onClose={() => setViewPlan(null)} width={560}>
        {viewPlan && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div><h2 className="text-lg font-semibold" style={{ color: T.text }}>{viewPlan.planName}</h2><p className="text-xs" style={{ color: T.text2 }}>{viewPlan.description}</p></div>
              <div className="flex gap-2"><Badge tone={viewPlan.planType === "Published" ? "brand" : "purple"}>{viewPlan.planType}</Badge>{statusBadge(viewPlan.status)}</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Kpi label="Monthly" value={fmtINR(viewPlan.monthlyPrice)} /><Kpi label="Yearly" value={fmtINR(viewPlan.yearlyPrice)} /><Kpi label="Clients" value={String(clientCount(viewPlan.id))} />
            </div>
            <Card><CardHeader title="Resources" /><CardBody>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Users">{viewPlan.usersIncluded}–{viewPlan.usersMaximum}{viewPlan.usersAddonAllowed ? ` · addon ${fmtINR(viewPlan.usersAddonPrice)}/user` : ""}</Field>
                <Field label="Records">{fmtRecords(viewPlan.recordsIncluded)} – {fmtRecords(viewPlan.recordsMaximum)}{viewPlan.recordsAddonAllowed ? ` · addon ${fmtINR(viewPlan.recordsAddonPrice)}/lakh` : ""}</Field>
                <Field label="Integrations">{viewPlan.integrationsIncluded}–{viewPlan.integrationsMaximum}{viewPlan.integrationsAddonAllowed ? ` · addon ${fmtINR(viewPlan.integrationsAddonPrice)}/slot` : ""}</Field>
                <Field label="Automations">{viewPlan.automationsIncluded}</Field>
                <Field label="Custom Entities">{viewPlan.customEntitiesIncluded}</Field>
                <Field label="Deals Module">{viewPlan.dealsModuleEnabled ? "Enabled" : "Disabled"}</Field>
              </div>
            </CardBody></Card>
            <Card><CardHeader title="History" /><CardBody className="space-y-2">
              {store.history.filter((h) => h.entityId === viewPlan.id).map((h) => (
                <div key={h.id} className="flex gap-2 items-start text-xs py-1.5 border-b last:border-0" style={{ borderColor: T.border }}>
                  <History size={13} style={{ color: T.text3, marginTop: 2 }} />
                  <div><span className="font-medium" style={{ color: T.text }}>{h.action}</span> · {h.changedBy} · {h.changedDate}{h.reason && <span style={{ color: T.text2 }}> — {h.reason}</span>}</div>
                </div>
              ))}
              {store.history.filter((h) => h.entityId === viewPlan.id).length === 0 && <div className="text-xs text-center py-4" style={{ color: T.text3 }}>No history</div>}
            </CardBody></Card>
            <div className="flex gap-2"><Button onClick={() => { setViewPlan(null); setDrawer({ mode: "edit", plan: viewPlan }); }}><Pencil size={14} /> Edit</Button><Button onClick={() => { setViewPlan(null); handleDuplicate(viewPlan); }}><Copy size={14} /> Duplicate</Button></div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

/* --- ADDON PRICING --- */
export function AddonPricingPage() {
  const store = useStore();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const start = (a) => { setEditing(a.id); setForm({ pricePerUnit: a.pricePerUnit, minimum: a.minimum, maximum: a.maximum, enabled: a.enabled, description: a.description }); };
  const save = () => { store.updateAddonPricing(editing, form); setEditing(null); };
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div><div className="text-[15px] font-semibold" style={{ color: T.text }}>Global Add-on Pricing</div><p className="text-xs" style={{ color: T.text2 }}>Default pricing — custom plans may override per-addon</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {store.addonPricing.map((a) => (
          <Card key={a.id}>
            <CardHeader title={a.addonType} action={<Badge tone={a.enabled ? "success" : "gray"}>{a.enabled ? "Enabled" : "Disabled"}</Badge>} />
            <CardBody>
              {editing === a.id ? (
                <div className="space-y-2">
                  <div><label className="text-[11px] font-semibold" style={{ color: T.text3 }}>Price per Unit (₹)</label><input type="number" value={form.pricePerUnit} onChange={(e) => setForm((f) => ({ ...f, pricePerUnit: +e.target.value }))} className="w-full mt-1 px-3 py-1.5 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-[11px] font-semibold" style={{ color: T.text3 }}>Min</label><input type="number" value={form.minimum} onChange={(e) => setForm((f) => ({ ...f, minimum: +e.target.value }))} className="w-full mt-1 px-3 py-1.5 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} /></div>
                    <div><label className="text-[11px] font-semibold" style={{ color: T.text3 }}>Max</label><input type="number" value={form.maximum} onChange={(e) => setForm((f) => ({ ...f, maximum: +e.target.value }))} className="w-full mt-1 px-3 py-1.5 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} /></div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} /><span className="text-[13px]">Enabled</span></label>
                  <div className="flex gap-2"><Button size="sm" variant="primary" onClick={save}><Check size={13} /> Save</Button><Button size="sm" onClick={() => setEditing(null)}>Cancel</Button></div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-[22px] font-semibold" style={{ color: T.text }}>{fmtINR(a.pricePerUnit)}<span className="text-xs font-normal" style={{ color: T.text3 }}>/unit/mo</span></div>
                  <div className="text-xs" style={{ color: T.text2 }}>{a.description}</div>
                  <div className="text-xs" style={{ color: T.text2 }}>Range: {a.minimum}–{a.maximum} units</div>
                  <Button size="sm" onClick={() => start(a)}><Pencil size={13} /> Edit</Button>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}

/* --- SUBSCRIPTION ASSIGN WIZARD --- */
export function SubscriptionAssign({ onClose, editSub, presetPlanId }) {
  const store = useStore();
  const [step, setStep] = useState(editSub ? 3 : 1);
  const [companyId, setCompanyId] = useState(editSub?.companyId || null);
  const [planId, setPlanId] = useState(editSub?.planId || presetPlanId || "");
  const presetPlan = presetPlanId ? store.spPlans.find((p) => p.id === presetPlanId) : null;
  const [cycle, setCycle] = useState(editSub?.billingCycle || "Monthly");
  const [addons, setAddons] = useState(editSub?.addons || []);
  const [discType, setDiscType] = useState(editSub?.discount?.type || "Flat");
  const [discVal, setDiscVal] = useState(editSub?.discount?.value || 0);
  const [discReason, setDiscReason] = useState(editSub?.discount?.reason || "");
  const [notes, setNotes] = useState(editSub?.notes || "");
  const [isTrial, setIsTrial] = useState(editSub?.isTrial || false);
  // Custom plan: admin sets the price directly
  const [quotedPrice, setQuotedPrice] = useState(editSub?.finalPrice || 0);
  const [quotedReason, setQuotedReason] = useState(editSub?.discount?.reason || "");

  const company = store.clients.find((c) => c.id === companyId);
  const plan = store.spPlans.find((p) => p.id === planId);
  const isCustom = plan?.planType === "Custom";
  const discount = { type: discType, value: discVal, reason: discReason, appliedBy: ADMIN, appliedDate: NOW };

  // Preview: Published uses pricing engine; Custom uses quoted price directly
  const preview = plan ? (isCustom
    ? { basePrice: PricingEngine.getBasePrice(plan, cycle), addonTotal: 0, subtotal: PricingEngine.getBasePrice(plan, cycle), finalPrice: quotedPrice || PricingEngine.getBasePrice(plan, cycle), discountAmount: PricingEngine.getBasePrice(plan, cycle) - (quotedPrice || PricingEngine.getBasePrice(plan, cycle)) }
    : PricingEngine.preview(plan, cycle, addons, discount)
  ) : null;

  const toggleAddon = (type, unitPrice) => {
    setAddons((as) => { const ex = as.find((a) => a.type === type); if (ex) return as.filter((a) => a.type !== type); return [...as, { type, quantity: 1, unitPrice, total: unitPrice }]; });
  };
  const setAddonQty = (type, qty) => {
    setAddons((as) => as.map((a) => a.type === type ? { ...a, quantity: qty, total: qty * a.unitPrice } : a));
  };

  const submit = () => {
    if (!plan || !company) return;
    const p = preview;
    const finalDiscount = isCustom
      ? { type: "Flat", value: p.basePrice - (quotedPrice || p.basePrice), reason: quotedReason || "Negotiated pricing", appliedBy: ADMIN, appliedDate: NOW }
      : discount;
    const sub = { companyId: company.id, companyName: company.name, planId: plan.id, planName: plan.planName, billingCycle: cycle, status: isTrial ? "Trial" : "Active",
      startDate: NOW, renewalDate: cycle === "Yearly" ? "13 May 2027" : "13 Jun 2026", isTrial, trialEnd: isTrial ? "27 May 2026" : null,
      basePrice: p.basePrice, addons: isCustom ? [] : addons, discount: finalDiscount, subtotal: isCustom ? p.basePrice : p.subtotal, finalPrice: isCustom ? (quotedPrice || p.basePrice) : p.finalPrice, notes };
    if (editSub) store.updateSubscription(editSub.id, sub, "Modified");
    else store.createSubscription(sub);
    onClose();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="text-lg font-semibold" style={{ color: T.text }}>{editSub ? "Edit Subscription" : "Assign Subscription"}</div>
      {/* Step indicator */}
      <div className="flex gap-1 mb-2">{[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex-1 h-1 rounded-full" style={{ background: s <= step ? T.primary : T.border }} />
      ))}</div>

      {/* Step 1: Company */}
      {step === 1 && (<div className="space-y-3">
        <div className="text-[13px] font-semibold" style={{ color: T.text }}>Step 1 — Choose Company</div>
        {presetPlan && (
          <div className="flex items-center gap-2 rounded-lg p-3" style={{ background: T.primarySoft, border: `1px solid ${T.ring}` }}>
            <Check size={15} style={{ color: T.primary }} />
            <div className="text-[12px]" style={{ color: T.text }}>Plan preselected: <span className="font-semibold">{presetPlan.planName}</span> — just pick a company to continue.</div>
          </div>
        )}
        {store.clients.filter((c) => c.status !== "Suspended").map((c) => (
          <button key={c.id} onClick={() => { setCompanyId(c.id); setStep(presetPlanId ? 3 : 2); }} className={cx("w-full flex items-center gap-3 p-3 rounded-lg border text-left transition", companyId === c.id ? "ring-2" : "hover:bg-[var(--t-subtle)]")}
            style={{ borderColor: companyId === c.id ? T.primary : T.border, "--tw-ring-color": T.ring }}>
            <Avatar name={c.name} /><div><div className="text-[13px] font-medium" style={{ color: T.text }}>{c.name}</div><div className="text-[11px]" style={{ color: T.text2 }}>{c.industry} · {c.branch}</div></div>
          </button>
        ))}
      </div>)}

      {/* Step 2: Plan */}
      {step === 2 && (<div className="space-y-3">
        <div className="text-[13px] font-semibold" style={{ color: T.text }}>Step 2 — Choose Plan</div>
        {store.spPlans.filter((p) => p.status === "Active").map((p) => (
          <button key={p.id} onClick={() => { setPlanId(p.id); if (p.planType === "Custom") setQuotedPrice(p.monthlyPrice); setStep(3); }} className={cx("w-full flex items-center justify-between p-3 rounded-lg border text-left transition", planId === p.id ? "ring-2" : "hover:bg-[var(--t-subtle)]")}
            style={{ borderColor: planId === p.id ? T.primary : T.border, "--tw-ring-color": T.ring }}>
            <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{p.planName}</div><div className="text-[11px]" style={{ color: T.text2 }}>{p.planType} · {p.usersIncluded} users · {fmtRecords(p.recordsIncluded)} records</div></div>
            <div className="text-right"><div className="text-[14px] font-semibold" style={{ color: T.text }}>{fmtINR(p.monthlyPrice)}<span className="text-xs font-normal" style={{ color: T.text3 }}>/mo</span></div></div>
          </button>
        ))}
        <Button onClick={() => setStep(1)}><ArrowLeft size={14} /> Back</Button>
      </div>)}

      {/* Step 3: Configure & Preview */}
      {step === 3 && plan && (<div className="space-y-3">
        <div className="text-[13px] font-semibold" style={{ color: T.text }}>Step 3 — Configure & Preview</div>
        <Card><CardBody>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Company">{company?.name || "—"}</Field>
            <Field label="Plan">{plan.planName} ({plan.planType})</Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Billing Cycle</label>
              <select value={cycle} onChange={(e) => { const c = e.target.value; setCycle(c); if (isCustom && plan) setQuotedPrice(c === "Yearly" ? plan.yearlyPrice : plan.monthlyPrice); }} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
                <option>Monthly</option><option>Yearly</option>
              </select></div>
            <label className="flex items-center gap-2 cursor-pointer mt-5"><input type="checkbox" checked={isTrial} onChange={(e) => setIsTrial(e.target.checked)} className="w-4 h-4 rounded" /><span className="text-[13px]">Trial (14 days)</span></label>
          </div>
          {/* Addons — only for Published plans */}
          {!isCustom && (
            <div className="border-t pt-3 mt-3" style={{ borderColor: T.border }}>
              <div className="text-[12px] font-semibold mb-2" style={{ color: T.text }}>Add-ons</div>
              {[["Users", plan.usersAddonAllowed, plan.usersAddonPrice], ["Records", plan.recordsAddonAllowed, plan.recordsAddonPrice], ["Integrations", plan.integrationsAddonAllowed, plan.integrationsAddonPrice]].map(([type, allowed, price]) => {
                if (!allowed) return <div key={type} className="text-xs mb-1" style={{ color: T.text3 }}>{type}: not available on this plan</div>;
                const ao = addons.find((a) => a.type === type);
                return (
                  <div key={type} className="flex items-center gap-3 mb-2">
                    <label className="flex items-center gap-2 w-32"><input type="checkbox" checked={!!ao} onChange={() => toggleAddon(type, price)} className="w-4 h-4 rounded" /><span className="text-[13px]">{type}</span></label>
                    {ao && <><input type="number" value={ao.quantity} min={1} onChange={(e) => setAddonQty(type, +e.target.value || 1)} className="w-20 px-2 py-1 rounded border text-[13px] outline-none" style={{ borderColor: T.border }} />
                      <span className="text-xs" style={{ color: T.text2 }}>× {fmtINR(price)} = {fmtINR(ao.quantity * price)}</span></>}
                  </div>
                );
              })}
            </div>
          )}
          {/* Published: discount entry */}
          {!isCustom && (
            <div className="border-t pt-3 mt-3" style={{ borderColor: T.border }}>
              <div className="text-[12px] font-semibold mb-2" style={{ color: T.text }}>Discount</div>
              <div className="grid grid-cols-3 gap-2">
                <select value={discType} onChange={(e) => setDiscType(e.target.value)} className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}><option>Flat</option><option>Percentage</option></select>
                <input type="number" value={discVal} onChange={(e) => setDiscVal(+e.target.value || 0)} placeholder="Value" className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} />
                <input type="text" value={discReason} onChange={(e) => setDiscReason(e.target.value)} placeholder="Reason (required)" className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} />
              </div>
            </div>
          )}
          {/* Custom: direct quoted price */}
          {isCustom && (
            <div className="border-t pt-3 mt-3" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[12px] font-semibold" style={{ color: T.text }}>Negotiated Pricing</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: T.purpleSoft, color: T.purpleFg }}>Custom plan — set the quoted price directly</span>
              </div>
              <div className="rounded-lg p-3 mb-3" style={{ background: T.subtle, border: `1px solid ${T.border}` }}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="List Price">{fmtINR(PricingEngine.getBasePrice(plan, cycle))}<span className="text-xs" style={{ color: T.text3 }}>{cycle === "Yearly" ? "/yr" : "/mo"}</span></Field>
                  <Field label="What's included">{plan.usersIncluded} users · {fmtRecords(plan.recordsIncluded)} records · {plan.integrationsIncluded} integrations{plan.dealsModuleEnabled ? " · Deals" : ""}</Field>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Quoted Price (₹){cycle === "Yearly" ? " /year" : " /month"}</label>
                  <input type="number" value={quotedPrice} onChange={(e) => setQuotedPrice(+e.target.value || 0)}
                    className="w-full mt-1 px-3 py-2.5 rounded-lg border text-[15px] font-semibold outline-none focus:ring-2" style={{ borderColor: T.primary, "--tw-ring-color": T.ring, color: T.primary }} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Pricing Reason</label>
                  <input type="text" value={quotedReason} onChange={(e) => setQuotedReason(e.target.value)} placeholder="e.g. Strategic partnership, volume deal"
                    className="w-full mt-1 px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: T.border, "--tw-ring-color": T.ring }} />
                </div>
              </div>
              {quotedPrice > 0 && quotedPrice < PricingEngine.getBasePrice(plan, cycle) && (
                <div className="mt-2 text-xs flex items-center gap-1" style={{ color: T.success }}>
                  <Tag size={12} /> Effective discount: {fmtINR(PricingEngine.getBasePrice(plan, cycle) - quotedPrice)} ({Math.round((1 - quotedPrice / PricingEngine.getBasePrice(plan, cycle)) * 100)}% off list)
                </div>
              )}
            </div>
          )}
          <div className="mt-3"><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Internal Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none resize-none" style={{ borderColor: T.border }} /></div>
        </CardBody></Card>
        {/* Pricing Preview */}
        {preview && (
          <Card style={{ borderColor: T.primary, borderWidth: 2 }}>
            <CardHeader title="Pricing Preview" action={<Badge tone="brand">{isCustom ? "Negotiated" : "Live calculation"}</Badge>} />
            <CardBody>
              <div className="space-y-1.5 text-[13px]">
                <div className="flex justify-between"><span style={{ color: T.text2 }}>List Price ({cycle})</span><span className="font-medium">{fmtINR(preview.basePrice)}</span></div>
                {!isCustom && addons.map((a) => <div key={a.type} className="flex justify-between"><span style={{ color: T.text2 }}>{a.type} addon × {a.quantity}</span><span className="font-medium">{fmtINR(a.quantity * a.unitPrice)}</span></div>)}
                {!isCustom && <div className="flex justify-between border-t pt-1.5" style={{ borderColor: T.border }}><span className="font-medium">Subtotal</span><span className="font-semibold">{fmtINR(preview.subtotal)}</span></div>}
                {preview.discountAmount > 0 && <div className="flex justify-between" style={{ color: T.success }}><span>{isCustom ? "Negotiated discount" : `Discount (${discType === "Percentage" ? discVal + "%" : "Flat"})`}</span><span>-{fmtINR(preview.discountAmount)}</span></div>}
                <div className="flex justify-between border-t pt-1.5 text-[15px]" style={{ borderColor: T.text }}><span className="font-semibold">{isCustom ? "Quoted Price" : "Final Price"}</span><span className="font-bold" style={{ color: T.primary }}>{fmtINR(preview.finalPrice)}</span></div>
                <div className="text-[11px] italic" style={{ color: T.text3 }}>Taxes / GST placeholder — future-ready</div>
              </div>
            </CardBody>
          </Card>
        )}
        <div className="flex gap-2">
          <Button onClick={() => setStep(2)}><ArrowLeft size={14} /> Back</Button>
          <Button variant="primary" className="flex-1 justify-center" onClick={() => setStep(4)} disabled={!plan || (!company && !editSub) || (!isCustom && discVal > 0 && !discReason.trim()) || (isCustom && quotedPrice <= 0 && !isTrial)}>
            Review & Assign <ArrowRight size={14} />
          </Button>
        </div>
      </div>)}

      {/* Step 4: Confirm */}
      {step === 4 && preview && (
        <div className="space-y-3">
          <div className="text-[13px] font-semibold" style={{ color: T.text }}>Step 4 — Confirm Assignment</div>
          <Card><CardBody>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Company">{company?.name}</Field>
              <Field label="Plan">{plan?.planName} ({plan?.planType})</Field>
              <Field label="Billing">{cycle}{isTrial ? " · 14-day trial" : ""}</Field>
              <Field label="Final Price"><span className="text-lg font-bold" style={{ color: T.primary }}>{fmtINR(preview.finalPrice)}</span>{cycle === "Yearly" ? "/yr" : "/mo"}</Field>
            </div>
          </CardBody></Card>
          {discVal > 0 && !discReason.trim() && <div className="text-xs" style={{ color: T.danger }}>Discount reason is required</div>}
          <div className="flex gap-2">
            <Button onClick={() => setStep(3)}><ArrowLeft size={14} /> Back</Button>
            <Button variant="primary" className="flex-1 justify-center" onClick={submit} disabled={discVal > 0 && !discReason.trim()}>
              <CheckCircle2 size={15} /> {editSub ? "Update Subscription" : "Assign Subscription"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- SUBSCRIPTION DETAIL --- */
export function SubscriptionDetail({ sub, onClose }) {
  const store = useStore();
  if (!sub) return null;
  const s = store.subscriptions.find((x) => x.id === sub.id) || sub;
  const plan = store.spPlans.find((p) => p.id === s.planId);
  const hist = store.history.filter((h) => h.entityId === s.id);
  return (
    <Drawer open={!!sub} onClose={onClose} width={600}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div><h2 className="text-lg font-semibold" style={{ color: T.text }}>{s.companyName}</h2><p className="text-xs" style={{ color: T.text2 }}>{s.planName} · {s.billingCycle} · since {s.startDate}</p></div>
          <div className="flex gap-2">{statusBadge(s.status)}<button onClick={onClose} className="p-1 rounded hover:bg-[var(--t-hover)]"><X size={18} style={{ color: T.text3 }} /></button></div>
        </div>
        {/* Pricing breakdown */}
        <Card><CardHeader title="Pricing Breakdown" /><CardBody>
          <div className="space-y-1.5 text-[13px]">
            <div className="flex justify-between"><span style={{ color: T.text2 }}>Base Plan</span><span className="font-medium">{fmtINR(s.basePrice)}</span></div>
            {s.addons.map((a, i) => <div key={i} className="flex justify-between"><span style={{ color: T.text2 }}>{a.type} × {a.quantity}</span><span>{fmtINR(a.total)}</span></div>)}
            <div className="flex justify-between border-t pt-1.5" style={{ borderColor: T.border }}><span>Subtotal</span><span className="font-semibold">{fmtINR(s.subtotal)}</span></div>
            {s.discount?.value > 0 && <div className="flex justify-between" style={{ color: T.success }}><span>Discount ({s.discount.type === "Percentage" ? s.discount.value + "%" : "Flat"}) — {s.discount.reason}</span><span>-{fmtINR(s.subtotal - s.finalPrice)}</span></div>}
            <div className="flex justify-between border-t pt-1.5 text-[15px]" style={{ borderColor: T.text }}><span className="font-semibold">Final</span><span className="font-bold" style={{ color: T.primary }}>{fmtINR(s.finalPrice)}</span></div>
          </div>
        </CardBody></Card>
        {/* Details */}
        <Card><CardHeader title="Details" /><CardBody><div className="grid grid-cols-2 gap-3">
          <Field label="Renewal">{s.renewalDate}</Field>
          <Field label="Trial">{s.isTrial ? `Yes — ends ${s.trialEnd}` : "No"}</Field>
          <Field label="Created By">{s.createdBy} · {s.createdDate}</Field>
          {s.notes && <div className="col-span-2"><Field label="Internal Notes">{s.notes}</Field></div>}
        </div></CardBody></Card>
        {plan && <Card><CardHeader title="Plan Resources" /><CardBody><div className="grid grid-cols-2 gap-3">
          <Field label="Users">{plan.usersIncluded}–{plan.usersMaximum}</Field><Field label="Records">{fmtRecords(plan.recordsIncluded)}</Field>
          <Field label="Integrations">{plan.integrationsIncluded}</Field><Field label="Automations">{plan.automationsIncluded}</Field>
        </div></CardBody></Card>}
        {/* History */}
        <Card><CardHeader title="Audit History" /><CardBody className="space-y-2">
          {hist.length ? hist.map((h) => (
            <div key={h.id} className="flex gap-2 items-start text-xs py-1.5 border-b last:border-0" style={{ borderColor: T.border }}>
              <History size={13} style={{ color: T.text3, marginTop: 2 }} /><div><span className="font-medium">{h.action}</span> · {h.changedBy} · {h.changedDate}{h.reason && <span style={{ color: T.text2 }}> — {h.reason}</span>}</div>
            </div>
          )) : <div className="text-xs text-center py-4" style={{ color: T.text3 }}>No history</div>}
        </CardBody></Card>
      </div>
    </Drawer>
  );
}

/* --- CLIENT SUBSCRIPTIONS --- */
export function ClientSubscriptions({ presetPlanId, onConsumePreset }) {
  const store = useStore();
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [drawer, setDrawer] = useState(null); // null | "create" | sub
  const [detail, setDetail] = useState(null);
  const [initialPlanId, setInitialPlanId] = useState(null);

  React.useEffect(() => {
    if (presetPlanId) {
      setInitialPlanId(presetPlanId);
      setDrawer("create");
      onConsumePreset?.();
    }
  }, [presetPlanId]);

  const rows = useMemo(() => store.subscriptions.filter((s) =>
    (s.companyName.toLowerCase().includes(q.toLowerCase()) || s.planName.toLowerCase().includes(q.toLowerCase())) &&
    (statusF === "All" || s.status === statusF)
  ), [store.subscriptions, q, statusF]);

  return (
    <>
      <div className="flex gap-2 items-center mb-3.5 flex-wrap">
        <SearchInput value={q} onChange={setQ} placeholder="Search company or plan…" />
        {["All", "Active", "Trial", "Expired", "Cancelled"].map((f) => <FilterPill key={f} active={statusF === f} onClick={() => setStatusF(f)}>{f}</FilterPill>)}
        <Button variant="primary" className="ml-auto" onClick={() => setDrawer("create")}><Plus size={15} /> Assign Subscription</Button>
      </div>
      <Card>
        <Table head={["Company", "Plan", "Type", "Cycle", "Renewal", "Status", "Base", "Add-ons", "Discount", "Final", "By", ""]}>
          {rows.map((s) => {
            const plan = store.spPlans.find((p) => p.id === s.planId);
            return (
              <tr key={s.id} className="hover:bg-[#F8F9FC]">
                <Td><button onClick={() => setDetail(s)} className="font-medium hover:underline" style={{ color: T.primary }}>{s.companyName}</button></Td>
                <Td>{s.planName}</Td>
                <Td><Badge tone={plan?.planType === "Published" ? "brand" : "purple"}>{plan?.planType || "—"}</Badge></Td>
                <Td className="text-xs">{s.billingCycle}</Td>
                <Td className="text-xs font-mono" style={{ color: T.text2 }}>{s.renewalDate}</Td>
                <Td>{statusBadge(s.status)}</Td>
                <Td className="font-medium">{fmtINR(s.basePrice)}</Td>
                <Td className="text-xs">{s.addons.length ? s.addons.map((a) => `${a.type}×${a.quantity}`).join(", ") : "—"}</Td>
                <Td className="text-xs">{s.discount?.value ? (s.discount.type === "Percentage" ? s.discount.value + "%" : fmtINR(s.discount.value)) : "—"}</Td>
                <Td className="font-semibold" style={{ color: T.primary }}>{fmtINR(s.finalPrice)}</Td>
                <Td className="text-xs" style={{ color: T.text2 }}>{s.createdBy}</Td>
                <Td><Menu items={[
                  { label: "View detail", icon: Eye, onClick: () => setDetail(s) },
                  { label: "Edit", icon: Pencil, onClick: () => setDrawer(s) },
                  s.status === "Active" ? { label: "Cancel", icon: XCircle, danger: true, onClick: () => store.updateSubscription(s.id, { status: "Cancelled" }, "Cancelled") } : null,
                ].filter(Boolean)} /></Td>
              </tr>
            );
          })}
          {!rows.length && <tr><Td colSpan={12} className="text-center py-10" style={{ color: T.text3 }}>No subscriptions match</Td></tr>}
        </Table>
      </Card>
      <Drawer open={!!drawer} onClose={() => { setDrawer(null); setInitialPlanId(null); }} width={650}>
        {drawer && <SubscriptionAssign onClose={() => { setDrawer(null); setInitialPlanId(null); }} editSub={drawer !== "create" ? drawer : null} presetPlanId={drawer === "create" ? initialPlanId : null} />}
      </Drawer>
      <SubscriptionDetail sub={detail} onClose={() => setDetail(null)} />
    </>
  );
}

/* --- OVERVIEW --- */
export function SubsOverview() {
  const store = useStore();
  const active = store.subscriptions.filter((s) => s.status === "Active");
  const trials = store.subscriptions.filter((s) => s.status === "Trial");
  const totalMRR = active.reduce((s, x) => s + (x.billingCycle === "Monthly" ? x.finalPrice : Math.round(x.finalPrice / 12)), 0);
  const totalARR = totalMRR * 12;
  const avgDiscount = active.length ? Math.round(active.reduce((s, x) => s + (x.subtotal - x.finalPrice), 0) / active.length) : 0;
  const discountLoss = active.reduce((s, x) => s + (x.subtotal - x.finalPrice), 0);
  const pubPlans = store.spPlans.filter((p) => p.planType === "Published" && p.status === "Active").length;
  const custPlans = store.spPlans.filter((p) => p.planType === "Custom" && p.status === "Active").length;
  const upcoming = store.subscriptions.filter((s) => s.status === "Active").length; // simplified
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Active Subscriptions" value={String(active.length)} sub={`${trials.length} trials`} trend="pos" />
        <Kpi label="MRR" value={fmtINR(totalMRR)} sub="Monthly recurring" trend="pos" />
        <Kpi label="ARR" value={fmtLakh(totalARR)} sub="Annualized" />
        <Kpi label="Total Clients" value={String(store.clients.length)} sub={`${store.subscriptions.length} subscribed`} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Published Plans" value={String(pubPlans)} sub="active" />
        <Kpi label="Custom Plans" value={String(custPlans)} sub="active" />
        <Kpi label="Avg Discount" value={fmtINR(avgDiscount)} sub="per subscription" />
        <Kpi label="Discount Loss" value={fmtINR(discountLoss)} sub="total revenue impact" trend="warn" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardHeader title="Revenue by Plan" /><CardBody>
          <BarList max={Math.max(...store.subscriptions.map((s) => s.finalPrice), 1)} fmt={fmtINR}
            rows={store.spPlans.filter((p) => p.status === "Active").map((p) => {
              const subs = store.subscriptions.filter((s) => s.planId === p.id && s.status === "Active");
              return { label: p.planName + ` (${subs.length})`, value: subs.reduce((s, x) => s + x.finalPrice, 0), color: p.planType === "Published" ? T.primary : T.purple };
            }).filter((r) => r.value > 0).sort((a, b) => b.value - a.value)} />
        </CardBody></Card>
        <Card><CardHeader title="Upcoming Renewals" /><CardBody>
          <Table head={["Company", "Plan", "Renewal", "Price"]}>
            {store.subscriptions.filter((s) => s.status === "Active").slice(0, 5).map((s) => (
              <tr key={s.id} className="hover:bg-[#F8F9FC]">
                <Td className="font-medium">{s.companyName}</Td><Td className="text-xs">{s.planName}</Td>
                <Td className="text-xs font-mono" style={{ color: T.text2 }}>{s.renewalDate}</Td>
                <Td className="font-medium">{fmtINR(s.finalPrice)}</Td>
              </tr>
            ))}
          </Table>
        </CardBody></Card>
      </div>
      <Card><CardHeader title="Recent Activity" /><CardBody className="space-y-2">
        {store.history.slice(0, 6).map((h) => (
          <div key={h.id} className="flex gap-2 items-start text-xs py-1.5 border-b last:border-0" style={{ borderColor: T.border }}>
            <History size={13} style={{ color: T.text3, marginTop: 2 }} /><div><Badge tone="gray">{h.entityType}</Badge> <span className="font-medium">{h.action}</span> · {h.changedBy} · {h.changedDate}</div>
          </div>
        ))}
      </CardBody></Card>
    </div>
  );
}

export function SubsRevenue() {
  const store = useStore();
  const active = store.subscriptions.filter((s) => s.status === "Active");

  // MRR / ARR
  const totalMRR = active.reduce((s, x) => s + (x.billingCycle === "Monthly" ? x.finalPrice : Math.round(x.finalPrice / 12)), 0);
  const totalARR = totalMRR * 12;
  const discountLoss = active.reduce((s, x) => s + (x.subtotal - x.finalPrice), 0);
  const netRevenue = active.reduce((s, x) => s + x.finalPrice, 0);

  // By billing cycle
  const monthlyCount = active.filter((s) => s.billingCycle === "Monthly").length;
  const yearlyCount = active.filter((s) => s.billingCycle === "Yearly").length;
  const monthlyMRR = active.filter((s) => s.billingCycle === "Monthly").reduce((s, x) => s + x.finalPrice, 0);
  const yearlyMRR = active.filter((s) => s.billingCycle === "Yearly").reduce((s, x) => s + Math.round(x.finalPrice / 12), 0);

  // Revenue by plan (all subs, not just active)
  const planRevenue = store.spPlans.filter((p) => p.status !== "Archived").map((p) => {
    const subs = store.subscriptions.filter((s) => s.planId === p.id && s.status === "Active");
    return { label: p.planName, value: subs.reduce((s, x) => s + x.finalPrice, 0), count: subs.length, type: p.planType };
  }).filter((r) => r.value > 0).sort((a, b) => b.value - a.value);

  // Top clients by revenue
  const topClients = [...active].sort((a, b) => b.finalPrice - a.finalPrice).slice(0, 8);

  // Simulated 6-month MRR trend (using totalMRR as current, work backwards with small variance)
  const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  const trendBase = totalMRR;
  const trend = [0.78, 0.82, 0.88, 0.91, 0.96, 1.0].map((f, i) => ({ month: months[i], value: Math.round(trendBase * f) }));
  const trendMax = Math.max(...trend.map((t) => t.value));

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="MRR" value={fmtINR(totalMRR)} sub="Monthly recurring" trend="pos" />
        <Kpi label="ARR" value={fmtLakh(totalARR)} sub="Annualized run-rate" trend="pos" />
        <Kpi label="Net Collected" value={fmtINR(netRevenue)} sub="across all active subs" />
        <Kpi label="Discount Loss" value={fmtINR(discountLoss)} sub="revenue given away" trend="warn" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MRR Trend */}
        <Card><CardHeader title="MRR Trend · Last 6 months" action={<span className="text-[12px] font-semibold" style={{ color: T.success }}>+{Math.round(((trend[5].value - trend[0].value) / trend[0].value) * 100)}% growth</span>} />
          <CardBody>
            <div className="flex items-end gap-2 h-28">
              {trend.map((t) => (
                <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-semibold" style={{ color: T.primary }}>{fmtINR(t.value)}</div>
                  <div className="w-full rounded-t" style={{ height: `${Math.round((t.value / trendMax) * 72)}px`, background: t.month === "May" ? T.primary : T.ring }} />
                  <div className="text-[11px]" style={{ color: T.text3 }}>{t.month}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Billing cycle split */}
        <Card><CardHeader title="Billing Cycle Split" />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3" style={{ background: T.primarySoft }}>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.text3 }}>Monthly</div>
                <div className="text-xl font-bold" style={{ color: T.primary }}>{fmtINR(monthlyMRR)}<span className="text-[11px] font-normal">/mo</span></div>
                <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>{monthlyCount} subscriptions</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: T.purpleSoft }}>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.text3 }}>Yearly</div>
                <div className="text-xl font-bold" style={{ color: T.purple }}>{fmtINR(yearlyMRR)}<span className="text-[11px] font-normal">/mo equiv</span></div>
                <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>{yearlyCount} subscriptions</div>
              </div>
            </div>
            {totalMRR > 0 && (
              <div>
                <div className="flex justify-between text-[11px] mb-1" style={{ color: T.text3 }}>
                  <span>Monthly {Math.round((monthlyMRR / totalMRR) * 100)}%</span>
                  <span>Yearly {Math.round((yearlyMRR / totalMRR) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full flex overflow-hidden" style={{ background: T.border }}>
                  <div className="h-full rounded-l-full" style={{ width: `${Math.round((monthlyMRR / totalMRR) * 100)}%`, background: T.primary }} />
                  <div className="h-full rounded-r-full flex-1" style={{ background: T.purple }} />
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by plan */}
        <Card><CardHeader title="Revenue by Plan" />
          <CardBody>
            <BarList max={Math.max(...planRevenue.map((r) => r.value), 1)} fmt={fmtINR}
              rows={planRevenue.map((r) => ({ label: `${r.label} (${r.count})`, value: r.value, color: r.type === "Published" ? T.primary : T.purple }))} />
          </CardBody>
        </Card>

        {/* Top clients by revenue */}
        <Card><CardHeader title="Top Clients by Revenue" />
          <CardBody>
            <Table head={["Client", "Plan", "Cycle", "MRR"]}>
              {topClients.map((s) => (
                <tr key={s.id} className="hover:bg-[#F8F9FC]">
                  <Td className="font-medium text-[13px]">{s.companyName}</Td>
                  <Td className="text-xs" style={{ color: T.text2 }}>{s.planName}</Td>
                  <Td><Badge tone={s.billingCycle === "Yearly" ? "purple" : "brand"}>{s.billingCycle}</Badge></Td>
                  <Td className="font-semibold" style={{ color: T.primary }}>{fmtINR(s.billingCycle === "Monthly" ? s.finalPrice : Math.round(s.finalPrice / 12))}</Td>
                </tr>
              ))}
              {!topClients.length && <tr><Td colSpan={4} className="text-center py-8" style={{ color: T.text3 }}>No active subscriptions</Td></tr>}
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

/* --- MAIN SUBSCRIPTIONS & PLANS PAGE (tab container) --- */
export function SubsPlansPage() {
  const [tab, setTab] = useState("Overview");
  const [assignPlanId, setAssignPlanId] = useState(null);
  const fixedHeight = tab === "Plan Library" || tab === "Client Subscriptions";
  const goAssign = (plan) => { setAssignPlanId(plan.id); setTab("Client Subscriptions"); };
  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="Subscriptions & Plans" desc="Plan library, pricing, client subscriptions and revenue analytics" />
      <div className="shrink-0"><Tabs tabs={SP_TABS} value={tab} onChange={setTab} /></div>
      {fixedHeight ? (
        <div className="flex-1 min-h-0 flex flex-col">
          {tab === "Plan Library" && <PlanLibrary onAssignSubscription={goAssign} />}
          {tab === "Client Subscriptions" && <ClientSubscriptions presetPlanId={assignPlanId} onConsumePreset={() => setAssignPlanId(null)} />}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {tab === "Overview" && <SubsOverview />}
          {tab === "Addon Pricing" && <AddonPricingPage />}
          {tab === "Revenue" && <SubsRevenue />}
        </div>
      )}
    </div>
  );
}
