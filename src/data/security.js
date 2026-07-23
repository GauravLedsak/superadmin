/* ============================================================
   SECURITY & ACCESS CONTROL — data module
   Seed data + enums for the internal LEDSAK admin-team pool
   (distinct from CRM Users / UsersPage, which is tenant end-users).
   Store state + mutations live in StoreContext.jsx, following the
   same addHistory/notify convention as the rest of the app.
   ============================================================ */

/* ---- Permission matrix schema ---- */
export const PERMISSION_SECTIONS = [
  {
    id: "tenantOps", label: "Tenant Operations",
    modules: [
      { key: "clients", label: "Clients", actions: ["view", "create", "edit", "delete", "export", "impersonate"] },
      { key: "onboarding", label: "Onboarding", actions: ["view", "create", "edit", "delete", "export"] },
      { key: "crmUsers", label: "CRM Users", actions: ["view", "create", "edit", "delete", "export", "impersonate"] },
    ],
  },
  {
    id: "revenue", label: "Revenue & Billing",
    modules: [
      { key: "subscriptions", label: "Subscriptions", actions: ["view", "create", "edit", "delete", "export"] },
      { key: "plans", label: "Plans", actions: ["view", "create", "edit", "archive", "delete"] },
      { key: "addons", label: "Add-ons", actions: ["view", "edit"] },
      { key: "analytics", label: "Revenue Analytics", actions: ["view", "export"] },
    ],
  },
  {
    id: "customerSuccess", label: "Customer Success",
    modules: [
      { key: "healthScores", label: "Health Scores", actions: ["view", "edit"] },
      { key: "playbooks", label: "Playbooks", actions: ["view", "create", "edit", "delete"] },
      { key: "tasks", label: "Tasks", actions: ["view", "create", "edit", "assign"] },
      { key: "contactLogs", label: "Contact Logs", actions: ["view", "create"] },
    ],
  },
  {
    id: "dataIntel", label: "Data & Intelligence",
    modules: [
      { key: "leads", label: "Leads & Records", actions: ["view", "export", "piiAccess"] },
      { key: "automation", label: "Automation", actions: ["view", "create", "edit", "toggle"] },
      { key: "ai", label: "AI Intelligence", actions: ["view", "configure"] },
    ],
  },
  {
    id: "operations", label: "Operations",
    modules: [
      { key: "integrations", label: "Integrations", actions: ["view", "connect", "disconnect", "configure"] },
      { key: "communications", label: "Communications", actions: ["view", "broadcast", "templateApprove"] },
      { key: "reports", label: "Reports & BI", actions: ["view", "create", "schedule", "export"] },
    ],
  },
  {
    id: "reliability", label: "Reliability",
    modules: [
      { key: "queues", label: "Queue Monitor", actions: ["view", "retry", "purge"] },
      { key: "logs", label: "Logs & Audit", actions: ["view", "export"] },
      { key: "systemHealth", label: "System Health", actions: ["view"] },
    ],
  },
  {
    id: "governance", label: "Governance & Security",
    modules: [
      { key: "security", label: "Security & Access", actions: ["view", "manageAdmins", "manageRoles", "manageSessions", "manageIp", "manageApiKeys"] },
      { key: "support", label: "Support & Tickets", actions: ["view", "create", "assign", "resolve"] },
      { key: "audit", label: "Admin Audit", actions: ["view", "export", "annotate"] },
    ],
  },
  {
    id: "config", label: "Configuration",
    modules: [
      { key: "industries", label: "Industries & Templates", actions: ["view", "edit"] },
      { key: "settings", label: "Settings", actions: ["view", "edit", "featureFlags"] },
    ],
  },
];
// "view" renders as an All/Assigned-Only scope dropdown; every other action is a checkbox.
export const SCOPED_ACTIONS = new Set(["view"]);
export const SCOPE_OPTIONS = ["All", "Assigned Only"];
export const ACTION_LABELS = {
  view: "View", create: "Create", edit: "Edit", delete: "Delete", export: "Export",
  impersonate: "Impersonate", archive: "Archive", assign: "Assign", toggle: "Toggle",
  piiAccess: "PII Access", configure: "Configure", connect: "Connect", disconnect: "Disconnect",
  broadcast: "Broadcast", templateApprove: "Template Approve", schedule: "Schedule",
  retry: "Retry", purge: "Purge", manageAdmins: "Manage Admins", manageRoles: "Manage Roles",
  manageSessions: "Sessions", manageIp: "IP Rules", manageApiKeys: "API Keys",
  annotate: "Annotate", resolve: "Resolve", featureFlags: "Feature Flags",
};
// Stable column order for the permission matrix — object key insertion order of
// ACTION_LABELS, so every section's grid lists actions in the same sequence.
export const ACTION_ORDER = Object.keys(ACTION_LABELS);
// Every action key that appears anywhere in PERMISSION_SECTIONS, for building an empty
// (all-false / no-scope) permissions object for a freshly created role.
export const ALL_MODULE_KEYS = PERMISSION_SECTIONS.flatMap((s) => s.modules.map((m) => m.key));
export function emptyPermissions() {
  const perms = {};
  PERMISSION_SECTIONS.forEach((s) => s.modules.forEach((m) => {
    perms[m.key] = Object.fromEntries(m.actions.map((a) => [a, SCOPED_ACTIONS.has(a) ? "Assigned Only" : false]));
  }));
  return perms;
}
// Short human summary of a role's permissions ("Clients, Subscriptions, Plans +3 more") for
// the Roles & Permissions list view — one line per row, no need to open the matrix to skim it.
export function summarizePermissions(permissions) {
  const active = [];
  PERMISSION_SECTIONS.forEach((s) => s.modules.forEach((m) => {
    const p = permissions[m.key] || {};
    const hasAny = Object.entries(p).some(([k, v]) => (SCOPED_ACTIONS.has(k) ? v === "All" : v === true));
    if (hasAny) active.push(m.label);
  }));
  if (!active.length) return "No access granted";
  if (active.length <= 3) return active.join(", ");
  return `${active.slice(0, 3).join(", ")} +${active.length - 3} more`;
}

