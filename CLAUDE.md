# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — run Oxlint (config in `.oxlintrc.json`)

There is no test suite and no TypeScript in this project.

## Architecture

This is a React 19 + Vite frontend prototype of a **super-admin console for "Ledsak"**, a multi-tenant SaaS CRM/lead-management platform (clients are agencies/brands across industries like Automotive, Clinic, Ecommerce, Education). It is a self-contained demo app with in-memory seed data — there is no backend; all data lives in React state plus a handful of `localStorage` keys (onboarding, leads, lead audit trail, PII grants, internal-ops automations/logs) for persistence across a refresh.

Routing is real, via **`react-router-dom`** (`BrowserRouter`) — each page has its own URL and survives a browser refresh. This used to be a single ~6100-line file; it's now split into modules described below.

### Module layout

```
src/
  theme.js                 T (theme tokens) + cx() classname helper
  lib/format.js             date/currency helpers (parseDate, fmtINR, isOverdue, daysUntil, TODAY, ...)
  data/
    constants.js            NOW, ADMIN, ONBOARD_STAGES, CHECKLIST_TEMPLATE, playbook/task-status enums
    seed.js                 SEED_CLIENTS, SEED_INVOICES, SEED_USERS, SEED_SP_PLANS, SEED_SUBSCRIPTIONS,
                             SEED_PLAYBOOKS, SEED_TENANT_TASKS, PricingEngine, CUSTOM_RESOURCES, etc.
    leads.js                Lead & Record Management's own data module: SEED_LEADS, TENANT_TIER,
                             computeIntegrationHealth, mask*/load*/save* helpers — shared by LeadsPage
                             AND IntegrationsPage, which is why it isn't inside either page file.
  store/StoreContext.jsx    StoreCtx / useStore() / StoreProvider — the single global state container
  components/ui.jsx         Shared UI primitives: Card, Button, Badge, Table, Modal, Drawer, Tabs,
                             Pagination (+usePagination), Menu, Toast, FilterPill, SearchInput,
                             row-selection hooks (useRowSelection, RowCheckbox, BulkActionsMenu), etc.
  routes.js                 NAV (sidebar groups, each item has an id + path), ID_TO_PATH / PATH_TO_ID,
                             PAGE_TITLES, FIXED_HEIGHT_PAGES — the single source of truth for routing
  layout/
    Sidebar.jsx, Topbar.jsx, NotifPanel.jsx, ProfileDropdown.jsx, ImpersonationBanner.jsx
    Layout.jsx              Page shell: renders Sidebar/Topbar/ImpersonationBanner/Toast/Tenant360,
                             owns the `<Routes>` tree, derives `active` from the URL via useLocation(),
                             and defines `go(id, params)` (a useNavigate() wrapper) passed down to pages
  pages/
    DashboardPage.jsx, ClientsPage.jsx (+ Tenant360, AddTenantModal), OnboardingPage.jsx,
    UsersPage.jsx, SubscriptionsPage.jsx (Plan Library/Addon Pricing/Client Subscriptions/Revenue tabs),
    CustomerSuccessPage.jsx (At-Risk/Playbooks/Tenant Tasks/Renewals tabs), LeadsPage.jsx,
    AutomationPage.jsx (Lead Routing / Internal Ops / Internal Ops Logs tabs), AiPage.jsx,
    IntegrationsPage.jsx, CommsPage.jsx, ReportsPage.jsx, QueuesPage.jsx, LogsPage.jsx, HealthPage.jsx,
    SecurityPage.jsx, SupportPage.jsx, IndustriesPage.jsx, SettingsPage.jsx
    BillingPage.jsx, RevenuePage.jsx   (defined but not wired into any route — pre-existing dead code)
  App.jsx                   BrowserRouter + StoreProvider + Layout — the actual app root
  main.jsx                  standard Vite/React entrypoint
```

### How things connect

- **Global store**: `StoreProvider` (in `store/StoreContext.jsx`) holds all app state (clients, invoices, users, tickets, onboarding, subscriptions, plans, playbooks, tenant tasks, contact logs, notifications, toast, impersonation) plus every mutation method (`setTenantStatus`, `addTenant`, `updateOnboardingStage`, `createPlan`, `assignPlaybookToTenant`, `logContact`, etc.). All pages read/write state exclusively through `useStore()` — there is no other state container.
- **Routing**: `Layout.jsx` defines every `<Route path="..." element={<Page .../>} />` directly (see `routes.js` for the id↔path mapping used by `Sidebar`/`Topbar`/`FIXED_HEIGHT_PAGES`). Pages that need to navigate (`DashboardPage`, `ClientsPage`, `LeadsPage`, `AutomationPage`, and the globally-rendered `Tenant360`) receive a `go(id, params)` prop from `Layout` — `go` is a thin wrapper around `useNavigate()` that looks up the path via `ID_TO_PATH` and passes `params` as router `state`. `AutomationPage`/`IntegrationsPage` read that state back as a `filter` prop (see the cross-page links from `LeadsPage` → Integrations and `Tenant360` → Automation Logs for real examples). `Tenant360` is a global overlay drawer owned by `Layout` (not a route) — it floats above whichever page is active and does not persist across a refresh, by design.
- Cross-page imports exist where components are genuinely shared: `ClientsPage.jsx`'s `Tenant360` imports task-action components from `CustomerSuccessPage.jsx` and ops-log helpers from `AutomationPage.jsx`. Keep this one-directional (leaf pages like Customer Success and Automation must never import back from Clients) to avoid import cycles.

### Conventions to follow

- **Adding a page**: create it under `src/pages/`, add a `<Route>` for it in `layout/Layout.jsx`, and add a nav entry (with an `id` + `path`) to `NAV` in `src/routes.js`.
- **Adding state**: add a `useState` in `StoreProvider`, expose it (and any mutator methods) via the `api` object, and consume with `useStore()` in components — don't introduce prop drilling or a second context.
- **Mutations that should be audit-logged** (plans, subscriptions, tenant status changes) call `addHistory(...)` and append to `SEED_HISTORY`-backed state; follow that pattern for new mutations on those entities rather than skipping history.
- **User-facing confirmation**: after a mutation, call `notify("message")` (from the store) to show the toast — this is the established feedback mechanism, don't add a separate notification system.
- Styling uses Tailwind utility classes for layout/spacing plus the `T` theme-token object (`src/theme.js`) for colors via inline `style`. Match this hybrid approach rather than hardcoding new hex values or introducing a CSS-in-JS library.
- Icons come from `lucide-react`; each file imports only the icons it uses — don't reintroduce one giant shared icon-import block.
- Dates in seed data are strings like `"13 May 2026"`; `parseDate`/`fmtTaskDate`/`isOverdue`/`daysUntil` in `src/lib/format.js` handle parsing — reuse them instead of hand-rolling date logic. The app's "current date" is pinned by the `TODAY_DATE` (in `lib/format.js`) / `NOW` (in `data/constants.js`) constants, not `new Date()`.
