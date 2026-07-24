# Subscriptions & Plans — [Mock]
Route: `subs` · Source: `superadmin/src/pages/SubscriptionsPage.jsx` → `SubscriptionsPage()` + `SubsOverview()` + `PlanLibrary()` + `AddonPricingPage()` + `ClientSubscriptions()` + `SubscriptionAssign()` + `SubscriptionDetail()`

## Purpose
The most complex module in the admin panel. Manages the full subscription lifecycle: plan library (create/edit/archive plans), global addon pricing, assigning subscriptions to clients, and revenue analytics. The pricing engine computes real figures from plan + addon + discount inputs.

## Tabs

Five tabs: **Overview** · **Plan Library** · **Addon Pricing** · **Client Subscriptions** · **Revenue**

Note: "Revenue" tab renders `<SubsOverview />` — identical to the Overview tab. It is a placeholder duplication.

Page header: "Subscriptions & Plans · Plan library, pricing, client subscriptions and revenue analytics". No page-level action buttons.

---

# Tab: Overview

Source: `SubsOverview()`

## KPI Row 1 (all computed live from store)

| Label | Formula |
|-------|---------|
| Active Subscriptions | `store.subscriptions.filter(s => s.status === "Active").length` |
| MRR | Sum of: for Monthly subs → `finalPrice`; for Yearly subs → `Math.round(finalPrice / 12)` |
| ARR | `totalMRR * 12` |
| Total Clients | `String(store.clients.length)`, sub `"{store.subscriptions.length} subscribed"` |

## KPI Row 2 (all computed live from store)

| Label | Formula |
|-------|---------|
| Published Plans | `store.spPlans.filter(p => p.planType === "Published" && p.status === "Active").length` |
| Custom Plans | `store.spPlans.filter(p => p.planType === "Custom" && p.status === "Active").length` |
| Avg Discount | `active.reduce((s,x) => s + (x.subtotal - x.finalPrice), 0) / active.length` (rounded, 0 if no active subs) |
| Discount Loss | `active.reduce((s,x) => s + (x.subtotal - x.finalPrice), 0)` |

## Revenue by Plan Bar Chart

Computed from `store.spPlans` + `store.subscriptions`:
- For each Active plan: finds all Active subscriptions on that plan, sums their `finalPrice`
- Filters to plans with revenue > 0, sorts descending
- Max scale: `Math.max(...store.subscriptions.map(s => s.finalPrice), 1)` (max single subscription price)
- Bar colors: Published plans → primary blue, Custom plans → purple

## Upcoming Renewals Table

Shows first 5 Active subscriptions from `store.subscriptions` (`.filter(s => s.status === "Active").slice(0, 5)`). No sort applied — order matches insertion order.

Columns: Company (bold), Plan (small text), Renewal (mono muted, `s.renewalDate`), Price (`fmtINR(s.finalPrice)` bold).

## Recent Activity

`store.history.slice(0, 6)` — most recent 6 history entries. Each row:
- History icon (muted)
- Badge showing `h.entityType` (gray)
- `h.action` (bold) · `h.changedBy` · `h.changedDate`

---

# Tab: Plan Library

Source: `PlanLibrary()`

## Filter Controls

| Control | Options | Default | Match |
|---------|---------|---------|-------|
| Search | Free text | "" | `p.planName.toLowerCase().includes(q.toLowerCase())` |
| Type | All / Published / Custom | All | Exact on `p.planType` |
| Status | All / Active / Inactive / Archived | All | Exact on `p.status` |

Filters are ANDed via `useMemo`. "Create Plan" button is in the filter row (right-aligned).

## Table Columns

| Column | Source | Detail |
|--------|--------|--------|
| Plan Name | `p.planName` | Blue link button, opens View drawer |
| Type | `p.planType` | Badge: Published→brand (blue), Custom→purple |
| Monthly | `fmtINR(p.monthlyPrice)` | Bold |
| Yearly | `fmtINR(p.yearlyPrice)` | Small muted |
| Users | `{usersIncluded}–{usersMaximum}` | Small text |
| Records | `fmtRecords(p.recordsIncluded)` | Small text (uses `fmtRecords`: ≥100000 → "X lakh", else locale) |
| Status | `p.status` | statusBadge |
| Clients | `store.subscriptions.filter(s => s.planId === p.id && s.status !== "Cancelled").length` | Count (live from store) |
| Created By | `p.createdBy` | Small muted |
| (actions) | — | Menu |