/* ---- Enums ---- */
export const ADMIN_STATUSES = ["Active", "Suspended", "Deactivated", "Invited"];
export const ADMIN_STATUS_TONE = { Active: "success", Suspended: "danger", Deactivated: "gray", Invited: "warning" };
export const ROLE_TYPES = ["Privileged", "Standard"];
export const ROLE_TYPE_TONE = { Privileged: "danger", Standard: "brand" };
export const SESSION_STATUSES = ["Active", "Idle", "Expired"];
export const SESSION_STATUS_TONE = { Active: "success", Idle: "warning", Expired: "gray" };
export const LOGIN_EVENTS = ["login.success", "login.failed", "mfa.challenge", "mfa.verified", "account.locked", "password.reset", "session.expired"];
export const LOGIN_EVENT_TONE = { "login.success": "success", "login.failed": "danger", "mfa.challenge": "warning", "mfa.verified": "success", "account.locked": "dangerStrong", "password.reset": "info", "session.expired": "gray" };
export const LOGIN_OUTCOMES = ["Success", "Failed", "Blocked"];
export const ALERT_TYPES = ["brute_force", "suspicious_login", "mfa_disabled", "role_escalation", "api_key_abuse", "session_anomaly"];
export const ALERT_TYPE_LABEL = { brute_force: "Brute Force", suspicious_login: "Suspicious Login", mfa_disabled: "MFA Disabled", role_escalation: "Role Escalation", api_key_abuse: "API Key Abuse", session_anomaly: "Session Anomaly" };
export const ALERT_SEVERITIES = ["Low", "Medium", "High", "Critical"];
export const ALERT_SEVERITY_TONE = { Low: "gray", Medium: "warning", High: "danger", Critical: "dangerStrong" };
export const ALERT_STATUSES = ["Open", "Investigating", "Resolved", "False Positive"];
export const ALERT_STATUS_TONE = { Open: "danger", Investigating: "warning", Resolved: "success", "False Positive": "gray" };
export const IP_LIST_TYPES = ["Allow", "Block"];
export const API_KEY_STATUSES = ["Active", "Revoked", "Expired"];
export const API_KEY_STATUS_TONE = { Active: "success", Revoked: "danger", Expired: "gray" };
export const API_KEY_ENVIRONMENTS = ["Production", "Staging", "Development"];
export const ENV_TONE = { Production: "danger", Staging: "warning", Development: "gray" };
export const API_KEY_SCOPES = [
  { id: "leads.read", label: "Read Leads" },
  { id: "leads.write", label: "Write Leads" },
  { id: "tenants.read", label: "Read Tenants" },
  { id: "tenants.write", label: "Write Tenants" },
  { id: "analytics.read", label: "Read Analytics" },
  { id: "webhooks.manage", label: "Manage Webhooks" },
  { id: "full_access", label: "Full Access (overrides all)" },
];
export const API_KEY_EXPIRY_OPTIONS = ["3 months", "6 months", "1 year", "2 years", "Never"];

