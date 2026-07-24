# Client Onboarding — [Mock]
Route: `onboarding` · Source: `superadmin/src/pages/OnboardingPage.jsx` → `OnboardingPage()` + `OnboardingDetail()`

## Purpose
Tracks new clients from signed deal to go-live through a 5-stage pipeline. Account managers use it to advance a client through stages, complete checklist tasks, and schedule calls. The view is a Kanban board — one column per stage.

## Flow

### Primary path
1. Page loads showing a 5-column Kanban board with clients distributed across stages.
2. Clicking any client card opens `OnboardingDetail` drawer (560px wide).
3. Inside the drawer, admin clicks "Advance to {next stage}" → stage increments and `tasksDone` increases by 2.
4. At "Go-Live" stage, button label changes to "Promote to live tenant" — same action, but a toast fires saying "{client} promoted".
5. "Schedule call" button → `store.notify("Kickoff call scheduled")` (no actual scheduling).
6. Closing the drawer returns to the Kanban board.

### Edge cases
- "Start Onboarding" button in page header has no `onClick` — does nothing.
- If a client is already at "Go-Live" and advance is clicked again, no stage change happens (index check `idx >= ONBOARD_STAGES.length - 1` prevents overflow) but toast still fires "{client} promoted".
- `tasksDone` is incremented by 2 per advance, capped at `tasksTotal` (8). It does not map to specific tasks being checked off.

## Page Header KPIs (4 cards)

| Label | Formula | Live? |
|-------|---------|-------|
| In Pipeline | `String(store.onboarding.length)` = 5 | Live from store |
| Pipeline MRR | `fmtINR(store.onboarding.reduce((s,o) => s+o.mrr, 0))` = ₹50,500 | Live from store |
| Avg Time to Live | `"16 days"` (hardcoded) | [Mock] |
| Go-Live Ready | `String(store.onboarding.filter(o => o.stage === "Go-Live").length)` | Live from store |

Trend indicators: Pipeline MRR → `trend="pos"`, Avg Time → `trend="pos"` (sub "target 21"), Go-Live Ready → `trend="warn"`.

## Kanban Board

Stages (ordered): **Kickoff → Configuring → Data Import → Training → Go-Live**

Column header: stage name + badge showing item count. Badge tones:
| Stage | Badge tone |
|-------|-----------|
| Kickoff | gray |
| Configuring | info (blue) |
| Data Import | purple |
| Training | warning (orange) |
| Go-Live | success (green) |

Each client card shows:
- Avatar (24px, purple for Clinic, brand blue for others) + client name
- Industry · account manager
- Progress bar: `(tasksDone / tasksTotal) * 100`%
- Footer: "{tasksDone}/{tasksTotal} tasks" (left) + `fmtINR(mrr)` (right, muted)

Empty column: "Empty" centered text.

## Seeded Onboarding Pipeline (5 clients)

| Client | Industry | AM | Stage | MRR | Tasks | Provider |
|--------|----------|----|-------|-----|-------|----------|
| Nexa Auto Group | Automotive | Saif Sir | Kickoff | ₹15,000 | 2/8 | CarWale + CarDekho |
| Skin Story Clinics | Clinic | Luv | Configuring | ₹9,000 | 5/8 | Website |
| DriveEasy Motors | Automotive | Vishal | Data Import | ₹12,000 | 6/8 | CarDekho |
| BrightPath Edu | Education | Vishal | Training | ₹6,000 | 7/8 | Website |
| Glow Aesthetics | Clinic | Luv | Go-Live | ₹8,500 | 8/8 | Website + WhatsApp |

---

## OnboardingDetail Drawer (560px)

### Drawer header (sticky)
- Avatar 44px (purple for Clinic, brand for others) + client name
- Subtitle: `{industry} · {am} · started {started}`
- Close (X) button

### Stage stepper
Horizontal stepper with 5 numbered circles:
- Completed stages (index < current): filled primary blue circle with ✓ check
- Current stage: filled primary blue circle with step number
- Future stages: gray circle (#E4E7F0) with step number
- Connecting lines between circles: primary blue for completed connections, gray for future

### KPI row (3 cards)
| KPI | Source |
|-----|--------|
| Deal MRR | `fmtINR(o.mrr)` |
| Tasks | `"{tasksDone}/{tasksTotal}"` |
| Provider | `o.provider.split(" ")[0]` (first word), sub = full provider string |

### Onboarding Checklist card

8 hardcoded tasks in `ONBOARD_TASKS` (shared constant):
1. Kickoff call & scope sign-off
2. Create tenant & assign plan
3. Configure 4-tier hierarchy
4. Connect lead providers
5. Set routing & automation rules
6. Import existing leads
7. Train Team Leads & Telecallers
8. Go-live sign-off

Task completion: tasks with index < `o.tasksDone` are "done". Done tasks show a filled green circle with a white ✓, and the text has `line-through` decoration in muted color. Not-done tasks show an empty circle with a gray border.

Badge on card header: percentage `Math.round((tasksDone / tasksTotal) * 100) + "%"`, tone = "success" if all done, "warning" otherwise.

### Action buttons
- **"Advance to {next stage}"** / **"Promote to live tenant"** (primary, full width): calls `store.advanceOnboarding(o.id)`. Stage increments using `ONBOARD_STAGES` index. `tasksDone` increments by 2 (capped at `tasksTotal`).
- **"Schedule call"**: `store.notify("Kickoff call scheduled")` — no real calendar integration.

### `store.advanceOnboarding` (real logic)
```js
const idx = ONBOARD_STAGES.indexOf(o.stage);
if (idx >= ONBOARD_STAGES.length - 1) {
  notify("{client} promoted");
  return o; // no change
}
return { ...o, stage: ONBOARD_STAGES[idx + 1], tasksDone: Math.min(o.tasksTotal, o.tasksDone + 2) };
```

## Rules
- Stages are a fixed linear sequence; no skipping or going backwards.
- `tasksDone` increments by 2 per advance regardless of which tasks are actually done.
- There is no state for individual task completion — only the aggregate count matters.
- "Promote to live tenant" does NOT create a new entry in `store.clients` — it only fires a toast. Conversion to an active tenant is not implemented.

## Permissions
No access control. All super admin users can advance any client.

## Automations
None triggered from this page.

## Decisions
None recorded.

## Open questions
- "Start Onboarding" button has no handler — should it open a form to create a new onboarding entry?
- "Promote to live tenant" has no effect on `store.clients` — should promoting at Go-Live add the client to the tenants list?
- `tasksDone += 2` per advance is a rough approximation — should individual tasks be checkable?
- Contact person (`o.contact`) is in the seed data but never displayed in the UI — was it removed or not yet added?
- Should "Schedule call" open a calendar/scheduling flow?
