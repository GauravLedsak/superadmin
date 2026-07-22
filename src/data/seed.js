import { Users, Database, Bot, Package, Server } from "lucide-react";
import { ADMIN, mkChecklist } from "./constants.js";

export const STATS = { total: 564, subscribed: 56, free: 509, blocked: 5, onboarded: 317, leads: 869241, aiUsed: 483, paidCt: 51, mrr: 312079, arr: 3744948 };
export const SEED_CLIENTS = [
  { id: 1, name: "Rezoni", industry: "Ecommerce", plan: "Rezoni", planEnd: "26-01-2026", leads: 410698, aiUsed: 0, usage: 157.79, employees: 10, seats: 10, branch: "New Delhi", mrr: 4167, health: 30, status: "Active", churnRisk: "High", am: "Saif Sir", gst: "07AAECR1234K1Z9", provider: "CarWale", providerOk: false, lastLogin: "20 Apr 2026" },
  { id: 2, name: "Derma Purtitys", industry: "Clinic", plan: "Dermapuritys", planEnd: "30-03-2027", leads: 128160, aiUsed: 163, usage: 15.7, employees: 10, seats: 15, branch: "Delhi", mrr: 8333, health: 92, status: "Active", churnRisk: "Low", am: "Luv", gst: "07AAFCD5678L1Z2", provider: "CarDekho", providerOk: true, lastLogin: "12 May 2026" },
  { id: 3, name: "MedLinks", industry: "Clinic", plan: "Medlinks", planEnd: "11-11-2026", leads: 98096, aiUsed: 116, usage: 6.33, employees: 45, seats: 50, branch: "Safdarjung Enclave", mrr: 16250, health: 95, status: "Active", churnRisk: "Low", am: "Saif Sir", gst: "07AAGCM9012M1Z5", provider: "Website", providerOk: true, lastLogin: "13 May 2026" },
  { id: 4, name: "Siama Skincare", industry: "Clinic", plan: "Business Quarterly", planEnd: "18-12-2025", leads: 60797, aiUsed: 19, usage: 49.44, employees: 20, seats: 20, branch: "Noida Sec-18", mrr: 2167, health: 75, status: "Active", churnRisk: "Low", am: "Luv", gst: "09AAHCS3456N1Z8", provider: "CarWale", providerOk: true, lastLogin: "11 May 2026" },
  { id: 5, name: "Dermalife", industry: "Clinic", plan: "AXTEN SPECIAL", planEnd: "05-01-2026", leads: 37264, aiUsed: 1, usage: 95.5, employees: 15, seats: 15, branch: "Greenpark", mrr: 12500, health: 52, status: "Active", churnRisk: "Medium", am: "Saif Sir", gst: "07AAICD7890P1Z1", provider: "CarDekho", providerOk: true, lastLogin: "08 May 2026" },
  { id: 6, name: "Varun Group", industry: "Automotive", plan: "VARUN SPECIAL", planEnd: "07-09-2025", leads: 16933, aiUsed: 3, usage: 93.11, employees: 30, seats: 35, branch: "Hyderabad", mrr: 12500, health: 53, status: "Active", churnRisk: "Medium", am: "Saif Sir", gst: "36AAJCV1234Q1Z4", provider: "CarWale", providerOk: false, lastLogin: "09 May 2026" },
  { id: 7, name: "LEDSAK", industry: "Other", plan: "Dermapuritys", planEnd: "28-05-2026", leads: 16387, aiUsed: 72, usage: 12.96, employees: 50, seats: 50, branch: "Delhi", mrr: 8333, health: 93, status: "Active", churnRisk: "Low", am: "Luv", gst: "07AAFCL9438H1Z5", provider: "Website", providerOk: true, lastLogin: "13 May 2026" },
  { id: 8, name: "Inside Edge Learning", industry: "Education", plan: "Customised Yearly", planEnd: "23-02-2027", leads: 10470, aiUsed: 1, usage: 2.07, employees: 40, seats: 40, branch: "Mumbai", mrr: 5000, health: 95, status: "Active", churnRisk: "Low", am: "Vishal", gst: "27AAKCI5678R1Z7", provider: "Website", providerOk: true, lastLogin: "10 May 2026" },
  { id: 9, name: "Evinces Ventures", industry: "Ecommerce", plan: "PREMIUM TRIAL", planEnd: "01-06-2026", leads: 3325, aiUsed: 0, usage: 0.0, employees: 10, seats: 10, branch: "Noida", mrr: 0, health: 95, status: "Trial", churnRisk: "Low", am: "Vishal", gst: "09AALCE9012S1Z0", provider: "CarWale", providerOk: true, lastLogin: "05 May 2026" },
  { id: 10, name: "Luhaif Digitech", industry: "Other", plan: "Dermapuritys", planEnd: "21-04-2027", leads: 8308, aiUsed: 28, usage: 1.94, employees: 10, seats: 10, branch: "Delhi", mrr: 8333, health: 95, status: "Active", churnRisk: "Low", am: "Luv", gst: "07AAMCL3456T1Z3", provider: "Website", providerOk: true, lastLogin: "12 May 2026" },
  { id: 11, name: "Urban Autohub", industry: "Automotive", plan: "Aryaanya Custom", planEnd: "13-01-2027", leads: 5855, aiUsed: 5, usage: 27.02, employees: 26, seats: 30, branch: "Moti Nagar", mrr: 8333, health: 86, status: "Active", churnRisk: "Low", am: "Luv", gst: "07AANCU7890U1Z6", provider: "CarDekho", providerOk: true, lastLogin: "11 May 2026" },
  { id: 12, name: "Aryaanya Group", industry: "Other", plan: "Aryaanya Custom", planEnd: "18-06-2026", leads: 4395, aiUsed: 18, usage: 11.37, employees: 10, seats: 12, branch: "Ahmedabad", mrr: 8333, health: 94, status: "Active", churnRisk: "Low", am: "Luv", gst: "24AAOCA1234V1Z9", provider: "Website", providerOk: true, lastLogin: "10 May 2026" },
  { id: 13, name: "SAMT Fixtures", industry: "Other", plan: "Business Quarterly", planEnd: "08-12-2025", leads: 5578, aiUsed: 4, usage: 0.0, employees: 32, seats: 35, branch: "Okhla Phase-1", mrr: 2167, health: 88, status: "Active", churnRisk: "Low", am: "Vishal", gst: "07AAPCS5678W1Z2", provider: "Website", providerOk: true, lastLogin: "07 May 2026" },
  { id: 14, name: "Cosmetique", industry: "Clinic", plan: "Dermapuritys", planEnd: "08-04-2027", leads: 2865, aiUsed: 0, usage: 4.58, employees: 10, seats: 10, branch: "Amritsar", mrr: 8333, health: 90, status: "Active", churnRisk: "Low", am: "Luv", gst: "03AAQCC9012X1Z5", provider: "Website", providerOk: true, lastLogin: "09 May 2026" },
  { id: 15, name: "Mahakumbh Motors", industry: "Automotive", plan: "Mahakumbh Special", planEnd: "15-08-2025", leads: 2149, aiUsed: 0, usage: 0.62, employees: 22, seats: 25, branch: "Prayagraj", mrr: 5000, health: 44, status: "Suspended", churnRisk: "High", am: "Saif Sir", gst: "09AARCM3456Y1Z8", provider: "CarWale", providerOk: false, lastLogin: "18 Apr 2026" },
];

