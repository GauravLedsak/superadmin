# Tenants / Clients — [Mock]
Route: `clients` · Source: `superadmin/src/pages/ClientsPage.jsx` → `ClientsPage()` + `Tenant360()`

## Purpose
The Clients page is the master list of all tenants on the LEDSAK platform. Super admins use it to monitor health, manage subscriptions, suspend accounts, impersonate users for support, and drill into full tenant 360° detail. The Tenant 360 drawer surfaces within this page (and also from Customer Success).

---

# ClientsPage

## Flow

### Primary path
1. Page loads showing all 15 seeded tenants, no filters active.
2. Admin types in the search box or clicks filter pills to narrow results.
3. Clicking a client name or "View 360" in the row menu opens the Tenant 360 drawer.
4. Clicking "Log in as tenant" from the row menu starts impersonation.
5. Closing the drawer returns to the list with filters intact.

### Edge cases / failure states
- If no tenants match the active filters, an empty row renders: "No tenants match these filters" (colspan 13).
- "Export" and "Add Tenant" buttons have no `onClick` handler — they do nothing.
- "Add seats" in the row menu calls `setSelected(c)` which opens the Tenant 360 drawer (Overview tab), NOT the seat modal directly. The seat modal is only accessible once inside the drawer.

## Page Header
- Title: "Tenants / Clients"
- Description: `` `${store.clients.length} shown · ${STATS.total} total · ${STATS.subscribed} paid` ``
  - `store.clients.length` = 15 (seeded clients visible in the list)
  - `STATS.total` = 564 (hardcoded constant — intended to represent all tenants in the real system)
  - `STATS.subscribed` = 56 (hardcoded constant)
  - **Note**: The label says "shown" but shows `store.clients.length`, not the filtered count — it will say "15 shown" even when filters reduce the visible rows.
- Actions: "Export" (no action), "Add Tenant" (no action)

## Filter Controls

All four filters are ANDed together using `useMemo`:

```
rows = clients WHERE
  (name includes query OR branch includes query)
  AND (status === statusFilter OR statusFilter === "All")
  AND (churnRisk === riskFilter OR riskFilter === "All")
  AND (industry === industryFilter OR industryFilter === "All")
```

| Control | Type | Options | Default | Match logic |
|---------|------|---------|---------|-------------|
| Search | Text input, max-width 300px | — | "" | Case-insensitive includes on `name` OR `branch` |
| Status | Filter pills | "All", "Active", "Trial", "Suspended" | "All" | Exact match on `c.status` |
| Risk | Filter pills | "All", "High", "Medium", "Low" | "All" | Exact match on `c.churnRisk` |
| Industry | `<select>` dropdown | "All" + unique industries from store | "All" | Exact match on `c.industry` |

Industry options are derived at render time: `["All", ...Array.from(new Set(store.clients.map(c => c.industry)))]`. With seeded data: All, Ecommerce, Clinic, Automotive, Other, Education.

Note: "Churned", "Blocked", and "Invited" statuses exist in the STATUS_TONE map but are not filter pills. The status filter only covers Active, Trial, Suspended.

## Table Columns

| Column | Source field | Render detail |
|--------|-------------|---------------|
| Client | `c.name` + `c.branch` | NameCell: avatar (purple for Clinic, brand blue for others) + name (blue, underlines on hover, clickable) + branch subtitle. Clicking opens Tenant 360. |
| Industry | `c.industry` | Plain text, muted color |
| Plan | `c.plan` | Plain text, muted color, small font |
| Leads | `c.leads` | Bold, formatted with `en-IN` locale (e.g. "4,10,698") |
| AI | `c.aiUsed` | Plain number |
| Usage | `c.usage` | Displayed as "{n} GB" |
| Seats | `c.employees` / `c.seats` | "{employees}/{seats}" small text |
| MRR | `c.mrr` | `fmtINR(c.mrr)` bold, or "—" if mrr is 0 |
| Health | `c.health` | Progress bar: green if ≥75, orange if ≥50, red if <50; number shown beside bar |
| Risk | `c.churnRisk` | Badge: High→red, Medium→orange, Low→green |
| Owner | `c.am` | Plain text, muted (account manager initials/name) |
| Status | `c.status` | Badge: Active→green, Trial→orange, Suspended→red |
| (actions) | — | `Menu` component (⋯ icon) |

## Row Actions (Menu)