/* ============================================================
   SEED DATA
   ============================================================ */
export const SEED_ADMIN_USERS = [
  { id: "adm-1", name: "Saif Khan", email: "saif@ledsak.ai", phone: "+919812345678", roleId: "role-superadmin", roleName: "Super Admin", mfaEnabled: true, mfaMethod: "TOTP", mfaEnrolledDate: "2026-01-15", lastLogin: "2026-05-11 09:14", activeSessions: 2, status: "Active", createdDate: "2025-08-01", createdBy: "System" },
  { id: "adm-2", name: "Luv Sharma", email: "luv@ledsak.ai", phone: "+919876543210", roleId: "role-saleshead", roleName: "Sales Head", mfaEnabled: true, mfaMethod: "TOTP", mfaEnrolledDate: "2026-02-01", lastLogin: "2026-05-11 10:02", activeSessions: 1, status: "Active", createdDate: "2025-09-15", createdBy: "Saif Khan" },
  { id: "adm-3", name: "Gaurav Sagar", email: "gaurav@ledsak.ai", phone: "+917543035773", roleId: "role-pm", roleName: "Product Manager", mfaEnabled: false, mfaMethod: null, mfaEnrolledDate: null, lastLogin: "2026-05-10 18:44", activeSessions: 1, status: "Active", createdDate: "2025-10-01", createdBy: "Saif Khan" },
  { id: "adm-4", name: "Ravi Kant", email: "ravi@ledsak.ai", phone: "+918800123456", roleId: "role-engadmin", roleName: "Engineering Admin", mfaEnabled: true, mfaMethod: "TOTP", mfaEnrolledDate: "2026-01-20", lastLogin: "2026-05-11 08:30", activeSessions: 1, status: "Active", createdDate: "2025-09-01", createdBy: "Saif Khan" },
  { id: "adm-5", name: "Narender", email: "narender@ledsak.ai", phone: "+918447571177", roleId: "role-devops", roleName: "DevOps", mfaEnabled: true, mfaMethod: "Email", mfaEnrolledDate: "2026-03-01", lastLogin: "2026-05-11 07:55", activeSessions: 1, status: "Active", createdDate: "2025-11-01", createdBy: "Ravi Kant" },
  { id: "adm-6", name: "Abhishek", email: "abhishek@ledsak.ai", phone: "+919988776655", roleId: "role-designer", roleName: "Designer (View-only)", mfaEnabled: false, mfaMethod: null, mfaEnrolledDate: null, lastLogin: "2026-05-09 14:10", activeSessions: 0, status: "Active", createdDate: "2026-01-15", createdBy: "Saif Khan" },
];

function fullAccessPerms() {
  const perms = {};
  PERMISSION_SECTIONS.forEach((s) => s.modules.forEach((m) => {
    perms[m.key] = Object.fromEntries(m.actions.map((a) => [a, SCOPED_ACTIONS.has(a) ? "All" : true]));
  }));
  return perms;
}
function viewOnlyPerms() {
  const perms = {};
  PERMISSION_SECTIONS.forEach((s) => s.modules.forEach((m) => {
    perms[m.key] = Object.fromEntries(m.actions.map((a) => [a, SCOPED_ACTIONS.has(a) ? "All" : false]));
  }));
  return perms;
}

