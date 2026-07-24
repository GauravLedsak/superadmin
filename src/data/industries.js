/* ============================================================
   INDUSTRIES & TEMPLATES — the CRM configuration factory.
   Each industry defines the lead fields/sources/groups/stages a tenant's
   CRM is pre-loaded with at onboarding. Consumed by IndustriesPage (editor)
   and by ClientsPage's Add Tenant modal (industry dropdown, derived from
   the Active ones — see store.industries in StoreContext.jsx).
   ============================================================ */

export const INDUSTRY_STATUSES = ["Active", "Draft"];
export const INDUSTRY_STATUS_TONE = { Active: "success", Draft: "gray" };

// System fields exist in every industry and can never be deleted.
export const SYSTEM_FIELDS = [
  { id: "sys-name", name: "Name", required: true, isSystem: true },
  { id: "sys-phone", name: "Phone", required: true, isSystem: true },
  { id: "sys-email", name: "Email", required: false, isSystem: true },
];

// Preset color palette for lead groups and stages (swatch picker, not a full color wheel).
export const COLOR_PRESETS = ["#DC2626", "#F59E0B", "#10B981", "#295FB2", "#8B5CF6", "#6B7280", "#059669", "#EC4899"];

// Icon options for the industry icon picker — resolved to lucide-react components in HealthPage's
// sibling pattern (per-file ICON_MAP in IndustriesPage.jsx), not imported here.
export const INDUSTRY_ICONS = ["Car", "Stethoscope", "GraduationCap", "ShoppingCart", "Building2", "LayoutTemplate", "Briefcase", "Plane", "Utensils", "Dumbbell", "Hotel", "Wrench"];

