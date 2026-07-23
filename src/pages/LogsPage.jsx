import React, { useState, useMemo, useEffect } from "react";
import {
  Download, RefreshCw, Flag, CheckCircle2, ShieldAlert, ChevronDown, ChevronRight,
  ArrowRight, X,
} from "lucide-react";
import { T } from "../theme.js";
import { ADMIN } from "../data/constants.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  PageHeader, Card, CardHeader, CardBody, Table, Td, Badge, Button, Drawer, Kpi,
  Pagination, usePagination, SearchInput, FilterPill, MultiSelectFilter, DateRangeFilter,
  CopyButton, JSONBlock, SortableTh, Progress,
} from "../components/ui.jsx";
import {
  LOG_TABS, LOG_LEVELS, LEVEL_TONE, HTTP_METHODS, METHOD_TONE, statusRangeTone, statusRange,
  DELIVERY_STATUSES, DELIVERY_TONE, INTEGRATION_STATUSES, INTEGRATION_STATUS_TONE,
  INTEGRATION_HEALTH_TONE, SECURITY_OUTCOMES, OUTCOME_TONE, RESOLUTION_STATUSES, RESOLUTION_TONE,
  DATE_PRESETS, RETENTION_POLICY, LOG_ROLE_ACCESS, ACTION_TAXONOMY, ACTION_CATEGORY_OF,
  SENSITIVE_ADMIN_ACTIONS, LOGS_NOW, fmtLogTime, maskSensitive, applyLogFilters, sortRows,
  exportLogs, computeIntegrationHealthCards, INTEGRATION_NAMES, ERROR_TYPES,
  SEED_SYSTEM_LOGS, SEED_API_LOGS, SEED_SECURITY_LOGS, SEED_ADMIN_AUDIT_LOGS,
  loadErrorLogs, saveErrorLogs, loadWebhookLogs, saveWebhookLogs,
  loadIntegrationLogs, saveIntegrationLogs, loadSecurityAnnotations, saveSecurityAnnotations,
  loadAuditAnnotations, saveAuditAnnotations, loadAuditMetaEntries, saveAuditMetaEntries,
} from "../data/logs.js";

/* ============================================================
   SHARED BADGES / SMALL HELPERS
   ============================================================ */
const LevelBadge = ({ level }) => <Badge tone={LEVEL_TONE[level] || "gray"}>{level}</Badge>;
const MethodBadge = ({ method }) => <Badge tone={METHOD_TONE[method] || "gray"}>{method}</Badge>;
const StatusCodeBadge = ({ code }) => <Badge tone={statusRangeTone(code)}>{code} · {statusRange(code)}</Badge>;
const DeliveryBadge = ({ status }) => <Badge tone={DELIVERY_TONE[status] || "gray"}>{status}</Badge>;
const IntegrationStatusBadge = ({ status }) => <Badge tone={INTEGRATION_STATUS_TONE[status] || "gray"}>{status}</Badge>;
const HealthDot = ({ health }) => <span className="inline-block w-2 h-2 rounded-full" style={{ background: health === "Connected" ? T.success : health === "Degraded" ? T.warning : T.danger }} />;
const OutcomeBadge = ({ outcome }) => <Badge tone={OUTCOME_TONE[outcome] || "gray"}>{outcome}</Badge>;
const ResolutionBadge = ({ status }) => <Badge tone={RESOLUTION_TONE[status] || "gray"}>{status}</Badge>;
const IdCell = ({ value, label }) => value ? <span className="inline-flex items-center gap-1 font-mono text-[11px]" style={{ color: T.text3 }}>{value}<CopyButton value={value} label={label} /></span> : <span style={{ color: T.text3 }}>—</span>;

function DetailRow({ label, children }) {
  return <div className="flex justify-between gap-4 py-1.5 border-b last:border-0" style={{ borderColor: T.border }}><span className="text-[12px]" style={{ color: T.text3 }}>{label}</span><span className="text-[13px] text-right" style={{ color: T.text }}>{children}</span></div>;
}
function DrawerHead({ title, sub, onClose }) {
  return (
    <div className="sticky top-0 bg-[var(--t-surface)] border-b z-10 px-6 pt-5 pb-4 flex items-start justify-between" style={{ borderColor: T.border }}>
      <div><h2 className="text-lg font-semibold" style={{ color: T.text }}>{title}</h2>{sub && <div className="text-[13px] mt-0.5" style={{ color: T.text2 }}>{sub}</div>}</div>
      <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--t-hover)]"><X size={18} style={{ color: T.text3 }} /></button>
    </div>
  );
}
function RetentionNote({ type }) {
  const p = RETENTION_POLICY[type];
  return <div className="text-[11px] px-3 py-1.5 rounded-md inline-block" style={{ background: T.subtle, color: T.text3 }}>Retention: {p.hot} hot · {p.cold} cold archive · Auto-purge: {p.purge}</div>;
}