## Row Actions (Menu)

| Action | Condition | Code |
|--------|-----------|------|
| View | Always | `setViewPlan(p)` |
| Edit | Always | `setDrawer({ mode: "edit", plan: p })` |
| Duplicate | Always | `handleDuplicate(p)` → `store.duplicatePlan(p.id)`, then `setDrawer({ mode: "duplicate", plan: dup })` |
| ─ | Always | Divider |
| Archive | `p.status !== "Archived"` | `store.archivePlan(p.id)` |
| Delete | `clientCount(p.id) === 0` only | `store.deletePlan(p.id)` |

Delete is only shown (not just disabled) when the plan has 0 active clients. A plan with clients can only be Archived, not deleted.

## Create/Edit Drawer (PlanForm)

Width: 700px. Opened via "Create Plan" button or row "Edit" action.

### PlanForm fields

**Core section** (2-column grid):
- **Plan Name** (text input, required)
- **Plan Type** select: Published or Custom

When type changes to **Custom**, these fields are automatically reset:
- `usersMaximum = usersIncluded`
- `recordsMaximum = recordsIncluded`
- `integrationsMaximum = integrationsIncluded`
- All addon toggles set to `false`, all addon prices set to 0

**Description** (textarea, 2 rows)

**Pricing section** (3-column grid):
- Monthly Price (₹) (number input)
- Yearly Price (₹) (number input)
- Status select: Active / Inactive / Archived

**Resources & Limits section** — layout differs by plan type:

*Published plan*: 3 resource rows (Users, Records, Integrations), each a 5-column row:
- {Resource} Included (number input)
- {Resource} Maximum (number input)
- "Addon Allowed" checkbox
- If addon allowed: "Addon Price/unit (₹)" (number input)
- Empty column

*Custom plan*: 3-column grid, included count only:
- Users (number input)
- Records (number input)
- Integrations (number input)
- Label above section: "Custom — included count is the limit" (purple pill)

**Common fields** (3-column grid at bottom of resources):
- Automations Included (number)
- Custom Entities Included (number)
- Deals Module Enabled (checkbox)

### Validation rules (real, client-side)

| Field | Rule | Error message |
|-------|------|---------------|
| `planName` | Must not be empty (after trim) | "Required" |
| `monthlyPrice` | Must be ≥ 0 | "Cannot be negative" |
| `usersIncluded` | Must be ≥ 1 | "Min 1" |
| `usersMaximum` | Must be ≥ `usersIncluded` | "Must be ≥ included" |
| `recordsMaximum` | Must be ≥ `recordsIncluded` | "Must be ≥ included" |

Errors show inline next to the field label. Submit is blocked if any error exists. No server-side validation.

### Save behavior
- **Create / Duplicate**: calls `store.createPlan(plan)` → adds to `store.spPlans`, adds history entry, toast
- **Edit**: calls `store.updatePlan(plan.id, plan, "Edited")` → updates in place, adds history entry, toast

## View Plan Drawer (560px)

Opened via row "View" action or clicking the plan name. Read-only. Shows:
- Plan name (h2), description, Type badge + Status badge
- 3 KPI cards: Monthly price, Yearly price, Clients (live count)
- Resources card: Users range (with addon price if allowed), Records range, Integrations range, Automations, Custom Entities, Deals Module
- History card: `store.history.filter(h => h.entityId === p.id)` — plan-level changes only
- Footer buttons: "Edit" (opens edit drawer) and "Duplicate" (duplicates then opens drawer)

## Seeded Plans (6 total)

| Name | Type | Status | Monthly | Yearly | Users | Records |
|------|------|--------|---------|--------|-------|---------|
| Starter | Published | Active | ₹2,999 | ₹29,990 | 5–10 | 1 lakh–9 lakh |
| Growth | Published | Active | ₹7,999 | ₹79,990 | 12–20 | 10 lakh–20 lakh |
| Enterprise | Custom | Active | ₹3,50,000 | ₹35,00,000 | 100 | 500 lakh |
| Hospital Package | Custom | Active | ₹16,250 | ₹1,62,500 | 45 | 50 lakh |
| Startup Plan | Custom | Active | ₹1,499 | ₹14,990 | 3 | 50,000 |
| Legacy Plan | Custom | Inactive | ₹4,167 | ₹41,670 | 10 | 2 lakh |