export const BLANK_INDUSTRY = {
  name: "", icon: "LayoutTemplate", description: "", status: "Draft", isDefault: false,
  leadFields: [...SYSTEM_FIELDS],
  leadSources: [{ id: "ns1", name: "Website", active: true }, { id: "ns2", name: "WhatsApp", active: true }],
  leadGroups: [
    { id: "ng1", name: "Hot", color: "#DC2626", description: "" },
    { id: "ng2", name: "Warm", color: "#F59E0B", description: "" },
    { id: "ng3", name: "Cold", color: "#6B7280", description: "" },
  ],
  leadStages: [
    { id: "nst1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 2 },
    { id: "nst2", name: "Contacted", order: 2, color: "#295FB2", slaHours: 24 },
    { id: "nst3", name: "Won", order: 3, color: "#10B981", slaHours: null },
    { id: "nst4", name: "Lost", order: 4, color: "#DC2626", slaHours: null },
  ],
};

/* ============================================================
   SEED INDUSTRIES (6)
   `name` intentionally matches the short industry vocabulary already used
   by SEED_CLIENTS (data/seed.js: "Automotive", "Clinic", "Ecommerce",
   "Education", "Other") rather than a longer display-style name, so tenant
   counts computed against store.clients are real, and the industry
   dropdown this page feeds into ClientsPage's Add Tenant modal doesn't
   fork into a second, incompatible vocabulary for newly-created tenants.
   The richer descriptive language lives in `description` instead.
   ============================================================ */
export const SEED_INDUSTRIES = [
  {
    id: "ind-automotive",
    name: "Automotive",
    icon: "Car",
    description: "Multi-brand showroom workflow — CarWale/CarDekho leads, test drives, deliveries",
    status: "Active",
    isDefault: false,
    lastModified: "10 Mar 2026",
    modifiedBy: "Saif Khan",
    leadFields: [
      { id: "af1", name: "Name", required: true, isSystem: true },
      { id: "af2", name: "Phone", required: true, isSystem: true },
      { id: "af3", name: "Email", required: false, isSystem: true },
      { id: "af4", name: "Vehicle Model", required: false, isSystem: false },
      { id: "af5", name: "Brand Preference", required: false, isSystem: false },
      { id: "af6", name: "Budget Range", required: false, isSystem: false },
      { id: "af7", name: "Exchange Vehicle", required: false, isSystem: false },
      { id: "af8", name: "Finance Required", required: false, isSystem: false },
      { id: "af9", name: "Test Drive Requested", required: false, isSystem: false },
      { id: "af10", name: "Keyword", required: false, isSystem: false },
      { id: "af11", name: "Ad Campaign Name", required: false, isSystem: false },
      { id: "af12", name: "Ad Set Name", required: false, isSystem: false },
    ],
    leadSources: [
      { id: "as1", name: "CarWale", active: true },
      { id: "as2", name: "CarDekho", active: true },
      { id: "as3", name: "Walk-in", active: true },
      { id: "as4", name: "OEM Website", active: true },
      { id: "as5", name: "Facebook Ads", active: true },
      { id: "as6", name: "Google Ads", active: true },
      { id: "as7", name: "WhatsApp", active: true },
      { id: "as8", name: "Referral", active: false },
    ],
    leadGroups: [
      { id: "ag1", name: "Hot", color: "#DC2626", description: "Ready to buy within 7 days" },
      { id: "ag2", name: "Warm", color: "#F59E0B", description: "Interested, needs nurturing" },
      { id: "ag3", name: "Cold", color: "#6B7280", description: "Long-term prospect" },
      { id: "ag4", name: "Test Drive Interested", color: "#8B5CF6", description: "Wants a test drive" },
      { id: "ag5", name: "Finance Required", color: "#295FB2", description: "Needs financing assistance" },
    ],
    leadStages: [
      { id: "ast1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 2 },
      { id: "ast2", name: "Contacted", order: 2, color: "#295FB2", slaHours: 24 },
      { id: "ast3", name: "Test Drive", order: 3, color: "#8B5CF6", slaHours: 72 },
      { id: "ast4", name: "Negotiation", order: 4, color: "#F59E0B", slaHours: null },
      { id: "ast5", name: "Booking", order: 5, color: "#10B981", slaHours: null },
      { id: "ast6", name: "Delivery", order: 6, color: "#059669", slaHours: null },
      { id: "ast7", name: "Lost", order: 7, color: "#DC2626", slaHours: null },
    ],
  },
  {
    id: "ind-clinic",
    name: "Clinic",
    icon: "Stethoscope",
    description: "Patient lead management with EMR bridge, appointment scheduling, and treatment tracking",
    status: "Active",
    isDefault: false,
    lastModified: "15 Mar 2026",
    modifiedBy: "Luv",
    leadFields: [
      { id: "cf1", name: "Name", required: true, isSystem: true },
      { id: "cf2", name: "Phone", required: true, isSystem: true },
      { id: "cf3", name: "Email", required: false, isSystem: true },
      { id: "cf4", name: "Treatment Type", required: false, isSystem: false },
      { id: "cf5", name: "Doctor Preference", required: false, isSystem: false },
      { id: "cf6", name: "Existing Patient", required: false, isSystem: false },
      { id: "cf7", name: "Insurance", required: false, isSystem: false },
      { id: "cf8", name: "Medical History Flag", required: false, isSystem: false },
      { id: "cf9", name: "Referral Source", required: false, isSystem: false },
    ],
    leadSources: [
      { id: "cs1", name: "Website", active: true },
      { id: "cs2", name: "WhatsApp", active: true },
      { id: "cs3", name: "Walk-in", active: true },
      { id: "cs4", name: "Google Ads", active: true },
      { id: "cs5", name: "Practo", active: true },
      { id: "cs6", name: "Referral", active: true },
    ],
    leadGroups: [
      { id: "cg1", name: "New Patient", color: "#295FB2", description: "First-time enquiry" },
      { id: "cg2", name: "Returning Patient", color: "#10B981", description: "Has visited before" },
      { id: "cg3", name: "High Value", color: "#8B5CF6", description: "Premium treatment interest" },
      { id: "cg4", name: "Insurance Patient", color: "#F59E0B", description: "Using insurance coverage" },
    ],
    leadStages: [
      { id: "cst1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 1 },
      { id: "cst2", name: "Consultation Booked", order: 2, color: "#295FB2", slaHours: 24 },
      { id: "cst3", name: "Consultation Done", order: 3, color: "#8B5CF6", slaHours: 48 },
      { id: "cst4", name: "Treatment", order: 4, color: "#F59E0B", slaHours: null },
      { id: "cst5", name: "Follow-up", order: 5, color: "#10B981", slaHours: 168 },
      { id: "cst6", name: "Closed", order: 6, color: "#059669", slaHours: null },
    ],
  },
  {
    id: "ind-education",
    name: "Education",
    icon: "GraduationCap",
    description: "Admissions funnel — enquiry to enrolment with counselling and application tracking",
    status: "Active",
    isDefault: false,
    lastModified: "01 Apr 2026",
    modifiedBy: "Vishal",
    leadFields: [
      { id: "eduf1", name: "Name", required: true, isSystem: true },
      { id: "eduf2", name: "Phone", required: true, isSystem: true },
      { id: "eduf3", name: "Email", required: false, isSystem: true },
      { id: "eduf4", name: "Course Interested", required: false, isSystem: false },
      { id: "eduf5", name: "Current Qualification", required: false, isSystem: false },
      { id: "eduf6", name: "Year of Passing", required: false, isSystem: false },
      { id: "eduf7", name: "City", required: false, isSystem: false },
      { id: "eduf8", name: "Budget", required: false, isSystem: false },
      { id: "eduf9", name: "Mode (Online/Offline)", required: false, isSystem: false },
    ],
    leadSources: [
      { id: "edus1", name: "Website", active: true },
      { id: "edus2", name: "IndiaMART", active: true },
      { id: "edus3", name: "Facebook Ads", active: true },
      { id: "edus4", name: "Google Ads", active: true },
      { id: "edus5", name: "Referral", active: true },
      { id: "edus6", name: "Walk-in", active: true },
      { id: "edus7", name: "Education Fairs", active: false },
    ],
    leadGroups: [
      { id: "edug1", name: "Hot", color: "#DC2626", description: "Ready to enrol this term" },
      { id: "edug2", name: "Warm", color: "#F59E0B", description: "Comparing programs" },
      { id: "edug3", name: "Cold", color: "#6B7280", description: "Long-term prospect" },
      { id: "edug4", name: "Scholarship Applicant", color: "#8B5CF6", description: "Applying for financial aid" },
    ],
    leadStages: [
      { id: "edust1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 2 },
      { id: "edust2", name: "Counselling", order: 2, color: "#295FB2", slaHours: 24 },
      { id: "edust3", name: "Application", order: 3, color: "#8B5CF6", slaHours: 72 },
      { id: "edust4", name: "Admission", order: 4, color: "#F59E0B", slaHours: null },
      { id: "edust5", name: "Enrolled", order: 5, color: "#10B981", slaHours: null },
      { id: "edust6", name: "Dropped", order: 6, color: "#DC2626", slaHours: null },
    ],
  },
  {
    id: "ind-ecommerce",
    name: "Ecommerce",
    icon: "ShoppingCart",
    description: "Product enquiries, cart recovery, and order tracking",
    status: "Active",
    isDefault: false,
    lastModified: "20 Mar 2026",
    modifiedBy: "Saif Khan",
    leadFields: [
      { id: "ecf1", name: "Name", required: true, isSystem: true },
      { id: "ecf2", name: "Phone", required: true, isSystem: true },
      { id: "ecf3", name: "Email", required: false, isSystem: true },
      { id: "ecf4", name: "Product Interested", required: false, isSystem: false },
      { id: "ecf5", name: "Order Value", required: false, isSystem: false },
      { id: "ecf6", name: "Payment Mode", required: false, isSystem: false },
      { id: "ecf7", name: "City", required: false, isSystem: false },
      { id: "ecf8", name: "Keyword", required: false, isSystem: false },
      { id: "ecf9", name: "Ad Page Name", required: false, isSystem: false },
      { id: "ecf10", name: "Ad Campaign Name", required: false, isSystem: false },
      { id: "ecf11", name: "Ad Set Name", required: false, isSystem: false },
      { id: "ecf12", name: "Ad Name", required: false, isSystem: false },
      { id: "ecf13", name: "Message", required: false, isSystem: false },
    ],
    leadSources: [
      { id: "ecs1", name: "Website", active: true },
      { id: "ecs2", name: "Facebook Ads", active: true },
      { id: "ecs3", name: "Google Ads", active: true },
      { id: "ecs4", name: "Instagram", active: true },
      { id: "ecs5", name: "WhatsApp", active: true },
    ],
    leadGroups: [
      { id: "ecg1", name: "High Value", color: "#8B5CF6", description: "Large basket size" },
      { id: "ecg2", name: "Cart Abandoner", color: "#F59E0B", description: "Started checkout, didn't finish" },
      { id: "ecg3", name: "Repeat Customer", color: "#10B981", description: "Has ordered before" },
      { id: "ecg4", name: "Discount Seeker", color: "#EC4899", description: "Only engages with offers" },
    ],
    leadStages: [
      { id: "ecst1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 1 },
      { id: "ecst2", name: "Quote Sent", order: 2, color: "#295FB2", slaHours: 24 },
      { id: "ecst3", name: "Negotiation", order: 3, color: "#8B5CF6", slaHours: 48 },
      { id: "ecst4", name: "Order Placed", order: 4, color: "#F59E0B", slaHours: null },
      { id: "ecst5", name: "Delivered", order: 5, color: "#10B981", slaHours: null },
      { id: "ecst6", name: "Returned", order: 6, color: "#DC2626", slaHours: null },
    ],
  },
  {
    id: "ind-realestate",
    name: "Real Estate",
    icon: "Building2",
    description: "Property enquiries, site visits, and booking pipeline",
    status: "Active",
    isDefault: false,
    lastModified: "05 Apr 2026",
    modifiedBy: "Luv",
    leadFields: [
      { id: "ref1", name: "Name", required: true, isSystem: true },
      { id: "ref2", name: "Phone", required: true, isSystem: true },
      { id: "ref3", name: "Email", required: false, isSystem: true },
      { id: "ref4", name: "Property Type", required: false, isSystem: false },
      { id: "ref5", name: "BHK Requirement", required: false, isSystem: false },
      { id: "ref6", name: "Budget", required: false, isSystem: false },
      { id: "ref7", name: "Locality Preference", required: false, isSystem: false },
      { id: "ref8", name: "Ready to Move", required: false, isSystem: false },
      { id: "ref9", name: "Loan Required", required: false, isSystem: false },
    ],
    leadSources: [
      { id: "res1", name: "99acres", active: true },
      { id: "res2", name: "MagicBricks", active: true },
      { id: "res3", name: "Housing.com", active: true },
      { id: "res4", name: "Facebook Ads", active: true },
      { id: "res5", name: "Referral", active: true },
      { id: "res6", name: "Walk-in", active: false },
    ],
    leadGroups: [
      { id: "reg1", name: "Investor", color: "#295FB2", description: "Buying for returns, not to live in" },
      { id: "reg2", name: "End User", color: "#10B981", description: "Buying to move in" },
      { id: "reg3", name: "NRI", color: "#8B5CF6", description: "Non-resident buyer" },
      { id: "reg4", name: "High Budget", color: "#DC2626", description: "Premium/luxury segment" },
    ],
    leadStages: [
      { id: "rest1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 2 },
      { id: "rest2", name: "Site Visit", order: 2, color: "#295FB2", slaHours: 48 },
      { id: "rest3", name: "Negotiation", order: 3, color: "#8B5CF6", slaHours: 120 },
      { id: "rest4", name: "Booking", order: 4, color: "#F59E0B", slaHours: null },
      { id: "rest5", name: "Registration", order: 5, color: "#10B981", slaHours: null },
      { id: "rest6", name: "Possession", order: 6, color: "#059669", slaHours: null },
    ],
  },
  {
    id: "ind-other",
    name: "Other",
    icon: "LayoutTemplate",
    description: "Blank starter workflow — minimal defaults, fully customizable",
    status: "Active",
    isDefault: true,
    lastModified: "01 Jan 2026",
    modifiedBy: "System",
    leadFields: [
      { id: "of1", name: "Name", required: true, isSystem: true },
      { id: "of2", name: "Phone", required: true, isSystem: true },
      { id: "of3", name: "Email", required: false, isSystem: true },
      { id: "of4", name: "Message", required: false, isSystem: false },
      { id: "of5", name: "Keyword", required: false, isSystem: false },
      { id: "of6", name: "Ad Page Name", required: false, isSystem: false },
      { id: "of7", name: "Ad Campaign Name", required: false, isSystem: false },
      { id: "of8", name: "Ad Set Name", required: false, isSystem: false },
      { id: "of9", name: "Ad Name", required: false, isSystem: false },
    ],
    leadSources: [
      { id: "os1", name: "Website", active: true },
      { id: "os2", name: "WhatsApp", active: true },
      { id: "os3", name: "Referral", active: true },
      { id: "os4", name: "Walk-in", active: true },
    ],
    leadGroups: [
      { id: "og1", name: "Hot", color: "#DC2626", description: "" },
      { id: "og2", name: "Warm", color: "#F59E0B", description: "" },
      { id: "og3", name: "Cold", color: "#6B7280", description: "" },
    ],
    leadStages: [
      { id: "ost1", name: "Enquiry", order: 1, color: "#6B7280", slaHours: 4 },
      { id: "ost2", name: "Contacted", order: 2, color: "#295FB2", slaHours: 24 },
      { id: "ost3", name: "Qualified", order: 3, color: "#8B5CF6", slaHours: 72 },
      { id: "ost4", name: "Won", order: 4, color: "#10B981", slaHours: null },
      { id: "ost5", name: "Lost", order: 5, color: "#DC2626", slaHours: null },
    ],
  },
];

/* ============================================================
   HELPERS
   ============================================================ */
export function countTenantsForIndustry(industry, clients) {
  return clients.filter((c) => c.industry === industry.name).length;
}
export function mostPopularIndustry(industries, clients) {
  if (!industries.length) return null;
  return [...industries].sort((a, b) => countTenantsForIndustry(b, clients) - countTenantsForIndustry(a, clients))[0];
}
export function avgFieldsPerIndustry(industries) {
  if (!industries.length) return 0;
  return (industries.reduce((sum, i) => sum + i.leadFields.length, 0) / industries.length).toFixed(1);
}
