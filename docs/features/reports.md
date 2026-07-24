# Reports & BI — [Mock]
Route: `reports` · Source: `superadmin/src/pages/ReportsPage.jsx` → `ReportsPage()`

## Purpose
A catalog of saved and scheduled reports. Super admins can trigger on-demand runs and download outputs. No report builder or BI embed is implemented — only a list view.

## Flow

### Primary path
1. Page loads with 4 KPI cards and a saved reports table.
2. Admin clicks the play (▶) icon on a row → `store.notify("Running {reportName}")`.
3. Admin clicks the download (↓) icon → `store.notify("Downloaded")`.
4. "New Report" button → no `onClick`, does nothing.

## Page Header KPIs (4 cards)

All hardcoded:

| Label | Value | Sub-text |
|-------|-------|---------|
| Saved Reports | 28 | "12 scheduled" |
| Exports (30d) | 146 | "PDF + CSV" |
| Dashboards | 9 | "shared" |
| Scheduled | 12 | "auto-delivered" |

Trends: Exports (30d) → `trend="pos"`.

## Saved Reports Table

Table columns: Report (FileText icon + name), Category (badge, gray tone), Schedule, (actions)

5 seeded reports. All hardcoded:

| Report name | Category | Schedule |
|------------|----------|---------|
| Monthly revenue summary | Finance | 1st of month |
| Tenant health digest | Success | Weekly · Mon |
| Lead source performance | Sales | Weekly · Fri |
| AI usage & spend | Ops | Monthly |
| Churn cohort analysis | Success | Manual |

**Row actions** (two icon buttons):
- Play (▶, blue): `store.notify("Running {reportName}")` — no actual run
- Download (↓, muted): `store.notify("Downloaded")` — no file generated

No edit, delete, or schedule-change actions on any row.

## Rules
None — read-only page with two toast-only actions.

## Permissions
No access control. All super admin users can "run" and "download" any report.

## Automations
None triggered from this page.

## Decisions
None recorded.

## Open questions
- "New Report" button has no handler — should it open a report builder?
- Run and Download actions produce toasts only — what should they actually generate?
- "28 saved reports" KPI doesn't match the 5 rows in the table — are more reports intended?
- "9 dashboards shared" — are these BI dashboards (Metabase, Grafana)? Where do they live?
- No CSV/PDF download format selector — how should format be chosen?
