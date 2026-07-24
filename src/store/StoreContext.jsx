import { useState, useContext, createContext, useCallback } from "react";
import { NOW, ADMIN, mkChecklist } from "../data/constants.js";
import { TODAY, fmtTaskDate } from "../lib/format.js";
import {
  SEED_CLIENTS, SEED_INVOICES, SEED_USERS, SEED_TICKETS, SEED_ONBOARDING,
  loadOnboarding, saveOnboarding, SEED_NOTIFS, makePlanId, SEED_SP_PLANS,
  SEED_ADDON_PRICING, SEED_SUBSCRIPTIONS, SEED_HISTORY, SEED_PLAYBOOKS,
  SEED_TENANT_TASKS, SEED_CONTACT_LOGS,
} from "../data/seed.js";
import {
  SEED_ADMIN_USERS, SEED_ROLES, SEED_SESSIONS, SEED_IP_RESTRICTIONS,
  SEED_LOGIN_HISTORY, SEED_SECURITY_ALERTS, SEED_API_KEYS, SEED_SESSION_POLICY, SEED_WEBHOOK_KEYS,
  emptyPermissions, genApiKeyValue, genKeyId, genWebhookKeyId, genWebhookSecret,
} from "../data/security.js";
import { SEED_INDUSTRIES } from "../data/industries.js";

export const buildTasksFromPlaybook = (tenant, playbook) => playbook.steps.map((step) => {
  const due = new Date(TODAY);
  due.setDate(due.getDate() + (step.slaDays || 0));
  return {
    id: "tt-" + nextId(), tenantId: tenant.id, tenantName: tenant.name,
    playbookId: playbook.id, playbookName: playbook.name, stepId: step.id,
    title: step.title, description: step.description || "", type: step.type,
    status: "Open", assignedTo: tenant.am, dueDate: fmtTaskDate(due),
    completedDate: null, skipNote: "", notes: "",
  };
});
let _id = 100;
export const nextId = () => ++_id;

/* ============================================================
   STORE
   ============================================================ */
export const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

