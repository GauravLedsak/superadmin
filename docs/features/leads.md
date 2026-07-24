# Lead & Record Management — [Mock]
Route: `leads` · Source: `superadmin/src/pages/LeadsPage.jsx` → `LeadsPage()`

> **Note:** The root `LedsakSuperAdmin.jsx` still has the old static version of this page. The rebuilt version is only in `superadmin/src/LedsakSuperAdmin.jsx`. Docs reflect the project copy.

## Purpose
Internal tool — lead records across tenants and whether provider integrations are actually delivering leads. Covers ingestion health, source breakdown, deduplication, and PII-gated contact access. Super admins use it to spot and fix ingestion failures (including routing auth errors to the right fix path), review duplicates, audit who accessed what PII, and export filtered lead sets.

## State persistence
Lead data, audit entries, and PII grants persist to `localStorage` across page reloads (keys: `ledsak_leads_v1`, `ledsak_leads_audit_v1`, `ledsak_pii_grants_v1`). On first load, `SEED_LEADS` (15 seeded records) is used if no stored state is found.

## Flow

### Default landing
1. Page loads in **Needs attention** view — only failed, partial, and duplicate leads are shown in the table.
2. 4 KPI tiles at the top are computed from the live lead list (excluding test-tagged records).
3. If there are active failure incidents, a red banner panel appears above the Processing Status / Lead Sources cards.
4. Auto-refresh fires every 30 seconds (`setInterval`); the manual refresh button also triggers immediately.

### Viewing all leads
1. Switch to **All leads** tab — table expands to show every lead.
2. Apply any combination of Source / Tenant / Processing state / Status dropdown filters.
3. Search by name/tenant/ID in the text field; or by phone last-4 digits (hashed, never unmasks).

### Reprocessing failed leads
1. "Reprocess failed (N)" header button or per-incident "Reprocess all (N)" → opens Confirm Reprocessing modal.
2. Confirm → 1.8 s simulated delay → failed leads transition to `procState: "success"`, AI summary added, history entry appended, audit log entry written.

### Reviewing duplicates
1. Duplicate row in table shows a "Review" link → opens Duplicate Review Modal.
2. Modal shows field-by-field match/mismatch for Name, Phone, Email (values masked if no PII grant).
3. "Merge into original" → duplicate lead gets `procState: "success"`, `status: "Lost"`, audit entry logged.
4. "Not a duplicate — keep both" → `duplicateOf` cleared, `procState: "success"`, audit entry logged.

### Accessing PII
1. Contact column shows masked values by default (`••• 10` for phone, `A•••• B••••` for name).
2. "Request PII access" header button or clicking a masked contact field → opens PII Access Modal.
3. Admin enters a business justification → grant created, stored to `localStorage`, audit entry written.
4. Grant is time-boxed: 4 hours from grant time. Expired grants do not unmask.
5. While grant is active: full name, phone, and email visible everywhere in the page.

### Exporting
- Header "Export (N)" button: exports the currently filtered lead set as CSV. PII is included if a grant is active; otherwise masked as `[MASKED]`.
- Row action "Export row": exports a single lead row.
- Bulk action "Export selected": exports selected rows.
- All exports write an audit log entry.

## Page Header
- Title: "Lead & Record Management"
- Description: "Internal tool — lead records across tenants and whether provider integrations are actually delivering leads"
- Actions (left to right):
  - Spinning "Reprocessing…" indicator (visible only while a reprocess is running)
  - "Reprocess failed (N)" button — red border, danger color — only shown when `reprocessableFailedLeads.length > 0` (excludes auth failures; N = count of failed leads that are NOT 401/token errors)
  - "Export (N)" button — exports filtered set, N = count of filtered rows
  - Manual refresh icon button (RefreshCw)

## KPI Tiles (4 cards, computed from live state)

All tiles exclude test-tagged leads (`isTest: true`) from headline metrics. Clicking a tile with a `filter` value switches to "All leads" view and applies that processing-state filter.

| Label | Value | Sub | Clickable filter |
|-------|-------|-----|-----------------|
| Leads (24h) | count of leads with `receivedAt` containing "13 May" | "+8 vs yesterday" [Mock] | none |
| AI Summarized | `N/M` where N = leads with aiSummary, M = total real leads | "X% enriched" | none |
| Failed Processing | count of `procState === "failed"` | "click to filter" | `failed` |
| Duplicates | count of `procState === "duplicate"` | "awaiting review" | `duplicate` |

Trend colors: Failed → `neg` (red) if count > 0, else `pos`. Duplicates → `warn` (amber) if count > 0. Active filter tile gets a blue border and checkmark.

## Integration Health Card (primary operations panel)