| Action | Code | Effect |
|--------|------|--------|
| View 360 | `setSelected(c)` | Opens Tenant 360 drawer |
| Log in as tenant | `store.impersonate(c.name)` | Sets impersonating state, shows banner |
| Add seats | `setSelected(c)` | Opens Tenant 360 drawer (NOT the seat modal) |
| Suspend | `store.setTenantStatus(c.id, "Suspended")` | Updates status in store, toast "Tenant suspended" |
| Reactivate | `store.setTenantStatus(c.id, "Active")` | Updates status in store, toast "Tenant reactivated" |

"Suspend" is shown when `c.status !== "Suspended"`. "Reactivate" is shown when `c.status === "Suspended"`. The two options are mutually exclusive.

## Seeded Client Data (all 15 tenants)

| # | Name | Industry | Status | Health | Churn Risk | MRR | AM | providerOk |
|---|------|----------|--------|--------|------------|-----|----|-----------|
| 1 | Rezoni | Ecommerce | Active | 30 | High | ₹4,167 | Saif Sir | ✗ |
| 2 | Derma Purtitys | Clinic | Active | 92 | Low | ₹8,333 | Luv | ✓ |
| 3 | MedLinks | Clinic | Active | 95 | Low | ₹16,250 | Saif Sir | ✓ |
| 4 | Siama Skincare | Clinic | Active | 75 | Low | ₹2,167 | Luv | ✓ |
| 5 | Dermalife | Clinic | Active | 52 | Medium | ₹12,500 | Saif Sir | ✓ |
| 6 | Varun Group | Automotive | Active | 53 | Medium | ₹12,500 | Saif Sir | ✗ |
| 7 | LEDSAK | Other | Active | 93 | Low | ₹8,333 | Luv | ✓ |
| 8 | Inside Edge Learning | Education | Active | 95 | Low | ₹5,000 | Vishal | ✓ |
| 9 | Evinces Ventures | Ecommerce | Trial | 95 | Low | — | Vishal | ✓ |
| 10 | Luhaif Digitech | Other | Active | 95 | Low | ₹8,333 | Luv | ✓ |
| 11 | Urban Autohub | Automotive | Active | 86 | Low | ₹8,333 | Luv | ✓ |
| 12 | Aryaanya Group | Other | Active | 94 | Low | ₹8,333 | Luv | ✓ |
| 13 | SAMT Fixtures | Other | Active | 88 | Low | ₹2,167 | Vishal | ✓ |
| 14 | Cosmetique | Clinic | Active | 90 | Low | ₹8,333 | Luv | ✓ |
| 15 | Mahakumbh Motors | Automotive | Suspended | 44 | High | ₹5,000 | Saif Sir | ✗ |

Tenants with `providerOk: false`: Rezoni (CarWale), Varun Group (CarWale), Mahakumbh Motors (CarWale). These three trigger the "feed down" alert on Dashboard and Integrations.

---

# Tenant 360 Drawer

Source: `Tenant360()` component. Width: 620px (default Drawer width). Opens as a right-side overlay with a dark backdrop; clicking the backdrop closes it.

The component always re-reads the tenant from the store (`store.clients.find(x => x.id === tenant.id) || tenant`) so any status/seat changes made while it's open are reflected immediately.

## Drawer Header (sticky)

- Avatar: 44px, purple tone for Clinic industry, brand blue for all others
- Name + status badge (inline)
- Subtitle: `{industry} · {branch} · {plan}`
- Close button (X icon, top-right)

## Quick Action Buttons (below name)

| Button | Condition | Action |
|--------|-----------|--------|
| "Log in as tenant" | Always shown | `store.impersonate(c.name)` → toast "Now viewing as {name}" |
| "Suspend" | `c.status !== "Suspended"` | `store.setTenantStatus(c.id, "Suspended")` → toast "Tenant suspended" |
| "Reactivate" | `c.status === "Suspended"` | `store.setTenantStatus(c.id, "Active")` → toast "Tenant reactivated" |
| "Add seats" | Always shown | Opens `seatModal` (sets `seatModal = true`) |
| "Extend trial" | `c.status === "Trial"` only | `store.extendTrial(c.id, 14)` → appends " (+14d)" to `c.plan`, toast |

## Tabs

Seven tabs: **Overview** (default), **Users**, **Billing**, **Activity**, **Tasks**, **Automations**, **CRM Automations**. This doc currently only covers Overview/Users/Billing/Activity in detail below (pre-existing gap, not introduced by the CRM Automations addition) plus the new CRM Automations tab; Tasks and Automations are undocumented here — see Open questions.

