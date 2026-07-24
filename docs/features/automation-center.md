# Automation Center — [Mock]
Route: `automation` · Source: `superadmin/src/pages/AutomationPage.jsx` → `AutomationPage()`

## Purpose
Two distinct automation domains on one page:
- **Lead Routing** — tenant-facing workflow that routes incoming leads through enrichment and assignment. Used by tenant admins; managed from here by super admins.
- **Internal Ops** — LEDSAK's own automations that watch tenant health/renewal/payment/onboarding state and notify the assigned AM or the tenant. Not visible to tenants.
- **Automation Logs** — unified run history for all Internal Ops automations.

## State persistence
- Internal Ops automations: `localStorage` key `ledsak_ops_automations_v1`
- Automation run logs: `localStorage` key `ledsak_automation_logs_v1`
- Lead Routing rules: local component state only — resets on navigation

## Flow

### Primary path
1. Page loads on the **Lead Routing** tab. A **Global Automation KPIs** panel (6 tiles) renders above the tab bar on every tab — see its own section below.
2. Admin switches between Lead Routing, Internal Ops, and Internal Ops Logs tabs.
3. Page header description and actions update per active tab.

---

## Global Automation KPIs (above the tab bar, visible on every tab)

Added 2026-07-23. Combines two automation data sources into 6 aggregate KPI tiles, each with a 6-month dense sparkline (no axes/labels):

