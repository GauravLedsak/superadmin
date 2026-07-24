# Industries & Templates — [Implemented]
Route: `industries` · Source: `superadmin/src/pages/IndustriesPage.jsx` → `IndustriesPage()`, `superadmin/src/data/industries.js`

## Purpose
The CRM configuration factory — defines what a tenant's CRM is pre-loaded with at onboarding (lead fields, lead sources, lead groups, pipeline stages) per industry vertical. Super admins manage these templates here; `ClientsPage`'s Add Tenant modal reads the Active ones for its Industry dropdown.

## Flow

### Primary path
1. Page loads with 4 live KPI cards and a table of industry templates (6 seeded verticals).
2. Row click or "Edit" (pencil) opens the Industry Configuration drawer, pre-populated.
3. "+ New Industry" opens the same drawer with a blank template (system fields + starter sources/groups/stages pre-filled).
4. Inside the drawer: edit name/icon/status/description/default-flag, then edit each of the 4 tabs (Lead Fields, Lead Sources, Lead Groups, Lead Stages).
5. "Save Configuration" validates, then calls `store.updateIndustry` (existing) or `store.createIndustry` (new) — both `addHistory` + `notify`.
6. Row menu (⋯): Duplicate (creates a "(Copy)" as Draft, reopens editor on the copy), Set as Default (unsets the previous default), Delete (blocked with an inline reason if any tenant currently uses this industry).

### Edge cases
- Deleting an industry with tenants: the confirm modal shows the blocking reason and disables the Delete button — the guard is enforced in `store.deleteIndustry` too, not just the UI.
- Save validation: industry name required, ≥1 non-system lead field, ≥1 lead source, ≥1 lead group, ≥2 lead stages — shown as a bulleted banner at the top of the drawer body.
- A lead stage's trash button disables at exactly 1 remaining stage (can't go below 1 in the editor), independent of the ≥2 rule enforced at Save.
- System fields (Name, Phone, Email) exist in every industry, are not editable and cannot be removed — their trash button is disabled with an explanatory tooltip.

## KPI Cards (4, live-computed)
| Label | Formula |
|-------|---------|
| Industries | `industries.length`, sub `"{active} active · {draft} draft(s)"` |
| Total Tenants | `store.clients.length` — all tenants, regardless of industry |
| Most Popular | `mostPopularIndustry()` — industry with the highest live tenant count |
| Avg Fields / Industry | `avgFieldsPerIndustry()` — mean `leadFields.length` across all industries |

## Industry List (table, not cards — replaces the old 3-column card grid)
Columns: Industry (icon + name + "Default" badge if applicable + description), Status (badge), Tenants (live count), Fields (count), Stages (first 3 names + "+N"), Sources (active-only count), Last Modified ("{date} by {who}"), Actions (Edit pencil + ⋯ menu).

Filters: Status pills (All/Active/Draft) + name/description search. Empty state: "No industry templates configured. Create one to get started."

**Tenant counts** are computed live via `countTenantsForIndustry(industry, clients)` — `client.industry === industry.name`. Row click anywhere (outside the Actions cell) opens the editor.

## Industry Configuration Editor (Drawer, 760px)
Header: "← Back" + title (no separate header Save button — see Decisions). Body: Industry Name, Icon (picker with a live preview swatch, options from `INDUSTRY_ICONS`), Status (Active/Draft), "Default for new tenants" toggle, Description — then the 4 tabs, then a full-width "Save Configuration" button.