Shown immediately below the KPI tiles. One row per lead source — the unit of diagnosis is the integration, not the individual lead. Computed by `computeIntegrationHealth(realLeads)`:

**Status logic per source:**
- `Healthy` — 0 failed leads for that source
- `Degraded` — at least one failure but error rate < 50%
- `Down` — error rate ≥ 50%

**Columns:**

| Column | Content |
|--------|---------|
| Source | Source name; "(internal)" label appended for Website and Walk-in (no credentials to rotate) |
| Status | Badge: Healthy (green) / Degraded (amber) / Down (red) |
| Tenants affected | Count link; click to expand a badge row showing affected tenant names. "—" when 0. |
| Failure reason | If 1 distinct reason: shows the reason string. If multiple: "N distinct issues". "—" when healthy. |
| Last successful lead | Timestamp of the most recent `procState === "success"` lead for that source. "—" if none. |
| (action) | "Fix in Integrations →" link — only for external sources (IndiaMART, CarWale, CarDekho, WhatsApp) with non-Healthy status. Navigates to `integrations` page with `{ source, tenants }` filter args. Internal sources (Website, Walk-in) with issues show "Not a credential issue" instead. |

**External vs internal sources** (`EXTERNAL_INTEGRATION_SOURCES`): CarWale, CarDekho, WhatsApp, IndiaMART are external (have API credentials). Website and Walk-in are internal capture channels — failures here are not credential issues.

**Card sub-header:** `"{N} source(s) need attention"` or `"All lead sources delivering normally"` depending on whether any source is Down or Degraded.

## Auth Failure Classification

`isAuthFailure(lead)` = `procState === "failed"` AND `mockFailureDebug(lead).httpStatus === 401`. Auth failures are classified as "needs-a-credential-fix" — reprocessing them is a guaranteed no-op until the token is rotated in Integrations.

Consequentially:
- The header "Reprocess failed" button **excludes** auth failures (`reprocessableFailedLeads`)
- Row action menu for auth failures shows **"Fix in Integrations →"** instead of "Retry ingestion"
- Lead Detail Drawer failure panel for auth failures shows **"Fix in Integrations"** button + note "Reprocessing a token-expired lead is a guaranteed no-op" instead of the "Reprocess this lead" danger button

## Lead Processing Overview Card

Sub-header: "Pipeline health signal · click to filter"

4 rows, each clickable to filter the table. Each row now includes a trend delta vs prior 24h [Mock hardcoded]:

| Label | Count source | Color | Trend delta |
|-------|-------------|-------|-------------|
| Successful | `procState === "success"` | success green | "+3 vs prior 24h" (good) |
| Partial (AI timeout) | `procState === "partial"` | warning amber | "steady" |
| Failed Ingestion | `procState === "failed"` | danger red | "+3 vs prior 24h" (bad) |
| Duplicate Flagged | `procState === "duplicate"` | purple | "+1 vs prior 24h" (bad) |

Each row has a mini progress bar proportional to share of total real leads. Trend arrows: ArrowUpRight for increase, rotated ArrowDownRight for decrease. "Steady" shows no arrow. Active filter row gets blue highlight background.

> Note: "Partial (AI timeout)" is explicitly called out as a downstream pipeline issue, separate from Integration Health above. A partial is not proof a source is broken — the lead was successfully ingested, only AI enrichment timed out afterward.

## Lead Sources Card (30d)

Sub-header: "Volume & conversion — performance view, not integration health" (explicitly distinguished from the Integration Health table above)

A table with 4 columns. 6 sources, all hardcoded in `LEAD_SOURCES_DATA`:

| Source | Leads | Conv% | Cost/Lead |
|--------|-------|-------|-----------|
| CarWale | 18,420 | 4.2% | ₹48 |
| CarDekho | 14,100 | 3.8% | ₹52 |
| Website | 8,900 | 6.1% | ₹18 |
| WhatsApp | 4,200 | 8.4% | ₹5 |
| IndiaMART | 2,100 | 2.9% | ₹35 |
| Walk-in | 2,590 | 12.1% | Free |

Conv% cells are green if ≥ 5% (Website, WhatsApp, Walk-in), otherwise default text color. Rows are clickable to filter the leads table by that source.

## Recent Leads Table

### Card header sub-text
- PII granted: `"PII visible · expires {activePIIGrant.expiresAt}"`
- PII not granted: `"PII masked · request access to view contact details"`

### View tabs
- **Needs attention** (default): shows `procState` in `["failed", "partial", "duplicate"]`
- **All leads**: shows every record
- Switching tabs resets all secondary filters and pagination