export const SEED_ONBOARDING = [
  { id: 101, clientName: "Nexa Auto Group", industry: "Automotive", owner: "Saif Sir", startedAt: "02 May 2026", dealMRR: 15000, provider: "CarWale + CarDekho", currentStage: "Kickoff", contact: "Rohit Anand",
    checklist: mkChecklist(["t1"]),
    activity: [{ id: "act-1", who: "Saif Sir", what: "Stage set to Kickoff", when: "02 May 2026 09:00" }] },
  { id: 102, clientName: "Skin Story Clinics", industry: "Clinic", owner: "Luv", startedAt: "28 Apr 2026", dealMRR: 9000, provider: "Website", currentStage: "Configuring", contact: "Dr. Meera Iyer",
    checklist: mkChecklist(["t1", "t2", "t3", "t4", "t5"]),
    activity: [
      { id: "act-3", who: "Luv", what: "Stage advanced: Kickoff → Configuring", when: "30 Apr 2026 14:00" },
      { id: "act-2", who: "Luv", what: "Stage set to Kickoff", when: "28 Apr 2026 09:00" },
    ] },
  { id: 103, clientName: "DriveEasy Motors", industry: "Automotive", owner: "Vishal", startedAt: "25 Apr 2026", dealMRR: 12000, provider: "CarDekho", currentStage: "Data Import", contact: "Sanjay Rao",
    checklist: mkChecklist(["t1", "t2", "t3", "t4", "t5", "t6", "t7"]),
    activity: [
      { id: "act-5", who: "Vishal", what: "Stage advanced: Configuring → Data Import", when: "01 May 2026 11:00" },
      { id: "act-4", who: "Vishal", what: "Stage advanced: Kickoff → Configuring", when: "27 Apr 2026 10:00" },
      { id: "act-6", who: "Vishal", what: "Stage set to Kickoff", when: "25 Apr 2026 09:00" },
    ] },
  { id: 104, clientName: "BrightPath Edu", industry: "Education", owner: "Vishal", startedAt: "20 Apr 2026", dealMRR: 6000, provider: "Website", currentStage: "Training", contact: "Kavita Nair",
    checklist: mkChecklist(["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"]),
    activity: [
      { id: "act-9", who: "Vishal", what: "Stage advanced: Data Import → Training", when: "29 Apr 2026 16:00" },
      { id: "act-8", who: "Vishal", what: "Stage advanced: Configuring → Data Import", when: "25 Apr 2026 10:00" },
      { id: "act-7", who: "Vishal", what: "Stage advanced: Kickoff → Configuring", when: "22 Apr 2026 09:00" },
    ] },
  { id: 105, clientName: "Glow Aesthetics", industry: "Clinic", owner: "Luv", startedAt: "15 Apr 2026", dealMRR: 8500, provider: "Website + WhatsApp", currentStage: "Go-Live", contact: "Dr. Anjali Sethi",
    checklist: mkChecklist(["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12"]),
    activity: [
      { id: "act-14", who: "Luv", what: "Stage advanced: Training → Go-Live", when: "25 Apr 2026 12:00" },
      { id: "act-13", who: "Luv", what: "Stage advanced: Data Import → Training", when: "22 Apr 2026 10:00" },
    ] },
];
export const ONBOARD_STORAGE_KEY = "ledsak_onboarding_v2";
export const loadOnboarding = () => { try { const s = localStorage.getItem(ONBOARD_STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; } };
export const saveOnboarding = (data) => { try { localStorage.setItem(ONBOARD_STORAGE_KEY, JSON.stringify(data)); } catch {} };
export const SEED_INVOICES = [
  { id: "INV-2451", client: "MedLinks", amt: 16250, status: "Paid", date: "01 May 2026", method: "UPI" },
  { id: "INV-2452", client: "Dermalife", amt: 12500, status: "Pending", date: "03 May 2026", method: "Bank" },
  { id: "INV-2453", client: "Rezoni", amt: 4167, status: "Failed", date: "05 May 2026", method: "Card", failReason: "Card declined" },
  { id: "INV-2454", client: "Aryaanya Group", amt: 8333, status: "Paid", date: "06 May 2026", method: "UPI" },
  { id: "INV-2455", client: "Varun Group", amt: 12500, status: "Pending", date: "08 May 2026", method: "Bank" },
  { id: "INV-2456", client: "Mahakumbh Motors", amt: 5000, status: "Failed", date: "09 May 2026", method: "Card", failReason: "Insufficient funds" },
];
export const SEED_USERS = [
  { id: 1, name: "Rahul Mehta", email: "rahul@medlinks.in", tenant: "MedLinks", role: "Team Lead", status: "Active", last: "2 min ago" },
  { id: 2, name: "Priya Sharma", email: "priya@dermapuritys.com", tenant: "Derma Purtitys", role: "Telecaller", status: "Active", last: "18 min ago" },
  { id: 3, name: "Arjun Nair", email: "arjun@varungroup.in", tenant: "Varun Group", role: "Brand CEO", status: "Active", last: "1 hr ago" },
  { id: 4, name: "Sneha Kapoor", email: "sneha@rezoni.com", tenant: "Rezoni", role: "Admin (CMO)", status: "Suspended", last: "5 days ago" },
  { id: 5, name: "Vikram Singh", email: "vikram@urbanauto.in", tenant: "Urban Autohub", role: "Telecaller", status: "Active", last: "40 min ago" },
  { id: 6, name: "Anita Desai", email: "anita@aryaanya.com", tenant: "Aryaanya Group", role: "Team Lead", status: "Invited", last: "—" },
];
export const SEED_TICKETS = [
  { id: "TKT-812", subj: "Lead sync stopped from CarWale", tenant: "Varun Group", pri: "High", status: "Open", age: "2h", owner: "Saif Sir" },
  { id: "TKT-811", subj: "Cannot add telecaller seats", tenant: "MedLinks", pri: "Medium", status: "Open", age: "5h", owner: "Luv" },
  { id: "TKT-809", subj: "Invoice GST number update", tenant: "Aryaanya Group", pri: "Low", status: "Pending", age: "1d", owner: "Vishal" },
  { id: "TKT-806", subj: "WhatsApp template rejected", tenant: "Derma Purtitys", pri: "Medium", status: "Open", age: "1d", owner: "Luv" },
  { id: "TKT-802", subj: "Export missing columns", tenant: "Inside Edge Learning", pri: "Low", status: "Resolved", age: "3d", owner: "Vishal" },
];
export const SEED_NOTIFS = [
  { id: 1, icon: "danger", title: "CarWale feed down for Varun Group", time: "12 min ago", read: false, page: "integrations" },
  { id: 2, icon: "warning", title: "3 plans expiring within 30 days", time: "1 hr ago", read: false, page: "cs" },
  { id: 3, icon: "danger", title: "Payment failed — Rezoni (₹4,167)", time: "2 hr ago", read: false, page: "billing" },
  { id: 4, icon: "success", title: "Glow Aesthetics reached Go-Live", time: "4 hr ago", read: true, page: "onboarding" },
  { id: 5, icon: "info", title: "TKT-812 assigned to you", time: "5 hr ago", read: true, page: "support" },
];
export const PLAN_DIST = [
  { plan: "Business Quarterly", clients: 11, mrr: 23837 }, { plan: "WADHWANI SPECIAL", clients: 7, mrr: 70000 },
  { plan: "Dermapuritys", clients: 7, mrr: 58331 }, { plan: "PREMIUM", clients: 5, mrr: 39995 },
  { plan: "Aryaanya Custom", clients: 3, mrr: 24999 }, { plan: "AXTEN SPECIAL", clients: 2, mrr: 25000 },
];
export const MRR_TREND = [
  { m: "Dec", v: 258500 }, { m: "Jan", v: 272000 }, { m: "Feb", v: 285200 },
  { m: "Mar", v: 293400 }, { m: "Apr", v: 305700 }, { m: "May", v: STATS.mrr },
];

export const makePlanId = () => "plan-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const SEED_SP_PLANS = [
  // Published Plans
  { id: "sp-starter", planName: "Starter", description: "For small teams getting started with lead management", planType: "Published", status: "Active",
    monthlyPrice: 2999, yearlyPrice: 29990, billingFrequencies: ["Monthly", "Yearly"],
    usersIncluded: 5, usersMaximum: 10, usersAddonAllowed: true, usersAddonPrice: 500,
    recordsIncluded: 100000, recordsMaximum: 900000, recordsAddonAllowed: true, recordsAddonPrice: 1000,
    integrationsIncluded: 3, integrationsMaximum: 9, integrationsAddonAllowed: true, integrationsAddonPrice: 800,
    automationsIncluded: 0, customEntitiesIncluded: 0, dealsModuleEnabled: false,
    createdBy: ADMIN, createdDate: "01 Jan 2026", updatedBy: ADMIN, updatedDate: "01 Jan 2026" },
  { id: "sp-growth", planName: "Growth", description: "For growing teams with advanced automation needs", planType: "Published", status: "Active",
    monthlyPrice: 7999, yearlyPrice: 79990, billingFrequencies: ["Monthly", "Yearly"],
    usersIncluded: 12, usersMaximum: 20, usersAddonAllowed: true, usersAddonPrice: 500,
    recordsIncluded: 1000000, recordsMaximum: 2000000, recordsAddonAllowed: true, recordsAddonPrice: 800,
    integrationsIncluded: 10, integrationsMaximum: 20, integrationsAddonAllowed: true, integrationsAddonPrice: 600,
    automationsIncluded: 10, customEntitiesIncluded: 2, dealsModuleEnabled: true,
    createdBy: ADMIN, createdDate: "01 Jan 2026", updatedBy: ADMIN, updatedDate: "01 Jan 2026" },
  // Custom Plans
  { id: "sp-enterprise", planName: "Enterprise", description: "Full-featured for large dealership networks", planType: "Custom", status: "Active",
    monthlyPrice: 350000, yearlyPrice: 3500000, billingFrequencies: ["Monthly", "Yearly"],
    usersIncluded: 100, usersMaximum: 500, usersAddonAllowed: true, usersAddonPrice: 400,
    recordsIncluded: 50000000, recordsMaximum: 100000000, recordsAddonAllowed: true, recordsAddonPrice: 500,
    integrationsIncluded: 50, integrationsMaximum: 100, integrationsAddonAllowed: true, integrationsAddonPrice: 500,
    automationsIncluded: 100, customEntitiesIncluded: 20, dealsModuleEnabled: true,
    createdBy: ADMIN, createdDate: "15 Feb 2026", updatedBy: ADMIN, updatedDate: "15 Feb 2026" },
  { id: "sp-hospital", planName: "Hospital Package", description: "Clinic-optimized with EMR bridge", planType: "Custom", status: "Active",
    monthlyPrice: 16250, yearlyPrice: 162500, billingFrequencies: ["Monthly", "Yearly"],
    usersIncluded: 45, usersMaximum: 80, usersAddonAllowed: true, usersAddonPrice: 450,
    recordsIncluded: 5000000, recordsMaximum: 15000000, recordsAddonAllowed: true, recordsAddonPrice: 700,
    integrationsIncluded: 15, integrationsMaximum: 30, integrationsAddonAllowed: true, integrationsAddonPrice: 600,
    automationsIncluded: 20, customEntitiesIncluded: 5, dealsModuleEnabled: true,
    createdBy: ADMIN, createdDate: "01 Mar 2026", updatedBy: ADMIN, updatedDate: "01 Mar 2026" },
  { id: "sp-startup", planName: "Startup Plan", description: "Discounted entry for early-stage startups", planType: "Custom", status: "Active",
    monthlyPrice: 1499, yearlyPrice: 14990, billingFrequencies: ["Monthly", "Yearly"],
    usersIncluded: 3, usersMaximum: 8, usersAddonAllowed: true, usersAddonPrice: 600,
    recordsIncluded: 50000, recordsMaximum: 500000, recordsAddonAllowed: true, recordsAddonPrice: 1200,
    integrationsIncluded: 2, integrationsMaximum: 5, integrationsAddonAllowed: true, integrationsAddonPrice: 900,
    automationsIncluded: 0, customEntitiesIncluded: 0, dealsModuleEnabled: false,
    createdBy: "Luv", createdDate: "10 Mar 2026", updatedBy: "Luv", updatedDate: "10 Mar 2026" },
  { id: "sp-legacy", planName: "Legacy Plan", description: "Grandfathered pricing for early adopters", planType: "Custom", status: "Inactive",
    monthlyPrice: 4167, yearlyPrice: 41670, billingFrequencies: ["Monthly", "Yearly"],
    usersIncluded: 10, usersMaximum: 15, usersAddonAllowed: false, usersAddonPrice: 0,
    recordsIncluded: 200000, recordsMaximum: 500000, recordsAddonAllowed: false, recordsAddonPrice: 0,
    integrationsIncluded: 5, integrationsMaximum: 10, integrationsAddonAllowed: false, integrationsAddonPrice: 0,
    automationsIncluded: 5, customEntitiesIncluded: 1, dealsModuleEnabled: true,
    createdBy: ADMIN, createdDate: "01 Jan 2025", updatedBy: ADMIN, updatedDate: "01 Jun 2025" },
];

