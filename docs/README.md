# LEDSAK Super Admin — Route Index

Single-page React app (`LedsakSuperAdmin.jsx`). Navigation is state-based (no URL router); each route listed below corresponds to a nav ID passed to the internal `go()` function. All data is in-memory seeded state — nothing persists across reloads.

Source: `LedsakSuperAdmin.jsx` (root) · `superadmin/src/LedsakSuperAdmin.jsx` (project copy)

---

## Core

| Nav ID | Label | Doc | Status |
|--------|-------|-----|--------|
| `dashboard` | Dashboard Command Center | [features/dashboard.md](features/dashboard.md) | [Mock] |
| `clients` | Tenants / Clients | [features/clients.md](features/clients.md) | [Mock] |
| `onboarding` | Client Onboarding | [features/onboarding.md](features/onboarding.md) | [Mock] |
| `users` | CRM Users | [features/users.md](features/users.md) | [Mock] |

## Revenue

| Nav ID | Label | Doc | Status |
|--------|-------|-----|--------|
| `subs` | Subscriptions & Plans | [features/subscriptions-plans.md](features/subscriptions-plans.md) | [Mock] |
| `cs` | Customer Success | [features/customer-success.md](features/customer-success.md) | [Mock] |

## Data & Intelligence

| Nav ID | Label | Doc | Status |
|--------|-------|-----|--------|
| `leads` | Lead & Record Management | [features/leads.md](features/leads.md) | [Mock] |
| `automation` | Automation Center | [features/automation-center.md](features/automation-center.md) | [Mock] |
| `ai` | AI Intelligence | [features/ai-intelligence.md](features/ai-intelligence.md) | [Mock] |

## Operations

| Nav ID | Label | Doc | Status |
|--------|-------|-----|--------|
| `integrations` | Integrations | [features/integrations.md](features/integrations.md) | [Mock] |
| `comms` | Communication Center | [features/comms.md](features/comms.md) | [Mock] |
| `reports` | Reports & BI | [features/reports.md](features/reports.md) | [Mock] |

## Reliability

| Nav ID | Label | Doc | Status |
|--------|-------|-----|--------|
| `queues` | Queue Monitor | [features/queue-monitor.md](features/queue-monitor.md) | [Mock] |
| `logs` | Logs & Audit Trail | [features/logs.md](features/logs.md) | [Mock] |
| `health` | System Health | [features/system-health.md](features/system-health.md) | [Mock] |

## Governance

| Nav ID | Label | Doc | Status |
|--------|-------|-----|--------|
| `security` | Security & Access | [features/security-access.md](features/security-access.md) | [Mock] |
| `support` | Support & Tickets | [features/support.md](features/support.md) | [Mock] |

## Configuration

| Nav ID | Label | Doc | Status |
|--------|-------|-----|--------|
| `industries` | Industries & Templates | [features/industries.md](features/industries.md) | [Mock] |
| `settings` | Settings | [features/settings.md](features/settings.md) | [Mock] |

---

---

## Dead Code (defined but unreachable)

Two page components exist in `LedsakSuperAdmin.jsx` but are not wired into the router switch statement and cannot be reached by any navigation:

| Component | Defined at | Description |
|-----------|-----------|-------------|
| `BillingPage()` | line ~965 | Invoices table + Dunning tab. Has working `retryInvoice` action. Replaced by `subs` route (SubsPlansPage). The notification `page: "billing"` in `SEED_NOTIFS[2]` references this missing route — clicking that notification navigates to `"billing"` which falls through to `DashboardPage`. |
| `RevenuePage()` | line ~1081 | Revenue analytics + Plan Catalog tab. Replaced by `subs` route (SubsPlansPage) and the "Plan Catalog" tab's plan data model was updated without removing this component. |

---

> **Status key:**
> - **[Implemented]** — wired to a real backend; data persists.
> - **[Mock]** — UI is interactive but all data is seeded in-memory; nothing persists across reloads.
> - **[Planned]** — navigation item or feature exists in the nav but has no page content yet.
> - **[Unverified]** — behavior cannot be confirmed from code alone; see Open questions in the feature doc.