### Search / filter bar
| Control | Behavior |
|---------|----------|
| Text search | Matches `name`, `tenant`, or `id` (case-insensitive, substring) |
| Phone last-4 search | Hashes the entered digits; matches against `last4Hash(phone)` — never unmasks |
| Source dropdown | Filters by `lead.source`; options: All, CarWale, CarDekho, Website, WhatsApp, IndiaMART, Walk-in |
| Tenant dropdown | Filters by `lead.tenant`; options: All + 6 tenant names |
| Processing dropdown | Filters by `lead.procState`; options: All, success, partial, failed, duplicate |
| Status dropdown | Filters by `lead.status`; options: All, New, Assigned, Contacted, Converted, Lost |
| Clear filters button | Appears when any filter is active; resets all to "All" / empty |
| Lead count | Right-aligned "N leads" label showing current filtered count |

### Bulk selection bar (shown when rows selected)
- "{N} selected" label
- "Reprocess failed (N)" — only shown for selected leads that are in `failedLeads`
- "Export selected" — CSV export of selected rows
- "Clear" — deselects all

### Table columns
| Column | Content |
|--------|---------|
| Checkbox | Row selection; shift-click for range select; header checkbox selects/deselects all |
| Lead ID | Mono font; TEST badge (amber) if `isTest: true` |
| Source | Gray badge |
| Tenant | Clickable link → `go?.("clients")`; tier badge (Enterprise = purple, Growth = info/blue, Trial = gray) |
| Contact (PII) | PII granted: full name + phone. Not granted: masked name (clickable) → opens PII Access Modal |
| Status | Colored badge: New = gray, Assigned = info, Contacted = warning, Converted = success, Lost = danger |
| Processing | Icon + state label. Duplicate rows show "Review" link → Duplicate Review Modal |
| Received / Processed / Delivered | Received timestamp + `processed +Ns` / `delivered +Ns` derived deterministically from lead ID |
| Actions | Menu: View details; for failed leads — "Fix in Integrations →" (auth failures) or "Retry ingestion" (non-auth failures); Reassign tenant, Mark/Unmark test data, Escalate to engineering, Export row |

### Pagination
Full pagination: page number, previous/next, configurable rows per page.

## Modals and Drawers

### Confirm Reprocessing Modal
- Explains the action and lead count
- Info banner (blue): "Credential/auth failures aren't offered here — those need the token rotated in Integrations first, not a reprocess." (Only non-auth failures are reprocessable; auth failures are excluded at the source and never reach this modal)
- Confirm: 1.8s delay, leads move to `procState: "success"`, history + audit entries added

### Reassign Tenant Modal
- Lists all tenant options except current tenant
- Each shows tier badge
- Selecting a tenant updates `lead.tenant`, `lead.tenantId`, appends history + audit entry

### PII Access Modal
- Required justification textarea (empty → Submit disabled)
- On submit: grant created with 4h expiry, saved to `localStorage`, audit entry written
- Confirmation screen (1.2s) then auto-closes

### Lead Detail Drawer
Two tabs: **Details** and **History**

**Details tab:**
- Header: masked/unmasked name, TEST badge if applicable, "Request PII access" button if not granted
- "View tenant" link → `go?.("clients")`, tenant tier badge
- Contact fields: Phone, Email, Source, Assignee (masked if no PII grant)
- Status selector (dropdown): New / Assigned / Contacted / Converted / Lost — updates inline
- Assignee selector (dropdown): Unassigned / Saif Sir / Luv / Vishal — updates inline
- AI Summary panel (blue highlight box) — shown if `lead.aiSummary` is non-null
- Failure debug panel (red box) — shown if `procState === "failed"`: failure reason, HTTP status, attempt #, next retry ETA, raw → normalized payload diff (expandable). CTA depends on failure type:
  - **Auth failure** (`isAuthFailure`): "Fix in Integrations" button → navigates to integrations page with source + tenant; note reads "Reprocessing a token-expired lead is a guaranteed no-op"
  - **Other failure**: "Reprocess this lead" danger button
- Duplicate match panel (purple box) — shown if `procState === "duplicate"`: match reason, confidence %, matched lead ID

**History tab:**
- Chronological activity log from `lead.history` array
- Avatar initial circle (blue), action text, actor + timestamp