---

### Overview Tab

**KPI row** (3 cards):
| KPI | Source | Format |
|-----|--------|--------|
| Leads (LTD) | `c.leads` | `c.leads.toLocaleString("en-IN")` |
| MRR | `c.mrr` | `fmtINR(c.mrr)` or "—" if falsy |
| Health | `c.health` | String(c.health), `trend="pos"` if ≥75 else `"neg"`, sub = `"{churnRisk} risk"` |

**Account Details card** — 2-column grid of read-only fields:

| Field label | Source | Render detail |
|-------------|--------|---------------|
| Account Manager | `c.am` | Plain text |
| GST Number | `c.gst` | `font-mono text-xs` |
| Seats | `c.employees`, `c.seats` | "{employees} used / {seats} licensed" |
| AI Summaries Used | `c.aiUsed` | Plain number |
| Storage Usage | `c.usage` | "{usage} GB" |
| Last Login | `c.lastLogin` | Plain text |
| Plan Renewal | `c.planEnd`, computed `renewalDays` | Date + renewal status (see calculation below) |
| Lead Provider | `c.provider`, `c.providerOk` | Provider name + "Synced" (green) or "Down" (red) badge |

**Renewal days calculation** (real logic):
```js
const [d, m, y] = c.planEnd.split("-").map(Number);  // format: "DD-MM-YYYY"
renewalDays = Math.round((new Date(y, m - 1, d) - new Date("2026-05-13")) / 864e5);
```
- Reference date is hardcoded to **"2026-05-13"** (not `Date.now()`)
- If `renewalDays < 0`: color → red (`T.danger`), shows "(Nd overdue)"
- If `renewalDays < 30` and ≥ 0: color → orange (`T.warning`), shows "(Nd left)"
- If `renewalDays ≥ 30`: default text color, shows "(Nd left)"

**Feed-down alert banner** (conditional — only renders when `!c.providerOk`):
- Background: `T.dangerSoft` (light red), 3px red left border
- Icon: TriangleAlert (red)
- Text: "{c.provider} lead feed is down" + hardcoded sub "No leads received in 26 hours — reconnect required"
- "Reconnect" button → `store.notify("Reconnect link sent to tenant admin")` — no real action

---

### Users Tab

- Header: "Users ({tenantUsers.length})" — count is live from `store.users.filter(u => u.tenant === c.name)`
- Matching is done on `u.tenant === c.name` (exact string match — case sensitive)
- "Invite" button in header → no `onClick` handler, does nothing
- Empty state: "No users seeded for this tenant"

**Table columns**: User (NameCell: name + email), Role (Badge), Status (Badge), actions (Menu)

**Role badge tone**:
- `u.role.includes("CMO") || u.role.includes("CEO")` → brand (blue)
- Otherwise → gray

**Row actions (Menu)**:
| Action | Code | Effect |
|--------|------|--------|
| Impersonate | `store.impersonate(u)` | Sets impersonating to the full user object; banner shows `u.name` |
| Reset password | `store.resetPassword(u.name)` | Toast: "Password reset link sent to {name}" |
| Resend invite | `store.resendInvite(u.id)` | Toast: "Invite re-sent" (only shown when `u.status === "Invited"`) |
| Suspend | `store.setUserStatus(u.id, "Suspended")` | Updates user status in store |
| Reactivate | `store.setUserStatus(u.id, "Active")` | Updates user status in store |

Suspend/Reactivate are mutually exclusive based on `u.status === "Suspended"`.

**Users visible per tenant** (from seeded data, matched by tenant name):
| Tenant | Users |
|--------|-------|
| MedLinks | Rahul Mehta (Team Lead, Active) |
| Derma Purtitys | Priya Sharma (Telecaller, Active) |
| Varun Group | Arjun Nair (Brand CEO, Active) |
| Rezoni | Sneha Kapoor (Admin (CMO), Suspended) |
| Urban Autohub | Vikram Singh (Telecaller, Active) |
| Aryaanya Group | Anita Desai (Team Lead, Invited) |
| All others | "No users seeded for this tenant" |

---

### Billing Tab

- Header: "Invoices" (no count)
- Filtered from `store.invoices` by `i.client === c.name` (exact string match)
- Empty state: "No invoices on record"

**Table columns**: Invoice (mono text), Amount (`fmtINR`), Date, Status (Badge), actions

