import { PhoneCall, Mail, PlayCircle, TriangleAlert, Flag } from "lucide-react";

export const NOW = "13 May 2026";
export const ADMIN = "Saif Khan";

export const ONBOARD_STAGES = ["Kickoff", "Configuring", "Data Import", "Training", "Go-Live"];
export const ONBOARD_OWNERS = ["Saif Sir", "Luv", "Vishal"];
export const CHECKLIST_TEMPLATE = [
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
export const GOLIVE_REQUIRED_TASKS = ["t11", "t12"];
export const mkChecklist = (doneIds = []) => CHECKLIST_TEMPLATE.map((t) => ({ ...t, completed: doneIds.includes(t.id) }));

export const STEP_TYPES = ["Call", "Email", "Demo", "Internal Escalation", "Other"];
export const STEP_TYPE_ICON = { Call: PhoneCall, Email: Mail, Demo: PlayCircle, "Internal Escalation": TriangleAlert, Other: Flag };
export const PLAYBOOK_RISK_TIERS = ["High", "Medium", "Both"];
export const PLAYBOOK_INDUSTRIES = ["All", "Automotive", "Clinic", "Education", "Ecommerce", "Other"];
export const RENEWAL_STATUSES = ["Not Started", "In Negotiation", "Confirmed", "At Risk"];
export const TASK_STATUSES = ["Open", "In Progress", "Done", "Skipped"];