// Blank plan template for creation
export const BLANK_PLAN = {
  planName: "", description: "", planType: "Custom", status: "Active", monthlyPrice: 0, yearlyPrice: 0, billingFrequencies: ["Monthly", "Yearly"],
  // Published-plan fields — a reusable template: included/maximum + optional overage addon per resource.
  usersIncluded: 1, usersMaximum: 10, usersAddonAllowed: false, usersAddonPrice: 0,
  recordsIncluded: 100000, recordsMaximum: 500000, recordsAddonAllowed: false, recordsAddonPrice: 0,
  integrationsIncluded: 1, integrationsMaximum: 5, integrationsAddonAllowed: false, integrationsAddonPrice: 0,
  automationsIncluded: 0, customEntitiesIncluded: 0, dealsModuleEnabled: false,
  // Resource-builder fields — every resource priced per-unit (both plan types build price this way).
  recordsPerUnit: 100000, recordsUnitsAllowed: 5, recordsUnitPrice: 0,
  automationsPerUnit: 100, automationsUnitsAllowed: 0, automationsUnitPrice: 0, automationsAddonAllowed: false,
  customEntitiesUnitPrice: 0, customEntitiesAddonAllowed: false,
  storageIncluded: 0, storageUnitPrice: 0, storageAddonAllowed: false,
  integrationsList: [],
  yearlyDiscountPct: 0, dealsModulePrice: 0,
};