export const SEED_ROLES = [
  { id: "role-superadmin", name: "Super Admin", description: "Full platform access including PII, security, and destructive actions", type: "Privileged", isSystem: true, createdBy: "System", createdDate: "2025-08-01", permissions: fullAccessPerms() },
  {
    id: "role-saleshead", name: "Sales Head", description: "Full client, CS, revenue and communications access; no security or system configuration", type: "Privileged", isSystem: false, createdBy: "Saif Khan", createdDate: "2025-09-15",
    permissions: { ...emptyPermissions(),
      clients: { view: "All", create: true, edit: true, delete: false, export: true, impersonate: true },
      onboarding: { view: "All", create: true, edit: true, delete: false, export: true },
      crmUsers: { view: "All", create: true, edit: true, delete: false, export: true, impersonate: true },
      subscriptions: { view: "All", create: true, edit: true, delete: false, export: true },
      plans: { view: "All", create: false, edit: false, archive: false, delete: false },
      addons: { view: "All", edit: false },
      analytics: { view: "All", export: true },
      healthScores: { view: "All", edit: true },
      playbooks: { view: "All", create: true, edit: true, delete: false },
      tasks: { view: "All", create: true, edit: true, assign: true },
      contactLogs: { view: "All", create: true },
      communications: { view: "All", broadcast: true, templateApprove: true },
      reports: { view: "All", create: true, schedule: true, export: true },
    },
  },
  {
    id: "role-pm", name: "Product Manager", description: "Plans, industries, settings and reporting; no client-level or security access", type: "Standard", isSystem: false, createdBy: "Saif Khan", createdDate: "2025-10-01",
    permissions: { ...emptyPermissions(),
      plans: { view: "All", create: true, edit: true, archive: true, delete: false },
      addons: { view: "All", edit: true },
      analytics: { view: "All", export: true },
      reports: { view: "All", create: true, schedule: true, export: true },
      industries: { view: "All", edit: true },
      settings: { view: "All", edit: true, featureFlags: true },
    },
  },
  {
    id: "role-engadmin", name: "Engineering Admin", description: "Full reliability tooling: queues, logs, integrations, API keys, system health", type: "Privileged", isSystem: false, createdBy: "Saif Khan", createdDate: "2025-09-01",
    permissions: { ...emptyPermissions(),
      integrations: { view: "All", connect: true, disconnect: true, configure: true },
      queues: { view: "All", retry: true, purge: true },
      logs: { view: "All", export: true },
      systemHealth: { view: "All" },
      security: { view: "All", manageAdmins: false, manageRoles: false, manageSessions: true, manageIp: true, manageApiKeys: true },
      audit: { view: "All", export: true, annotate: false },
    },
  },
  {
    id: "role-devops", name: "DevOps", description: "System health, queue monitoring, logs and audit visibility; no client or revenue access", type: "Standard", isSystem: false, createdBy: "Ravi Kant", createdDate: "2025-11-01",
    permissions: { ...emptyPermissions(),
      queues: { view: "All", retry: true, purge: false },
      logs: { view: "All", export: true },
      systemHealth: { view: "All" },
      audit: { view: "All", export: false, annotate: false },
    },
  },
  { id: "role-designer", name: "Designer (View-only)", description: "Read-only visibility across every module for design reference — no PII, no mutations", type: "Standard", isSystem: false, createdBy: "Saif Khan", createdDate: "2026-01-15", permissions: viewOnlyPerms() },
  {
    id: "role-cs", name: "Customer Success", description: "Client health, playbooks, tasks, communications and support tickets", type: "Standard", isSystem: false, createdBy: "Saif Khan", createdDate: "2025-12-01",
    permissions: { ...emptyPermissions(),
      clients: { view: "All", create: false, edit: true, delete: false, export: false, impersonate: true },
      healthScores: { view: "All", edit: true },
      playbooks: { view: "All", create: true, edit: true, delete: false },
      tasks: { view: "All", create: true, edit: true, assign: true },
      contactLogs: { view: "All", create: true },
      communications: { view: "All", broadcast: false, templateApprove: false },
      support: { view: "All", create: true, assign: true, resolve: true },
    },
  },
  {
    id: "role-finance", name: "Finance", description: "Revenue analytics, reports and audit trail visibility for billing reconciliation", type: "Standard", isSystem: false, createdBy: "Saif Khan", createdDate: "2026-02-01",
    permissions: { ...emptyPermissions(),
      subscriptions: { view: "All", create: false, edit: false, delete: false, export: true },
      analytics: { view: "All", export: true },
      reports: { view: "All", create: true, schedule: true, export: true },
      audit: { view: "All", export: true, annotate: false },
    },
  },
];

