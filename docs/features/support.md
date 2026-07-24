# Support & Tickets — [Mock]
Route: `support` · Source: `superadmin/src/pages/SupportPage.jsx` → `SupportPage()`

## Purpose
Tracks tenant support requests assigned to LEDSAK account managers. Super admins can change ticket status (Open → Pending → Resolved) and filter by status. Used for basic SLA visibility.

## Flow

### Primary path
1. Page loads on "All" filter, showing all 5 tickets.
2. Admin clicks a status filter pill → list narrows to matching status.
3. Admin clicks the ⋯ menu on a row → selects a new status.
4. Status updates in store; toast fires "Ticket marked {status}".
5. "New Ticket" button has no `onClick` — does nothing.

### Edge cases
- If no tickets match the active filter, empty row renders: "No tickets" (colspan 7).

## Page Header KPIs (4 cards)

| Label | Formula | Live? |
|-------|---------|-------|
| Open Tickets | `String(store.tickets.filter(t => t.status === "Open").length)` | Live from store |
| Avg First Response | `"1.8h"`, sub "SLA 4h" | [Mock] hardcoded |
| Resolved (7d) | `"34"`, sub "94% in SLA" | [Mock] hardcoded |
| CSAT | `"4.6/5"`, sub "118 ratings" | [Mock] hardcoded |

Trend: Open Tickets → `trend="warn"`, Resolved (7d) → `trend="pos"`, CSAT → `trend="pos"`.

## Filter Controls

Single filter row: Status pills — **All**, **Open**, **Pending**, **Resolved**

```js
rows = store.tickets.filter(t => filter === "All" || t.status === filter)
```

No search input on this page.

## Table Columns

| Column | Source | Render detail |
|--------|--------|---------------|
| Ticket | `t.id` | Monospace small font (e.g. "TKT-812") |
| Subject | `t.subj` | Bold text |
| Tenant | `t.tenant` | Small muted text |
| Priority | `t.pri` | Badge: High→red, Medium→orange, Low→gray |
| Owner | `t.owner` | Small muted text (account manager name) |
| Status | `t.status` | statusBadge: Open→red, Pending→orange, Resolved→green |
| (actions) | — | Menu (⋯) |

## Row Actions (Menu)

All three actions are always present regardless of current status:

| Action | Code | Effect |
|--------|------|--------|
| Mark resolved | `store.setTicketStatus(t.id, "Resolved")` | Updates `t.status` in store, toast "Ticket marked resolved" |
| Mark pending | `store.setTicketStatus(t.id, "Pending")` | Updates `t.status` in store, toast "Ticket marked pending" |
| Reopen | `store.setTicketStatus(t.id, "Open")` | Updates `t.status` in store, toast "Ticket marked open" |

Icons: CheckCircle2 (mark resolved), Clock (mark pending), RefreshCw (reopen).

`store.setTicketStatus` — real store mutation, updates the ticket in `store.tickets`.

## Seeded Tickets (5 total)

| ID | Subject | Tenant | Priority | Status | Age | Owner |
|----|---------|--------|----------|--------|-----|-------|
| TKT-812 | Lead sync stopped from CarWale | Varun Group | High | Open | 2h | Saif Sir |
| TKT-811 | Cannot add telecaller seats | MedLinks | Medium | Open | 5h | Luv |
| TKT-809 | Invoice GST number update | Aryaanya Group | Low | Pending | 1d | Vishal |
| TKT-806 | WhatsApp template rejected | Derma Purtitys | Medium | Open | 1d | Luv |
| TKT-802 | Export missing columns | Inside Edge Learning | Low | Resolved | 3d | Vishal |

Initial open count: 3. The sidebar badge shows "6" [Unverified — mismatch with 3 open seeded tickets; may be intended to represent real queue count].

## Rules
- Tickets can transition to any status from any status (no enforced state machine).
- `age` field is a display string (e.g. "2h", "1d") — not a computed duration.
- Priority tones: `{ High: "danger", Medium: "warning", Low: "gray" }` (separate from STATUS_TONE).

## Permissions
No access control. All super admin users can change any ticket status.

## Automations
None triggered from this page.

## Decisions
None recorded.

## Open questions
- "New Ticket" button has no handler — should it open a creation form?
- The sidebar badge shows "6" but only 3 tickets are Open in seed data — what count does "6" represent?
- Ticket detail view (clicking subject or ID) is not implemented — should it open a drawer?
- `age` is a static string; no actual timestamp field exists on tickets. Will real tickets have a `createdAt` timestamp?
- No assignment/reassignment action — should owners be changeable from here?
