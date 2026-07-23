import React, { useState, useEffect, useMemo } from "react";
import {
  Plus, Pencil, Trash2, Copy, ArrowLeft, XCircle, LogIn, Key, RefreshCw, Ban, Power,
  UserPlus, ChevronDown, Download, ShieldAlert, CheckCircle2, X,
} from "lucide-react";
import { T } from "../theme.js";
import { ADMIN } from "../data/constants.js";
import { MONTHS_SHORT } from "../lib/format.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  PageHeader, Card, CardHeader, CardBody, Table, Td, Badge, Button, Drawer, Modal, Field,
  Kpi, Pagination, usePagination, SearchInput, MultiSelectFilter, DateRangeFilter,
  CopyButton, SortableTh, Menu, Switch, NameCell,
} from "../components/ui.jsx";
import {
  PERMISSION_SECTIONS, SCOPED_ACTIONS, SCOPE_OPTIONS, ACTION_LABELS, ACTION_ORDER,
  summarizePermissions, ADMIN_STATUSES, ADMIN_STATUS_TONE, ROLE_TYPES, ROLE_TYPE_TONE,
  SESSION_STATUS_TONE, LOGIN_EVENTS, LOGIN_EVENT_TONE, LOGIN_OUTCOMES, ALERT_TYPES,
  ALERT_TYPE_LABEL, ALERT_SEVERITIES, ALERT_SEVERITY_TONE, ALERT_STATUSES, ALERT_STATUS_TONE,
  API_KEY_STATUS_TONE, API_KEY_ENVIRONMENTS, ENV_TONE, API_KEY_SCOPES, API_KEY_EXPIRY_OPTIONS,
  isRepeatedFailure, isValidCidr,
} from "../data/security.js";
import { DATE_PRESETS, applyLogFilters, sortRows, exportLogs, LOGS_NOW } from "../data/logs.js";

/* ============================================================
   SHARED HELPERS
   ============================================================ */
function parseTs(s) { return s ? new Date(String(s).replace(" ", "T")) : null; }
function fmtDT(s) {
  const d = parseTs(s);
  if (!d || isNaN(d)) return s || "—";
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
const AdminStatusBadge = ({ status }) => <Badge tone={ADMIN_STATUS_TONE[status] || "gray"}>{status}</Badge>;
const RoleTypeBadge = ({ type }) => <Badge tone={ROLE_TYPE_TONE[type] || "gray"}>{type}</Badge>;
const SessionStatusBadge = ({ status }) => <Badge tone={SESSION_STATUS_TONE[status] || "gray"}>{status}</Badge>;
const LoginEventBadge = ({ event }) => <Badge tone={LOGIN_EVENT_TONE[event] || "gray"}>{event}</Badge>;
const AlertSeverityBadge = ({ severity }) => <Badge tone={ALERT_SEVERITY_TONE[severity] || "gray"}>{severity}</Badge>;
const AlertStatusBadge = ({ status }) => <Badge tone={ALERT_STATUS_TONE[status] || "gray"}>{status}</Badge>;
const ApiKeyStatusBadge = ({ status }) => <Badge tone={API_KEY_STATUS_TONE[status] || "gray"}>{status}</Badge>;
const EnvBadge = ({ env }) => <Badge tone={ENV_TONE[env] || "gray"}>{env}</Badge>;
const MfaBadge = ({ enabled }) => enabled ? <Badge tone="success">✓ Enabled</Badge> : <Badge tone="warning">⚠ Disabled</Badge>;

function DetailRow({ label, children }) {
  return <div className="flex justify-between gap-4 py-1.5 border-b last:border-0" style={{ borderColor: T.border }}><span className="text-[12px]" style={{ color: T.text3 }}>{label}</span><span className="text-[13px] text-right" style={{ color: T.text }}>{children}</span></div>;
}
function DrawerHead({ title, sub, onClose }) {
  return (
    <div className="sticky top-0 bg-[var(--t-surface)] border-b z-10 px-6 pt-5 pb-4 flex items-start justify-between" style={{ borderColor: T.border }}>
      <div><h2 className="text-lg font-semibold" style={{ color: T.text }}>{title}</h2>{sub && <div className="text-[13px] mt-0.5" style={{ color: T.text2 }}>{sub}</div>}</div>
      <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--t-hover)]"><X size={18} style={{ color: T.text3 }} /></button>
    </div>
  );
}
function StopClick({ children }) { return <div onClick={(e) => e.stopPropagation()}>{children}</div>; }
const distinct = (rows, key) => Array.from(new Set(rows.map((r) => r[key]).filter(Boolean)));

/* ============================================================
   1. ADMIN USERS
   ============================================================ */