export const SEED_SESSIONS = [
  { id: "sess-1", adminId: "adm-1", adminName: "Saif Khan", device: "Chrome 124 · macOS Ventura", ip: "103.21.244.9", location: "New Delhi, IN", startedAt: "2026-05-11 07:12", lastActive: "2026-05-13 10:42", status: "Active", isCurrent: true },
  { id: "sess-2", adminId: "adm-1", adminName: "Saif Khan", device: "Safari · iPhone 15 Pro", ip: "103.21.244.15", location: "New Delhi, IN", startedAt: "2026-05-12 18:30", lastActive: "2026-05-13 09:15", status: "Active", isCurrent: false },
  { id: "sess-3", adminId: "adm-2", adminName: "Luv Sharma", device: "Chrome 124 · Windows 11", ip: "49.36.88.4", location: "Mumbai, IN", startedAt: "2026-05-13 09:40", lastActive: "2026-05-13 10:20", status: "Active", isCurrent: false },
  { id: "sess-4", adminId: "adm-3", adminName: "Gaurav Sagar", device: "Chrome 124 · macOS Sonoma", ip: "103.21.244.31", location: "New Delhi, IN", startedAt: "2026-05-10 18:00", lastActive: "2026-05-10 18:44", status: "Expired", isCurrent: false },
  { id: "sess-5", adminId: "adm-4", adminName: "Ravi Kant", device: "Firefox 126 · Ubuntu", ip: "103.21.244.44", location: "New Delhi, IN", startedAt: "2026-05-13 08:00", lastActive: "2026-05-13 10:05", status: "Idle", isCurrent: false },
  { id: "sess-6", adminId: "adm-5", adminName: "Narender", device: "Chrome 124 · Windows 11", ip: "49.36.12.9", location: "Gurugram, IN", startedAt: "2026-05-13 07:55", lastActive: "2026-05-13 10:38", status: "Active", isCurrent: false },
  { id: "sess-7", adminId: "adm-6", adminName: "Abhishek", device: "Safari · macOS Sonoma", ip: "103.21.244.52", location: "New Delhi, IN", startedAt: "2026-05-09 14:00", lastActive: "2026-05-09 14:10", status: "Expired", isCurrent: false },
];

