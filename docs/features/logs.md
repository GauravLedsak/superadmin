# Logs & Audit — [Mock]
Route: `logs` · Source: `superadmin/src/pages/LogsPage.jsx` + `superadmin/src/data/logs.js`

## Purpose
Unified console for seven distinct log types — System, API, Webhook, Integration, Security, Error, and Admin Audit — each with its own columns, filters, and detail drawer, sharing one page shell and a common filter-bar/drawer/export pattern. Used for engineering triage (System/API/Error), integration debugging (Webhook/Integration), security monitoring (Security), and compliance (Admin Audit). Replaces the previous single hardcoded "Recent Activity" table.

## Flow

### Primary path
1. Page loads on the **System** tab (or the first tab the current "Viewing as" role can see).
2. A role switcher ("Viewing as") in the page header simulates RBAC — switching roles changes which of the 7 tabs are visible (`LOG_ROLE_ACCESS` in `data/logs.js`) and jumps off any tab the new role can't see. This is a **page-local dev/demo switcher**, not real auth — see Open questions.
3. Each tab has its own filter bar (search, date-range with presets, severity/status multi-selects, type-specific dropdowns) and its own paginated table, column-sortable by clicking a header.
4. Clicking a row opens a shared detail Drawer whose content switches on log type: common fields + type-specific fields + raw payload/stack trace/payload body (masked where sensitive) + a "Related Entries" section that looks up other log types sharing the same `correlationId`.
5. Export (CSV or JSON) is scoped to whatever the filter bar currently shows; filename encodes the log type and date-range preset. Real file download via `Blob` + `<a download>`, not a toast-only stub.

### Type-specific actions
- **Webhook**: `Failed` rows get a first-class **Resend** button (row + drawer). Resend deterministically marks the delivery `Delivered`, bumps `attemptCount`, and appends an entry to the retry timeline.
- **Integration**: `Failed` rows get a first-class **Re-sync** button. Re-sync appends a *new* log entry recording a successful re-run (the original failure stays in history); a per-integration health-card row above the table (Connected/Degraded/Down) is derived live from the log rows.
- **Error**: rows are pre-grouped (one row per fingerprint, `occurrenceCount` + first/last seen), expandable to a few sample instances. **Mark Acknowledged** / **Mark Resolved** buttons drive `resolutionStatus: New → Acknowledged → Resolved`; `Resolved` rows render at reduced opacity, `New`+`Critical` rows show a pulsing dot, `occurrenceCount > 10` shows a "recurring" badge.
- **Security**: append-only. The only action is **Flag** — adds a note to a separate annotations list keyed by log id; the underlying event row is never mutated. High-risk rows (Blocked outcome, Critical level, `mfa.disabled`) get a highlighted row background.
- **Admin Audit**: append-only. The only action is **Annotate** (same append-only pattern as Security). Rows with a `beforeValues`/`afterValues` diff show a Before/After table in the drawer. Actions in `SENSITIVE_ADMIN_ACTIONS` (`user.deleted`, `user.role_changed`, `data.exported`, `tenant.deleted`) get a "Sensitive" badge. **Exporting the Admin Audit tab appends a new `data.exported` entry to the log itself** (meta-audit), satisfying "exporting Admin Audit is itself audit-logged."