// Cross-log correlation lookup — searches every type's current dataset for a matching
// correlationId, excluding the entry itself. Backs the "Related Entries" section in every
// detail drawer (System/API/Error/Security/Admin Audit all carry correlationId).
function useRelatedEntries(all, correlationId, excludeType, excludeId) {
  return useMemo(() => {
    if (!correlationId) return [];
    const out = [];
    for (const t of ["system", "api", "error", "security", "audit"]) {
      for (const row of all[t]) {
        if (row.correlationId === correlationId && !(t === excludeType && row.id === excludeId)) {
          out.push({ type: t, id: row.id, label: row.message || row.action, timestamp: row.timestamp });
        }
      }
    }
    return out.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [all, correlationId, excludeType, excludeId]);
}
function RelatedEntries({ all, correlationId, excludeType, excludeId, onJump }) {
  const related = useRelatedEntries(all, correlationId, excludeType, excludeId);
  if (!correlationId) return null;
  return (
    <Card><CardHeader title="Related Entries" sub={related.length ? `${related.length} linked via correlation ID` : "Correlation ID has no other matches"} />
      {!!related.length && <CardBody className="space-y-1.5">
        {related.map((r) => (
          <button key={r.type + r.id} onClick={() => onJump(r.type, r.id)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[var(--t-subtle)]" style={{ background: T.subtle }}>
            <span className="text-[12px]" style={{ color: T.text }}><Badge tone="gray">{LOG_TABS.find((t) => t.id === r.type)?.label}</Badge> <span className="ml-2">{r.label}</span></span>
            <ArrowRight size={13} style={{ color: T.text3 }} />
          </button>
        ))}
      </CardBody>}
    </Card>
  );
}

/* ============================================================
   COMMON FILTER BAR
   ============================================================ */
function LogFilterBar({ search, setSearch, searchPlaceholder, dateRange, setDateRange, severity, setSeverity, severityOptions, source, setSource, sourceOptions, sourceLabel = "Source", extra, onExportCSV, onExportJSON }) {
  const [exportOpen, setExportOpen] = useState(false);
  return (
    <div className="flex gap-2 items-center mb-3.5 flex-wrap shrink-0">
      <SearchInput value={search} onChange={setSearch} placeholder={searchPlaceholder} />
      <DateRangeFilter presets={DATE_PRESETS} value={dateRange} onChange={setDateRange} />
      {severityOptions && <MultiSelectFilter label="Severity" options={severityOptions} selected={severity} onChange={setSeverity} />}
      {sourceOptions && (
        <div className="relative">
          <select value={source} onChange={(e) => setSource(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
            <option value="All">{sourceLabel}: All</option>
            {sourceOptions.map((s) => <option key={s} value={s}>{sourceLabel}: {s}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
        </div>
      )}
      {extra}
      <div className="ml-auto relative">
        <Button onClick={() => setExportOpen((o) => !o)} onBlur={() => setTimeout(() => setExportOpen(false), 150)}><Download size={14} /> Export</Button>
        {exportOpen && (
          <div className="absolute right-0 top-10 z-20 w-36 rounded-lg border bg-[var(--t-surface)] py-1 shadow-lg" style={{ borderColor: T.border }}>
            <button onMouseDown={onExportCSV} className="w-full px-3 py-2 text-[13px] text-left hover:bg-[var(--t-subtle)]" style={{ color: T.text }}>Export CSV</button>
            <button onMouseDown={onExportJSON} className="w-full px-3 py-2 text-[13px] text-left hover:bg-[var(--t-subtle)]" style={{ color: T.text }}>Export JSON</button>
          </div>
        )}
      </div>
    </div>
  );
}

const dateLabel = (r) => (r.preset ? r.preset.replace(/\s+/g, "-").toLowerCase() : "all-time");
const distinct = (rows, key) => Array.from(new Set(rows.map((r) => r[key]).filter(Boolean)));

/* ============================================================
   1. SYSTEM LOGS
   ============================================================ */
function SystemLogsTab({ rows, onOpen }) {
  const [search, setSearch] = useState(""); const [dateRange, setDateRange] = useState({ preset: null });
  const [severity, setSeverity] = useState([]); const [source, setSource] = useState("All");
  const [eventType, setEventType] = useState("All"); const [sort, setSort] = useState({ key: "timestamp", dir: "desc" });
  const filtered = useMemo(() => {
    let r = applyLogFilters(rows, { search, searchFields: ["message", "source", "actor"], dateRange, severity, source });
    if (eventType !== "All") r = r.filter((x) => x.eventType === eventType);
    return sortRows(r, sort.key, sort.dir);
  }, [rows, search, dateRange, severity, source, eventType, sort]);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  const eventTypes = distinct(rows, "eventType"), sources = distinct(rows, "source");
  return (
    <>
      <LogFilterBar search={search} setSearch={setSearch} searchPlaceholder="Search message, source, actor…" dateRange={dateRange} setDateRange={setDateRange}
        severity={severity} setSeverity={setSeverity} severityOptions={LOG_LEVELS} source={source} setSource={setSource} sourceOptions={sources} sourceLabel="Module"
        extra={<div className="relative"><select value={eventType} onChange={(e) => setEventType(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Event: All</option>{eventTypes.map((e) => <option key={e} value={e}>{e}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>}
        onExportCSV={() => exportLogs(filtered, "system", "csv", dateLabel(dateRange))} onExportJSON={() => exportLogs(filtered, "system", "json", dateLabel(dateRange))} />
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={[<SortableTh key="t" label="Timestamp" sortKey="timestamp" sort={sort} onChange={setSort} />, "Level", "Source", "Event Type", "Message", "Actor", "Duration"]}>
          {pageRows.map((l) => (
            <tr key={l.id} onClick={() => onOpen("system", l.id)} className="cursor-pointer hover:bg-[#F8F9FC]">
              <Td className="font-mono text-xs" style={{ color: T.text2 }}>{fmtLogTime(l.timestamp)}</Td>
              <Td><LevelBadge level={l.level} /></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{l.source}</Td>
              <Td className="font-mono text-xs">{l.eventType}</Td>
              <Td className="max-w-[320px] truncate">{l.message}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{l.actor}</Td>
              <Td className="text-xs font-mono" style={{ color: T.text3 }}>{l.durationMs != null ? `${l.durationMs.toLocaleString("en-IN")}ms` : "—"}</Td>
            </tr>
          ))}
          {!filtered.length && <tr><Td colSpan={7} className="text-center py-10" style={{ color: T.text3 }}>No system logs match these filters</Td></tr>}
        </Table>
      </Card>
    </>
  );
}
function SystemDetail({ entry }) {
  return (
    <div className="space-y-4">
      <Card><CardHeader title="Event" /><CardBody>
        <DetailRow label="Timestamp">{fmtLogTime(entry.timestamp)}</DetailRow>
        <DetailRow label="Level"><LevelBadge level={entry.level} /></DetailRow>
        <DetailRow label="Source / Module">{entry.source}</DetailRow>
        <DetailRow label="Event Type"><span className="font-mono text-xs">{entry.eventType}</span></DetailRow>
        <DetailRow label="Actor">{entry.actor}</DetailRow>
        <DetailRow label="Duration">{entry.durationMs != null ? `${entry.durationMs.toLocaleString("en-IN")}ms` : "—"}</DetailRow>
        <DetailRow label="Correlation ID"><IdCell value={entry.correlationId} label="correlation ID" /></DetailRow>
        <DetailRow label="Tenant">{entry.tenantId ?? "—"}</DetailRow>
      </CardBody></Card>
      <Card><CardHeader title="Metadata" /><CardBody><JSONBlock data={entry.metadata} /></CardBody></Card>
      <Card><CardHeader title="Raw Payload" /><CardBody><JSONBlock data={entry.rawPayload} /></CardBody></Card>
    </div>
  );
}

/* ============================================================
   2. API LOGS
   ============================================================ */
function ApiLogsTab({ rows, onOpen }) {
  const [search, setSearch] = useState(""); const [dateRange, setDateRange] = useState({ preset: null });
  const [severity, setSeverity] = useState([]); const [client, setClient] = useState("All");
  const [methods, setMethods] = useState([]); const [statusRangeFilter, setStatusRangeFilter] = useState("All");
  const [latencyMin, setLatencyMin] = useState(""); const [errorsOnly, setErrorsOnly] = useState(false);
  const [sort, setSort] = useState({ key: "timestamp", dir: "desc" });
  const filtered = useMemo(() => {
    let r = applyLogFilters(rows, { search, searchFields: ["endpoint", "clientId", "authenticatedUser", "sourceIp"], dateRange, severity, source: client, sourceField: "clientId" });
    if (methods.length) r = r.filter((x) => methods.includes(x.method));
    if (statusRangeFilter !== "All") r = r.filter((x) => statusRange(x.statusCode) === statusRangeFilter);
    if (latencyMin) r = r.filter((x) => x.responseTimeMs > Number(latencyMin));
    if (errorsOnly) r = r.filter((x) => x.statusCode >= 400);
    return sortRows(r, sort.key, sort.dir);
  }, [rows, search, dateRange, severity, client, methods, statusRangeFilter, latencyMin, errorsOnly, sort]);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  const clients = distinct(rows, "clientId");
  const stats = useMemo(() => {
    if (!filtered.length) return { total: 0, errorRate: 0, avg: 0, p95: 0 };
    const times = filtered.map((r) => r.responseTimeMs).sort((a, b) => a - b);
    const errors = filtered.filter((r) => r.statusCode >= 400).length;
    return { total: filtered.length, errorRate: Math.round((errors / filtered.length) * 100), avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length), p95: times[Math.floor(times.length * 0.95)] ?? times[times.length - 1] };
  }, [filtered]);
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Total Requests" value={stats.total.toLocaleString("en-IN")} />
        <Kpi label="Error Rate" value={`${stats.errorRate}%`} trend={stats.errorRate > 10 ? "neg" : "pos"} />
        <Kpi label="Avg Latency" value={`${stats.avg}ms`} />
        <Kpi label="P95 Latency" value={`${stats.p95}ms`} />
      </div>
      <LogFilterBar search={search} setSearch={setSearch} searchPlaceholder="Search endpoint, client, IP…" dateRange={dateRange} setDateRange={setDateRange}
        severity={severity} setSeverity={setSeverity} severityOptions={LOG_LEVELS} source={client} setSource={setClient} sourceOptions={clients} sourceLabel="Client"
        extra={<>
          <MultiSelectFilter label="Method" options={HTTP_METHODS} selected={methods} onChange={setMethods} />
          <div className="relative"><select value={statusRangeFilter} onChange={(e) => setStatusRangeFilter(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Status: All</option>{["2xx", "3xx", "4xx", "5xx"].map((s) => <option key={s} value={s}>{s}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
          <input value={latencyMin} onChange={(e) => setLatencyMin(e.target.value)} placeholder="Latency > ms" type="number" className="w-28 px-2.5 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }} />
          <FilterPill active={errorsOnly} onClick={() => setErrorsOnly((v) => !v)}>Errors only</FilterPill>
        </>}
        onExportCSV={() => exportLogs(filtered, "api", "csv", dateLabel(dateRange))} onExportJSON={() => exportLogs(filtered, "api", "json", dateLabel(dateRange))} />
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={[<SortableTh key="t" label="Timestamp" sortKey="timestamp" sort={sort} onChange={setSort} />, "Method", "Endpoint", "Status", "Response Time", "Client", "Source IP"]}>
          {pageRows.map((l) => (
            <tr key={l.id} onClick={() => onOpen("api", l.id)} className="cursor-pointer hover:bg-[#F8F9FC]">
              <Td className="font-mono text-xs" style={{ color: T.text2 }}>{fmtLogTime(l.timestamp)}</Td>
              <Td><MethodBadge method={l.method} /></Td>
              <Td className="font-mono text-xs max-w-[220px] truncate">{l.endpoint}</Td>
              <Td><StatusCodeBadge code={l.statusCode} /></Td>
              <Td className="text-xs font-mono" style={{ color: l.responseTimeMs > 1000 ? T.danger : T.text2 }}>{l.responseTimeMs}ms</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{l.clientId}</Td>
              <Td className="font-mono text-xs" style={{ color: T.text3 }}>{l.sourceIp}</Td>
            </tr>
          ))}
          {!filtered.length && <tr><Td colSpan={7} className="text-center py-10" style={{ color: T.text3 }}>No API logs match these filters</Td></tr>}
        </Table>
      </Card>
    </>
  );
}
function ApiDetail({ entry }) {
  return (
    <div className="space-y-4">
      <Card><CardHeader title="Request" /><CardBody>
        <DetailRow label="Timestamp">{fmtLogTime(entry.timestamp)}</DetailRow>
        <DetailRow label="Method"><MethodBadge method={entry.method} /></DetailRow>
        <DetailRow label="Endpoint"><span className="font-mono text-xs">{entry.endpoint}</span></DetailRow>
        <DetailRow label="Status"><StatusCodeBadge code={entry.statusCode} /></DetailRow>
        <DetailRow label="Response Time">{entry.responseTimeMs}ms</DetailRow>
        <DetailRow label="Request / Response Size">{entry.requestSize}B / {entry.responseSize}B</DetailRow>
        <DetailRow label="Client">{entry.clientId}</DetailRow>
        <DetailRow label="Authenticated As">{entry.authenticatedUser || "—"}</DetailRow>
        <DetailRow label="Source IP"><IdCell value={entry.sourceIp} label="IP" /></DetailRow>
        <DetailRow label="User Agent"><span className="text-xs">{entry.userAgent}</span></DetailRow>
        <DetailRow label="Correlation ID"><IdCell value={entry.correlationId} label="correlation ID" /></DetailRow>
      </CardBody></Card>
      <Card><CardHeader title="Request Body" sub="Sensitive fields masked" /><CardBody><JSONBlock data={maskSensitive(entry.requestBody) ?? {}} /></CardBody></Card>
      <Card><CardHeader title="Response Body" sub="Sensitive fields masked" /><CardBody><JSONBlock data={maskSensitive(entry.responseBody) ?? {}} /></CardBody></Card>
    </div>
  );
}

/* ============================================================
   3. WEBHOOK LOGS
   ============================================================ */
function WebhookLogsTab({ rows, onOpen, onResend }) {
  const [search, setSearch] = useState(""); const [dateRange, setDateRange] = useState({ preset: null });
  const [status, setStatus] = useState([]); const [eventType, setEventType] = useState("All");
  const [sort, setSort] = useState({ key: "timestamp", dir: "desc" });
  const filtered = useMemo(() => {
    let r = applyLogFilters(rows, { search, searchFields: ["destinationUrl", "eventType"], dateRange });
    if (status.length) r = r.filter((x) => status.includes(x.deliveryStatus));
    if (eventType !== "All") r = r.filter((x) => x.eventType === eventType);
    return sortRows(r, sort.key, sort.dir);
  }, [rows, search, dateRange, status, eventType, sort]);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  const eventTypes = distinct(rows, "eventType");
  return (
    <>
      <LogFilterBar search={search} setSearch={setSearch} searchPlaceholder="Search destination, event…" dateRange={dateRange} setDateRange={setDateRange}
        extra={<>
          <MultiSelectFilter label="Delivery Status" options={DELIVERY_STATUSES} selected={status} onChange={setStatus} />
          <div className="relative"><select value={eventType} onChange={(e) => setEventType(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Event: All</option>{eventTypes.map((e) => <option key={e} value={e}>{e}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
        </>}
        onExportCSV={() => exportLogs(filtered, "webhook", "csv", dateLabel(dateRange))} onExportJSON={() => exportLogs(filtered, "webhook", "json", dateLabel(dateRange))} />
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={[<SortableTh key="t" label="Timestamp" sortKey="timestamp" sort={sort} onChange={setSort} />, "Event Type", "Destination", "Status", "Response Code", "Attempts", "Next Retry", ""]}>
          {pageRows.map((l) => (
            <tr key={l.id} onClick={() => onOpen("webhook", l.id)} className="cursor-pointer hover:bg-[#F8F9FC]">
              <Td className="font-mono text-xs" style={{ color: T.text2 }}>{fmtLogTime(l.timestamp)}</Td>
              <Td className="font-mono text-xs">{l.eventType}</Td>
              <Td className="text-xs max-w-[220px] truncate" style={{ color: T.text2 }}>{l.destinationUrl}</Td>
              <Td><DeliveryBadge status={l.deliveryStatus} /></Td>
              <Td className="text-xs font-mono" style={{ color: T.text3 }}>{l.httpResponseCode ?? "—"}</Td>
              <Td className="text-xs">{l.attemptCount}/{l.maxRetries}</Td>
              <Td className="text-xs font-mono" style={{ color: T.text3 }}>{l.nextRetryAt ? fmtLogTime(l.nextRetryAt) : "—"}</Td>
              <Td>{l.deliveryStatus === "Failed" && <Button size="sm" onClick={(e) => { e.stopPropagation(); onResend(l.id); }}><RefreshCw size={13} /> Resend</Button>}</Td>
            </tr>
          ))}
          {!filtered.length && <tr><Td colSpan={8} className="text-center py-10" style={{ color: T.text3 }}>No webhook logs match these filters</Td></tr>}
        </Table>
      </Card>
    </>
  );
}
function WebhookDetail({ entry, onResend }) {
  return (
    <div className="space-y-4">
      <Card><CardHeader title="Delivery" action={entry.deliveryStatus === "Failed" && <Button size="sm" variant="primary" onClick={() => onResend(entry.id)}><RefreshCw size={13} /> Resend</Button>} />
        <CardBody>
          <DetailRow label="Event Type"><span className="font-mono text-xs">{entry.eventType}</span></DetailRow>
          <DetailRow label="Destination"><span className="text-xs">{entry.destinationUrl}</span></DetailRow>
          <DetailRow label="Status"><DeliveryBadge status={entry.deliveryStatus} /></DetailRow>
          <DetailRow label="Response Code">{entry.httpResponseCode ?? "—"}</DetailRow>
          <DetailRow label="Attempts">{entry.attemptCount}/{entry.maxRetries}</DetailRow>
          <DetailRow label="Next Retry">{entry.nextRetryAt ? fmtLogTime(entry.nextRetryAt) : "—"}</DetailRow>
        </CardBody></Card>
      <Card><CardHeader title="Retry Timeline" /><CardBody className="space-y-2">
        {entry.attempts.length ? entry.attempts.map((a, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5 border-b last:border-0" style={{ borderColor: T.border }}>
            <div className="w-16 text-[11px] font-semibold" style={{ color: T.text3 }}>Attempt {a.attempt}</div>
            <div className="flex-1 text-[13px]" style={{ color: T.text }}>{a.result}</div>
            <div className="text-[11px] font-mono" style={{ color: T.text3 }}>{fmtLogTime(a.at)}{a.latencyMs != null ? ` · ${(a.latencyMs / 1000).toFixed(1)}s` : ""}</div>
          </div>
        )) : <div className="text-[13px] py-2" style={{ color: T.text3 }}>Not yet dispatched</div>}
      </CardBody></Card>
      <Card><CardHeader title="Payload Sent" /><CardBody><JSONBlock data={maskSensitive(entry.payloadSent)} /></CardBody></Card>
      <Card><CardHeader title="Response Body" /><CardBody><JSONBlock data={entry.responseBody || { info: "No response received" }} /></CardBody></Card>
    </div>
  );
}

/* ============================================================
   4. INTEGRATION LOGS
   ============================================================ */
function IntegrationHealthCards({ logs }) {
  const cards = computeIntegrationHealthCards(logs);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4 shrink-0">
      {cards.map((c) => (
        <div key={c.name} className="rounded-lg border px-3 py-2.5 flex items-center justify-between" style={{ borderColor: T.border, background: T.surface }}>
          <div>
            <div className="text-[13px] font-medium flex items-center gap-1.5" style={{ color: T.text }}><HealthDot health={c.health} />{c.name}</div>
            <div className="text-[11px] mt-0.5" style={{ color: T.text3 }}>Last sync: {c.lastSyncMinsAgo != null ? `${c.lastSyncMinsAgo} min ago` : "never"} · {c.failures24h} failure{c.failures24h === 1 ? "" : "s"} (24h)</div>
          </div>
          <Badge tone={INTEGRATION_HEALTH_TONE[c.health]}>{c.health}</Badge>
        </div>
      ))}
    </div>
  );
}
function IntegrationLogsTab({ rows, onOpen, onResync }) {
  const [search, setSearch] = useState(""); const [dateRange, setDateRange] = useState({ preset: null });
  const [integration, setIntegration] = useState("All"); const [status, setStatus] = useState([]);
  const [operation, setOperation] = useState("All"); const [direction, setDirection] = useState("All");
  const [sort, setSort] = useState({ key: "timestamp", dir: "desc" });
  const filtered = useMemo(() => {
    let r = applyLogFilters(rows, { search, searchFields: ["integrationName", "operation", "errorDetail"], dateRange, source: integration, sourceField: "integrationName" });
    if (status.length) r = r.filter((x) => status.includes(x.status));
    if (operation !== "All") r = r.filter((x) => x.operation === operation);
    if (direction !== "All") r = r.filter((x) => x.direction === direction);
    return sortRows(r, sort.key, sort.dir);
  }, [rows, search, dateRange, integration, status, operation, direction, sort]);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  const operations = distinct(rows, "operation");
  return (
    <>
      <IntegrationHealthCards logs={rows} />
      <LogFilterBar search={search} setSearch={setSearch} searchPlaceholder="Search integration, operation, error…" dateRange={dateRange} setDateRange={setDateRange}
        source={integration} setSource={setIntegration} sourceOptions={INTEGRATION_NAMES} sourceLabel="Integration"
        extra={<>
          <MultiSelectFilter label="Status" options={INTEGRATION_STATUSES} selected={status} onChange={setStatus} />
          <div className="relative"><select value={operation} onChange={(e) => setOperation(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Operation: All</option>{operations.map((o) => <option key={o} value={o}>{o}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
          {["All", "Inbound", "Outbound"].map((d) => <FilterPill key={d} active={direction === d} onClick={() => setDirection(d)}>{d}</FilterPill>)}
        </>}
        onExportCSV={() => exportLogs(filtered, "integration", "csv", dateLabel(dateRange))} onExportJSON={() => exportLogs(filtered, "integration", "json", dateLabel(dateRange))} />
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={[<SortableTh key="t" label="Timestamp" sortKey="timestamp" sort={sort} onChange={setSort} />, "Integration", "Direction", "Operation", "Status", "Records", "Duration", ""]}>
          {pageRows.map((l) => (
            <tr key={l.id} onClick={() => onOpen("integration", l.id)} className="cursor-pointer hover:bg-[#F8F9FC]">
              <Td className="font-mono text-xs" style={{ color: T.text2 }}>{fmtLogTime(l.timestamp)}</Td>
              <Td className="font-medium">{l.integrationName}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{l.direction}</Td>
              <Td className="font-mono text-xs">{l.operation}</Td>
              <Td><IntegrationStatusBadge status={l.status} /></Td>
              <Td className="text-xs">{l.recordsProcessed ?? "—"}{l.recordsFailed ? `/${l.recordsProcessed + l.recordsFailed}` : ""}</Td>
              <Td className="text-xs font-mono" style={{ color: T.text3 }}>{l.durationMs != null ? `${(l.durationMs / 1000).toFixed(1)}s` : "—"}</Td>
              <Td>{l.status === "Failed" && <Button size="sm" onClick={(e) => { e.stopPropagation(); onResync(l.id); }}><RefreshCw size={13} /> Re-sync</Button>}</Td>
            </tr>
          ))}
          {!filtered.length && <tr><Td colSpan={8} className="text-center py-10" style={{ color: T.text3 }}>No integration logs match these filters</Td></tr>}
        </Table>
      </Card>
    </>
  );
}
function IntegrationDetail({ entry, onResync }) {
  return (
    <div className="space-y-4">
      <Card><CardHeader title="Sync Run" action={entry.status === "Failed" && <Button size="sm" variant="primary" onClick={() => onResync(entry.id)}><RefreshCw size={13} /> Re-sync</Button>} />
        <CardBody>
          <DetailRow label="Integration">{entry.integrationName}</DetailRow>
          <DetailRow label="Direction">{entry.direction}</DetailRow>
          <DetailRow label="Operation"><span className="font-mono text-xs">{entry.operation}</span></DetailRow>
          <DetailRow label="Status"><IntegrationStatusBadge status={entry.status} /></DetailRow>
          <DetailRow label="Records Processed">{entry.recordsProcessed ?? "—"}</DetailRow>
          <DetailRow label="Records Failed">{entry.recordsFailed}</DetailRow>
          <DetailRow label="Duration">{entry.durationMs != null ? `${(entry.durationMs / 1000).toFixed(1)}s` : "—"}</DetailRow>
          {entry.errorDetail && <DetailRow label="Error Detail"><span style={{ color: T.danger }}>{entry.errorDetail}</span></DetailRow>}
        </CardBody></Card>
    </div>
  );
}

/* ============================================================
   5. SECURITY LOGS
   ============================================================ */
function securityRowStyle(l) {
  if (l.outcome === "Blocked" || l.level === "Critical") return { background: T.dangerSoft };
  if (l.eventType === "mfa.disabled") return { background: T.warningSoft };
  return undefined;
}
function SecurityLogsTab({ rows, annotations, onOpen }) {
  const [search, setSearch] = useState(""); const [dateRange, setDateRange] = useState({ preset: null });
  const [eventType, setEventType] = useState("All"); const [outcome, setOutcome] = useState([]);
  const [highRiskOnly, setHighRiskOnly] = useState(false); const [sort, setSort] = useState({ key: "timestamp", dir: "desc" });
  const filtered = useMemo(() => {
    let r = applyLogFilters(rows, { search, searchFields: ["actor", "sourceIp", "eventType"], dateRange });
    if (eventType !== "All") r = r.filter((x) => x.eventType === eventType);
    if (outcome.length) r = r.filter((x) => outcome.includes(x.outcome));
    if (highRiskOnly) r = r.filter((x) => x.riskScore > 70 || x.level === "Critical");
    return sortRows(r, sort.key, sort.dir);
  }, [rows, search, dateRange, eventType, outcome, highRiskOnly, sort]);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  const eventTypes = distinct(rows, "eventType");
  return (
    <>
      <LogFilterBar search={search} setSearch={setSearch} searchPlaceholder="Search actor, IP, event…" dateRange={dateRange} setDateRange={setDateRange}
        extra={<>
          <div className="relative"><select value={eventType} onChange={(e) => setEventType(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Event: All</option>{eventTypes.map((e) => <option key={e} value={e}>{e}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
          <MultiSelectFilter label="Outcome" options={SECURITY_OUTCOMES} selected={outcome} onChange={setOutcome} />
          <FilterPill active={highRiskOnly} onClick={() => setHighRiskOnly((v) => !v)}><ShieldAlert size={12} className="inline mr-1" />High Risk Only</FilterPill>
        </>}
        onExportCSV={() => exportLogs(filtered, "security", "csv", dateLabel(dateRange))} onExportJSON={() => exportLogs(filtered, "security", "json", dateLabel(dateRange))} />
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={[<SortableTh key="t" label="Timestamp" sortKey="timestamp" sort={sort} onChange={setSort} />, "Event Type", "Actor", "Source IP", "Location", "Outcome", "Device"]}>
          {pageRows.map((l) => (
            <tr key={l.id} onClick={() => onOpen("security", l.id)} className="cursor-pointer hover:brightness-[.98]" style={securityRowStyle(l)}>
              <Td className="font-mono text-xs" style={{ color: T.text2 }}>{fmtLogTime(l.timestamp)}</Td>
              <Td className="font-mono text-xs"><div className="flex items-center gap-1.5">{l.eventType === "ip.blocked" && <ShieldAlert size={13} style={{ color: T.danger }} />}{l.eventType}{!!annotations[l.id]?.length && <Flag size={11} style={{ color: T.warning }} />}</div></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{l.actor || "—"}</Td>
              <Td className="font-mono text-xs" style={{ color: T.text3 }}>{l.sourceIp}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{l.geolocation || "—"}</Td>
              <Td><OutcomeBadge outcome={l.outcome} /></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{l.device || "—"}</Td>
            </tr>
          ))}
          {!filtered.length && <tr><Td colSpan={7} className="text-center py-10" style={{ color: T.text3 }}>No security logs match these filters</Td></tr>}
        </Table>
      </Card>
    </>
  );
}
function SecurityDetail({ entry, annotations, onFlag }) {
  const [note, setNote] = useState("");
  return (
    <div className="space-y-4">
      <Card><CardHeader title="Event" /><CardBody>
        <DetailRow label="Event Type"><span className="font-mono text-xs">{entry.eventType}</span></DetailRow>
        <DetailRow label="Actor">{entry.actor || "unknown"}</DetailRow>
        <DetailRow label="Source IP"><IdCell value={entry.sourceIp} label="IP" /></DetailRow>
        <DetailRow label="Location">{entry.geolocation || "—"}</DetailRow>
        <DetailRow label="Device">{entry.device || "—"}</DetailRow>
        <DetailRow label="Outcome"><OutcomeBadge outcome={entry.outcome} /></DetailRow>
        <DetailRow label="Risk Score"><Progress value={entry.riskScore} w={90} /></DetailRow>
      </CardBody></Card>
      <Card><CardHeader title="Raw Payload" /><CardBody><JSONBlock data={entry.rawPayload} /></CardBody></Card>
      <Card><CardHeader title="Flags / Annotations" sub="Append-only — for follow-up notes, never edits the event" /><CardBody className="space-y-2">
        {annotations.length ? annotations.map((a, i) => (
          <div key={i} className="text-[13px] px-3 py-2 rounded-lg" style={{ background: T.subtle }}><span style={{ color: T.text }}>{a.note}</span><div className="text-[11px] mt-0.5" style={{ color: T.text3 }}>{a.by} · {fmtLogTime(a.at)}</div></div>
        )) : <div className="text-[13px]" style={{ color: T.text3 }}>No flags yet</div>}
        <div className="flex gap-2 pt-1">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a follow-up note…" className="flex-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: T.border, "--tw-ring-color": T.ring }} />
          <Button variant="primary" onClick={() => { if (note.trim()) { onFlag(entry.id, note.trim()); setNote(""); } }}><Flag size={13} /> Flag</Button>
        </div>
      </CardBody></Card>
    </div>
  );
}

/* ============================================================
   6. ERROR LOGS
   ============================================================ */
function ErrorLogsTab({ rows, onOpen }) {
  const [search, setSearch] = useState(""); const [dateRange, setDateRange] = useState({ preset: null });
  const [severity, setSeverity] = useState([]); const [errorType, setErrorType] = useState("All");
  const [source, setSource] = useState("All"); const [resolution, setResolution] = useState("All");
  const [environment, setEnvironment] = useState("All"); const [newOnly, setNewOnly] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());
  const [sort, setSort] = useState({ key: "lastSeen", dir: "desc" });
  const filtered = useMemo(() => {
    let r = applyLogFilters(rows, { search, searchFields: ["message", "errorCode", "source"], dateRange, severity, source, sourceField: "source" });
    if (errorType !== "All") r = r.filter((x) => x.errorType === errorType);
    if (resolution !== "All") r = r.filter((x) => x.resolutionStatus === resolution);
    if (environment !== "All") r = r.filter((x) => x.environment === environment);
    if (newOnly) r = r.filter((x) => x.resolutionStatus === "New");
    return sortRows(r, sort.key, sort.dir);
  }, [rows, search, dateRange, severity, errorType, source, resolution, environment, newOnly, sort]);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  const sources = distinct(rows, "source"), environments = distinct(rows, "environment");
  const toggleExpand = (id) => setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <>
      <LogFilterBar search={search} setSearch={setSearch} searchPlaceholder="Search message, error code…" dateRange={dateRange} setDateRange={setDateRange}
        severity={severity} setSeverity={setSeverity} severityOptions={["Error", "Critical"]} source={source} setSource={setSource} sourceOptions={sources} sourceLabel="Module"
        extra={<>
          <div className="relative"><select value={errorType} onChange={(e) => setErrorType(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Type: All</option>{ERROR_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
          <div className="relative"><select value={resolution} onChange={(e) => setResolution(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Status: All</option>{RESOLUTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
          <div className="relative"><select value={environment} onChange={(e) => setEnvironment(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Env: All</option>{environments.map((e) => <option key={e} value={e}>{e}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
          <FilterPill active={newOnly} onClick={() => setNewOnly((v) => !v)}>New only</FilterPill>
        </>}
        onExportCSV={() => exportLogs(filtered, "error", "csv", dateLabel(dateRange))} onExportJSON={() => exportLogs(filtered, "error", "json", dateLabel(dateRange))} />
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={["", <SortableTh key="t" label="Last Seen" sortKey="lastSeen" sort={sort} onChange={setSort} />, "Severity", "Error Type", "Error Code", "Message", "Source", "Status", "Count"]}>
          {pageRows.map((l) => (
            <React.Fragment key={l.id}>
              <tr onClick={() => onOpen("error", l.id)} className="cursor-pointer hover:bg-[#F8F9FC]" style={l.resolutionStatus === "Resolved" ? { opacity: 0.55 } : undefined}>
                <Td><button onClick={(e) => { e.stopPropagation(); toggleExpand(l.id); }} className="p-0.5">{expanded.has(l.id) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</button></Td>
                <Td className="font-mono text-xs" style={{ color: T.text2 }}>{fmtLogTime(l.lastSeen)}</Td>
                <Td><div className="flex items-center gap-1.5"><LevelBadge level={l.level} />{l.resolutionStatus === "New" && l.level === "Critical" && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.danger }} />}</div></Td>
                <Td className="font-mono text-xs">{l.errorType}</Td>
                <Td className="font-mono text-xs" style={{ color: T.text3 }}>{l.errorCode || "—"}</Td>
                <Td className="max-w-[260px] truncate">{l.message}</Td>
                <Td className="text-xs" style={{ color: T.text2 }}>{l.source}</Td>
                <Td><ResolutionBadge status={l.resolutionStatus} /></Td>
                <Td className="text-xs">{l.occurrenceCount}{l.occurrenceCount > 10 && <Badge tone="warning"> recurring</Badge>}</Td>
              </tr>
              {expanded.has(l.id) && (
                <tr><Td colSpan={9} className="!py-2" style={{ background: T.subtle }}>
                  <div className="pl-8 space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Instances ({l.instances.length} shown of {l.occurrenceCount})</div>
                    {l.instances.map((inst, i) => <div key={i} className="text-[12px] font-mono flex gap-3" style={{ color: T.text2 }}><span>{fmtLogTime(inst.at)}</span><span style={{ color: T.text3 }}>{inst.requestId}</span></div>)}
                  </div>
                </Td></tr>
              )}
            </React.Fragment>
          ))}
          {!filtered.length && <tr><Td colSpan={9} className="text-center py-10" style={{ color: T.text3 }}>No error logs match these filters</Td></tr>}
        </Table>
      </Card>
    </>
  );
}
function ErrorDetail({ entry, onAck, onResolve }) {
  return (
    <div className="space-y-4">
      <Card><CardHeader title="Error" action={<div className="flex gap-2">
        {entry.resolutionStatus !== "Acknowledged" && entry.resolutionStatus !== "Resolved" && <Button size="sm" onClick={() => onAck(entry.id)}>Mark Acknowledged</Button>}
        {entry.resolutionStatus !== "Resolved" && <Button size="sm" variant="primary" onClick={() => onResolve(entry.id)}><CheckCircle2 size={13} /> Mark Resolved</Button>}
      </div>} />
        <CardBody>
          <DetailRow label="Error Type"><span className="font-mono text-xs">{entry.errorType}</span></DetailRow>
          <DetailRow label="Error Code">{entry.errorCode || "—"}</DetailRow>
          <DetailRow label="Environment">{entry.environment}</DetailRow>
          <DetailRow label="Affected Tenant">{entry.affectedTenant || "—"}</DetailRow>
          <DetailRow label="Affected User">{entry.affectedUser || "—"}</DetailRow>
          <DetailRow label="Resolution"><ResolutionBadge status={entry.resolutionStatus} /></DetailRow>
          <DetailRow label="Occurrences">{entry.occurrenceCount} · first {fmtLogTime(entry.firstSeen)} · last {fmtLogTime(entry.lastSeen)}</DetailRow>
          <DetailRow label="Correlation ID"><IdCell value={entry.correlationId} label="correlation ID" /></DetailRow>
          <DetailRow label="Request ID"><IdCell value={entry.requestId} label="request ID" /></DetailRow>
        </CardBody></Card>
      <Card><CardHeader title="Stack Trace" /><CardBody><JSONBlock data={entry.stackTrace} collapsedLines={12} /></CardBody></Card>
    </div>
  );
}

/* ============================================================
   7. ADMIN AUDIT LOG (append-only / immutable)
   ============================================================ */
function DiffTable({ before, after }) {
  if (!before && !after) return null;
  const keys = Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after || {})]));
  return (
    <table className="w-full text-[13px]">
      <thead><tr style={{ color: T.text3 }} className="text-[11px] uppercase tracking-wider"><th className="text-left py-1.5">Field</th><th className="text-left py-1.5">Before</th><th className="text-left py-1.5">After</th></tr></thead>
      <tbody>{keys.map((k) => (
        <tr key={k} style={{ boxShadow: `inset 0 1px 0 ${T.border}` }}>
          <td className="py-1.5 font-medium" style={{ color: T.text }}>{k}</td>
          <td className="py-1.5" style={{ color: T.danger }}>{before?.[k] != null ? String(before[k]) : "—"}</td>
          <td className="py-1.5" style={{ color: T.success }}>{after?.[k] != null ? String(after[k]) : "—"}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}
function AdminAuditTab({ rows, annotationsFor, onOpen, onExport }) {
  const [search, setSearch] = useState(""); const [dateRange, setDateRange] = useState({ preset: null });
  const [actor, setActor] = useState("All"); const [category, setCategory] = useState([]);
  const [action, setAction] = useState("All"); const [targetType, setTargetType] = useState("All");
  const [role, setRole] = useState("All"); const [sort, setSort] = useState({ key: "timestamp", dir: "desc" });
  const filtered = useMemo(() => {
    let r = applyLogFilters(rows, { search, searchFields: ["target", "action", "actor"], dateRange, source: actor, sourceField: "actor" });
    if (category.length) r = r.filter((x) => category.includes(ACTION_CATEGORY_OF[x.action]));
    if (action !== "All") r = r.filter((x) => x.action === action);
    if (targetType !== "All") r = r.filter((x) => x.targetType === targetType);
    if (role !== "All") r = r.filter((x) => x.actorRole === role);
    return sortRows(r, sort.key, sort.dir);
  }, [rows, search, dateRange, actor, category, action, targetType, role, sort]);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  const actors = distinct(rows, "actor"), actions = Object.values(ACTION_TAXONOMY).flat(), targetTypes = distinct(rows, "targetType"), roles = distinct(rows, "actorRole");
  return (
    <>
      <div className="rounded-lg border px-3.5 py-2.5 mb-3 flex items-center gap-2 shrink-0" style={{ borderColor: T.border, background: T.subtle }}>
        <ShieldAlert size={14} style={{ color: T.text3 }} />
        <p className="text-[12px]" style={{ color: T.text2 }}>Append-only — entries can never be edited or deleted, even by Super Admin. Annotations are separate, additive records. <RetentionNote type="audit" /></p>
      </div>
      <LogFilterBar search={search} setSearch={setSearch} searchPlaceholder="Search target, action, actor…" dateRange={dateRange} setDateRange={setDateRange}
        source={actor} setSource={setActor} sourceOptions={actors} sourceLabel="Actor"
        extra={<>
          <MultiSelectFilter label="Category" options={Object.keys(ACTION_TAXONOMY)} selected={category} onChange={setCategory} />
          <div className="relative"><select value={action} onChange={(e) => setAction(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none max-w-[160px]" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Action: All</option>{actions.map((a) => <option key={a} value={a}>{a}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
          <div className="relative"><select value={targetType} onChange={(e) => setTargetType(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Target: All</option>{targetTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
          <div className="relative"><select value={role} onChange={(e) => setRole(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}><option value="All">Role: All</option>{roles.map((r) => <option key={r} value={r}>{r}</option>)}</select><ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} /></div>
        </>}
        onExportCSV={() => onExport(filtered, "csv")} onExportJSON={() => onExport(filtered, "json")} />
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={[<SortableTh key="t" label="Timestamp" sortKey="timestamp" sort={sort} onChange={setSort} />, "Actor", "Role", "Action", "Target", "Category", "IP"]}>
          {pageRows.map((l) => (
            <tr key={l.id} onClick={() => onOpen("audit", l.id)} className="cursor-pointer hover:bg-[#F8F9FC]">
              <Td className="font-mono text-xs" style={{ color: T.text2 }}>{fmtLogTime(l.timestamp)}</Td>
              <Td className="font-medium">{l.actor}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{l.actorRole}</Td>
              <Td className="font-mono text-xs"><div className="flex items-center gap-1.5">{l.action}{SENSITIVE_ADMIN_ACTIONS.has(l.action) && <Badge tone="dangerStrong">Sensitive</Badge>}{!!annotationsFor(l.id).length && <Flag size={11} style={{ color: T.warning }} />}</div></Td>
              <Td className="text-xs max-w-[200px] truncate" style={{ color: T.text2 }}>{l.target}</Td>
              <Td><Badge tone="gray">{ACTION_CATEGORY_OF[l.action]}</Badge></Td>
              <Td className="font-mono text-xs" style={{ color: T.text3 }}>{l.sourceIp}</Td>
            </tr>
          ))}
          {!filtered.length && <tr><Td colSpan={7} className="text-center py-10" style={{ color: T.text3 }}>No audit entries match these filters</Td></tr>}
        </Table>
      </Card>
    </>
  );
}
function AuditDetail({ entry, annotations, onAnnotate }) {
  const [note, setNote] = useState("");
  return (
    <div className="space-y-4">
      <Card><CardHeader title="Action" action={SENSITIVE_ADMIN_ACTIONS.has(entry.action) && <Badge tone="dangerStrong">Sensitive action</Badge>} /><CardBody>
        <DetailRow label="Actor">{entry.actor} ({entry.actorEmail})</DetailRow>
        <DetailRow label="Role">{entry.actorRole}</DetailRow>
        <DetailRow label="Action"><span className="font-mono text-xs">{entry.action}</span></DetailRow>
        <DetailRow label="Category"><Badge tone="gray">{ACTION_CATEGORY_OF[entry.action]}</Badge></DetailRow>
        <DetailRow label="Target">{entry.target} <span style={{ color: T.text3 }}>({entry.targetType})</span></DetailRow>
        <DetailRow label="Source IP"><IdCell value={entry.sourceIp} label="IP" /></DetailRow>
        <DetailRow label="Device">{entry.device}</DetailRow>
        <DetailRow label="Correlation ID"><IdCell value={entry.correlationId} label="correlation ID" /></DetailRow>
      </CardBody></Card>
      {(entry.beforeValues || entry.afterValues) && <Card><CardHeader title="Before / After" /><CardBody><DiffTable before={entry.beforeValues} after={entry.afterValues} /></CardBody></Card>}
      <Card><CardHeader title="Annotations" sub="Append-only reviewer notes — never modifies the entry itself" /><CardBody className="space-y-2">
        {annotations.length ? annotations.map((a, i) => (
          <div key={i} className="text-[13px] px-3 py-2 rounded-lg" style={{ background: T.subtle }}><span style={{ color: T.text }}>{a.note}</span><div className="text-[11px] mt-0.5" style={{ color: T.text3 }}>{a.by} · {fmtLogTime(a.at)}</div></div>
        )) : <div className="text-[13px]" style={{ color: T.text3 }}>No annotations yet</div>}
        <div className="flex gap-2 pt-1">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a reviewer note…" className="flex-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2" style={{ borderColor: T.border, "--tw-ring-color": T.ring }} />
          <Button variant="primary" onClick={() => { if (note.trim()) { onAnnotate(entry.id, note.trim()); setNote(""); } }}>Annotate</Button>
        </div>
      </CardBody></Card>
    </div>
  );
}

/* ============================================================
   PAGE ROOT
   ============================================================ */
const ROLES = Object.keys(LOG_ROLE_ACCESS);

export function LogsPage() {
  const store = useStore();
  const [role, setRole] = useState("Super Admin");
  const allowedTabs = LOG_TABS.filter((t) => LOG_ROLE_ACCESS[role].has(t.id));
  const [tab, setTab] = useState("system");
  useEffect(() => { if (!LOG_ROLE_ACCESS[role].has(tab)) setTab(allowedTabs[0]?.id); }, [role]); // eslint-disable-line

  const [errorLogsRaw, setErrorLogsRaw] = useState(loadErrorLogs);
  const setErrorLogs = (updater) => setErrorLogsRaw((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveErrorLogs(next); return next; });
  const errorLogs = errorLogsRaw;
  const [webhookLogsRaw, setWebhookLogsRaw] = useState(loadWebhookLogs);
  const setWebhookLogs = (updater) => setWebhookLogsRaw((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveWebhookLogs(next); return next; });
  const webhookLogs = webhookLogsRaw;
  const [integrationLogsRaw, setIntegrationLogsRaw] = useState(loadIntegrationLogs);
  const setIntegrationLogs = (updater) => setIntegrationLogsRaw((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveIntegrationLogs(next); return next; });
  const integrationLogs = integrationLogsRaw;
  const [securityAnnotationsRaw, setSecurityAnnotationsRaw] = useState(loadSecurityAnnotations);
  const setSecurityAnnotations = (updater) => setSecurityAnnotationsRaw((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveSecurityAnnotations(next); return next; });
  const securityAnnotations = securityAnnotationsRaw;
  const [auditAnnotationsRaw, setAuditAnnotationsRaw] = useState(loadAuditAnnotations);
  const setAuditAnnotations = (updater) => setAuditAnnotationsRaw((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveAuditAnnotations(next); return next; });
  const auditAnnotations = auditAnnotationsRaw;
  const [auditMetaRaw, setAuditMetaRaw] = useState(loadAuditMetaEntries);
  const setAuditMeta = (updater) => setAuditMetaRaw((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveAuditMetaEntries(next); return next; });
  const auditMeta = auditMetaRaw;

  const allAudit = useMemo(() => [...auditMeta, ...SEED_ADMIN_AUDIT_LOGS].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)), [auditMeta]);
  const all = { system: SEED_SYSTEM_LOGS, api: SEED_API_LOGS, webhook: webhookLogs, integration: integrationLogs, security: SEED_SECURITY_LOGS, error: errorLogs, audit: allAudit };

  const [detail, setDetail] = useState(null); // { type, id }
  const openDetail = (type, id) => setDetail({ type, id });
  const entry = detail ? all[detail.type].find((r) => r.id === detail.id) : null;

  // Actions ---------------------------------------------------------
  const ackError = (id) => { setErrorLogs((ls) => ls.map((l) => l.id === id ? { ...l, resolutionStatus: "Acknowledged" } : l)); store.notify("Error acknowledged"); };
  const resolveError = (id) => { setErrorLogs((ls) => ls.map((l) => l.id === id ? { ...l, resolutionStatus: "Resolved" } : l)); store.notify("Error marked resolved"); };
  const resendWebhook = (id) => {
    setWebhookLogs((ls) => ls.map((l) => {
      if (l.id !== id) return l;
      const attempt = l.attemptCount + 1;
      return { ...l, deliveryStatus: "Delivered", httpResponseCode: 200, attemptCount: attempt, nextRetryAt: null, attempts: [...l.attempts, { attempt, at: new Date(LOGS_NOW).toISOString(), result: "200 OK (manual resend)", latencyMs: 260 }] };
    }));
    store.notify("Webhook resent — delivered");
  };
  const resyncIntegration = (id) => {
    setIntegrationLogs((ls) => {
      const src = ls.find((l) => l.id === id);
      if (!src) return ls;
      const rerun = { ...src, id: `${src.id}-resync-${ls.length}`, timestamp: new Date(LOGS_NOW).toISOString(), status: "Success", recordsProcessed: (src.recordsProcessed || 0) + src.recordsFailed, recordsFailed: 0, errorDetail: null, durationMs: Math.round((src.durationMs || 8000) * 0.8), message: `${src.integrationName} ${src.operation}: manual re-sync succeeded` };
      return [rerun, ...ls];
    });
    store.notify("Re-sync triggered — completed successfully");
  };
  const flagSecurity = (id, note) => { setSecurityAnnotations((a) => ({ ...a, [id]: [...(a[id] || []), { note, by: ADMIN, at: new Date(LOGS_NOW).toISOString() }] })); store.notify("Flagged for follow-up"); };
  const annotateAudit = (id, note) => { setAuditAnnotations((a) => ({ ...a, [id]: [...(a[id] || []), { note, by: ADMIN, at: new Date(LOGS_NOW).toISOString() }] })); store.notify("Annotation added"); };
  const exportAudit = (rows, format) => {
    exportLogs(rows, "admin_audit", format, "filtered");
    setAuditMeta((m) => [{ id: `aud-meta-${m.length}`, timestamp: new Date(LOGS_NOW).toISOString(), actor: ADMIN, actorEmail: "saif@ledsak.com", actorRole: role, action: "data.exported", target: `Admin Audit Log (${format.toUpperCase()})`, targetId: null, targetType: "Report", beforeValues: null, afterValues: { rowCount: rows.length, format }, sourceIp: "103.21.244.9", device: "Chrome · macOS", correlationId: null, message: `Exported Admin Audit Log as ${format.toUpperCase()} (${rows.length} rows)`, level: "Warning", source: "admin-console", tenantId: null, rawPayload: { rowCount: rows.length, format } }, ...m]);
  };

  // Tab badge counts --------------------------------------------------
  const errorBadge = errorLogs.filter((l) => l.resolutionStatus === "New" || l.level === "Critical").length;
  const securityBadge = SEED_SECURITY_LOGS.filter((l) => l.outcome === "Blocked" && LOGS_NOW.getTime() - new Date(l.timestamp).getTime() <= 3600_000).length;
  const webhookBadge = webhookLogs.filter((l) => l.deliveryStatus === "Failed").length;
  const tabBadge = { error: errorBadge, security: securityBadge, webhook: webhookBadge };

  const dEntry = entry;
  const dTitle = detail && { system: "System Event", api: "API Request", webhook: "Webhook Delivery", integration: "Integration Run", security: "Security Event", error: "Error", audit: "Admin Audit Entry" }[detail.type];
  const dSub = dEntry && (dEntry.message || dEntry.action);

  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="Logs & Audit" desc="System, API, webhook, integration, security, error, and admin audit trails — unified" actions={
        <div className="flex items-center gap-2">
          <span className="text-[12px]" style={{ color: T.text3 }}>Viewing as</span>
          <div className="relative">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
          </div>
        </div>
      } />
      <div className="flex gap-0.5 border-b mb-4 shrink-0 flex-wrap" style={{ borderColor: T.border }}>
        {allowedTabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="px-3.5 py-2.5 text-[13px] font-medium -mb-px border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5"
            style={tab === t.id ? { color: T.primary, borderColor: T.primary } : { color: T.text2, borderColor: "transparent" }}>
            {t.label}{!!tabBadge[t.id] && <Badge tone="danger">{tabBadge[t.id]}</Badge>}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        {tab === "system" && <SystemLogsTab rows={all.system} onOpen={openDetail} />}
        {tab === "api" && <ApiLogsTab rows={all.api} onOpen={openDetail} />}
        {tab === "webhook" && <WebhookLogsTab rows={all.webhook} onOpen={openDetail} onResend={resendWebhook} />}
        {tab === "integration" && <IntegrationLogsTab rows={all.integration} onOpen={openDetail} onResync={resyncIntegration} />}
        {tab === "security" && <SecurityLogsTab rows={all.security} annotations={securityAnnotations} onOpen={openDetail} />}
        {tab === "error" && <ErrorLogsTab rows={all.error} onOpen={openDetail} />}
        {tab === "audit" && <AdminAuditTab rows={all.audit} annotationsFor={(id) => auditAnnotations[id] || []} onOpen={openDetail} onExport={exportAudit} />}
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} width={680}>
        {dEntry && (
          <>
            <DrawerHead title={dTitle} sub={dSub} onClose={() => setDetail(null)} />
            <div className="px-6 py-5 space-y-4">
              {detail.type === "system" && <SystemDetail entry={dEntry} />}
              {detail.type === "api" && <ApiDetail entry={dEntry} />}
              {detail.type === "webhook" && <WebhookDetail entry={dEntry} onResend={resendWebhook} />}
              {detail.type === "integration" && <IntegrationDetail entry={dEntry} onResync={resyncIntegration} />}
              {detail.type === "security" && <SecurityDetail entry={dEntry} annotations={securityAnnotations[dEntry.id] || []} onFlag={flagSecurity} />}
              {detail.type === "error" && <ErrorDetail entry={dEntry} onAck={ackError} onResolve={resolveError} />}
              {detail.type === "audit" && <AuditDetail entry={dEntry} annotations={auditAnnotations[dEntry.id] || []} onAnnotate={annotateAudit} />}
              <RelatedEntries all={all} correlationId={dEntry.correlationId} excludeType={detail.type} excludeId={dEntry.id} onJump={(t, id) => { setTab(t); setDetail({ type: t, id }); }} />
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