1. **Automations Configured** — `internal ops automations.length + TENANT_CRM_CONFIGURED_COUNT` (not clickable)
2. **Total Runs — {current month}** — combined run count, clickable
3. **Success Rate — {current month}** — % of runs that did not fail, clickable
4. **Failure Rate — {current month}** — inverse of (3), shown as its own tile per spec (not derived visually from #3), clickable
5. **Needs Attention** — count of *tenants* (deduped, not a count of failing automations) with ≥1 failure in the last 48h, clickable
6. **MTD — {current month}** — restates (2)/(3) for the partial current month, for comparison against the prior full month shown in (2)'s sub-text. Not clickable — it's the same number as (2)/(3), just framed as "so far this month."

### The two data sources
- **Internal Ops** — real run logs (`loadAutomationLogs() || SEED_AUTOMATION_LOGS`, the same data `AutomationLogsSection` reads). The current month's numbers are computed **live** by bucketing these logs by calendar month; the prior 5 months are mocked (`INTERNAL_OPS_MONTHLY_HISTORICAL` in `data/automationKpis.js`) since the seed log data only spans a few days around the pinned "now."
- **Tenant-CRM** — each tenant's own lead-routing/WhatsApp/field automations, run on a separate product with no shared API into this admin app (per the existing Internal Ops Logs banner). There is no real run-level data for this source — only a mocked monthly aggregate (`TENANT_CRM_MONTHLY`) and a short mocked list of recent per-tenant failures (`TENANT_CRM_RECENT_FAILURES`, just enough to drive KPI #5). **This is not a run log** — no tenant-CRM rows ever appear in any table, only in these aggregate numbers.

### Period
Calendar month (not rolling 30d) — chosen because KPI #6 (MTD vs. full-month) only makes sense against a calendar boundary. Internal Ops Logs had no period concept before this change; a **Period** filter (`All time` + the same 6 month labels) was added to it specifically so the KPI drill-through has something to land on.

### "Did not fail" definition
Success Rate/Failure Rate use a binary split: a run's `overallStatus` of `Success` *or* `Partial` counts as "did not fail" — only `Failed` counts as failure. (The underlying logs still track all three statuses; this KPI pair just collapses Partial into "not failed" since it sent at least one action.)

### Click behavior
- KPIs 2–4 (Total Runs / Success Rate / Failure Rate): switches to the **Internal Ops Logs** tab, forces the "All runs" view (not "Needs review", which would hide Success rows), and presets Status + Period filters to match what was clicked (e.g. Failure Rate → Status: Failed, Period: current month). Implemented by lifting a `pendingLogsFilter` state in `AutomationPage` and passing it as `initialStatusFilter`/`initialPeriod` props, with a `key` on `AutomationLogsSection` that changes per filter so re-clicking a different KPI while already on that tab forces a remount (React doesn't re-run a mounted component's `useState` initializers on prop change alone).
- KPI 5 (Needs Attention): calls `go("clients")` — routes to the main Clients list, **not** Internal Ops Logs, since this is a per-tenant "go help them" signal rather than a run-level one. No filter/highlight is applied to the Clients list itself — that per-tenant drill-down view is scoped to a separate, later change.
- KPI 1 (Automations Configured) and KPI 6 (MTD) are informational only, not clickable — there's no single filtered view that represents "everything configured" or "restate the same number a different way."

## Page Header
- Title: "Automation Center"
- Description: changes per tab —
  - Lead Routing: "Workflows, triggers and lead-routing rules"
  - Internal Ops: "LEDSAK's own tenant-state automations — not tenant-facing"
  - Automation Logs: "Every trigger evaluation and action attempt"
- Action button: "New Workflow" (primary, Plus icon) — only visible on Lead Routing tab; opens New Workflow modal

## Tabs
`["Lead Routing", "Internal Ops", "Automation Logs"]` — state held in `useState("Lead Routing")`

---

## Tab: Lead Routing

### Lead Routing Workflow Card
Card header: "Lead Routing Workflow", sub "Active · 12,480 runs this month" [Mock hardcoded], badge "Running" (success).

3 workflow steps displayed as bordered cards with ↓ arrows:

| Step | Icon | Icon color | Title | Detail |
|------|------|-----------|-------|--------|
| 1 | Zap | primary (blue) | "Trigger: New lead from CarWale" | "Webhook received" |
| 2 | Bot | purple | "AI: Summarize & score" | "OpenAI enrichment" |
| 3 | Send | success (green) | "Assign to telecaller" | "Round-robin by brand" |

Step 1 has a blue border; steps 2–3 use default border. The workflow is not editable — no drag, no add-step, no configuration UI.

### Active Rules Card
4 default rules. Local state — resets on navigation:

| Rule name | Trigger | Default |
|-----------|---------|---------|
| Auto-assign leads | New lead | **On** |
| Idle lead nudge | 48h no contact | **On** |
| Churn watch | Health < 50 | **On** |
| Renewal reminder | 30d before expiry | **Off** |

Toggle: updates local state, fires toast "Rule paused" or "Rule enabled". New rules added via "New Workflow" modal also appear here.

### New Workflow Modal (Lead Routing)
Opened by "New Workflow" header button. Two fields:
- **Rule Name** (required text input)
- **Trigger** (required text input, free-form)

"Save" enabled only when both fields are non-empty. On save: prepends new rule to the Active Rules list (enabled by default), fires toast `"{name}" added to Active Rules`. State is local — not persisted.

---

## Tab: Internal Ops

Rendered by `OpsAutomationsSection`. Manages LEDSAK's own tenant-state automations. Automations are persisted to `localStorage`.

### Internal Ops Automation Table
Card header: "Internal Ops Automation", sub "Watches tenant health, renewals, payments and onboarding — notifies the assigned AM or the tenant".

Columns: Title, Trigger (label + condition summary), Actions (per-action chips), Status badge (clickable toggle), row actions menu.

**Row actions**: Edit (opens OpsAutomationModal), Duplicate (copies with "(copy)" suffix + Draft status), Delete (confirm modal — logs remain).

**Status toggle**: clicking the badge toggles Active ↔ Draft inline; fires toast.

**Run Now** button (PlayCircle, green) — only shown for Active automations. On click:
1. Evaluates the automation's trigger against live store state (clients, onboarding, invoices, history).
2. For each matching tenant: calls `simulateOpsRun` → appends log entries to `localStorage`.
3. Toast: "N tenant(s) matched · N sent, N failed" or "no tenants currently match".
4. 900ms simulated delay while running (button shows animate-pulse).

### Seed Automations (5)

| Title | Trigger type | Condition | Actions | Status |
|-------|-------------|-----------|---------|--------|
| Health score drop alert | health_below | Health < 50 | Email → AM, In-app → AM | Active |
| Renewal reminder — 30 days out | renewal_approaching | Renewal within 30d | Email → Tenant | Active |
| Payment failure escalation | payment_failed | Payment failed | Email → AM, Email → Tenant | Active |
| Onboarding stalled nudge | onboarding_stalled | Any stage, stuck 7+ days | Email → AM, In-app → AM | Active |
| Trial → Active conversion notice | status_change | Trial → Active | In-app → AM | Draft |

### Create / Edit Automation Modal (`OpsAutomationModal`)

Fields:
- **Title** (required text input)
- **Trigger Type** (dropdown): selects from 5 types; changes condition fields dynamically
- **Condition** (dynamic fields per trigger type):
  - `health_below`: below/above comparison + threshold number
  - `renewal_approaching`: days before expiry (number)
  - `payment_failed`: overdue by N days (optional; blank = any failure)
  - `onboarding_stalled`: stage (Any or specific stage from ONBOARD_STAGES) + stuck-for days (number)
  - `status_change`: from-status (any or specific: Trial/Active/Suspended) → to-status
- **Actions** (repeatable, min 1): each action has type (Email / In-app) + recipient (AM / Tenant). Constraint: In-app is not available to Tenant recipients — selecting "In-app" with "Tenant" auto-corrects to AM. "Add action" adds a row; trash icon removes.
- **Status** (Active / Draft)

"Save" enabled when title is non-empty and at least one action exists.

### Trigger Types

| id | Label |
|----|-------|
| `health_below` | Tenant health score crosses a threshold |
| `renewal_approaching` | Subscription/renewal date approaching |
| `payment_failed` | Payment failed / overdue |
| `onboarding_stalled` | Onboarding stalled |
| `status_change` | Tenant status changes |

### Trigger Evaluation Logic (`evaluateOpsTrigger`)

Pure function evaluated at "Run now" time. Returns one match per qualifying tenant:

| Trigger | Matching condition |
|---------|------------------|
| health_below | `client.health < threshold` (or `> threshold` if "above") |
| renewal_approaching | `daysUntil(planEnd) >= 0 && <= daysBefore` |
| payment_failed | `invoice.status === "Failed"` (+ optionally `overdueDays >= condition.overdueByDays`) |
| onboarding_stalled | Days in current stage (from activity log or `startedAt`) >= `stuckForDays` |
| status_change | History entries: `entityType === "Client"` + status transition match |

### Recipient Resolution (`resolveOpsRecipient`)

| Recipient type | Resolution | Failure modes |
|---------------|-----------|---------------|
| AM | Looks up `AM_EMAILS[tenant.am]` | AM field empty on client record |
| Tenant | Finds user where `tenant === name` AND role matches `admin\|ceo` | No contact user; contact user is Suspended |

AM email map (hardcoded): `{ "Saif Sir": "saif@ledsak.com", "Luv": "luv@ledsak.com", "Vishal": "vishal@ledsak.com" }`

---

## Tab: Automation Logs

Rendered by `AutomationLogsSection`. Read-only log of every Internal Ops trigger evaluation and action attempt.

### Default view
"Needs review" tab — shows only Partial or Failed runs. Switch to "All runs" to see successes.

### Filters
- Automation (dropdown — all unique automation titles from logs)
- Tenant (dropdown — all unique tenant names from logs)
- Status (All / Success / Partial / Failed)
- Period (All time / last 6 calendar months) — added 2026-07-23 alongside the Global Automation KPIs panel, so its Total Runs/Success Rate/Failure Rate tiles have a matching filter to drill into. Bucketing uses `monthLabelOfWhen()` (`data/automationKpis.js`) against each log's `when` display string.

Both Status and Period can arrive pre-set from a KPI click above (`initialStatusFilter`/`initialPeriod` props) — when either is set, the view defaults to "All runs" instead of "Needs review" so a Success-filtered drill-through isn't hidden by the needs-review filter.

### Table columns

| Column | Content |
|--------|---------|
| Automation | Title of the automation that fired |
| Tenant | Tenant name |
| Trigger | Trigger type label |
| Run Time | Timestamp |
| Status | Badge: Success (green) / Partial (amber) / Failed (red) |
| Eye icon | Opens AutomationRunDrawer |

Row click also opens the drawer. **Export CSV** in card header exports filtered runs (id, automation, tenant, trigger, firedValue, when, status).

### AutomationRunDrawer
Per-run breakdown: automation title, status badge, run ID, per-action list showing type icon (Mail/Bell), label, status badge, recipient email, and failure reason if applicable.

### Seeded logs
Generated at module load by running `evaluateOpsTrigger` against the 4 Active seed automations with `SEED_CLIENTS`, `SEED_ONBOARDING`, `SEED_INVOICES`, `SEED_HISTORY`. Entries are time-spread 9 hours apart descending from 13 May 2026 09:00. This ensures seeded logs are always consistent with what "Run now" would produce for the same inputs.

---

## Rules
- "New Workflow" button is only shown on the Lead Routing tab.
- Lead Routing rule state resets on navigation (not persisted).
- Internal Ops automations and run logs persist to `localStorage`.
- `in_app` action type is only deliverable to AMs — selecting it with Tenant recipient auto-corrects to AM silently.
- Deleting an automation leaves its past logs intact in Automation Logs.
- Run now evaluates against live store state at execution time.

## Permissions
No access control. All super admin users can create, edit, run, and delete automations.

## Decisions
- **Two separate automation domains on one page**: Lead Routing automates a tenant's leads; Internal Ops automates LEDSAK's own responses to tenant events. Merging them would imply a super admin configures tenant workflows — which they don't. Rejected: a single automation builder with a "type" selector.
- **In-app notifications restricted to AM recipients**: Tenants have no in-app login to this admin tool, so delivering an in-app notification to "Tenant" is a guaranteed delivery failure. The builder silently corrects the selection rather than failing at run time. Rejected: allowing tenant in-app and showing a warning at runtime.
- **Seeded logs derived from live evaluator, not hardcoded**: Hardcoded seed logs would drift out of sync with evaluator logic whenever trigger conditions change. Running the evaluator at seed time ensures parity. Rejected: manually crafted seed log entries.
- 2026-07-23 · Global Automation KPIs built as a new `data/automationKpis.js` module rather than folding the aggregation logic into `AutomationPage.jsx` directly · Rejected: inline computation in the page component. Reason: matches the established pattern (`data/logs.js`, `data/security.js`) of keeping seed data + pure aggregation functions separate from the component tree, and keeps the page file's existing exports (already reused by `ClientsPage.jsx`'s Tenant360) unpolluted.
- 2026-07-23 · Tenant-CRM numbers are a flat mocked monthly aggregate, not derived from any per-tenant breakdown · Rejected: building a fuller per-tenant tenant-CRM dataset now. Reason: the spec is explicit that this is an aggregate-only view ("not a per-tenant breakdown") and that the per-tenant view is a separate, later change — building more per-tenant tenant-CRM mock data here would be scope creep against that explicit boundary.
- 2026-07-23 · Calendar-month period (not rolling 30d), added to Internal Ops Logs as a new filter · Rejected: a rolling 30-day window, or leaving Internal Ops Logs without any period filter and only filtering client-side in the KPI component. Reason: KPI #6 (MTD vs. full month) requires a calendar boundary to mean anything, and the KPI drill-through links need a real filter control to land on, not a synthetic one only the KPI panel understands.