const EMPTY_ADMIN_FORM = { name: "", email: "", phone: "", roleId: "", requireMfa: false, sendInvitation: true };
function AdminFormDrawer({ open, mode, admin, roles, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_ADMIN_FORM);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (open) setForm(mode === "edit" && admin ? { name: admin.name, email: admin.email, phone: admin.phone, roleId: admin.roleId, requireMfa: admin.mfaEnabled, sendInvitation: false } : EMPTY_ADMIN_FORM);
    setErrors({});
  }, [open, mode, admin]);
  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.roleId) errs.roleId = "Role is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ ...form, name: form.name.trim(), email: form.email.trim() });
  };
  return (
    <Drawer open={open} onClose={onClose} width={480}>
      <DrawerHead title={mode === "edit" ? "Edit Admin" : "New Admin"} onClose={onClose} />
      <div className="px-6 py-5 space-y-3">
        <Field label="Name">
          <input value={form.name} onChange={(e) => u("name", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: errors.name ? T.danger : T.border, "--tw-ring-color": T.ring }} />
          {errors.name && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.name}</div>}
        </Field>
        <Field label="Email">
          <input value={form.email} onChange={(e) => u("email", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: errors.email ? T.danger : T.border, "--tw-ring-color": T.ring }} />
          {errors.email && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.email}</div>}
        </Field>
        <Field label="Phone (optional)">
          <input value={form.phone} onChange={(e) => u("phone", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: T.border, "--tw-ring-color": T.ring }} />
        </Field>
        <Field label="Role">
          <select value={form.roleId} onChange={(e) => u("roleId", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: errors.roleId ? T.danger : T.border }}>
            <option value="">Select a role</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          {errors.roleId && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.roleId}</div>}
        </Field>
        {mode !== "edit" && <>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.requireMfa} onChange={(e) => u("requireMfa", e.target.checked)} className="w-4 h-4 rounded" /><span className="text-[13px]">Require MFA</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.sendInvitation} onChange={(e) => u("sendInvitation", e.target.checked)} className="w-4 h-4 rounded" /><span className="text-[13px]">Send invitation email</span></label>
        </>}
      </div>
      <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: T.border }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={submit}>{mode === "edit" ? "Save Changes" : "Add Admin"}</Button>
      </div>
    </Drawer>
  );
}
function AdminUsersTab({ store, adminUsers, roles, createOpen, setCreateOpen }) {
  const [search, setSearch] = useState(""); const [roleFilter, setRoleFilter] = useState("All");
  const [mfaFilter, setMfaFilter] = useState("All"); const [statusFilter, setStatusFilter] = useState("All");
  const [editAdmin, setEditAdmin] = useState(null);
  const filtered = useMemo(() => adminUsers.filter((a) =>
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === "All" || a.roleId === roleFilter) &&
    (mfaFilter === "All" || (mfaFilter === "Enabled" ? a.mfaEnabled : !a.mfaEnabled)) &&
    (statusFilter === "All" || a.status === statusFilter)
  ), [adminUsers, search, roleFilter, mfaFilter, statusFilter]);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  const menuFor = (a) => (
    <Menu items={[
      { label: "Edit Admin", icon: Pencil, onClick: () => setEditAdmin(a) },
      { label: "Reset Password", icon: Key, onClick: () => store.resetAdminPassword(a.id) },
      { label: a.mfaEnabled ? "Disable MFA" : "Enable MFA", icon: ShieldAlert, onClick: () => store.toggleAdminMfa(a.id) },
      { divider: true },
      a.status === "Suspended"
        ? { label: "Reactivate", icon: Power, onClick: () => store.reactivateAdmin(a.id) }
        : { label: "Suspend", icon: Ban, danger: true, onClick: () => store.suspendAdmin(a.id) },
      ...(a.status === "Active" || a.status === "Suspended" ? [{ label: "Deactivate", icon: XCircle, danger: true, onClick: () => store.deactivateAdmin(a.id) }] : []),
    ]} />
  );
  return (
    <>
      <div className="flex gap-2 items-center mb-3.5 flex-wrap shrink-0">
        <SearchInput value={search} onChange={setSearch} placeholder="Search name or email…" />
        <div className="relative"><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Role: All</option>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
        <div className="relative"><select value={mfaFilter} onChange={(e) => setMfaFilter(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">MFA: All</option><option value="Enabled">Enabled</option><option value="Disabled">Disabled</option></select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
        <div className="relative"><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Status: All</option>{ADMIN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={["Admin", "Email", "Role", "MFA", "Last Login", "Sessions", "Status", ""]}>
          {pageRows.map((a) => (
            <tr key={a.id} className="hover:bg-[#F8F9FC]">
              <Td><NameCell name={a.name} /></Td>
              <Td className="text-xs" style={{ color: T.text2 }}><div className="flex items-center gap-1">{a.email}<CopyButton value={a.email} label="email" /></div></Td>
              <Td><RoleTypeBadge type={roles.find((r) => r.id === a.roleId)?.type || "Standard"} /> <span className="text-xs ml-1" style={{ color: T.text2 }}>{a.roleName}</span></Td>
              <Td><MfaBadge enabled={a.mfaEnabled} /></Td>
              <Td className="text-xs font-mono" style={{ color: T.text2 }}>{a.lastLogin}</Td>
              <Td className="text-xs">{a.activeSessions}</Td>
              <Td><AdminStatusBadge status={a.status} /></Td>
              <Td><div className="flex items-center gap-1">
                <button onClick={() => store.impersonate(a.name)} className="p-1 rounded hover:bg-[var(--t-hover)]" title="Impersonate"><LogIn size={14} style={{ color: T.text3 }} /></button>
                {menuFor(a)}
              </div></Td>
            </tr>
          ))}
          {!filtered.length && <tr><Td colSpan={8} className="text-center py-10" style={{ color: T.text3 }}>No admins match these filters</Td></tr>}
        </Table>
      </Card>
      <AdminFormDrawer open={createOpen} mode="create" admin={null} roles={roles} onClose={() => setCreateOpen(false)} onSubmit={(data) => { if (store.createAdmin(data)) setCreateOpen(false); }} />
      <AdminFormDrawer open={!!editAdmin} mode="edit" admin={editAdmin} roles={roles} onClose={() => setEditAdmin(null)} onSubmit={(data) => { store.updateAdmin(editAdmin.id, data); setEditAdmin(null); }} />
    </>
  );
}

/* ============================================================
   2. ROLES & PERMISSIONS
   ============================================================ */
function sectionActionColumns(section) {
  const set = new Set();
  section.modules.forEach((m) => m.actions.forEach((a) => set.add(a)));
  return ACTION_ORDER.filter((a) => set.has(a));
}
function PermissionMatrix({ sections, permissions, onChange }) {
  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const cols = sectionActionColumns(section);
        return (
          <Card key={section.id}>
            <CardHeader title={section.label} />
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-separate" style={{ borderSpacing: 0 }}>
                <thead><tr>
                  <th className="text-left px-4 py-2 text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap" style={{ color: T.text3, boxShadow: `inset 0 -1px 0 ${T.border}`, background: T.subtle }}>Module</th>
                  {cols.map((c) => <th key={c} className="text-center px-3 py-2 text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap" style={{ color: T.text3, boxShadow: `inset 0 -1px 0 ${T.border}`, background: T.subtle }}>{ACTION_LABELS[c]}</th>)}
                </tr></thead>
                <tbody>
                  {section.modules.map((m) => (
                    <tr key={m.key}>
                      <td className="px-4 py-2.5 font-medium whitespace-nowrap" style={{ boxShadow: `inset 0 -1px 0 ${T.border}`, color: T.text }}>{m.label}</td>
                      {cols.map((c) => {
                        const supported = m.actions.includes(c);
                        const val = permissions[m.key]?.[c];
                        return (
                          <td key={c} className="text-center px-3 py-2" style={{ boxShadow: `inset 0 -1px 0 ${T.border}` }}>
                            {!supported ? <span style={{ color: T.text3 }}>—</span> :
                              SCOPED_ACTIONS.has(c) ? (
                                <select value={val} onChange={(e) => onChange(m.key, c, e.target.value)} className="px-2 py-1 rounded border text-xs outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
                                  {SCOPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                              ) : (
                                <input type="checkbox" checked={!!val} onChange={(e) => onChange(m.key, c, e.target.checked)} className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: T.primary }} />
                              )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
const EMPTY_ROLE_FORM = { name: "", description: "", type: "Standard" };
function RoleCreateModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_ROLE_FORM);
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setForm(EMPTY_ROLE_FORM); setError(""); } }, [open]);
  const submit = () => {
    if (form.name.trim().length < 2) { setError("Role name is required"); return; }
    onCreate({ ...form, name: form.name.trim() });
  };
  return (
    <Modal open={open} onClose={onClose} title="New Role" footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={submit}>Create</Button></>}>
      <div className="space-y-3">
        <Field label="Role Name">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: error ? T.danger : T.border, "--tw-ring-color": T.ring }} />
          {error && <div className="text-xs mt-1" style={{ color: T.danger }}>{error}</div>}
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2 resize-none" style={{ borderColor: T.border, "--tw-ring-color": T.ring }} />
        </Field>
        <Field label="Type">
          <div className="flex gap-4 mt-1">
            {ROLE_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-1.5 cursor-pointer text-[13px]"><input type="radio" checked={form.type === t} onChange={() => setForm((f) => ({ ...f, type: t }))} />{t}</label>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}
function RolesTab({ store, roles, adminUsers }) {
  const [search, setSearch] = useState(""); const [createOpen, setCreateOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null); const [localPerms, setLocalPerms] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const editingRole = editingRoleId ? roles.find((r) => r.id === editingRoleId) : null;
  useEffect(() => { if (editingRole) setLocalPerms(JSON.parse(JSON.stringify(editingRole.permissions))); }, [editingRoleId]); // eslint-disable-line

  if (editingRole && localPerms) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <button onClick={() => setEditingRoleId(null)} className="flex items-center gap-1.5 text-[15px] font-semibold" style={{ color: T.primary }}><ArrowLeft size={16} /> {editingRole.name}</button>
          <Button variant="primary" onClick={() => { store.updateRolePermissions(editingRole.id, localPerms); setEditingRoleId(null); }}>Save Permissions</Button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto pb-4">
          <PermissionMatrix sections={PERMISSION_SECTIONS} permissions={localPerms} onChange={(mk, ak, v) => setLocalPerms((p) => ({ ...p, [mk]: { ...p[mk], [ak]: v } }))} />
        </div>
      </div>
    );
  }

  const filtered = roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex gap-2 items-center mb-3.5 shrink-0">
        <SearchInput value={search} onChange={setSearch} placeholder="Search roles…" />
        <Button variant="primary" className="ml-auto" onClick={() => setCreateOpen(true)}><Plus size={15} /> New Role</Button>
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Table head={["Role", "Users", "Permissions", "Type", ""]}>
          {filtered.map((r) => {
            const userCount = adminUsers.filter((a) => a.roleId === r.id).length;
            return (
              <tr key={r.id} onClick={() => setEditingRoleId(r.id)} className="cursor-pointer hover:bg-[#F8F9FC]">
                <Td className="font-semibold">{r.name}</Td>
                <Td>{userCount}</Td>
                <Td className="text-xs max-w-[320px] truncate" style={{ color: T.text2 }}>{summarizePermissions(r.permissions)}</Td>
                <Td><RoleTypeBadge type={r.type} /></Td>
                <Td><StopClick><Menu items={[
                  { label: "Edit Permissions", icon: Pencil, onClick: () => setEditingRoleId(r.id) },
                  { label: "Duplicate Role", icon: Copy, onClick: () => { const dup = store.duplicateRole(r.id); if (dup) setEditingRoleId(dup.id); } },
                  { divider: true },
                  { label: "Delete Role", icon: Trash2, danger: true, onClick: () => { if (r.isSystem || userCount > 0) { store.notify("Role can't be deleted — reassign its admins first"); return; } setDeleteTarget(r); } },
                ]} /></StopClick></Td>
              </tr>
            );
          })}
          {!filtered.length && <tr><Td colSpan={5} className="text-center py-10" style={{ color: T.text3 }}>No roles match this search</Td></tr>}
        </Table>
      </Card>
      <RoleCreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={(data) => { const role = store.createRole(data); setCreateOpen(false); if (role) setEditingRoleId(role.id); }} />
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete role?" footer={<><Button onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" onClick={() => { store.deleteRole(deleteTarget.id); setDeleteTarget(null); }}>Delete</Button></>}>
        <p className="text-[13px]" style={{ color: T.text2 }}>Delete role "{deleteTarget?.name}"? This can't be undone.</p>
      </Modal>
    </div>
  );
}

/* ============================================================
   3. SESSIONS
   ============================================================ */
function SecurityPolicyCard({ store, mfaConfig }) {
  const [open, setOpen] = useState(false);
  const u = (k, v) => store.updateMfaConfig({ [k]: v });
  return (
    <Card className="mb-3.5 shrink-0">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-3.5">
        <span className="text-[13px] font-semibold" style={{ color: T.text }}>Security Policy</span>
        <ChevronDown size={14} style={{ color: T.text3, transform: open ? "rotate(180deg)" : undefined }} />
      </button>
      {open && (
        <CardBody className="pt-0 space-y-2.5 border-t" style={{ borderColor: T.border }}>
          <div className="flex items-center justify-between py-1.5"><span className="text-[13px]" style={{ color: T.text }}>Require MFA for all admins</span><Switch on={mfaConfig.requireForAll} onClick={() => u("requireForAll", !mfaConfig.requireForAll)} /></div>
          <div className="flex items-center justify-between py-1.5"><span className="text-[13px]" style={{ color: T.text }}>Require MFA for Privileged roles</span><Switch on={mfaConfig.requireForPrivileged} onClick={() => u("requireForPrivileged", !mfaConfig.requireForPrivileged)} /></div>
          <div className="flex items-center justify-between py-1.5"><span className="text-[13px]" style={{ color: T.text }}>Allow MFA backup codes</span><Switch on={mfaConfig.allowBackupCodes} onClick={() => u("allowBackupCodes", !mfaConfig.allowBackupCodes)} /></div>
          <div className="flex items-center justify-between py-1.5"><span className="text-[13px]" style={{ color: T.text }}>Max failed login attempts</span><input type="number" value={mfaConfig.maxFailedAttempts} onChange={(e) => u("maxFailedAttempts", Number(e.target.value))} className="w-20 px-2 py-1 rounded border text-xs text-right outline-none" style={{ borderColor: T.border }} /></div>
          <div className="flex items-center justify-between py-1.5"><span className="text-[13px]" style={{ color: T.text }}>Lockout duration (minutes)</span><input type="number" value={mfaConfig.lockoutDurationMinutes} onChange={(e) => u("lockoutDurationMinutes", Number(e.target.value))} className="w-20 px-2 py-1 rounded border text-xs text-right outline-none" style={{ borderColor: T.border }} /></div>
          <div className="flex items-center justify-between py-1.5"><span className="text-[13px]" style={{ color: T.text }}>Session timeout (minutes)</span><input type="number" value={mfaConfig.sessionTimeoutMinutes} onChange={(e) => u("sessionTimeoutMinutes", Number(e.target.value))} className="w-20 px-2 py-1 rounded border text-xs text-right outline-none" style={{ borderColor: T.border }} /></div>
        </CardBody>
      )}
    </Card>
  );
}
function SessionsTab({ store, sessions, mfaConfig }) {
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);
  return (
    <>
      <SecurityPolicyCard store={store} mfaConfig={mfaConfig} />
      <div className="flex items-center justify-between mb-3.5 shrink-0">
        <p className="text-[13px]" style={{ color: T.text2 }}>Sessions expire after {Math.round(mfaConfig.sessionTimeoutMinutes / 60)}h of inactivity</p>
        <Button variant="danger" onClick={() => setRevokeAllOpen(true)}><XCircle size={14} /> Revoke All</Button>
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Table head={["Admin", "Device", "IP", "Location", "Started", "Last Active", "Status", ""]}>
          {sessions.map((s) => (
            <tr key={s.id} className="hover:bg-[#F8F9FC]">
              <Td><NameCell name={s.adminName} sub={s.isCurrent ? "This session" : undefined} /></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{s.device}</Td>
              <Td className="text-xs font-mono" style={{ color: T.text3 }}><div className="flex items-center gap-1">{s.ip}<CopyButton value={s.ip} label="IP" /></div></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{s.location}</Td>
              <Td className="text-xs font-mono" style={{ color: T.text2 }}>{fmtDT(s.startedAt)}</Td>
              <Td className="text-xs font-mono" style={{ color: T.text2 }}>{fmtDT(s.lastActive)}</Td>
              <Td><SessionStatusBadge status={s.status} /></Td>
              <Td>
                <Button size="sm" variant="danger" disabled={s.isCurrent} title={s.isCurrent ? "Can't revoke current session" : undefined} onClick={() => store.revokeSession(s.id)}><XCircle size={13} /> Revoke</Button>
              </Td>
            </tr>
          ))}
          {!sessions.length && <tr><Td colSpan={8} className="text-center py-10" style={{ color: T.text3 }}>No active sessions</Td></tr>}
        </Table>
      </Card>
      <Modal open={revokeAllOpen} onClose={() => setRevokeAllOpen(false)} title="Revoke all sessions?" footer={<><Button onClick={() => setRevokeAllOpen(false)}>Cancel</Button><Button variant="danger" onClick={() => { store.revokeAllSessions(); setRevokeAllOpen(false); }}>Revoke All</Button></>}>
        <p className="text-[13px]" style={{ color: T.text2 }}>This will force all admins to re-login. Continue?</p>
      </Modal>
    </>
  );
}

/* ============================================================
   4. IP RESTRICTIONS
   ============================================================ */
const EMPTY_IP_FORM = { listType: "Allow", ip: "", label: "" };
function AddIpRuleModal({ open, onClose, existing, onAdd }) {
  const [form, setForm] = useState(EMPTY_IP_FORM);
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setForm(EMPTY_IP_FORM); setError(""); } }, [open]);
  const submit = () => {
    if (!isValidCidr(form.ip)) { setError("Enter a valid IPv4/IPv6 address or CIDR range"); return; }
    if (form.listType === "Block" && existing.some((r) => r.listType === "Allow" && r.ip === form.ip)) { setError("This range is already on the allowlist"); return; }
    onAdd({ ...form, label: form.label.trim() || form.ip });
  };
  return (
    <Modal open={open} onClose={onClose} title="Add IP Rule" footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={submit}>Add Rule</Button></>}>
      <div className="space-y-3">
        <Field label="Type">
          <div className="flex gap-4 mt-1">
            {["Allow", "Block"].map((t) => <label key={t} className="flex items-center gap-1.5 cursor-pointer text-[13px]"><input type="radio" checked={form.listType === t} onChange={() => setForm((f) => ({ ...f, listType: t }))} />{t}</label>)}
          </div>
        </Field>
        <Field label="IP / CIDR">
          <input value={form.ip} onChange={(e) => setForm((f) => ({ ...f, ip: e.target.value }))} placeholder="e.g. 103.21.244.0/24" className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] font-mono outline-none focus:ring-2" style={{ borderColor: error ? T.danger : T.border, "--tw-ring-color": T.ring }} />
          {error && <div className="text-xs mt-1" style={{ color: T.danger }}>{error}</div>}
        </Field>
        <Field label="Label"><input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="e.g. Office Delhi" className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: T.border, "--tw-ring-color": T.ring }} /></Field>
      </div>
    </Modal>
  );
}
function IpRuleTable({ rows, onToggle, onRemove }) {
  return (
    <Table head={["IP / CIDR", "Label", "Added By", "Added Date", "Hits (30d)", "Status", ""]}>
      {rows.map((r) => (
        <tr key={r.id} className="hover:bg-[#F8F9FC]">
          <Td className="font-mono text-xs"><div className="flex items-center gap-1">{r.ip}<CopyButton value={r.ip} label="IP" /></div></Td>
          <Td className="text-xs" style={{ color: T.text2 }}>{r.label}</Td>
          <Td className="text-xs" style={{ color: T.text2 }}>{r.addedBy}</Td>
          <Td className="text-xs font-mono" style={{ color: T.text3 }}>{r.addedDate}</Td>
          <Td className="text-xs">{r.hitCount.toLocaleString("en-IN")}</Td>
          <Td><Switch on={r.status === "Active"} onClick={() => onToggle(r.id)} /></Td>
          <Td><Button size="sm" variant="danger" onClick={() => onRemove(r.id)}><Trash2 size={13} /></Button></Td>
        </tr>
      ))}
      {!rows.length && <tr><Td colSpan={7} className="text-center py-8" style={{ color: T.text3 }}>None added yet</Td></tr>}
    </Table>
  );
}
function IpRestrictionsTab({ store, ipRestrictions }) {
  const [addOpen, setAddOpen] = useState(false);
  const allow = ipRestrictions.filter((r) => r.listType === "Allow");
  const block = ipRestrictions.filter((r) => r.listType === "Block");
  return (
    <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-2">
      <div className="flex justify-end"><Button variant="primary" onClick={() => setAddOpen(true)}><Plus size={15} /> Add Rule</Button></div>
      <Card><CardHeader title="Allowlist" sub={`${allow.length} rule(s)`} />
        <IpRuleTable rows={allow} onToggle={store.toggleIpRestriction} onRemove={store.removeIpRestriction} />
      </Card>
      <Card><CardHeader title="Blocklist" sub={`${block.length} rule(s)`} />
        <IpRuleTable rows={block} onToggle={store.toggleIpRestriction} onRemove={store.removeIpRestriction} />
      </Card>
      <AddIpRuleModal open={addOpen} onClose={() => setAddOpen(false)} existing={ipRestrictions} onAdd={(data) => { store.addIpRestriction(data); setAddOpen(false); }} />
    </div>
  );
}