### Duplicate Review Modal
- Confidence badge: e.g. "Phone number — exact match · 97% confidence"
- 3-column comparison table: Field / Duplicate values / Original values — with Match (green) or Differs (red) indicators
- Source → Tenant row, Received timestamp row
- Note: fields stay masked if no PII grant ("•• masked ••")
- "Not a duplicate — keep both" → dismisses (both leads stay, duplicate's `procState` → `success`)
- "Merge into original" → duplicate gets `status: "Lost"`, `procState: "success"`, `duplicateOf` kept

## Audit Trail
Every mutating action appends an entry to `ledsak_leads_audit_v1` in `localStorage`:

| Action type | Triggers |
|-------------|---------|
| Reprocess | Manual reprocess (single, bulk, all failed) |
| Export | Bulk export, row export, selected export |
| Duplicate Merge | Merge action in modal |
| Duplicate Dismiss | Dismiss action in modal |
| Status Change | Status dropdown in drawer |
| Assignment | Assignee dropdown in drawer |
| PII Access | PII grant created (includes justification) |
| Reassign Tenant | Tenant reassignment |
| Mark Test Data | Test flag toggle |
| Escalation | "Escalate to engineering" row action |

Entries include: id, action text, by (ADMIN = "Saif Khan"), when (locale timestamp), type, optional ids array.

## Seed Data (SEED_LEADS)
15 records. Schema per lead: `id, name, phone, email, source, tenant, tenantId, status, procState, duplicateOf, aiSummary, assignee, receivedAt, failureReason, isTest, history[]`

Processing states in seed:
- `success` × 8 (ld-001, ld-002, ld-005, ld-007, ld-009, ld-010, ld-012, ld-015)
- `failed` × 3 — all IndiaMART, same reason "Auth error: IndiaMART API token expired" (ld-003, ld-004, ld-011)
- `partial` × 2 — AI enrichment timeout, no aiSummary (ld-008, ld-014)
- `duplicate` × 2 — phone-match pairs (ld-006 ↔ ld-005; ld-013 ↔ ld-009)

Tenants and tiers:
- **Enterprise**: MedLinks, Varun Group
- **Growth**: Derma Purtitys, Urban Autohub
- **Trial**: Rezoni, BrightPath Edu

## Lead Statuses
New → Assigned → Contacted → Converted / Lost

## Rules
- Test-tagged leads are excluded from all KPI tile counts and integration health computation.
- Auth failures (HTTP 401) are never offered as reprocessable — they need a credential rotation in Integrations first. The reprocess button, row action, and drawer CTA all enforce this.
- Integration Health status per source: 0 failures = Healthy; ≥1 failure but < 50% error rate = Degraded; ≥ 50% error rate = Down.
- Only external sources (IndiaMART, CarWale, CarDekho, WhatsApp) show "Fix in Integrations →"; Website and Walk-in are internal channels with no credentials to rotate.
- View switch always resets all secondary filters (prevents stale filter confusion on tab change).
- Phone search operates only on the last-4-digit hash — the raw phone value is never compared in search.
- PII grants expire after 4 hours from `grantedAt`; expired grants do not unmask.
- Reprocess transitions `procState` from `failed` → `success` and adds a synthetic AI summary.
- All mutations update both in-memory state and `localStorage`.

## Permissions
No role-based access control in this build. All super admin users can access all leads including PII (after justification). PII access is self-approved — there is no separate approver.

## Automations
Auto-refresh fires every 30 seconds via `setInterval` (does not fetch new data — re-renders from current state).

## Decisions
- **Default to "Needs attention" view, not "All leads"**: Healthy lead volume is a number in a KPI tile, not a scrollable table. The default view surfaces only actionable items. Rejected: showing all leads by default (too noisy for a monitoring use case).
- **Phone search via one-way hash**: Support can confirm a caller's identity without ever seeing their full number. Rejected: masked-number substring search (can leak partial PII patterns).
- **Integration Health as the primary card, not per-incident banners**: The integration is the unit of work — 20 failures from the same expired token are one source row, not 20 incident cards. Replaced the earlier per-incident red banner approach with a full table showing all sources (healthy or not) so the absence of failures is also visible. Rejected: one alert card per source → tenant → reason combination (too granular, doesn't answer "is IndiaMART broken?" at a glance).
- **Reprocess button excludes auth failures**: Offering reprocess for a 401 failure is a guaranteed no-op and misleads the admin into thinking they fixed something. Auth failures are routed to "Fix in Integrations →" everywhere they appear. Rejected: showing "Reprocess" for all failed leads with a warning tooltip.

## Open questions
- PII access is self-approved — should it require a second reviewer or manager approval?
- Reprocess is fully simulated (setTimeout, no real API call) — what's the real ingestion endpoint?
- "Escalate to engineering" only writes an audit entry — should it open a support ticket or send a Slack message?
- Auth errors on IndiaMART leads suggest the token is expired — is there a token refresh flow accessible from the Integrations page?
- `isTest` flag exists in the schema but there is no seed lead with `isTest: true` — how are test leads entered in practice?
- The phone last-4 hash is a non-cryptographic hash (`h * 31 + charCode`) — acceptable for production?
- No per-tenant lead count breakdown visible from this page — should KPI tiles break down by tenant?
