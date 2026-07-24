# Integrations — [Mock]
Route: `integrations` · Source: `superadmin/src/pages/IntegrationsPage.jsx` → `IntegrationsPage()`

## Purpose
Shows all platform-level integrations (lead providers, messaging, payments, vertical connectors), their connection status, and how many tenants use each. Super admins can trigger reconnect actions for broken feeds. The sidebar badge shows "!" (exclamation) when any feed is down.

Also functions as a deep-link target from Lead & Record Management — when navigating from the Leads page's "Fix in Integrations →" action, the page receives `{ source, tenants }` filter args and bumps the matching integration card to the top with a blue highlight and a context banner.

## Flow

### Primary path
1. Page loads. If any tenants have `providerOk: false`, a full-width alert banner renders at the top.
2. Below the banner, 6 integration cards render in a 3-column grid.
3. Cards with `ok: false` show a "Reconnect" button.
4. "Reconnect all" in the banner → `store.notify("Reconnect requests sent to affected tenants")`.
5. "Reconnect" on a card → `store.notify("{name} reconnect started")`.
6. "Add Integration" button → `store.notify("Integration added")`.

### Deep-link from Lead & Record Management
When navigated to with a `filter` prop (`{ source, tenants }`):
1. A blue context banner appears above the feed-down alert: "Filtered from Lead & Record Management — **{source}** affects N tenants: {tenant list}"
2. The matching integration card is sorted to the top of the grid (by name prefix match on `filter.source`).
3. The matched card gets a blue border + blue box-shadow highlight.
4. "Clear" button on the banner sets `filterDismissed = true`, removing the context and re-sorting cards to default order.

IndiaMART integration health is live-computed from leads: `indiaMartHealth = computeIntegrationHealth(loadLeads() || SEED_LEADS).find(h => h.source === "IndiaMART")`. IndiaMART's `ok` status and tenant count reflect actual lead processing failures, not a hardcoded value.

### Edge cases
- The "feed down" alert banner renders only when `brokenTenants.length > 0`. With seeded data, 3 tenants have `providerOk: false` (Rezoni, Varun Group, Mahakumbh Motors — all using CarWale).
- If the deep-link filter does not match any integration name, all cards render in default order with no highlight.

## Feed-Down Alert Banner

Renders when `brokenTenants = store.clients.filter(c => !c.providerOk)` is non-empty:
- Background: `T.dangerSoft`, 3px red left border
- Icon: TriangleAlert (red)
- Text: "{brokenTenants.length} tenant feeds are down"
- Subtitle: comma-joined list of `t.name` for each broken tenant
- "Reconnect all" button: `store.notify("Reconnect requests sent to affected tenants")`

With seeded data: "Rezoni, Varun Group, Mahakumbh Motors" shown in the subtitle.

## Integration Cards (6 cards, 3-column grid)

| Integration | Category | Tenants | Connected? | Notes |
|-------------|----------|---------|-----------|-------|
| CarWale | Lead provider | 42 | `brokenTenants.every(t => t.provider !== "CarWale")` → **false** (feed down) | Shows "Feed down" badge (red) + Reconnect button |
| IndiaMART | Lead provider | `indiaMartHealth.total` (live from leads) | `indiaMartHealth.status === "Healthy"` | Status + count derived from `computeIntegrationHealth` |
| CarDekho | Lead provider | 38 | true | "Connected" badge (green) |
| WhatsApp Business | Messaging | 210 | true | "Connected" badge (green) |
| Cliniceo EMR | Healthcare | 12 | true | "Connected" badge (green) |
| Razorpay | Payments | 56 | true | "Connected" badge (green) |
| Dealer DMS | Automotive | 1 | true, `beta: true` | "Beta" badge (orange) |

**CarWale status logic** (real, not hardcoded):
```js
ok: brokenTenants.every(t => t.provider !== "CarWale")
```
If any broken tenant uses CarWale, this evaluates to `false` → card shows "Feed down". With seeded data, Rezoni and Varun Group use CarWale + providerOk: false, so CarWale always shows as down.

**Card layout**:
- Top: icon (Car/MessageSquare/Stethoscope/CreditCard/Server) in a rounded square, 36×36px, `T.subtle` background
- Top-right: status badge (Beta / Connected / Feed down)
- Name (bold 14px) + category (muted text)
- Footer (bordered top): "Connected tenants" label + count (right-aligned bold)
- "Reconnect" button: only renders when `!it.ok`. Full-width, centered.

**Tenant counts are hardcoded** (not computed from `store.clients`):
- CarWale: 42, CarDekho: 38, WhatsApp: 210, Cliniceo: 12, Razorpay: 56, Dealer DMS: 1

## Rules
- CarWale connection status is derived from `store.clients` (live), not hardcoded.
- IndiaMART connection status and tenant count are derived from lead processing health (`computeIntegrationHealth`), not hardcoded.
- All other integrations' `ok` values are hardcoded `true`.
- Reconnect actions fire toasts only — no store state changes, no retry mechanism.
- Deep-link filter is dismissed per-session (state is local); navigating away and back resets to default order.

## Permissions
No access control. Sidebar badge "!" (red) appears for all users when any feed is down.

## Automations
None triggered from this page. The "!" badge and alert banner are display-only.

## Decisions
None recorded.

## Open questions
- "Add Integration" button has no handler — should it open a connector marketplace or configuration form?
- Reconnect buttons produce toasts only — should they trigger a real webhook retry or alert the tenant?
- Tenant counts (42, 38, 210 etc.) are hardcoded but don't match `store.clients` provider distribution (with seeded 15 clients). Are these intended as production figures?
- Dealer DMS shows `beta: true` — what gates beta status? Is it per-tenant feature flag (`dms` flag in Settings)?
- Should Cliniceo EMR status be tied to the `emr` feature flag in Settings?
