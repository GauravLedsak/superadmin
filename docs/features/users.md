# CRM Users — [Mock]
Route: `users` · Source: `superadmin/src/pages/UsersPage.jsx` → `UsersPage()`

## Purpose
A cross-tenant directory of all CRM users across the platform. Super admins use it to find users, impersonate them for support, manage access (suspend/reactivate), reset passwords, and resend invites. It is NOT the same as the Users tab inside Tenant 360 — this page shows users from all tenants in one list.

## Flow

### Primary path
1. Page loads showing all 6 seeded users with no filters active.
2. Admin types in the search box or clicks a role pill to filter.
3. Clicking the impersonate icon (LogIn) on a row starts impersonation immediately — no confirmation.
4. Row menu provides additional actions.
5. "Export" and "Invite User" buttons in the header have no `onClick` — they do nothing.

### Edge cases
- If no users match search + role filter, empty row renders: "No users match" (colspan 6).

## Page Header KPIs (4 cards)

All hardcoded except Suspended and Pending, which are computed from the store:

| Label | Formula | Live? |
|-------|---------|-------|
| Total Users | `"2,148"` | [Mock] hardcoded |
| Active (7d) | `"1,642"`, sub "76% engagement" | [Mock] hardcoded |
| Suspended | `String(store.users.filter(u => u.status === "Suspended").length)` | Live from store |
| Pending Invites | `String(store.users.filter(u => u.status === "Invited").length)` | Live from store |

Trend: Active (7d) → `trend="pos"`, Suspended → `trend="warn"`.

## Filter Controls

Filters are ANDed:
```
rows = users WHERE
  (name includes query OR tenant includes query)
  AND (role === roleFilter OR roleFilter === "All")
```

| Control | Type | Options | Default | Match logic |
|---------|------|---------|---------|-------------|
| Search | Text input (max 300px) | — | "" | Case-insensitive includes on `u.name` OR `u.tenant` |
| Role | Filter pills | "All" + unique roles from store | "All" | Exact match on `u.role` |

Role pills are derived dynamically: `["All", ...Array.from(new Set(store.users.map(u => u.role)))]`. With seeded data: All, Team Lead, Telecaller, Brand CEO, Admin (CMO).

There is no status filter on this page (unlike the Tenant 360 Users tab).

## Table Columns

| Column | Source | Render detail |
|--------|--------|---------------|
| User | `u.name` + `u.email` | NameCell: avatar (purple if role includes "CEO", brand blue otherwise) + name + email subtitle |
| Tenant | `u.tenant` | Bold text |
| Role | `u.role` | Badge: brand (blue) if `includes("CMO") || includes("CEO")`, gray otherwise |
| Status | `u.status` | statusBadge: Active→green, Suspended→red, Invited→orange |
| Last active | `u.last` | Small muted text |
| (actions) | — | Impersonate icon button + Menu (⋯) |

## Row Actions

**Impersonate icon button** (LogIn icon, blue, always visible):
- `store.impersonate(u)` — passes the full user object (not just the name)
- Banner shows `u.name` (from `store.impersonating.name || store.impersonating`)
- No confirmation dialog

**Menu (⋯) items**:
| Action | Condition | Code | Effect |
|--------|-----------|------|--------|
| Reset password | Always | `store.resetPassword(u.name)` | Toast: "Password reset link sent to {name}" |
| Resend invite | `u.status === "Invited"` | `store.resendInvite(u.id)` | Toast: "Invite re-sent" |
| ─ (divider) | Always | — | — |
| Suspend | `u.status !== "Suspended"` | `store.setUserStatus(u.id, "Suspended")` | Updates status in store, toast "User suspended" |
| Reactivate | `u.status === "Suspended"` | `store.setUserStatus(u.id, "Active")` | Updates status in store, toast "User reactivated" |

Note: `null` items are filtered out of the menu array, so if `u.status !== "Invited"`, the "Resend invite" item does not appear and the menu has 3 items (no divider gap).

## Seeded Users (6 total)

| Name | Email | Tenant | Role | Status | Last active |
|------|-------|--------|------|--------|------------|
| Rahul Mehta | rahul@medlinks.in | MedLinks | Team Lead | Active | 2 min ago |
| Priya Sharma | priya@dermapuritys.com | Derma Purtitys | Telecaller | Active | 18 min ago |
| Arjun Nair | arjun@varungroup.in | Varun Group | Brand CEO | Active | 1 hr ago |
| Sneha Kapoor | sneha@rezoni.com | Rezoni | Admin (CMO) | Suspended | 5 days ago |
| Vikram Singh | vikram@urbanauto.in | Urban Autohub | Telecaller | Active | 40 min ago |
| Anita Desai | anita@aryaanya.com | Aryaanya Group | Team Lead | Invited | — |

## Rules
- `setUserStatus` updates `u.status` in `store.users` — the change reflects everywhere that reads `store.users` (Tenant 360 Users tab, the Suspended/Invited KPI cards).
- Suspend and Reactivate are mutually exclusive based on current status.
- "Resend invite" fires a toast only — `store.resendInvite` has no payload/logic beyond `notify("Invite re-sent")`.
- "Reset password" fires a toast only — no email/link is actually sent.

## Permissions
No access control. All super admin users can impersonate, suspend, and reset passwords for any user across all tenants.

## Automations
None triggered from this page.

## Decisions
None recorded.

## Open questions
- "Export" and "Invite User" buttons have no handlers — what should they do?
- Total Users KPI shows "2,148" (hardcoded) but only 6 users are seeded — is 2,148 the intended production figure?
- There is no confirmation before impersonating — should there be?
- `resendInvite` receives `u.id` but ignores it; the toast is identical for all invited users. Is there an email flow planned?
- "Admin (CMO)" is a role in `SEED_USERS` but doesn't appear in the Security & Access roles table — is it a tenant-side admin role distinct from the platform-level "Super Admin (CMO)"?