// Per-resource pricing rows for the Custom-plan builder: every resource is priced as
// qty (units allowed) × unit price. `perUnit` is purely descriptive for resources that are
// sold in batches (e.g. records/automations bundled N-per-unit) — it doesn't affect the math.
export const CUSTOM_RESOURCES = [
  { key: "users", label: "Users", icon: Users, unit: "per user / mo",
    qtyK: "usersIncluded", qtyLabel: "Number of Users", priceK: "usersAddonPrice", enableK: "usersAddonAllowed" },
  { key: "records", label: "Records", icon: Database, unit: "per unit / mo",
    perUnit: { k: "recordsPerUnit", label: "Records per Unit" },
    qtyK: "recordsUnitsAllowed", qtyLabel: "Units Allowed", priceK: "recordsUnitPrice", enableK: "recordsAddonAllowed" },
  { key: "automations", label: "Automations", icon: Bot, unit: "per unit / mo",
    perUnit: { k: "automationsPerUnit", label: "Automations per Unit" },
    qtyK: "automationsUnitsAllowed", qtyLabel: "Units Allowed", priceK: "automationsUnitPrice", enableK: "automationsAddonAllowed" },
  { key: "entities", label: "Custom Entities", icon: Package, unit: "per entity slot / mo",
    qtyK: "customEntitiesIncluded", qtyLabel: "Entity Slots Allowed", priceK: "customEntitiesUnitPrice", enableK: "customEntitiesAddonAllowed" },
  { key: "storage", label: "Storage", icon: Server, unit: "per GB / mo",
    qtyK: "storageIncluded", qtyLabel: "Storage Allowed (GB)", priceK: "storageUnitPrice", enableK: "storageAddonAllowed" },
];
export const INTEGRATION_OPTIONS = ["Website", "CarWale", "CarDekho", "WhatsApp", "Facebook Ads", "Google Ads", "Instagram", "Custom API"];

