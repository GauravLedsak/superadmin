import React, { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, Copy, Star, ChevronUp, ChevronDown, ChevronRight, Check, ArrowLeft,
  Car, Stethoscope, GraduationCap, ShoppingCart, Building2, LayoutTemplate, Briefcase, Plane,
  Utensils, Dumbbell, Hotel, Wrench,
} from "lucide-react";
import { T, cx } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  PageHeader, Button, Kpi, Card, CardBody, Table, Td, Badge, Drawer, Modal, Tabs, Menu, Switch,
  Field, FilterPill, SearchInput, useClickOutside,
} from "../components/ui.jsx";
import {
  INDUSTRY_STATUSES, INDUSTRY_STATUS_TONE, COLOR_PRESETS, INDUSTRY_ICONS, BLANK_INDUSTRY,
  countTenantsForIndustry, mostPopularIndustry, avgFieldsPerIndustry,
} from "../data/industries.js";

const ICON_MAP = { Car, Stethoscope, GraduationCap, ShoppingCart, Building2, LayoutTemplate, Briefcase, Plane, Utensils, Dumbbell, Hotel, Wrench };

/* ============================================================
   COLOR SWATCH PICKER — small inline preset picker, not a full color wheel.
   ============================================================ */
function ColorSwatch({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div className="relative shrink-0" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} title="Change color"
        className="w-6 h-6 rounded-full border-2" style={{ background: value, borderColor: T.border }} />
      {open && (
        <div className="absolute left-0 top-8 z-30 rounded-lg border bg-[var(--t-surface)] shadow-lg p-2 flex flex-wrap gap-1.5" style={{ borderColor: T.border, width: 150 }}>
          {COLOR_PRESETS.map((c) => (
            <button type="button" key={c} onClick={() => { onChange(c); setOpen(false); }}
              className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: c, boxShadow: c === value ? `0 0 0 2px ${T.surface}, 0 0 0 3.5px ${T.text}` : "none" }}>
              {c === value && <Check size={12} color="#fff" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TAB 1 — LEAD FIELDS (2-column grid, floating-style labels, red trash)
   ============================================================ */
function LeadFieldsTab({ fields, onChange }) {
  const [justAddedId, setJustAddedId] = useState(null);
  const setField = (id, name) => onChange(fields.map((f) => (f.id === id ? { ...f, name } : f)));
  const removeField = (id) => onChange(fields.filter((f) => f.id !== id));
  const addField = () => {
    const id = "f-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    onChange([...fields, { id, name: "", required: false, isSystem: false }]);
    setJustAddedId(id);
  };
  const isEven = fields.length % 2 === 0;
  return (
    <div>
      <div className="mb-3">
        <div className="text-[14px] font-semibold" style={{ color: T.text }}>Lead Fields</div>
        <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>Define the fields that will be used to capture lead information.</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.id} className="rounded-lg border p-2.5 flex items-end gap-2" style={{ borderColor: T.border }}>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.text3 }}>Field Name</div>
              <input value={f.name} onChange={(e) => setField(f.id, e.target.value)} disabled={f.isSystem} autoFocus={f.id === justAddedId}
                placeholder="e.g. Vehicle Model" className="w-full px-2 py-1.5 rounded-md border text-[13px] outline-none disabled:opacity-70"
                style={{ borderColor: T.border, background: f.isSystem ? T.subtle : T.surface, color: T.text }} />
            </div>
            <button type="button" disabled={f.isSystem} onClick={() => removeField(f.id)} title={f.isSystem ? "System field — required, can't be removed" : "Remove field"}
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-95" style={{ background: T.dangerSoft, color: T.danger }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addField}
          className={cx("rounded-lg border border-dashed flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium hover:bg-[var(--t-subtle)]", isEven && "col-span-2")}
          style={{ borderColor: T.borderStrong, color: T.text2 }}>
          <Plus size={14} /> Add Field
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 2 — LEAD SOURCES
   ============================================================ */
function LeadSourcesTab({ sources, onChange }) {
  const setSource = (id, patch) => onChange(sources.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const removeSource = (id) => onChange(sources.filter((s) => s.id !== id));
  const addSource = () => onChange([...sources, { id: "s-" + Date.now().toString(36), name: "", active: true }]);
  return (
    <div>
      <div className="mb-3">
        <div className="text-[14px] font-semibold" style={{ color: T.text }}>Lead Sources</div>
        <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>Define where leads originate from for this industry.</div>
      </div>
      <div className="space-y-2">
        {sources.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5 rounded-lg border p-2.5" style={{ borderColor: T.border }}>
            <input value={s.name} onChange={(e) => setSource(s.id, { name: e.target.value })} placeholder="Source name"
              className="flex-1 px-2 py-1.5 rounded-md border text-[13px] outline-none" style={{ borderColor: T.border }} />
            <Switch on={s.active} onClick={() => setSource(s.id, { active: !s.active })} />
            <button type="button" onClick={() => removeSource(s.id)} className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 hover:brightness-95" style={{ background: T.dangerSoft, color: T.danger }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addSource} className="w-full rounded-lg border border-dashed flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium hover:bg-[var(--t-subtle)]" style={{ borderColor: T.borderStrong, color: T.text2 }}>
          <Plus size={14} /> Add Source
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 3 — LEAD GROUPS
   ============================================================ */
function LeadGroupsTab({ groups, onChange }) {
  const setGroup = (id, patch) => onChange(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  const removeGroup = (id) => onChange(groups.filter((g) => g.id !== id));
  const addGroup = () => onChange([...groups, { id: "g-" + Date.now().toString(36), name: "", color: COLOR_PRESETS[0], description: "" }]);
  return (
    <div>
      <div className="mb-3">
        <div className="text-[14px] font-semibold" style={{ color: T.text }}>Lead Groups</div>
        <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>Define segmentation buckets for lead categorization.</div>
      </div>
      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g.id} className="flex items-start gap-2.5 rounded-lg border p-2.5" style={{ borderColor: T.border }}>
            <div className="pt-1"><ColorSwatch value={g.color} onChange={(c) => setGroup(g.id, { color: c })} /></div>
            <div className="flex-1 space-y-1.5 min-w-0">
              <input value={g.name} onChange={(e) => setGroup(g.id, { name: e.target.value })} placeholder="Group name"
                className="w-full px-2 py-1.5 rounded-md border text-[13px] outline-none" style={{ borderColor: T.border }} />
              <input value={g.description} onChange={(e) => setGroup(g.id, { description: e.target.value })} placeholder="Description (optional)"
                className="w-full px-2 py-1 rounded-md border text-[12px] outline-none" style={{ borderColor: T.border, color: T.text2 }} />
            </div>
            <button type="button" onClick={() => removeGroup(g.id)} className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 hover:brightness-95 mt-0.5" style={{ background: T.dangerSoft, color: T.danger }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addGroup} className="w-full rounded-lg border border-dashed flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium hover:bg-[var(--t-subtle)]" style={{ borderColor: T.borderStrong, color: T.text2 }}>
          <Plus size={14} /> Add Group
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 4 — LEAD STAGES (ordered, up/down reorder, pipeline preview)
   ============================================================ */
function LeadStagesTab({ stages, onChange }) {
  const setStage = (id, patch) => onChange(stages.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const removeStage = (id) => onChange(stages.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));
  const addStage = () => onChange([...stages, { id: "st-" + Date.now().toString(36), name: "", order: stages.length + 1, color: COLOR_PRESETS[stages.length % COLOR_PRESETS.length], slaHours: null }]);
  const move = (idx, dir) => {
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= stages.length) return;
    const next = [...stages];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    onChange(next.map((s, i) => ({ ...s, order: i + 1 })));
  };
  return (
    <div>
      <div className="mb-3">
        <div className="text-[14px] font-semibold" style={{ color: T.text }}>Lead Stages</div>
        <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>Define the pipeline stages leads move through. Order matters.</div>
      </div>
      <div className="space-y-2">
        {stages.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 rounded-lg border p-2.5" style={{ borderColor: T.border }}>
            <div className="flex flex-col gap-0.5 shrink-0">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="w-5 h-5 rounded flex items-center justify-center disabled:opacity-25 hover:bg-[var(--t-hover)]" style={{ color: T.text2 }}><ChevronUp size={13} /></button>
              <button type="button" disabled={i === stages.length - 1} onClick={() => move(i, 1)} className="w-5 h-5 rounded flex items-center justify-center disabled:opacity-25 hover:bg-[var(--t-hover)]" style={{ color: T.text2 }}><ChevronDown size={13} /></button>
            </div>
            <ColorSwatch value={s.color} onChange={(c) => setStage(s.id, { color: c })} />
            <input value={s.name} onChange={(e) => setStage(s.id, { name: e.target.value })} placeholder="Stage name"
              className="flex-1 min-w-0 px-2 py-1.5 rounded-md border text-[13px] outline-none" style={{ borderColor: T.border }} />
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[11px]" style={{ color: T.text3 }}>SLA</span>
              <input type="number" min="0" value={s.slaHours ?? ""} onChange={(e) => setStage(s.id, { slaHours: e.target.value === "" ? null : Number(e.target.value) })}
                placeholder="—" className="w-16 px-2 py-1.5 rounded-md border text-[13px] outline-none" style={{ borderColor: T.border }} />
              <span className="text-[11px]" style={{ color: T.text3 }}>hrs</span>
            </div>
            <button type="button" disabled={stages.length <= 1} onClick={() => removeStage(s.id)} className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-95" style={{ background: T.dangerSoft, color: T.danger }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addStage} className="w-full rounded-lg border border-dashed flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium hover:bg-[var(--t-subtle)]" style={{ borderColor: T.borderStrong, color: T.text2 }}>
          <Plus size={14} /> Add Stage
        </button>
      </div>
      <div className="mt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Pipeline Preview</div>
        <div className="flex items-center flex-wrap gap-1.5">
          {stages.map((s, i) => (
            <React.Fragment key={s.id}>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium text-white" style={{ background: s.color || T.text3 }}>{s.name || "Untitled"}</span>
              {i < stages.length - 1 && <ChevronRight size={13} style={{ color: T.text3 }} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INDUSTRY CONFIGURATION EDITOR (Drawer)
   ============================================================ */
function IndustryEditorDrawer({ open, industry, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [tab, setTab] = useState("Lead Fields");
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (open) {
      setForm(JSON.parse(JSON.stringify(industry || BLANK_INDUSTRY)));
      setTab("Lead Fields");
      setErrors([]);
    }
  }, [open, industry]);

  if (!open || !form) return null;
  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const errs = [];
    if (!form.name.trim()) errs.push("Industry name is required.");
    if (form.leadFields.filter((f) => !f.isSystem).length === 0) errs.push("Add at least one custom lead field.");
    if (form.leadSources.length === 0) errs.push("Add at least one lead source.");
    if (form.leadGroups.length === 0) errs.push("Add at least one lead group.");
    if (form.leadStages.length < 2) errs.push("Add at least two lead stages.");
    return errs;
  };
  const handleSave = () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length) return;
    onSave(form);
  };

  const IconPreview = ICON_MAP[form.icon] || LayoutTemplate;

  return (
    <Drawer open={open} onClose={onClose} width={760}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: T.border }}>
        <button onClick={onClose} className="flex items-center gap-1.5 text-[13px] font-medium hover:underline" style={{ color: T.text2 }}><ArrowLeft size={15} /> Back</button>
        <h2 className="text-[15px] font-semibold" style={{ color: T.text }}>Industry Configuration</h2>
        <div style={{ width: 52 }} />
      </div>
      <div className="px-5 py-4">
        {errors.length > 0 && (
          <div className="rounded-lg p-3 mb-4 text-[12.5px]" style={{ background: T.dangerSoft, color: T.danger }}>
            <div className="font-semibold mb-1">Fix the following before saving:</div>
            <ul className="list-disc pl-4 space-y-0.5">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Field label="Industry Name">
            <input value={form.name} onChange={(e) => u("name", e.target.value)} placeholder="e.g. Automotive"
              className="w-full mt-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} />
          </Field>
          <Field label="Icon">
            <div className="flex items-center gap-2 mt-1">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}><IconPreview size={17} style={{ color: T.primary }} /></div>
              <select value={form.icon} onChange={(e) => u("icon", e.target.value)} className="flex-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
                {INDUSTRY_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => u("status", e.target.value)} className="w-full mt-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
              {INDUSTRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Default for new tenants">
            <div className="mt-1.5 flex items-center gap-2">
              <Switch on={form.isDefault} onClick={() => u("isDefault", !form.isDefault)} />
              <span className="text-[12px]" style={{ color: T.text2 }}>{form.isDefault ? "This is the default template" : "Not the default"}</span>
            </div>
          </Field>
          <div className="col-span-2">
            <Field label="Description">
              <textarea rows={2} value={form.description} onChange={(e) => u("description", e.target.value)} className="w-full mt-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} />
            </Field>
          </div>
        </div>

        <Tabs tabs={["Lead Fields", "Lead Sources", "Lead Groups", "Lead Stages"]} value={tab} onChange={setTab} />
        {tab === "Lead Fields" && <LeadFieldsTab fields={form.leadFields} onChange={(v) => u("leadFields", v)} />}
        {tab === "Lead Sources" && <LeadSourcesTab sources={form.leadSources} onChange={(v) => u("leadSources", v)} />}
        {tab === "Lead Groups" && <LeadGroupsTab groups={form.leadGroups} onChange={(v) => u("leadGroups", v)} />}
        {tab === "Lead Stages" && <LeadStagesTab stages={form.leadStages} onChange={(v) => u("leadStages", v)} />}

        <div className="mt-6 pt-4 border-t" style={{ borderColor: T.border }}>
          <Button variant="primary" className="w-full justify-center" onClick={handleSave}>Save Configuration</Button>
        </div>
      </div>
    </Drawer>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export function IndustriesPage() {
  const store = useStore();
  const { industries, clients } = store;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = industries.filter((i) =>
    (statusFilter === "All" || i.status === statusFilter) &&
    (!search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())));

  const activeCount = industries.filter((i) => i.status === "Active").length;
  const draftCount = industries.filter((i) => i.status === "Draft").length;
  const popular = mostPopularIndustry(industries, clients);
  const avgFields = avgFieldsPerIndustry(industries);

  const openCreate = () => { setEditingIndustry(null); setEditorOpen(true); };
  const openEdit = (ind) => { setEditingIndustry(ind); setEditorOpen(true); };
  const handleSave = (form) => {
    if (editingIndustry) store.updateIndustry(editingIndustry.id, form);
    else store.createIndustry(form);
    setEditorOpen(false);
  };
  const handleDuplicate = (ind) => {
    const dup = store.duplicateIndustry(ind.id);
    if (dup) { setEditingIndustry(dup); setEditorOpen(true); }
  };
  const deleteBlockedCount = deleteTarget ? countTenantsForIndustry(deleteTarget, clients) : 0;
  const confirmDelete = () => {
    if (!deleteTarget || deleteBlockedCount > 0) return;
    store.deleteIndustry(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader title="Industries & Templates" desc="Industry vertical presets — lead fields, sources, groups, and pipeline stages applied at tenant onboarding"
        actions={<Button variant="primary" onClick={openCreate}><Plus size={15} /> New Industry</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi label="Industries" value={String(industries.length)} sub={`${activeCount} active · ${draftCount} draft${draftCount === 1 ? "" : "s"}`} />
        <Kpi label="Total Tenants" value={String(clients.length)} sub="across all verticals" />
        <Kpi label="Most Popular" value={popular ? popular.name : "—"} sub={popular ? `${countTenantsForIndustry(popular, clients)} tenants` : ""} />
        <Kpi label="Avg Fields / Industry" value={String(avgFields)} sub="customization depth" />
      </div>

      <Card>
        <CardBody className="flex items-center gap-2 flex-wrap !pb-3">
          {["All", ...INDUSTRY_STATUSES].map((s) => <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</FilterPill>)}
          <SearchInput value={search} onChange={setSearch} placeholder="Search industries..." />
        </CardBody>
        {filtered.length === 0 ? (
          <CardBody className="text-center py-12">
            <div className="text-[13px] font-medium" style={{ color: T.text }}>No industry templates configured. Create one to get started.</div>
          </CardBody>
        ) : (
          <Table head={["Industry", "Status", "Tenants", "Fields", "Stages", "Sources", "Last Modified", ""]}>
            {filtered.map((ind) => {
              const Icon = ICON_MAP[ind.icon] || LayoutTemplate;
              const tenantCount = countTenantsForIndustry(ind, clients);
              const activeSources = ind.leadSources.filter((s) => s.active).length;
              const stageNames = ind.leadStages.slice(0, 3).map((s) => s.name).join(", ") + (ind.leadStages.length > 3 ? ` +${ind.leadStages.length - 3}` : "");
              return (
                <tr key={ind.id} className="hover:bg-[var(--t-hover)] cursor-pointer" onClick={() => openEdit(ind)}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}><Icon size={16} style={{ color: T.primary }} /></div>
                      <div className="min-w-0">
                        <div className="font-semibold flex items-center gap-1.5" style={{ color: T.text }}>{ind.name}{ind.isDefault && <Badge tone="info">Default</Badge>}</div>
                        <div className="text-[11px] truncate max-w-[280px]" style={{ color: T.text2 }}>{ind.description}</div>
                      </div>
                    </div>
                  </Td>
                  <Td><Badge tone={INDUSTRY_STATUS_TONE[ind.status]}>{ind.status}</Badge></Td>
                  <Td>{tenantCount}</Td>
                  <Td>{ind.leadFields.length}</Td>
                  <Td className="text-[12px]" style={{ color: T.text2 }}>{stageNames}</Td>
                  <Td>{activeSources}</Td>
                  <Td className="text-[12px] whitespace-nowrap" style={{ color: T.text2 }}>{ind.lastModified} <span style={{ color: T.text3 }}>by {ind.modifiedBy}</span></Td>
                  <Td>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(ind)} className="p-1.5 rounded hover:bg-[var(--t-hover)]" title="Edit"><Pencil size={14} style={{ color: T.text3 }} /></button>
                      <Menu items={[
                        { label: "Duplicate", icon: Copy, onClick: () => handleDuplicate(ind) },
                        { label: ind.isDefault ? "Default template" : "Set as Default", icon: Star, onClick: () => !ind.isDefault && store.setDefaultIndustry(ind.id) },
                        { label: "Delete", icon: Trash2, danger: true, onClick: () => setDeleteTarget(ind) },
                      ]} />
                    </div>
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      <IndustryEditorDrawer open={editorOpen} industry={editingIndustry} onClose={() => setEditorOpen(false)} onSave={handleSave} />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Industry Template" footer={<>
        <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
        <Button variant="danger" disabled={deleteBlockedCount > 0} onClick={confirmDelete}>Delete</Button>
      </>}>
        {deleteTarget && (
          deleteBlockedCount > 0
            ? <div className="text-[13px]" style={{ color: T.danger }}>Can't delete "{deleteTarget.name}" — {deleteBlockedCount} tenant{deleteBlockedCount === 1 ? "" : "s"} use this template. Reassign them first.</div>
            : <div className="text-[13px]" style={{ color: T.text2 }}>Delete "<b style={{ color: T.text }}>{deleteTarget.name}</b>"? This can't be undone.</div>
        )}
      </Modal>
    </>
  );
}