## Open questions
- "Run now" is manual — should automations fire automatically on a schedule (cron) or on a store-state event trigger?
- Lead Routing rules are local state only — should they also persist to `localStorage`?
- `AM_EMAILS` is hardcoded — should it be derived from `store.users` to stay current?
- Should Automation Logs show Lead Routing runs (the 12,480/mo workflow executions) alongside Internal Ops runs?
- "12,480 runs this month" sub-header on Lead Routing Workflow — should this be computed from actual logs?
- Should the "New Workflow" modal support choosing a trigger type rather than free-form text?
- Tenant-CRM monthly totals and recent-failures list (`data/automationKpis.js`) are entirely mocked — when the real `/automations` + `/flow-automations` tenant-instance APIs referenced in the originating prompt become available, this module is the integration point to replace with live data.
- The historical 5 months of Internal Ops monthly totals (`INTERNAL_OPS_MONTHLY_HISTORICAL`) are mocked filler, not derived from anything — only the current month is real. If Internal Ops Logs' retention ever extends far enough back, this should switch to computing all 6 months live instead of hardcoding 5 of them.
- KPI #5 "Needs Attention" routes to the plain Clients list with no filter/highlight applied — should it deep-link/highlight the specific at-risk tenants once the per-tenant automation view (a separate, later change) exists there to link into?
