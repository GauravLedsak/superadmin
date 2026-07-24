# Customer Success — [Implemented]
Route: `cs` · Source: `superadmin/src/pages/CustomerSuccessPage.jsx` → `CsPage()`

## Purpose
Four-tab console for managing at-risk accounts, intervention playbooks, cross-tenant task execution, and upcoming renewals. Account managers use it to identify which clients need action, assign structured playbooks, execute tasks, and track renewal pipeline.

## State persistence
- Playbooks (`spPlaybooks`): store state, seeded from `SEED_PLAYBOOKS` (in-memory only, resets on refresh)
- Tenant tasks (`tenantTasks`): store state, seeded from `SEED_TENANT_TASKS` (in-memory only)
- Contact logs (`contactLogs`): store state, seeded from `SEED_CONTACT_LOGS`
- Renewal status dropdowns: local component state (`useState({})` in `CsRenewalsTab`) — not persisted to store, resets on navigation

## Flow

### Primary path
1. Page loads on **At-Risk Accounts** tab.
2. Admin uses tabs to navigate between At-Risk Accounts, Playbook Library, Tenant Tasks, and Renewals.
3. Clicking a tenant name anywhere on this page calls `openTenant(c)`, opening the Tenant 360 overlay drawer (owned by `Layout`, floats above the page — does not navigate away).

---

## Tabs
`["At-Risk Accounts", "Playbook Library", "Tenant Tasks", "Renewals"]` — state held in `useState("At-Risk Accounts")`

---

## Tab: At-Risk Accounts (`CsAtRiskTab`)

### KPI tiles (4)

| Label | Value | Live? |
|-------|-------|-------|
| Avg Health | `"82"`, sub `"+3 pts"`, trend pos | [Mock] hardcoded |
| At Risk | `atRisk.length`, sub `"health < 75"`, trend warn | Live |
| Renewals (30d) | `"3"`, sub `fmtINR(19167) + " MRR"` | [Mock] hardcoded |
| NPS | `"+48"`, sub `"52 responses"`, trend pos | [Mock] hardcoded |

### At-risk filter logic
```js
atRisk = [...store.clients]
  .filter(c => c.churnRisk !== "Low")
  .sort((a, b) => a.health - b.health)  // ascending: worst health first
```
With seeded data, 4 clients qualify: Rezoni (health 30, High), Mahakumbh Motors (44, High), Dermalife (52, Medium), Varun Group (53, Medium).

### Table columns

| Column | Content |
|--------|---------|
| Client | `NameCell`: name (blue, clickable → `openTenant`) + industry subtitle. High-risk rows with **no tasks** get a 3px red left border on this cell as a visual flag. |
| Health | `Progress` bar — red if < 50, orange if < 75, green if ≥ 75 |
| Risk | Badge: High → red, Medium → orange, Low → green |
| Playbook | If tasks exist: playbook name + badge `"{done}/{total} done"` (color: info if 0, warning if partial, success if all done). If no tasks: "No playbook" gray badge. |
| MRR | `fmtINR(c.mrr)` bold, or "—" if falsy |
| Owner | `c.am`, small muted text |
| Renewal | `c.planEnd`, small monospace muted text |
| (actions) | "Assign Playbook" button + "Log Contact" button |

Pagination: 10 per page. Empty state: "No at-risk accounts".

### AssignPlaybookModal
Triggered by "Assign Playbook" → opens modal for that tenant.

- Dropdown list of Active playbooks (radio-style buttons, one per playbook).
- **Conflict guard**: if tenant has ≥ 1 Open or In Progress task, shows an amber warning banner: *"This tenant already has N open task(s) from '{playbookName}'. Replace clears them; Add alongside keeps them."*
  - No conflict: single "Assign" button → `store.assignPlaybookToTenant(tenantId, playbookId)`.
  - Conflict: shows "Add alongside" (same call) and "Replace" (danger) → `store.replaceTenantPlaybook(tenantId, playbookId)`.
- Done/Skipped tasks are not counted as "open" — only Open or In Progress blocks the conflict.
- Empty state: "No active playbooks. Create one in the Playbook Library tab."

### LogContactModal
Triggered by "Log Contact" → opens modal for that tenant.

Fields:
- **Type** (select): Call / Email / Other
- **Outcome** (select): Positive / Neutral / Negative
- **Notes** (textarea, required — "Save" disabled if empty)

On save: `store.logContact(tenantId, { type, outcome, notes })` — appends to `contactLogs`. Fires toast "Contact logged".

---

## Tab: Playbook Library (`CsPlaybookLibraryTab`)

Manages the pool of reusable intervention playbooks. Changes here affect the choices available in `AssignPlaybookModal`.

### Filter + header
Status filter pills: All / Active / Inactive. "Create Playbook" primary button (top-right) opens a create drawer.

### Table columns

| Column | Content |
|--------|---------|
| Name | Playbook name, medium weight |
| Target Tier | Badge: High → red, Medium → orange, Both → gray |
| Industry | Muted text |
| Steps | Count of steps |
| Status | `statusBadge(p.status)` |
| Tenants Using | Count of unique tenants with any task from this playbook (live from `tenantTasks`) |
| (menu) | Edit, Duplicate, Toggle status (Activate/Deactivate) |