**Row actions**: "Retry" button renders only when `iv.status === "Failed"`. Action: `store.retryInvoice(iv.id)` → sets that invoice's status to "Paid" in store, toast "INV-XXXX retried — payment collected".

**Invoices visible per tenant** (from seeded data):
| Tenant | Invoice | Amount | Status |
|--------|---------|--------|--------|
| MedLinks | INV-2451 | ₹16,250 | Paid |
| Dermalife | INV-2452 | ₹12,500 | Pending |
| Rezoni | INV-2453 | ₹4,167 | Failed |
| Aryaanya Group | INV-2454 | ₹8,333 | Paid |
| Varun Group | INV-2455 | ₹12,500 | Pending |
| Mahakumbh Motors | INV-2456 | ₹5,000 | Failed |

---

### Activity Tab

Renders a hardcoded list of 4 items for **every tenant regardless of actual history**:

| Icon | Color | Title | Detail shown |
|------|-------|-------|-------------|
| CheckCircle2 | success (green) | "Plan renewed" | `c.planEnd` |
| Plug | primary (blue) | "Lead provider connected" | `c.provider` |
| Rocket | purple | "Onboarding completed" | "go-live signed off" (hardcoded) |
| Flag | text3 (muted) | "Account created" | "initial setup" (hardcoded) |

These items are NOT derived from any event store or history. They appear identically for every tenant. [Mock] — purely decorative.

---

### CRM Automations Tab