/* Addon Pricing — global defaults */
export const SEED_ADDON_PRICING = [
  { id: "addon-users", addonType: "Users", pricePerUnit: 500, minimum: 1, maximum: 100, enabled: true, description: "Additional user seats per month" },
  { id: "addon-records", addonType: "Records", pricePerUnit: 1000, minimum: 1, maximum: 50, enabled: true, description: "Additional 1 lakh records per unit" },
  { id: "addon-integrations", addonType: "Integrations", pricePerUnit: 800, minimum: 1, maximum: 20, enabled: true, description: "Additional integration slots per month" },
];

/* Subscriptions — company → plan assignments with pricing snapshot */
export const SEED_SUBSCRIPTIONS = [
  { id: "sub-001", companyId: 3, companyName: "MedLinks", planId: "sp-hospital", planName: "Hospital Package", billingCycle: "Monthly", status: "Active", startDate: "01 Feb 2026", renewalDate: "01 Jun 2026", isTrial: false, trialEnd: null,
    basePrice: 16250, addons: [{ type: "Users", quantity: 5, unitPrice: 450, total: 2250 }], discount: { type: "Flat", value: 2500, reason: "Early adopter", appliedBy: ADMIN, appliedDate: "01 Feb 2026" },
    subtotal: 18500, finalPrice: 16000, createdBy: ADMIN, createdDate: "01 Feb 2026", notes: "Flagship clinic partner" },
  { id: "sub-002", companyId: 5, companyName: "Dermalife", planId: "sp-growth", planName: "Growth", billingCycle: "Monthly", status: "Active", startDate: "01 Mar 2026", renewalDate: "01 Jun 2026", isTrial: false, trialEnd: null,
    basePrice: 7999, addons: [{ type: "Records", quantity: 5, unitPrice: 800, total: 4000 }, { type: "Users", quantity: 3, unitPrice: 500, total: 1500 }], discount: { type: "Percentage", value: 10, reason: "Volume deal", appliedBy: "Luv", appliedDate: "01 Mar 2026" },
    subtotal: 13499, finalPrice: 12149, createdBy: "Luv", createdDate: "01 Mar 2026", notes: "" },
  { id: "sub-003", companyId: 6, companyName: "Varun Group", planId: "sp-enterprise", planName: "Enterprise", billingCycle: "Monthly", status: "Active", startDate: "15 Feb 2026", renewalDate: "15 Jun 2026", isTrial: false, trialEnd: null,
    basePrice: 350000, addons: [], discount: { type: "Flat", value: 50000, reason: "Strategic partnership", appliedBy: ADMIN, appliedDate: "15 Feb 2026" },
    subtotal: 350000, finalPrice: 300000, createdBy: ADMIN, createdDate: "15 Feb 2026", notes: "Multi-brand dealership" },
  { id: "sub-004", companyId: 9, companyName: "Evinces Ventures", planId: "sp-starter", planName: "Starter", billingCycle: "Monthly", status: "Trial", startDate: "18 May 2026", renewalDate: "01 Jul 2026", isTrial: true, trialEnd: "01 Jun 2026",
    basePrice: 0, addons: [], discount: { type: "Flat", value: 0, reason: "", appliedBy: "", appliedDate: "" },
    subtotal: 0, finalPrice: 0, createdBy: "Vishal", createdDate: "18 May 2026", notes: "14-day trial" },
  { id: "sub-005", companyId: 8, companyName: "Inside Edge Learning", planId: "sp-growth", planName: "Growth", billingCycle: "Yearly", status: "Active", startDate: "01 Jan 2026", renewalDate: "01 Jan 2027", isTrial: false, trialEnd: null,
    basePrice: 79990, addons: [{ type: "Users", quantity: 20, unitPrice: 500, total: 10000 }], discount: { type: "Percentage", value: 5, reason: "Annual commitment", appliedBy: "Vishal", appliedDate: "01 Jan 2026" },
    subtotal: 89990, finalPrice: 85490, createdBy: "Vishal", createdDate: "01 Jan 2026", notes: "Education sector" },
];

