# Communication Center — [Mock]
Route: `comms` · Source: `superadmin/src/pages/CommsPage.jsx` → `CommsPage()`

## Purpose
Platform-wide view of outbound communication volume and delivery rates across WhatsApp, SMS, and Email. Shows approved message templates. Used by super admins to monitor channel health and delivery metrics.

## Flow

### Primary path
1. Page loads with 4 KPI cards and two cards (Channel Volume, Templates).
2. "New Broadcast" button → no `onClick`, does nothing.
3. No interactive filters, drilldown, or modals — read-only.

## Page Header KPIs (4 cards)

All hardcoded:

| Label | Value | Sub-text | Trend |
|-------|-------|---------|-------|
| Sent (30d) | 182,400 | "all channels" | pos |
| Delivery Rate | 97.8% | "above target" | pos |
| WhatsApp Read | 71% | "open rate" | pos |
| Failed | 1.2% | "invalid numbers" | warn |

## Channel Volume Card

BarList, 3 channels. Max scale: 120,000. All hardcoded:

| Channel | Volume | Bar color |
|---------|--------|-----------|
| WhatsApp | 108,000 | success (green) |
| SMS | 46,000 | primary (blue) |
| Email | 28,400 | purple |

Formatted with `en-IN` locale.

## Templates Card

3 message templates shown as bordered rows:

| Template name | Channel | Icon | Status badge |
|---------------|---------|------|-------------|
| Lead welcome | WhatsApp | Mail icon | Approved (green) |
| Renewal reminder | Email | Clock icon | Approved (green) |
| Missed-call follow-up | SMS | Phone icon | Approved (green) |

Each row: icon in a blue rounded square (36×36px, `T.primarySoft` background, blue icon), template name (bold 13px), channel (muted 12px), "Approved" badge. No actions on template rows.

## Rules
None — read-only page.

## Permissions
No access control. All super admin users see this page.

## Automations
None triggered from this page.

## Decisions
None recorded.

## Open questions
- "New Broadcast" button has no handler — should it open a broadcast composition flow?
- Template rows have no actions — should there be an "Edit", "Preview", or "Send test" option?
- All 3 templates show "Approved" — how does a template get approved? Is there a WhatsApp Business API approval flow?
- Channel volumes don't match per-client data — are these intended as platform aggregates?
- "Failed 1.2%" — should clicking this show a breakdown of which tenants have invalid numbers?