Added 2026-07-24. Source: `TenantCrmAutomationsPanel()` in `ClientsPage.jsx` + `data/tenantCrmAutomations.js`. Distinct from the existing **Automations** tab (which shows *Internal Ops* runs — LEDSAK's own automations for this tenant): this tab shows the tenant's **own** CRM automations (lead routing, WhatsApp sends, field updates — their `/automations` + `/flow-automations`), scoped to the last 7 days, with no timespan control. Manual (non-automated) operations are explicitly excluded.

**Data**: seeded for 8 representative tenants (Varun Group, Rezoni, MedLinks, Derma Purtitys, Siama Skincare, Mahakumbh Motors, Urban Autohub, Aryaanya Group) in `SEED_TENANT_CRM_AUTOMATIONS`/`SEED_TENANT_CRM_RUNS` — the other 7 seeded tenants render the empty state (0/0/0, no runs table rows), not fabricated data. Rezoni/Siama Skincare/Mahakumbh Motors' failure timing intentionally matches `data/automationKpis.js`'s `TENANT_CRM_RECENT_FAILURES`, so this per-tenant view and the Automation Center global KPI panel's "Needs Attention" count never disagree about the same tenant.

**Counts row** (3 tiles, clickable except "Automations Configured"):
- Automations Configured — `getTenantCrmAutomations(tenant).length`
- Runs (7d) — click resets both table filters to "All" and scrolls the table into view
- Failed (7d) — click presets the Status filter to "Failed" and scrolls into view; not clickable when zero

**"Needs attention" banner** — a full-width red button, shown *only* if any run failed in the last 48h (not just 7d). Clicking it also presets Status filter to "Failed" and scrolls. Absent entirely when all automations are passing (verified: Dermalife, which has no seeded CRM automation data at all, shows no banner and the empty table state "No CRM automation runs in the last 7 days").

**Log table**: columns Automation / Trigger / Run Time / Status, plus a leading expand-toggle column — no Tenant column (implicit, one tenant), no Period control (hard-capped to 7d). Filters: Automation name (dropdown populated **only** from automations that actually ran in the last 7d, not the tenant's full configured list) and Status (All/Success/Partial/Failed). Row click (or the toggle button) expands an inline detail row showing Run ID, trigger type, and failure reason if any — this is a plain inline expansion, **not** a shared drawer component; see Decisions.

**Automation name links**: rendered with a muted external-link glyph and a tooltip ("Opens this automation's builder in the tenant's own LEDSAK instance — deep link not available yet"). Intentionally non-functional — see Decisions.

---

### Add Seats Modal

Opens when "Add seats" quick-action is clicked. Renders as a `Modal` (centered overlay, z-50, max-w-md).

- Title: "Add seats — {c.name}"
- Field: "Number of seats to add" — `<input type="number">`, default value 5
- Info text: "Current: {c.seats} licensed · {c.employees} in use. Billing adjusts on next cycle." (hardcoded note — no actual billing integration)
- Footer buttons: "Cancel" (closes modal, no change), "Add {seatN} seats" (calls `store.addSeats(c.id, seatN)`)

`store.addSeats(id, n)` — real store mutation: `c.seats += n` for the matching client. The change persists within the session and is reflected immediately when the drawer re-reads the store. Toast: "Added {n} seats".

No minimum or maximum validation on the seat count input.

## Rules
- Tenant status transitions: Active ↔ Suspended (via setTenantStatus). "Trial" status is only set via seed data; there is no UI path to set a tenant to Trial directly.
- `extendTrial` appends a string to `c.plan` (e.g. "PREMIUM TRIAL (+14d)"). It does not change `c.status`, `c.planEnd`, or any date field.
- Industry-based avatar color: Clinic → purple, all others → brand blue.

## Permissions
No access control gates. All super admin users can impersonate, suspend, add seats, and retry invoices.

## Automations
None triggered from this page.

## Decisions
- 2026-07-24 · CRM Automations added as a new tab alongside the existing Automations tab, not merged into it or renaming either · Rejected: renaming "Automations" → "Internal Ops" and/or combining both into one tab with a source toggle. Reason: the originating prompt scoped this strictly to *adding* a new tab; touching the existing tab's name/behavior wasn't asked for and risks confusing "not in scope" with "acceptable side effect." Flagged as a naming-clarity follow-up in Open questions instead.
- 2026-07-24 · Row expansion is a plain inline toggle, not a reusable "Run Details" drawer · Rejected: generalizing `AutomationRunDrawer` (from `AutomationPage.jsx`) into a shared component and reusing it here. Reason: that drawer is hard-coupled to Internal Ops' run shape (`OPS_TRIGGER_LABEL`, email/in-app actions to AM/Tenant) — adapting it now would mean either forking it or overloading it with a second data shape it wasn't designed for. Per the originating prompt's own instruction, this is logged as an open question for a future generalization pass rather than speced/built here.
- 2026-07-24 · Automation names render with a tooltip explaining the deep link doesn't exist yet, rather than either a working link or a plain unstyled label · Rejected: silently omitting any click affordance. Reason: this admin app has no view into a tenant's own LEDSAK instance to deep-link into — building a fake link (or an inline config/graph viewer, i.e. rebuilding their automation builder) would misrepresent capability that doesn't exist. The tooltip states the intended future behavior honestly instead.
- 2026-07-24 · CRM automation data seeded for 8 of 15 tenants, not all · Rejected: fabricating automations for every tenant. Reason: the originating prompt explicitly scoped this to "listed clients" without requiring every one to have data — an empty state is a legitimate, common outcome (verified: tenants with no seeded data show 0/0/0 and no "needs attention" banner, not an error or placeholder).

## Open questions
- The description shows "15 shown" always (not filtered count). Should it update to reflect filtered results?
- "Add seats" row menu action opens Tenant 360 rather than the seat modal directly — is this the intended UX or should it open the modal immediately?
- "Invite" button in Users tab has no handler — what flow should it open?
- "Export" and "Add Tenant" buttons have no handlers — what backend endpoints should they hit?
- The Activity tab shows hardcoded events for every tenant — should this pull from a real audit/event log?
- Reference date for renewal days is hardcoded to "2026-05-13" — should it use `Date.now()`?
- `extendTrial` only appends to the plan name string; it does not change `planEnd` or status — is this intentional?
- Tasks and Automations tabs (pre-existing, not part of the CRM Automations addition) are undocumented in this file — should be written up separately.
- Having both "Automations" (Internal Ops) and "CRM Automations" as adjacent, similarly-named tabs risks user confusion — worth a renaming pass (e.g. "Internal Ops" / "CRM Automations") once that's not competing with an in-flight prompt's explicit scope boundary.
- Per the originating prompt: a generic, reusable "Run Details" popover (generalizing `AutomationRunDrawer` to work for both Internal Ops and tenant-CRM run shapes) doesn't exist yet — this tab's inline row-expansion is a deliberately minimal stand-in, not a replacement for that.
- Per the originating prompt: deep links from an automation name into the tenant's own Automation/Flow Automations builder page don't exist yet — the tooltip communicates intent only. Needs an actual integration point (likely a URL pattern into the tenant's LEDSAK instance) once available.
- Seat addition has no validation (could add 0 or negative seats) — should there be a minimum of 1?
- `u.tenant === c.name` is an exact string match — if a tenant's name changes, their users would disappear from the drawer. Is there a tenant ID link planned?
