import { useState, useContext, createContext, useCallback } from "react";
import { NOW, ADMIN, mkChecklist } from "../data/constants.js";
import { TODAY, fmtTaskDate } from "../lib/format.js";
import {
  SEED_CLIENTS, SEED_INVOICES, SEED_USERS, SEED_TICKETS, SEED_ONBOARDING,
  loadOnboarding, saveOnboarding, SEED_NOTIFS, makePlanId, SEED_SP_PLANS,
  SEED_ADDON_PRICING, SEED_SUBSCRIPTIONS, SEED_HISTORY, SEED_PLAYBOOKS,
  SEED_TENANT_TASKS, SEED_CONTACT_LOGS,
} from "../data/seed.js";

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

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const addHistory = (entry) => setHistory((h) => [{ id: nextId(), changedDate: NOW, changedBy: ADMIN, ...entry }, ...h]);

  const api = {
    clients, invoices, users, tickets, onboarding, notifs, toast, impersonating,
    spPlans, addonPricing, subscriptions, history, notify,
    spPlaybooks, tenantTasks, contactLogs,
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
  };
  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}