export function StoreProvider({ children }) {
  const [clients, setClients] = useState(SEED_CLIENTS);
  const [invoices, setInvoices] = useState(SEED_INVOICES);
  const [users, setUsers] = useState(SEED_USERS);
  const [tickets, setTickets] = useState(SEED_TICKETS);
  const [onboarding, setOnboardingRaw] = useState(() => loadOnboarding() || SEED_ONBOARDING);
  const setOnboarding = useCallback((updater) => {
    setOnboardingRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveOnboarding(next);
      return next;
    });
  }, []);
  const [notifs, setNotifs] = useState(SEED_NOTIFS);
  const [toast, setToast] = useState(null);
  const [impersonating, setImpersonating] = useState(null);
  // Subscription module state
  const [spPlans, setSpPlans] = useState(SEED_SP_PLANS);
  const [addonPricing, setAddonPricing] = useState(SEED_ADDON_PRICING);
  const [subscriptions, setSubs] = useState(SEED_SUBSCRIPTIONS);
  const [history, setHistory] = useState(SEED_HISTORY);
  // Customer Success module state
  const [spPlaybooks, setSpPlaybooks] = useState(SEED_PLAYBOOKS);
  const [tenantTasks, setTenantTasks] = useState(SEED_TENANT_TASKS);
  const [contactLogs, setContactLogs] = useState(SEED_CONTACT_LOGS);
  // Security & Access module state — internal LEDSAK admin-team pool, distinct from
  // `users` (CRM end-users). loginHistory is a static append-only audit trail (no setter
  // exposed); everything else supports the mutations below.
  const [adminUsers, setAdminUsers] = useState(SEED_ADMIN_USERS);
  const [secRoles, setSecRoles] = useState(SEED_ROLES);
  const [sessions, setSessions] = useState(SEED_SESSIONS);
  const [ipRestrictions, setIpRestrictions] = useState(SEED_IP_RESTRICTIONS);
  const [loginHistory] = useState(SEED_LOGIN_HISTORY);
  const [securityAlerts, setSecurityAlerts] = useState(SEED_SECURITY_ALERTS);
  const [apiKeys, setApiKeys] = useState(SEED_API_KEYS);
  const [webhookKeys, setWebhookKeys] = useState(SEED_WEBHOOK_KEYS);
  const [sessionPolicy, setSessionPolicy] = useState(SEED_SESSION_POLICY);
  // Industries & Templates — CRM configuration factory (lead fields/sources/groups/stages
  // applied at tenant onboarding). ClientsPage's Add Tenant modal derives its industry
  // dropdown from this list (Active only) instead of a hardcoded array.
  const [industries, setIndustries] = useState(SEED_INDUSTRIES);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const addHistory = (entry) => setHistory((h) => [{ id: nextId(), changedDate: NOW, changedBy: ADMIN, ...entry }, ...h]);

  const api = {
    clients, invoices, users, tickets, onboarding, notifs, toast, impersonating,
    spPlans, addonPricing, subscriptions, history, notify,
    spPlaybooks, tenantTasks, contactLogs,
    adminUsers, secRoles, sessions, ipRestrictions, loginHistory, securityAlerts, apiKeys, webhookKeys, sessionPolicy,
    industries,
    // Original store methods
    setTenantStatus: (id, status) => {
      const prevStatus = clients.find((c) => c.id === id)?.status;
      setClients((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
      if (prevStatus && prevStatus !== status) addHistory({ entityType: "Tenant", entityId: id, action: "Status changed", prev: { status: prevStatus }, next: { status }, reason: status === "Suspended" ? "Manually suspended" : "Manually reactivated" });
      notify(`Client ${status === "Suspended" ? "suspended" : "reactivated"}`);
    },
    extendTrial: (id, days) => { setClients((cs) => cs.map((c) => (c.id === id ? { ...c, plan: c.plan + " (+" + days + "d)" } : c))); notify(`Trial extended by ${days} days`); },
    addSeats: (id, n) => { setClients((cs) => cs.map((c) => (c.id === id ? { ...c, seats: c.seats + n } : c))); notify(`Added ${n} seats`); },
    addTenant: (data) => {
      const id = nextId();
      const client = {
        id, name: data.name, industry: data.industry, plan: data.plan || "Starter",
        planEnd: data.planEnd, leads: 0, aiUsed: 0, usage: 0,
        employees: 0, seats: data.seats, branch: data.branch,
        mrr: data.isTrial ? 0 : data.mrr, health: 100, status: data.isTrial ? "Trial" : "Active",
        churnRisk: "Low", am: data.am, gst: data.gst || "", provider: data.provider,
        providerOk: true, lastLogin: "—",
      };
      setClients((cs) => [client, ...cs]);
      addHistory({ entityType: "Tenant", entityId: id, action: "Tenant created", prev: {}, next: { name: client.name, plan: client.plan, am: client.am }, reason: "New tenant added" });
      notify(`${client.name} added as a new client`);
      return client;
    },
    retryInvoice: (invId) => { setInvoices((iv) => iv.map((i) => (i.id === invId ? { ...i, status: "Paid" } : i))); notify(`${invId} retried — payment collected`); },
    setUserStatus: (id, status) => { setUsers((us) => us.map((u) => (u.id === id ? { ...u, status } : u))); notify(`User ${status.toLowerCase()}`); },
    resendInvite: () => notify("Invite re-sent"),
    resetPassword: (name) => notify(`Password reset link sent to ${name}`),
    impersonate: (u) => { setImpersonating(u); notify(`Now viewing as ${u.name || u}`); },
    stopImpersonate: () => setImpersonating(null),
    updateOnboardingStage: (id, newStage) => {
      setOnboarding((os) => os.map((o) => {
        if (o.id !== id) return o;
        const oldStage = o.currentStage;
        const actEntry = { id: "act-" + Date.now(), who: ADMIN, what: `Stage changed: ${oldStage} → ${newStage}`, when: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) };
        return { ...o, currentStage: newStage, activity: [actEntry, ...(o.activity || [])] };
      }));
      notify(`Stage → ${newStage}`);
    },
    toggleChecklistItem: (id, itemId) => {
      setOnboarding((os) => os.map((o) => {
        if (o.id !== id) return o;
        const checklist = o.checklist.map((c) => c.id === itemId ? { ...c, completed: !c.completed } : c);
        const item = checklist.find((c) => c.id === itemId);
        const actEntry = { id: "act-" + Date.now(), who: ADMIN, what: `Task "${item.label.replace(" ✦ required", "")}" ${item.completed ? "completed" : "unchecked"}`, when: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) };
        return { ...o, checklist, activity: [actEntry, ...(o.activity || [])] };
      }));
    },
    updateOnboardingField: (id, field, value) => {
      setOnboarding((os) => os.map((o) => {
        if (o.id !== id) return o;
        const actEntry = { id: "act-" + Date.now(), who: ADMIN, what: `${field} updated to "${value}"`, when: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) };
        return { ...o, [field]: value, activity: [actEntry, ...(o.activity || [])] };
      }));
      notify("Saved");
    },
    createOnboarding: (fields, onCreated) => {
      // Duplicate guard — one active onboarding per client
      setOnboarding((os) => {
        if (os.some((o) => o.clientId === fields.clientId)) {
          notify("This client already has an active onboarding");
          return os;
        }
        const now = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
        const newRecord = {
          id: Date.now(),
          clientId: fields.clientId,
          clientName: fields.clientName,
          industry: fields.industry,
          owner: fields.owner,
          startedAt: fields.startedAt,
          targetGoLive: fields.targetGoLive || "",
          dealMRR: fields.dealMRR,
          provider: fields.provider,
          contact: fields.contact || "",
          currentStage: fields.startingStage || "Kickoff",
          checklist: mkChecklist([]),
          activity: [{ id: "act-" + Date.now(), who: ADMIN, what: `Onboarding started by ${ADMIN}`, when: now }],
        };
        const next = [...os, newRecord];
        saveOnboarding(next);
        notify(`Onboarding started for ${fields.clientName}`);
        if (onCreated) setTimeout(() => onCreated(newRecord), 0);
        return next;
      });
    },
    setTicketStatus: (id, status) => { setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t))); notify(`Ticket marked ${status.toLowerCase()}`); },
    markNotifRead: (id) => setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n))),
    markAllRead: () => { setNotifs((ns) => ns.map((n) => ({ ...n, read: true }))); notify("All caught up"); },
    // Quick-create a minimal client record (used when assigning a Published plan to a new signup)
    createClient: (data) => {
      const client = {
        id: Date.now(), name: data.name, industry: data.industry || "Other",
        branch: data.branch || "", status: data.status || "Active",
        riskLevel: data.riskLevel || "Low", accountManager: data.accountManager || "",
        employees: 0, seats: 0, mrr: 0, health: 100, churnRisk: "Low",
        am: data.accountManager || "", gst: "", provider: "", providerOk: true, lastLogin: "—",
        plan: "", isTrial: false,
      };
      setClients((cs) => [client, ...cs]);
      addHistory({ entityType: "Tenant", entityId: client.id, action: "Tenant created", prev: {}, next: { name: client.name, industry: client.industry }, reason: "Created via plan assignment" });
      notify(`${client.name} added as new client`);
      return client;
    },
    // === SUBSCRIPTION MODULE STORE METHODS ===
    // Plan CRUD
    createPlan: (plan) => {
      const p = { ...plan, id: makePlanId(), createdBy: ADMIN, createdDate: NOW, updatedBy: ADMIN, updatedDate: NOW };
      setSpPlans((ps) => [...ps, p]);
      addHistory({ entityType: "Plan", entityId: p.id, action: "Plan created", prev: {}, next: { planName: p.planName, planType: p.planType, monthlyPrice: p.monthlyPrice }, reason: "New plan" });
      notify(`Plan "${p.planName}" created`);
      return p;
    },
    updatePlan: (id, updates, reason = "Updated") => {
      let prev = {};
      setSpPlans((ps) => ps.map((p) => { if (p.id !== id) return p; prev = { monthlyPrice: p.monthlyPrice, yearlyPrice: p.yearlyPrice, status: p.status, usersIncluded: p.usersIncluded }; return { ...p, ...updates, updatedBy: ADMIN, updatedDate: NOW }; }));
      addHistory({ entityType: "Plan", entityId: id, action: "Plan updated", prev, next: updates, reason });
      notify("Plan updated");
    },
    archivePlan: (id) => {
      setSpPlans((ps) => ps.map((p) => (p.id === id ? { ...p, status: "Archived", updatedBy: ADMIN, updatedDate: NOW } : p)));
      addHistory({ entityType: "Plan", entityId: id, action: "Plan archived", prev: { status: "Active" }, next: { status: "Archived" }, reason: "Archived" });
      notify("Plan archived");
    },
    deletePlan: (id) => {
      setSpPlans((ps) => ps.filter((p) => p.id !== id));
      addHistory({ entityType: "Plan", entityId: id, action: "Plan deleted", prev: {}, next: {}, reason: "Deleted" });
      notify("Plan deleted");
    },
    duplicatePlan: (id) => {
      let dup = null;
      setSpPlans((ps) => { const src = ps.find((p) => p.id === id); if (!src) return ps; dup = { ...src, id: makePlanId(), planName: src.planName + " (Copy)", planType: "Custom", createdBy: ADMIN, createdDate: NOW, updatedBy: ADMIN, updatedDate: NOW }; return [...ps, dup]; });
      if (dup) { addHistory({ entityType: "Plan", entityId: dup.id, action: "Plan duplicated", prev: { sourceId: id }, next: { planName: dup.planName }, reason: "Duplicated" }); notify(`Plan duplicated as "${dup.planName}"`); }
      return dup;
    },
    // Addon pricing
    updateAddonPricing: (id, updates) => {
      setAddonPricing((as) => as.map((a) => (a.id === id ? { ...a, ...updates } : a)));
      addHistory({ entityType: "Addon", entityId: id, action: "Addon pricing updated", prev: {}, next: updates, reason: "Updated" });
      notify("Addon pricing updated");
    },
    // Subscriptions
    createSubscription: (sub) => {
      const s = { ...sub, id: "sub-" + Date.now().toString(36), createdBy: ADMIN, createdDate: NOW };
      setSubs((ss) => [...ss, s]);
      addHistory({ entityType: "Subscription", entityId: s.id, action: "Subscription created", prev: {}, next: { companyName: s.companyName, planName: s.planName, finalPrice: s.finalPrice }, reason: "New subscription" });
      notify(`Subscription created for ${s.companyName}`);
      return s;
    },
    updateSubscription: (id, updates, reason = "Updated") => {
      let prev = {};
      setSubs((ss) => ss.map((s) => { if (s.id !== id) return s; prev = { planName: s.planName, finalPrice: s.finalPrice, status: s.status }; return { ...s, ...updates }; }));
      addHistory({ entityType: "Subscription", entityId: id, action: "Subscription updated", prev, next: updates, reason });
      notify("Subscription updated");
    },
    // === CUSTOMER SUCCESS — PLAYBOOKS & TASKS ===
    createPlaybook: (pb) => {
      const p = { ...pb, id: "pb-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) };
      setSpPlaybooks((ps) => [...ps, p]);
      notify(`Playbook "${p.name}" created`);
      return p;
    },
    updatePlaybook: (id, updates) => {
      setSpPlaybooks((ps) => ps.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      notify("Playbook updated");
    },
    togglePlaybookStatus: (id) => {
      setSpPlaybooks((ps) => ps.map((p) => (p.id === id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p)));
      notify("Playbook status updated");
    },
    duplicatePlaybook: (id) => {
      let dup = null;
      setSpPlaybooks((ps) => {
        const src = ps.find((p) => p.id === id);
        if (!src) return ps;
        dup = {
          ...src, id: "pb-" + Date.now(), name: src.name + " (Copy)",
          steps: src.steps.map((s) => ({ ...s, id: "step-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) })),
          status: "Inactive", createdBy: ADMIN, createdDate: NOW,
        };
        return [...ps, dup];
      });
      if (dup) notify(`Playbook duplicated as "${dup.name}"`);
      return dup;
    },
    // mode: "add" (default) appends the new steps alongside any existing tasks for this
    // tenant; "replace" clears the tenant's existing tasks first. Prefer replaceTenantPlaybook
    // for the guarded (Open/In Progress only) version used by the Assign Playbook flow.
    assignPlaybookToTenant: (tenantId, playbookId, mode = "add") => {
      const tenant = clients.find((c) => c.id === tenantId);
      const playbook = spPlaybooks.find((p) => p.id === playbookId);
      if (!tenant || !playbook) return;
      const newTasks = buildTasksFromPlaybook(tenant, playbook);
      setTenantTasks((ts) => (mode === "replace" ? [...ts.filter((t) => t.tenantId !== tenantId), ...newTasks] : [...ts, ...newTasks]));
      notify(`Playbook assigned to ${tenant.name}`);
    },
    // Clears only the tenant's still-open work (Open / In Progress) before assigning the new
    // playbook — Done and Skipped tasks stay behind as history.
    replaceTenantPlaybook: (tenantId, playbookId) => {
      const tenant = clients.find((c) => c.id === tenantId);
      const playbook = spPlaybooks.find((p) => p.id === playbookId);
      if (!tenant || !playbook) return;
      const newTasks = buildTasksFromPlaybook(tenant, playbook);
      setTenantTasks((ts) => [
        ...ts.filter((t) => !(t.tenantId === tenantId && (t.status === "Open" || t.status === "In Progress"))),
        ...newTasks,
      ]);
      notify(`Playbook replaced for ${tenant.name}`);
    },
    updateTaskStatus: (taskId, status, note = "") => {
      if (status === "Skipped" && !note.trim()) { notify("Skip reason is required"); return false; }
      setTenantTasks((ts) => ts.map((t) => (t.id === taskId ? {
        ...t, status,
        completedDate: status === "Done" ? NOW : t.completedDate,
        skipNote: status === "Skipped" ? note.trim() : t.skipNote,
      } : t)));
      notify(`Task marked ${status}`);
      return true;
    },
    updateTaskNotes: (taskId, notes) => {
      setTenantTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, notes } : t)));
      notify("Note saved");
    },
    logContact: (tenantId, { type, outcome, notes }) => {
      const tenant = clients.find((c) => c.id === tenantId);
      const log = {
        id: "cl-" + Date.now(), tenantId, tenantName: tenant ? tenant.name : "",
        type, outcome, notes, loggedBy: ADMIN, loggedDate: NOW,
      };
      setContactLogs((cs) => [log, ...cs]);
      notify(`Contact logged for ${log.tenantName}`);
      return log;
    },
    // === SECURITY & ACCESS CONTROL ===
    // Admin Users
    createAdmin: (data) => {
      if (adminUsers.some((a) => a.email.toLowerCase() === data.email.toLowerCase())) { notify("An admin with this email already exists"); return null; }
      const role = secRoles.find((r) => r.id === data.roleId);
      const admin = {
        id: "adm-" + nextId(), name: data.name, email: data.email, phone: data.phone || "",
        roleId: data.roleId, roleName: role ? role.name : "", lastLogin: "—", activeSessions: 0,
        status: data.sendInvitation ? "Invited" : "Active", createdDate: NOW, createdBy: ADMIN,
      };
      setAdminUsers((as) => [admin, ...as]);
      addHistory({ entityType: "AdminUser", entityId: admin.id, action: "Admin created", prev: {}, next: { name: admin.name, email: admin.email, role: admin.roleName }, reason: "New admin added" });
      notify(`${admin.name} added as admin`);
      return admin;
    },
    updateAdmin: (id, updates, reason = "Admin updated") => {
      let prev = {};
      setAdminUsers((as) => as.map((a) => {
        if (a.id !== id) return a;
        prev = { name: a.name, email: a.email, phone: a.phone, roleId: a.roleId };
        const role = updates.roleId ? secRoles.find((r) => r.id === updates.roleId) : null;
        return { ...a, ...updates, roleName: role ? role.name : a.roleName };
      }));
      addHistory({ entityType: "AdminUser", entityId: id, action: "Admin updated", prev, next: updates, reason });
      notify("Admin updated");
    },
    suspendAdmin: (id) => {
      setAdminUsers((as) => as.map((a) => (a.id === id ? { ...a, status: "Suspended" } : a)));
      addHistory({ entityType: "AdminUser", entityId: id, action: "Admin suspended", prev: { status: "Active" }, next: { status: "Suspended" }, reason: "Manually suspended" });
      notify("Admin suspended");
    },
    reactivateAdmin: (id) => {
      setAdminUsers((as) => as.map((a) => (a.id === id ? { ...a, status: "Active" } : a)));
      addHistory({ entityType: "AdminUser", entityId: id, action: "Admin reactivated", prev: { status: "Suspended" }, next: { status: "Active" }, reason: "Manually reactivated" });
      notify("Admin reactivated");
    },
    deactivateAdmin: (id) => {
      setAdminUsers((as) => as.map((a) => (a.id === id ? { ...a, status: "Deactivated" } : a)));
      addHistory({ entityType: "AdminUser", entityId: id, action: "Admin deactivated", prev: {}, next: { status: "Deactivated" }, reason: "Manually deactivated" });
      notify("Admin deactivated");
    },
    resetAdminPassword: (id) => {
      const admin = adminUsers.find((a) => a.id === id);
      addHistory({ entityType: "AdminUser", entityId: id, action: "Password reset requested", prev: {}, next: {}, reason: "Manual reset" });
      notify(`Password reset link sent to ${admin ? admin.name : "admin"}`);
    },
    // Roles
    createRole: (data) => {
      const role = { id: "role-" + nextId(), name: data.name, description: data.description || "", type: data.type || "Standard", isSystem: false, createdBy: ADMIN, createdDate: NOW, permissions: emptyPermissions() };
      setSecRoles((rs) => [...rs, role]);
      addHistory({ entityType: "Role", entityId: role.id, action: "Role created", prev: {}, next: { name: role.name, type: role.type }, reason: "New role" });
      notify(`Role "${role.name}" created`);
      return role;
    },
    updateRolePermissions: (id, permissions, reason = "Permissions updated") => {
      setSecRoles((rs) => rs.map((r) => (r.id === id ? { ...r, permissions } : r)));
      addHistory({ entityType: "Role", entityId: id, action: "Role permissions updated", prev: {}, next: {}, reason });
      notify("Permissions saved");
    },
    duplicateRole: (id) => {
      let dup = null;
      setSecRoles((rs) => {
        const src = rs.find((r) => r.id === id);
        if (!src) return rs;
        dup = { ...src, id: "role-" + nextId(), name: src.name + " (Copy)", isSystem: false, createdBy: ADMIN, createdDate: NOW, permissions: JSON.parse(JSON.stringify(src.permissions)) };
        return [...rs, dup];
      });
      if (dup) { addHistory({ entityType: "Role", entityId: dup.id, action: "Role duplicated", prev: { sourceId: id }, next: { name: dup.name }, reason: "Duplicated" }); notify(`Role duplicated as "${dup.name}"`); }
      return dup;
    },
    deleteRole: (id) => {
      const assigned = adminUsers.filter((a) => a.roleId === id).length;
      const role = secRoles.find((r) => r.id === id);
      if (!role || role.isSystem || assigned > 0) { notify("Role can't be deleted — reassign its admins first"); return; }
      setSecRoles((rs) => rs.filter((r) => r.id !== id));
      addHistory({ entityType: "Role", entityId: id, action: "Role deleted", prev: { name: role.name }, next: {}, reason: "Deleted" });
      notify(`Role "${role.name}" deleted`);
    },
    // Sessions
    revokeSession: (sessionId) => {
      const sess = sessions.find((s) => s.id === sessionId);
      if (sess?.isCurrent) { notify("Can't revoke your current session"); return; }
      setSessions((ss) => ss.filter((s) => s.id !== sessionId));
      addHistory({ entityType: "Session", entityId: sessionId, action: "Session revoked", prev: { admin: sess?.adminName }, next: {}, reason: "Manually revoked" });
      notify("Session revoked");
    },
    revokeAllSessions: (adminId) => {
      setSessions((ss) => ss.filter((s) => s.isCurrent || (adminId ? s.adminId !== adminId : false)));
      addHistory({ entityType: "Session", entityId: adminId || "all", action: "All sessions revoked", prev: {}, next: {}, reason: adminId ? "Revoked for one admin" : "Revoked for all admins" });
      notify(adminId ? "Admin's sessions revoked" : "All sessions revoked");
    },
    // IP Restrictions
    addIpRestriction: (data) => {
      const rule = { id: "ip-" + nextId(), listType: data.listType, ip: data.ip, label: data.label, addedBy: ADMIN, addedDate: NOW, status: "Active", hitCount: 0, lastHit: null };
      setIpRestrictions((rs) => [rule, ...rs]);
      addHistory({ entityType: "IpRestriction", entityId: rule.id, action: "IP rule added", prev: {}, next: { ip: rule.ip, listType: rule.listType }, reason: "New rule" });
      notify(`${rule.listType === "Allow" ? "Allowlist" : "Blocklist"} rule added`);
      return rule;
    },
    toggleIpRestriction: (id) => {
      let nextStatus = "Active";
      setIpRestrictions((rs) => rs.map((r) => { if (r.id !== id) return r; nextStatus = r.status === "Active" ? "Disabled" : "Active"; return { ...r, status: nextStatus }; }));
      addHistory({ entityType: "IpRestriction", entityId: id, action: "IP rule status changed", prev: {}, next: { status: nextStatus }, reason: "Manual toggle" });
      notify(`Rule ${nextStatus === "Active" ? "enabled" : "disabled"}`);
    },
    removeIpRestriction: (id) => {
      const rule = ipRestrictions.find((r) => r.id === id);
      setIpRestrictions((rs) => rs.filter((r) => r.id !== id));
      addHistory({ entityType: "IpRestriction", entityId: id, action: "IP rule removed", prev: { ip: rule?.ip }, next: {}, reason: "Manually removed" });
      notify("Rule removed");
    },
    // Security Alerts
    updateAlertStatus: (id, status, note) => {
      setSecurityAlerts((al) => al.map((a) => {
        if (a.id !== id) return a;
        const notes = note ? [...a.notes, { text: note, by: ADMIN, at: NOW }] : a.notes;
        const resolved = status === "Resolved" || status === "False Positive";
        return { ...a, status, notes, resolvedAt: resolved ? NOW : a.resolvedAt, resolvedBy: resolved ? ADMIN : a.resolvedBy };
      }));
      addHistory({ entityType: "SecurityAlert", entityId: id, action: "Alert status changed", prev: {}, next: { status }, reason: note || "Status updated" });
      notify(`Alert marked ${status}`);
    },
    assignAlert: (id, adminName) => {
      setSecurityAlerts((al) => al.map((a) => (a.id === id ? { ...a, assignedTo: adminName } : a)));
      addHistory({ entityType: "SecurityAlert", entityId: id, action: "Alert assigned", prev: {}, next: { assignedTo: adminName }, reason: "Manual assignment" });
      notify(`Assigned to ${adminName}`);
    },
    // API Keys
    createApiKey: (data) => {
      const key = {
        id: "apikey-" + nextId(), name: data.name, keyPrefix: data.environment === "Production" ? "lsk_live_" : data.environment === "Staging" ? "lsk_test_" : "lsk_dev_",
        keyId: genKeyId(), scopes: data.scopes, createdBy: ADMIN, createdDate: NOW, lastUsed: "—",
        expiresAt: data.expiresAt, status: "Active", requestCount30d: 0, environment: data.environment,
      };
      const fullValue = genApiKeyValue(data.environment);
      setApiKeys((ks) => [key, ...ks]);
      addHistory({ entityType: "ApiKey", entityId: key.id, action: "API key created", prev: {}, next: { name: key.name, environment: key.environment, scopes: key.scopes }, reason: "New key" });
      notify(`API key "${key.name}" created`);
      return { ...key, fullValue };
    },
    revokeApiKey: (id) => {
      const key = apiKeys.find((k) => k.id === id);
      setApiKeys((ks) => ks.map((k) => (k.id === id ? { ...k, status: "Revoked" } : k)));
      addHistory({ entityType: "ApiKey", entityId: id, action: "API key revoked", prev: { status: "Active" }, next: { status: "Revoked" }, reason: "Manually revoked" });
      notify(`Key "${key?.name}" revoked`);
    },
    rotateApiKey: (id) => {
      const src = apiKeys.find((k) => k.id === id);
      if (!src) return null;
      setApiKeys((ks) => ks.map((k) => (k.id === id ? { ...k, status: "Revoked" } : k)));
      const key = {
        id: "apikey-" + nextId(), name: src.name, keyPrefix: src.keyPrefix, keyId: genKeyId(),
        scopes: src.scopes, createdBy: ADMIN, createdDate: NOW, lastUsed: "—",
        expiresAt: src.expiresAt, status: "Active", requestCount30d: 0, environment: src.environment,
      };
      const fullValue = genApiKeyValue(src.environment);
      setApiKeys((ks) => [key, ...ks]);
      addHistory({ entityType: "ApiKey", entityId: key.id, action: "API key rotated", prev: { sourceId: id }, next: { name: key.name }, reason: `Rotated from ${src.keyId}` });
      notify(`Key "${key.name}" rotated`);
      return { ...key, fullValue };
    },
    // Webhook Keys — per-tenant outbound webhook subscriptions (module/event selection)
    createWebhookKey: (data) => {
      const key = {
        id: "whk-" + nextId(), tenantId: data.tenantId, tenantName: data.tenantName, name: data.name,
        destinationUrl: data.destinationUrl, modules: data.modules, events: data.events,
        keyId: genWebhookKeyId(), status: "Active", createdBy: ADMIN, createdDate: NOW,
        lastDelivery: null, deliveryCount30d: 0,
      };
      const secretValue = genWebhookSecret();
      setWebhookKeys((ks) => [key, ...ks]);
      addHistory({ entityType: "WebhookKey", entityId: key.id, action: "Webhook key created", prev: {}, next: { tenant: key.tenantName, modules: key.modules, events: key.events }, reason: "New webhook key" });
      notify(`Webhook key created for ${key.tenantName}`);
      return { ...key, secretValue };
    },
    updateWebhookKeyConfig: (id, updates, reason = "Webhook key updated") => {
      let prev = {};
      setWebhookKeys((ks) => ks.map((k) => { if (k.id !== id) return k; prev = { modules: k.modules, events: k.events, destinationUrl: k.destinationUrl }; return { ...k, ...updates }; }));
      addHistory({ entityType: "WebhookKey", entityId: id, action: "Webhook key updated", prev, next: updates, reason });
      notify("Webhook key updated");
    },
    revokeWebhookKey: (id) => {
      const key = webhookKeys.find((k) => k.id === id);
      setWebhookKeys((ks) => ks.map((k) => (k.id === id ? { ...k, status: "Revoked" } : k)));
      addHistory({ entityType: "WebhookKey", entityId: id, action: "Webhook key revoked", prev: { status: key?.status }, next: { status: "Revoked" }, reason: "Manually revoked" });
      notify(`Webhook key "${key?.name}" revoked`);
    },
    regenerateWebhookKeySecret: (id) => {
      const key = webhookKeys.find((k) => k.id === id);
      if (!key) return null;
      const keyId = genWebhookKeyId();
      setWebhookKeys((ks) => ks.map((k) => (k.id === id ? { ...k, keyId } : k)));
      const secretValue = genWebhookSecret();
      addHistory({ entityType: "WebhookKey", entityId: id, action: "Webhook secret regenerated", prev: { keyId: key.keyId }, next: { keyId }, reason: "Manual regeneration" });
      notify(`Secret regenerated for "${key.name}"`);
      return { ...key, keyId, secretValue };
    },
    // Session policy (max failed attempts, lockout, session timeout)
    updateSessionPolicy: (updates) => {
      setSessionPolicy((c) => ({ ...c, ...updates }));
      addHistory({ entityType: "SessionPolicy", entityId: "global", action: "Session policy updated", prev: {}, next: updates, reason: "Policy change" });
      notify("Session policy updated");
    },
    // === SYSTEM HEALTH ===
    // Service/incident/deployment/dependency state lives locally in HealthPage (see
    // QueuesPage's pattern) — these are thin audit+notify wrappers for the admin actions
    // worth logging, called alongside HealthPage's own setState.
    createIncident: (data) => {
      addHistory({ entityType: "Incident", entityId: data.id, action: "Incident created", prev: {}, next: { title: data.title, severity: data.severity }, reason: data.title });
      notify(`Incident created: ${data.title}`);
    },
    resolveIncident: (id, title) => {
      addHistory({ entityType: "Incident", entityId: id, action: "Incident resolved", prev: { status: "Active" }, next: { status: "Resolved" }, reason: "Manually resolved" });
      notify(`Incident resolved: ${title}`);
    },
    escalateIncident: (id, title, oldSeverity, newSeverity) => {
      addHistory({ entityType: "Incident", entityId: id, action: "Incident escalated", prev: { severity: oldSeverity }, next: { severity: newSeverity }, reason: `Escalated from ${oldSeverity} to ${newSeverity}` });
      notify(`Incident escalated to ${newSeverity}`);
    },
    changeIncidentOwner: (id, title, oldOwner, newOwner) => {
      addHistory({ entityType: "Incident", entityId: id, action: "Incident owner changed", prev: { owner: oldOwner }, next: { owner: newOwner }, reason: `Reassigned from ${oldOwner} to ${newOwner}` });
      notify(`"${title}" reassigned to ${newOwner}`);
    },
    rollbackDeploy: (id, version) => {
      addHistory({ entityType: "Deployment", entityId: id, action: "Deployment rolled back", prev: { status: "Success" }, next: { status: "Rolled Back" }, reason: `Manual rollback of ${version}` });
      notify(`${version} rolled back`);
    },
    // === INDUSTRIES & TEMPLATES ===
    createIndustry: (data) => {
      const ind = { ...data, id: "ind-" + Date.now().toString(36), lastModified: NOW, modifiedBy: ADMIN };
      setIndustries((prev) => [...prev, ind]);
      addHistory({ entityType: "Industry", entityId: ind.id, action: "Industry created", prev: {}, next: { name: ind.name }, reason: "New industry template" });
      notify(`Industry "${ind.name}" created`);
      return ind;
    },
    updateIndustry: (id, updates, reason = "Configuration updated") => {
      let prevName = "";
      setIndustries((prev) => prev.map((ind) => {
        if (ind.id !== id) return ind;
        prevName = ind.name;
        return { ...ind, ...updates, lastModified: NOW, modifiedBy: ADMIN };
      }));
      addHistory({ entityType: "Industry", entityId: id, action: "Industry updated", prev: { name: prevName }, next: { name: updates.name || prevName }, reason });
      notify("Industry template updated");
    },
    duplicateIndustry: (id) => {
      let dup = null;
      setIndustries((prev) => {
        const src = prev.find((ind) => ind.id === id);
        if (!src) return prev;
        dup = { ...JSON.parse(JSON.stringify(src)), id: "ind-" + Date.now().toString(36), name: src.name + " (Copy)", status: "Draft", isDefault: false, lastModified: NOW, modifiedBy: ADMIN };
        return [...prev, dup];
      });
      if (dup) { addHistory({ entityType: "Industry", entityId: dup.id, action: "Industry duplicated", prev: { sourceId: id }, next: { name: dup.name }, reason: "Duplicated" }); notify(`Duplicated as "${dup.name}"`); }
      return dup;
    },
    deleteIndustry: (id) => {
      const ind = industries.find((i) => i.id === id);
      const tenantCount = ind ? clients.filter((c) => c.industry === ind.name).length : 0;
      if (tenantCount > 0) { notify(`Cannot delete — ${tenantCount} tenant${tenantCount === 1 ? "" : "s"} use this template`); return false; }
      setIndustries((prev) => prev.filter((i) => i.id !== id));
      addHistory({ entityType: "Industry", entityId: id, action: "Industry deleted", prev: { name: ind?.name }, next: {}, reason: "Deleted" });
      notify("Industry template deleted");
      return true;
    },
    setDefaultIndustry: (id) => {
      setIndustries((prev) => prev.map((i) => ({ ...i, isDefault: i.id === id })));
      const ind = industries.find((i) => i.id === id);
      addHistory({ entityType: "Industry", entityId: id, action: "Default industry changed", prev: {}, next: { name: ind?.name }, reason: "Set as default for new tenants" });
      notify(`"${ind?.name}" set as default`);
    },
  };
  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}