/* History / Audit */
export const SEED_HISTORY = [
  { id: 1, entityType: "Plan", entityId: "sp-growth", action: "Price updated", prev: { monthlyPrice: 6999 }, next: { monthlyPrice: 7999 }, changedBy: ADMIN, changedDate: "15 Mar 2026", reason: "Annual price revision" },
  { id: 2, entityType: "Subscription", entityId: "sub-001", action: "Addon added", prev: { addons: [] }, next: { addons: [{ type: "Users", quantity: 5 }] }, changedBy: ADMIN, changedDate: "10 Mar 2026", reason: "Team expansion" },
  { id: 3, entityType: "Plan", entityId: "sp-legacy", action: "Status changed", prev: { status: "Active" }, next: { status: "Inactive" }, changedBy: ADMIN, changedDate: "01 Jun 2025", reason: "Sunset legacy pricing" },
  { id: 4, entityType: "Subscription", entityId: "sub-003", action: "Discount applied", prev: { discount: { value: 0 } }, next: { discount: { value: 50000 } }, changedBy: ADMIN, changedDate: "15 Feb 2026", reason: "Strategic partnership" },
  { id: 5, entityType: "Tenant", entityId: 15, action: "Status changed", prev: { status: "Active" }, next: { status: "Suspended" }, changedBy: "Saif Khan", changedDate: "18 Apr 2026", reason: "Repeated payment failures" },
];

