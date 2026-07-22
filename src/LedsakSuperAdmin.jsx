import React, { useState, useMemo, useContext, createContext, useCallback } from "react";
import {
  LayoutDashboard, Store, Users, CreditCard, TrendingUp, HeartHandshake,
  Database, Bot, Sparkles, Plug, Send, BarChart3, Layers, ListChecks,
  Activity, ShieldCheck, Headset, LayoutTemplate, Settings, Search,
  Bell, HelpCircle, ChevronUp, ChevronDown, Download, Calendar, LayoutGrid,
  ArrowUpRight, ArrowDownRight, AlertTriangle, CircleCheck, Zap, RefreshCw,
  Filter, MoreHorizontal, Plus, ChevronRight, TriangleAlert, Wifi, Server,
  Mail, MessageSquare, Phone, Key, Lock, UserCheck, UserPlus, Clock,
  FileText, Target, Building2, Stethoscope, GraduationCap, ShoppingCart,
  Car, CheckCircle2, XCircle, Eye, Pencil, Globe, ArrowRight, PhoneCall,
  Inbox, PlayCircle, PauseCircle, GitBranch, ArrowLeft, Rocket, Ban,
  Power, LogIn, X, Check, TrendingDown, CircleDot, Flag, Briefcase,
  Copy, Archive, Trash2, Hash, IndianRupee, Package, Percent, Tag,
  History, DollarSign, BarChart2, PieChart, Receipt, UserCog, LogOut,
  PanelLeftClose, PanelLeft, GripVertical, ArrowUpDown, Star, RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import ledsakLogo from "./assets/ledsak-logo.svg";

const T = {
  primary: "#295FB2", primaryDark: "#1E4A8F", primarySoft: "#EEF2FF", accentText: "#3451D1",
  sidebar: "#295FB2", sidebarHover: "#1E4A8F", sidebarText: "#E8EEFA", sidebarMuted: "#DDE6F7",
  bg: "#F5F6FA", surface: "#FFFFFF", subtle: "#F8F9FC", border: "#E4E7F0", borderStrong: "#CBD2E4",
  text: "#1A1F36", text2: "#5A6275", text3: "#8B95A8", ring: "#4A6CF7",
  success: "#10B981", successSoft: "#E6F7EF", warning: "#F59E0B", warningSoft: "#FEF3C7",
  danger: "#DC2626", dangerSoft: "#FEE2E2", purple: "#8B5CF6", purpleSoft: "#EDE9FE",
};

/* ============================================================
   DATA
   ============================================================ */
const STATS = { total: 564, subscribed: 56, free: 509, blocked: 5, onboarded: 317, leads: 869241, aiUsed: 483, paidCt: 51, mrr: 312079, arr: 3744948 };
const SEED_CLIENTS = [
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
const ONBOARD_STAGES = ["Kickoff", "Configuring", "Data Import", "Training", "Go-Live"];
const ONBOARD_OWNERS = ["Saif Sir", "Luv", "Vishal"];
const CHECKLIST_TEMPLATE = [
  { id: "t1", label: "Kickoff call completed", stage: "Kickoff" },
  { id: "t2", label: "Scope document signed off", stage: "Kickoff" },
  { id: "t3", label: "Tenant created & plan assigned", stage: "Configuring" },
  { id: "t4", label: "4-tier hierarchy configured", stage: "Configuring" },
  { id: "t5", label: "Lead providers connected", stage: "Configuring" },
  { id: "t6", label: "Routing & automation rules set", stage: "Configuring" },
  { id: "t7", label: "Existing leads imported", stage: "Data Import" },
  { id: "t8", label: "Data validation completed", stage: "Data Import" },
  { id: "t9", label: "Team Lead training done", stage: "Training" },
  { id: "t10", label: "Telecaller training done", stage: "Training" },
  { id: "t11", label: "QA sign-off checklist passed", stage: "Go-Live" },
  { id: "t12", label: "Go-live sign-off received ✦ required", stage: "Go-Live" },
];
const GOLIVE_REQUIRED_TASKS = ["t11", "t12"];
const mkChecklist = (doneIds = []) => CHECKLIST_TEMPLATE.map((t) => ({ ...t, completed: doneIds.includes(t.id) }));
const SEED_ONBOARDING = [
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
const ONBOARD_STORAGE_KEY = "ledsak_onboarding_v2";
const loadOnboarding = () => { try { const s = localStorage.getItem(ONBOARD_STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; } };
const saveOnboarding = (data) => { try { localStorage.setItem(ONBOARD_STORAGE_KEY, JSON.stringify(data)); } catch {} };
const SEED_INVOICES = [
  { id: "INV-2451", client: "MedLinks", amt: 16250, status: "Paid", date: "01 May 2026", method: "UPI" },
  { id: "INV-2452", client: "Dermalife", amt: 12500, status: "Pending", date: "03 May 2026", method: "Bank" },
  { id: "INV-2453", client: "Rezoni", amt: 4167, status: "Failed", date: "05 May 2026", method: "Card", failReason: "Card declined" },
  { id: "INV-2454", client: "Aryaanya Group", amt: 8333, status: "Paid", date: "06 May 2026", method: "UPI" },
  { id: "INV-2455", client: "Varun Group", amt: 12500, status: "Pending", date: "08 May 2026", method: "Bank" },
  { id: "INV-2456", client: "Mahakumbh Motors", amt: 5000, status: "Failed", date: "09 May 2026", method: "Card", failReason: "Insufficient funds" },
];
const SEED_USERS = [
  { id: 1, name: "Rahul Mehta", email: "rahul@medlinks.in", tenant: "MedLinks", role: "Team Lead", status: "Active", last: "2 min ago" },
  { id: 2, name: "Priya Sharma", email: "priya@dermapuritys.com", tenant: "Derma Purtitys", role: "Telecaller", status: "Active", last: "18 min ago" },
  { id: 3, name: "Arjun Nair", email: "arjun@varungroup.in", tenant: "Varun Group", role: "Brand CEO", status: "Active", last: "1 hr ago" },
  { id: 4, name: "Sneha Kapoor", email: "sneha@rezoni.com", tenant: "Rezoni", role: "Admin (CMO)", status: "Suspended", last: "5 days ago" },
  { id: 5, name: "Vikram Singh", email: "vikram@urbanauto.in", tenant: "Urban Autohub", role: "Telecaller", status: "Active", last: "40 min ago" },
  { id: 6, name: "Anita Desai", email: "anita@aryaanya.com", tenant: "Aryaanya Group", role: "Team Lead", status: "Invited", last: "—" },
];
const SEED_TICKETS = [
  { id: "TKT-812", subj: "Lead sync stopped from CarWale", tenant: "Varun Group", pri: "High", status: "Open", age: "2h", owner: "Saif Sir" },
  { id: "TKT-811", subj: "Cannot add telecaller seats", tenant: "MedLinks", pri: "Medium", status: "Open", age: "5h", owner: "Luv" },
  { id: "TKT-809", subj: "Invoice GST number update", tenant: "Aryaanya Group", pri: "Low", status: "Pending", age: "1d", owner: "Vishal" },
  { id: "TKT-806", subj: "WhatsApp template rejected", tenant: "Derma Purtitys", pri: "Medium", status: "Open", age: "1d", owner: "Luv" },
  { id: "TKT-802", subj: "Export missing columns", tenant: "Inside Edge Learning", pri: "Low", status: "Resolved", age: "3d", owner: "Vishal" },
];
const SEED_NOTIFS = [
  { id: 1, icon: "danger", title: "CarWale feed down for Varun Group", time: "12 min ago", read: false, page: "integrations" },
  { id: 2, icon: "warning", title: "3 plans expiring within 30 days", time: "1 hr ago", read: false, page: "cs" },
  { id: 3, icon: "danger", title: "Payment failed — Rezoni (₹4,167)", time: "2 hr ago", read: false, page: "billing" },
  { id: 4, icon: "success", title: "Glow Aesthetics reached Go-Live", time: "4 hr ago", read: true, page: "onboarding" },
  { id: 5, icon: "info", title: "TKT-812 assigned to you", time: "5 hr ago", read: true, page: "support" },
];
const PLAN_DIST = [
  { plan: "Business Quarterly", clients: 11, mrr: 23837 }, { plan: "WADHWANI SPECIAL", clients: 7, mrr: 70000 },
  { plan: "Dermapuritys", clients: 7, mrr: 58331 }, { plan: "PREMIUM", clients: 5, mrr: 39995 },
  { plan: "Aryaanya Custom", clients: 3, mrr: 24999 }, { plan: "AXTEN SPECIAL", clients: 2, mrr: 25000 },
];
const MRR_TREND = [
  { m: "Dec", v: 258500 }, { m: "Jan", v: 272000 }, { m: "Feb", v: 285200 },
  { m: "Mar", v: 293400 }, { m: "Apr", v: 305700 }, { m: "May", v: STATS.mrr },
];

/* ============================================================
   PLAN MODEL — full schema per spec
   ============================================================ */
const makePlanId = () => "plan-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const NOW = "13 May 2026";
const ADMIN = "Saif Khan";

const SEED_SP_PLANS = [
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
const BLANK_PLAN = {
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
const CUSTOM_RESOURCES = [
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
const INTEGRATION_OPTIONS = ["Website", "CarWale", "CarDekho", "WhatsApp", "Facebook Ads", "Google Ads", "Instagram", "Custom API"];

/* Addon Pricing — global defaults */
const SEED_ADDON_PRICING = [
  { id: "addon-users", addonType: "Users", pricePerUnit: 500, minimum: 1, maximum: 100, enabled: true, description: "Additional user seats per month" },
  { id: "addon-records", addonType: "Records", pricePerUnit: 1000, minimum: 1, maximum: 50, enabled: true, description: "Additional 1 lakh records per unit" },
  { id: "addon-integrations", addonType: "Integrations", pricePerUnit: 800, minimum: 1, maximum: 20, enabled: true, description: "Additional integration slots per month" },
];

/* Subscriptions — company → plan assignments with pricing snapshot */
const SEED_SUBSCRIPTIONS = [
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
const SEED_HISTORY = [
  { id: 1, entityType: "Plan", entityId: "sp-growth", action: "Price updated", prev: { monthlyPrice: 6999 }, next: { monthlyPrice: 7999 }, changedBy: ADMIN, changedDate: "15 Mar 2026", reason: "Annual price revision" },
  { id: 2, entityType: "Subscription", entityId: "sub-001", action: "Addon added", prev: { addons: [] }, next: { addons: [{ type: "Users", quantity: 5 }] }, changedBy: ADMIN, changedDate: "10 Mar 2026", reason: "Team expansion" },
  { id: 3, entityType: "Plan", entityId: "sp-legacy", action: "Status changed", prev: { status: "Active" }, next: { status: "Inactive" }, changedBy: ADMIN, changedDate: "01 Jun 2025", reason: "Sunset legacy pricing" },
  { id: 4, entityType: "Subscription", entityId: "sub-003", action: "Discount applied", prev: { discount: { value: 0 } }, next: { discount: { value: 50000 } }, changedBy: ADMIN, changedDate: "15 Feb 2026", reason: "Strategic partnership" },
  { id: 5, entityType: "Tenant", entityId: 15, action: "Status changed", prev: { status: "Active" }, next: { status: "Suspended" }, changedBy: "Saif Khan", changedDate: "18 Apr 2026", reason: "Repeated payment failures" },
];

/* ============================================================
   CUSTOMER SUCCESS — playbooks & tenant tasks
   ============================================================ */
const STEP_TYPES = ["Call", "Email", "Demo", "Internal Escalation", "Other"];
const STEP_TYPE_ICON = { Call: PhoneCall, Email: Mail, Demo: PlayCircle, "Internal Escalation": TriangleAlert, Other: Flag };
const PLAYBOOK_RISK_TIERS = ["High", "Medium", "Both"];
const PLAYBOOK_INDUSTRIES = ["All", "Automotive", "Clinic", "Education", "Ecommerce", "Other"];
const RENEWAL_STATUSES = ["Not Started", "In Negotiation", "Confirmed", "At Risk"];
const TASK_STATUSES = ["Open", "In Progress", "Done", "Skipped"];

// Dates in this module are stored as "DD Mon YYYY" strings (matching the rest of the seed
// data). Parsed/formatted by hand rather than via `new Date(string)` so overdue/renewal math
// doesn't depend on the host engine's lenient date-string parsing.
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const parseTaskDate = (s) => {
  if (!s) return null;
  const [dd, mon, yyyy] = s.split(" ");
  const mIdx = MONTHS_SHORT.indexOf(mon);
  if (mIdx === -1) return null;
  return new Date(Number(yyyy), mIdx, Number(dd));
};
const fmtTaskDate = (d) => `${String(d.getDate()).padStart(2, "0")} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
const TODAY = parseTaskDate(NOW);
const isTaskOverdue = (t) => t.status !== "Done" && t.status !== "Skipped" && isOverdue(t.dueDate);

const SEED_PLAYBOOKS = [
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

const SEED_TENANT_TASKS = [
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

const SEED_CONTACT_LOGS = [
  { id: "cl-001", tenantId: 1, tenantName: "Rezoni", type: "Call", outcome: "Negative", notes: "No response from admin, voicemail left", loggedBy: "Saif Sir", loggedDate: "08 May 2026" },
  { id: "cl-002", tenantId: 6, tenantName: "Varun Group", type: "Call", outcome: "Neutral", notes: "Spoke with Arjun — aware of feed issues, waiting on CarWale support", loggedBy: "Saif Sir", loggedDate: "10 May 2026" },
  { id: "cl-003", tenantId: 5, tenantName: "Dermalife", type: "Email", outcome: "Neutral", notes: "Sent usage report and renewal reminder", loggedBy: "Saif Sir", loggedDate: "11 May 2026" },
];

/* ============================================================
   PRICING ENGINE — pure functions, centralized
   ============================================================ */
const PricingEngine = {
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

const fmtINR = (n) => "₹" + Number(n).toLocaleString("en-IN");
const fmtLakh = (n) => "₹" + (n / 100000).toFixed(1) + "L";
const fmtK = (n) => (n / 1000).toFixed(0) + "K";
const fmtRecords = (n) => n >= 100000 ? (n / 100000) + " lakh" : n.toLocaleString("en-IN");

// Unified date parser — handles both "DD-MM-YYYY" (planEnd) and "DD Mon YYYY" (task/contact
// log dates) that appear across the seed data, falling back to a lenient Date parse for
// anything else.
const parseDate = (s) => {
  if (!s) return null;
  const parts = s.split("-");
  if (parts.length === 3 && parts[2].length === 4) {
    return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  }
  const match = s.match(/^(\d{1,2})\s+(\w{3})\s+(\d{4})$/);
  if (match) return new Date(+match[3], MONTHS_SHORT.indexOf(match[2]), +match[1]);
  return new Date(s);
};
// Built from the same local-time constructor as parseDate (rather than `new Date("2026-05-13")`)
// so day-boundary comparisons don't drift with the host's UTC offset.
const TODAY_DATE = new Date(2026, 4, 13);
const isOverdue = (dueDateStr) => { const d = parseDate(dueDateStr); return d && d < TODAY_DATE; };
const daysUntil = (dateStr) => { const d = parseDate(dateStr); if (!d) return null; return Math.round((d - TODAY_DATE) / 864e5); };
// Shared by assignPlaybookToTenant and replaceTenantPlaybook so both build tasks identically.
const buildTasksFromPlaybook = (tenant, playbook) => playbook.steps.map((step) => {
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
const nextId = () => ++_id;

/* ============================================================
   STORE
   ============================================================ */
const StoreCtx = createContext(null);
const useStore = () => useContext(StoreCtx);

function StoreProvider({ children }) {
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
const cx = (...a) => a.filter(Boolean).join(" ");

function Card({ className, style, onClick, children }) {
  return (
    <div onClick={onClick} className={cx("rounded-xl border bg-white", onClick && "cursor-pointer hover:shadow-md transition-shadow", className)}
      style={{ borderColor: T.border, boxShadow: "0 1px 3px rgba(26,31,54,.06), 0 1px 2px rgba(26,31,54,.04)", ...style }}>
      {children}
    </div>
  );
}
function CardHeader({ title, action, sub }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.border }}>
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight" style={{ color: T.text }}>{title}</h3>
        {sub && <p className="text-xs mt-0.5" style={{ color: T.text2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
const CardBody = ({ className, children }) => <div className={cx("px-5 py-4", className)}>{children}</div>;

function Button({ variant = "default", size = "md", className, style, children, ...p }) {
  const base = "inline-flex items-center gap-1.5 font-medium rounded-lg transition-all border select-none disabled:opacity-50";
  const sizes = { md: "px-3.5 py-2 text-[13px]", sm: "px-2.5 py-1.5 text-xs", icon: "w-9 h-9 justify-center p-0" };
  const variants = {
    default: { background: "#fff", color: T.text, borderColor: T.border },
    primary: { background: T.primary, color: "#fff", borderColor: T.primary, boxShadow: "0 1px 2px rgba(41,95,178,.25)" },
    ghost: { background: "transparent", color: T.text2, border: "1px solid transparent" },
    danger: { background: "#fff", color: T.danger, borderColor: "#F3C6C6" },
  };
  return (
    <button {...p} className={cx(base, sizes[size], "hover:brightness-[.97]", className)} style={{ ...variants[variant], ...style }}>{children}</button>
  );
}

function Badge({ tone = "gray", children }) {
  const map = {
    success: [T.successSoft, "#065F46"], danger: [T.dangerSoft, "#991B1B"], warning: [T.warningSoft, "#92400E"],
    info: [T.primarySoft, T.accentText], purple: [T.purpleSoft, "#5B21B6"], gray: ["#F0F1F4", "#4B5563"], brand: [T.primarySoft, T.accentText],
  };
  const [bg, fg] = map[tone] || map.gray;
  return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: bg, color: fg }}>{children}</span>;
}

function Avatar({ name, tone = "brand", size = 28 }) {
  const map = { brand: [T.primarySoft, T.accentText], green: [T.successSoft, "#065F46"], purple: [T.purpleSoft, "#5B21B6"] };
  const [bg, fg] = map[tone] || map.brand;
  return <div className="rounded-full flex items-center justify-center font-semibold shrink-0" style={{ width: size, height: size, fontSize: size * 0.4, background: bg, color: fg }}>{name.charAt(0).toUpperCase()}</div>;
}

function Progress({ value, tone, w = 70 }) {
  const color = tone || (value >= 75 ? T.success : value >= 50 ? T.warning : T.danger);
  return (
    <div className="inline-flex items-center gap-2">
      <div className="h-1.5 rounded-full overflow-hidden" style={{ width: w, background: "#E4E7F0" }}><div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} /></div>
      <span className="text-xs font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}

const RISK_TONE = { High: "danger", Medium: "warning", Low: "success" };
const STATUS_TONE = { Active: "success", Trial: "warning", Suspended: "danger", Churned: "danger", Paid: "success", Pending: "warning", Failed: "danger", Open: "danger", Resolved: "success", Invited: "warning" };
function statusBadge(s) { return <Badge tone={STATUS_TONE[s] || RISK_TONE[s] || "gray"}>{s}</Badge>; }
// Separate from statusBadge/STATUS_TONE — "Open" means something different (and not
// urgent) for a CS task than it does for a support ticket, so task statuses get their own tones.
const TASK_STATUS_TONE = { Open: "gray", "In Progress": "info", Done: "success", Skipped: "warning" };
function taskStatusBadge(s) { return <Badge tone={TASK_STATUS_TONE[s] || "gray"}>{s}</Badge>; }

function Kpi({ label, value, sub, trend }) {
  const c = trend === "pos" ? T.success : trend === "neg" ? T.danger : trend === "warn" ? T.warning : T.text2;
  const Ic = trend === "pos" ? ArrowUpRight : trend === "neg" ? ArrowDownRight : null;
  return (
    <div className="rounded-xl border bg-white transition-all hover:-translate-y-0.5" style={{ borderColor: T.border, boxShadow: "0 2px 8px rgba(26,31,54,.07)", padding: "20px 16px" }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>{label}</div>
      <div className="text-[28px] leading-none font-bold mt-2 tracking-tight" style={{ color: T.text }}>{value}</div>
      {sub && <div className="text-xs mt-2 flex items-center gap-1" style={{ color: c }}>{Ic && <Ic size={13} />}{sub}</div>}
    </div>
  );
}

// Table body scrolls internally, filling whatever height its flex parent gives it — the
// header row stays pinned via `sticky` so only the rows scroll, never the page itself.
// Pass `fill` (default) inside a `flex flex-col` Card sized by the page layout; pass
// `maxHeight` instead for standalone use outside a flex-fill container.
function Table({ head, children, maxHeight }) {
  return (
    <div className={cx("overflow-auto", !maxHeight && "flex-1 min-h-0")} style={{ maxHeight, minHeight: maxHeight ? 160 : undefined }}>
      <table className="w-full border-collapse text-[13px]">
        <thead><tr>{head.map((h, i) => (
          <th key={i} className="sticky top-0 z-10 text-left text-[11px] font-semibold uppercase tracking-wider px-3.5 py-2.5 border-b whitespace-nowrap" style={{ color: T.text3, borderColor: T.border, background: T.subtle }}>{h}</th>
        ))}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// Client-side pagination for list pages: slices `rows` into a page, resetting to page 1
// whenever the filtered row count or page size changes (new filters shouldn't strand you on page 4).
function usePagination(rows, initialPerPage = 10) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  React.useEffect(() => { setPage(1); }, [rows.length, perPage]);
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => rows.slice((safePage - 1) * perPage, safePage * perPage), [rows, safePage, perPage]);
  return { pageRows, page: safePage, setPage, perPage, setPerPage, totalPages, total: rows.length };
}

// Full pagination bar — results-per-page selector, row-range label, numbered pages, and
// (when a selection is active) a "Selected N" indicator, matching the product's own list UI.
function Pagination({ page, totalPages, setPage, perPage, setPerPage, total, selectedCount }) {
  const pageNumbers = useMemo(() => {
    const set = new Set([1, totalPages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= totalPages));
    return Array.from(set).sort((a, b) => a - b);
  }, [page, totalPages]);
  if (total === 0) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 flex-wrap gap-3" style={{ borderColor: T.border }}>
      <div className="flex items-center gap-3 text-[12px]" style={{ color: T.text2 }}>
        <div className="flex items-center gap-1.5">
          <span>Result Per Page</span>
          <div className="relative">
            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="appearance-none pl-2.5 pr-6 py-1 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: "#fff", color: T.text }}>
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
          </div>
        </div>
        {!!selectedCount && <span className="font-medium" style={{ color: T.primary }}>Selected {selectedCount}</span>}
        <span style={{ color: T.text3 }}>{from}–{to} of {total} shown</span>
      </div>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50" style={{ borderColor: T.border, color: T.text2 }}>
          <ChevronLeftIcon /> Prev
        </button>
        {pageNumbers.map((n, i) => (
          <React.Fragment key={n}>
            {i > 0 && n - pageNumbers[i - 1] > 1 && <span className="px-1 text-xs" style={{ color: T.text3 }}>…</span>}
            <button onClick={() => setPage(n)} className="w-7 h-7 rounded-md text-xs font-medium" style={n === page ? { background: T.primary, color: "#fff" } : { color: T.text2 }}>{n}</button>
          </React.Fragment>
        ))}
        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50" style={{ borderColor: T.border, color: T.text2 }}>
          Next <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
const ChevronLeftIcon = ({ size = 13 }) => <ChevronRight size={size} className="rotate-180" />;

// Closes a menu on outside click only — unlike onBlur+setTimeout, this doesn't fire while
// interacting with elements inside the menu itself (checkboxes, drill-in navigation, drag).
function useClickOutside(ref, onOutside) {
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onOutside(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

// Row-selection for bulk actions: tracks a Set of selected row ids scoped to the current
// (filtered) row list — selection auto-drops any id that filters out from under it.
function useRowSelection(pageRows, allRows, idKey = "id") {
  const [selected, setSelected] = useState(() => new Set());
  const lastClickedRef = React.useRef(null);
  const pageIds = useMemo(() => pageRows.map((r) => r[idKey]), [pageRows, idKey]);
  const allIds = useMemo(() => allRows.map((r) => r[idKey]), [allRows, idKey]);
  React.useEffect(() => {
    setSelected((s) => {
      const idSet = new Set(allIds);
      const next = new Set([...s].filter((id) => idSet.has(id)));
      return next.size === s.size ? s : next;
    });
  }, [allIds]);
  // Gmail-style shift-click: extends the selection across every row between the last
  // clicked checkbox and this one (within the current page), instead of just toggling one.
  // `prevClicked` is captured *before* calling setSelected (not mutated inside the updater)
  // so the range computation stays correct and idempotent even if the updater runs more
  // than once for a single click (React StrictMode double-invokes it in dev).
  const toggle = (id, opts) => {
    const prevClicked = lastClickedRef.current;
    lastClickedRef.current = id;
    setSelected((s) => {
      const n = new Set(s);
      if (opts?.shiftKey && prevClicked != null) {
        const lastIdx = pageIds.indexOf(prevClicked);
        const curIdx = pageIds.indexOf(id);
        if (lastIdx !== -1 && curIdx !== -1) {
          const [from, to] = lastIdx < curIdx ? [lastIdx, curIdx] : [curIdx, lastIdx];
          for (let i = from; i <= to; i++) n.add(pageIds[i]);
          return n;
        }
      }
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const selectPage = () => setSelected(new Set(pageIds));
  const selectAllFiltered = () => setSelected(new Set(allIds));
  const clear = () => setSelected(new Set());
  const toggleAll = () => (pageIds.every((id) => selected.has(id)) ? clear() : selectPage());
  const isAll = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  return { selected, toggle, toggleAll, selectPage, selectAllFiltered, clear, isAll, isSome: selected.size > 0, totalFiltered: allIds.length };
}

// Gmail hides row checkboxes until you hover the row (or it's already checked) — the parent
// <tr> needs className="group" for the reveal to work.
function RowCheckbox({ checked, onChange, indeterminate }) {
  const ref = React.useRef(null);
  const shiftRef = React.useRef(false);
  React.useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  // shiftKey only exists on the mousedown/click MouseEvent, not the change event, so it's
  // captured on mousedown and read back inside onChange. Letting onChange (not a
  // preventDefault-ed click) drive the toggle keeps the checkbox's native activation
  // behavior intact — calling preventDefault() on a checkbox's click desyncs React's
  // internal "tracked value" for that DOM node, silently breaking later controlled updates.
  return (
    <input ref={ref} type="checkbox" checked={checked}
      onMouseDown={(e) => { shiftRef.current = e.shiftKey; }}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e, shiftRef.current)}
      className="w-4 h-4 rounded cursor-pointer"
      style={{ accentColor: T.primary }} />
  );
}

// Star toggle for favoriting a row (Gmail-style), sits beside the row checkbox.
function StarToggle({ starred, onToggle }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="flex items-center justify-center p-0.5 rounded hover:bg-slate-100" title={starred ? "Unstar" : "Star"}>
      <Star size={15} fill={starred ? "#F59E0B" : "none"} style={{ color: starred ? "#F59E0B" : T.text3 }} />
    </button>
  );
}

// Select-all header control, Gmail-style: the checkbox itself toggles the current page,
// while the adjoining chevron opens a menu to select the page, everything matching the
// current filters, or to clear the selection entirely.
function SelectAllHeader({ sel }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex items-center gap-0.5">
      <RowCheckbox checked={sel.isAll} indeterminate={sel.isSome && !sel.isAll} onChange={sel.toggleAll} />
      <button onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} onBlur={() => setTimeout(() => setOpen(false), 200)} className="p-0.5 rounded hover:bg-slate-200" style={{ color: T.text3 }}>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-30 w-56 rounded-xl border bg-white shadow-xl py-1 normal-case font-normal" style={{ borderColor: T.border }} onMouseDown={(e) => e.stopPropagation()}>
          <button onMouseDown={() => { sel.selectPage(); setOpen(false); }} className="w-full flex items-center px-4 py-2 text-[13px] text-left hover:bg-slate-50" style={{ color: T.text }}>Select this page</button>
          <button onMouseDown={() => { sel.selectAllFiltered(); setOpen(false); }} className="w-full flex items-center px-4 py-2 text-[13px] text-left hover:bg-slate-50" style={{ color: T.text }}>Select all {sel.totalFiltered} that match filters</button>
          <button onMouseDown={() => { sel.clear(); setOpen(false); }} className="w-full flex items-center px-4 py-2 text-[13px] text-left hover:bg-slate-50" style={{ color: T.text }}>Clear selection</button>
        </div>
      )}
    </div>
  );
}

// Dropdown shown in place of the page's primary "Add" action once rows are selected.
function BulkActionsMenu({ count, onAction }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium text-white" style={{ background: T.primary }}>
        {count} selected <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-30 w-52 rounded-xl border bg-white shadow-xl py-1" style={{ borderColor: T.border }} onMouseDown={(e) => e.stopPropagation()}>
          <button onMouseDown={() => { onAction("whatsapp"); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-left hover:bg-slate-50" style={{ color: T.text }}><MessageSquare size={14} /> Bulk WhatsApp</button>
          <button onMouseDown={() => { onAction("email"); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-left hover:bg-slate-50" style={{ color: T.text }}><Mail size={14} /> Bulk Email</button>
        </div>
      )}
    </div>
  );
}
const Td = ({ className, style, children, colSpan }) => (
  <td colSpan={colSpan} className={cx("px-3.5 py-3 border-b align-middle", className)} style={{ borderColor: T.border, ...style }}>{children}</td>
);
function NameCell({ name, sub, tone, onClick, hideAvatar }) {
  return (
    <div className={cx("flex items-center gap-2.5", onClick && "cursor-pointer group")} onClick={onClick}>
      {!hideAvatar && <Avatar name={name} tone={tone} />}
      <div><div className={cx("font-medium", onClick && "group-hover:underline")} style={{ color: onClick ? T.primary : T.text }}>{name}</div>{sub && <div className="text-[11px]" style={{ color: T.text2 }}>{sub}</div>}</div>
    </div>
  );
}

function PageHeader({ title, desc, actions, back }) {
  return (
    <div className="flex justify-between items-start mb-5 gap-4 flex-wrap">
      <div>
        {back && <button onClick={back} className="flex items-center gap-1 text-[13px] mb-2 hover:underline" style={{ color: T.primary }}><ArrowLeft size={14} /> Back</button>}
        <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: T.text }}>{title}</h1>
        {desc && <p className="text-[13px] mt-1" style={{ color: T.text2 }}>{desc}</p>}
      </div>
      <div className="flex gap-2 flex-wrap">{actions}</div>
    </div>
  );
}

function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-0.5 border-b mb-4" style={{ borderColor: T.border }}>
      {tabs.map((t) => {
        const on = t === value;
        return <button key={t} onClick={() => onChange(t)} className="px-3.5 py-2.5 text-[13px] font-medium -mb-px border-b-2 transition-colors whitespace-nowrap"
          style={on ? { color: T.primary, borderColor: T.primary } : { color: T.text2, borderColor: "transparent" }}>{t}</button>;
      })}
    </div>
  );
}

function Field({ label, children }) {
  return <div><div className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>{label}</div><div className="text-[13px]" style={{ color: T.text }}>{children}</div></div>;
}

function Switch({ on, onClick }) {
  return (
    <button onClick={onClick} className="relative shrink-0 rounded-full transition-colors" style={{ width: 36, height: 20, background: on ? T.primary : "#CBD2E4" }}>
      <span className="absolute top-0.5 rounded-full bg-white transition-all" style={{ width: 16, height: 16, left: on ? 18 : 2, boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
    </button>
  );
}

function BarList({ rows, max, fmt }) {
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={i}>
          <div className="flex justify-between text-[11px] mb-1"><span style={{ color: T.text }}>{r.label}</span><span className="font-medium" style={{ color: T.text2 }}>{fmt ? fmt(r.value) : r.value}{r.note ? ` · ${r.note}` : ""}</span></div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#E4E7F0" }}><div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: r.color || T.primary }} /></div>
        </div>
      ))}
    </div>
  );
}

function BarChart({ data, max, fmt }) {
  return (
    <div className="flex items-end gap-2.5 h-40 px-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="text-[11px] font-semibold" style={{ color: T.text }}>{(fmt || fmtLakh)(d.v)}</div>
          <div className="w-full rounded-t transition-opacity hover:opacity-85" style={{ height: `${(d.v / max) * 100}%`, minHeight: 12, background: i === data.length - 1 ? T.primary : "#D3DCEF" }} />
          <div className="text-[11px]" style={{ color: T.text3 }}>{d.m}</div>
        </div>
      ))}
    </div>
  );
}

/* Dropdown menu (row actions) --------------------------------------- */
function Menu({ items }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} onBlur={() => setTimeout(() => setOpen(false), 150)} className="p-1 rounded hover:bg-slate-100"><MoreHorizontal size={16} style={{ color: T.text3 }} /></button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border bg-white py-1 shadow-lg" style={{ borderColor: T.border }}>
          {items.map((it, i) => it.divider ? <div key={i} className="my-1 border-t" style={{ borderColor: T.border }} /> : (
            <button key={i} onMouseDown={it.onClick} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left hover:bg-slate-50" style={{ color: it.danger ? T.danger : T.text }}>
              {it.icon && <it.icon size={14} />}{it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Drawer (tenant 360 / detail panels) ------------------------------- */
function Drawer({ open, onClose, children, width = 620 }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(26,31,54,.35)" }} />
      <div className="absolute right-0 top-0 h-full bg-white shadow-2xl overflow-y-auto animate-[slideIn_.2s_ease]" style={{ width: "min(92vw," + width + "px)" }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* Modal -------------------------------------------------------------- */
function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(26,31,54,.35)" }} />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.border }}>
          <h3 className="text-[15px] font-semibold" style={{ color: T.text }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X size={16} style={{ color: T.text3 }} /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: T.border }}>{footer}</div>}
      </div>
    </div>
  );
}

/* Toast -------------------------------------------------------------- */
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] text-white shadow-lg animate-[slideIn_.2s_ease]" style={{ background: T.text }}>
      <CheckCircle2 size={15} style={{ color: T.success }} /> {msg}
    </div>
  );
}

/* Filter pill -------------------------------------------------------- */
function FilterPill({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="px-2.5 py-1.5 rounded-md text-xs border transition"
      style={active ? { background: T.primarySoft, borderColor: T.primary, color: T.accentText } : { background: "#fff", borderColor: T.border, color: T.text }}>{children}</button>
  );
}

/* Search input ------------------------------------------------------- */
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1 max-w-[300px]">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-2" style={{ borderColor: T.border, background: "#fff", "--tw-ring-color": T.ring }} />
    </div>
  );
}
/* ============================================================
   TENANT 360 — drawer drill-down
   ============================================================ */
function Tenant360({ tenant, onClose, starred, onToggleStar }) {
  const store = useStore();
  const [tab, setTab] = useState("Overview");
  const [seatModal, setSeatModal] = useState(false);
  const [seatN, setSeatN] = useState(5);
  const [assignPlaybookOpen, setAssignPlaybookOpen] = useState(false);
  const [doneTask, setDoneTask] = useState(null);
  const [skipTask, setSkipTask] = useState(null);
  const [noteTask, setNoteTask] = useState(null);
  const [logContactOpen, setLogContactOpen] = useState(false);
  if (!tenant) return null;
  const c = store.clients.find((x) => x.id === tenant.id) || tenant;
  const tenantUsers = store.users.filter((u) => u.tenant === c.name);
  const tenantInvoices = store.invoices.filter((i) => i.client === c.name);
  const tenantTasks = store.tenantTasks.filter((t) => t.tenantId === c.id);
  const renewalDays = (() => {
    const [d, m, y] = c.planEnd.split("-").map(Number);
    return Math.round((new Date(y, m - 1, d) - new Date("2026-05-13")) / 864e5);
  })();
  const activityFeed = [
    ...store.contactLogs.filter((cl) => cl.tenantId === c.id).map((cl) => ({
      key: "cl-" + cl.id,
      icon: cl.type === "Call" ? Phone : cl.type === "Email" ? Mail : MessageSquare,
      color: cl.type === "Call" ? T.primary : cl.type === "Email" ? T.purple : T.text3,
      title: `${cl.type}: ${cl.notes}`,
      subtitle: `${cl.outcome} · ${cl.loggedBy} · ${cl.loggedDate}`,
      date: parseDate(cl.loggedDate),
    })),
    ...tenantTasks.filter((t) => t.status === "Done" || t.status === "Skipped").map((t) => ({
      key: "tk-" + t.id,
      icon: t.status === "Done" ? CheckCircle2 : XCircle,
      color: t.status === "Done" ? T.success : T.warning,
      title: `Task ${t.status}: ${t.title}`,
      subtitle: `${t.playbookName} · ${t.assignedTo} · ${t.completedDate || t.dueDate}`,
      date: parseDate(t.completedDate || t.dueDate),
    })),
  ].sort((a, b) => (b.date || 0) - (a.date || 0));

  return (
    <Drawer open={!!tenant} onClose={onClose}>
      {/* header */}
      <div className="sticky top-0 bg-white border-b z-10" style={{ borderColor: T.border }}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <Avatar name={c.name} tone={c.industry === "Clinic" ? "purple" : "brand"} size={44} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold" style={{ color: T.text }}>{c.name}</h2>
                {statusBadge(c.status)}
                {onToggleStar && <StarToggle starred={starred} onToggle={() => onToggleStar(c.id)} />}
              </div>
              <div className="text-[13px]" style={{ color: T.text2 }}>{c.industry} · {c.branch} · {c.plan}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} style={{ color: T.text3 }} /></button>
        </div>
        {/* quick actions */}
        <div className="flex gap-2 px-6 pb-3 flex-wrap">
          <Button size="sm" variant="primary" onClick={() => store.impersonate(c.name)}><LogIn size={13} /> Log in as client</Button>
          {c.status === "Suspended"
            ? <Button size="sm" onClick={() => store.setTenantStatus(c.id, "Active")}><Power size={13} /> Reactivate</Button>
            : <Button size="sm" variant="danger" onClick={() => store.setTenantStatus(c.id, "Suspended")}><Ban size={13} /> Suspend</Button>}
          <Button size="sm" onClick={() => setSeatModal(true)}><UserPlus size={13} /> Add seats</Button>
          {c.status === "Trial" && <Button size="sm" onClick={() => store.extendTrial(c.id, 14)}><Clock size={13} /> Extend trial</Button>}
        </div>
        <div className="px-6"><Tabs tabs={["Overview", "Users", "Billing", "Activity", "Tasks"]} value={tab} onChange={setTab} /></div>
      </div>

      <div className="px-6 py-5">
        {tab === "Overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Kpi label="Leads (LTD)" value={c.leads.toLocaleString("en-IN")} />
              <Kpi label="MRR" value={c.mrr ? fmtINR(c.mrr) : "—"} />
              <Kpi label="Health" value={String(c.health)} trend={c.health >= 75 ? "pos" : "neg"} sub={c.churnRisk + " risk"} />
            </div>
            <Card><CardHeader title="Account Details" />
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Account Manager">{c.am}</Field>
                  <Field label="GST Number"><span className="font-mono text-xs">{c.gst}</span></Field>
                  <Field label="Seats">{tenantUsers.length} used / {c.seats} licensed</Field>
                  <Field label="AI Summaries Used">{c.aiUsed}</Field>
                  <Field label="Storage Usage">{c.usage} GB</Field>
                  <Field label="Last Login">{c.lastLogin}</Field>
                  <Field label="Plan Renewal">
                    <span style={{ color: renewalDays < 0 ? T.danger : renewalDays < 30 ? T.warning : T.text }}>
                      {c.planEnd} {renewalDays < 0 ? `(${-renewalDays}d overdue)` : `(${renewalDays}d left)`}
                    </span>
                  </Field>
                  <Field label="Lead Provider">
                    <span className="inline-flex items-center gap-1.5">{c.provider}
                      {c.providerOk ? <Badge tone="success">Synced</Badge> : <Badge tone="danger">Down</Badge>}</span>
                  </Field>
                </div>
              </CardBody>
            </Card>
            {!c.providerOk && (
              <div className="flex gap-3 items-center p-3.5 rounded-lg" style={{ background: T.dangerSoft, borderLeft: `3px solid ${T.danger}` }}>
                <TriangleAlert size={18} style={{ color: T.danger }} />
                <div className="flex-1"><div className="text-[13px] font-medium" style={{ color: T.text }}>{c.provider} lead feed is down</div><div className="text-xs" style={{ color: T.text2 }}>No leads received in 26 hours — reconnect required</div></div>
                <Button size="sm" onClick={() => store.notify("Reconnect link sent to tenant admin")}><RefreshCw size={13} /> Reconnect</Button>
              </div>
            )}
          </div>
        )}
        {tab === "Users" && (
          <Card>
            <CardHeader title={`Users (${tenantUsers.length})`} action={<Button size="sm" variant="primary" onClick={() => store.notify(`Invite sent for ${c.name}`)}><UserPlus size={13} /> Invite</Button>} />
            <Table head={["User", "Role", "Status", ""]}>
              {tenantUsers.length ? tenantUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F8F9FC]">
                  <Td><NameCell name={u.name} sub={u.email} /></Td>
                  <Td><Badge tone={u.role.includes("CMO") || u.role.includes("CEO") ? "brand" : "gray"}>{u.role}</Badge></Td>
                  <Td>{statusBadge(u.status)}</Td>
                  <Td><Menu items={[
                    { label: "Impersonate", icon: LogIn, onClick: () => store.impersonate(u) },
                    { label: "Reset password", icon: Key, onClick: () => store.resetPassword(u.name) },
                    { divider: true },
                    u.status === "Suspended"
                      ? { label: "Reactivate", icon: Power, onClick: () => store.setUserStatus(u.id, "Active") }
                      : { label: "Suspend", icon: Ban, danger: true, onClick: () => store.setUserStatus(u.id, "Suspended") },
                  ]} /></Td>
                </tr>
              )) : <tr><Td colSpan={4} className="text-center py-8" style={{ color: T.text3 }}>No users seeded for this tenant</Td></tr>}
            </Table>
          </Card>
        )}
        {tab === "Billing" && (
          <Card>
            <CardHeader title="Invoices" />
            <Table head={["Invoice", "Amount", "Date", "Status", ""]}>
              {tenantInvoices.length ? tenantInvoices.map((iv) => (
                <tr key={iv.id} className="hover:bg-[#F8F9FC]">
                  <Td className="font-mono text-xs">{iv.id}</Td>
                  <Td className="font-medium">{fmtINR(iv.amt)}</Td>
                  <Td className="text-xs" style={{ color: T.text2 }}>{iv.date}</Td>
                  <Td>{statusBadge(iv.status)}</Td>
                  <Td>{iv.status === "Failed" && <Button size="sm" onClick={() => store.retryInvoice(iv.id)}><RefreshCw size={13} /> Retry</Button>}</Td>
                </tr>
              )) : <tr><Td colSpan={5} className="text-center py-8" style={{ color: T.text3 }}>No invoices on record</Td></tr>}
            </Table>
          </Card>
        )}
        {tab === "Activity" && (
          <Card>
            <CardHeader title="Activity" action={<Button size="sm" onClick={() => setLogContactOpen(true)}><PhoneCall size={13} /> Log Contact</Button>} />
            <CardBody className="space-y-3">
              {!activityFeed.length && <div className="text-center py-6 text-[13px]" style={{ color: T.text3 }}>No activity recorded</div>}
              {activityFeed.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.key} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: T.subtle }}><Icon size={14} style={{ color: a.color }} /></div>
                    <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{a.title}</div><div className="text-xs" style={{ color: T.text2 }}>{a.subtitle}</div></div>
                  </div>
                );
              })}
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: T.subtle }}><Flag size={14} style={{ color: T.text3 }} /></div>
                <div><div className="text-[13px] font-medium" style={{ color: T.text }}>Account created</div><div className="text-xs" style={{ color: T.text2 }}>initial setup</div></div>
              </div>
            </CardBody>
          </Card>
        )}
        {tab === "Tasks" && (
          <Card>
            <CardHeader title={`Tasks (${tenantTasks.length})`} action={<Button size="sm" variant="primary" onClick={() => setAssignPlaybookOpen(true)}><GitBranch size={13} /> Assign Playbook</Button>} />
            <Table head={["Title", "Type", "Due Date", "Status", "Assigned To", ""]}>
              {tenantTasks.length ? tenantTasks.map((t) => {
                const overdue = isTaskOverdue(t);
                const Icon = STEP_TYPE_ICON[t.type];
                return (
                  <tr key={t.id} className="hover:bg-[#F8F9FC]" style={overdue ? { background: T.dangerSoft } : undefined}>
                    <Td className="font-medium">{t.title}</Td>
                    <Td><span className="inline-flex items-center gap-1.5 text-xs" style={{ color: T.text2 }}><Icon size={13} />{t.type}</span></Td>
                    <Td className="text-xs font-mono" style={{ color: overdue ? T.danger : T.text2 }}>{t.dueDate}{overdue ? " (overdue)" : ""}</Td>
                    <Td>{taskStatusBadge(t.status)}</Td>
                    <Td className="text-xs" style={{ color: T.text2 }}>{t.assignedTo}</Td>
                    <Td><TaskActionsMenu task={t}
                      onMarkDone={() => setDoneTask(t)}
                      onMarkInProgress={() => store.updateTaskStatus(t.id, "In Progress")}
                      onSkip={() => setSkipTask(t)}
                      onAddNote={() => setNoteTask(t)} /></Td>
                  </tr>
                );
              }) : <tr><Td colSpan={6} className="text-center py-8" style={{ color: T.text3 }}>No tasks assigned yet</Td></tr>}
            </Table>
          </Card>
        )}
      </div>

      <AssignPlaybookModal tenant={assignPlaybookOpen ? c : null} onClose={() => setAssignPlaybookOpen(false)} />
      <TaskDoneModal task={doneTask} onClose={() => setDoneTask(null)} />
      <TaskSkipModal task={skipTask} onClose={() => setSkipTask(null)} />
      <TaskNoteModal task={noteTask} onClose={() => setNoteTask(null)} />
      <LogContactModal tenant={logContactOpen ? c : null} onClose={() => setLogContactOpen(false)} />

      <Modal open={seatModal} onClose={() => setSeatModal(false)} title={`Add seats — ${c.name}`}
        footer={<><Button onClick={() => setSeatModal(false)}>Cancel</Button><Button variant="primary" onClick={() => { store.addSeats(c.id, seatN); setSeatModal(false); }}>Add {seatN} seats</Button></>}>
        <Field label="Number of seats to add">
          <input type="number" value={seatN} onChange={(e) => setSeatN(Number(e.target.value))} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: T.border, "--tw-ring-color": T.ring }} />
        </Field>
        <p className="text-xs mt-3" style={{ color: T.text2 }}>Current: {c.seats} licensed · {tenantUsers.length} in use. Billing adjusts on next cycle.</p>
      </Modal>
    </Drawer>
  );
}

/* ============================================================
   ADD TENANT — modal form for provisioning a new client
   ============================================================ */
const TENANT_INDUSTRIES = ["Ecommerce", "Clinic", "Automotive", "Education", "Other"];
const TENANT_AMS = ["Saif Sir", "Luv", "Vishal"];
const TENANT_PROVIDERS = ["CarWale", "CarDekho", "Website", "WhatsApp", "Website + WhatsApp"];
const EMPTY_TENANT_FORM = { name: "", industry: "Ecommerce", branch: "", plan: "", am: "Saif Sir", provider: "Website", seats: 5, mrr: 5000, gst: "", isTrial: false };

function AddTenantModal({ open, onClose, onCreated }) {
  const store = useStore();
  const [form, setForm] = useState(EMPTY_TENANT_FORM);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [errors, setErrors] = useState({});
  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const publishedPlans = (store.spPlans || []).filter((p) => p.planType === "Published" && p.status === "Active");
  const chosenPlan = publishedPlans.find((p) => String(p.id) === String(selectedPlanId));

  const handleClose = () => { setForm(EMPTY_TENANT_FORM); setSelectedPlanId(""); setBillingCycle("Monthly"); setErrors({}); onClose(); };

  const submit = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Client name is required";
    if (!form.branch.trim()) errs.branch = "Branch / city is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const planEnd = (() => {
      const d = new Date("2026-05-13"); d.setDate(d.getDate() + (form.isTrial ? 14 : 365));
      return d.toLocaleDateString("en-GB").split("/").join("-");
    })();
    const planName = chosenPlan ? chosenPlan.planName : (form.isTrial ? "Trial" : "");
    const client = store.addTenant({ ...form, name: form.name.trim(), branch: form.branch.trim(), plan: planName, planEnd });

    if (chosenPlan && client) {
      const price = billingCycle === "Yearly" ? chosenPlan.yearlyPrice : chosenPlan.monthlyPrice;
      store.createSubscription({
        companyId: client.id, companyName: client.name, planId: chosenPlan.id, planName: chosenPlan.planName,
        billingCycle, status: form.isTrial ? "Trial" : "Active", startDate: NOW,
        renewalDate: billingCycle === "Yearly" ? "13 May 2027" : "13 Jun 2026",
        isTrial: form.isTrial, trialEnd: form.isTrial ? planEnd : null,
        basePrice: price, addons: [], discount: null, subtotal: price, finalPrice: price, notes: "",
      });
    }

    handleClose();
    onCreated?.(client);
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Client"
      footer={<><Button onClick={handleClose}>Cancel</Button><Button variant="primary" onClick={submit}>Add Client</Button></>}>
      <div className="space-y-3">
        <Field label="Client name">
          <input value={form.name} onChange={(e) => u("name", e.target.value)} placeholder="e.g. Nexa Auto Group"
            className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: errors.name ? T.danger : T.border, "--tw-ring-color": T.ring }} />
          {errors.name && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.name}</div>}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Industry">
            <select value={form.industry} onChange={(e) => u("industry", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
              {TENANT_INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Branch / City">
            <input value={form.branch} onChange={(e) => u("branch", e.target.value)} placeholder="e.g. New Delhi"
              className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: errors.branch ? T.danger : T.border, "--tw-ring-color": T.ring }} />
            {errors.branch && <div className="text-xs mt-1" style={{ color: T.danger }}>{errors.branch}</div>}
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Account Manager">
            <select value={form.am} onChange={(e) => u("am", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
              {TENANT_AMS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Lead Provider">
            <select value={form.provider} onChange={(e) => u("provider", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
              {TENANT_PROVIDERS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
        </div>
        {/* Plan assignment */}
        <div className="rounded-xl border p-3 space-y-2" style={{ borderColor: T.ring, background: T.primarySoft }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Plan (optional)</div>
          <div className="grid grid-cols-2 gap-2">
            <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border, background: "#fff" }}>
              <option value="">No plan yet</option>
              {publishedPlans.map((p) => <option key={p.id} value={p.id}>{p.planName} · {fmtINR(p.monthlyPrice)}/mo</option>)}
            </select>
            <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} disabled={!chosenPlan} className="px-3 py-2 rounded-lg border text-[13px] outline-none disabled:opacity-40" style={{ borderColor: T.border, background: "#fff" }}>
              <option>Monthly</option><option>Yearly</option>
            </select>
          </div>
          {chosenPlan && (
            <div className="text-[12px] flex justify-between pt-1" style={{ color: T.text2 }}>
              <span>{chosenPlan.planName} · {billingCycle}</span>
              <span className="font-semibold" style={{ color: T.primary }}>{fmtINR(billingCycle === "Yearly" ? chosenPlan.yearlyPrice : chosenPlan.monthlyPrice)}{billingCycle === "Yearly" ? "/yr" : "/mo"}</span>
            </div>
          )}
        </div>
        <Field label="GST Number (optional)">
          <input value={form.gst} onChange={(e) => u("gst", e.target.value.toUpperCase())} placeholder="e.g. 07AAECR1234K1Z9"
            className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: T.border, "--tw-ring-color": T.ring }} />
        </Field>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isTrial} onChange={(e) => u("isTrial", e.target.checked)} className="w-4 h-4 rounded" /><span className="text-[13px]">Start as free trial (14 days)</span></label>
      </div>
    </Modal>
  );
}

/* ============================================================
   CLIENTS — full data, working filters, provisioning
   ============================================================ */

function ClientsPage() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [risk, setRisk] = useState("All");
  const [industry, setIndustry] = useState("All");
  const [selected, setSelected] = useState(null);
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [starred, setStarred] = useState(() => new Set());
  const toggleStar = (id) => setStarred((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const usedSeatsMap = useMemo(() => {
    const m = {};
    store.users.forEach((u) => { m[u.tenant] = (m[u.tenant] || 0) + 1; });
    return m;
  }, [store.users]);

  const industries = ["All", ...Array.from(new Set(store.clients.map((c) => c.industry)))];

  const rows = useMemo(() => store.clients.filter((c) =>
    (c.name.toLowerCase().includes(q.toLowerCase()) || c.branch.toLowerCase().includes(q.toLowerCase())) &&
    (status === "All" || c.status === status) &&
    (risk === "All" || c.churnRisk === risk) &&
    (industry === "All" || c.industry === industry)
  ), [store.clients, q, status, risk, industry]);

  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(rows, 10);
  const sel = useRowSelection(pageRows, rows);

  const menuFor = (c) => (
    <Menu items={[
      { label: "View 360", icon: Eye, onClick: () => setSelected(c) },
      { label: "Log in as client", icon: LogIn, onClick: () => store.impersonate(c.name) },
      { label: "Add seats", icon: UserPlus, onClick: () => setSelected(c) },
      { divider: true },
      c.status === "Suspended"
        ? { label: "Reactivate", icon: Power, onClick: () => store.setTenantStatus(c.id, "Active") }
        : { label: "Suspend", icon: Ban, danger: true, onClick: () => store.setTenantStatus(c.id, "Suspended") },
    ]} />
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="Clients" desc={`${store.clients.length} shown · ${STATS.total} total · ${STATS.subscribed} paid`}
        actions={sel.isSome
          ? <BulkActionsMenu count={sel.selected.size} onAction={(kind) => { store.notify(`${kind === "whatsapp" ? "WhatsApp" : "Email"} queued for ${sel.selected.size} client(s)`); sel.clear(); }} />
          : <><Button onClick={() => store.notify("Clients exported")}><Download size={15} /> Export</Button><Button variant="primary" onClick={() => setAddTenantOpen(true)}><Plus size={15} /> Add Client</Button></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Total Clients" value={String(STATS.total)} sub={`${rows.length} shown`} />
        <Kpi label="Paid" value={String(STATS.subscribed)} sub={`${Math.round((STATS.subscribed / STATS.total) * 100)}% conversion`} trend="pos" />
        <Kpi label="Free Trial" value={String(STATS.free)} sub="on free plan" />
        <Kpi label="Blocked" value={String(STATS.blocked)} sub="suspended / churned" trend={STATS.blocked > 0 ? "neg" : undefined} />
      </div>
      <div className="flex gap-2 items-center mb-3.5 flex-wrap shrink-0">
        <SearchInput value={q} onChange={setQ} placeholder="Search name or branch…" />
        <span className="text-[11px] font-semibold uppercase tracking-wider ml-1" style={{ color: T.text3 }}>Status</span>
        {["All", "Active", "Trial", "Suspended"].map((f) => <FilterPill key={f} active={status === f} onClick={() => setStatus(f)}>{f}</FilterPill>)}
        <span className="text-[11px] font-semibold uppercase tracking-wider ml-1" style={{ color: T.text3 }}>Risk</span>
        {["All", "High", "Medium", "Low"].map((f) => <FilterPill key={f} active={risk === f} onClick={() => setRisk(f)}>{f}</FilterPill>)}
        <span className="text-[11px] font-semibold uppercase tracking-wider ml-1" style={{ color: T.text3 }}>Industry</span>
        <div className="relative">
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: "#fff", color: T.text }}>
            {industries.map((i) => <option key={i}>{i}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
        </div>
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} selectedCount={sel.selected.size} />
        <Table head={[<SelectAllHeader key="__all" sel={sel} />, "Client", "Industry", "Plan", "Leads", "AI", "Usage", "Seats", "MRR", "Health", "Risk", "Owner", "Status", ""]}>
          {pageRows.map((c) => (
            <tr key={c.id} className={cx("group hover:bg-[#F8F9FC]", sel.selected.has(c.id) && "bg-[#EEF2FF]")}>
              <Td><div className="flex items-center gap-1.5">
                <RowCheckbox checked={sel.selected.has(c.id)} onChange={(e, shiftKey) => sel.toggle(c.id, { shiftKey })} />
                <StarToggle starred={starred.has(c.id)} onToggle={() => toggleStar(c.id)} />
              </div></Td>
              <Td><NameCell name={c.name} sub={c.branch} hideAvatar onClick={() => setSelected(c)} /></Td>
              <Td><span style={{ color: T.text2 }}>{c.industry}</span></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{c.plan}</Td>
              <Td className="font-medium">{c.leads.toLocaleString("en-IN")}</Td>
              <Td>{c.aiUsed}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{c.usage} GB</Td>
              <Td className="text-xs">{usedSeatsMap[c.name] || 0}/{c.seats}</Td>
              <Td className="font-medium">{c.mrr ? fmtINR(c.mrr) : "—"}</Td>
              <Td><Progress value={c.health} /></Td>
              <Td>{statusBadge(c.churnRisk)}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{c.am}</Td>
              <Td>{statusBadge(c.status)}</Td>
              <Td>{menuFor(c)}</Td>
            </tr>
          ))}
          {!rows.length && <tr><Td colSpan={14} className="text-center py-10" style={{ color: T.text3 }}>No clients match these filters</Td></tr>}
        </Table>
      </Card>
      <Tenant360 tenant={selected} onClose={() => setSelected(null)} starred={selected ? starred.has(selected.id) : false} onToggleStar={toggleStar} />
      <AddTenantModal open={addTenantOpen} onClose={() => setAddTenantOpen(false)} onCreated={(client) => { setPage(1); setSelected(client); }} />
    </div>
  );
}
/* ============================================================
   ONBOARDING PIPELINE — kickoff → go-live
   ============================================================ */
/* ---- Confirm modal reused for advance-with-incomplete-tasks ---- */
function ConfirmAdvanceModal({ open, onClose, onConfirm, clientName, fromStage, toStage, incompleteCount }) {
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

function OnboardingDetail({ item, onClose }) {
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
        <div className="sticky top-0 bg-white border-b z-10 px-6 pt-5 pb-4" style={{ borderColor: T.border }}>
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
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} style={{ color: T.text3 }} /></button>
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
                    style={i < stageIdx ? { background: T.success, color: "#fff" } : i === stageIdx ? { background: T.primary, color: "#fff" } : { background: "#E4E7F0", color: T.text3 }}>
                    {i < stageIdx ? <Check size={13} /> : i + 1}
                  </div>
                  <span className="text-[10px] text-center leading-tight" style={{ color: i <= stageIdx ? T.text : T.text3 }}>{s}</span>
                </div>
                {i < ONBOARD_STAGES.length - 1 && <div className="h-0.5 flex-1 -mt-4" style={{ background: i < stageIdx ? T.success : "#E4E7F0" }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* KPI row — inline editable MRR & provider */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border bg-white p-4" style={{ borderColor: T.border }}>
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
            <div className="rounded-lg border bg-white p-4" style={{ borderColor: T.border }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.text3 }}>Tasks</div>
              <div className="text-[20px] font-semibold" style={{ color: T.text }}>{tasksDone}/{tasksTotal}</div>
            </div>
            <div className="rounded-lg border bg-white p-4" style={{ borderColor: T.border }}>
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
                        <label key={c.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
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

function StartOnboardingModal({ open, onClose, onCreated }) {
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
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E4E7F0" }}>
          <div>
            <h3 className="text-[15px] font-semibold" style={{ color: "#1A1F36" }}>Start Onboarding</h3>
            <p className="text-[12px] mt-0.5" style={{ color: "#5A6275" }}>
              {step === 1 ? "Step 1 of 2 — Select an existing client account" : "Step 2 of 2 — Configure the onboarding"}
            </p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} style={{ color: "#8B95A8" }} /></button>
        </div>

        {/* Step indicator */}
        <div className="flex" style={{ background: "#F8F9FC" }}>
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 h-1" style={{ background: s <= step ? "#295FB2" : "#E4E7F0" }} />
          ))}
        </div>

        <div className="px-6 py-5">
          {/* ── STEP 1: Select client ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8B95A8" }}>Search client accounts</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8B95A8" }} />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type client name or industry…"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2"
                    style={{ borderColor: "#E4E7F0", "--tw-ring-color": "#295FB2" }}
                  />
                </div>
              </div>

              {/* Client list */}
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#E4E7F0", maxHeight: 280, overflowY: "auto" }}>
                {filtered.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-[13px] font-medium mb-1" style={{ color: "#1A1F36" }}>No eligible clients found</p>
                    <p className="text-[12px]" style={{ color: "#8B95A8" }}>
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
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                      style={{
                        borderTop: idx > 0 ? `1px solid #E4E7F0` : "none",
                        background: selectedClient?.id === c.id ? "#EEF2FF" : undefined,
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[13px] shrink-0"
                        style={{ background: "#EEF2FF", color: "#3451D1" }}>{c.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate" style={{ color: "#1A1F36" }}>{c.name}</div>
                        <div className="text-[11px]" style={{ color: "#8B95A8" }}>{c.industry} · {c.plan}</div>
                      </div>
                      <div className="text-[12px] font-semibold shrink-0" style={{ color: "#295FB2" }}>
                        {c.mrr ? "₹" + Number(c.mrr).toLocaleString("en-IN") : "Trial"}
                      </div>
                      {selectedClient?.id === c.id && <Check size={15} style={{ color: "#295FB2" }} />}
                    </button>
                  ))
                )}
              </div>

              {/* Helper text */}
              <p className="text-[12px]" style={{ color: "#8B95A8" }}>
                Client not here?{" "}
                <span style={{ color: "#295FB2" }}>They must complete signup first.</span>{" "}
                Check the <strong>Clients</strong> module for account status. Clients already in the pipeline are excluded.
              </p>
            </div>
          )}

          {/* ── STEP 2: Configure ── */}
          {step === 2 && selectedClient && (
            <div className="space-y-4">
              {/* Read-only client facts */}
              <div className="rounded-xl p-4 grid grid-cols-2 gap-3" style={{ background: "#F8F9FC", border: "1px solid #E4E7F0" }}>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#8B95A8" }}>Client</div>
                  <div className="text-[13px] font-medium" style={{ color: "#1A1F36" }}>{selectedClient.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#8B95A8" }}>Industry</div>
                  <div className="text-[13px]" style={{ color: "#1A1F36" }}>{selectedClient.industry}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#8B95A8" }}>Plan</div>
                  <div className="text-[13px] truncate" style={{ color: "#1A1F36" }}>{selectedClient.plan}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#8B95A8" }}>Deal MRR</div>
                  <div className="text-[13px] font-semibold" style={{ color: "#295FB2" }}>
                    {selectedClient.mrr ? "₹" + Number(selectedClient.mrr).toLocaleString("en-IN") : "—"}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#8B95A8" }}>Provider</div>
                  <div className="text-[13px]" style={{ color: "#1A1F36" }}>{selectedClient.provider || "—"}</div>
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8B95A8" }}>Owner / CSM <span style={{ color: "#DC2626" }}>*</span></label>
                  <select value={owner} onChange={(e) => setOwner(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: "#E4E7F0" }}>
                    {ONBOARD_OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8B95A8" }}>Starting Stage</label>
                  <select value={startingStage} onChange={(e) => setStartingStage(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: "#E4E7F0" }}>
                    {ONBOARD_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8B95A8" }}>Start Date <span style={{ color: "#DC2626" }}>*</span></label>
                  <input type="text" value={startedAt} onChange={(e) => setStartedAt(e.target.value)}
                    placeholder="e.g. 13 May 2026"
                    className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: "#E4E7F0" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#8B95A8" }}>Target Go-Live</label>
                  <input type="text" value={targetGoLive} onChange={(e) => setTargetGoLive(e.target.value)}
                    placeholder="e.g. 03 Jun 2026"
                    className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: "#E4E7F0" }} />
                </div>
              </div>

              {dupError && (
                <p className="text-[12px] rounded-lg px-3 py-2" style={{ background: "#FEE2E2", color: "#991B1B" }}>
                  This client already has an onboarding in progress. Only one active onboarding is allowed per client.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "#E4E7F0" }}>
          <button onClick={handleClose} className="text-[13px] font-medium hover:underline" style={{ color: "#8B95A8" }}>Cancel</button>
          <div className="flex gap-2">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-lg border"
                style={{ borderColor: "#E4E7F0", color: "#5A6275" }}>
                <ArrowLeft size={13} /> Back
              </button>
            )}
            {step === 1 ? (
              <button
                disabled={!selectedClient}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg disabled:opacity-40"
                style={{ background: "#295FB2", color: "#fff" }}>
                Next <ArrowRight size={13} />
              </button>
            ) : (
              <button
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg disabled:opacity-40"
                style={{ background: "#295FB2", color: "#fff" }}>
                {submitting ? "Starting…" : <><Rocket size={13} /> Start Onboarding</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingPage() {
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
                      className="rounded-lg border bg-white p-3 cursor-pointer hover:shadow-md transition-shadow"
                      style={{ borderColor: T.border, opacity: dragId === o.id ? 0.4 : 1 }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <GripVertical size={12} style={{ color: T.text3 }} className="shrink-0 cursor-grab" />
                        <Avatar name={o.clientName} tone={o.industry === "Clinic" ? "purple" : "brand"} size={22} />
                        <span className="text-[13px] font-medium leading-tight flex-1 truncate" style={{ color: T.text }}>{o.clientName}</span>
                      </div>
                      <div className="text-[11px] mb-2" style={{ color: T.text2 }}>{o.industry} · {o.owner}</div>
                      <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "#E4E7F0" }}>
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

/* ============================================================
   DASHBOARD — enriched, links into modules
   ============================================================ */
function DashboardPage({ go }) {
  const store = useStore();
  const atRisk = store.clients.filter((c) => c.churnRisk !== "Low");
  const failedPayments = store.invoices.filter((i) => i.status === "Failed");
  const brokenFeeds = store.clients.filter((c) => !c.providerOk);
  const overdueTasks = store.tenantTasks.filter(isTaskOverdue);
  return (
    <>
      <PageHeader title="Dashboard Command Center" desc="Live SaaS state — revenue, clients, ops, risks · refreshed 2 min ago"
        actions={<><Button onClick={() => store.notify("Date range: This Month")}><Calendar size={15} /> This Month</Button><Button onClick={() => store.notify("Dashboard PDF exported")}><Download size={15} /> Export PDF</Button><Button variant="primary" onClick={() => store.notify("Dashboard customization opened")}><LayoutGrid size={15} /> Customize</Button></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Kpi label="MRR (Approx)" value={fmtINR(STATS.mrr)} sub={`${STATS.paidCt} paid clients`} trend="pos" />
        <Kpi label="ARR (Run-rate)" value={fmtLakh(STATS.arr)} sub="Annualized" />
        <Kpi label="Total Tenants" value={STATS.total.toLocaleString("en-IN")} sub={`${STATS.subscribed} paid · ${STATS.free} free`} />
        <Kpi label="In Onboarding" value={String(store.onboarding.length)} sub="pipeline" trend="pos" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi label="Leads Processed" value={fmtK(STATS.leads)} sub="all tenants" trend="pos" />
        <Kpi label="Free → Paid" value={Math.round(STATS.subscribed / STATS.total * 100) + "%"} sub="below target" trend="neg" />
        <Kpi label="AI Summaries" value={STATS.aiUsed} sub="underutilized" trend="warn" />
        <Kpi label="Failed Payments" value={String(failedPayments.length)} sub={fmtINR(failedPayments.reduce((s, i) => s + i.amt, 0))} trend="neg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader title="MRR Trend · Last 6 months" action={<Badge tone="success">+{fmtINR(6379)} net new</Badge>} />
          <CardBody><BarChart data={MRR_TREND} max={340000} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Needs Attention" />
          <CardBody className="space-y-1.5">
            <button onClick={() => go("cs")} className="w-full text-left flex gap-3 items-start p-2.5 rounded-lg hover:brightness-95" style={{ background: T.dangerSoft, borderLeft: `3px solid ${T.danger}` }}>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0"><TriangleAlert size={14} style={{ color: T.danger }} /></div>
              <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{atRisk.length} tenants at churn risk</div><div className="text-xs" style={{ color: T.text2 }}>Health below 75 — review now</div></div>
            </button>
            <button onClick={() => go("integrations")} className="w-full text-left flex gap-3 items-start p-2.5 rounded-lg hover:brightness-95" style={{ background: T.dangerSoft, borderLeft: `3px solid ${T.danger}` }}>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0"><Wifi size={14} style={{ color: T.danger }} /></div>
              <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{brokenFeeds.length} lead feeds down</div><div className="text-xs" style={{ color: T.text2 }}>CarWale sync interrupted</div></div>
            </button>
            <button onClick={() => go("subs")} className="w-full text-left flex gap-3 items-start p-2.5 rounded-lg hover:brightness-95" style={{ background: T.warningSoft, borderLeft: `3px solid ${T.warning}` }}>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0"><CreditCard size={14} style={{ color: T.warning }} /></div>
              <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{failedPayments.length} payments to recover</div><div className="text-xs" style={{ color: T.text2 }}>Retry in billing</div></div>
            </button>
            {overdueTasks.length > 0 && (
              <button onClick={() => go("cs")} className="w-full text-left flex gap-3 items-start p-2.5 rounded-lg hover:brightness-95" style={{ background: T.dangerSoft, borderLeft: `3px solid ${T.danger}` }}>
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0"><Clock size={14} style={{ color: T.danger }} /></div>
                <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{overdueTasks.length} overdue CS tasks</div><div className="text-xs" style={{ color: T.text2 }}>Across all tenants — review playbook progress</div></div>
              </button>
            )}
          </CardBody>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Top Clients by Leads" action={<Button variant="ghost" size="sm" onClick={() => go("clients")}>View all <ChevronRight size={13} /></Button>} />
          <Table head={["Client", "Industry", "Leads", "Health"]}>
            {[...store.clients].sort((a, b) => b.leads - a.leads).slice(0, 5).map((c) => (
              <tr key={c.id} className="hover:bg-[#F8F9FC]">
                <Td><NameCell name={c.name} sub={c.branch} onClick={() => go("clients")} /></Td>
                <Td><Badge tone={c.industry === "Clinic" ? "purple" : "gray"}>{c.industry}</Badge></Td>
                <Td className="font-medium">{c.leads.toLocaleString("en-IN")}</Td>
                <Td><Progress value={c.health} /></Td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card>
          <CardHeader title="Revenue by Plan" action={<Button variant="ghost" size="sm" onClick={() => go("subs")}>Details <ChevronRight size={13} /></Button>} />
          <CardBody><BarList max={70000} fmt={fmtINR} rows={PLAN_DIST.map((p) => ({ label: p.plan, value: p.mrr, note: `${p.clients} clients` }))} /></CardBody>
        </Card>
      </div>
    </>
  );
}
/* ============================================================
   BILLING — working retry + dunning queue
   ============================================================ */
function BillingPage() {
  const store = useStore();
  const [tab, setTab] = useState("Invoices");
  const failed = store.invoices.filter((i) => i.status === "Failed");
  const pending = store.invoices.filter((i) => i.status === "Pending");
  const collected = store.invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amt, 0);
  return (
    <>
      <PageHeader title="Subscriptions & Billing" desc="Invoices, payments, dunning and plan assignments"
        actions={<><Button onClick={() => store.notify("Invoices exported")}><Download size={15} /> Export</Button><Button variant="primary" onClick={() => store.notify("New invoice created")}><Plus size={15} /> New Invoice</Button></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi label="Collected (MTD)" value={fmtINR(collected)} sub="paid invoices" trend="pos" />
        <Kpi label="Outstanding" value={fmtINR(pending.reduce((s, i) => s + i.amt, 0))} sub={`${pending.length} pending`} trend="warn" />
        <Kpi label="Failed" value={fmtINR(failed.reduce((s, i) => s + i.amt, 0))} sub={`${failed.length} to recover`} trend="neg" />
        <Kpi label="Avg Invoice" value={fmtINR(9083)} sub="across paid tenants" />
      </div>
      <Tabs tabs={["Invoices", `Dunning (${failed.length})`]} value={tab} onChange={setTab} />
      {tab === "Invoices" && (
        <Card>
          <Table head={["Invoice", "Client", "Amount", "Method", "Date", "Status", ""]}>
            {store.invoices.map((iv) => (
              <tr key={iv.id} className="hover:bg-[#F8F9FC]">
                <Td className="font-mono text-xs">{iv.id}</Td>
                <Td className="font-medium">{iv.client}</Td>
                <Td className="font-medium">{fmtINR(iv.amt)}</Td>
                <Td className="text-xs" style={{ color: T.text2 }}>{iv.method}</Td>
                <Td className="text-xs" style={{ color: T.text2 }}>{iv.date}</Td>
                <Td>{statusBadge(iv.status)}</Td>
                <Td>{iv.status === "Failed" && <Button size="sm" onClick={() => store.retryInvoice(iv.id)}><RefreshCw size={13} /> Retry</Button>}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
      {tab.startsWith("Dunning") && (
        failed.length ? (
          <Card>
            <CardHeader title="Failed Payments — recovery queue" action={<Button size="sm" variant="primary" onClick={() => { failed.forEach((f) => store.retryInvoice(f.id)); }}><RefreshCw size={13} /> Retry all</Button>} />
            <Table head={["Invoice", "Client", "Amount", "Reason", "Date", ""]}>
              {failed.map((iv) => (
                <tr key={iv.id} className="hover:bg-[#F8F9FC]">
                  <Td className="font-mono text-xs">{iv.id}</Td>
                  <Td className="font-medium">{iv.client}</Td>
                  <Td className="font-medium">{fmtINR(iv.amt)}</Td>
                  <Td><Badge tone="danger">{iv.failReason}</Badge></Td>
                  <Td className="text-xs" style={{ color: T.text2 }}>{iv.date}</Td>
                  <Td><div className="flex gap-1.5"><Button size="sm" onClick={() => store.retryInvoice(iv.id)}><RefreshCw size={13} /> Retry</Button><Button size="sm" onClick={() => store.notify("Dunning email sent")}><Mail size={13} /> Email</Button></div></Td>
                </tr>
              ))}
            </Table>
          </Card>
        ) : (
          <Card><CardBody><div className="py-12 text-center"><CheckCircle2 size={28} style={{ color: T.success, margin: "0 auto 8px" }} /><div className="text-[15px] font-semibold" style={{ color: T.text }}>All caught up</div><p className="text-[13px] mt-1" style={{ color: T.text2 }}>No failed payments to recover.</p></div></CardBody></Card>
        )
      )}
    </>
  );
}

/* ============================================================
   USERS — impersonation + provisioning
   ============================================================ */
function UsersPage() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("All");
  const roles = ["All", ...Array.from(new Set(store.users.map((u) => u.role)))];
  const rows = store.users.filter((u) =>
    (u.name.toLowerCase().includes(q.toLowerCase()) || u.tenant.toLowerCase().includes(q.toLowerCase())) &&
    (role === "All" || u.role === role));
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(rows, 10);
  const sel = useRowSelection(pageRows, rows);
  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="CRM Users" desc="Cross-tenant directory · roles, activity, impersonation"
        actions={sel.isSome
          ? <BulkActionsMenu count={sel.selected.size} onAction={(kind) => { store.notify(`${kind === "whatsapp" ? "WhatsApp" : "Email"} queued for ${sel.selected.size} user(s)`); sel.clear(); }} />
          : <><Button onClick={() => store.notify("Users exported")}><Download size={15} /> Export</Button><Button variant="primary" onClick={() => store.notify("Invite sent")}><UserPlus size={15} /> Invite User</Button></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Total Users" value="2,148" sub="across 564 tenants" />
        <Kpi label="Active (7d)" value="1,642" sub="76% engagement" trend="pos" />
        <Kpi label="Suspended" value={String(store.users.filter((u) => u.status === "Suspended").length)} sub="policy / non-payment" trend="warn" />
        <Kpi label="Pending Invites" value={String(store.users.filter((u) => u.status === "Invited").length)} sub="not yet accepted" />
      </div>
      <div className="flex gap-2 items-center mb-3.5 flex-wrap shrink-0">
        <SearchInput value={q} onChange={setQ} placeholder="Search users or tenants…" />
        {roles.map((r) => <FilterPill key={r} active={role === r} onClick={() => setRole(r)}>{r}</FilterPill>)}
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} selectedCount={sel.selected.size} />
        <Table head={[<SelectAllHeader key="__all" sel={sel} />, "User", "Tenant", "Role", "Status", "Last active", ""]}>
          {pageRows.map((u) => (
            <tr key={u.id} className={cx("group hover:bg-[#F8F9FC]", sel.selected.has(u.id) && "bg-[#EEF2FF]")}>
              <Td><RowCheckbox checked={sel.selected.has(u.id)} onChange={(e, shiftKey) => sel.toggle(u.id, { shiftKey })} /></Td>
              <Td><NameCell name={u.name} sub={u.email} tone={u.role.includes("CEO") ? "purple" : "brand"} /></Td>
              <Td className="font-medium">{u.tenant}</Td>
              <Td><Badge tone={u.role.includes("CMO") || u.role.includes("CEO") ? "brand" : "gray"}>{u.role}</Badge></Td>
              <Td>{statusBadge(u.status)}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{u.last}</Td>
              <Td><div className="flex items-center gap-1">
                <button onClick={() => store.impersonate(u)} className="p-1 rounded hover:bg-slate-100" title="Impersonate"><LogIn size={15} style={{ color: T.primary }} /></button>
                <Menu items={[
                  { label: "Reset password", icon: Key, onClick: () => store.resetPassword(u.name) },
                  u.status === "Invited" ? { label: "Resend invite", icon: Mail, onClick: () => store.resendInvite(u.id) } : null,
                  { divider: true },
                  u.status === "Suspended"
                    ? { label: "Reactivate", icon: Power, onClick: () => store.setUserStatus(u.id, "Active") }
                    : { label: "Suspend", icon: Ban, danger: true, onClick: () => store.setUserStatus(u.id, "Suspended") },
                ].filter(Boolean)} />
              </div></Td>
            </tr>
          ))}
          {!rows.length && <tr><Td colSpan={7} className="text-center py-10" style={{ color: T.text3 }}>No users match</Td></tr>}
        </Table>
      </Card>
    </div>
  );
}

/* ============================================================
   BILLING/PLANS catalog (Revenue tab includes plan editor)
   ============================================================ */
function RevenuePage() {
  const store = useStore();
  const [tab, setTab] = useState("Analytics");
  return (
    <>
      <PageHeader title="Revenue & Plans" desc="MRR movement, plan mix and the pricing catalog"
        actions={<><Button onClick={() => store.notify("Date range: Last 6 months")}><Calendar size={15} /> Last 6 months</Button><Button onClick={() => store.notify("Revenue report exported")}><Download size={15} /> Export</Button></>} />
      <Tabs tabs={["Analytics", "Plan Catalog"]} value={tab} onChange={setTab} />
      {tab === "Analytics" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Kpi label="MRR" value={fmtINR(STATS.mrr)} sub="+2.1% MoM" trend="pos" />
            <Kpi label="ARR" value={fmtLakh(STATS.arr)} sub="Annualized" />
            <Kpi label="Net New" value={fmtINR(6379)} sub="this month" trend="pos" />
            <Kpi label="Gross Churn" value={fmtINR(4167)} sub="1 account" trend="neg" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2"><CardHeader title="MRR Trend" /><CardBody><BarChart data={MRR_TREND} max={340000} /></CardBody></Card>
            <Card><CardHeader title="MRR Movement" /><CardBody>
              <BarList max={72000} fmt={fmtINR} rows={[
                { label: "Starting", value: 305700, color: T.text3 }, { label: "New", value: 8546, color: T.success },
                { label: "Expansion", value: 4200, color: T.primary }, { label: "Contraction", value: 2300, color: T.warning },
                { label: "Churn", value: 4167, color: T.danger }, { label: "Ending", value: STATS.mrr, color: T.primary },
              ]} />
            </CardBody></Card>
          </div>
        </>
      )}
      {tab === "Plan Catalog" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {store.spPlans.map((p) => (
            <div key={p.id} className="rounded-lg border bg-white p-4" style={{ borderColor: T.border, boxShadow: "0 1px 2px rgba(26,31,54,.05)" }}>
              <div className="flex items-start justify-between mb-2">
                <div><div className="text-[14px] font-semibold" style={{ color: T.text }}>{p.name}</div><div className="text-xs" style={{ color: T.text2 }}>{p.cycle}</div></div>
                <Badge tone="success">{p.clients} clients</Badge>
              </div>
              <div className="text-[22px] font-semibold my-2" style={{ color: T.text }}>{p.price ? fmtINR(p.price) : "Free"}<span className="text-xs font-normal" style={{ color: T.text3 }}>{p.price ? " /mo" : ""}</span></div>
              <div className="text-xs mb-3" style={{ color: T.text2 }}>{p.seats} seats · {p.features.join(" · ")}</div>
              <Button size="sm" className="w-full justify-center" onClick={() => store.notify(`Editing ${p.name}`)}><Pencil size={13} /> Edit plan</Button>
            </div>
          ))}
          <button onClick={() => store.notify("New plan draft created")} className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 py-8 hover:bg-slate-50 transition" style={{ borderColor: T.borderStrong, color: T.text2 }}>
            <Plus size={22} /><span className="text-[13px] font-medium">New plan</span>
          </button>
        </div>
      )}
    </>
  );
}

/* ============================================================
   CUSTOMER SUCCESS — at-risk accounts, playbooks, tasks, renewals
   ============================================================ */
const CS_TABS = ["At-Risk Accounts", "Playbook Library", "Tenant Tasks", "Renewals"];

function CsPage({ openTenant }) {
  const [tab, setTab] = useState("At-Risk Accounts");
  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="Customer Success" desc="Health scores, playbooks, tasks and renewals" />
      <div className="shrink-0"><Tabs tabs={CS_TABS} value={tab} onChange={setTab} /></div>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {tab === "At-Risk Accounts" && <CsAtRiskTab openTenant={openTenant} />}
        {tab === "Playbook Library" && <CsPlaybookLibraryTab />}
        {tab === "Tenant Tasks" && <CsTenantTasksTab openTenant={openTenant} />}
        {tab === "Renewals" && <CsRenewalsTab />}
      </div>
    </div>
  );
}

/* ---- Tab 1: At-Risk Accounts ---- */
function AssignPlaybookModal({ tenant, onClose }) {
  const store = useStore();
  const [selected, setSelected] = useState("");
  React.useEffect(() => { setSelected(""); }, [tenant?.id]);
  if (!tenant) return null;
  const activePlaybooks = store.spPlaybooks.filter((p) => p.status === "Active");
  // Only still-open work blocks a direct assign — Done/Skipped tasks are history, not a conflict.
  const existing = store.tenantTasks.filter((t) => t.tenantId === tenant.id && (t.status === "Open" || t.status === "In Progress"));
  const showGuard = !!selected && existing.length > 0;

  const assign = () => { if (!selected) return; store.assignPlaybookToTenant(tenant.id, selected); onClose(); };
  const replace = () => { if (!selected) return; store.replaceTenantPlaybook(tenant.id, selected); onClose(); };
  const addAlongside = () => { if (!selected) return; store.assignPlaybookToTenant(tenant.id, selected); onClose(); };

  return (
    <Modal open={!!tenant} onClose={onClose} title={`Assign Playbook — ${tenant.name}`}
      footer={showGuard ? (
        <><Button onClick={onClose}>Cancel</Button><Button onClick={addAlongside}>Add alongside</Button><Button variant="danger" onClick={replace}>Replace</Button></>
      ) : (
        <><Button onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!selected} onClick={assign}>Assign</Button></>
      )}>
      {showGuard && (
        <div className="flex items-start gap-2 rounded-lg p-3 mb-3" style={{ background: T.warningSoft, border: `1px solid ${T.warning}` }}>
          <TriangleAlert size={15} style={{ color: T.warning, marginTop: 2 }} />
          <div className="text-[12px]" style={{ color: T.text }}>This tenant already has {existing.length} open task{existing.length === 1 ? "" : "s"} from "<span className="font-semibold">{existing[0].playbookName}</span>". Replace clears them; Add alongside keeps them and appends the new playbook's tasks.</div>
        </div>
      )}
      <div className="space-y-2">
        {activePlaybooks.map((p) => (
          <button key={p.id} onClick={() => setSelected(p.id)} className={cx("w-full flex items-center justify-between p-3 rounded-lg border text-left transition", selected === p.id ? "ring-2" : "hover:bg-slate-50")}
            style={{ borderColor: selected === p.id ? T.primary : T.border, "--tw-ring-color": T.ring }}>
            <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{p.name}</div><div className="text-[11px]" style={{ color: T.text2 }}>{p.riskTier} risk · {p.industry} · {p.steps.length} steps</div></div>
          </button>
        ))}
        {!activePlaybooks.length && <div className="text-[12px] py-4 text-center" style={{ color: T.text3 }}>No active playbooks. Create one in the Playbook Library tab.</div>}
      </div>
    </Modal>
  );
}

function LogContactModal({ tenant, onClose }) {
  const store = useStore();
  const [type, setType] = useState("Call");
  const [outcome, setOutcome] = useState("Positive");
  const [notes, setNotes] = useState("");
  React.useEffect(() => { setType("Call"); setOutcome("Positive"); setNotes(""); }, [tenant?.id]);
  if (!tenant) return null;
  const save = () => { if (!notes.trim()) return; store.logContact(tenant.id, { type, outcome, notes: notes.trim() }); onClose(); };
  return (
    <Modal open={!!tenant} onClose={onClose} title={`Log Contact — ${tenant.name}`}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!notes.trim()} onClick={save}>Save</Button></>}>
      <div className="space-y-3">
        <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
            <option>Call</option><option>Email</option><option>Other</option>
          </select></div>
        <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Outcome</label>
          <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
            <option>Positive</option><option>Neutral</option><option>Negative</option>
          </select></div>
        <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Notes{!notes.trim() && <span style={{ color: T.danger }}> — required</span>}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none resize-none" style={{ borderColor: T.border }} /></div>
      </div>
    </Modal>
  );
}

function CsAtRiskTab({ openTenant }) {
  const store = useStore();
  const atRisk = [...store.clients].filter((c) => c.churnRisk !== "Low").sort((a, b) => a.health - b.health);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(atRisk, 10);
  const [assigningTenant, setAssigningTenant] = useState(null);
  const [loggingTenant, setLoggingTenant] = useState(null);
  const tasksFor = (tenantId) => store.tenantTasks.filter((t) => t.tenantId === tenantId);
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Avg Health" value="82" sub="+3 pts" trend="pos" />
        <Kpi label="At Risk" value={String(atRisk.length)} sub="health < 75" trend="warn" />
        <Kpi label="Renewals (30d)" value="3" sub={fmtINR(19167) + " MRR"} />
        <Kpi label="NPS" value="+48" sub="52 responses" trend="pos" />
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <CardHeader title="At-Risk Accounts" action={<Badge tone="danger">{atRisk.length} accounts</Badge>} />
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={["Client", "Health", "Risk", "Playbook", "MRR", "Owner", "Renewal", ""]}>
          {pageRows.map((c) => {
            const tasks = tasksFor(c.id);
            const done = tasks.filter((t) => t.status === "Done").length;
            // A left border on <tr> is dropped by the collapsed-border table model this
            // component uses, so the flag is applied to the first cell instead — same visual
            // result (a red edge on unworked High-risk rows), reliably rendered.
            const flagBorder = c.churnRisk === "High" && tasks.length === 0;
            return (
              <tr key={c.id} className="hover:bg-[#F8F9FC]">
                <Td style={flagBorder ? { borderLeft: `3px solid ${T.danger}` } : undefined}><NameCell name={c.name} sub={c.industry} onClick={() => openTenant(c)} /></Td>
                <Td><Progress value={c.health} /></Td>
                <Td>{statusBadge(c.churnRisk)}</Td>
                <Td>{tasks.length ? (
                  <div>
                    <div className="font-medium text-[12px]" style={{ color: T.text }}>{tasks[0].playbookName}</div>
                    <Badge tone={done === tasks.length ? "success" : done > 0 ? "warning" : "info"}>{done}/{tasks.length} done</Badge>
                  </div>
                ) : <Badge tone="gray">No playbook</Badge>}</Td>
                <Td className="font-medium">{c.mrr ? fmtINR(c.mrr) : "—"}</Td>
                <Td className="text-xs" style={{ color: T.text2 }}>{c.am}</Td>
                <Td className="text-xs font-mono" style={{ color: T.text2 }}>{c.planEnd}</Td>
                <Td><div className="flex items-center gap-1.5 justify-end">
                  <Button size="sm" onClick={() => setAssigningTenant(c)}><GitBranch size={13} /> Assign Playbook</Button>
                  <Button size="sm" onClick={() => setLoggingTenant(c)}><PhoneCall size={13} /> Log Contact</Button>
                </div></Td>
              </tr>
            );
          })}
          {!atRisk.length && <tr><Td colSpan={8} className="text-center py-10" style={{ color: T.text3 }}>No at-risk accounts</Td></tr>}
        </Table>
      </Card>
      <AssignPlaybookModal tenant={assigningTenant} onClose={() => setAssigningTenant(null)} />
      <LogContactModal tenant={loggingTenant} onClose={() => setLoggingTenant(null)} />
    </div>
  );
}

/* ---- Tab 2: Playbook Library ---- */
const makeBlankStep = () => ({ id: "step-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title: "", type: "Call", slaDays: 1 });

function PlaybookForm({ initial, mode, onSave, onCancel }) {
  const [f, setF] = useState(() => initial
    ? { ...initial, steps: initial.steps.map((s) => ({ ...s })) }
    : { name: "", description: "", riskTier: "High", industry: "All", status: "Active", steps: [makeBlankStep()] });
  const [errors, setErrors] = useState({});
  const u = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const updateStep = (i, patch) => setF((p) => ({ ...p, steps: p.steps.map((s, si) => (si === i ? { ...s, ...patch } : s)) }));
  const addStep = () => setF((p) => ({ ...p, steps: [...p.steps, makeBlankStep()] }));
  const removeStep = (i) => setF((p) => ({ ...p, steps: p.steps.filter((_, si) => si !== i) }));
  const moveStep = (i, dir) => setF((p) => {
    const j = i + dir;
    if (j < 0 || j >= p.steps.length) return p;
    const steps = [...p.steps];
    [steps[i], steps[j]] = [steps[j], steps[i]];
    return { ...p, steps };
  });

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Required";
    if (f.steps.length < 1) e.steps = "At least 1 step required";
    f.steps.forEach((s, i) => { if (!s.title.trim()) e["step-" + i] = "Title required"; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const submit = () => { if (validate()) onSave(f); };

  return (
    <div className="space-y-5">
      <div className="text-lg font-semibold" style={{ color: T.text }}>{mode === "edit" ? "Edit Playbook" : "Create Playbook"}</div>
      <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Name{errors.name && <span style={{ color: T.danger }}> — {errors.name}</span>}</label>
        <input value={f.name} onChange={(e) => u("name", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: errors.name ? T.danger : T.border, "--tw-ring-color": T.ring }} /></div>
      <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Description</label>
        <textarea value={f.description} onChange={(e) => u("description", e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none resize-none" style={{ borderColor: T.border }} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Target Risk Tier</label>
          <select value={f.riskTier} onChange={(e) => u("riskTier", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
            {PLAYBOOK_RISK_TIERS.map((r) => <option key={r}>{r}</option>)}
          </select></div>
        <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Industry</label>
          <select value={f.industry} onChange={(e) => u("industry", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
            {PLAYBOOK_INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </select></div>
      </div>
      <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Status</label>
        <select value={f.status} onChange={(e) => u("status", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }}>
          <option>Active</option><option>Inactive</option>
        </select></div>
      <div className="border-t pt-4" style={{ borderColor: T.border }}>
        <div className="text-[13px] font-semibold mb-3" style={{ color: T.text }}>Steps{errors.steps && <span style={{ color: T.danger }}> — {errors.steps}</span>}</div>
        <div className="space-y-2.5">
          {f.steps.map((s, i) => {
            const Icon = STEP_TYPE_ICON[s.type];
            return (
              <div key={s.id} className="rounded-lg border p-3" style={{ borderColor: errors["step-" + i] ? T.danger : T.border }}>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: T.primarySoft }}><Icon size={14} style={{ color: T.primary }} /></div>
                  <div className="flex-1 grid grid-cols-[1fr_140px_90px] gap-2">
                    <div>
                      <input value={s.title} onChange={(e) => updateStep(i, { title: e.target.value })} placeholder="Step title" className="w-full px-2.5 py-1.5 rounded-md border text-[13px] outline-none" style={{ borderColor: errors["step-" + i] ? T.danger : T.border }} />
                      {errors["step-" + i] && <div className="text-[11px] mt-1" style={{ color: T.danger }}>{errors["step-" + i]}</div>}
                    </div>
                    <select value={s.type} onChange={(e) => updateStep(i, { type: e.target.value })} className="px-2.5 py-1.5 rounded-md border text-[13px] outline-none" style={{ borderColor: T.border }}>
                      {STEP_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <input type="number" min={1} value={s.slaDays} onChange={(e) => updateStep(i, { slaDays: Number(e.target.value) || 1 })} title="SLA days" className="px-2.5 py-1.5 rounded-md border text-[13px] outline-none" style={{ borderColor: T.border }} />
                  </div>
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-30"><ChevronUp size={14} /></button>
                    <button onClick={() => moveStep(i, 1)} disabled={i === f.steps.length - 1} className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-30"><ChevronDown size={14} /></button>
                  </div>
                  <button onClick={() => removeStep(i)} disabled={f.steps.length <= 1} className="p-1.5 rounded hover:bg-slate-100 shrink-0 disabled:opacity-30" title="Remove step"><Trash2 size={14} style={{ color: T.danger }} /></button>
                </div>
                <div className="text-[10px] mt-1.5 ml-9" style={{ color: T.text3 }}>SLA: {s.slaDays} day{s.slaDays === 1 ? "" : "s"} after assignment</div>
              </div>
            );
          })}
        </div>
        <button onClick={addStep} className="mt-3 flex items-center gap-1.5 text-[12px] font-medium" style={{ color: T.primary }}><Plus size={14} /> Add Step</button>
      </div>
      <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: T.border }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={submit}><Check size={15} /> {mode === "edit" ? "Save Changes" : "Create Playbook"}</Button>
      </div>
    </div>
  );
}

function CsPlaybookLibraryTab() {
  const store = useStore();
  const [statusF, setStatusF] = useState("All");
  const [drawer, setDrawer] = useState(null); // { mode: "create" | "edit", playbook }
  const rows = store.spPlaybooks.filter((p) => statusF === "All" || p.status === statusF);
  const tenantsUsing = (id) => new Set(store.tenantTasks.filter((t) => t.playbookId === id).map((t) => t.tenantId)).size;

  const handleSave = (pb) => {
    if (drawer.mode === "edit") store.updatePlaybook(drawer.playbook.id, pb);
    else store.createPlaybook(pb);
    setDrawer(null);
  };
  const handleDuplicate = (p) => store.duplicatePlaybook(p.id);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex gap-2 items-center mb-3.5 flex-wrap shrink-0">
        {["All", "Active", "Inactive"].map((f) => <FilterPill key={f} active={statusF === f} onClick={() => setStatusF(f)}>{f}</FilterPill>)}
        <Button variant="primary" className="ml-auto" onClick={() => setDrawer({ mode: "create", playbook: null })}><Plus size={15} /> Create Playbook</Button>
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Table head={["Name", "Target Tier", "Industry", "Steps", "Status", "Tenants Using", ""]}>
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-[#F8F9FC]">
              <Td className="font-medium">{p.name}</Td>
              <Td><Badge tone={p.riskTier === "High" ? "danger" : p.riskTier === "Medium" ? "warning" : "gray"}>{p.riskTier}</Badge></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{p.industry}</Td>
              <Td>{p.steps.length}</Td>
              <Td>{statusBadge(p.status)}</Td>
              <Td>{tenantsUsing(p.id)}</Td>
              <Td><div className="flex items-center gap-1.5 justify-end">
                <Menu items={[
                  { label: "Edit", icon: Pencil, onClick: () => setDrawer({ mode: "edit", playbook: p }) },
                  { label: "Duplicate", icon: Copy, onClick: () => handleDuplicate(p) },
                  { label: p.status === "Active" ? "Deactivate" : "Activate", icon: p.status === "Active" ? PauseCircle : PlayCircle, onClick: () => store.togglePlaybookStatus(p.id) },
                ]} />
              </div></Td>
            </tr>
          ))}
          {!rows.length && <tr><Td colSpan={7} className="text-center py-10" style={{ color: T.text3 }}>No playbooks match</Td></tr>}
        </Table>
      </Card>
      <Drawer open={!!drawer} onClose={() => setDrawer(null)} width={640}>
        {drawer && <div className="p-6"><PlaybookForm initial={drawer.playbook} mode={drawer.mode} onSave={handleSave} onCancel={() => setDrawer(null)} /></div>}
      </Drawer>
    </div>
  );
}

/* ---- Tab 3: Tenant Tasks ---- */
function TaskDoneModal({ task, onClose }) {
  const store = useStore();
  const [notes, setNotes] = useState("");
  React.useEffect(() => { setNotes(task?.notes || ""); }, [task?.id]);
  if (!task) return null;
  const save = () => { if (notes !== task.notes) store.updateTaskNotes(task.id, notes); store.updateTaskStatus(task.id, "Done"); onClose(); };
  return (
    <Modal open={!!task} onClose={onClose} title={`Mark Done — ${task.title}`}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save}><CheckCircle2 size={15} /> Mark Done</Button></>}>
      <Field label="Notes (optional)">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none resize-none" style={{ borderColor: T.border }} />
      </Field>
    </Modal>
  );
}
function TaskSkipModal({ task, onClose }) {
  const store = useStore();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  React.useEffect(() => { setNote(""); setError(""); }, [task?.id]);
  if (!task) return null;
  const save = () => { const ok = store.updateTaskStatus(task.id, "Skipped", note); if (!ok) { setError("Skip reason is required"); return; } onClose(); };
  return (
    <Modal open={!!task} onClose={onClose} title={`Skip Task — ${task.title}`}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="danger" onClick={save}><XCircle size={15} /> Skip Task</Button></>}>
      <Field label="Skip reason (required)">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none resize-none" style={{ borderColor: error ? T.danger : T.border }} />
        {error && <div className="text-xs mt-1" style={{ color: T.danger }}>{error}</div>}
      </Field>
    </Modal>
  );
}
function TaskNoteModal({ task, onClose }) {
  const store = useStore();
  const [notes, setNotes] = useState("");
  React.useEffect(() => { setNotes(task?.notes || ""); }, [task?.id]);
  if (!task) return null;
  const save = () => { store.updateTaskNotes(task.id, notes); onClose(); };
  return (
    <Modal open={!!task} onClose={onClose} title={`Note — ${task.title}`}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save}>Save Note</Button></>}>
      <Field label="Notes">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none resize-none" style={{ borderColor: T.border }} />
      </Field>
    </Modal>
  );
}

// Shared by the Tenant Tasks tab and the Tenant360 "Tasks" tab.
function TaskActionsMenu({ task, onMarkDone, onMarkInProgress, onSkip, onAddNote }) {
  return (
    <Menu items={[
      task.status !== "Done" ? { label: "Mark Done", icon: CheckCircle2, onClick: onMarkDone } : null,
      task.status !== "In Progress" && task.status !== "Done" ? { label: "Mark In Progress", icon: Clock, onClick: onMarkInProgress } : null,
      task.status !== "Skipped" && task.status !== "Done" ? { label: "Skip", icon: XCircle, danger: true, onClick: onSkip } : null,
      { label: "Add Note", icon: FileText, onClick: onAddNote },
    ].filter(Boolean)} />
  );
}

function CsTenantTasksTab({ openTenant }) {
  const store = useStore();
  const [statusF, setStatusF] = useState("All");
  const [amF, setAmF] = useState("All");
  const [q, setQ] = useState("");
  const [doneTask, setDoneTask] = useState(null);
  const [skipTask, setSkipTask] = useState(null);
  const [noteTask, setNoteTask] = useState(null);

  const ams = ["All", ...Array.from(new Set(store.clients.map((c) => c.am)))];
  const rows = useMemo(() => store.tenantTasks.filter((t) =>
    (statusF === "All" || t.status === statusF) &&
    (amF === "All" || t.assignedTo === amF) &&
    t.tenantName.toLowerCase().includes(q.toLowerCase())
  ), [store.tenantTasks, statusF, amF, q]);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(rows, 10);

  const openCount = store.tenantTasks.filter((t) => t.status === "Open" || t.status === "In Progress").length;
  const overdueCount = store.tenantTasks.filter(isTaskOverdue).length;
  const doneThisWeek = store.tenantTasks.filter((t) =>
    t.status === "Done" && t.completedDate && parseDate(t.completedDate) >= new Date(TODAY_DATE.getTime() - 7 * 864e5)
  ).length;
  const doneTasks = store.tenantTasks.filter((t) => t.status === "Done").length;
  const completionRate = store.tenantTasks.length ? Math.round((doneTasks / store.tenantTasks.length) * 100) : 0;
  const clientById = (id) => store.clients.find((c) => c.id === id);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Open Tasks" value={String(openCount)} />
        <Kpi label="Overdue" value={String(overdueCount)} trend={overdueCount > 0 ? "neg" : undefined} />
        <Kpi label="Done This Week" value={String(doneThisWeek)} trend="pos" />
        <Kpi label="Completion Rate" value={`${completionRate}%`} />
      </div>
      <div className="flex gap-2 items-center mb-3.5 flex-wrap shrink-0">
        <SearchInput value={q} onChange={setQ} placeholder="Search tenant…" />
        <span className="text-[11px] font-semibold uppercase tracking-wider ml-1" style={{ color: T.text3 }}>Status</span>
        {["All", ...TASK_STATUSES].map((f) => <FilterPill key={f} active={statusF === f} onClick={() => setStatusF(f)}>{f}</FilterPill>)}
        <span className="text-[11px] font-semibold uppercase tracking-wider ml-1" style={{ color: T.text3 }}>AM</span>
        <div className="relative">
          <select value={amF} onChange={(e) => setAmF(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: "#fff", color: T.text }}>
            {ams.map((a) => <option key={a}>{a}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
        </div>
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={["Tenant", "Task", "Type", "Playbook", "Assigned To", "Due Date", "Status", ""]}>
          {pageRows.map((t) => {
            const overdue = isTaskOverdue(t);
            const Icon = STEP_TYPE_ICON[t.type];
            const client = clientById(t.tenantId);
            return (
              <tr key={t.id} className="hover:bg-[#F8F9FC]" style={overdue ? { background: T.dangerSoft } : undefined}>
                <Td><button onClick={() => client && openTenant(client)} className="font-medium hover:underline" style={{ color: T.primary }}>{t.tenantName}</button></Td>
                <Td className="font-medium">{t.title}</Td>
                <Td><span className="inline-flex items-center gap-1.5 text-xs" style={{ color: T.text2 }}><Icon size={13} />{t.type}</span></Td>
                <Td className="text-xs" style={{ color: T.text2 }}>{t.playbookName}</Td>
                <Td className="text-xs" style={{ color: T.text2 }}>{t.assignedTo}</Td>
                <Td className="text-xs font-mono" style={{ color: overdue ? T.danger : T.text2 }}>{t.dueDate}{overdue ? " (overdue)" : ""}</Td>
                <Td>{taskStatusBadge(t.status)}</Td>
                <Td><TaskActionsMenu task={t}
                  onMarkDone={() => setDoneTask(t)}
                  onMarkInProgress={() => store.updateTaskStatus(t.id, "In Progress")}
                  onSkip={() => setSkipTask(t)}
                  onAddNote={() => setNoteTask(t)} /></Td>
              </tr>
            );
          })}
          {!rows.length && <tr><Td colSpan={8} className="text-center py-10" style={{ color: T.text3 }}>No tasks match</Td></tr>}
        </Table>
      </Card>
      <TaskDoneModal task={doneTask} onClose={() => setDoneTask(null)} />
      <TaskSkipModal task={skipTask} onClose={() => setSkipTask(null)} />
      <TaskNoteModal task={noteTask} onClose={() => setNoteTask(null)} />
    </div>
  );
}

/* ---- Tab 4: Renewals ---- */
function CsRenewalsTab() {
  const store = useStore();
  // Renewal status lives in local component state per the spec — it doesn't persist to the store.
  const [statusMap, setStatusMap] = useState({});
  const withDays = useMemo(() => store.clients.map((c) => ({ ...c, daysLeft: daysUntil(c.planEnd) })), [store.clients]);
  const overdueRows = useMemo(() => withDays.filter((c) => c.daysLeft !== null && c.daysLeft < 0).sort((a, b) => a.daysLeft - b.daysLeft), [withDays]);
  const rows = useMemo(() => withDays.filter((c) => c.daysLeft !== null && c.daysLeft >= 0 && c.daysLeft <= 60).sort((a, b) => a.daysLeft - b.daysLeft), [withDays]);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(rows, 10);

  const due30 = rows.filter((c) => c.daysLeft <= 30);
  const due3160 = rows.filter((c) => c.daysLeft > 30 && c.daysLeft <= 60);
  const statusFor = (id) => statusMap[id] || "Not Started";
  const confirmedCount = rows.filter((c) => statusFor(c.id) === "Confirmed").length;
  const setStatus = (id, status) => { setStatusMap((m) => ({ ...m, [id]: status })); store.notify("Renewal status updated"); };
  const dayColor = (days) => (days < 15 ? T.danger : days <= 30 ? T.warning : T.success);

  const renewalStatusSelect = (c) => (
    <select value={statusFor(c.id)} onChange={(e) => setStatus(c.id, e.target.value)} className="px-2.5 py-1.5 rounded-md border text-xs outline-none" style={{ borderColor: T.border, background: "#fff" }}>
      {RENEWAL_STATUSES.map((s) => <option key={s}>{s}</option>)}
    </select>
  );

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Due in 30d" value={String(due30.length)} sub={fmtINR(due30.reduce((s, c) => s + c.mrr, 0)) + " MRR"} trend="warn" />
        <Kpi label="Due in 31–60d" value={String(due3160.length)} sub={fmtINR(due3160.reduce((s, c) => s + c.mrr, 0)) + " MRR"} />
        <Kpi label="Overdue" value={String(overdueRows.length)} trend={overdueRows.length > 0 ? "neg" : undefined} />
        <Kpi label="Confirmed" value={String(confirmedCount)} trend="pos" />
      </div>
      {overdueRows.length > 0 && (
        <Card className="mb-4 shrink-0">
          <CardHeader title="Overdue Renewals" action={<Badge tone="danger">{overdueRows.length} tenants</Badge>} />
          <Table head={["Tenant", "Industry", "MRR", "Plan End", "Days Overdue", "AM", "Renewal Status"]} maxHeight={240}>
            {overdueRows.map((c) => (
              <tr key={c.id} style={{ background: T.dangerSoft }}>
                <Td className="font-medium">{c.name}</Td>
                <Td className="text-xs" style={{ color: T.text2 }}>{c.industry}</Td>
                <Td className="font-medium">{c.mrr ? fmtINR(c.mrr) : "—"}</Td>
                <Td className="text-xs font-mono" style={{ color: T.text2 }}>{c.planEnd}</Td>
                <Td><span className="font-semibold" style={{ color: T.danger }}>{-c.daysLeft}d overdue</span></Td>
                <Td className="text-xs" style={{ color: T.text2 }}>{c.am}</Td>
                <Td>{renewalStatusSelect(c)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={["Tenant", "Industry", "MRR", "Plan End", "Days Left", "AM", "Renewal Status"]}>
          {pageRows.map((c) => (
            <tr key={c.id} className="hover:bg-[#F8F9FC]">
              <Td className="font-medium">{c.name}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{c.industry}</Td>
              <Td className="font-medium">{c.mrr ? fmtINR(c.mrr) : "—"}</Td>
              <Td className="text-xs font-mono" style={{ color: T.text2 }}>{c.planEnd}</Td>
              <Td><span className="font-semibold" style={{ color: dayColor(c.daysLeft) }}>{c.daysLeft}d</span></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{c.am}</Td>
              <Td>{renewalStatusSelect(c)}</Td>
            </tr>
          ))}
          {!rows.length && <tr><Td colSpan={7} className="text-center py-10" style={{ color: T.text3 }}>No renewals due within 60 days</Td></tr>}
        </Table>
      </Card>
    </div>
  );
}

/* ============================================================
   SUPPORT — working status changes
   ============================================================ */
function SupportPage() {
  const store = useStore();
  const [filter, setFilter] = useState("All");
  const pt = { High: "danger", Medium: "warning", Low: "gray" };
  const rows = store.tickets.filter((t) => filter === "All" || t.status === filter);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(rows, 10);
  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="Support & Tickets" desc="Tenant support requests and SLA tracking"
        actions={<Button variant="primary" onClick={() => store.notify("New ticket created")}><Plus size={15} /> New Ticket</Button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Open Tickets" value={String(store.tickets.filter((t) => t.status === "Open").length)} sub="live" trend="warn" />
        <Kpi label="Avg First Response" value="1.8h" sub="SLA 4h" trend="pos" />
        <Kpi label="Resolved (7d)" value="34" sub="94% in SLA" trend="pos" />
        <Kpi label="CSAT" value="4.6/5" sub="118 ratings" trend="pos" />
      </div>
      <div className="flex gap-2 mb-3.5 shrink-0">{["All", "Open", "Pending", "Resolved"].map((f) => <FilterPill key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</FilterPill>)}</div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={["Ticket", "Subject", "Tenant", "Priority", "Owner", "Status", ""]}>
          {pageRows.map((t) => (
            <tr key={t.id} className="hover:bg-[#F8F9FC]">
              <Td className="font-mono text-xs">{t.id}</Td>
              <Td className="font-medium">{t.subj}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{t.tenant}</Td>
              <Td><Badge tone={pt[t.pri]}>{t.pri}</Badge></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{t.owner}</Td>
              <Td>{statusBadge(t.status)}</Td>
              <Td><Menu items={[
                { label: "Mark resolved", icon: CheckCircle2, onClick: () => store.setTicketStatus(t.id, "Resolved") },
                { label: "Mark pending", icon: Clock, onClick: () => store.setTicketStatus(t.id, "Pending") },
                { label: "Reopen", icon: RefreshCw, onClick: () => store.setTicketStatus(t.id, "Open") },
              ]} /></Td>
            </tr>
          ))}
          {!rows.length && <tr><Td colSpan={7} className="text-center py-10" style={{ color: T.text3 }}>No tickets</Td></tr>}
        </Table>
      </Card>
    </div>
  );
}
/* ============================================================
   INTEGRATIONS — with reconnect action tied to feed health
   ============================================================ */
function IntegrationsPage({ filter }) {
  const store = useStore();
  const brokenTenants = store.clients.filter((c) => !c.providerOk);
  const leadHealth = computeIntegrationHealth(loadLeads() || SEED_LEADS);
  const indiaMartHealth = leadHealth.find((h) => h.source === "IndiaMART");
  const [filterDismissed, setFilterDismissed] = useState(false);
  const activeFilter = !filterDismissed && filter?.source ? filter : null;
  const integ = [
    { name: "CarWale", cat: "Lead provider", icon: Car, tenants: 42, ok: brokenTenants.every((t) => t.provider !== "CarWale") },
    { name: "CarDekho", cat: "Lead provider", icon: Car, tenants: 38, ok: true },
    { name: "IndiaMART", cat: "Lead provider", icon: Globe, tenants: indiaMartHealth?.total || 0, ok: indiaMartHealth?.status === "Healthy" },
    { name: "WhatsApp Business", cat: "Messaging", icon: MessageSquare, tenants: 210, ok: true },
    { name: "Cliniceo EMR", cat: "Healthcare", icon: Stethoscope, tenants: 12, ok: true },
    { name: "Razorpay", cat: "Payments", icon: CreditCard, tenants: 56, ok: true },
    { name: "Dealer DMS", cat: "Automotive", icon: Server, tenants: 1, ok: true, beta: true },
  ];
  // Deep-linked from Lead & Record Mgmt: bump the matching integration to the top so it's
  // immediately visible without scrolling or hunting through the grid.
  const matches = (it) => activeFilter && (it.name === activeFilter.source || it.name.startsWith(activeFilter.source));
  const sortedInteg = activeFilter ? [...integ].sort((a, b) => (matches(b) ? 1 : 0) - (matches(a) ? 1 : 0)) : integ;
  return (
    <>
      <PageHeader title="Integrations" desc="Lead providers, messaging, payments and vertical connectors"
        actions={<Button variant="primary" onClick={() => store.notify("Integration added")}><Plus size={15} /> Add Integration</Button>} />
      {activeFilter && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg mb-4" style={{ background: T.primarySoft, border: `1px solid ${T.primary}` }}>
          <Filter size={14} style={{ color: T.accentText }} />
          <span className="text-[13px] flex-1" style={{ color: T.text }}>
            Filtered from Lead & Record Management — <strong>{activeFilter.source}</strong>{activeFilter.tenants?.length ? ` affects ${activeFilter.tenants.length} tenant${activeFilter.tenants.length !== 1 ? "s" : ""}: ${activeFilter.tenants.join(", ")}` : ""}
          </span>
          <button onClick={() => setFilterDismissed(true)} className="text-[12px] flex items-center gap-1 px-2 py-1 rounded" style={{ color: T.accentText }}><X size={11} />Clear</button>
        </div>
      )}
      {brokenTenants.length > 0 && (
        <div className="flex gap-3 items-center p-3.5 rounded-lg mb-4" style={{ background: T.dangerSoft, borderLeft: `3px solid ${T.danger}` }}>
          <TriangleAlert size={18} style={{ color: T.danger }} />
          <div className="flex-1"><div className="text-[13px] font-medium" style={{ color: T.text }}>{brokenTenants.length} tenant feeds are down</div>
            <div className="text-xs" style={{ color: T.text2 }}>{brokenTenants.map((t) => t.name).join(", ")}</div></div>
          <Button size="sm" onClick={() => store.notify("Reconnect requests sent to affected tenants")}><RefreshCw size={13} /> Reconnect all</Button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedInteg.map((it, i) => (
          <div key={i} className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow" style={matches(it) ? { borderColor: T.primary, boxShadow: `0 0 0 2px ${T.primarySoft}` } : { borderColor: T.border, boxShadow: "0 1px 2px rgba(26,31,54,.05)" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: T.subtle }}><it.icon size={18} style={{ color: T.primary }} /></div>
              <Badge tone={it.beta ? "warning" : it.ok ? "success" : "danger"}>{it.beta ? "Beta" : it.ok ? "Connected" : "Feed down"}</Badge>
            </div>
            <div className="text-[14px] font-semibold" style={{ color: T.text }}>{it.name}</div>
            <div className="text-xs mb-3" style={{ color: T.text2 }}>{it.cat}</div>
            <div className="flex items-center justify-between text-xs pt-3 border-t" style={{ borderColor: T.border }}>
              <span style={{ color: T.text3 }}>Connected tenants</span><span className="font-medium" style={{ color: T.text }}>{it.tenants}</span>
            </div>
            {!it.ok && <Button size="sm" className="w-full justify-center mt-3" onClick={() => store.notify(`${it.name} reconnect started`)}><RefreshCw size={13} /> Reconnect</Button>}
          </div>
        ))}
      </div>
    </>
  );
}

/* ---- Queue Monitor — working retry ---- */
/* ---- Queue Monitor — single BullMQ-style queue (leadQueue), matches the ingestion
   pipeline leads flow through: addLead jobs failing in the same way the Lead & Record
   Mgmt "Integration Health" section already surfaces (auth/validation errors upstream). ---- */
const genObjectId = (seed) => { let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0; return h.toString(16).padStart(8, "0") + seed.length.toString(16).padStart(4, "0") + "a1b2c3d4e5f6".slice(0, 12); };

const SEED_FAILED_JOBS = [
  { id: "4277", name: "addLead", attempts: 3, error: "No lead details provided in lead worker for job 4277", data: { client: genObjectId("MedLinks"), data: { lead_details: [], source: genObjectId("IndiaMART"), group: genObjectId("grp-1"), stage: genObjectId("Kickoff") }, logId: genObjectId("log-4277") }, failedAt: "22 Jul 2026, 4:25:27 am" },
  { id: "4276", name: "addLead", attempts: 3, error: "Auth error: IndiaMART API token expired", data: { client: genObjectId("BrightPath Edu"), data: { lead_details: [{ phone: null }], source: genObjectId("IndiaMART"), group: genObjectId("grp-2"), stage: genObjectId("Training") }, logId: genObjectId("log-4276") }, failedAt: "22 Jul 2026, 4:19:04 am" },
  { id: "4271", name: "enrichLead", attempts: 2, error: "AI enrichment timeout after 8000ms for job 4271", data: { client: genObjectId("Derma Purtitys"), data: { lead_id: "ld-014", model: "ledsak-ai-v3" }, logId: genObjectId("log-4271") }, failedAt: "22 Jul 2026, 3:58:12 am" },
  { id: "4268", name: "addLead", attempts: 1, error: "No lead details provided in lead worker for job 4268", data: { client: genObjectId("MedLinks"), data: { lead_details: [], source: genObjectId("IndiaMART"), group: genObjectId("grp-1"), stage: genObjectId("Configuring") }, logId: genObjectId("log-4268") }, failedAt: "22 Jul 2026, 3:40:51 am" },
  { id: "4260", name: "dedupeLead", attempts: 3, error: "Duplicate match confidence below merge threshold (61%) for job 4260", data: { client: genObjectId("Urban Autohub"), data: { lead_id: "ld-013", matchId: "ld-009" }, logId: genObjectId("log-4260") }, failedAt: "22 Jul 2026, 2:12:37 am" },
  { id: "4254", name: "addLead", attempts: 3, error: "Auth error: IndiaMART API token expired", data: { client: genObjectId("BrightPath Edu"), data: { lead_details: [], source: genObjectId("IndiaMART"), group: genObjectId("grp-2"), stage: genObjectId("Training") }, logId: genObjectId("log-4254") }, failedAt: "22 Jul 2026, 1:47:22 am" },
  { id: "4249", name: "syncTenant", attempts: 2, error: "Tenant webhook responded 503 for job 4249", data: { client: genObjectId("Rezoni"), data: { webhook: "https://rezoni.example/hooks/leads" }, logId: genObjectId("log-4249") }, failedAt: "21 Jul 2026, 11:30:09 pm" },
  { id: "4241", name: "addLead", attempts: 3, error: "No lead details provided in lead worker for job 4241", data: { client: genObjectId("MedLinks"), data: { lead_details: [], source: genObjectId("IndiaMART"), group: genObjectId("grp-1"), stage: genObjectId("Kickoff") }, logId: genObjectId("log-4241") }, failedAt: "21 Jul 2026, 10:05:44 pm" },
  { id: "4233", name: "sendNotification", attempts: 1, error: "SMTP connection refused for job 4233", data: { client: genObjectId("Varun Group"), data: { channel: "email", template: "lead-assigned" }, logId: genObjectId("log-4233") }, failedAt: "21 Jul 2026, 8:52:16 pm" },
  { id: "4227", name: "enrichLead", attempts: 2, error: "AI enrichment timeout after 8000ms for job 4227", data: { client: genObjectId("Derma Purtitys"), data: { lead_id: "ld-008", model: "ledsak-ai-v3" }, logId: genObjectId("log-4227") }, failedAt: "21 Jul 2026, 7:14:39 pm" },
];

function QueuesPage() {
  const store = useStore();
  const [failedJobs, setFailedJobs] = useState(SEED_FAILED_JOBS);
  const [activeJobs, setActiveJobs] = useState([]);
  const [completed, setCompleted] = useState(14);
  const [waiting, setWaiting] = useState(0);
  const [delayed, setDelayed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }));
  const [retrying, setRetrying] = useState(null); // job id currently retrying

  const touch = () => setLastUpdated(new Date().toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }));

  const handleRefresh = () => { touch(); store.notify("Queue refreshed"); };

  const retryJob = (id) => {
    setRetrying(id);
    setTimeout(() => {
      setFailedJobs((jobs) => jobs.filter((j) => j.id !== id));
      setCompleted((c) => c + 1);
      setRetrying(null);
      touch();
      store.notify(`Job ${id} retried and completed`);
    }, 900);
  };

  const retryAll = () => {
    const ids = failedJobs.map((j) => j.id);
    setRetrying("all");
    setTimeout(() => {
      setFailedJobs([]);
      setCompleted((c) => c + ids.length);
      setRetrying(null);
      touch();
      store.notify(`${ids.length} job(s) retried and completed`);
    }, 1200);
  };

  const clearCompleted = () => { setCompleted(0); store.notify("Completed jobs cleared"); };
  const togglePaused = () => { setPaused((p) => !p); store.notify(paused ? "Queue resumed" : "Queue paused"); };

  // Health reflects backlog/congestion (is the queue keeping up?), not the dead-letter count —
  // a healthy queue can still be sitting on old failed jobs waiting for someone to retry them.
  const isDown = !paused && waiting > 50;
  const isHealthy = !paused && !isDown && waiting <= 20;
  const healthLabel = paused ? "PAUSED" : isDown ? "DOWN" : isHealthy ? "HEALTHY" : "DEGRADED";
  const healthTone = paused ? "gray" : isDown ? "danger" : isHealthy ? "success" : "warning";
  const bannerBg = paused ? T.subtle : isDown ? T.dangerSoft : isHealthy ? T.successSoft : T.warningSoft;
  const bannerColor = paused ? T.text2 : isDown ? T.danger : isHealthy ? T.success : T.warning;
  const bannerIcon = paused ? PauseCircle : isDown ? XCircle : isHealthy ? CheckCircle2 : AlertTriangle;
  const bannerText = paused ? "Queue is paused — no jobs are being processed" : isDown ? "Queue is unhealthy — failure rate requires attention" : isHealthy ? "Queue is operating normally" : "Queue is degraded — elevated failure rate";

  const stats = [
    { label: "Waiting", value: waiting, sub: "Jobs in queue", icon: Clock, color: T.primary },
    { label: "Active", value: activeJobs.length, sub: "Currently processing", icon: Activity, color: T.success },
    { label: "Completed", value: completed, sub: "Successfully finished", icon: CheckCircle2, color: T.success },
    { label: "Failed", value: failedJobs.length, sub: "Requires attention", icon: XCircle, color: T.danger },
    { label: "Delayed", value: delayed, sub: "Scheduled for later", icon: History, color: T.warning },
  ];

  return (
    <>
      <PageHeader title="Queue Monitor" desc="Monitor BullMQ workers, queue health, and job statistics"
        actions={<>
          {failedJobs.length > 0 && <Button onClick={retryAll} disabled={retrying === "all"} style={{ borderColor: "#F3C6C6", color: T.danger }}><RefreshCw size={14} className={retrying === "all" ? "animate-spin" : ""} />Retry all failed ({failedJobs.length})</Button>}
          <Button onClick={handleRefresh}><RefreshCw size={15} /> Refresh</Button>
          <Menu items={[
            { label: paused ? "Resume queue" : "Pause queue", icon: paused ? PlayCircle : PauseCircle, onClick: togglePaused },
            { label: "Clear completed jobs", icon: Trash2, onClick: clearCompleted },
          ]} />
        </>} />

      {/* Queue Health Status */}
      <Card className="mb-4">
        <CardHeader title="Queue Health Status" sub={`leadQueue · Last updated: ${lastUpdated}`} action={<Badge tone={healthTone}>{healthLabel}</Badge>} />
        <CardBody>
          <div className="flex items-center gap-3 rounded-lg p-4" style={{ background: bannerBg }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#fff" }}>
              {React.createElement(bannerIcon, { size: 18, style: { color: bannerColor } })}
            </div>
            <div>
              <div className="text-[13px] font-semibold" style={{ color: T.text }}>{bannerText}</div>
              <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>{activeJobs.length} active job{activeJobs.length !== 1 ? "s" : ""}, {waiting} waiting, {failedJobs.length} failed</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border bg-white" style={{ borderColor: T.border, boxShadow: "0 1px 2px rgba(26,31,54,.05)", padding: "18px 20px" }}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium" style={{ color: T.text }}>{label}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <div className="text-[26px] leading-none font-semibold mt-3 tracking-tight" style={{ color: T.text }}>{value}</div>
            <div className="text-xs mt-2" style={{ color: T.text3 }}>{sub}</div>
          </div>
        ))}
        <div className="rounded-lg border bg-white" style={{ borderColor: T.border, boxShadow: "0 1px 2px rgba(26,31,54,.05)", padding: "18px 20px" }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium" style={{ color: T.text }}>Paused</span>
            <PauseCircle size={16} style={{ color: paused ? T.warning : T.text3 }} />
          </div>
          <div className="text-[15px] font-semibold mt-3" style={{ color: paused ? T.warning : T.text3 }}>{paused ? "Yes" : "No"}</div>
          <div className="text-xs mt-2" style={{ color: T.text3 }}>{paused ? "Temporarily stopped" : "Queue running normally"}</div>
        </div>
      </div>

      {/* Failed Jobs + Active Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title={<span className="flex items-center gap-1.5"><XCircle size={15} style={{ color: T.danger }} />Failed Jobs</span>} sub="Most recent job failures (up to 5)"
            action={failedJobs.length > 0 && <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: T.danger }}>{failedJobs.length}</span>} />
          <CardBody className="space-y-3">
            {failedJobs.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 size={28} style={{ color: T.success }} className="mx-auto mb-2" />
                <div className="text-[13px] font-medium" style={{ color: T.text }}>No failed jobs</div>
              </div>
            ) : failedJobs.slice(0, 5).map((j) => (
              <div key={j.id} className="rounded-lg p-3.5 space-y-2" style={{ background: T.dangerSoft, border: "1px solid #F3C6C6" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Job ID</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded" style={{ background: "#fff", color: T.text }}>{j.id}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: T.danger }}>{j.attempts} attempt{j.attempts !== 1 ? "s" : ""}</span>
                </div>
                <div className="text-[12px]"><span className="font-semibold" style={{ color: T.text }}>Name: </span><span style={{ color: T.text2 }}>{j.name}</span></div>
                <div>
                  <div className="text-[11px] font-semibold mb-1" style={{ color: T.text }}>Error:</div>
                  <div className="text-[11px] px-2.5 py-1.5 rounded" style={{ background: "#FCA5A5", color: "#7F1D1D" }}>{j.error}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold mb-1" style={{ color: T.text }}>Job Data:</div>
                  <pre className="text-[10px] font-mono rounded-lg p-2 overflow-auto" style={{ background: "#fff", color: T.text2, maxHeight: 140 }}>{JSON.stringify(j.data, null, 2)}</pre>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[11px]" style={{ color: T.text3 }}>Failed: {j.failedAt}</span>
                  <Button size="sm" onClick={() => retryJob(j.id)} disabled={retrying === j.id}><RefreshCw size={12} className={retrying === j.id ? "animate-spin" : ""} />Retry</Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<span className="flex items-center gap-1.5"><Activity size={15} style={{ color: T.success }} />Active Jobs</span>} sub="Currently processing jobs (up to 5)" />
          <CardBody>
            {activeJobs.length === 0 ? (
              <div className="text-center py-16">
                <RefreshCw size={26} style={{ color: T.text3 }} className="mx-auto mb-3" />
                <div className="text-[13px] font-medium" style={{ color: T.text }}>No active jobs</div>
                <div className="text-[12px] mt-1" style={{ color: T.text3 }}>Queue is idle</div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeJobs.slice(0, 5).map((j) => (
                  <div key={j.id} className="rounded-lg p-3.5" style={{ background: T.successSoft, border: "1px solid #A7F3D0" }}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded" style={{ background: "#fff", color: T.text }}>{j.id}</span>
                      <RefreshCw size={13} className="animate-spin" style={{ color: T.success }} />
                    </div>
                    <div className="text-[12px] mt-2"><span className="font-semibold" style={{ color: T.text }}>Name: </span><span style={{ color: T.text2 }}>{j.name}</span></div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}

/* ---- Leads ---- */
/* ============================================================
   LEAD & RECORD MANAGEMENT — full functional module
   ============================================================ */

/* ---- Seed data ---- */
const LEAD_SOURCES = ["CarWale", "CarDekho", "Website", "WhatsApp", "IndiaMART", "Walk-in"];
const LEAD_PROC_STATES = ["success", "partial", "failed", "duplicate"];
const LEAD_STATUSES = ["New", "Assigned", "Contacted", "Converted", "Lost"];
const LEAD_TENANTS = ["MedLinks", "Varun Group", "Derma Purtitys", "Urban Autohub", "Rezoni", "BrightPath Edu"];

const SEED_LEADS = [
  { id: "ld-001", name: "Arjun Sharma", phone: "+91-98765-43210", email: "arjun@example.com", source: "CarWale", tenant: "Varun Group", tenantId: 6, status: "New", procState: "success", duplicateOf: null, aiSummary: "High-intent buyer, interested in SUVs under ₹15L. Visited 3 times.", assignee: "Saif Sir", receivedAt: "13 May 2026 09:14", failureReason: null, history: [{ action: "Lead received", by: "system", when: "13 May 2026 09:14" }, { action: "AI summary generated", by: "system", when: "13 May 2026 09:15" }] },
  { id: "ld-002", name: "Priya Nair", phone: "+91-87654-32109", email: "priya@example.com", source: "CarDekho", tenant: "Urban Autohub", tenantId: 11, status: "Assigned", procState: "success", duplicateOf: null, aiSummary: "First-time buyer, exploring hatchbacks. Budget ₹8–10L.", assignee: "Luv", receivedAt: "13 May 2026 08:52", failureReason: null, history: [{ action: "Lead received", by: "system", when: "13 May 2026 08:52" }, { action: "Assigned to Luv", by: "Saif Sir", when: "13 May 2026 09:00" }] },
  { id: "ld-003", name: "Rohit Verma", phone: "+91-76543-21098", email: "rohit@example.com", source: "IndiaMART", tenant: "MedLinks", tenantId: 3, status: "New", procState: "failed", duplicateOf: null, aiSummary: null, assignee: null, receivedAt: "13 May 2026 08:30", failureReason: "Auth error: IndiaMART API token expired", history: [{ action: "Lead received", by: "system", when: "13 May 2026 08:30" }, { action: "Processing failed: Auth error", by: "system", when: "13 May 2026 08:30" }] },
  { id: "ld-004", name: "Kavita Reddy", phone: "+91-65432-10987", email: "kavita@example.com", source: "IndiaMART", tenant: "MedLinks", tenantId: 3, status: "New", procState: "failed", duplicateOf: null, aiSummary: null, assignee: null, receivedAt: "13 May 2026 08:28", failureReason: "Auth error: IndiaMART API token expired", history: [{ action: "Lead received", by: "system", when: "13 May 2026 08:28" }, { action: "Processing failed: Auth error", by: "system", when: "13 May 2026 08:28" }] },
  { id: "ld-005", name: "Suresh Patel", phone: "+91-54321-09876", email: "suresh@example.com", source: "WhatsApp", tenant: "Derma Purtitys", tenantId: 2, status: "Contacted", procState: "success", duplicateOf: null, aiSummary: "Returning patient, interested in skin rejuvenation. Has booked before.", assignee: "Luv", receivedAt: "13 May 2026 07:45", failureReason: null, history: [{ action: "Lead received", by: "system", when: "13 May 2026 07:45" }, { action: "Contacted via WhatsApp", by: "Luv", when: "13 May 2026 08:00" }] },
  { id: "ld-006", name: "Meera Iyer", phone: "+91-54321-09876", email: "meera@example.com", source: "Website", tenant: "Derma Purtitys", tenantId: 2, status: "New", procState: "duplicate", duplicateOf: "ld-005", aiSummary: "Phone matches existing lead ld-005 (Suresh Patel via WhatsApp).", assignee: null, receivedAt: "13 May 2026 07:40", failureReason: null, history: [{ action: "Lead received", by: "system", when: "13 May 2026 07:40" }, { action: "Duplicate detected: phone match with ld-005", by: "system", when: "13 May 2026 07:41" }] },
  { id: "ld-007", name: "Vikram Singh", phone: "+91-32109-87654", email: "vikram@example.com", source: "CarWale", tenant: "Varun Group", tenantId: 6, status: "Converted", procState: "success", duplicateOf: null, aiSummary: "Converted after 3 follow-ups. Booked Hyundai Creta.", assignee: "Saif Sir", receivedAt: "12 May 2026 16:20", failureReason: null, history: [{ action: "Lead received", by: "system", when: "12 May 2026 16:20" }, { action: "Converted", by: "Saif Sir", when: "13 May 2026 11:00" }] },
  { id: "ld-008", name: "Anita Joshi", phone: "+91-21098-76543", email: "anita@example.com", source: "Website", tenant: "MedLinks", tenantId: 3, status: "New", procState: "partial", duplicateOf: null, aiSummary: "Lead captured but AI enrichment incomplete — contact details valid.", assignee: null, receivedAt: "12 May 2026 15:55", failureReason: "AI enrichment timeout", history: [{ action: "Lead received", by: "system", when: "12 May 2026 15:55" }, { action: "Partial processing: AI enrichment timeout", by: "system", when: "12 May 2026 15:56" }] },
  { id: "ld-009", name: "Deepak Rao", phone: "+91-10987-65432", email: "deepak@example.com", source: "CarDekho", tenant: "Urban Autohub", tenantId: 11, status: "Assigned", procState: "success", duplicateOf: null, aiSummary: "Looking for family car, 7-seater preferred. Deadline: next month.", assignee: "Luv", receivedAt: "12 May 2026 14:30", failureReason: null, history: [{ action: "Lead received", by: "system", when: "12 May 2026 14:30" }] },
  { id: "ld-010", name: "Sunita Kapoor", phone: "+91-09876-54321", email: "sunita@example.com", source: "Walk-in", tenant: "Rezoni", tenantId: 1, status: "Lost", procState: "success", duplicateOf: null, aiSummary: "Walk-in visitor. Browsed but didn't proceed. Price sensitive.", assignee: "Saif Sir", receivedAt: "12 May 2026 12:10", failureReason: null, history: [{ action: "Lead received", by: "system", when: "12 May 2026 12:10" }, { action: "Marked Lost", by: "Saif Sir", when: "12 May 2026 17:00" }] },
  { id: "ld-011", name: "Rahul Mehta", phone: "+91-98001-23456", email: "rahul@example.com", source: "IndiaMART", tenant: "BrightPath Edu", tenantId: 8, status: "New", procState: "failed", duplicateOf: null, aiSummary: null, assignee: null, receivedAt: "12 May 2026 11:40", failureReason: "Auth error: IndiaMART API token expired", history: [{ action: "Lead received", by: "system", when: "12 May 2026 11:40" }, { action: "Processing failed", by: "system", when: "12 May 2026 11:40" }] },
  { id: "ld-012", name: "Pooja Sharma", phone: "+91-87001-23456", email: "pooja@example.com", source: "WhatsApp", tenant: "Varun Group", tenantId: 6, status: "Contacted", procState: "success", duplicateOf: null, aiSummary: "Interested in commercial vehicles. Fleet buyer potential.", assignee: "Saif Sir", receivedAt: "12 May 2026 10:05", failureReason: null, history: [{ action: "Lead received", by: "system", when: "12 May 2026 10:05" }] },
  { id: "ld-013", name: "Anil Kumar", phone: "+91-10987-65432", email: "anil@example.com", source: "CarWale", tenant: "Urban Autohub", tenantId: 11, status: "New", procState: "duplicate", duplicateOf: "ld-009", aiSummary: "Phone match with ld-009 (Deepak Rao via CarDekho).", assignee: null, receivedAt: "11 May 2026 18:30", failureReason: null, history: [{ action: "Lead received", by: "system", when: "11 May 2026 18:30" }, { action: "Duplicate detected", by: "system", when: "11 May 2026 18:31" }] },
  { id: "ld-014", name: "Geeta Singh", phone: "+91-65001-23456", email: "geeta@example.com", source: "Website", tenant: "Derma Purtitys", tenantId: 2, status: "New", procState: "partial", duplicateOf: null, aiSummary: null, assignee: null, receivedAt: "11 May 2026 16:00", failureReason: "AI enrichment timeout", history: [{ action: "Lead received", by: "system", when: "11 May 2026 16:00" }] },
  { id: "ld-015", name: "Sunil Desai", phone: "+91-54001-23456", email: "sunil@example.com", source: "CarDekho", tenant: "Varun Group", tenantId: 6, status: "Assigned", procState: "success", duplicateOf: null, aiSummary: "Budget buyer. Comparing 3 models. High follow-up priority.", assignee: "Saif Sir", receivedAt: "11 May 2026 14:22", failureReason: null, history: [{ action: "Lead received", by: "system", when: "11 May 2026 14:22" }] },
];

const LEAD_SOURCES_DATA = [
  { source: "CarWale", count: 18420, convPct: 4.2, costPerLead: 48 },
  { source: "CarDekho", count: 14100, convPct: 3.8, costPerLead: 52 },
  { source: "Website", count: 8900, convPct: 6.1, costPerLead: 18 },
  { source: "WhatsApp", count: 4200, convPct: 8.4, costPerLead: 5 },
  { source: "IndiaMART", count: 2100, convPct: 2.9, costPerLead: 35 },
  { source: "Walk-in", count: 2590, convPct: 12.1, costPerLead: 0 },
];

const TENANT_TIER = { "MedLinks": "Enterprise", "Varun Group": "Enterprise", "Derma Purtitys": "Growth", "Urban Autohub": "Growth", "Rezoni": "Trial", "BrightPath Edu": "Trial" };
const TIER_TONE = { Enterprise: "purple", Growth: "info", Trial: "gray" };
const FILTER_PLURAL = { Source: "Sources", Tenant: "Tenants", Status: "Statuses", Processing: "Processing States" };

// Deterministic (non-cryptographic) hash so support can search a phone number without
// ever un-masking it — same digits always hash the same, but the hash can't be reversed.
const simpleHash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h.toString(36); };
const digitsOnly = (s) => (s || "").replace(/\D/g, "");
const last4Hash = (phone) => simpleHash(digitsOnly(phone).slice(-4));

// Mock ingestion debug info derived deterministically from the lead — a demo stand-in for
// what a real pipeline would log (raw payload, normalized payload, HTTP status, retry count).
function mockFailureDebug(lead) {
  const n = parseInt(lead.id.replace(/\D/g, ""), 10) || 1;
  const httpStatus = /auth|token/i.test(lead.failureReason || "") ? 401 : /timeout/i.test(lead.failureReason || "") ? 504 : 422;
  return {
    httpStatus,
    attempt: 1 + (n % 3),
    nextRetryAt: `in ~${5 + (n % 10)} min`,
    rawPayload: `{ "name": "${lead.name}", "phone": "${lead.phone}", "source": "${lead.source}", "tenant_id": ${lead.tenantId} }`,
    normalizedPayload: httpStatus === 401 ? "null — auth failed before normalization" : `{ "full_name": "${lead.name}", "mobile": null, "tenant_id": ${lead.tenantId} }`,
  };
}

// Mock dedupe match metadata — the seed data already encodes the match via `duplicateOf`,
// this derives a stable confidence/reason label from it for display.
function mockMatchInfo(lead) {
  const n = parseInt(lead.id.replace(/\D/g, ""), 10) || 1;
  return { reason: "Phone number — exact match", confidence: 94 + (n % 6) };
}

// Sources that are real third-party integrations with credentials to rotate. Website and
// Walk-in are internal capture channels — there's nothing in Integrations to "fix" for them.
const EXTERNAL_INTEGRATION_SOURCES = new Set(["IndiaMART", "CarWale", "CarDekho", "WhatsApp"]);

// A failed lead caused by expired/invalid credentials — reprocessing this is a guaranteed
// no-op until the token is rotated on the Integrations page, so the UI should never offer
// "reprocess" as if it were a fix for this class of failure.
const isAuthFailure = (lead) => lead.procState === "failed" && mockFailureDebug(lead).httpStatus === 401;

// Integration-first health rollup — one row per lead source, not per tenant. This is what
// turns N per-tenant failure cards into a single "IndiaMART is down for 2 tenants" incident.
// Status reflects ingestion failures only (procState "failed"); AI-enrichment timeouts
// ("partial") are a downstream pipeline issue, not a sign the integration itself is broken.
function computeIntegrationHealth(leads) {
  return LEAD_SOURCES.map((source) => {
    const rows = leads.filter((l) => l.source === source && !l.isTest);
    const failed = rows.filter((l) => l.procState === "failed");
    const successes = rows.filter((l) => l.procState === "success");
    const total = rows.length;
    const errorRate = total ? failed.length / total : 0;
    const status = failed.length === 0 ? "Healthy" : errorRate >= 0.5 ? "Down" : "Degraded";
    const reasonMap = new Map();
    failed.forEach((l) => {
      const reason = l.failureReason || "Unknown error";
      if (!reasonMap.has(reason)) reasonMap.set(reason, new Set());
      reasonMap.get(reason).add(l.tenant);
    });
    const failureGroups = Array.from(reasonMap.entries()).map(([reason, tenantSet]) => ({ reason, tenants: Array.from(tenantSet) }));
    const tenantsAffected = Array.from(new Set(failed.map((l) => l.tenant)));
    const lastSuccess = successes.reduce((latest, l) => {
      const t = new Date(l.receivedAt).getTime();
      return (!latest || t > latest.t) ? { t, label: l.receivedAt } : latest;
    }, null);
    return {
      source, status, total, failedCount: failed.length, tenantsAffected, failureGroups,
      lastSuccessAt: lastSuccess?.label || null,
      isExternal: EXTERNAL_INTEGRATION_SOURCES.has(source),
    };
  });
}

// Partial masks (last 2-4 chars visible) instead of a uniform block — enough for support to
// confirm identity on a call without a reveal request, and it doesn't repeat as visual noise.
const maskPhone = (phone) => { const d = digitsOnly(phone); return `+91 ${"•".repeat(Math.max(0, d.length - 6))}${d.slice(-2)}`; };
const maskName = (name) => { const parts = name.split(" "); return parts.map((p, i) => i === parts.length - 1 ? p[0] + "••••" : "••••").join(" "); };
const maskEmail = (email) => { const [user, domain] = email.split("@"); return `${user.slice(0, 1)}••••@${domain || "•••"}`; };

const LEADS_STORAGE_KEY = "ledsak_leads_v1";
const LEADS_AUDIT_KEY = "ledsak_leads_audit_v1";
const PII_GRANTS_KEY = "ledsak_pii_grants_v1";

const loadLeads = () => { try { const s = localStorage.getItem(LEADS_STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; } };
const saveLeads = (d) => { try { localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(d)); } catch {} };
const loadLeadAudit = () => { try { const s = localStorage.getItem(LEADS_AUDIT_KEY); return s ? JSON.parse(s) : []; } catch { return []; } };
const saveLeadAudit = (d) => { try { localStorage.setItem(LEADS_AUDIT_KEY, JSON.stringify(d)); } catch {} };
const loadPIIGrants = () => { try { const s = localStorage.getItem(PII_GRANTS_KEY); return s ? JSON.parse(s) : []; } catch { return []; } };
const savePIIGrants = (d) => { try { localStorage.setItem(PII_GRANTS_KEY, JSON.stringify(d)); } catch {} };

/* ---- PII Access Request Modal ---- */
function PIIAccessModal({ open, onClose, onGranted, leadId }) {
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
          <div className="rounded-lg px-3 py-2 text-[12px] flex items-start gap-2" style={{ background: T.warningSoft, color: "#92400E" }}>
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
function DuplicateReviewModal({ open, onClose, lead, leads, onMerge, onDismiss, piiGranted }) {
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
          <span className="text-[12px]" style={{ color: "#5B21B6" }}><strong>{match.reason}</strong> · {match.confidence}% confidence</span>
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
function LeadDetailDrawer({ lead, leads, open, onClose, piiGranted, onRequestPII, onReprocess, onStatusChange, onAssign, goToTenant, goToIntegrations }) {
  const [histTab, setHistTab] = useState("details");
  if (!open || !lead) return null;
  const masked = !piiGranted;
  const duplicate = leads.find((l) => l.id === lead.duplicateOf);
  const tier = TENANT_TIER[lead.tenant] || "Growth";
  const procIcon = { success: CheckCircle2, partial: AlertTriangle, failed: XCircle, duplicate: Copy }[lead.procState];
  const procColor = { success: T.success, partial: T.warning, failed: T.danger, duplicate: T.purple };
  return (
    <Drawer open={open} onClose={onClose} width={560}>
      <div className="sticky top-0 bg-white border-b z-10 px-6 pt-5 pb-4 flex items-start justify-between" style={{ borderColor: T.border }}>
        <div className="flex items-center gap-3">
          <Avatar name={lead.name} tone="brand" size={40} />
          <div>
            <div className="text-[15px] font-semibold" style={{ color: T.text }}>{masked ? maskName(lead.name) : lead.name}{lead.isTest && <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: T.warningSoft, color: "#92400E" }}>TEST</span>}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-[12px] font-medium" style={{ color: procColor[lead.procState] }}>{React.createElement(procIcon, { size: 13 })}{lead.procState}</span>
              <span className="text-[12px]" style={{ color: T.text3 }}>{lead.id}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} style={{ color: T.text3 }} /></button>
      </div>
      <div className="px-6 py-5 space-y-4">
        <Tabs tabs={["details", "history"]} value={histTab} onChange={setHistTab} />
        {histTab === "details" && (
          <div className="space-y-4">
            {masked && (
              <div className="rounded-lg border px-4 py-3 flex items-center justify-between" style={{ borderColor: T.border, background: T.warningSoft }}>
                <div className="text-[12px]" style={{ color: "#92400E" }}><Lock size={13} className="inline mr-1" />PII masked — request access to view contact details</div>
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
                    <div className="mt-1.5 space-y-1 font-mono text-[10px] break-all rounded-lg p-2" style={{ background: "#fff", color: T.text2 }}>
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
function LeadsPage({ go }) {
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
            <Button onClick={() => triggerReprocess(reprocessableFailedLeads.map((l) => l.id))} style={{ borderColor: "#F3C6C6", color: T.danger }}>
              <RefreshCw size={14} />Reprocess failed ({reprocessableFailedLeads.length})
            </Button>
          )}
          <Button onClick={handleExport}><Download size={14} />Export {filtered.length > 0 ? `(${filtered.length})` : ""}</Button>
          <button onClick={() => setRefreshTick((n) => n + 1)} className="p-2 rounded-lg border hover:bg-slate-50" title="Refresh" style={{ borderColor: T.border }}><RefreshCw size={14} style={{ color: T.text3 }} /></button>
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
            className={cx("rounded-lg border bg-white transition-all hover:-translate-y-0.5", filter && "cursor-pointer")}
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
                <div key={state} onClick={() => setTileFilter(state)} className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors" style={{ background: active ? T.primarySoft : undefined, border: `1px solid ${active ? T.primary : "transparent"}` }}>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[13px] flex-1" style={{ color: T.text }}>{label}</span>
                  <span className="text-[11px] flex items-center gap-0.5" style={{ color: trendGood === null ? T.text3 : trendGood ? T.success : T.danger }} title="vs prior 24h">
                    {trendDelta !== "steady" && (trendGood ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} className="rotate-90" />)}
                    {trendDelta === "steady" ? "steady" : `${trendDelta} vs prior 24h`}
                  </span>
                  <span className="text-[13px] font-semibold" style={{ color }}>{count}</span>
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "#E4E7F0" }}>
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
              <table className="w-full text-[13px] border-collapse">
                <thead><tr>{["Source", "Leads", "Conv%", "Cost/Lead"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 border-b" style={{ color: T.text3, borderColor: T.border, background: T.subtle }}>{h}</th>
                ))}</tr></thead>
                <tbody>
                  {LEAD_SOURCES_DATA.map((s) => (
                    <tr key={s.source} className="hover:bg-slate-50 cursor-pointer" onClick={() => setTileFilter(setFilterSource, filterSource === s.source ? "All" : s.source)} style={{ background: filterSource === s.source ? T.primarySoft : undefined }}>
                      <td className="px-4 py-2.5 border-b font-medium" style={{ borderColor: T.border, color: T.text }}>{s.source}</td>
                      <td className="px-4 py-2.5 border-b" style={{ borderColor: T.border, color: T.text }}>{s.count.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-2.5 border-b" style={{ borderColor: T.border, color: s.convPct >= 5 ? T.success : T.text }}>{s.convPct}%</td>
                      <td className="px-4 py-2.5 border-b" style={{ borderColor: T.border, color: T.text }}>{s.costPerLead ? `₹${s.costPerLead}` : "Free"}</td>
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
                className="appearance-none pl-2.5 pr-6 py-1.5 rounded-lg border text-[12px] outline-none" style={{ borderColor: value !== "All" ? T.primary : T.border, background: value !== "All" ? T.primarySoft : "#fff", color: T.text }}>
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
            {selectedFailedCount > 0 && <button onClick={bulkReprocessSelected} className="text-[12px] flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-white" style={{ borderColor: T.danger, color: T.danger }}><RefreshCw size={12} />Reprocess failed ({selectedFailedCount})</button>}
            <button onClick={bulkExportSelected} className="text-[12px] flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-white" style={{ borderColor: T.border, color: T.text }}><Download size={12} />Export selected</button>
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
              <Td className="font-mono text-xs" style={{ color: T.text2 }}>{l.id}{l.isTest && <span className="ml-1.5 text-[9px] font-semibold px-1 py-0.5 rounded" style={{ background: T.warningSoft, color: "#92400E" }}>TEST</span>}</Td>
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
              <button key={t} onClick={() => handleReassignTenant(reassignLead.id, t)} className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg border hover:bg-slate-50" style={{ borderColor: T.border }}>
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

/* ---- AI, Automation, Comms, Reports, Logs, Health, Security, Industries, Settings ---- */
function AiPage() {
  const store = useStore();
  return (<>
    <PageHeader title="AI Intelligence" desc="Summarization, scoring and churn prediction usage" actions={<Button variant="primary" onClick={() => store.notify("Model configuration opened")}><Sparkles size={15} /> Configure Models</Button>} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Kpi label="Summaries (30d)" value="4,830" sub="+840" trend="pos" /><Kpi label="Tenants Using AI" value={String(STATS.aiUsed)} sub={`of ${STATS.total}`} trend="warn" />
      <Kpi label="Avg Score Lift" value="+18%" sub="conversion" trend="pos" /><Kpi label="Token Spend" value={fmtINR(41200)} sub="within budget" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2"><CardHeader title="Feature Adoption" /><CardBody>
        <BarList max={100} fmt={(v) => v + "%"} rows={[{ label: "Summarization", value: 86, color: T.primary }, { label: "Scoring", value: 64, color: T.primary }, { label: "Churn prediction", value: 41, color: T.purple }, { label: "Auto-reply drafts", value: 28, color: T.warning }]} />
      </CardBody></Card>
      <Card><CardHeader title="Models" /><CardBody className="space-y-2.5">
        {[["Summarization", "GPT-4o mini", "Live", "success"], ["Scoring", "Custom ML v3", "Live", "success"], ["Churn", "Custom ML v2", "Retraining", "warning"]].map((m, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border" style={{ borderColor: T.border }}>
            <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{m[0]}</div><div className="text-xs" style={{ color: T.text2 }}>{m[1]}</div></div><Badge tone={m[3]}>{m[2]}</Badge>
          </div>
        ))}
      </CardBody></Card>
    </div>
  </>);
}

/* ============================================================
   INTERNAL OPS AUTOMATION — LEDSAK's own tenant-state automations.
   Watches tenant health/renewal/payment/onboarding/status and
   notifies the assigned AM or the tenant. Distinct from the
   tenant-facing "Lead Routing Workflow" / "Active Rules" section
   below (that automates a TENANT's leads; this automates LEDSAK's
   own ops) — that section is untouched.
   ============================================================ */
const OPS_TRIGGER_TYPES = [
  { id: "health_below", label: "Tenant health score crosses a threshold" },
  { id: "renewal_approaching", label: "Subscription/renewal date approaching" },
  { id: "payment_failed", label: "Payment failed / overdue" },
  { id: "onboarding_stalled", label: "Onboarding stalled" },
  { id: "status_change", label: "Tenant status changes" },
];
const OPS_TRIGGER_LABEL = Object.fromEntries(OPS_TRIGGER_TYPES.map((t) => [t.id, t.label]));
const TENANT_STATUSES_FOR_TRIGGER = ["Trial", "Active", "Suspended"];

// Internal staff only — tenants have no login/in-app presence in this admin tool, so a
// tenant-facing action can only ever be email. The action builder below enforces this
// rather than letting you configure an in-app notification that could never be delivered.
const AM_EMAILS = { "Saif Sir": "saif@ledsak.com", "Luv": "luv@ledsak.com", "Vishal": "vishal@ledsak.com" };

const OPS_AUTOMATIONS_KEY = "ledsak_ops_automations_v1";
const AUTOMATION_LOGS_KEY = "ledsak_automation_logs_v1";
const loadOpsAutomations = () => { try { const s = localStorage.getItem(OPS_AUTOMATIONS_KEY); return s ? JSON.parse(s) : null; } catch { return null; } };
const saveOpsAutomations = (d) => { try { localStorage.setItem(OPS_AUTOMATIONS_KEY, JSON.stringify(d)); } catch {} };
const loadAutomationLogs = () => { try { const s = localStorage.getItem(AUTOMATION_LOGS_KEY); return s ? JSON.parse(s) : null; } catch { return null; } };
const saveAutomationLogs = (d) => { try { localStorage.setItem(AUTOMATION_LOGS_KEY, JSON.stringify(d)); } catch {} };

const emptyOpsCondition = (triggerType) => ({
  health_below: { comparison: "below", threshold: 50 },
  renewal_approaching: { daysBefore: 30 },
  payment_failed: { overdueByDays: null },
  onboarding_stalled: { stage: "Any", stuckForDays: 7 },
  status_change: { fromStatus: "", toStatus: "Active" },
}[triggerType]);

function describeOpsTrigger(triggerType, condition) {
  switch (triggerType) {
    case "health_below": return `Health score ${condition.comparison} ${condition.threshold}`;
    case "renewal_approaching": return `Renewal within ${condition.daysBefore} days`;
    case "payment_failed": return condition.overdueByDays ? `Payment overdue ${condition.overdueByDays}+ days` : "Payment failed";
    case "onboarding_stalled": return `Stuck in ${condition.stage === "Any" ? "any stage" : condition.stage}, ${condition.stuckForDays}+ days`;
    case "status_change": return condition.fromStatus ? `${condition.fromStatus} → ${condition.toStatus}` : `Any → ${condition.toStatus}`;
    default: return "—";
  }
}

// Onboarding records don't store a separate "stage entered at" field — this derives it from
// the latest matching activity log entry, so "stuck for N days" reflects real dwell time.
function stageEnteredAt(record) {
  const entry = record.activity.find((a) => a.what === `Stage set to ${record.currentStage}` || a.what.endsWith(`→ ${record.currentStage}`));
  return entry ? entry.when.split(" ").slice(0, 3).join(" ") : record.startedAt;
}

// Resolves who an action actually reaches and whether that's even possible — mirrors real
// failure modes (empty AM field, no tenant contact on record, suspended contact user)
// instead of assuming every send succeeds.
function resolveOpsRecipient(action, tenant, users) {
  if (action.recipientType === "am") {
    if (!tenant.am) return { ok: false, label: "Assigned AM", reason: "AM field empty on tenant record" };
    return { ok: true, label: tenant.am, email: AM_EMAILS[tenant.am] || null };
  }
  const contact = users.find((u) => u.tenant === tenant.name && /admin|ceo/i.test(u.role));
  if (!contact) return { ok: false, label: tenant.name, reason: "No tenant contact on record" };
  if (contact.status === "Suspended") return { ok: false, label: contact.email, reason: "Tenant contact user is suspended" };
  return { ok: true, label: contact.email, email: contact.email };
}

// Pure evaluation against live tenant/onboarding/invoice/history state — used by both
// "Run now" and to seed historical-looking log entries. entityId on Tenant history rows is
// the numeric client id, matched back to a live client record.
function evaluateOpsTrigger(automation, { clients, onboarding, invoices, history }) {
  const { triggerType, condition } = automation;
  const matches = [];
  if (triggerType === "health_below") {
    clients.forEach((c) => {
      const hit = condition.comparison === "below" ? c.health < condition.threshold : c.health > condition.threshold;
      if (hit) matches.push({ tenant: c, firedValue: `health score: ${c.health}, threshold: ${condition.threshold}` });
    });
  } else if (triggerType === "renewal_approaching") {
    clients.forEach((c) => {
      const days = daysUntil(c.planEnd);
      if (days !== null && days >= 0 && days <= condition.daysBefore) matches.push({ tenant: c, firedValue: `renewal in ${days}d (${c.planEnd})` });
    });
  } else if (triggerType === "payment_failed") {
    invoices.filter((i) => i.status === "Failed").forEach((inv) => {
      const c = clients.find((x) => x.name === inv.client);
      if (!c) return;
      const overdueDays = -daysUntil(inv.date);
      if (condition.overdueByDays && overdueDays < condition.overdueByDays) return;
      matches.push({ tenant: c, firedValue: `${inv.id} failed — ${inv.failReason} (${overdueDays}d ago)` });
    });
  } else if (triggerType === "onboarding_stalled") {
    onboarding.forEach((rec) => {
      if (condition.stage !== "Any" && rec.currentStage !== condition.stage) return;
      const stuckDays = -daysUntil(stageEnteredAt(rec));
      if (stuckDays >= condition.stuckForDays) {
        const c = clients.find((x) => x.name === rec.clientName) || { name: rec.clientName, am: rec.owner, health: null };
        matches.push({ tenant: c, firedValue: `stuck in ${rec.currentStage} for ${stuckDays}d` });
      }
    });
  } else if (triggerType === "status_change") {
    history.filter((h) => h.entityType === "Tenant" && h.action === "Status changed").forEach((h) => {
      if (condition.fromStatus && h.prev.status !== condition.fromStatus) return;
      if (h.next.status !== condition.toStatus) return;
      const c = clients.find((x) => x.id === h.entityId);
      if (!c) return;
      matches.push({ tenant: c, firedValue: `${h.prev.status} → ${h.next.status} on ${h.changedDate}` });
    });
  }
  return matches;
}

function simulateOpsRun(automation, match, users, runId, when) {
  const actionResults = automation.actions.map((action) => {
    const r = resolveOpsRecipient(action, match.tenant, users);
    return { actionType: action.type, recipientType: action.recipientType, recipient: r.email || r.label, status: r.ok ? "Sent" : "Failed", failReason: r.ok ? null : r.reason };
  });
  const sentCount = actionResults.filter((a) => a.status === "Sent").length;
  const overallStatus = sentCount === actionResults.length ? "Success" : sentCount === 0 ? "Failed" : "Partial";
  return { id: runId, automationId: automation.id, automationTitle: automation.title, tenantName: match.tenant.name, triggerType: automation.triggerType, firedValue: match.firedValue, when, actions: actionResults, overallStatus };
}

const SEED_OPS_AUTOMATIONS = [
  { id: "auto-1", title: "Health score drop alert", triggerType: "health_below", condition: { comparison: "below", threshold: 50 }, actions: [{ id: "a1", type: "email", recipientType: "am" }, { id: "a2", type: "in_app", recipientType: "am" }], status: "Active", createdBy: "Saif Khan", createdAt: "01 May 2026" },
  { id: "auto-2", title: "Renewal reminder — 30 days out", triggerType: "renewal_approaching", condition: { daysBefore: 30 }, actions: [{ id: "a1", type: "email", recipientType: "tenant" }], status: "Active", createdBy: "Saif Khan", createdAt: "01 May 2026" },
  { id: "auto-3", title: "Payment failure escalation", triggerType: "payment_failed", condition: { overdueByDays: null }, actions: [{ id: "a1", type: "email", recipientType: "am" }, { id: "a2", type: "email", recipientType: "tenant" }], status: "Active", createdBy: "Luv", createdAt: "03 May 2026" },
  { id: "auto-4", title: "Onboarding stalled nudge", triggerType: "onboarding_stalled", condition: { stage: "Any", stuckForDays: 7 }, actions: [{ id: "a1", type: "email", recipientType: "am" }, { id: "a2", type: "in_app", recipientType: "am" }], status: "Active", createdBy: "Vishal", createdAt: "05 May 2026" },
  { id: "auto-5", title: "Trial → Active conversion notice", triggerType: "status_change", condition: { fromStatus: "Trial", toStatus: "Active" }, actions: [{ id: "a1", type: "in_app", recipientType: "am" }], status: "Draft", createdBy: "Saif Khan", createdAt: "10 May 2026" },
];

// Seeds a realistic, time-spread log history by actually running the evaluator against the
// original seed data — so seeded logs can never drift out of sync with what the evaluator
// itself would produce for the same inputs.
function seedAutomationLogs() {
  const ctx = { clients: SEED_CLIENTS, onboarding: SEED_ONBOARDING, invoices: SEED_INVOICES, history: SEED_HISTORY };
  const raw = [];
  let n = 0;
  SEED_OPS_AUTOMATIONS.filter((a) => a.status === "Active").forEach((automation) => {
    evaluateOpsTrigger(automation, ctx).forEach((m) => {
      n++;
      const d = new Date(2026, 4, 13, 9, 0, 0);
      d.setHours(d.getHours() - n * 9);
      raw.push({ automation, match: m, date: d });
    });
  });
  raw.sort((a, b) => b.date - a.date);
  return raw.map((r, i) => simulateOpsRun(r.automation, r.match, SEED_USERS, `run-${1001 + i}`, r.date.toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })));
}
const SEED_AUTOMATION_LOGS = seedAutomationLogs();

const opsStatusTone = { Success: "success", Partial: "warning", Failed: "danger", Sent: "success" };
const opsActionIcon = { email: Mail, in_app: Bell };
const opsActionLabel = { email: "Email", in_app: "In-app notification" };
const opsRecipientLabel = { am: "Assigned Account Manager", tenant: "Tenant" };

/* ---- Condition fields, rendered per selected trigger type ---- */
function OpsConditionFields({ triggerType, condition, onChange }) {
  const fieldCls = "border rounded-lg px-2.5 py-1.5 text-[13px] outline-none";
  const fieldStyle = { borderColor: T.border };
  if (triggerType === "health_below") return (
    <div className="flex items-center gap-2">
      <span className="text-[13px]" style={{ color: T.text2 }}>Health score</span>
      <select value={condition.comparison} onChange={(e) => onChange({ ...condition, comparison: e.target.value })} className={fieldCls} style={fieldStyle}>
        <option value="below">below</option><option value="above">above</option>
      </select>
      <input type="number" value={condition.threshold} onChange={(e) => onChange({ ...condition, threshold: +e.target.value })} className={cx(fieldCls, "w-20")} style={fieldStyle} />
    </div>
  );
  if (triggerType === "renewal_approaching") return (
    <div className="flex items-center gap-2">
      <span className="text-[13px]" style={{ color: T.text2 }}>Days before expiry</span>
      <input type="number" value={condition.daysBefore} onChange={(e) => onChange({ ...condition, daysBefore: +e.target.value })} className={cx(fieldCls, "w-20")} style={fieldStyle} />
    </div>
  );
  if (triggerType === "payment_failed") return (
    <div className="flex items-center gap-2">
      <span className="text-[13px]" style={{ color: T.text2 }}>Overdue by (days) — optional</span>
      <input type="number" placeholder="Any" value={condition.overdueByDays ?? ""} onChange={(e) => onChange({ ...condition, overdueByDays: e.target.value ? +e.target.value : null })} className={cx(fieldCls, "w-24")} style={fieldStyle} />
    </div>
  );
  if (triggerType === "onboarding_stalled") return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[13px]" style={{ color: T.text2 }}>Stage</span>
      <select value={condition.stage} onChange={(e) => onChange({ ...condition, stage: e.target.value })} className={fieldCls} style={fieldStyle}>
        <option value="Any">Any stage</option>{ONBOARD_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <span className="text-[13px]" style={{ color: T.text2 }}>stuck for (days)</span>
      <input type="number" value={condition.stuckForDays} onChange={(e) => onChange({ ...condition, stuckForDays: +e.target.value })} className={cx(fieldCls, "w-20")} style={fieldStyle} />
    </div>
  );
  if (triggerType === "status_change") return (
    <div className="flex items-center gap-2 flex-wrap">
      <select value={condition.fromStatus} onChange={(e) => onChange({ ...condition, fromStatus: e.target.value })} className={fieldCls} style={fieldStyle}>
        <option value="">Any status</option>{TENANT_STATUSES_FOR_TRIGGER.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <ArrowRight size={14} style={{ color: T.text3 }} />
      <select value={condition.toStatus} onChange={(e) => onChange({ ...condition, toStatus: e.target.value })} className={fieldCls} style={fieldStyle}>
        {TENANT_STATUSES_FOR_TRIGGER.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
  return null;
}

/* ---- Create / Edit automation modal ---- */
function OpsAutomationModal({ onClose, onSave, initial }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [triggerType, setTriggerType] = useState(initial?.triggerType || "health_below");
  const [condition, setCondition] = useState(initial?.condition || emptyOpsCondition("health_below"));
  const [actions, setActions] = useState(initial?.actions || [{ id: "a-" + Date.now(), type: "email", recipientType: "am" }]);
  const [status, setStatus] = useState(initial?.status || "Draft");

  const handleTriggerChange = (t) => { setTriggerType(t); setCondition(emptyOpsCondition(t)); };
  const updateAction = (i, patch) => setActions((prev) => prev.map((a, idx) => idx !== i ? a : { ...a, ...patch, ...(patch.type === "in_app" && a.recipientType === "tenant" ? { recipientType: "am" } : {}) }));
  const addAction = () => setActions((prev) => [...prev, { id: "a-" + Date.now(), type: "email", recipientType: "am" }]);
  const removeAction = (i) => setActions((prev) => prev.filter((_, idx) => idx !== i));

  const canSave = title.trim() && actions.length > 0;
  const handleSave = () => {
    if (!canSave) return;
    onSave({ id: initial?.id || "auto-" + Date.now(), title: title.trim(), triggerType, condition, actions, status, createdBy: initial?.createdBy || ADMIN, createdAt: initial?.createdAt || NOW });
  };

  return (
    <Modal open onClose={onClose} title={initial ? "Edit Automation" : "New Automation"}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!canSave} onClick={handleSave}>Save</Button></>}>
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Health score drop alert" className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none" style={{ borderColor: T.border }} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Trigger</label>
          <select value={triggerType} onChange={(e) => handleTriggerChange(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-[13px] outline-none mb-2.5" style={{ borderColor: T.border }}>
            {OPS_TRIGGER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <div className="rounded-lg border p-3" style={{ borderColor: T.border, background: T.subtle }}>
            <OpsConditionFields triggerType={triggerType} condition={condition} onChange={setCondition} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Actions</label>
            <button onClick={addAction} className="text-[12px] font-semibold flex items-center gap-1" style={{ color: T.primary }}><Plus size={13} />Add action</button>
          </div>
          <div className="space-y-2">
            {actions.map((a, i) => (
              <div key={a.id} className="rounded-lg border p-2.5 space-y-1.5" style={{ borderColor: T.border }}>
                <div className="flex items-center gap-2">
                  <select value={a.type} onChange={(e) => updateAction(i, { type: e.target.value })} className="border rounded-lg px-2 py-1.5 text-[12px] outline-none flex-1" style={{ borderColor: T.border }}>
                    <option value="email">Email</option><option value="in_app">In-app notification</option>
                  </select>
                  <select value={a.recipientType} onChange={(e) => updateAction(i, { recipientType: e.target.value })} className="border rounded-lg px-2 py-1.5 text-[12px] outline-none flex-1" style={{ borderColor: T.border }}>
                    <option value="am">Assigned Account Manager</option>
                    <option value="tenant" disabled={a.type === "in_app"}>Tenant</option>
                  </select>
                  {actions.length > 1 && <button onClick={() => removeAction(i)} className="p-1 rounded hover:bg-slate-100 shrink-0"><X size={14} style={{ color: T.text3 }} /></button>}
                </div>
                {a.type === "in_app" && (
                  <div className="text-[11px] flex items-start gap-1" style={{ color: T.text3 }}><Lock size={11} className="shrink-0 mt-0.5" />Tenants have no in-app presence in this admin tool — in-app notifications can only reach internal staff.</div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>Status</label>
          <div className="flex gap-2">
            {["Draft", "Active"].map((s) => (
              <button key={s} onClick={() => setStatus(s)} className="px-3 py-1.5 rounded-lg text-[13px] font-medium border" style={status === s ? { borderColor: T.primary, background: T.primarySoft, color: T.accentText } : { borderColor: T.border, color: T.text2 }}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ---- Automations list (Title, Trigger, Status, Actions) ---- */
function OpsAutomationsSection() {
  const store = useStore();
  const [automations, setAutomationsRaw] = useState(() => loadOpsAutomations() || SEED_OPS_AUTOMATIONS);
  const [logs, setLogsRaw] = useState(() => loadAutomationLogs() || SEED_AUTOMATION_LOGS);
  const [modal, setModal] = useState(null); // { mode: "create" | "edit", automation }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [running, setRunning] = useState(null);

  const setAutomations = (updater) => setAutomationsRaw((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveOpsAutomations(next); return next; });
  const setLogs = (updater) => setLogsRaw((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveAutomationLogs(next); return next; });

  const handleSave = (automation) => {
    setAutomations((prev) => prev.some((a) => a.id === automation.id) ? prev.map((a) => a.id === automation.id ? automation : a) : [automation, ...prev]);
    store.notify(`"${automation.title}" saved`);
    setModal(null);
  };

  const handleDuplicate = (a) => {
    const copy = { ...a, id: "auto-" + Date.now(), title: a.title + " (copy)", status: "Draft" };
    setAutomations((prev) => [copy, ...prev]);
    store.notify(`Duplicated as "${copy.title}"`);
  };

  const handleDelete = () => {
    setAutomations((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    store.notify(`"${deleteTarget.title}" deleted`);
    setDeleteTarget(null);
  };

  const toggleStatus = (a) => {
    const next = { ...a, status: a.status === "Active" ? "Draft" : "Active" };
    setAutomations((prev) => prev.map((x) => x.id === a.id ? next : x));
    store.notify(next.status === "Active" ? `"${a.title}" activated` : `"${a.title}" set to draft`);
  };

  const runNow = (automation) => {
    setRunning(automation.id);
    setTimeout(() => {
      const matches = evaluateOpsTrigger(automation, { clients: store.clients, onboarding: store.onboarding, invoices: store.invoices, history: store.history });
      const newLogs = matches.map((m, i) => simulateOpsRun(automation, m, store.users, `run-${Date.now()}-${i}`, new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })));
      setLogs((prev) => [...newLogs, ...prev]);
      const sent = newLogs.reduce((s, l) => s + l.actions.filter((a) => a.status === "Sent").length, 0);
      const failed = newLogs.reduce((s, l) => s + l.actions.filter((a) => a.status === "Failed").length, 0);
      store.notify(matches.length === 0 ? `"${automation.title}" — no tenants currently match` : `"${automation.title}" ran: ${matches.length} tenant(s) matched · ${sent} sent, ${failed} failed`);
      setRunning(null);
    }, 900);
  };

  return (
    <>
      <Card>
        <CardHeader title="Internal Ops Automation" sub="Watches tenant health, renewals, payments and onboarding — notifies the assigned AM or the tenant"
          action={<Button variant="primary" onClick={() => setModal({ mode: "create" })}><Plus size={15} />New Automation</Button>} />
        <Table head={["Title", "Trigger", "Actions", "Status", ""]}>
          {automations.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-10 text-[13px]" style={{ color: T.text3 }}>No automations yet.</td></tr>
          ) : automations.map((a) => (
            <tr key={a.id} className="hover:bg-[#F8F9FC]">
              <Td className="font-medium">{a.title}</Td>
              <Td>
                <div className="text-[13px]" style={{ color: T.text }}>{OPS_TRIGGER_LABEL[a.triggerType]}</div>
                <div className="text-[11px]" style={{ color: T.text3 }}>{describeOpsTrigger(a.triggerType, a.condition)}</div>
              </Td>
              <Td>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {a.actions.map((act) => { const Icon = opsActionIcon[act.type]; return (
                    <span key={act.id} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full" style={{ background: T.subtle, color: T.text2 }}><Icon size={11} />{opsRecipientLabel[act.recipientType]}</span>
                  ); })}
                </div>
              </Td>
              <Td>
                <button onClick={() => toggleStatus(a)}><Badge tone={a.status === "Active" ? "success" : "gray"}>{a.status}</Badge></button>
              </Td>
              <Td>
                <div className="flex items-center gap-1">
                  {a.status === "Active" && (
                    <button onClick={() => runNow(a)} disabled={running === a.id} title="Run now" className="p-1 rounded hover:bg-slate-100"><PlayCircle size={15} className={running === a.id ? "animate-pulse" : ""} style={{ color: T.success }} /></button>
                  )}
                  <Menu items={[
                    { label: "Edit", icon: Pencil, onClick: () => setModal({ mode: "edit", automation: a }) },
                    { label: "Duplicate", icon: Copy, onClick: () => handleDuplicate(a) },
                    { label: "Delete", icon: Trash2, danger: true, onClick: () => setDeleteTarget(a) },
                  ]} />
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {modal && (
        <OpsAutomationModal
          initial={modal.mode === "edit" ? modal.automation : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <Modal open onClose={() => setDeleteTarget(null)} title="Delete Automation"
          footer={<><Button onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" onClick={handleDelete}><Trash2 size={13} />Delete</Button></>}>
          <p className="text-[13px]" style={{ color: T.text2 }}>Delete <strong style={{ color: T.text }}>{deleteTarget.title}</strong>? Its past run logs stay in Automation Logs, but it will stop firing.</p>
        </Modal>
      )}
    </>
  );
}

/* ---- Run detail drawer — mirrors Queue Monitor's Failed Jobs pattern: exact failure
   reason and payload-equivalent (per-action breakdown), not a bare status badge. ---- */
function AutomationRunDrawer({ run, open, onClose }) {
  if (!open || !run) return null;
  return (
    <Drawer open={open} onClose={onClose} width={480}>
      <div className="sticky top-0 bg-white border-b z-10 px-6 pt-5 pb-4 flex items-start justify-between" style={{ borderColor: T.border }}>
        <div>
          <div className="text-[15px] font-semibold" style={{ color: T.text }}>{run.automationTitle}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge tone={opsStatusTone[run.overallStatus]}>{run.overallStatus}</Badge>
            <span className="text-[12px]" style={{ color: T.text3 }}>{run.id}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} style={{ color: T.text3 }} /></button>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[["Tenant", run.tenantName], ["Run Time", run.when], ["Trigger", OPS_TRIGGER_LABEL[run.triggerType]], ["Fired on", run.firedValue]].map(([k, v]) => (
            <div key={k} className={k === "Fired on" ? "col-span-2" : ""}>
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>{k}</div>
              <div className="text-[13px] mt-0.5" style={{ color: T.text }}>{v}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Actions</div>
          <div className="space-y-2">
            {run.actions.map((a, i) => { const Icon = opsActionIcon[a.actionType]; return (
              <div key={i} className="rounded-lg p-3 space-y-1" style={{ background: a.status === "Sent" ? T.successSoft : T.dangerSoft, border: `1px solid ${a.status === "Sent" ? "#A7F3D0" : "#F3C6C6"}` }}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: T.text }}><Icon size={13} />{opsActionLabel[a.actionType]} → {opsRecipientLabel[a.recipientType]}</span>
                  <Badge tone={a.status === "Sent" ? "success" : "danger"}>{a.status}</Badge>
                </div>
                <div className="text-[12px]" style={{ color: T.text2 }}>{a.recipient || "—"}</div>
                {a.failReason && <div className="text-[11px] px-2 py-1 rounded mt-1" style={{ background: "#FCA5A5", color: "#7F1D1D" }}>{a.failReason}</div>}
              </div>
            ); })}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

/* ---- Automation Logs — Failed/Partial surfaced first, same lesson as Queue Monitor and
   Lead & Record Mgmt: don't bury the runs that need attention in a table of healthy ones. ---- */
function AutomationLogsSection() {
  const [logs] = useState(() => loadAutomationLogs() || SEED_AUTOMATION_LOGS);
  const [view, setView] = useState("attention"); // "attention" | "all"
  const [filterAutomation, setFilterAutomation] = useState("All");
  const [filterTenant, setFilterTenant] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedRun, setSelectedRun] = useState(null);

  const automationTitles = ["All", ...Array.from(new Set(logs.map((l) => l.automationTitle)))];
  const tenantNames = ["All", ...Array.from(new Set(logs.map((l) => l.tenantName)))];

  const filtered = logs.filter((l) => {
    if (view === "attention" && l.overallStatus === "Success") return false;
    if (filterAutomation !== "All" && l.automationTitle !== filterAutomation) return false;
    if (filterTenant !== "All" && l.tenantName !== filterTenant) return false;
    if (filterStatus !== "All" && l.overallStatus !== filterStatus) return false;
    return true;
  });
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);

  const handleExport = () => {
    const rows = filtered.map((l) => ({ id: l.id, automation: l.automationTitle, tenant: l.tenantName, trigger: OPS_TRIGGER_LABEL[l.triggerType], firedValue: l.firedValue, when: l.when, status: l.overallStatus }));
    const csv = [Object.keys(rows[0] || { id: "" }).join(","), ...rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `automation-logs-${Date.now()}.csv`; a.click();
  };

  return (
    <Card className="flex flex-col">
      <CardHeader title="Automation Logs" sub="Every trigger evaluation and action attempt" action={<Button onClick={handleExport}><Download size={14} />Export CSV</Button>} />
      <Tabs tabs={["Needs review", "All runs"]} value={view === "attention" ? "Needs review" : "All runs"} onChange={(v) => { setView(v === "Needs review" ? "attention" : "all"); setPage(1); }} />
      <div className="px-5 py-3 border-b flex flex-wrap gap-2 items-center" style={{ borderColor: T.border }}>
        {[
          { label: "Automation", value: filterAutomation, set: setFilterAutomation, opts: automationTitles },
          { label: "Tenant", value: filterTenant, set: setFilterTenant, opts: tenantNames },
          { label: "Status", value: filterStatus, set: setFilterStatus, opts: ["All", "Success", "Partial", "Failed"] },
        ].map(({ label, value, set, opts }) => (
          <div key={label} className="relative">
            <select value={value} onChange={(e) => { set(e.target.value); setPage(1); }} className="appearance-none pl-2.5 pr-6 py-1.5 rounded-lg border text-[12px] outline-none" style={{ borderColor: value !== "All" ? T.primary : T.border, background: value !== "All" ? T.primarySoft : "#fff", color: T.text }}>
              {opts.map((o) => <option key={o} value={o}>{o === "All" ? `All ${label === "Status" ? "Statuses" : label + "s"}` : o}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
          </div>
        ))}
        <span className="text-[12px] ml-auto" style={{ color: T.text3 }}>{filtered.length} runs</span>
      </div>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
      <Table head={["Automation", "Tenant", "Trigger", "Run Time", "Status", ""]}>
        {pageRows.length === 0 ? (
          <tr><td colSpan={6} className="text-center py-10 text-[13px]" style={{ color: T.text3 }}>No runs match the current filters.</td></tr>
        ) : pageRows.map((l) => (
          <tr key={l.id} className="hover:bg-[#F8F9FC] cursor-pointer" onClick={() => setSelectedRun(l)}>
            <Td className="font-medium">{l.automationTitle}</Td>
            <Td>{l.tenantName}</Td>
            <Td className="text-[12px]" style={{ color: T.text2 }}>{OPS_TRIGGER_LABEL[l.triggerType]}</Td>
            <Td className="text-[11px] whitespace-nowrap" style={{ color: T.text2 }}>{l.when}</Td>
            <Td><Badge tone={opsStatusTone[l.overallStatus]}>{l.overallStatus}</Badge></Td>
            <Td><button onClick={(e) => { e.stopPropagation(); setSelectedRun(l); }} className="p-1 rounded hover:bg-slate-100"><Eye size={14} style={{ color: T.text3 }} /></button></Td>
          </tr>
        ))}
      </Table>
      <AutomationRunDrawer run={selectedRun} open={!!selectedRun} onClose={() => setSelectedRun(null)} />
    </Card>
  );
}

function AutomationPage() {
  const store = useStore();
  const [tab, setTab] = useState("Lead Routing");
  const [rules, setRules] = useState([
    { id: 1, name: "Auto-assign leads", trigger: "New lead", on: true }, { id: 2, name: "Idle lead nudge", trigger: "48h no contact", on: true },
    { id: 3, name: "Churn watch", trigger: "Health < 50", on: true }, { id: 4, name: "Renewal reminder", trigger: "30d before expiry", on: false },
  ]);
  const steps = [{ icon: Zap, t: "Trigger: New lead from CarWale", d: "Webhook received", tone: T.primary }, { icon: Bot, t: "AI: Summarize & score", d: "OpenAI enrichment", tone: T.purple }, { icon: Send, t: "Assign to telecaller", d: "Round-robin by brand", tone: T.success }];
  return (<>
    <PageHeader title="Automation Center" desc={tab === "Lead Routing" ? "Workflows, triggers and lead-routing rules" : tab === "Internal Ops" ? "LEDSAK's own tenant-state automations — not tenant-facing" : "Every trigger evaluation and action attempt"} />
    <Tabs tabs={["Lead Routing", "Internal Ops", "Automation Logs"]} value={tab} onChange={setTab} />
    {tab === "Lead Routing" && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2"><CardHeader title="Lead Routing Workflow" sub="Active · 12,480 runs this month" action={<Badge tone="success">Running</Badge>} /><CardBody className="space-y-2">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex gap-3 items-center rounded-lg border p-3.5" style={{ borderColor: i === 0 ? T.primary : T.border, boxShadow: "0 1px 2px rgba(26,31,54,.05)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}><s.icon size={18} style={{ color: s.tone }} /></div>
                <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{s.t}</div><div className="text-xs" style={{ color: T.text2 }}>{s.d}</div></div>
              </div>
              {i < steps.length - 1 && <div className="text-center text-sm" style={{ color: T.text3 }}>↓</div>}
            </React.Fragment>
          ))}
        </CardBody></Card>
        <Card><CardHeader title="Active Rules" /><CardBody className="space-y-1">
          {rules.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: T.border }}>
              <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{r.name}</div><div className="text-xs" style={{ color: T.text2 }}><Zap size={11} style={{ color: T.primary, display: "inline", marginRight: 3 }} />{r.trigger}</div></div>
              <Switch on={r.on} onClick={() => { setRules((rs) => rs.map((x) => x.id === r.id ? { ...x, on: !x.on } : x)); store.notify(r.on ? "Rule paused" : "Rule enabled"); }} />
            </div>
          ))}
        </CardBody></Card>
      </div>
    )}
    {tab === "Internal Ops" && <OpsAutomationsSection />}
    {tab === "Automation Logs" && <AutomationLogsSection />}
  </>);
}

function CommsPage() {
  const store = useStore();
  return (<>
    <PageHeader title="Communication Center" desc="WhatsApp, SMS and email delivery" actions={<Button variant="primary" onClick={() => store.notify("Broadcast composer opened")}><Send size={15} /> New Broadcast</Button>} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Kpi label="Sent (30d)" value="182,400" sub="all channels" trend="pos" /><Kpi label="Delivery Rate" value="97.8%" sub="above target" trend="pos" />
      <Kpi label="WhatsApp Read" value="71%" sub="open rate" trend="pos" /><Kpi label="Failed" value="1.2%" sub="invalid numbers" trend="warn" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2"><CardHeader title="Channel Volume" /><CardBody>
        <BarList max={120000} fmt={(v) => v.toLocaleString("en-IN")} rows={[{ label: "WhatsApp", value: 108000, color: T.success }, { label: "SMS", value: 46000, color: T.primary }, { label: "Email", value: 28400, color: T.purple }]} />
      </CardBody></Card>
      <Card><CardHeader title="Templates" /><CardBody className="space-y-2">
        {[["Lead welcome", "WhatsApp", Mail], ["Renewal reminder", "Email", Clock], ["Missed-call follow-up", "SMS", Phone]].map((t, i) => { const Icon = t[2]; return (
          <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg border" style={{ borderColor: T.border }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}><Icon size={15} style={{ color: T.primary }} /></div>
            <div className="flex-1"><div className="text-[13px] font-medium" style={{ color: T.text }}>{t[0]}</div><div className="text-xs" style={{ color: T.text2 }}>{t[1]}</div></div><Badge tone="success">Approved</Badge>
          </div>); })}
      </CardBody></Card>
    </div>
  </>);
}

function ReportsPage() {
  const store = useStore();
  const reports = [["Monthly revenue summary", "Finance", "1st of month"], ["Tenant health digest", "Success", "Weekly · Mon"], ["Lead source performance", "Sales", "Weekly · Fri"], ["AI usage & spend", "Ops", "Monthly"], ["Churn cohort analysis", "Success", "Manual"]];
  return (<>
    <PageHeader title="Reports & BI" desc="Saved reports, scheduled exports and dashboards" actions={<Button variant="primary" onClick={() => store.notify("New report created")}><Plus size={15} /> New Report</Button>} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Kpi label="Saved Reports" value="28" sub="12 scheduled" /><Kpi label="Exports (30d)" value="146" sub="PDF + CSV" trend="pos" /><Kpi label="Dashboards" value="9" sub="shared" /><Kpi label="Scheduled" value="12" sub="auto-delivered" />
    </div>
    <Card><CardHeader title="Saved Reports" />
      <Table head={["Report", "Category", "Schedule", ""]}>
        {reports.map((r, i) => (
          <tr key={i} className="hover:bg-[#F8F9FC]">
            <Td><div className="flex items-center gap-2.5"><FileText size={16} style={{ color: T.primary }} /><span className="font-medium">{r[0]}</span></div></Td>
            <Td><Badge tone="gray">{r[1]}</Badge></Td><Td className="text-xs" style={{ color: T.text2 }}>{r[2]}</Td>
            <Td><div className="flex gap-1"><button onClick={() => store.notify(`Running ${r[0]}`)} className="p-1 rounded hover:bg-slate-100" title="Run"><PlayCircle size={15} style={{ color: T.primary }} /></button><button onClick={() => store.notify("Downloaded")} className="p-1 rounded hover:bg-slate-100"><Download size={15} style={{ color: T.text3 }} /></button></div></Td>
          </tr>
        ))}
      </Table>
    </Card>
  </>);
}

function LogsPage() {
  const store = useStore();
  const [typeFilter, setTypeFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const logs = [
    { time: "10:42:18", actor: "Saif Khan", action: "Updated plan for Dermalife", type: "Billing", ip: "103.21.x.x" },
    { time: "10:31:05", actor: "system", action: "Retried invoice INV-2453", type: "System", ip: "—" },
    { time: "09:58:44", actor: "Luv", action: "Impersonated priya@dermapuritys.com", type: "Access", ip: "103.21.x.x" },
    { time: "09:40:12", actor: "Saif Khan", action: "Suspended Rezoni user", type: "Access", ip: "103.21.x.x" },
    { time: "09:12:30", actor: "system", action: "Feature flag 'AI Churn' enabled", type: "Config", ip: "—" },
    { time: "08:55:01", actor: "Vishal", action: "Exported revenue report", type: "Data", ip: "49.36.x.x" },
  ];
  const tone = { Billing: "brand", System: "gray", Access: "warning", Config: "purple", Data: "success" };
  const types = ["All", ...Array.from(new Set(logs.map((l) => l.type)))];
  const filtered = typeFilter === "All" ? logs : logs.filter((l) => l.type === typeFilter);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="Logs & Audit Trail" desc="Admin actions and forensic history · retained 7 years" actions={<>
        <div className="relative">
          <Button onClick={() => setFilterOpen((o) => !o)} onBlur={() => setTimeout(() => setFilterOpen(false), 150)}><Filter size={15} /> {typeFilter === "All" ? "Filter" : typeFilter}</Button>
          {filterOpen && (
            <div className="absolute right-0 top-9 z-20 w-40 rounded-lg border bg-white py-1 shadow-lg" style={{ borderColor: T.border }}>
              {types.map((t) => (
                <button key={t} onMouseDown={() => setTypeFilter(t)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left hover:bg-slate-50" style={{ color: T.text }}>{t}</button>
              ))}
            </div>
          )}
        </div>
        <Button onClick={() => store.notify("Audit log exported")}><Download size={15} /> Export</Button>
      </>} />
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden"><CardHeader title="Recent Activity" sub="Live · newest first" />
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={["Time", "Actor", "Action", "Type", "IP"]}>
          {pageRows.map((l, i) => (
            <tr key={i} className="hover:bg-[#F8F9FC]">
              <Td className="font-mono text-xs" style={{ color: T.text2 }}>{l.time}</Td><Td className="font-medium">{l.actor}</Td><Td>{l.action}</Td><Td><Badge tone={tone[l.type]}>{l.type}</Badge></Td><Td className="font-mono text-xs" style={{ color: T.text3 }}>{l.ip}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

function HealthPage() {
  const store = useStore();
  const svc = [{ n: "API Gateway", s: "Operational", up: "99.98%", icon: Server }, { n: "Lead Ingestion", s: "Operational", up: "99.95%", icon: Database }, { n: "AI Enrichment", s: "Degraded", up: "97.20%", icon: Bot }, { n: "Webhooks", s: "Operational", up: "99.90%", icon: Wifi }];
  const st = { Operational: "success", Degraded: "warning", Down: "danger" };
  return (<>
    <PageHeader title="System Health" desc="Real-time service status and uptime" actions={<Button onClick={() => store.notify("Status refreshed")}><RefreshCw size={15} /> Refresh</Button>} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Kpi label="Uptime (30d)" value="99.94%" sub="SLA 99.9%" trend="pos" /><Kpi label="Avg Latency" value="142ms" sub="p95" /><Kpi label="Error Rate" value="0.08%" sub="within threshold" trend="pos" /><Kpi label="Incidents" value="1" sub="AI degraded" trend="warn" />
    </div>
    <Card><CardHeader title="Services" />
      <Table head={["Service", "Status", "Uptime (30d)"]}>
        {svc.map((s, i) => (
          <tr key={i} className="hover:bg-[#F8F9FC]">
            <Td><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: T.subtle }}><s.icon size={15} style={{ color: T.text2 }} /></div><span className="font-medium">{s.n}</span></div></Td>
            <Td><Badge tone={st[s.s]}>{s.s}</Badge></Td><Td className="font-medium">{s.up}</Td>
          </tr>
        ))}
      </Table>
    </Card>
  </>);
}

function SecurityPage() {
  const store = useStore();
  const [tab, setTab] = useState("Roles");
  const [policies, setPolicies] = useState([["Enforce 2FA for admins", true], ["Require SSO for Brand CEOs", true], ["Auto-expire sessions (12h)", true], ["IP allowlist for platform admin", false]]);
  const roles = [["Super Admin (CMO)", "Full platform", 3, "All"], ["Brand CEO", "Single brand", 12, "Brand data, users, reports"], ["Team Lead", "Team", 48, "Assign leads, view team"], ["Telecaller", "Own leads", 2085, "View & update own leads"]];
  return (<>
    <PageHeader title="Security & Access" desc="Roles matching the 4-tier tenant hierarchy, sessions and policies" actions={<Button variant="primary" onClick={() => store.notify("New role created")}><Plus size={15} /> New Role</Button>} />
    <Tabs tabs={["Roles", "Sessions", "Policies"]} value={tab} onChange={setTab} />
    {tab === "Roles" && <Card><Table head={["Role", "Scope", "Users", "Permissions", ""]}>
      {roles.map((r, i) => (<tr key={i} className="hover:bg-[#F8F9FC]"><Td><div className="flex items-center gap-2.5"><ShieldCheck size={16} style={{ color: T.primary }} /><span className="font-medium">{r[0]}</span></div></Td><Td className="text-xs" style={{ color: T.text2 }}>{r[1]}</Td><Td>{r[2].toLocaleString("en-IN")}</Td><Td className="text-xs" style={{ color: T.text2 }}>{r[3]}</Td><Td><button onClick={() => store.notify(`Editing ${r[0]}`)} className="p-1 rounded hover:bg-slate-100"><Pencil size={15} style={{ color: T.text3 }} /></button></Td></tr>))}
    </Table></Card>}
    {tab === "Sessions" && <Card><Table head={["User", "Device", "Location", "Started", ""]}>
      {[["Saif Khan", "Chrome · macOS", "New Delhi", "2h ago"], ["Luv", "Safari · iPhone", "Delhi", "22m ago"], ["Vishal", "Chrome · Windows", "Mumbai", "1h ago"]].map((s, i) => (<tr key={i} className="hover:bg-[#F8F9FC]"><Td className="font-medium">{s[0]}</Td><Td className="text-xs" style={{ color: T.text2 }}>{s[1]}</Td><Td className="text-xs" style={{ color: T.text2 }}>{s[2]}</Td><Td className="text-xs" style={{ color: T.text2 }}>{s[3]}</Td><Td><Button size="sm" variant="danger" onClick={() => store.notify(`Session revoked — ${s[0]}`)}><XCircle size={13} /> Revoke</Button></Td></tr>))}
    </Table></Card>}
    {tab === "Policies" && <Card><CardBody className="space-y-3">
      {policies.map((p, i) => (<div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: T.border }}><div className="flex items-center gap-2.5"><Lock size={16} style={{ color: T.text2 }} /><span className="text-[13px] font-medium" style={{ color: T.text }}>{p[0]}</span></div><Switch on={p[1]} onClick={() => { setPolicies((ps) => ps.map((x, j) => j === i ? [x[0], !x[1]] : x)); store.notify("Policy updated"); }} /></div>))}
    </CardBody></Card>}
  </>);
}

function IndustriesPage() {
  const store = useStore();
  const verts = [["Automotive Dealership", Car, 48, "brand", "Multi-brand showroom workflow"], ["Healthcare / Clinic", Stethoscope, 37, "purple", "Patient lead + EMR bridge"], ["Education", GraduationCap, 38, "success", "Admissions funnel"], ["Ecommerce", ShoppingCart, 26, "warning", "Abandoned-cart recovery"], ["Real Estate", Building2, 45, "gray", "Site-visit scheduling"], ["Other / Custom", LayoutTemplate, 121, "gray", "Blank starter workflow"]];
  return (<>
    <PageHeader title="Industries & Templates" desc="Vertical presets and onboarding workflow templates" actions={<Button variant="primary" onClick={() => store.notify("New template created")}><Plus size={15} /> New Template</Button>} />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {verts.map((v, i) => { const Icon = v[1]; return (
        <div key={i} className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow" style={{ borderColor: T.border, boxShadow: "0 1px 2px rgba(26,31,54,.05)" }}>
          <div className="flex items-start justify-between mb-3"><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: T.primarySoft }}><Icon size={18} style={{ color: T.primary }} /></div><Badge tone={v[3]}>{v[2]} tenants</Badge></div>
          <div className="text-[14px] font-semibold" style={{ color: T.text }}>{v[0]}</div><div className="text-xs mb-3" style={{ color: T.text2 }}>{v[4]}</div>
          <Button size="sm" className="w-full justify-center" onClick={() => store.notify(`Editing ${v[0]} template`)}><Pencil size={13} /> Edit template</Button>
        </div>); })}
    </div>
  </>);
}

function SettingsPage() {
  const store = useStore();
  const [tab, setTab] = useState("Company");
  const [flags, setFlags] = useState({ ai: true, churn: true, collect: false, emr: true, dms: false, reseller: false });
  return (<>
    <PageHeader title="Settings" desc="Company profile, feature flags and compliance" actions={<Button variant="primary" onClick={() => store.notify("Settings saved")}><CheckCircle2 size={15} /> Save Changes</Button>} />
    <Tabs tabs={["Company", "Feature Flags", "Compliance"]} value={tab} onChange={setTab} />
    {tab === "Company" && <Card><CardHeader title="Company Profile" /><CardBody><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Company Name">LEDSAK Technologies Pvt Ltd</Field><Field label="GST Number"><span className="font-mono">07AAFCL9438H1Z5</span></Field>
      <Field label="Founder / CEO">Saif Khan</Field><Field label="Founded">2023</Field>
      <div className="sm:col-span-2"><Field label="Registered Office">Block-D, Balaji Estate, Kalkaji, New Delhi 110019</Field></div>
      <Field label="Currency">INR (₹)</Field><Field label="Timezone">Asia/Kolkata (IST)</Field>
    </div></CardBody></Card>}
    {tab === "Feature Flags" && <Card><CardBody className="space-y-1">
      {[["ai", "AI Lead Summarization", "OpenAI-powered context", "Global"], ["churn", "AI Churn Prediction", "ML on success", "Global"], ["collect", "LEDSAK Collect", "1.5% take-rate", "Beta · 3 clients"], ["emr", "EMR Bridge (Cliniceo)", "Two-way sync", "Healthcare only"], ["dms", "Dealership DMS Bridge", "Two-way sync", "Beta · 1 client"], ["reseller", "Reseller Program", "White-label & splits", "Disabled"]].map(([k, label, desc, env]) => (
        <div key={k} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: T.border }}><div><div className="text-[13px] font-medium" style={{ color: T.text }}>{label}</div><div className="text-xs" style={{ color: T.text2 }}>{desc} · {env}</div></div><Switch on={flags[k]} onClick={() => { setFlags((f) => ({ ...f, [k]: !f[k] })); store.notify("Flag updated"); }} /></div>
      ))}
    </CardBody></Card>}
    {tab === "Compliance" && <Card><CardBody className="space-y-2">
      {[[ShieldCheck, "DPDP Act 2023 — Compliant", "Consent · retention · PII masking", "Active", "success"], [HeartHandshake, "ABDM (Ayushman Bharat)", "ABHA ID · for Clinic OS", "In Progress", "warning"], [CheckCircle2, "ISO 27001", "Certified · audit Aug 2026", "Active", "success"], [Globe, "HIPAA-ready", "BAA template available", "Ready", "gray"]].map((c, i) => { const Icon = c[0]; return (
        <div key={i} className="flex gap-3 items-center p-3 rounded-lg border" style={{ borderColor: T.border }}><div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}><Icon size={16} style={{ color: T.primary }} /></div><div className="flex-1"><div className="text-[13px] font-medium" style={{ color: T.text }}>{c[1]}</div><div className="text-xs" style={{ color: T.text2 }}>{c[2]}</div></div><Badge tone={c[4]}>{c[3]}</Badge></div>); })}
    </CardBody></Card>}
  </>);
}

/* ============================================================
   NAV + SHELL
/* ============================================================
   SUBSCRIPTIONS & PLANS MODULE
   ============================================================ */
const SP_TABS = ["Overview", "Plan Library", "Addon Pricing", "Client Subscriptions", "Revenue"];

/* --- PLAN FORM (Create / Edit / Duplicate) --- */
// Total monthly cost implied by the resource builder (both plan types price this way) —
// shared by the live summary panel and the auto-synced Monthly Price field.
function planResourceTotal(f) {
  return CUSTOM_RESOURCES.reduce((s, r) => s + (Number(f[r.qtyK]) || 0) * (Number(f[r.priceK]) || 0), 0) +
    (f.integrationsList || []).reduce((s, it) => s + (Number(it.price) || 0), 0) +
    (f.dealsModuleEnabled ? (Number(f.dealsModulePrice) || 0) : 0);
}
const YEARLY_DISCOUNT_OPTIONS = [0, 5, 10, 15, 20, 25];

function PlanForm({ initial, onSave, onCancel, onAssign, mode, clients }) {
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
          <select value={assignClientId} onChange={(e) => setAssignClientId(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: errors.assignClientId ? T.danger : T.border, background: "#fff" }}>
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
            ? <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: T.purpleSoft, color: "#5B21B6" }}>Custom — priced per resource for this client</span>
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
                    <button onClick={() => u("integrationsList", f.integrationsList.filter((_, xi) => xi !== i))} className="p-2 rounded-lg hover:bg-slate-100" title="Remove"><Trash2 size={15} style={{ color: T.danger }} /></button>
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
function PlanLibrary({ onAssignSubscription }) {
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
                style={{ background: assignMode === v ? T.primary : "#fff", color: assignMode === v ? "#fff" : T.text2 }}>
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
function AddonPricingPage() {
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
function SubscriptionAssign({ onClose, editSub, presetPlanId }) {
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
        <div key={s} className="flex-1 h-1 rounded-full" style={{ background: s <= step ? T.primary : "#E4E7F0" }} />
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
          <button key={c.id} onClick={() => { setCompanyId(c.id); setStep(presetPlanId ? 3 : 2); }} className={cx("w-full flex items-center gap-3 p-3 rounded-lg border text-left transition", companyId === c.id ? "ring-2" : "hover:bg-slate-50")}
            style={{ borderColor: companyId === c.id ? T.primary : T.border, "--tw-ring-color": T.ring }}>
            <Avatar name={c.name} /><div><div className="text-[13px] font-medium" style={{ color: T.text }}>{c.name}</div><div className="text-[11px]" style={{ color: T.text2 }}>{c.industry} · {c.branch}</div></div>
          </button>
        ))}
      </div>)}

      {/* Step 2: Plan */}
      {step === 2 && (<div className="space-y-3">
        <div className="text-[13px] font-semibold" style={{ color: T.text }}>Step 2 — Choose Plan</div>
        {store.spPlans.filter((p) => p.status === "Active").map((p) => (
          <button key={p.id} onClick={() => { setPlanId(p.id); if (p.planType === "Custom") setQuotedPrice(p.monthlyPrice); setStep(3); }} className={cx("w-full flex items-center justify-between p-3 rounded-lg border text-left transition", planId === p.id ? "ring-2" : "hover:bg-slate-50")}
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
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: T.purpleSoft, color: "#5B21B6" }}>Custom plan — set the quoted price directly</span>
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
function SubscriptionDetail({ sub, onClose }) {
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
          <div className="flex gap-2">{statusBadge(s.status)}<button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X size={18} style={{ color: T.text3 }} /></button></div>
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
function ClientSubscriptions({ presetPlanId, onConsumePreset }) {
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
function SubsOverview() {
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

function SubsRevenue() {
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
              <div className="rounded-lg p-3" style={{ background: "#F3F0FF" }}>
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
function SubsPlansPage() {
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
/* ============================================================
   NAV — updated: consolidated Subscriptions & Plans module
   ============================================================ */
const DASHBOARD_ITEM = { id: "dashboard", label: "Dashboard", icon: LayoutDashboard };
const SETTINGS_ITEM = { id: "settings", label: "Settings", icon: Settings };
const NAV = [
  { section: "Core", items: [{ id: "clients", label: "Clients", icon: Store, badge: "15" }, { id: "onboarding", label: "Onboarding", icon: Rocket, badge: "5" }, { id: "users", label: "CRM Users", icon: Users }] },
  { section: "Revenue", items: [{ id: "subs", label: "Subscriptions & Plans", icon: CreditCard }, { id: "cs", label: "Customer Success", icon: HeartHandshake, badge: "5" }] },
  { section: "Data & Intelligence", items: [{ id: "leads", label: "Lead & Record Mgmt", icon: Database }, { id: "automation", label: "Automation Center", icon: Bot }, { id: "ai", label: "AI Intelligence", icon: Sparkles }] },
  { section: "Operations", items: [{ id: "integrations", label: "Integrations", icon: Plug, badge: "!" }, { id: "comms", label: "Communication Center", icon: Send }, { id: "reports", label: "Reports & BI", icon: BarChart3 }] },
  { section: "Reliability", items: [{ id: "queues", label: "Queue Monitor", icon: Layers, badge: "5" }, { id: "logs", label: "Logs & Audit Trail", icon: ListChecks }, { id: "health", label: "System Health", icon: Activity }] },
  { section: "Governance", items: [{ id: "security", label: "Security & Access", icon: ShieldCheck }, { id: "support", label: "Support & Tickets", icon: Headset, badge: "6" }] },
  { section: "Configuration", items: [{ id: "industries", label: "Industries & Templates", icon: LayoutTemplate }] },
];
const PAGE_TITLES = Object.fromEntries([DASHBOARD_ITEM, SETTINGS_ITEM, ...NAV.flatMap((g) => g.items)].map((it) => [it.id, it.label]));

function NavButton({ item, active, onNav, collapsed }) {
  const on = item.id === active; const Icon = item.icon;
  return (
    <button onClick={() => onNav(item.id)} title={collapsed ? item.label : undefined}
      className={cx("w-full my-px flex items-center rounded-md text-[13px] text-left transition-colors", collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2")}
      style={on ? { background: "#fff", color: T.primary, fontWeight: 600, boxShadow: "0 1px 2px rgba(0,0,0,.12)" } : { background: "transparent", color: T.sidebarText }}
      onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = T.sidebarHover; }} onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
      <Icon size={17} className="shrink-0" />
      {!collapsed && <span className="flex-1">{item.label}</span>}
      {!collapsed && item.badge && <span className="text-[10px] px-1.5 py-px rounded-full font-semibold" style={on ? { background: item.badge === "!" ? T.danger : T.primary, color: "#fff" } : { background: item.badge === "!" ? T.danger : "rgba(255,255,255,.25)", color: "#fff" }}>{item.badge}</span>}
    </button>
  );
}

/* ============================================================
   SIDEBAR — collapsible groups (plain text section label + chevron),
   expanded by default. Dashboard pinned top / Settings pinned bottom.
   Also supports a collapsed icon-rail mode toggled from the Topbar.
   ============================================================ */
function Sidebar({ active, onNav, collapsed }) {
  const [open, setOpen] = useState(() => Object.fromEntries(NAV.map((g) => [g.section, true])));
  const toggle = (s) => setOpen((o) => ({ ...o, [s]: !o[s] }));
  return (
    <aside className={cx("shrink-0 flex flex-col h-full transition-[width] duration-150", collapsed ? "w-[72px]" : "w-[248px]")} style={{ background: T.sidebar, overflow: "hidden", borderRadius: "0 16px 16px 0", boxShadow: "0 4px 24px rgba(0,0,0,.18)" }}>
      {/* Brand — fixed, never scrolls */}
      <div className="flex items-center justify-center px-5 py-[18px] border-b shrink-0" style={{ borderColor: T.sidebarHover }}>
        {collapsed ? (
          <div className="w-7 h-6 overflow-hidden shrink-0"><img src={ledsakLogo} alt="LEDSAK" className="h-6 w-auto max-w-none" /></div>
        ) : (
          <img src={ledsakLogo} alt="LEDSAK" className="h-6 w-auto" />
        )}
      </div>
      {/* Nav groups — collapsible via chevron, expanded by default. Dashboard scrolls as
          the first item here rather than being pinned separately above. */}
      <nav className="flex-1 py-2 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: T.sidebarHover + " transparent" }}>
        <div className="px-2 mb-2">
          <NavButton item={DASHBOARD_ITEM} active={active} onNav={onNav} collapsed={collapsed} />
        </div>
        {NAV.map((g) => {
          const isOpen = !!open[g.section]; const hasActive = g.items.some((it) => it.id === active);
          return (
            <div key={g.section} className="mb-3">
              {!collapsed && (
                <button onClick={() => toggle(g.section)} className="w-full flex items-center gap-1 px-4 mb-1 text-[11px] font-medium transition-colors" style={{ color: T.sidebarMuted }}>
                  <ChevronDown size={12} className="transition-transform" style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }} />
                  <span className="flex-1 text-left">{g.section}</span>
                  {!isOpen && hasActive && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#fff" }} />}
                </button>
              )}
              {(collapsed || isOpen) && g.items.map((it) => (
                <div key={it.id} className="px-2">
                  <NavButton item={it} active={active} onNav={onNav} collapsed={collapsed} />
                </div>
              ))}
            </div>
          );
        })}
      </nav>
      {/* Settings — pinned to the absolute bottom, outside any group */}
      <div className="px-2 pb-2 pt-1 border-t shrink-0" style={{ borderColor: T.sidebarHover }}>
        <NavButton item={SETTINGS_ITEM} active={active} onNav={onNav} collapsed={collapsed} />
      </div>
    </aside>
  );
}

/* ============================================================
   NOTIFICATIONS PANEL (unchanged)
   ============================================================ */
function NotifPanel({ open, onClose, onGo }) {
  const store = useStore();
  const iconMap = { danger: [TriangleAlert, T.danger], warning: [AlertTriangle, T.warning], success: [CheckCircle2, T.success], info: [CircleDot, T.primary] };
  if (!open) return null;
  return (
    <div className="absolute right-0 top-11 z-30 w-80 rounded-xl border bg-white shadow-xl" style={{ borderColor: T.border }} onMouseDown={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: T.border }}>
        <span className="text-[14px] font-semibold" style={{ color: T.text }}>Notifications</span>
        <button onClick={store.markAllRead} className="text-xs font-medium" style={{ color: T.primary }}>Mark all read</button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {store.notifs.map((n) => { const [Ic, col] = iconMap[n.icon]; return (
          <button key={n.id} onClick={() => { store.markNotifRead(n.id); onGo(n.page); onClose(); }} className="w-full flex gap-3 items-start px-4 py-3 text-left border-b hover:bg-slate-50" style={{ borderColor: T.border, background: n.read ? "#fff" : T.subtle }}>
            <Ic size={16} style={{ color: col, marginTop: 2 }} />
            <div className="flex-1"><div className="text-[13px]" style={{ color: T.text, fontWeight: n.read ? 400 : 600 }}>{n.title}</div><div className="text-[11px] mt-0.5" style={{ color: T.text3 }}>{n.time}</div></div>
            {!n.read && <span className="w-2 h-2 rounded-full mt-1.5" style={{ background: T.primary }} />}
          </button>
        ); })}
      </div>
    </div>
  );
}

/* ============================================================
   PROFILE DROPDOWN — new, for header
   ============================================================ */
function ProfileDropdown({ onGo }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition" style={{ background: "rgba(255,255,255,.12)" }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[11px]" style={{ background: "#fff", color: T.primary }}>SK</div>
        <div className="text-left hidden sm:block"><div className="text-[12px] font-medium leading-tight text-white">Saif Khan</div><div className="text-[10px]" style={{ color: "rgba(255,255,255,.6)" }}>Super Admin</div></div>
        <ChevronDown size={14} style={{ color: "rgba(255,255,255,.6)" }} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-30 w-52 rounded-xl border bg-white shadow-xl py-1" style={{ borderColor: T.border }} onMouseDown={(e) => e.stopPropagation()}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: T.border }}>
            <div className="text-[13px] font-medium" style={{ color: T.text }}>Saif Khan</div>
            <div className="text-[11px]" style={{ color: T.text2 }}>Founder · Super Admin</div>
          </div>
          <button onMouseDown={() => { onGo("settings"); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-left hover:bg-slate-50" style={{ color: T.text }}><UserCog size={14} /> Profile & Settings</button>
          <button onMouseDown={() => store.notify("Logged out")} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-left hover:bg-slate-50" style={{ color: T.danger }}><LogOut size={14} /> Log Out</button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TOPBAR — sidebar collapse toggle, page title, last-synced indicator,
   checked-in/out toggle, profile. No global search — search now lives
   only on the individual pages that need it (e.g. Tenants/Clients).
   ============================================================ */
// Every localStorage key any page in the app writes to — a single source of truth so the
// global "reset demo data" action (and nothing else) knows what it's allowed to wipe.
const ALL_DEMO_STORAGE_KEYS = [ONBOARD_STORAGE_KEY, LEADS_STORAGE_KEY, LEADS_AUDIT_KEY, PII_GRANTS_KEY];

function Topbar({ onGo, active, collapsed, onToggleCollapse }) {
  const store = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [checkedOut, setCheckedOut] = useState(true);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [lastSynced] = useState(() => new Date().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }).replace(",", ""));
  const unread = store.notifs.filter((n) => !n.read).length;
  const pageTitle = PAGE_TITLES[active] || "Dashboard";
  const handleResetAllDemoData = () => {
    ALL_DEMO_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };
  return (
    <div className="flex items-center gap-4 px-5 py-3" style={{ background: T.sidebar, borderRadius: 14, boxShadow: "0 4px 24px rgba(0,0,0,.18)", color: "#fff" }}>
      <button onClick={onToggleCollapse} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>
        {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
      </button>
      <div className="text-[17px] font-bold shrink-0" style={{ color: "#fff" }}>{pageTitle}</div>
      <div className="hidden md:flex items-center gap-1.5 text-[12px] pl-2 border-l" style={{ color: "rgba(255,255,255,.6)", borderColor: "rgba(255,255,255,.2)" }}>
        <RefreshCw size={13} /> Last Synced — {lastSynced}
        <button onClick={() => setResetConfirm(true)} title="Reset demo data" className="ml-0.5 p-1 rounded" style={{ color: "rgba(255,255,255,.5)" }}><RotateCcw size={12} /></button>
      </div>
      <Modal open={resetConfirm} onClose={() => setResetConfirm(false)} title="Reset Demo Data"
        footer={<><Button onClick={() => setResetConfirm(false)}>Cancel</Button><Button variant="danger" onClick={handleResetAllDemoData}><RotateCcw size={13} />Reset everything</Button></>}>
        <p className="text-[13px]" style={{ color: T.text2 }}>
          This restores every module's original seed data — Lead & Record Management (including the leads that start <strong style={{ color: T.danger }}>failed</strong> or <strong style={{ color: T.purple }}>duplicate</strong>) and Client Onboarding — and clears all local mutations, audit trails, and PII access grants. The page will reload.
        </p>
        <div className="mt-3 rounded-lg px-3 py-2 text-[12px]" style={{ background: T.warningSoft, color: "#92400E" }}>
          This is a demo-data reset only — it doesn't touch the rest of the app, and can't be undone.
        </div>
      </Modal>
      <div className="flex items-center gap-2.5 ml-auto">
        <label className="flex items-center gap-2 text-[12px] font-medium cursor-pointer select-none" style={{ color: "rgba(255,255,255,.85)" }}>
          <span className="hidden sm:inline">{checkedOut ? "Checked Out" : "Checked In"}</span>
          <button type="button" role="switch" aria-checked={checkedOut} onClick={() => setCheckedOut((c) => !c)} className="w-9 h-5 rounded-full relative transition-colors" style={{ background: checkedOut ? "#fff" : "rgba(255,255,255,.25)" }}>
            <span className="absolute top-0.5 w-4 h-4 rounded-full transition-all" style={{ background: checkedOut ? T.primary : "#fff", left: checkedOut ? 18 : 2 }} />
          </button>
        </label>
        <div className="relative">
          <button onClick={() => setNotifOpen((o) => !o)} onBlur={() => setTimeout(() => setNotifOpen(false), 200)} className="relative w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>
            <Bell size={17} />{unread > 0 && <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: T.danger }}>{unread}</span>}
          </button>
          <NotifPanel open={notifOpen} onClose={() => setNotifOpen(false)} onGo={onGo} />
        </div>
        <ProfileDropdown onGo={onGo} />
      </div>
    </div>
  );
}

function ImpersonationBanner() {
  const store = useStore();
  if (!store.impersonating) return null;
  const name = store.impersonating.name || store.impersonating;
  return (
    <div className="flex items-center gap-2 px-7 py-2 text-[13px] text-white" style={{ background: T.warning }}>
      <Eye size={15} /> <span className="font-medium">Viewing as {name}</span>
      <span style={{ opacity: 0.9 }}>— actions are performed on their behalf</span>
      <button onClick={store.stopImpersonate} className="ml-auto flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium" style={{ background: "rgba(255,255,255,.25)" }}><X size={13} /> Exit</button>
    </div>
  );
}

/* ============================================================
   SHELL — updated with new subs route
   ============================================================ */
// Pages whose table manages its own internal scroll and fills the available height —
// these get a non-scrolling content area so only the table (not the whole page) scrolls.
const FIXED_HEIGHT_PAGES = new Set(["clients", "users", "subs", "cs", "support", "logs"]);

function Shell() {
  const store = useStore();
  const [active, setActive] = useState("dashboard");
  const [tenantForCs, setTenantForCs] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageParams, setPageParams] = useState(null);
  const go = (p, params) => { setActive(p); setPageParams(params || null); window.scrollTo(0, 0); };

  const page = (() => {
    switch (active) {
      case "dashboard": return <DashboardPage go={go} />;
      case "clients": return <ClientsPage />;
      case "onboarding": return <OnboardingPage />;
      case "users": return <UsersPage />;
      case "subs": return <SubsPlansPage />;
      case "cs": return <CsPage openTenant={setTenantForCs} />;
      case "leads": return <LeadsPage go={go} />;
      case "automation": return <AutomationPage />;
      case "ai": return <AiPage />;
      case "integrations": return <IntegrationsPage filter={pageParams} />;
      case "comms": return <CommsPage />;
      case "reports": return <ReportsPage />;
      case "queues": return <QueuesPage />;
      case "logs": return <LogsPage />;
      case "health": return <HealthPage />;
      case "security": return <SecurityPage />;
      case "support": return <SupportPage />;
      case "industries": return <IndustriesPage />;
      case "settings": return <SettingsPage />;
      default: return <DashboardPage go={go} />;
    }
  })();

  return (
    <div className="flex min-h-screen font-sans" style={{ background: T.bg, color: T.text }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}} aside nav::-webkit-scrollbar{width:4px} aside nav::-webkit-scrollbar-thumb{background:${T.sidebarHover};border-radius:4px}`}</style>
      <div className="shrink-0 py-3" style={{ position: "sticky", top: 0, height: "100vh" }}>
        <Sidebar active={active} onNav={go} collapsed={sidebarCollapsed} />
      </div>
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        <ImpersonationBanner />
        {/* Floating topbar */}
        <div className="px-3 pt-3 shrink-0">
          <Topbar onGo={go} active={active} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((c) => !c)} />
        </div>
        <div className={cx("flex-1 min-h-0 px-3 py-3", FIXED_HEIGHT_PAGES.has(active) ? "overflow-hidden flex flex-col" : "overflow-y-auto")}>{page}</div>
      </main>
      <Toast msg={store.toast} />
      <Tenant360 tenant={tenantForCs} onClose={() => setTenantForCs(null)} />
    </div>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