export const SEED_LOGIN_HISTORY = [
  { id: "lh-1", adminId: "adm-1", adminName: "Saif Khan", email: "saif@ledsak.ai", event: "login.success", ip: "103.21.244.9", location: "New Delhi, IN", device: "Chrome 124 · macOS", timestamp: "2026-05-13 10:42:18", outcome: "Success", failReason: null, mfaMethod: "TOTP" },
  { id: "lh-2", adminId: "adm-1", adminName: "Saif Khan", email: "saif@ledsak.ai", event: "mfa.challenge", ip: "103.21.244.9", location: "New Delhi, IN", device: "Chrome 124 · macOS", timestamp: "2026-05-13 10:42:10", outcome: "Success", failReason: null, mfaMethod: "TOTP" },
  { id: "lh-3", adminId: "adm-2", adminName: "Luv Sharma", email: "luv@ledsak.ai", event: "login.success", ip: "49.36.88.4", location: "Mumbai, IN", device: "Chrome 124 · Windows", timestamp: "2026-05-13 09:40:02", outcome: "Success", failReason: null, mfaMethod: "TOTP" },
  { id: "lh-4", adminId: "adm-3", adminName: "Gaurav Sagar", email: "gaurav@ledsak.ai", event: "login.success", ip: "103.21.244.31", location: "New Delhi, IN", device: "Chrome 124 · macOS", timestamp: "2026-05-10 18:00:11", outcome: "Success", failReason: null, mfaMethod: null },
  { id: "lh-5", adminId: null, adminName: "unknown", email: "saif@ledsak.ai", event: "login.failed", ip: "185.42.11.9", location: "São Paulo, BR", device: "curl/7.68.0", timestamp: "2026-05-11 08:39:02", outcome: "Failed", failReason: "Invalid password", mfaMethod: null },
  { id: "lh-6", adminId: null, adminName: "unknown", email: "saif@ledsak.ai", event: "login.failed", ip: "185.42.11.9", location: "São Paulo, BR", device: "curl/7.68.0", timestamp: "2026-05-11 08:40:14", outcome: "Failed", failReason: "Invalid password", mfaMethod: null },
  { id: "lh-7", adminId: null, adminName: "unknown", email: "saif@ledsak.ai", event: "login.failed", ip: "185.42.11.9", location: "São Paulo, BR", device: "curl/7.68.0", timestamp: "2026-05-11 08:41:30", outcome: "Failed", failReason: "Invalid password", mfaMethod: null },
  { id: "lh-8", adminId: null, adminName: "unknown", email: "saif@ledsak.ai", event: "login.failed", ip: "185.42.11.9", location: "São Paulo, BR", device: "curl/7.68.0", timestamp: "2026-05-11 08:42:00", outcome: "Failed", failReason: "Invalid password", mfaMethod: null },
  { id: "lh-9", adminId: null, adminName: "unknown", email: "saif@ledsak.ai", event: "account.locked", ip: "185.42.11.9", location: "São Paulo, BR", device: "curl/7.68.0", timestamp: "2026-05-11 08:42:05", outcome: "Blocked", failReason: "Account locked after 4 failed attempts", mfaMethod: null },
  { id: "lh-10", adminId: "adm-4", adminName: "Ravi Kant", email: "ravi@ledsak.ai", event: "login.success", ip: "103.21.244.44", location: "New Delhi, IN", device: "Firefox 126 · Ubuntu", timestamp: "2026-05-13 08:00:20", outcome: "Success", failReason: null, mfaMethod: "TOTP" },
  { id: "lh-11", adminId: "adm-5", adminName: "Narender", email: "narender@ledsak.ai", event: "mfa.verified", ip: "49.36.12.9", location: "Gurugram, IN", device: "Chrome 124 · Windows", timestamp: "2026-05-13 07:55:40", outcome: "Success", failReason: null, mfaMethod: "Email" },
  { id: "lh-12", adminId: "adm-5", adminName: "Narender", email: "narender@ledsak.ai", event: "login.success", ip: "49.36.12.9", location: "Gurugram, IN", device: "Chrome 124 · Windows", timestamp: "2026-05-13 07:55:12", outcome: "Success", failReason: null, mfaMethod: "Email" },
  { id: "lh-13", adminId: "adm-6", adminName: "Abhishek", email: "abhishek@ledsak.ai", event: "login.success", ip: "103.21.244.52", location: "New Delhi, IN", device: "Safari · macOS", timestamp: "2026-05-09 14:00:05", outcome: "Success", failReason: null, mfaMethod: null },
  { id: "lh-14", adminId: "adm-3", adminName: "Gaurav Sagar", email: "gaurav@ledsak.ai", event: "password.reset", ip: "103.21.244.31", location: "New Delhi, IN", device: "Chrome 124 · macOS", timestamp: "2026-05-08 11:20:00", outcome: "Success", failReason: null, mfaMethod: null },
  { id: "lh-15", adminId: "adm-1", adminName: "Saif Khan", email: "saif@ledsak.ai", event: "session.expired", ip: "103.21.244.15", location: "New Delhi, IN", device: "Safari · iPhone 15 Pro", timestamp: "2026-05-07 22:10:00", outcome: "Success", failReason: null, mfaMethod: null },
  { id: "lh-16", adminId: "adm-2", adminName: "Luv Sharma", email: "luv@ledsak.ai", event: "mfa.challenge", ip: "49.36.88.4", location: "Mumbai, IN", device: "Chrome 124 · Windows", timestamp: "2026-05-13 09:39:55", outcome: "Success", failReason: null, mfaMethod: "TOTP" },
  { id: "lh-17", adminId: null, adminName: "unknown", email: "ravi@ledsak.ai", event: "login.failed", ip: "92.12.55.3", location: "Frankfurt, DE", device: "unknown", timestamp: "2026-05-06 03:12:00", outcome: "Failed", failReason: "Invalid password", mfaMethod: null },
  { id: "lh-18", adminId: "adm-4", adminName: "Ravi Kant", email: "ravi@ledsak.ai", event: "login.success", ip: "103.21.244.44", location: "New Delhi, IN", device: "Firefox 126 · Ubuntu", timestamp: "2026-05-06 09:00:00", outcome: "Success", failReason: null, mfaMethod: "TOTP" },
];