export const SEED_PLAYBOOKS = [
  {
    id: "pb-1", name: "High Risk — Immediate Intervention", description: "Rapid-response sequence for accounts at High churn risk, regardless of industry.",
    riskTier: "High", industry: "All", status: "Active",
    steps: [
      { id: "pb-1-s1", title: "Intro call", type: "Call", slaDays: 1 },
      { id: "pb-1-s2", title: "Send product value summary", type: "Email", slaDays: 2 },
      { id: "pb-1-s3", title: "Schedule health review demo", type: "Demo", slaDays: 4 },
      { id: "pb-1-s4", title: "Internal escalation if no response", type: "Internal Escalation", slaDays: 6 },
      { id: "pb-1-s5", title: "Follow-up call", type: "Call", slaDays: 8 },
    ],
  },
  {
    id: "pb-2", name: "Medium Risk — Nurture Sequence", description: "Lower-touch nurture cadence for Medium risk accounts across all industries.",
    riskTier: "Medium", industry: "All", status: "Active",
    steps: [
      { id: "pb-2-s1", title: "Check-in call", type: "Call", slaDays: 3 },
      { id: "pb-2-s2", title: "Share case study relevant to industry", type: "Email", slaDays: 5 },
      { id: "pb-2-s3", title: "Offer training session", type: "Demo", slaDays: 10 },
    ],
  },
  {
    id: "pb-3", name: "Automotive Churn Recovery", description: "Automotive-specific recovery playbook — leans on lead-feed health and Brand CEO escalation.",
    riskTier: "High", industry: "Automotive", status: "Active",
    steps: [
      { id: "pb-3-s1", title: "Emergency call with Brand CEO", type: "Call", slaDays: 1 },
      { id: "pb-3-s2", title: "Lead feed audit", type: "Internal Escalation", slaDays: 2 },
      { id: "pb-3-s3", title: "Reconnect CarWale/CarDekho", type: "Other", slaDays: 3 },
      { id: "pb-3-s4", title: "ROI recap email", type: "Email", slaDays: 5 },
      { id: "pb-3-s5", title: "Executive escalation if still at risk", type: "Internal Escalation", slaDays: 7 },
    ],
  },
];

export const SEED_TENANT_TASKS = [
  // Rezoni — High Risk — Immediate Intervention (1-2 Done, 3 In Progress, 4-5 Open)
  { id: "tt-1", tenantId: 1, tenantName: "Rezoni", playbookId: "pb-1", playbookName: "High Risk — Immediate Intervention", stepId: "pb-1-s1", title: "Intro call", description: "", type: "Call", status: "Done", assignedTo: "Saif Sir", dueDate: "06 May 2026", completedDate: "06 May 2026", skipNote: "", notes: "" },
  { id: "tt-2", tenantId: 1, tenantName: "Rezoni", playbookId: "pb-1", playbookName: "High Risk — Immediate Intervention", stepId: "pb-1-s2", title: "Send product value summary", description: "", type: "Email", status: "Done", assignedTo: "Saif Sir", dueDate: "08 May 2026", completedDate: "08 May 2026", skipNote: "", notes: "" },
  { id: "tt-3", tenantId: 1, tenantName: "Rezoni", playbookId: "pb-1", playbookName: "High Risk — Immediate Intervention", stepId: "pb-1-s3", title: "Schedule health review demo", description: "", type: "Demo", status: "In Progress", assignedTo: "Saif Sir", dueDate: "10 May 2026", completedDate: null, skipNote: "", notes: "" },
  { id: "tt-4", tenantId: 1, tenantName: "Rezoni", playbookId: "pb-1", playbookName: "High Risk — Immediate Intervention", stepId: "pb-1-s4", title: "Internal escalation if no response", description: "", type: "Internal Escalation", status: "Open", assignedTo: "Saif Sir", dueDate: "12 May 2026", completedDate: null, skipNote: "", notes: "" },
  { id: "tt-5", tenantId: 1, tenantName: "Rezoni", playbookId: "pb-1", playbookName: "High Risk — Immediate Intervention", stepId: "pb-1-s5", title: "Follow-up call", description: "", type: "Call", status: "Open", assignedTo: "Saif Sir", dueDate: "14 May 2026", completedDate: null, skipNote: "", notes: "" },
  // Varun Group — Automotive Churn Recovery (1 Done, 2 In Progress, rest Open)
  { id: "tt-6", tenantId: 6, tenantName: "Varun Group", playbookId: "pb-3", playbookName: "Automotive Churn Recovery", stepId: "pb-3-s1", title: "Emergency call with Brand CEO", description: "", type: "Call", status: "Done", assignedTo: "Saif Sir", dueDate: "06 May 2026", completedDate: "06 May 2026", skipNote: "", notes: "" },
  { id: "tt-7", tenantId: 6, tenantName: "Varun Group", playbookId: "pb-3", playbookName: "Automotive Churn Recovery", stepId: "pb-3-s2", title: "Lead feed audit", description: "", type: "Internal Escalation", status: "In Progress", assignedTo: "Saif Sir", dueDate: "08 May 2026", completedDate: null, skipNote: "", notes: "" },
  { id: "tt-8", tenantId: 6, tenantName: "Varun Group", playbookId: "pb-3", playbookName: "Automotive Churn Recovery", stepId: "pb-3-s3", title: "Reconnect CarWale/CarDekho", description: "", type: "Other", status: "Open", assignedTo: "Saif Sir", dueDate: "09 May 2026", completedDate: null, skipNote: "", notes: "" },
  { id: "tt-9", tenantId: 6, tenantName: "Varun Group", playbookId: "pb-3", playbookName: "Automotive Churn Recovery", stepId: "pb-3-s4", title: "ROI recap email", description: "", type: "Email", status: "Open", assignedTo: "Saif Sir", dueDate: "11 May 2026", completedDate: null, skipNote: "", notes: "" },
  { id: "tt-10", tenantId: 6, tenantName: "Varun Group", playbookId: "pb-3", playbookName: "Automotive Churn Recovery", stepId: "pb-3-s5", title: "Executive escalation if still at risk", description: "", type: "Internal Escalation", status: "Open", assignedTo: "Saif Sir", dueDate: "13 May 2026", completedDate: null, skipNote: "", notes: "" },
  // Dermalife — Medium Risk — Nurture Sequence (all Open, all overdue)
  { id: "tt-11", tenantId: 5, tenantName: "Dermalife", playbookId: "pb-2", playbookName: "Medium Risk — Nurture Sequence", stepId: "pb-2-s1", title: "Check-in call", description: "", type: "Call", status: "Open", assignedTo: "Saif Sir", dueDate: "05 May 2026", completedDate: null, skipNote: "", notes: "" },
  { id: "tt-12", tenantId: 5, tenantName: "Dermalife", playbookId: "pb-2", playbookName: "Medium Risk — Nurture Sequence", stepId: "pb-2-s2", title: "Share case study relevant to industry", description: "", type: "Email", status: "Open", assignedTo: "Saif Sir", dueDate: "07 May 2026", completedDate: null, skipNote: "", notes: "" },
  { id: "tt-13", tenantId: 5, tenantName: "Dermalife", playbookId: "pb-2", playbookName: "Medium Risk — Nurture Sequence", stepId: "pb-2-s3", title: "Offer training session", description: "", type: "Demo", status: "Open", assignedTo: "Saif Sir", dueDate: "10 May 2026", completedDate: null, skipNote: "", notes: "" },
  // Mahakumbh Motors — High Risk — Immediate Intervention (task 1 only, due today)
  { id: "tt-14", tenantId: 15, tenantName: "Mahakumbh Motors", playbookId: "pb-1", playbookName: "High Risk — Immediate Intervention", stepId: "pb-1-s1", title: "Intro call", description: "", type: "Call", status: "Open", assignedTo: "Saif Sir", dueDate: "13 May 2026", completedDate: null, skipNote: "", notes: "" },
];

