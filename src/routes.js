import {
  LayoutDashboard, Store, Rocket, Users, CreditCard, HeartHandshake, Database, Bot, Sparkles,
  Plug, Send, BarChart3, Layers, ListChecks, Activity, ShieldCheck, Headset, LayoutTemplate,
  Settings,
} from "lucide-react";

export const DASHBOARD_ITEM = { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" };
export const SETTINGS_ITEM = { id: "settings", label: "Settings", icon: Settings, path: "/settings" };
export const NAV = [
  { section: "Core", items: [
    { id: "clients", label: "Clients", icon: Store, badge: "15", path: "/clients" },
    { id: "onboarding", label: "Onboarding", icon: Rocket, badge: "5", path: "/onboarding" },
    { id: "users", label: "CRM Users", icon: Users, path: "/users" },
  ] },
  { section: "Revenue", items: [
    { id: "subs", label: "Subscriptions & Plans", icon: CreditCard, path: "/subscriptions" },
    { id: "cs", label: "Customer Success", icon: HeartHandshake, badge: "5", path: "/customer-success" },
  ] },
  { section: "Data & Intelligence", items: [
    { id: "leads", label: "Lead & Record Mgmt", icon: Database, path: "/leads" },
    { id: "automation", label: "Automation Center", icon: Bot, path: "/automation" },
    { id: "ai", label: "AI Intelligence", icon: Sparkles, path: "/ai" },
  ] },
  { section: "Operations", items: [
    { id: "integrations", label: "Integrations", icon: Plug, badge: "!", path: "/integrations" },
    { id: "comms", label: "Communication Center", icon: Send, path: "/communications" },
    { id: "reports", label: "Reports & BI", icon: BarChart3, path: "/reports" },
  ] },
  { section: "Reliability", items: [
    { id: "queues", label: "Queue Monitor", icon: Layers, badge: "5", path: "/queues" },
    { id: "logs", label: "Logs & Audit", icon: ListChecks, path: "/logs" },
    { id: "health", label: "System Health", icon: Activity, path: "/health" },
  ] },
  { section: "Governance", items: [
    { id: "security", label: "Security & Access", icon: ShieldCheck, path: "/security" },
    { id: "support", label: "Support & Tickets", icon: Headset, badge: "6", path: "/support" },
  ] },
  { section: "Configuration", items: [
    { id: "industries", label: "Industries & Templates", icon: LayoutTemplate, path: "/industries" },
  ] },
];

const ALL_NAV_ITEMS = [DASHBOARD_ITEM, SETTINGS_ITEM, ...NAV.flatMap((g) => g.items)];
export const ID_TO_PATH = Object.fromEntries(ALL_NAV_ITEMS.map((it) => [it.id, it.path]));
export const PATH_TO_ID = Object.fromEntries(ALL_NAV_ITEMS.map((it) => [it.path, it.id]));
export const PAGE_TITLES = Object.fromEntries(ALL_NAV_ITEMS.map((it) => [it.id, it.label]));

// Pages whose table manages its own internal scroll and fills the available height —
// these get a non-scrolling content area so only the table (not the whole page) scrolls.
export const FIXED_HEIGHT_PAGES = new Set(["clients", "users", "subs", "cs", "support", "logs", "security"]);
