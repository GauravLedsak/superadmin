# System Health — [Implemented]
Route: `health` · Source: `superadmin/src/pages/HealthPage.jsx` → `HealthPage()`, `superadmin/src/data/health.js`

## Purpose
The aggregated ops dashboard for the LEDSAK platform — a single-glance view of service status, API/DB performance, incidents, deployments, and external-provider health. Rolls up signal that individually lives in Queue Monitor (job-level detail), Logs & Audit (raw log rows), and Integrations (tenant-facing provider config) without duplicating any of their content — this page links out to them instead.

State (services, incidents, deployments, dependencies) is local `useState` in `HealthPage`, seeded from `data/health.js`, following the same pattern as Queue Monitor — it resets to seed data on refresh. Only incident/deployment admin actions (create, resolve, escalate, change owner, rollback) are audit-logged via `addHistory` + `notify`, through four thin store wrapper methods.

`FIXED_HEIGHT_PAGES` includes `health` — the Status Board tab's table fills and scrolls internally; the other four tabs scroll their own stacked-card region, matching the pattern established for Security & Access.

## Flow

### Primary path
1. Page loads with the Overall Status Banner, 4 live KPI cards, and 5 tabs (Status Board, Performance, Incidents, Deployments, Dependencies) — all visible/computed regardless of active tab.
2. Status Board: admin filters/searches 20 services grouped into 8 categories, clicks a row or "Details" to open the Service Detail Drawer (uptime history, dependencies/dependents, related incidents, Check Now / View Logs).
3. Incidents: any incident with status Active/Investigating shows as a banner with View Timeline / Add Note / Mark Resolved. "Create Incident" (page header) opens a form modal; the Incident Detail Drawer supports adding notes, escalating severity, changing owner, and resolving — each is audit-logged.
4. Deployments: read-only history table; a deployment's detail drawer shows a before/after Post-Deploy Health comparison, a Linked Incident cross-link (jumps to the Incidents tab), and a Rollback action (Success deploys only).
5. Dependencies: card grid of 10 external providers with live latency-vs-baseline comparison, a real `<a target="_blank">` to each provider's status page, and a "Check Now" action.
6. "Refresh All" (page header) resets every service's Last Checked to "Just now" and the banner's "Last check" timestamp.

### Cross-page links (via `go` prop, passed from `Layout.jsx`)
- Service Detail Drawer → "View Logs →" → `go("logs")`
- Performance tab → "Queue Monitor →" → `go("queues")`

## Overall Status Banner
Always visible above the tabs. Computed live via `computeOverallStatus(services)` — never hardcoded:
- Any service `Down` → "Partial Outage — N service(s) down" (red)
- Else any `Degraded` → "Partial Degradation — N service(s) affected" (amber)
- Else any `Maintenance` → "Maintenance — N service(s) in maintenance" (blue)
- Else → "All Systems Operational" (green)

"Last check" reflects a local `refreshedAgo` counter (starts at 2 min, reset to 0 by "Refresh All") — a proxy for "the whole board was last confirmed," independent of any single service's own Last Checked value.

## KPI Cards (4, always visible, all live)
| Label | Formula |
|-------|---------|
| Overall Uptime (30d) | `computeAvgUptime(services)` — mean of all 20 `uptime30d` values |
| Avg API Latency | `API_PERFORMANCE.avgResponseTime`, sub shows P95 |
| Error Rate (24h) | `API_PERFORMANCE.errorRate` |
| Active Incidents | `countActiveIncidents(incidents)` (Active + Investigating), sub shows `countResolvedThisWeek` |

## Tab 1 — Status Board
20 services across 8 categories (Core, AI/ML, Messaging, Database, Jobs, Payments, Providers, Storage), rendered as category-header rows inside one table (fills/scrolls internally). Filters: Category dropdown, Status pills, name search.

Columns: Service (icon + name + description), Category (badge), Status (dot + badge), Uptime 30d (red <99%, amber <99.5%), P95 Latency (red >1000ms, amber >500ms, "—" for non-HTTP services), Last Checked (red if >60min stale), Details button. Row background tints for Degraded/Down/Maintenance.