export const SEED_CONTACT_LOGS = [
  { id: "cl-001", tenantId: 1, tenantName: "Rezoni", type: "Call", outcome: "Negative", notes: "No response from admin, voicemail left", loggedBy: "Saif Sir", loggedDate: "08 May 2026" },
  { id: "cl-002", tenantId: 6, tenantName: "Varun Group", type: "Call", outcome: "Neutral", notes: "Spoke with Arjun — aware of feed issues, waiting on CarWale support", loggedBy: "Saif Sir", loggedDate: "10 May 2026" },
  { id: "cl-003", tenantId: 5, tenantName: "Dermalife", type: "Email", outcome: "Neutral", notes: "Sent usage report and renewal reminder", loggedBy: "Saif Sir", loggedDate: "11 May 2026" },
];

/* ============================================================
   PRICING ENGINE — pure functions, centralized
   ============================================================ */
export const PricingEngine = {
  getBasePrice(plan, cycle) {
    return cycle === "Yearly" ? (plan.yearlyPrice || 0) : (plan.monthlyPrice || 0);
  },
  calcAddonTotal(addons) {
    return (addons || []).reduce((sum, a) => sum + (a.quantity || 0) * (a.unitPrice || 0), 0);
  },
  calcSubtotal(basePrice, addons) {
    return basePrice + PricingEngine.calcAddonTotal(addons);
  },
  applyDiscount(subtotal, discount) {
    if (!discount || !discount.value) return subtotal;
    if (discount.type === "Percentage") return Math.max(0, subtotal - Math.round(subtotal * discount.value / 100));
    return Math.max(0, subtotal - discount.value);
  },
  calcFinalPrice(plan, cycle, addons, discount) {
    const base = PricingEngine.getBasePrice(plan, cycle);
    const sub = PricingEngine.calcSubtotal(base, addons);
    return { basePrice: base, addonTotal: PricingEngine.calcAddonTotal(addons), subtotal: sub, finalPrice: PricingEngine.applyDiscount(sub, discount), discountAmount: sub - PricingEngine.applyDiscount(sub, discount) };
  },
  preview(plan, cycle, addons, discount) {
    const r = PricingEngine.calcFinalPrice(plan, cycle, addons, discount);
    return { ...r, plan, cycle, addons, discount };
  },
};