### Tab 1 — Lead Fields
2-column grid, each field a bordered card with a small uppercase "Field Name" label above an editable input, and a red circular trash button (pink/soft background) beside it. System fields render with a disabled, muted input and a disabled trash. "+ Add Field" is a dashed-border button that spans both columns when the field count is even (so it isn't stranded alone in the left column), auto-focuses its new input.

### Tab 2 — Lead Sources
Single-column rows: editable name input, `Switch` (active/inactive), trash. "+ Add Source" dashed button.

### Tab 3 — Lead Groups
Rows: a `ColorSwatch` (click opens an 8-color preset picker, no color wheel), name input, optional description input, trash. "+ Add Group" dashed button.

### Tab 4 — Lead Stages
Ordered rows: up/down reorder buttons (disabled at the first/last position), color swatch, name input, an SLA-hours number input ("—" = no SLA), trash (disabled when only 1 stage remains). Below the list, a live **Pipeline Preview** renders every stage as a colored pill connected by chevrons, updating immediately as stages are added/removed/reordered/renamed/recolored.

## Cross-Page Integration
- **`ClientsPage.jsx`**: `TENANT_INDUSTRIES` (used by the Add Tenant modal's Industry `<select>`) is no longer a hardcoded module-level array — it's computed inside `AddTenantModal` as `store.industries.filter(i => i.status === "Active").map(i => i.name)`. Creating a new Active industry here immediately appears in that dropdown; setting one to Draft removes it.
- **`OnboardingPage.jsx`**: unchanged — it only *displays* `onboarding.industry` (a plain string carried over from the tenant record), it doesn't source a list of industries itself, so there was nothing to wire up there.

## Rules
- Exactly one industry can have `isDefault: true` — `setDefaultIndustry` unsets every other industry's flag in the same update.
- Delete is blocked (both in the UI and in the store method) whenever `countTenantsForIndustry > 0`.
- Duplicate always produces a `Draft`, non-default copy named "{name} (Copy)", regardless of the source's own status/default flag, and reopens the editor on the copy so the admin can adjust it before it goes live.
- Lead field "required"/"isSystem" flags are fixed at creation — the editor only lets you rename custom fields and add/remove them; there's no UI to toggle a field between required/optional or system/custom (matches the original screenshot's scope — no field-type system either).

## Permissions
No access control — all super admin users can create, edit, duplicate, and delete industry templates.

## Automations
None triggered from this page. All mutations only write to `history` (audit trail) via `addHistory`.

## Decisions
- **2026-07-24** — Seeded industry `name` values match the short vocabulary already used by `SEED_CLIENTS` in `data/seed.js` ("Automotive", "Clinic", "Ecommerce", "Education", "Other") rather than the longer descriptive names given in the originating spec ("Automotive Dealership", "Healthcare / Clinic", "Other / Custom"). Rejected: using the longer names verbatim — since `TENANT_INDUSTRIES` (the Add Tenant dropdown) is now derived directly from `industry.name`, using longer names would immediately fork newly-created tenants' `client.industry` strings away from the vocabulary every existing seeded tenant already uses, breaking the very tenant-count column this page's spec required to be "live." The richer language lives in each industry's `description` field instead, which the list/editor both surface.
- **2026-07-24** — The drawer has one "Save Configuration" action (full-width, bottom of the body), not two. The spec's ASCII header mockup showed a compact `[Save]` in the top-right of the header *and* separately described a distinct full-width "Save Configuration" button at the bottom with validation behavior — implemented only the latter, since duplicating the same action in two places with no distinct behavior would be confusing, and the bottom button was the one given an actual behavioral spec (validation, error banner).
- **2026-07-24** — Added a `setDefaultIndustry` store method (not explicitly listed in the four spec'd CRUD methods) since "Set as Default" is a required row-menu action per the validation checklist and needs the same `addHistory`/`notify` treatment as the other mutations, rather than mutating `isDefault` via a generic `updateIndustry` call that wouldn't unset the previous default atomically.
- **2026-07-24** — Fixed a real bug found during manual verification: `Td` (`components/ui.jsx`) doesn't forward an `onClick` prop (it only destructures `className`/`style`/`children`/`colSpan`), so the original `<Td onClick={stopPropagation}>` around the row's Edit/Menu actions silently did nothing, letting clicks on those buttons bubble to the row's own `onClick` and open the editor instead of the dropdown. Fixed by moving `onClick={(e) => e.stopPropagation()}` onto the inner `<div>` wrapper instead, which is plain JSX under this page's own control.

## Open questions
- Lead fields have no type system (Text/Number/Date/Dropdown) — matches the original screenshot exactly, but is a true type system needed before this could drive a real form-builder?
- No drag-and-drop reordering for stages (up/down buttons only) — acceptable long-term, or worth a drag library once more pages need ordered lists (Roles & Permissions' `ACTION_ORDER`, playbook steps, etc. all hit the same limitation)?
- "Apply to tenant" / pre-filling a new tenant's actual CRM configuration from its industry template at onboarding time is explicitly out of scope per the originating prompt ("future integration") — `OnboardingPage.jsx` was deliberately left untouched. When that's built, does it read `store.industries` directly, or does a tenant's CRM config get its own snapshot/copy at onboarding time (so later edits to the template don't retroactively change already-onboarded tenants)?
- Real Estate has 0 tenants in seed data (no `SEED_CLIENTS` entry uses that industry) — is Real Estate a genuinely upcoming vertical, or should a couple of seed clients be reassigned to it so the template isn't demoed empty?
