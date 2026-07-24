# Dashboard — [Mock]
Route: `dashboard` · Source: `superadmin/src/pages/DashboardPage.jsx` → `DashboardPage()`

## Purpose
The Dashboard is the landing page for LEDSAK super admins. It presents a snapshot of platform-wide revenue, tenant counts, operational risks, and lead activity. It acts as a command center: KPIs surface problems and clicking alert items navigates directly to the relevant module.

## Flow

### Primary path
1. Shell defaults to `active = "dashboard"` on load — this is always the first page seen.
2. Page renders two rows of KPI cards, a MRR trend chart + "Needs Attention" panel, then two detail tables.
3. Clicking an alert card in "Needs Attention" calls `go("cs")`, `go("integrations")`, or `go("subs")`.
4. Clicking "View all" in "Top Clients" calls `go("clients")`; client name cells also call `go("clients")` (they don't open the 360 drawer from here).
5. Clicking "Details" in "Revenue by Plan" calls `go("subs")`.

### Edge cases
- No loading states — data is synchronous from in-memory store.
- All header action buttons ("This Month", "Export PDF", "Customize") have no `onClick` handler and do nothing.

## KPI Cards — Row 1 (values and sources)

| Label | Value formula | Source | Live? |
|-------|--------------|--------|-------|
| MRR (Approx) | `fmtINR(STATS.mrr)` = ₹3,12,079 | `STATS` constant | [Mock] hardcoded |
| ARR (Run-rate) | `fmtLakh(STATS.arr)` = ₹37.4L | `STATS` constant | [Mock] hardcoded |
| Total Tenants | `STATS.total` = 564, sub "56 paid · 509 free" | `STATS` constant | [Mock] hardcoded |
| In Onboarding | `String(store.onboarding.length)` = 5 | `store.onboarding` | Live from store |

**Trend indicators:**
- MRR: `trend="pos"` → green ArrowUpRight, sub "51 paid clients" [Mock]
- ARR: no trend
- Total Tenants: no trend
- In Onboarding: `trend="pos"` → green ArrowUpRight, sub "pipeline"

## KPI Cards — Row 2

| Label | Value formula | Source | Live? |
|-------|--------------|--------|-------|
| Leads Processed | `fmtK(STATS.leads)` = "869K" | `STATS` constant | [Mock] hardcoded |
| Free → Paid | `Math.round(56 / 564 * 100) + "%"` = "10%" | `STATS` constants | [Mock] computed from hardcoded constants |
| AI Summaries | `STATS.aiUsed` = 483 | `STATS` constant | [Mock] hardcoded |
| Failed Payments | `String(failedPayments.length)`, sub = sum of failed invoice amounts | `store.invoices.filter(i => i.status === "Failed")` | Live from store |

**Trend indicators:**
- Leads: `trend="pos"`, sub "all tenants"
- Free→Paid: `trend="neg"`, sub "below target" → red ArrowDownRight
- AI Summaries: `trend="warn"`, sub "underutilized" → orange (no arrow icon on warn)
- Failed Payments: `trend="neg"` → red ArrowDownRight

## MRR Trend Chart

- Bar chart, 6 months: Dec → May
- Data source: `MRR_TREND` constant — all values hardcoded except May which uses `STATS.mrr`
- Max scale: 340,000 (hardcoded)
- Last bar (current month) renders in primary blue; all prior bars render in light blue `#D3DCEF`
- Value labels shown above each bar in `fmtLakh` format (₹Xz.XL)
- Badge "+" `fmtINR(6379)` net new" — value 6379 is hardcoded
- [Mock] — all historical months are hardcoded constants

## Needs Attention Panel

Three alert items, each a clickable button that navigates to another section. All computed live from store at render time:

| Alert | Computation | Navigate to |
|-------|-------------|-------------|
| "N tenants at churn risk" | `store.clients.filter(c => c.churnRisk !== "Low").length` | `"cs"` |
| "N lead feeds down" | `store.clients.filter(c => !c.providerOk).length` | `"integrations"` |
| "N payments to recover" | `store.invoices.filter(i => i.status === "Failed").length` | `"subs"` |

Sub-text for each is hardcoded:
- "Health below 75 — review now"
- "CarWale sync interrupted"
- "Retry in billing"

Alert colors: churn risk → danger (red left border), lead feeds → danger, failed payments → warning (orange left border).

## Top Clients by Leads Table

- Source: `[...store.clients].sort((a, b) => b.leads - a.leads).slice(0, 5)`
- Always shows exactly 5 rows (top 5 by total leads, all-time)
- Columns: Client (NameCell with branch subtitle, clickable → `go("clients")`), Industry (Badge: purple for Clinic, gray otherwise), Leads (formatted with `en-IN` locale), Health (Progress bar)
- Clicking a client name goes to the Clients list, NOT to the Tenant 360 drawer

## Revenue by Plan Chart

- Source: `PLAN_DIST` constant — 6 hardcoded plan-MRR pairs:

| Plan | Clients | MRR |
|------|---------|-----|
| Business Quarterly | 11 | ₹23,837 |
| WADHWANI SPECIAL | 7 | ₹70,000 |
| Dermapuritys | 7 | ₹58,331 |
| PREMIUM | 5 | ₹39,995 |
| Aryaanya Custom | 3 | ₹24,999 |
| AXTEN SPECIAL | 2 | ₹25,000 |

- BarList component renders label (plan name) + formatted value + note (client count)
- Max scale: 70,000 (hardcoded, matches WADHWANI SPECIAL)
- [Mock] — not derived from `store.subscriptions` or `store.spPlans`

## Topbar Global Search

The topbar search (across the whole app) searches `store.clients` in real time:
- Triggers after 2 characters (`q.length > 1`)
- Filters: `c.name.toLowerCase().includes(q.toLowerCase())`
- Shows up to 5 results with name, industry, and plan
- Clicking a result calls `go("clients")` and clears the query — does NOT navigate to Tenant 360

## Notifications Panel

Accessible via the bell icon in topbar. 5 seeded notifications:

| Icon type | Title | Page target |
|-----------|-------|-------------|
| danger | CarWale feed down for Varun Group | integrations |
| warning | 3 plans expiring within 30 days | cs |
| danger | Payment failed — Rezoni (₹4,167) | billing |
| success | Glow Aesthetics reached Go-Live | onboarding |
| info | TKT-812 assigned to you | support |

Unread count badge appears on bell icon. Clicking a notification: marks it read via `store.markNotifRead(id)`, calls `onGo(n.page)`, and closes panel. "Mark all read" calls `store.markAllRead()`. Note: the "billing" page target in notification #3 has no matching nav route — `go("billing")` would fall through to `DashboardPage` (the `default` case in the switch). [Unverified: this may be a bug or a future route.]

## Impersonation Banner

When `store.impersonating` is set, a full-width orange banner renders above the topbar:
- Text: "Viewing as {name} — actions are performed on their behalf"
- "Exit" button → `store.stopImpersonate()` (sets `impersonating` to null)
- The banner renders for the entire session until exit, regardless of which page is active

## Permissions
No access control exists in code. All super admin users see the same dashboard with the same data.

## Rules
- `fmtINR(n)`: `"₹" + Number(n).toLocaleString("en-IN")`
- `fmtLakh(n)`: `"₹" + (n / 100000).toFixed(1) + "L"`
- `fmtK(n)`: `(n / 1000).toFixed(0) + "K"`
- KPI `trend` colors: `pos` → `#10B981` (green), `neg` → `#DC2626` (red), `warn` → `#F59E0B` (orange), none → `#5A6275` (muted)

## Automations
None triggered from this page.

## Decisions
None recorded.

## Open questions
- The "billing" page in `SEED_NOTIFS[2]` has no nav route — clicking it would show the Dashboard. Was this meant to be `"subs"`?
- Header buttons "This Month", "Export PDF", and "Customize" have no handlers. What should they do?
- Should clicking a client in "Top Clients" open Tenant 360 directly, or is navigating to the list intended?
- `STATS.total = 564` but `store.clients` has 15 entries — the KPI card showing "564" is misleading in the mock. Is 564 the real production figure?
- `STATS.free = 509` + `STATS.subscribed = 56` = 565, but `STATS.total = 564` — off by one. [Unverified: intentional or typo?]