### Playbook actions
- **Edit** → opens `PlaybookForm` in a right drawer (640px wide), mode `"edit"`. Calls `store.updatePlaybook(id, updates)`.
- **Duplicate** → `store.duplicatePlaybook(id)` — copies with "(copy)" suffix.
- **Toggle status** → `store.togglePlaybookStatus(id)` — toggles Active ↔ Inactive.

### PlaybookForm (Create / Edit)
Fields:
- **Name** (required text)
- **Description** (textarea, optional)
- **Target Risk Tier** (select): `PLAYBOOK_RISK_TIERS` = `["High", "Medium", "Both"]`
- **Industry** (select): `PLAYBOOK_INDUSTRIES` = `["All", "Automotive", "Clinic", "Education", "Ecommerce", "Other"]`
- **Status** (select): Active / Inactive
- **Steps** (repeatable, min 1 required):
  - Each step: title (required), type (select from `STEP_TYPES`), SLA days (number ≥ 1)
  - `STEP_TYPES` = `["Call", "Email", "Demo", "Internal Escalation", "Other"]`
  - Reorder with ↑/↓ buttons; remove with trash icon (disabled at 1 step)
  - "Add Step" button appends a blank step
  - SLA shown as "SLA: N day(s) after assignment"

Validation runs on submit — inline errors on empty name or empty step titles. "Create Playbook" / "Save Changes" button.

### Seed playbooks (3)

| ID | Name | Risk Tier | Industry | Steps | Status |
|----|------|-----------|----------|-------|--------|
| pb-1 | High Risk — Immediate Intervention | High | All | 5 | Active |
| pb-2 | Medium Risk — Nurture Sequence | Medium | All | 3 | Active |
| pb-3 | Automotive Churn Recovery | High | Automotive | 5 | Active |

---

## Tab: Tenant Tasks (`CsTenantTasksTab`)

Cross-tenant view of all tasks generated from assigned playbooks.

### KPI tiles (4)

| Label | Value | Live? |
|-------|-------|-------|
| Open Tasks | Count of tasks with status Open or In Progress | Live |
| Overdue | Count where `isTaskOverdue(t)` is true (Open/In Progress past due date) | Live |
| Done This Week | Count of Done tasks completed in last 7 days | Live |
| Completion Rate | `round(doneTasks / totalTasks * 100)%` | Live |

### Filters
- **Search**: tenant name, case-insensitive substring
- **Status pills**: All / Open / In Progress / Done / Skipped (from `TASK_STATUSES`)
- **AM dropdown**: All + unique `c.am` values from `store.clients`

### Table columns

| Column | Content |
|--------|---------|
| Tenant | Blue clickable name → `openTenant(client)`. Overdue rows have `T.dangerSoft` background. |
| Task | Task title, medium weight |
| Type | Icon + type label (from `STEP_TYPE_ICON[t.type]`) |
| Playbook | Playbook name, muted text |
| Assigned To | AM name, muted text |
| Due Date | Monospace. If overdue: red color + `" (overdue)"` appended |
| Status | `taskStatusBadge(t.status)` |
| (menu) | `TaskActionsMenu` |

Pagination: 10 per page. Empty state: "No tasks match".

### TaskActionsMenu (exported — also used in Tenant360 Tasks tab)
Available actions depend on current status:
- **Mark Done** (not shown if already Done) → opens `TaskDoneModal`
- **Mark In Progress** (not shown if In Progress or Done) → `store.updateTaskStatus(id, "In Progress")` immediately
- **Skip** (not shown if Skipped or Done) → opens `TaskSkipModal` — danger color
- **Add Note** → opens `TaskNoteModal`

### Modals

**TaskDoneModal**: Pre-fills `task.notes`. Optional notes textarea. On save: updates notes if changed (`store.updateTaskNotes`), then `store.updateTaskStatus(id, "Done")`.

**TaskSkipModal**: Skip reason textarea (required — validated on save, error shown inline). `store.updateTaskStatus(id, "Skipped", note)` — returns false if reason is empty, error stays visible.

**TaskNoteModal**: Free-text notes textarea. `store.updateTaskNotes(id, notes)`. No required validation.

### Seed tasks (14 tasks across 4 tenants)

| Tenant | Playbook | Tasks | State |
|--------|----------|-------|-------|
| Rezoni | High Risk — Immediate Intervention | 5 | 2 Done, 1 In Progress (demo), 2 Open |
| Varun Group | Automotive Churn Recovery | 5 | 1 Done, 1 In Progress (audit), 3 Open |
| Dermalife | Medium Risk — Nurture Sequence | 3 | All Open (all overdue — due 05–10 May 2026) |
| Mahakumbh Motors | High Risk — Immediate Intervention | 1 | Open, due 13 May 2026 |

Mahakumbh Motors only has step 1 assigned — a partial playbook assignment. All tasks are assigned to "Saif Sir".

