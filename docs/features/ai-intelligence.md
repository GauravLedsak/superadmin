# AI Intelligence — [Mock]
Route: `ai` · Source: `superadmin/src/pages/AiPage.jsx` → `AiPage()`

## Purpose
Platform-wide view of AI feature adoption, model status, and token spend across all tenants. Used by super admins to monitor which AI features are being used, identify underutilization, and check model health.

## Flow

### Primary path
1. Page loads with 4 KPI cards and two side-by-side cards (Feature Adoption, Models).
2. "Configure Models" button in page header → no `onClick`, does nothing.
3. No interactive filters, drilldown, or modal — read-only overview.

## Page Header KPIs (4 cards)

| Label | Formula | Live? |
|-------|---------|-------|
| Summaries (30d) | `"4,830"`, sub "+840" | [Mock] hardcoded |
| Tenants Using AI | `String(STATS.aiUsed)` = "483", sub `"of ${STATS.total}"` = "of 564" | [Mock] STATS constants |
| Avg Score Lift | `"+18%"`, sub "conversion" | [Mock] hardcoded |
| Token Spend | `fmtINR(41200)` = "₹41,200", sub "within budget" | [Mock] hardcoded |

Trends: Summaries → `trend="pos"`, Tenants Using AI → `trend="warn"`, Avg Score Lift → `trend="pos"`.

Note: "Tenants Using AI" uses `STATS.aiUsed = 483` which is the count of AI-using tenants, not the per-client `c.aiUsed` field on individual records. Despite the naming collision, these are different fields.

## Feature Adoption Card

BarList showing 4 AI features and adoption percentage. All hardcoded. Max scale: 100 (percent).

| Feature | Adoption % | Bar color |
|---------|-----------|-----------|
| Summarization | 86% | primary (blue) |
| Scoring | 64% | primary (blue) |
| Churn prediction | 41% | purple |
| Auto-reply drafts | 28% | warning (orange) |

Formatted as `v + "%"`.

## Models Card

3 AI models shown as bordered rows:

| Model use | Model name | Status | Badge tone |
|-----------|------------|--------|-----------|
| Summarization | GPT-4o mini | Live | success (green) |
| Scoring | Custom ML v3 | Live | success (green) |
| Churn | Custom ML v2 | Retraining | warning (orange) |

Each row: model name (bold), model identifier (muted), status badge. No actions on any row.

## Rules
None — read-only page.

## Permissions
No access control. All super admin users see this page.

## Automations
None triggered from this page.

## Decisions
None recorded.

## Open questions
- "Configure Models" button has no handler — should it open a model configuration panel?
- GPT-4o mini is listed as the summarization model — is this the actual production model or a placeholder?
- "Custom ML v2/v3" — what platform hosts these models? Are they in-house or a third-party ML platform?
- Churn model is "Retraining" — should there be a way to deploy a new version from this page?
- Token spend of ₹41,200 — is this converted from USD and at what exchange rate? Should it show USD instead?
- No tenant breakdown of AI usage — should there be a drilldown to see which tenants use which features?
