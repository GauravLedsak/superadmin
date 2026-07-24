# Queue Monitor — [Mock]
Route: `queues` · Source: `superadmin/src/pages/QueuesPage.jsx` → `QueuesPage()`

## Purpose
Shows background job queue health across the platform — pending counts, processing workers, failed jobs, and throughput. Super admins can retry failed jobs from a specific queue. The sidebar badge shows "5" (total failed jobs across all queues at seed time).

## Flow

### Primary path
1. Page loads with 4 KPI cards and a queue table.
2. Queues with `failed > 0` show a "Retry" button.
3. Admin clicks "Retry" on a queue row → failed count resets to 0, status changes to "Healthy", toast fires.
4. "Refresh" button → `store.notify("Queues refreshed")` — no data reload.

### Edge cases
- After retrying all queues, no Retry buttons are visible. Total failed KPI drops to 0.

## Page Header KPIs (4 cards)

| Label | Formula | Live? |
|-------|---------|-------|
| Jobs Pending | `String(queues.reduce((s, q) => s + q.pending, 0))` | Live from local queue state |
| Processing | `String(queues.reduce((s, q) => s + q.processing, 0))` | Live from local queue state |
| Failed (24h) | `String(queues.reduce((s, q) => s + q.failed, 0))` | Live from local queue state |
| Throughput | `"2.4k/min"`, sub "peak today" | [Mock] hardcoded |

Trends: Jobs Pending → `trend="warn"`, Failed → `trend="neg"`, Throughput → `trend="pos"`.

Initial values (from seed):
- Pending: 8+142+24+2+0 = 176
- Processing: 3+12+6+1+0 = 22
- Failed: 0+4+1+0+0 = 5

## Queue Table

Columns: Queue (monospace), Pending, Processing, Failed, Rate, Status, (Retry button)

| Queue name | Pending | Processing | Failed | Rate | Status |
|-----------|---------|-----------|--------|------|--------|
| lead-ingestion | 8 | 3 | 0 | 1.2k/min | Healthy |
| ai-enrichment | 142 | 12 | 4 | 80/min | Backed up |
| notifications | 24 | 6 | 1 | 600/min | Healthy |
| webhooks-out | 2 | 1 | 0 | 300/min | Healthy |
| billing-jobs | 0 | 0 | 0 | idle | Idle |

**Failed cell**: renders in `T.danger` (red) when `q.failed > 0`, default text color when 0.

**Status badge tones**: `{ Healthy: "success", "Backed up": "warning", Idle: "gray" }`

**"Retry" button**: only renders when `q.failed > 0`. Action:
```js
retry(name) {
  setQueues(qs => qs.map(q =>
    q.name === name ? { ...q, failed: 0, status: "Healthy" } : q
  ));
  store.notify("Retried failed jobs in {name}");
}
```
This updates local component state (not the store). Queues state is local to `QueuesPage` — navigating away and back resets to seed values.

## Rules
- "Retry" resets `failed` to 0 and `status` to "Healthy" regardless of queue type.
- Queue data is local React state, not from any store — changes do not affect other pages.
- "Refresh" button does not re-fetch or re-seed — it only shows a toast.

## Permissions
No access control. All super admin users can retry queues.

## Automations
None triggered from this page.

## Decisions
None recorded.

## Open questions
- "Refresh" should reload queue data — should it re-fetch from a real queue monitoring API?
- Should "Retry" confirm before replaying dead-letter jobs (they may replay side effects)?
- `ai-enrichment` is "Backed up" with 142 pending — is this a known normal state or an alert condition?
- Throughput "2.4k/min" — is this a sum of all queue rates? The individual rates sum to ~2.18k/min (1.2k + 80 + 600 + 300) plus idle.
- Should individual queues be drillable to see failed job payloads?