---

## Tab: Renewals (`CsRenewalsTab`)

Tracks upcoming and overdue subscription renewals across all tenants.

### Renewal window
- **Upcoming**: `daysLeft >= 0 && daysLeft <= 60`, sorted ascending
- **Overdue**: `daysLeft < 0`, sorted ascending (most overdue first)
- `daysLeft` = `daysUntil(c.planEnd)` from `lib/format.js`

### KPI tiles (4)

| Label | Value |
|-------|-------|
| Due in 30d | Count + sum MRR of tenants with `daysLeft ≤ 30`, trend warn |
| Due in 31–60d | Count + sum MRR of tenants with `30 < daysLeft ≤ 60` |
| Overdue | Count of tenants with `daysLeft < 0`, trend neg if > 0 |
| Confirmed | Count of upcoming renewals where `renewalStatus === "Confirmed"`, trend pos |

### Overdue Renewals card
Appears only when `overdueRows.length > 0`. Max height 240px (scrollable).

Columns: Tenant, Industry, MRR, Plan End, Days Overdue (red bold `"{N}d overdue"`), AM, Renewal Status dropdown. Rows have `T.dangerSoft` background.

### Upcoming Renewals table
Columns: Tenant, Industry, MRR, Plan End, Days Left (colored: < 15d → red, ≤ 30d → orange, > 30d → green), AM, Renewal Status dropdown. Paginated (10 per page).

### Renewal Status dropdown
`RENEWAL_STATUSES` = `["Not Started", "In Negotiation", "Confirmed", "At Risk"]`.

- Per-tenant, local component state (`statusMap` in `CsRenewalsTab`) — **not persisted to store**.
- Default for each tenant: "Not Started".
- On change: `store.notify("Renewal status updated")` — toast only, no mutation.
- Resets on navigation away from this tab.

---

## Store methods referenced

| Method | What it does |
|--------|-------------|
| `store.assignPlaybookToTenant(tenantId, playbookId)` | Appends playbook steps as tasks to `tenantTasks` |
| `store.replaceTenantPlaybook(tenantId, playbookId)` | Clears Open/In Progress tasks for tenant, then appends new playbook's steps |
| `store.logContact(tenantId, { type, outcome, notes })` | Appends to `contactLogs` |
| `store.createPlaybook(pb)` | Adds new playbook to `spPlaybooks` |
| `store.updatePlaybook(id, updates)` | Updates playbook fields |
| `store.duplicatePlaybook(id)` | Creates copy with `"(copy)"` suffix |
| `store.togglePlaybookStatus(id)` | Toggles Active ↔ Inactive |
| `store.updateTaskStatus(id, status, note?)` | Updates task status; for Skipped, note is required (returns false if empty) |
| `store.updateTaskNotes(id, notes)` | Updates task notes field |

---

## Cross-file imports
`Tenant360` (in `ClientsPage.jsx`) imports `TaskActionsMenu`, `TaskDoneModal`, `TaskSkipModal`, `TaskNoteModal` from this file to render tasks in the Tenant360 "Tasks" tab. Import is one-directional: `CustomerSuccessPage` must never import from `ClientsPage`.

---

## Rules
- At-risk filter uses `churnRisk !== "Low"` — does not compute churn risk from the health score value; it reads the `churnRisk` field set on each client record.
- "Assign Playbook" conflict guard only considers Open and In Progress tasks — Done/Skipped tasks are history, not a blocker.
- Renewal status is local state — it does not mutate the store and resets on navigation.
- `TaskActionsMenu` is the shared task-action component; keep it consistent between this tab and Tenant360's Tasks tab.

## Permissions
No access control. All super admin users can assign playbooks, log contacts, manage playbooks, and update task status.

## Decisions
- **Renewal status not persisted**: the Renewals tab is a planning scratchpad for a session, not a CRM record. Persisting renewal status would need a dedicated model/field on clients. Rejected: updating `store.clients` with a `renewalStatus` field for now.
- **Conflict guard adds alongside vs. replaces**: clearing a tenant's existing tasks on re-assign is irreversible; both paths are preserved so the admin chooses. Rejected: always appending (would let tasks accumulate silently).
- **TaskActionsMenu exported**: Tenant360 needs the same task actions without duplicating the logic. Cross-file import is acceptable here because it is one-directional (CustomerSuccess → no back-import from Clients).

## Open questions
- KPIs "Avg Health", "Renewals (30d)", and "NPS" are hardcoded — should they be derived from store data?
- Renewal status resets on navigation — should it persist to `localStorage` (like leads/automations) or to a `renewalStatuses` map in the store?
- `logContact` fires a toast but the doc for CS page previously said "Outreach logged" — the actual call is now structured (type + outcome + notes) and stored in `contactLogs`. Is the contact log surface exposed anywhere?
- `SEED_TENANT_TASKS` has all tasks assigned to "Saif Sir" — is task assignment meant to respect the tenant's AM field?
- No empty-state for Renewals tab when no renewals are due within 60 days — is this expected?
