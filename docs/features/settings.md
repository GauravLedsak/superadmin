# Settings — [Mock]
Route: `settings` · Source: `superadmin/src/pages/SettingsPage.jsx` → `SettingsPage()`

## Purpose
Platform-level configuration for LEDSAK Technologies: company profile, feature flag toggles for beta/GA features, and compliance framework status. Intended for super admins only — not visible to tenant users.

## Flow

### Primary path
1. Page loads on the **Company** tab (default `useState("Company")`).
2. Admin switches between Company, Feature Flags, and Compliance tabs.
3. "Save Changes" button → `store.notify("Settings saved")` — no persistence.

### Edge cases
- "Save Changes" is always enabled and always fires the same toast; it does not batch or validate any field.
- Feature flag toggles reset to seeded defaults on navigation away and back (local state).
- All Company and Compliance fields are read-only display — no form inputs exist.

## Page Header
- Title: "Settings"
- Description: "Company profile, feature flags and compliance"
- "Save Changes" button: primary, CheckCircle2 icon, `onClick={() => store.notify("Settings saved")}` — fires always, even with no changes

## Tab: Company

Read-only `<Field>` components in a 2-column grid. No inputs, no edit mode:

| Field label | Value | Render detail |
|-------------|-------|---------------|
| Company Name | LEDSAK Technologies Pvt Ltd | Plain text |
| GST Number | 07AAFCL9438H1Z5 | `font-mono` |
| Founder / CEO | Saif Khan | Plain text |
| Founded | 2023 | Plain text |
| Registered Office | Block-D, Balaji Estate, Kalkaji, New Delhi 110019 | Full-width (sm:col-span-2) |
| Currency | INR (₹) | Plain text |
| Timezone | Asia/Kolkata (IST) | Plain text |

## Tab: Feature Flags

6 feature flags as toggle rows. State held in local `useState`:

```js
const [flags, setFlags] = useState({ ai: true, churn: true, collect: false, emr: true, dms: false, reseller: false });
```

Each row: label (bold 13px) on top, description + scope tag on second line (muted 12px), Switch toggle on right.

| Key | Label | Description | Scope | Default |
|-----|-------|-------------|-------|---------|
| `ai` | AI Lead Summarization | OpenAI-powered context | Global | **On** |
| `churn` | AI Churn Prediction | ML on success | Global | **On** |
| `collect` | LEDSAK Collect | 1.5% take-rate | Beta · 3 clients | **Off** |
| `emr` | EMR Bridge (Cliniceo) | Two-way sync | Healthcare only | **On** |
| `dms` | Dealership DMS Bridge | Two-way sync | Beta · 1 client | **Off** |
| `reseller` | Reseller Program | White-label & splits | Disabled | **Off** |

**Toggle behavior**:
```js
setFlags(f => ({ ...f, [k]: !f[k] }));
store.notify("Flag updated");
```
Local state only. Toggling fires a toast but no global store update or backend call.

## Tab: Compliance

4 compliance framework rows as bordered cards (no toggle — display only):

| Icon | Framework | Description | Status badge |
|------|-----------|-------------|-------------|
| ShieldCheck | DPDP Act 2023 — Compliant | Consent · retention · PII masking | Active (green) |
| HeartHandshake | ABDM (Ayushman Bharat) | ABHA ID · for Clinic OS | In Progress (orange) |
| CheckCircle2 | ISO 27001 | Certified · audit Aug 2026 | Active (green) |
| Globe | HIPAA-ready | BAA template available | Ready (gray) |

Card layout: icon in 32×32px `T.primarySoft` rounded square (blue icon), framework name (bold 13px), description (muted 12px), status badge right-aligned. All rows read-only.

## Rules
- Company tab: entirely display-only, all values hardcoded.
- Feature flags: local state, reset on unmount.
- Compliance: entirely display-only, all values hardcoded.
- "Save Changes" button has no validation and fires unconditionally.

## Permissions
No access control. All super admin users see and can "toggle" all settings.

## Automations
None triggered from this page.

## Decisions
None recorded.

## Open questions
- Company tab is read-only — should any fields become editable (e.g., GST number, registered office)?
- Should feature flag changes require a confirmation modal given their global scope?
- "LEDSAK Collect 1.5% take-rate" — is this a payment rake taken at collection time? No business logic for this exists in the current code.
- Should `emr` flag gate the Cliniceo integration visibility on the Integrations page?
- Should `dms` flag gate the Dealer DMS card on the Integrations page?
- ABDM "In Progress" — what does completion require? Is there a milestone tracker?
- ISO 27001 audit is "Aug 2026" — should this date be editable to stay current?
- "Save Changes" should probably only be active when something has actually changed.