## Rules
- **Common fields** on every entry: `id`, `timestamp` (ISO 8601 UTC), `level` (Debug/Info/Warning/Error/Critical), `source`, `tenantId`, `message`, `rawPayload`. Sensitive-field masking (`password`, `token`, `secret`, `authorization`, `card_number`, `cvv`, `ssn`, `*_secret`, `*_token`) is applied via `maskSensitive()` before display in API/Webhook payload bodies.
- **Correlation**: a shared `correlationId` links System → API → Error chains (e.g. a failing CarWale lead-import: `api-1` → `sys-5` → `err-1`/`err-7` all share `req-77f2a1`), and Admin Audit entries can share a correlation ID with the Security/System entry they triggered. The detail drawer's "Related Entries" section is a live cross-array lookup, not a stored join.
- **Immutability**: Security and Admin Audit log arrays are never mutated by any UI action — no edit or delete affordance exists for either tab, even under the "Super Admin" role. Only two append-only side-tables exist: per-entry annotations (`securityAnnotations`, `auditAnnotations`) and the audit meta-entries created by exporting. This is enforced by omitting any update path in `data/logs.js`, not by a runtime permission check — see Open questions.
- **Retention** is display-only (`RETENTION_POLICY` in `data/logs.js`, shown as a note on the Admin Audit tab): System 30d/6mo, API 30d/3mo, Webhook 60d/6mo, Integration 60d/6mo, Security 90d/2yr (manual purge only), Error 60d/1yr, Admin Audit 1yr/7yr (never auto-purged). Nothing is actually purged — there's no backend.
- **Pagination** is client-side (existing `usePagination`/`Pagination` components, 10/20/50/100 page sizes) — the spec's "server-side cursor-based pagination" isn't implementable without a backend; see Open questions.
- **Data layer**: all 7 log types are backed by seed data in `data/logs.js` (8–12 entries each). Mutable state (Error resolution, Webhook delivery/retries, Integration re-sync runs, Security/Audit annotations, audit meta-entries) persists to `localStorage` and is owned by `LogsPage`, not the global `StoreContext` — same pattern as `LeadsPage`/`AutomationPage`'s self-contained modules. System, API, Security, and the base Admin Audit rows are static (no localStorage — consistent with them being append-only/immutable).

## Permissions
Simulated via a "Viewing as" role switcher in the page header (`LOG_ROLE_ACCESS` in `data/logs.js`) — **not wired to any real auth/session**, since this app has no login system:

| Role | System | API | Webhook | Integration | Security | Error | Admin Audit |
|---|---|---|---|---|---|---|---|
| Super Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ops / Engineering | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| CSM / Support | — | — | ✓ | ✓ | — | — | — |
| Security / Audit | — | — | — | — | ✓ | — | ✓ |

Switching roles hides disallowed tabs entirely (not just disables actions) and reroutes off a now-hidden active tab.

## Automations
None triggered from this page. The Alerting section of the original spec (error-rate spikes, repeated failed logins, webhook failure thresholds, sensitive admin actions, integration-down) is explicitly **not implemented** — the data model (`level`, `outcome`, `resolutionStatus`, `SENSITIVE_ADMIN_ACTIONS`) is shaped so alert rules could read it later, but no rule engine, schedule, or delivery channel exists.

## Decisions
- 2026-07-23 · Built as a self-contained page module (`data/logs.js` + `LogsPage.jsx`) rather than adding 7 log arrays to the global `StoreContext` · Rejected: extending `StoreContext`. Reason: high-volume, page-scoped log data with no cross-feature consumers doesn't belong in the app's one shared context (CLAUDE.md explicitly discourages growing it further); mirrors the existing `LeadsPage`/`data/leads.js` precedent.
- 2026-07-23 · Client-side pagination (existing `usePagination`) instead of the spec's cursor-based server pagination · Rejected: implementing a fake cursor protocol over static arrays. Reason: there is no backend in this prototype; a simulated cursor API would add complexity without adding real capability.
- 2026-07-23 · Immutability enforced by omitting mutation functions for Security/Admin Audit data, rather than a runtime permission check · Rejected: a `canEdit(role)` guard in the UI. Reason: a UI-only guard is weaker than "no code path exists to mutate this array" — the stronger guarantee holds even if a future role gets added with broader access.
- 2026-07-23 · RBAC simulated via a page-local "Viewing as" role switcher · Rejected: leaving RBAC unimplemented, or wiring to `store.impersonate`. Reason: the spec requires demonstrable per-type role gating; `store.impersonate` simulates viewing as a *tenant user*, a different concept from an internal admin's log-access role.

## Open questions
- There is no real authentication/session/role system anywhere in this app (confirmed: no `fetch`/`axios`, no login). The "Viewing as" switcher is a page-local simulation — should real RBAC be wired once auth exists, and would that reuse this same role list?
- Server-side cursor pagination, real-time streaming, and the alert-rules engine are explicitly out of scope per the original spec ("architecture-ready, implementation optional") — confirm these stay deferred rather than becoming expected follow-up work.
- Webhook Resend and Integration Re-sync are deterministic (always succeed) rather than randomly failing again — intentional for a predictable demo, but flag if a "still fails" path should be modeled too.
- Correlation IDs are hand-authored in the seed data to demonstrate cross-log tracing on a few incidents (CarWale outage, brute-force block, payment timeout) rather than universally present — most rows correctly have `correlationId: null`.