Published plans have addon pricing. Custom plans: included = maximum, no addons.

---

# Tab: Addon Pricing

Source: `AddonPricingPage()`

Global default addon pricing. 3 cards in a responsive grid.

Seeded addon types:

| Addon type | Price per unit | Min | Max | Default enabled | Description |
|-----------|---------------|-----|-----|----------------|-------------|
| Users | ₹500 / unit / mo | 1 | 100 | Yes | Additional user seats per month |
| Records | ₹1,000 / unit / mo | 1 | 50 | Yes | Additional 1 lakh records per unit |
| Integrations | ₹800 / unit / mo | 1 | 20 | Yes | Additional integration slots per month |

**Default view** per card: price (22px bold), description (muted), range ("Range: X–Y units"), "Edit" button.

**Edit mode** (inline, replaces card body):
- Price per Unit (₹) — number input
- Min — number input (half-width)
- Max — number input (half-width)
- Enabled — checkbox
- "Save" (primary) + "Cancel" buttons

Save calls `store.updateAddonPricing(id, form)` → updates in `store.addonPricing`, adds history entry, toast "Addon pricing updated".

---

# Tab: Client Subscriptions

Source: `ClientSubscriptions()`

## Filter Controls

| Control | Options | Default |
|---------|---------|---------|
| Search | Free text | "" | Matches `s.companyName` or `s.planName` (case-insensitive) |
| Status | All / Active / Trial / Expired / Cancelled | All |

"Assign Subscription" button (primary, right-aligned).

## Table Columns

| Column | Source | Detail |
|--------|--------|--------|
| Company | `s.companyName` | Blue link, opens SubscriptionDetail drawer |
| Plan | `s.planName` | Plain text |
| Type | `plan?.planType` | Badge: Published→blue, Custom→purple, "—" if plan not found |
| Cycle | `s.billingCycle` | Small text (Monthly / Yearly) |
| Renewal | `s.renewalDate` | Monospace muted |
| Status | `s.status` | statusBadge |
| Base | `fmtINR(s.basePrice)` | Bold |
| Add-ons | `s.addons` | Comma-joined "{type}×{quantity}", or "—" |
| Discount | `s.discount?.value` | Percentage as "X%", flat as `fmtINR(value)`, or "—" |
| Final | `fmtINR(s.finalPrice)` | Bold, primary blue color |
| By | `s.createdBy` | Small muted |
| (actions) | — | Menu |

## Row Actions

| Action | Condition | Code |
|--------|-----------|------|
| View detail | Always | `setDetail(s)` |
| Edit | Always | `setDrawer(s)` → opens SubscriptionAssign in edit mode (starts at step 3) |
| Cancel | `s.status === "Active"` only | `store.updateSubscription(s.id, { status: "Cancelled" }, "Cancelled")` |

## Seeded Subscriptions (5 total)

| Company | Plan | Type | Cycle | Status | Base | Final |
|---------|------|------|-------|--------|------|-------|
| MedLinks | Hospital Package | Custom | Monthly | Active | ₹16,250 | ₹16,000 |
| Dermalife | Growth | Published | Monthly | Active | ₹7,999 | ₹12,149 |
| Varun Group | Enterprise | Custom | Monthly | Active | ₹3,50,000 | ₹3,00,000 |
| Evinces Ventures | Starter | Published | Monthly | Trial | ₹0 | ₹0 |
| Inside Edge Learning | Growth | Published | Yearly | Active | ₹79,990 | ₹85,490 |

Note: Dermalife's `finalPrice` (₹12,149) > `basePrice` (₹7,999) because it has addons (Records×5 + Users×3) that bring the subtotal to ₹13,499, then a 10% discount is applied: ₹13,499 × 0.9 = ₹12,149.

---

# Subscription Assign Wizard