**Service Detail Drawer**: KPI trio (Uptime/P95/Last Checked), 30-day uptime history (30 colored day-blocks — green ok / amber degraded / red down / blue maintenance — first/last day labeled), Dependencies (resolved from `service.dependencies` ids, each with a live status badge), Dependents (reverse lookup — services whose `dependencies` include this one), Recent Incidents (filtered from `incidents` by `affectedServices`, clickable — jumps to the Incidents tab and opens that incident), "Check Now" (resets that service's Last Checked, toast), "View Logs →" (`go("logs")`).

## Tab 2 — Performance
- **API Performance** (6 KPI tiles): Requests/Avg Response/P95/P99/Error Rate/Peak Throughput — all from `API_PERFORMANCE` (static snapshot, not live-computed from Logs).
- **Slowest Endpoints**: 7 seeded endpoints, sorted by avg latency desc, method badges (`METHOD_TONE`), red/amber thresholds on latency and error %.
- **Database & Cache**: Primary Connections + Redis Memory as progress bars; Replica Lag/Query P95/Slow Queries/Cache Hit Rate as threshold-toned badges.
- **Background Jobs**: one-line summary (`JOBS_SUMMARY`) + BullMQ status badge + "Queue Monitor →" button (`go("queues")`) — deliberately not a duplicate of Queue Monitor's own job tables.

## Tab 3 — Incidents
- **Active incident banner(s)**: one card per Active/Investigating incident (red/amber respectively), showing title, elapsed time (`fmtDuration`), severity, owner, affected services, and View Timeline / Add Note / Mark Resolved actions. "No active incidents" green card when none.
- **Incident History table**: Status/Severity filter pills + search, columns Timestamp/Title/Services/Severity/Duration ("Ongoing" while open)/Status/Owner. Row click opens the detail drawer.
- **Incident Detail Drawer**: description, Started/Duration/Owner/Created By, affected services (each with live status badge), a flex-based vertical timeline (pulsing red dot on the newest entry while the incident is open), and actions: Add Note (inline textarea → appends a timeline entry), Escalate (severity `<select>`), Change Owner (`<select>` over `HEALTH_ADMINS`), Mark Resolved (sets status/resolvedAt, appends a timeline entry). Escalate/Owner/Resolve controls only render while the incident is Active/Investigating.
- **Create Incident modal**: Title, Description, Severity, Affected Services (checkbox list of all 20 services), Owner. On submit, builds the incident with a first timeline entry ("Incident created"), status always starts `Active`.

Every one of Create / Add Note / Escalate / Change Owner / Resolve appends a local timeline entry **and** calls a store method (`createIncident`, `resolveIncident`, `escalateIncident`, `changeIncidentOwner`) for `addHistory` + `notify`. Add Note only calls `store.notify` (no dedicated `addHistory` entity type was specified for notes; the note itself is preserved as a timeline entry, which is what the audit trail would show either way).

## Tab 4 — Deployments
Read-only history table (8 seeded deployments) — Environment/Status filter pills + search (version, changelog). Columns: Timestamp, Version (mono), Environment (badge), Deployed By, Duration, Status (badge), Services (first 2 + "+N"), Changelog (truncated).

**Detail Drawer**: Deployed By/Timestamp/Duration, affected services, full changelog, a **Post-Deploy Health** before/after table (API Latency P95 / Error Rate / Queue Backlog per deployment, worse-after cells in bold red with a ⚠), an optional **Linked Incident** card (jumps to Incidents tab), and **Rollback** (only enabled for `Success` deployments — sets status to `Rolled Back`, calls `store.rollbackDeploy`).

`dep-1` (v2.14.3) is seeded with `linkedIncidentId: "inc-1"` — deployed 13 minutes before the AI Enrichment incident opened, demonstrating the correlation view even though the incident's actual root cause (OpenAI-side rate limiting, per its timeline) is unrelated to that deploy's changelog. This is intentional: post-deploy correlation is a time-proximity signal for admins to *investigate*, not a causality claim.

## Tab 5 — Dependencies
Card grid (10 seeded external providers) with category filter pills + search. Each card: name/category, status badge (`DEP_STATUS_TONE`), current vs baseline latency with a red "▲ N%" spike indicator when current > baseline × 1.5, Last Checked, an optional note, "Used by" (dependent LEDSAK services), a real `<a target="_blank" rel="noopener">` Status Page link, and "Check Now" (resets Last Checked, toast). Down/Slow statuses get a colored left-accent border.

## Rules
- Overall status, KPIs, and the Incidents tab badge are always derived from current state — never hardcoded.
- Rollback only available for `Success` deployments (not already Rolled Back / Failed / In Progress).
- Escalate / Change Owner / Mark Resolved only available while an incident is Active or Investigating.
- All "now" math (uptime history day boundaries, incident durations, note timestamps, staleness) uses `LOGS_NOW` (`data/logs.js`, 13 May 2026 10:45 AM) — the same pinned clock used by Logs & Audit and Security & Access — so cross-module time comparisons stay consistent.
- Service/incident/deployment/dependency state is local to `HealthPage` and resets on refresh (no `localStorage`), matching Queue Monitor's precedent — only the audit trail (via the 4 store methods) and toasts are global-store side effects.

## Permissions
No access control — all super admin users see the full page and can perform all actions. (Same as every other page in this module before Security & Access existed; System Health was not called out for RBAC gating in the build spec.)

## Automations
None triggered from this page. Incident/deployment mutations only write to `history` (audit trail) via `addHistory`.

## Decisions
- **2026-07-24** — Chose local component state (`useState` in `HealthPage`, seeded from `data/health.js`) over global store state for services/incidents/deployments/dependencies, matching Queue Monitor's existing pattern. Rejected: adding all four as store slices — would bloat `StoreContext.jsx` for data that's page-scoped ops telemetry, not cross-page shared state like clients or subscriptions.
- **2026-07-24** — Only 4 admin actions get `addHistory`-backed audit methods on the store (create/resolve/escalate incident, rollback deploy), plus a 5th added during implementation (`changeIncidentOwner`) once the validation checklist made clear "Change Owner" needed the same audit trail as Escalate. Rejected: audit-logging "Add Note" as its own history entity type — the note text is already permanently preserved in the incident's own timeline, which is the audit trail's substance either way; adding a parallel `SEED_HISTORY` entry for it would be redundant.
- **2026-07-24** — "Last check" in the Overall Status Banner is a dedicated `refreshedAgo` counter (reset by "Refresh All"), not derived from `Math.max`/`Math.min` of every service's own Last Checked. Rejected: deriving it from the services array — CarWale Feed's `lastCheckedMinutesAgo` is 1560 (26h, it's Down), and using max() would make the banner permanently read "26h ago" even when everything else was checked 2 minutes ago, which misrepresents monitoring freshness.
- **2026-07-24** — `dep-1`'s `linkedIncidentId` deliberately points to an incident whose root cause (per its own timeline) is unrelated to that deploy's changelog, to make the Post-Deploy Health feature demonstrate a real use case: time-correlation as an investigation prompt, not a verified causal link. Rejected: leaving every deployment's `linkedIncidentId` null — would leave the Linked Incident section of the drawer completely unexercised by any seed data.
- **2026-07-24** — Status Board is the only tab wrapped in a `flex-1 min-h-0` fill/scroll Card (matching Security & Access's `Sessions`-tab pattern); Performance/Incidents/Deployments/Dependencies wrap their stacked cards in a plain `overflow-y-auto` region instead. Rejected: forcing every tab into a single filling table region — only Status Board is naturally one big table; the others are multi-section card stacks that read better with normal document scroll.

## Open questions
- `API_PERFORMANCE`, `SLOWEST_ENDPOINTS`, and `DB_METRICS` are a static snapshot (`data/health.js`), not computed live from `data/logs.js`'s API Logs tab — should Performance eventually aggregate from real log rows the way `AutomationPage`'s Internal Ops KPIs do from run logs?
- `JOBS_SUMMARY` (14 completed / 0 waiting / 0 failed) is a separate static mock from `QueuesPage`'s own local job-queue state (which has its own failed-job seed data) — should these be unified into one shared source now that both pages reference "the same" BullMQ workers?
- Incident timeline actor names alternate between real admins (Ravi Kant, Narender, Luv Sharma) and the literal strings "Monitoring"/"System" for auto-generated entries — is a synthetic "Monitoring" actor the right model, or should auto-opened incidents eventually come from a real alerting integration?
- Should "Refresh All" also re-run the Overall Status computation against fresh random statuses (simulating real monitoring), or is a Last-Checked-only refresh sufficient for this prototype?
- Rollback is a one-click action with no confirmation step — is that acceptable for a destructive-sounding production action, or should it get a confirm dialog like other destructive actions elsewhere in the app (e.g. Security & Access's Revoke flows)?