export const SEED_SECURITY_ALERTS = [
  { id: "alert-1", type: "brute_force", title: "Brute-force attempt detected", description: "4 failed login attempts from 185.42.11.9 in 3 minutes targeting saif@ledsak.ai, followed by an automatic account lock.", severity: "High", sourceIp: "185.42.11.9", targetAdmin: "Saif Khan", timestamp: "2026-05-11 08:42:00", status: "False Positive", assignedTo: "Saif Khan", notes: [{ text: "Automated scanner, blocked at WAF", by: "Saif Khan", at: "2026-05-11 09:00" }], resolvedAt: "2026-05-11 09:00:00", resolvedBy: "Saif Khan" },
  { id: "alert-2", type: "suspicious_login", title: "Login from new location", description: "ravi@ledsak.ai login attempt failed from an unrecognized location (Frankfurt, DE) never seen for this account.", severity: "Medium", sourceIp: "92.12.55.3", targetAdmin: "Ravi Kant", timestamp: "2026-05-06 03:12:00", status: "Resolved", assignedTo: "Ravi Kant", notes: [{ text: "Confirmed not Ravi — VPN test from a contractor, access already revoked", by: "Ravi Kant", at: "2026-05-06 10:00" }], resolvedAt: "2026-05-06 10:00:00", resolvedBy: "Ravi Kant" },
  { id: "alert-3", type: "mfa_disabled", title: "MFA disabled on standard-access account", description: "gaurav@ledsak.ai does not have MFA enabled, and the account has Product Manager-level access to plan and settings mutation.", severity: "Medium", sourceIp: null, targetAdmin: "Gaurav Sagar", timestamp: "2026-05-10 09:00:00", status: "Open", assignedTo: null, notes: [], resolvedAt: null, resolvedBy: null },
  { id: "alert-4", type: "mfa_disabled", title: "MFA disabled on view-only account", description: "abhishek@ledsak.ai does not have MFA enabled. Access is view-only so risk is low, but flagged per policy.", severity: "Low", sourceIp: null, targetAdmin: "Abhishek", timestamp: "2026-05-09 14:15:00", status: "Investigating", assignedTo: "Saif Khan", notes: [{ text: "Reached out to Abhishek to enroll MFA this week", by: "Saif Khan", at: "2026-05-10 11:00" }], resolvedAt: null, resolvedBy: null },
  { id: "alert-5", type: "role_escalation", title: "Role changed to Privileged tier", description: "Ravi Kant's role was changed from Standard (DevOps) to Privileged (Engineering Admin) by Saif Khan.", severity: "Medium", sourceIp: "103.21.244.9", targetAdmin: "Ravi Kant", timestamp: "2026-05-01 10:00:00", status: "Resolved", assignedTo: "Saif Khan", notes: [{ text: "Approved — Ravi now owns Integrations & API Keys", by: "Saif Khan", at: "2026-05-01 10:05" }], resolvedAt: "2026-05-01 10:05:00", resolvedBy: "Saif Khan" },
  { id: "alert-6", type: "api_key_abuse", title: "Unusual request volume on API key", description: "Key 'Mobile SDK — Production' logged a 4x spike in request volume over a 1-hour window compared to its 7-day baseline.", severity: "High", sourceIp: null, targetAdmin: null, timestamp: "2026-05-12 22:10:00", status: "Investigating", assignedTo: "Ravi Kant", notes: [{ text: "Checking with mobile team — likely a retry-storm bug on their end, not abuse", by: "Ravi Kant", at: "2026-05-13 08:00" }], resolvedAt: null, resolvedBy: null },
  { id: "alert-7", type: "session_anomaly", title: "Session active from two distant locations", description: "Saif Khan has concurrent active sessions from New Delhi and a second device — both recognized devices, flagged for review only as routine hygiene.", severity: "Low", sourceIp: "103.21.244.15", targetAdmin: "Saif Khan", timestamp: "2026-05-12 18:31:00", status: "False Positive", assignedTo: "Saif Khan", notes: [{ text: "Both sessions are mine — desktop + personal iPhone", by: "Saif Khan", at: "2026-05-12 19:00" }], resolvedAt: "2026-05-12 19:00:00", resolvedBy: "Saif Khan" },
  { id: "alert-8", type: "suspicious_login", title: "Repeated login failures, low volume", description: "2 failed login attempts for luv@ledsak.ai from a recognized IP range — below brute-force threshold but outside typical login hours.", severity: "Low", sourceIp: "49.36.88.4", targetAdmin: "Luv Sharma", timestamp: "2026-05-13 06:10:00", status: "Open", assignedTo: null, notes: [], resolvedAt: null, resolvedBy: null },
];