/* ============================================================
   5. LOGIN HISTORY
   ============================================================ */
function loginRowStyle(l, allRows) {
  if (l.event === "account.locked" || isRepeatedFailure(l, allRows)) return { background: T.dangerSoft };
  return undefined;
}
function LoginHistoryTab({ loginHistory }) {
  const [search, setSearch] = useState(""); const [dateRange, setDateRange] = useState({ preset: null });
  const [admin, setAdmin] = useState("All"); const [events, setEvents] = useState([]);
  const [outcome, setOutcome] = useState("All"); const [sort, setSort] = useState({ key: "timestamp", dir: "desc" });
  const [detail, setDetail] = useState(null);
  const filtered = useMemo(() => {
    let r = applyLogFilters(loginHistory, { search, searchFields: ["adminName", "email", "ip"], dateRange, source: admin, sourceField: "adminName" });
    if (events.length) r = r.filter((x) => events.includes(x.event));
    if (outcome !== "All") r = r.filter((x) => x.outcome === outcome);
    return sortRows(r, sort.key, sort.dir);
  }, [loginHistory, search, dateRange, admin, events, outcome, sort]);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  const admins = distinct(loginHistory, "adminName");
  return (
    <>
      <div className="flex gap-2 items-center mb-3.5 flex-wrap shrink-0">
        <SearchInput value={search} onChange={setSearch} placeholder="Search admin, email, IP…" />
        <DateRangeFilter presets={DATE_PRESETS} value={dateRange} onChange={setDateRange} />
        <div className="relative"><select value={admin} onChange={(e) => setAdmin(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Admin: All</option>{admins.map((a) => <option key={a} value={a}>{a}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
        <MultiSelectFilter label="Event" options={LOGIN_EVENTS} selected={events} onChange={setEvents} />
        <div className="relative"><select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Outcome: All</option>{LOGIN_OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
        <Button className="ml-auto" onClick={() => exportLogs(filtered, "admin_login_history", "csv", dateRange.preset || "all")}><Download size={14} /> Export CSV</Button>
        <Button onClick={() => exportLogs(filtered, "admin_login_history", "json", dateRange.preset || "all")}><Download size={14} /> Export JSON</Button>
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={[<SortableTh key="t" label="Timestamp" sortKey="timestamp" sort={sort} onChange={setSort} />, "Admin", "Event", "IP", "Location", "Device", "Outcome"]}>
          {pageRows.map((l) => (
            <tr key={l.id} onClick={() => setDetail(l)} className="cursor-pointer hover:brightness-[.98]" style={loginRowStyle(l, loginHistory)}>
              <Td className="font-mono text-xs" style={{ color: T.text2 }}>{fmtDT(l.timestamp)}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{l.adminName === "unknown" ? l.email : l.adminName}</Td>
              <Td><div className="flex items-center gap-1.5"><LoginEventBadge event={l.event} />{isRepeatedFailure(l, loginHistory) && <Badge tone="dangerStrong">⚠ Repeated failures</Badge>}</div></Td>
              <Td className="font-mono text-xs" style={{ color: T.text3 }}>{l.ip}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{l.location}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{l.device}</Td>
              <Td><Badge tone={l.outcome === "Success" ? "success" : l.outcome === "Blocked" ? "dangerStrong" : "danger"}>{l.outcome}</Badge></Td>
            </tr>
          ))}
          {!filtered.length && <tr><Td colSpan={7} className="text-center py-10" style={{ color: T.text3 }}>No login events match these filters</Td></tr>}
        </Table>
      </Card>
      <Drawer open={!!detail} onClose={() => setDetail(null)} width={480}>
        {detail && <>
          <DrawerHead title="Login Event" sub={detail.event} onClose={() => setDetail(null)} />
          <div className="px-6 py-5">
            <Card><CardBody>
              <DetailRow label="Timestamp">{fmtDT(detail.timestamp)}</DetailRow>
              <DetailRow label="Admin">{detail.adminName === "unknown" ? "unknown" : detail.adminName}</DetailRow>
              <DetailRow label="Email">{detail.email}</DetailRow>
              <DetailRow label="Event"><LoginEventBadge event={detail.event} /></DetailRow>
              <DetailRow label="Outcome"><Badge tone={detail.outcome === "Success" ? "success" : "danger"}>{detail.outcome}</Badge></DetailRow>
              <DetailRow label="IP"><span className="font-mono text-xs">{detail.ip}</span></DetailRow>
              <DetailRow label="Location">{detail.location}</DetailRow>
              <DetailRow label="Device">{detail.device}</DetailRow>
              {detail.mfaMethod && <DetailRow label="MFA Method">{detail.mfaMethod}</DetailRow>}
              {detail.failReason && <DetailRow label="Fail Reason"><span style={{ color: T.danger }}>{detail.failReason}</span></DetailRow>}
            </CardBody></Card>
          </div>
        </>}
      </Drawer>
    </>
  );
}

/* ============================================================
   6. SECURITY ALERTS
   ============================================================ */
function AlertNotePrompt({ label, onConfirm }) {
  const [open, setOpen] = useState(false); const [note, setNote] = useState("");
  if (!open) return <button onClick={() => setOpen(true)} className="w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--t-subtle)]" style={{ color: T.text }}>{label}</button>;
  return (
    <div className="p-3 space-y-2" onClick={(e) => e.stopPropagation()}>
      <input autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (required)…" className="w-full px-2.5 py-1.5 rounded-md border text-xs outline-none" style={{ borderColor: T.border }} />
      <div className="flex gap-2"><Button size="sm" variant="primary" onClick={() => { if (note.trim()) { onConfirm(note.trim()); setOpen(false); setNote(""); } }}>Confirm</Button><Button size="sm" onClick={() => setOpen(false)}>Cancel</Button></div>
    </div>
  );
}
function SecurityAlertsTab({ store, alerts }) {
  const [search, setSearch] = useState(""); const [severity, setSeverity] = useState([]);
  const [status, setStatus] = useState("All"); const [type, setType] = useState("All");
  const [detail, setDetail] = useState(null);
  const filtered = useMemo(() => {
    let r = alerts.filter((a) => (a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())));
    if (severity.length) r = r.filter((a) => severity.includes(a.severity));
    if (status !== "All") r = r.filter((a) => a.status === status);
    if (type !== "All") r = r.filter((a) => a.type === type);
    return [...r].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [alerts, search, severity, status, type]);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  const menuFor = (a) => (
    <Menu items={[
      { label: "View Details", icon: ShieldAlert, onClick: () => setDetail(a) },
      { label: "Assign to me", icon: UserPlus, onClick: () => store.assignAlert(a.id, ADMIN) },
      { label: "Mark Investigating", icon: RefreshCw, onClick: () => store.updateAlertStatus(a.id, "Investigating", null) },
      { divider: true },
      { label: "Mark Resolved", icon: CheckCircle2, onClick: () => { const note = window.prompt("Resolution note (required):"); if (note?.trim()) store.updateAlertStatus(a.id, "Resolved", note.trim()); } },
      { label: "Mark False Positive", icon: XCircle, onClick: () => { const note = window.prompt("Note (required):"); if (note?.trim()) store.updateAlertStatus(a.id, "False Positive", note.trim()); } },
    ]} />
  );
  return (
    <>
      <div className="flex gap-2 items-center mb-3.5 flex-wrap shrink-0">
        <SearchInput value={search} onChange={setSearch} placeholder="Search title, description…" />
        <MultiSelectFilter label="Severity" options={ALERT_SEVERITIES} selected={severity} onChange={setSeverity} />
        <div className="relative"><select value={status} onChange={(e) => setStatus(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Status: All</option>{ALERT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
        <div className="relative"><select value={type} onChange={(e) => setType(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Type: All</option>{ALERT_TYPES.map((t) => <option key={t} value={t}>{ALERT_TYPE_LABEL[t]}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={["Timestamp", "Type", "Title", "Severity", "Status", "Assigned To", ""]}>
          {pageRows.map((a) => (
            <tr key={a.id} onClick={() => setDetail(a)} className="cursor-pointer hover:bg-[#F8F9FC]">
              <Td className="font-mono text-xs" style={{ color: T.text2 }}>{fmtDT(a.timestamp)}</Td>
              <Td><Badge tone="gray">{ALERT_TYPE_LABEL[a.type]}</Badge></Td>
              <Td className="font-medium max-w-[260px] truncate">{a.title}</Td>
              <Td><AlertSeverityBadge severity={a.severity} /></Td>
              <Td><AlertStatusBadge status={a.status} /></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{a.assignedTo || "—"}</Td>
              <Td><StopClick>{menuFor(a)}</StopClick></Td>
            </tr>
          ))}
          {!filtered.length && <tr><Td colSpan={7} className="text-center py-10" style={{ color: T.text3 }}>No alerts match these filters</Td></tr>}
        </Table>
      </Card>
      <Drawer open={!!detail} onClose={() => setDetail(null)} width={560}>
        {detail && <>
          <DrawerHead title={detail.title} sub={ALERT_TYPE_LABEL[detail.type]} onClose={() => setDetail(null)} />
          <div className="px-6 py-5 space-y-4">
            <Card><CardBody>
              <p className="text-[13px] mb-3" style={{ color: T.text }}>{detail.description}</p>
              <DetailRow label="Severity"><AlertSeverityBadge severity={detail.severity} /></DetailRow>
              <DetailRow label="Status"><AlertStatusBadge status={detail.status} /></DetailRow>
              <DetailRow label="Source IP">{detail.sourceIp || "—"}</DetailRow>
              <DetailRow label="Target Admin">{detail.targetAdmin || "—"}</DetailRow>
              <DetailRow label="Assigned To">{detail.assignedTo || "—"}</DetailRow>
              <DetailRow label="Detected">{fmtDT(detail.timestamp)}</DetailRow>
            </CardBody></Card>
            <Card><CardHeader title="Timeline" /><CardBody className="space-y-2.5">
              {detail.notes.length ? detail.notes.map((n, i) => (
                <div key={i} className="text-[13px] px-3 py-2 rounded-lg" style={{ background: T.subtle }}><span style={{ color: T.text }}>{n.text}</span><div className="text-[11px] mt-0.5" style={{ color: T.text3 }}>{n.by} · {n.at}</div></div>
              )) : <div className="text-[13px]" style={{ color: T.text3 }}>No notes yet</div>}
            </CardBody></Card>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => store.assignAlert(detail.id, ADMIN)}><UserPlus size={13} /> Assign to me</Button>
              <Button size="sm" onClick={() => store.updateAlertStatus(detail.id, "Investigating", null)}><RefreshCw size={13} /> Mark Investigating</Button>
            </div>
            <div className="rounded-lg border" style={{ borderColor: T.border }}><AlertNotePrompt label="✓ Mark Resolved" onConfirm={(note) => store.updateAlertStatus(detail.id, "Resolved", note)} /></div>
            <div className="rounded-lg border" style={{ borderColor: T.border }}><AlertNotePrompt label="✕ Mark False Positive" onConfirm={(note) => store.updateAlertStatus(detail.id, "False Positive", note)} /></div>
          </div>
        </>}
      </Drawer>
    </>
  );
}

/* ============================================================
   7. API KEYS
   ============================================================ */
const EMPTY_KEY_FORM = { name: "", environment: "Production", expiresAt: "1 year", scopes: [] };
function CreateApiKeyModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_KEY_FORM);
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setForm(EMPTY_KEY_FORM); setError(""); } }, [open]);
  const toggleScope = (id) => setForm((f) => {
    if (id === "full_access") return { ...f, scopes: f.scopes.includes("full_access") ? [] : ["full_access"] };
    const withoutFull = f.scopes.filter((s) => s !== "full_access");
    return { ...f, scopes: withoutFull.includes(id) ? withoutFull.filter((s) => s !== id) : [...withoutFull, id] };
  });
  const submit = () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.scopes.length) { setError("Select at least one scope"); return; }
    onCreate({ ...form, name: form.name.trim() });
  };
  return (
    <Modal open={open} onClose={onClose} title="Create API Key" footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={submit}>Create Key</Button></>}>
      <div className="space-y-3">
        <Field label="Name">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Partner Integration" className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: error && !form.name.trim() ? T.danger : T.border, "--tw-ring-color": T.ring }} />
        </Field>
        <Field label="Environment">
          <div className="flex gap-4 mt-1">{API_KEY_ENVIRONMENTS.map((e) => <label key={e} className="flex items-center gap-1.5 cursor-pointer text-[13px]"><input type="radio" checked={form.environment === e} onChange={() => setForm((f) => ({ ...f, environment: e }))} />{e}</label>)}</div>
        </Field>
        <Field label="Expiry">
          <select value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
            {API_KEY_EXPIRY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Scopes">
          <div className="mt-1 space-y-1.5">
            {API_KEY_SCOPES.map((s) => (
              <label key={s.id} className="flex items-center gap-2 cursor-pointer text-[13px]" style={{ color: T.text }}>
                <input type="checkbox" checked={form.scopes.includes(s.id)} disabled={s.id !== "full_access" && form.scopes.includes("full_access")} onChange={() => toggleScope(s.id)} className="w-3.5 h-3.5 rounded" style={{ accentColor: T.primary }} />
                {s.label}
              </label>
            ))}
          </div>
          {error && <div className="text-xs mt-1" style={{ color: T.danger }}>{error}</div>}
        </Field>
      </div>
    </Modal>
  );
}
function KeyRevealModal({ keyData, onClose }) {
  if (!keyData) return null;
  return (
    <Modal open={!!keyData} onClose={onClose} title="✓ API Key Created" footer={<Button variant="primary" onClick={onClose}>Done</Button>}>
      <div className="space-y-3">
        <p className="text-[13px]" style={{ color: T.text2 }}>Copy this key now — it won't be shown again.</p>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border font-mono text-[12px] break-all" style={{ borderColor: T.border, background: T.subtle, color: T.text }}>
          {keyData.fullValue}<CopyButton value={keyData.fullValue} label="key" />
        </div>
        <DetailRow label="Key ID"><span className="font-mono text-xs">{keyData.keyId}</span></DetailRow>
        <DetailRow label="Scopes">{keyData.scopes.join(", ")}</DetailRow>
      </div>
    </Modal>
  );
}
function ApiKeysTab({ store, apiKeys }) {
  const [createOpen, setCreateOpen] = useState(false); const [reveal, setReveal] = useState(null);
  const [detail, setDetail] = useState(null);
  return (
    <>
      <div className="flex justify-end mb-3.5 shrink-0"><Button variant="primary" onClick={() => setCreateOpen(true)}><Plus size={15} /> Create Key</Button></div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Table head={["Name", "Key ID", "Scopes", "Created By", "Created", "Last Used", "Requests (30d)", "Status", ""]}>
          {apiKeys.map((k) => (
            <tr key={k.id} onClick={() => setDetail(k)} className="cursor-pointer hover:bg-[#F8F9FC]">
              <Td><div className="flex items-center gap-2"><span className="font-medium">{k.name}</span><EnvBadge env={k.environment} /></div></Td>
              <Td className="font-mono text-xs" style={{ color: T.text3 }}><div className="flex items-center gap-1">{k.keyId}<CopyButton value={k.keyId} label="key ID" /></div></Td>
              <Td className="text-xs">{k.scopes.slice(0, 2).map((s) => <Badge key={s} tone="gray">{s}</Badge>)}{k.scopes.length > 2 && <span className="ml-1" style={{ color: T.text3 }}>+{k.scopes.length - 2} more</span>}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{k.createdBy}</Td>
              <Td className="text-xs font-mono" style={{ color: T.text3 }}>{k.createdDate}</Td>
              <Td className="text-xs font-mono" style={{ color: T.text3 }}>{k.lastUsed}</Td>
              <Td className="text-xs">{k.requestCount30d.toLocaleString("en-IN")}</Td>
              <Td><ApiKeyStatusBadge status={k.status} /></Td>
              <Td><StopClick><Menu items={[
                { label: "View Details", icon: Key, onClick: () => setDetail(k) },
                { label: "Rotate Key", icon: RefreshCw, onClick: () => { const r = store.rotateApiKey(k.id); if (r) setReveal(r); } },
                { divider: true },
                { label: "Revoke", icon: Ban, danger: true, onClick: () => store.revokeApiKey(k.id) },
              ]} /></StopClick></Td>
            </tr>
          ))}
          {!apiKeys.length && <tr><Td colSpan={9} className="text-center py-10" style={{ color: T.text3 }}>No API keys yet</Td></tr>}
        </Table>
      </Card>
      <CreateApiKeyModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={(data) => { const r = store.createApiKey(data); setCreateOpen(false); if (r) setReveal(r); }} />
      <KeyRevealModal keyData={reveal} onClose={() => setReveal(null)} />
      <Drawer open={!!detail} onClose={() => setDetail(null)} width={480}>
        {detail && <>
          <DrawerHead title={detail.name} sub={detail.keyId} onClose={() => setDetail(null)} />
          <div className="px-6 py-5 space-y-4">
            <Card><CardBody>
              <DetailRow label="Environment"><EnvBadge env={detail.environment} /></DetailRow>
              <DetailRow label="Status"><ApiKeyStatusBadge status={detail.status} /></DetailRow>
              <DetailRow label="Created By">{detail.createdBy}</DetailRow>
              <DetailRow label="Created">{detail.createdDate}</DetailRow>
              <DetailRow label="Last Used">{detail.lastUsed}</DetailRow>
              <DetailRow label="Expires">{detail.expiresAt}</DetailRow>
              <DetailRow label="Usage">{detail.requestCount30d.toLocaleString("en-IN")} requests in the last 30 days</DetailRow>
            </CardBody></Card>
            <Card><CardHeader title="Scopes" /><CardBody className="flex flex-wrap gap-1.5">
              {detail.scopes.map((s) => <Badge key={s} tone="gray">{API_KEY_SCOPES.find((x) => x.id === s)?.label || s}</Badge>)}
            </CardBody></Card>
            {detail.status === "Active" && <div className="flex gap-2">
              <Button onClick={() => { const r = store.rotateApiKey(detail.id); if (r) { setReveal(r); setDetail(null); } }}><RefreshCw size={14} /> Rotate Key</Button>
              <Button variant="danger" onClick={() => { store.revokeApiKey(detail.id); setDetail(null); }}><Ban size={14} /> Revoke Key</Button>
            </div>}
          </div>
        </>}
      </Drawer>
    </>
  );
}

/* ============================================================
   PAGE ROOT
   ============================================================ */
const SEC_TABS = ["Admin Users", "Roles & Permissions", "Sessions", "IP Restrictions", "Login History", "Security Alerts", "API Keys"];

export function SecurityPage() {
  const store = useStore();
  const [tab, setTab] = useState("Admin Users");
  const [createAdminOpen, setCreateAdminOpen] = useState(false);

  const { adminUsers, secRoles, sessions, ipRestrictions, loginHistory, securityAlerts, apiKeys, mfaConfig } = store;

  const active = adminUsers.filter((a) => a.status === "Active").length;
  const withoutMfa = adminUsers.filter((a) => !a.mfaEnabled).length;
  const mfaPct = adminUsers.length ? Math.round(((adminUsers.length - withoutMfa) / adminUsers.length) * 100) : 0;
  const activeSessions = sessions.filter((s) => s.status === "Active").length;
  const alerts7d = securityAlerts.filter((a) => LOGS_NOW.getTime() - new Date(a.timestamp.replace(" ", "T")).getTime() <= 7 * 24 * 3600_000);
  const openAlerts = securityAlerts.filter((a) => a.status === "Open").length;

  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="Security & Access Control" desc="RBAC, MFA, sessions, IP rules, security alerts, sensitive action approvals" actions={<>
        <Button onClick={() => setTab("Roles & Permissions")}>Audit Roles</Button>
        <Button variant="primary" onClick={() => setCreateAdminOpen(true)}><Plus size={15} /> New Admin</Button>
      </>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Admin Users" value={String(adminUsers.length)} sub={`${active} active · ${withoutMfa} without MFA`} />
        <Kpi label="MFA Enrolled" value={`${mfaPct}%`} sub={withoutMfa ? `${withoutMfa} admin(s) still using password only` : "All admins enrolled"} trend={withoutMfa ? "warn" : "pos"} />
        <Kpi label="Active Sessions" value={String(activeSessions)} />
        <Kpi label="Security Alerts (7d)" value={String(alerts7d.length)} sub={`${openAlerts} open · ${securityAlerts.filter((a) => a.status === "Resolved").length} resolved`} trend={openAlerts ? "warn" : "pos"} />
      </div>
      <div className="flex gap-0.5 border-b mb-4 shrink-0 flex-wrap" style={{ borderColor: T.border }}>
        {SEC_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2.5 text-[13px] font-medium -mb-px border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5"
            style={tab === t ? { color: T.primary, borderColor: T.primary } : { color: T.text2, borderColor: "transparent" }}>
            {t}{t === "Security Alerts" && !!openAlerts && <Badge tone="danger">{openAlerts}</Badge>}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        {tab === "Admin Users" && <AdminUsersTab store={store} adminUsers={adminUsers} roles={secRoles} createOpen={createAdminOpen} setCreateOpen={setCreateAdminOpen} />}
        {tab === "Roles & Permissions" && <RolesTab store={store} roles={secRoles} adminUsers={adminUsers} />}
        {tab === "Sessions" && <SessionsTab store={store} sessions={sessions} mfaConfig={mfaConfig} />}
        {tab === "IP Restrictions" && <IpRestrictionsTab store={store} ipRestrictions={ipRestrictions} />}
        {tab === "Login History" && <LoginHistoryTab loginHistory={loginHistory} />}
        {tab === "Security Alerts" && <SecurityAlertsTab store={store} alerts={securityAlerts} />}
        {tab === "API Keys" && <ApiKeysTab store={store} apiKeys={apiKeys} />}
      </div>
    </div>
  );
}
