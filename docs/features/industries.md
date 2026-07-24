# Industries & Templates — [Mock]
Route: `industries` · Source: `superadmin/src/pages/IndustriesPage.jsx` → `IndustriesPage()`

## Purpose
A catalog of vertical industry presets showing how many tenants use each. Clicking "Edit template" on a card fires a toast. Super admins would use this to manage onboarding workflow templates per industry.

## Flow

### Primary path
1. Page loads with 6 industry cards in a 3-column grid.
2. "Edit template" on any card → `store.notify("Editing {industry} template")` — no edit form opens.
3. "New Template" button → no `onClick`, does nothing.

## Industry Cards (6 cards)

Each card shows: icon (36×36px in `T.primarySoft` rounded square, blue icon), tenant count badge, industry name (bold 14px), workflow description (muted 12px), "Edit template" button.

| Industry | Icon | Tenants | Tone | Workflow description |
|----------|------|---------|------|---------------------|
| Automotive Dealership | Car | 48 | brand (blue) | Multi-brand showroom workflow |
| Healthcare / Clinic | Stethoscope | 37 | purple | Patient lead + EMR bridge |
| Education | GraduationCap | 38 | success (green) | Admissions funnel |
| Ecommerce | ShoppingCart | 26 | warning (orange) | Abandoned-cart recovery |
| Real Estate | Building2 | 45 | gray | Site-visit scheduling |
| Other / Custom | LayoutTemplate | 121 | gray | Blank starter workflow |

Tenant counts are hardcoded (not derived from `store.clients`). Sum = 315, which doesn't match `STATS.total = 564`.

**Badge** on each card: tone matches the industry tone above, text = "{count} tenants".

**"Edit template" button** (full-width, sm size): `store.notify("Editing {v[0]} template")` where `v[0]` is the industry name string.

## Rules
None — read-only page with toast-only actions.

## Permissions
No access control. All super admin users see this page.

## Automations
None triggered from this page.

## Decisions
None recorded.

## Open questions
- "New Template" has no handler — what should the template creation flow look like?
- "Edit template" opens no form — what fields would a template have (stages, tasks, integrations, automations)?
- Tenant counts (48, 37, etc.) don't match seeded data — are these the real production figures?
- "Real Estate" has 45 tenants but no clients in `SEED_CLIENTS` have that industry — is Real Estate a future vertical?
- Should tenant count badges link to a filtered view of the Clients page?