export const SEED_IP_RESTRICTIONS = [
  { id: "ip-1", listType: "Allow", ip: "103.21.244.0/24", label: "LEDSAK Office — Delhi", addedBy: "Saif Khan", addedDate: "2026-01-15", status: "Active", hitCount: 1284, lastHit: "2026-05-13 10:42" },
  { id: "ip-2", listType: "Allow", ip: "49.36.0.0/16", label: "LEDSAK VPN — Mumbai Exit", addedBy: "Ravi Kant", addedDate: "2026-02-01", status: "Active", hitCount: 402, lastHit: "2026-05-13 09:40" },
  { id: "ip-3", listType: "Allow", ip: "49.36.12.9/32", label: "Narender — Home IP", addedBy: "Ravi Kant", addedDate: "2026-03-10", status: "Active", hitCount: 88, lastHit: "2026-05-13 07:55" },
  { id: "ip-4", listType: "Block", ip: "185.42.11.0/24", label: "Known scanner range — São Paulo", addedBy: "Saif Khan", addedDate: "2026-05-11", status: "Active", hitCount: 6, lastHit: "2026-05-11 08:42" },
  { id: "ip-5", listType: "Block", ip: "92.12.55.0/24", label: "Suspicious range — Frankfurt", addedBy: "Ravi Kant", addedDate: "2026-05-06", status: "Active", hitCount: 2, lastHit: "2026-05-06 03:12" },
  { id: "ip-6", listType: "Block", ip: "45.83.0.0/16", label: "Blocked after repeated abuse reports", addedBy: "Ravi Kant", addedDate: "2026-04-10", status: "Disabled", hitCount: 0, lastHit: null },
];

export const SEED_API_KEYS = [
  { id: "apikey-1", name: "Mobile SDK — Production", keyPrefix: "lsk_live_", keyId: "key_9f2a1b", scopes: ["leads.read", "leads.write", "tenants.read"], createdBy: "Ravi Kant", createdDate: "2026-02-10", lastUsed: "2026-05-13 10:42", expiresAt: "2027-02-10", status: "Active", requestCount30d: 48210, environment: "Production" },
  { id: "apikey-2", name: "Partner API — CarWale", keyPrefix: "lsk_live_", keyId: "key_7c31de", scopes: ["leads.write", "webhooks.manage"], createdBy: "Ravi Kant", createdDate: "2026-01-05", lastUsed: "2026-05-13 10:37", expiresAt: "2027-01-05", status: "Active", requestCount30d: 21840, environment: "Production" },
  { id: "apikey-3", name: "Internal Testing", keyPrefix: "lsk_test_", keyId: "key_1a8b90", scopes: ["full_access"], createdBy: "Narender", createdDate: "2026-03-20", lastUsed: "2026-05-12 16:00", expiresAt: "2026-09-20", status: "Active", requestCount30d: 640, environment: "Staging" },
  { id: "apikey-4", name: "Monitoring", keyPrefix: "lsk_live_", keyId: "key_5e4f22", scopes: ["analytics.read"], createdBy: "Narender", createdDate: "2026-02-18", lastUsed: "2026-05-13 10:35", expiresAt: "Never", status: "Active", requestCount30d: 4320, environment: "Production" },
  { id: "apikey-5", name: "Old Dashboard Key", keyPrefix: "lsk_live_", keyId: "key_00c1aa", scopes: ["tenants.read", "tenants.write"], createdBy: "Saif Khan", createdDate: "2025-09-01", lastUsed: "2026-01-14 12:00", expiresAt: "2026-09-01", status: "Revoked", requestCount30d: 0, environment: "Production" },
];

export const SEED_MFA_CONFIG = {
  requireForAll: false,
  requireForPrivileged: true,
  allowBackupCodes: true,
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 30,
  sessionTimeoutMinutes: 720,
  allowedMethods: ["TOTP", "Email"],
};

/* ---- Helpers ---- */
export function isRepeatedFailure(row, allRows) {
  if (row.event !== "login.failed") return false;
  const sameIp = allRows.filter((r) => r.event === "login.failed" && r.ip === row.ip);
  return sameIp.length >= 3;
}
export function genApiKeyValue(environment) {
  const env = environment === "Production" ? "live" : environment === "Staging" ? "test" : "dev";
  const hex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `lsk_${env}_${hex}`;
}
export function genKeyId() {
  return "key_" + Array.from({ length: 6 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}
export function isValidCidr(value) {
  const v = (value || "").trim();
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}(\/(\d|[1-2]\d|3[0-2]))?$/;
  const ipv6 = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}(\/\d{1,3})?$/;
  if (ipv4.test(v)) return v.split("/")[0].split(".").every((o) => Number(o) <= 255);
  return ipv6.test(v);
}