Source: `SubscriptionAssign({ onClose, editSub })`

Opens as a Drawer (650px wide). Used for both create (4 steps) and edit (starts at step 3). Step progress shown as 4 filled/unfilled bars.

## Step 1 — Choose Company

Lists all clients where `c.status !== "Suspended"`. Each client is a selectable button showing Avatar + name + industry · branch. Clicking a company auto-advances to Step 2.

Excluded: Suspended clients (Mahakumbh Motors with seeded data).

## Step 2 — Choose Plan

Lists all plans where `p.status === "Active"`. Each plan shows: name, type · users · records (small), monthly price (right-aligned bold). Clicking a plan:
- Sets `planId`
- If Custom plan: pre-fills `quotedPrice = p.monthlyPrice`
- Auto-advances to Step 3

Back button returns to Step 1.

## Step 3 — Configure & Preview

Layout: Card with configuration fields + separate "Pricing Preview" card.

**Configuration fields**:
- **Billing Cycle** select (Monthly / Yearly). For Custom plans, changing cycle updates `quotedPrice` to `plan.yearlyPrice` or `plan.monthlyPrice`.
- **Trial checkbox** (14 days): sets `isTrial = true`, which sets `status = "Trial"` and `finalPrice = 0`.

**For Published plans only** — Addons section:
- Each addon type (Users, Records, Integrations) shows if the plan allows that addon
- If not allowed: "{type}: not available on this plan" (muted text)
- If allowed: checkbox to enable + quantity input + "× {fmtINR(price)} = {fmtINR(total)}" calculation

**For Published plans only** — Discount section:
- Type select: Flat or Percentage
- Value input (number)
- Reason input (text, required if value > 0)

**For Custom plans only** — Negotiated Pricing section:
- Shows list price from `PricingEngine.getBasePrice(plan, cycle)` and what's included
- "Quoted Price (₹)" input (large, primary blue border) — admin enters the actual agreed price
- "Pricing Reason" text input
- If `quotedPrice < basePrice`: shows effective discount as "Flat ₹X (Y% off list)" in green

**Internal Notes** textarea (always shown, any plan type).

**Pricing Preview card** (renders when `plan` is selected, blue double border):
- Badge: "Negotiated" for Custom, "Live calculation" for Published
- Breakdown rows:
  - List Price (cycle)
  - For Published: each addon line (type × qty)
  - For Published: Subtotal
  - Discount amount (green, if > 0)
  - Final Price (bold, primary blue, larger font)
  - "Taxes / GST placeholder — future-ready" (italic muted)

**"Review & Assign" button** disabled when:
- No plan or no company selected
- Published plan: discount value > 0 but reason is empty
- Custom plan: `quotedPrice <= 0` AND not a trial

Back button returns to Step 2.

## Step 4 — Confirm

Shows summary card: Company, Plan (+ type), Billing + trial indicator, Final Price (large bold blue).

Inline validation: if `discVal > 0 && !discReason.trim()` → red error text.

"Assign Subscription" / "Update Subscription" (primary, full-width): calls `submit()`.

## Submit Logic (real)

```js
// Published plan
sub = {
  companyId, companyName, planId, planName, billingCycle: cycle,
  status: isTrial ? "Trial" : "Active",
  startDate: "13 May 2026",  // hardcoded NOW constant
  renewalDate: cycle === "Yearly" ? "13 May 2027" : "13 Jun 2026",  // hardcoded
  isTrial, trialEnd: isTrial ? "27 May 2026" : null,  // hardcoded 14-day end
  basePrice: preview.basePrice,
  addons,
  discount: { type: discType, value: discVal, reason: discReason, appliedBy: ADMIN, appliedDate: NOW },
  subtotal: preview.subtotal,
  finalPrice: preview.finalPrice,
  notes
}

// Custom plan
sub = {
  ...same structure...
  discount: { type: "Flat", value: basePrice - quotedPrice, reason: quotedReason || "Negotiated pricing", ... },
  addons: [],
  subtotal: basePrice,
  finalPrice: quotedPrice || basePrice
}
```

Calls `store.createSubscription(sub)` (new) or `store.updateSubscription(id, sub, "Modified")` (edit). Both add a history entry.

**Renewal dates are hardcoded strings** (not computed from the actual current date):
- Monthly: "13 Jun 2026"
- Yearly: "13 May 2027"

---

# Subscription Detail Drawer

Source: `SubscriptionDetail({ sub, onClose })` — 600px wide.

Re-reads from `store.subscriptions.find(x => x.id === sub.id)` so edits made while the drawer is open are reflected.

**Sections**:
1. **Header**: company name (h2), plan · cycle · since {startDate} (muted), status badge, close button
2. **Pricing Breakdown card**: base, each addon (type × qty), subtotal, discount (with reason), final price
3. **Details card**: Renewal date, Trial status, Created By + date, Internal Notes (if any)
4. **Plan Resources card**: Users range, Records, Integrations, Automations (from `store.spPlans.find`)
5. **Audit History card**: `store.history.filter(h => h.entityId === s.id)` — subscription-level changes

---

# Pricing Engine (real logic, used by the wizard)

```js
PricingEngine = {
  getBasePrice(plan, cycle):
    cycle === "Yearly" ? plan.yearlyPrice : plan.monthlyPrice

  calcAddonTotal(addons):
    sum of (a.quantity * a.unitPrice) for each addon

  calcSubtotal(basePrice, addons):
    basePrice + calcAddonTotal(addons)

  applyDiscount(subtotal, discount):
    if !discount || !discount.value → return subtotal
    if type === "Percentage" → max(0, subtotal - round(subtotal * value / 100))
    else → max(0, subtotal - value)  // Flat

  calcFinalPrice(plan, cycle, addons, discount):
    → { basePrice, addonTotal, subtotal, finalPrice, discountAmount }
}
```

For Custom plans, the pricing engine is bypassed — `quotedPrice` is entered directly and the implicit discount is `basePrice - quotedPrice`.

---

# Seeded History (4 entries, displayed in Recent Activity and plan/sub detail drawers)

| Entity type | Action | Changed by | Date | Reason |
|-------------|--------|-----------|------|--------|
| Plan (Growth) | Price updated | Saif Khan | 15 Mar 2026 | Annual price revision (₹6,999 → ₹7,999) |
| Subscription (MedLinks) | Addon added | Saif Khan | 10 Mar 2026 | Team expansion (added Users×5) |
| Plan (Legacy) | Status changed | Saif Khan | 01 Jun 2025 | Sunset legacy pricing (Active → Inactive) |
| Subscription (Varun Group) | Discount applied | Saif Khan | 15 Feb 2026 | Strategic partnership (discount ₹0 → ₹50,000) |

---

## Permissions
No access control. All super admin users can create plans, set pricing, assign subscriptions, and apply discounts.

## Automations
- `store.createPlan` and `store.updatePlan` each call `addHistory()` which adds a record to `store.history`.
- `store.createSubscription` and `store.updateSubscription` each call `addHistory()`.
- `store.archivePlan` and `store.deletePlan` each call `addHistory()`.
- All of these are in-memory — no backend events are emitted.

## Decisions
None recorded.

## Open questions
- Renewal dates in the wizard are hardcoded strings ("13 Jun 2026", "13 May 2027") — should they be computed from the actual submission date?
- Trial end is hardcoded to "27 May 2026" (14 days from hardcoded NOW "13 May 2026") — same issue.
- "Revenue" tab renders the same `<SubsOverview />` as the "Overview" tab — is this intentional or a placeholder?
- Delete is only available when `clientCount === 0` — should Inactive/Archived plans also be deletable?
- The MedLinks subscription `finalPrice` (₹16,000) is less than its `basePrice` (₹16,250) due to a flat ₹2,500 discount, but the discount field in `SEED_SUBSCRIPTIONS` shows `value: 2500`. The table column shows "—" for Discount on this row. [Unverified: the table renders `fmtINR(s.discount.value)` but with `{ type: "Flat", value: 2500 }` this should show "₹2,500", not "—". Need to verify the conditional logic.]
- GST/taxes noted as "future-ready" placeholder — what tax calculation is planned?
- Should discount reasons be required for all discounts, or only above a threshold?
- `store.duplicatePlan` sets `planType = "Custom"` regardless of source plan type — is this intentional?
