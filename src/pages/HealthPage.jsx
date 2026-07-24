import React, { useState, useEffect } from "react";
import {
  RefreshCw, Plus, ChevronDown, ChevronRight, X, CheckCircle2, AlertTriangle, XCircle, Wrench,
  ExternalLink, RotateCcw, Server, Download, Webhook, Clock, Bot, TrendingDown, Target,
  MessageCircle, MessageSquare, Mail, Database, Copy, Zap, Layers, CreditCard, Car, Stethoscope,
  HardDrive, Globe,
} from "lucide-react";
import { T } from "../theme.js";
import { ADMIN } from "../data/constants.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  PageHeader, Button, Kpi, Card, CardHeader, CardBody, Table, Td, Badge, Drawer, Modal, Field,
  Progress, FilterPill, SearchInput,
} from "../components/ui.jsx";
import {
  SEED_SERVICES, SEED_INCIDENTS, SEED_DEPLOYMENTS, SEED_DEPENDENCIES,
  SERVICE_CATEGORIES, SERVICE_STATUSES, SERVICE_STATUS_TONE,
  INCIDENT_SEVERITIES, INCIDENT_SEVERITY_TONE, INCIDENT_STATUSES, INCIDENT_STATUS_TONE,
  DEPLOY_STATUSES, DEPLOY_STATUS_TONE, DEPLOY_ENVIRONMENTS, DEPLOY_ENV_TONE,
  DEP_STATUS_TONE, DEPENDENCY_CATEGORIES, METHOD_TONE, HEALTH_ADMINS,
  API_PERFORMANCE, SLOWEST_ENDPOINTS, DB_METRICS, JOBS_SUMMARY,
  computeOverallStatus, overallStatusTone, computeAvgUptime, countActiveIncidents, countResolvedThisWeek,
  fmtAgo, fmtHealthTs, fmtDuration, nowHealthTs, nextHealthId,
} from "../data/health.js";

/* Per-file icon map (service.icon is a plain string in the data module, resolved here) */
const ICON_MAP = {
  Server, Download, Webhook, Clock, Bot, TrendingDown, Target, MessageCircle, MessageSquare,
  Mail, Database, Copy, Zap, Layers, CreditCard, Car, Stethoscope, HardDrive, Globe,
};

const HEALTH_TABS = ["Status Board", "Performance", "Incidents", "Deployments", "Dependencies"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function svcNamesShort(ids, services) {
  const names = ids.map((id) => services.find((s) => s.id === id)?.name).filter(Boolean);
  return names.length > 2 ? `${names.slice(0, 2).join(", ")} +${names.length - 2}` : names.join(", ") || "—";
}

/* ============================================================
   STATUS BOARD
   ============================================================ */
function UptimeHistoryBar({ history }) {
  const colorFor = { ok: T.success, degraded: T.warning, down: T.danger, maintenance: T.primary };
  const dayDate = (i) => {
    const d = new Date(2026, 4, 13 - (29 - i));
    return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  };
  return (
    <div>
      <div className="flex gap-[3px]">
        {history.map((s, i) => (
          <div key={i} title={`${dayDate(i)} — ${s}`} className="flex-1 h-6 rounded-sm" style={{ background: colorFor[s] }} />
        ))}
      </div>
      <div className="flex justify-between text-[10px] mt-1" style={{ color: T.text3 }}>
        <span>{dayDate(0)}</span><span>{dayDate(29)}</span>
      </div>
    </div>
  );
}

function StatusBoardTab({ services, onOpenDetail }) {
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = services.filter((s) =>
    (category === "All" || s.category === category) &&
    (status === "All" || s.status === status) &&
    (!search || s.name.toLowerCase().includes(search.toLowerCase())));
  const grouped = SERVICE_CATEGORIES.map((cat) => ({ cat, rows: filtered.filter((s) => s.category === cat) })).filter((g) => g.rows.length);
  const rowBg = (s) => s.status === "Degraded" ? T.warningSoft : s.status === "Down" ? T.dangerSoft : s.status === "Maintenance" ? T.primarySoft : undefined;
  const dotColor = (st) => st === "Operational" ? T.success : st === "Degraded" ? T.warning : st === "Down" ? T.danger : T.primary;

  return (
    <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <CardBody className="flex items-center gap-2 flex-wrap !pb-3 shrink-0">
        <div className="relative">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
            <option value="All">All Categories</option>
            {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
        </div>
        {["All", ...SERVICE_STATUSES].map((s) => <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>{s}</FilterPill>)}
        <SearchInput value={search} onChange={setSearch} placeholder="Search services..." />
      </CardBody>
      <Table head={["Service", "Category", "Status", "Uptime (30d)", "P95 Latency", "Last Checked", ""]}>
        {grouped.map((g) => (
          <React.Fragment key={g.cat}>
            <tr><Td colSpan={7} className="!py-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ background: T.subtle, color: T.text3 }}>{g.cat}</Td></tr>
            {g.rows.map((s) => {
              const Icon = ICON_MAP[s.icon] || Server;
              return (
                <tr key={s.id} className="cursor-pointer hover:brightness-[.98]" style={{ background: rowBg(s) }} onClick={() => onOpenDetail(s.id)}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.subtle }}><Icon size={14} style={{ color: T.text2 }} /></div>
                      <div><div className="font-medium" style={{ color: T.text }}>{s.name}</div><div className="text-[11px] truncate max-w-[260px]" style={{ color: T.text3 }}>{s.description}</div></div>
                    </div>
                  </Td>
                  <Td><Badge tone="gray">{s.category}</Badge></Td>
                  <Td><div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor(s.status) }} /><Badge tone={SERVICE_STATUS_TONE[s.status]}>{s.status}</Badge></div></Td>
                  <Td style={{ color: s.uptime30d < 99 ? T.danger : s.uptime30d < 99.5 ? T.warning : T.text, fontWeight: 600 }}>{s.uptime30d}%</Td>
                  <Td style={{ color: s.latencyP95 == null ? T.text3 : s.latencyP95 > 1000 ? T.danger : s.latencyP95 > 500 ? T.warning : T.text2 }}>{s.latencyP95 != null ? `${s.latencyP95}ms` : "—"}</Td>
                  <Td style={{ color: s.lastCheckedMinutesAgo > 60 ? T.danger : T.text2 }}>{fmtAgo(s.lastCheckedMinutesAgo)}</Td>
                  <Td><Button size="sm" onClick={(e) => { e.stopPropagation(); onOpenDetail(s.id); }}>Details</Button></Td>
                </tr>
              );
            })}
          </React.Fragment>
        ))}
      </Table>
    </Card>
  );
}

function ServiceDetailDrawer({ service, services, incidents, onClose, onCheckNow, onOpenIncident, go }) {
  if (!service) return null;
  const deps = service.dependencies.map((id) => services.find((s) => s.id === id)).filter(Boolean);
  const dependents = services.filter((s) => s.dependencies.includes(service.id));
  const related = incidents.filter((i) => i.affectedServices.includes(service.id));
  const Icon = ICON_MAP[service.icon] || Server;
  return (
    <Drawer open={!!service} onClose={onClose} width={520}>
      <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: T.border }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.subtle }}><Icon size={16} style={{ color: T.text2 }} /></div>
            <h2 className="text-[16px] font-semibold" style={{ color: T.text }}>{service.name}</h2>
          </div>
          <div className="flex items-center gap-1.5 mb-1.5"><Badge tone={SERVICE_STATUS_TONE[service.status]}>{service.status}</Badge><Badge tone="gray">{service.category}</Badge></div>
          <p className="text-[12.5px]" style={{ color: T.text2 }}>{service.description}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--t-hover)] shrink-0"><X size={16} style={{ color: T.text3 }} /></button>
      </div>
      <div className="px-5 py-4 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Uptime (30d)">{service.uptime30d}%</Field>
          <Field label="P95 Latency">{service.latencyP95 != null ? `${service.latencyP95}ms` : "—"}</Field>
          <Field label="Last Checked">{fmtAgo(service.lastCheckedMinutesAgo)}</Field>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>30-Day Uptime History</div>
          <UptimeHistoryBar history={service.uptimeHistory} />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Dependencies</div>
          {deps.length === 0 ? <div className="text-[12.5px]" style={{ color: T.text3 }}>None</div> : (
            <div className="space-y-1.5">{deps.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-[13px]"><span style={{ color: T.text }}>{d.name}</span><Badge tone={SERVICE_STATUS_TONE[d.status]}>{d.status}</Badge></div>
            ))}</div>
          )}
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Dependents</div>
          {dependents.length === 0 ? <div className="text-[12.5px]" style={{ color: T.text3 }}>None</div> : (
            <div className="space-y-1.5">{dependents.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-[13px]"><span style={{ color: T.text }}>{d.name}</span><Badge tone={SERVICE_STATUS_TONE[d.status]}>{d.status}</Badge></div>
            ))}</div>
          )}
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Recent Incidents</div>
          {related.length === 0 ? <div className="text-[12.5px]" style={{ color: T.text3 }}>No related incidents</div> : (
            <div className="space-y-2">{related.map((inc) => (
              <button key={inc.id} onClick={() => onOpenIncident(inc.id)} className="w-full text-left rounded-lg border p-2.5 hover:bg-[var(--t-subtle)]" style={{ borderColor: T.border }}>
                <div className="flex items-center justify-between gap-2"><span className="text-[12.5px] font-medium" style={{ color: T.text }}>{inc.title}</span><Badge tone={INCIDENT_STATUS_TONE[inc.status]}>{inc.status}</Badge></div>
              </button>
            ))}</div>
          )}
        </div>
        <div className="flex gap-2 pt-3 border-t" style={{ borderColor: T.border }}>
          <Button onClick={() => onCheckNow(service.id)}><RefreshCw size={14} />Check Now</Button>
          <Button variant="ghost" onClick={() => go && go("logs")}>View Logs →</Button>
        </div>
      </div>
    </Drawer>
  );
}

/* ============================================================
   PERFORMANCE
   ============================================================ */
function PerformanceTab({ go }) {
  const dbConnPct = Math.round((DB_METRICS.primaryConnections.current / DB_METRICS.primaryConnections.max) * 100);
  const redisMemPct = Math.round((DB_METRICS.redisMemory.current / DB_METRICS.redisMemory.max) * 100);
  const lagSec = parseFloat(DB_METRICS.replicaLag);
  const lagTone = lagSec < 1 ? "success" : lagSec < 5 ? "warning" : "danger";
  const cacheTone = DB_METRICS.cacheHitRate > 90 ? "success" : DB_METRICS.cacheHitRate > 80 ? "warning" : "danger";
  const slowQTone = DB_METRICS.slowQueries24h > 0 ? "warning" : "success";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="API Performance" sub="Last 24 hours" />
        <CardBody>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Kpi label="Requests (24h)" value={API_PERFORMANCE.requests24h.toLocaleString("en-IN")} sub="+8%" trend="pos" />
            <Kpi label="Avg Response Time" value={`${API_PERFORMANCE.avgResponseTime}ms`} sub="stable" />
            <Kpi label="P95 Latency" value={`${API_PERFORMANCE.p95Latency}ms`} sub="+12ms" trend="warn" />
            <Kpi label="P99 Latency" value={`${API_PERFORMANCE.p99Latency.toLocaleString("en-IN")}ms`} sub="⚠ spike" trend="neg" />
            <Kpi label="Error Rate" value={`${API_PERFORMANCE.errorRate}%`} sub="stable" />
            <Kpi label="Peak Throughput" value={`${API_PERFORMANCE.peakThroughput.toLocaleString("en-IN")} req/min`} sub="—" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Slowest Endpoints" sub="Sorted by average latency, last 24h" />
        <Table head={["Method", "Endpoint", "Avg Latency", "P95", "Calls (24h)", "Error %"]}>
          {[...SLOWEST_ENDPOINTS].sort((a, b) => b.avgLatency - a.avgLatency).map((e, i) => (
            <tr key={i} className="hover:bg-[var(--t-hover)]">
              <Td><Badge tone={METHOD_TONE[e.method]}>{e.method}</Badge></Td>
              <Td className="font-mono text-[12.5px]" style={{ color: T.text }}>{e.endpoint}</Td>
              <Td style={{ color: e.avgLatency > 1000 ? T.danger : e.avgLatency > 500 ? T.warning : T.text, fontWeight: 600 }}>{e.avgLatency}ms</Td>
              <Td style={{ color: e.p95 > 1000 ? T.danger : e.p95 > 500 ? T.warning : T.text2 }}>{e.p95}ms</Td>
              <Td style={{ color: T.text2 }}>{e.calls24h.toLocaleString("en-IN")}</Td>
              <Td style={{ color: e.errorPct > 1 ? T.danger : e.errorPct > 0.5 ? T.warning : T.text2 }}>{e.errorPct}%</Td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card>
        <CardHeader title="Database & Cache" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-center justify-between"><span className="text-[13px]" style={{ color: T.text }}>Primary Connections</span><div className="flex items-center gap-2"><Progress value={dbConnPct} /><span className="text-[12px]" style={{ color: T.text2 }}>{DB_METRICS.primaryConnections.current} / {DB_METRICS.primaryConnections.max}</span><Badge tone="success">OK</Badge></div></div>
            <div className="flex items-center justify-between"><span className="text-[13px]" style={{ color: T.text }}>Replica Lag</span><Badge tone={lagTone}>{DB_METRICS.replicaLag} · {lagTone === "success" ? "OK" : lagTone === "warning" ? "Elevated" : "Critical"}</Badge></div>
            <div className="flex items-center justify-between"><span className="text-[13px]" style={{ color: T.text }}>Query P95</span><Badge tone="success">{DB_METRICS.queryP95}ms · OK</Badge></div>
            <div className="flex items-center justify-between"><span className="text-[13px]" style={{ color: T.text }}>Slow Queries (24h)</span><Badge tone={slowQTone}>{DB_METRICS.slowQueries24h}{slowQTone === "warning" ? " · Review" : " · OK"}</Badge></div>
            <div className="flex items-center justify-between"><span className="text-[13px]" style={{ color: T.text }}>Cache Hit Rate</span><Badge tone={cacheTone}>{DB_METRICS.cacheHitRate}% · {cacheTone === "success" ? "OK" : cacheTone === "warning" ? "Watch" : "Low"}</Badge></div>
            <div className="flex items-center justify-between"><span className="text-[13px]" style={{ color: T.text }}>Redis Memory</span><div className="flex items-center gap-2"><Progress value={redisMemPct} /><span className="text-[12px]" style={{ color: T.text2 }}>{DB_METRICS.redisMemory.current} / {DB_METRICS.redisMemory.max} GB</span><Badge tone="success">OK</Badge></div></div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[13.5px] font-semibold" style={{ color: T.text }}>Background Jobs</div>
            <div className="text-[12px] mt-1" style={{ color: T.text2 }}>{JOBS_SUMMARY.completed24h} completed · {JOBS_SUMMARY.waiting} waiting · {JOBS_SUMMARY.failed} failed (24h)</div>
            <div className="text-[12px] mt-1 flex items-center gap-1.5" style={{ color: T.text2 }}>BullMQ workers: <Badge tone="success">Operational</Badge></div>
          </div>
          <Button onClick={() => go && go("queues")}>Queue Monitor <ChevronRight size={14} /></Button>
        </CardBody>
      </Card>
    </div>
  );
}

/* ============================================================
   INCIDENTS
   ============================================================ */
function IncidentTimeline({ timeline, isOpen }) {
  return (
    <div className="space-y-4">
      {timeline.map((t, i) => {
        const isLast = i === timeline.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center pt-1 shrink-0">
              <span className={isLast && isOpen ? "animate-pulse" : ""} style={{ width: 10, height: 10, borderRadius: "50%", background: isLast && isOpen ? T.danger : T.primary, display: "block" }} />
              {i < timeline.length - 1 && <span className="w-px flex-1 mt-1" style={{ background: T.border }} />}
            </div>
            <div className="pb-1">
              <div className="text-[12px]"><span className="font-semibold" style={{ color: T.text }}>{fmtHealthTs(t.timestamp)}</span> <span style={{ color: T.text3 }}>— {t.actor}</span></div>
              <div className="text-[13px] mt-0.5" style={{ color: T.text2 }}>{t.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IncidentDetailDrawer({ incident, services, autoNote, onClose, onAddNote, onEscalate, onChangeOwner, onResolve }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  useEffect(() => { if (incident) { setNoteOpen(!!autoNote); setNoteText(""); } }, [incident?.id, autoNote]); // eslint-disable-line
  if (!incident) return null;
  const affected = incident.affectedServices.map((id) => services.find((s) => s.id === id)).filter(Boolean);
  const isOpen = incident.status === "Active" || incident.status === "Investigating";
  return (
    <Drawer open={!!incident} onClose={onClose} width={580}>
      <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: T.border }}>
        <div>
          <h2 className="text-[16px] font-semibold mb-1.5" style={{ color: T.text }}>{incident.title}</h2>
          <div className="flex items-center gap-1.5"><Badge tone={INCIDENT_SEVERITY_TONE[incident.severity]}>{incident.severity}</Badge><Badge tone={INCIDENT_STATUS_TONE[incident.status]}>{incident.status}</Badge></div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--t-hover)] shrink-0"><X size={16} style={{ color: T.text3 }} /></button>
      </div>
      <div className="px-5 py-4 space-y-5">
        <p className="text-[13px]" style={{ color: T.text2 }}>{incident.description}</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Started">{fmtHealthTs(incident.startedAt)}</Field>
          <Field label="Duration">{isOpen ? `${fmtDuration(incident.startedAt, null)} (ongoing)` : fmtDuration(incident.startedAt, incident.resolvedAt)}</Field>
          <Field label="Owner">{incident.owner}</Field>
          <Field label="Created By">{incident.createdBy}</Field>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Affected Services</div>
          <div className="flex flex-wrap gap-1.5">{affected.map((s) => <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-0.5 text-[12px]" style={{ background: T.subtle, color: T.text }}><Badge tone={SERVICE_STATUS_TONE[s.status]}>{s.status}</Badge>{s.name}</span>)}</div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: T.text3 }}>Timeline</div>
          <IncidentTimeline timeline={incident.timeline} isOpen={isOpen} />
        </div>
        <div className="pt-3 border-t space-y-3" style={{ borderColor: T.border }}>
          {!noteOpen ? (
            <Button size="sm" onClick={() => setNoteOpen(true)}>Add Note</Button>
          ) : (
            <div className="space-y-2">
              <textarea autoFocus value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} placeholder="Add a note..." className="w-full px-2.5 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: T.border }} />
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={() => { if (noteText.trim()) { onAddNote(incident.id, noteText.trim()); setNoteText(""); setNoteOpen(false); } }}>Submit</Button>
                <Button size="sm" variant="ghost" onClick={() => { setNoteOpen(false); setNoteText(""); }}>Cancel</Button>
              </div>
            </div>
          )}
          {isOpen && (
            <div className="flex items-center gap-4 flex-wrap pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]" style={{ color: T.text3 }}>Escalate:</span>
                <select value={incident.severity} onChange={(e) => onEscalate(incident.id, e.target.value)} className="px-2 py-1 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
                  {INCIDENT_SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]" style={{ color: T.text3 }}>Owner:</span>
                <select value={incident.owner} onChange={(e) => onChangeOwner(incident.id, e.target.value)} className="px-2 py-1 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
                  {HEALTH_ADMINS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <Button size="sm" variant="primary" onClick={() => onResolve(incident.id)}>Mark Resolved</Button>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

function CreateIncidentModal({ open, services, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [affected, setAffected] = useState([]);
  const [owner, setOwner] = useState(HEALTH_ADMINS[0]);
  useEffect(() => { if (open) { setTitle(""); setDescription(""); setSeverity("Medium"); setAffected([]); setOwner(HEALTH_ADMINS[0]); } }, [open]);
  const toggle = (id) => setAffected((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const canSubmit = title.trim() && description.trim();
  const inputCls = "w-full mt-1 px-2.5 py-2 rounded-lg border text-[13px] outline-none";
  return (
    <Modal open={open} onClose={onClose} title="Create Incident" footer={<>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="primary" disabled={!canSubmit} onClick={() => onCreate({ title: title.trim(), description: description.trim(), severity, affectedServices: affected, owner })}>Create Incident</Button>
    </>}>
      <div className="space-y-3">
        <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} style={{ borderColor: T.border }} /></div>
        <div><label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Description</label><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} style={{ borderColor: T.border }} /></div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={inputCls} style={{ borderColor: T.border, background: T.surface, color: T.text }}>
            {INCIDENT_SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Affected Services</label>
          <div className="mt-1.5 max-h-40 overflow-y-auto rounded-lg border p-2 space-y-1" style={{ borderColor: T.border }}>
            {services.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-[13px] cursor-pointer" style={{ color: T.text }}>
                <input type="checkbox" checked={affected.includes(s.id)} onChange={() => toggle(s.id)} style={{ accentColor: T.primary }} />{s.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Owner</label>
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className={inputCls} style={{ borderColor: T.border, background: T.surface, color: T.text }}>
            {HEALTH_ADMINS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}

function IncidentsTab({ incidents, services, onOpenDetail, onQuickResolve }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const activeIncidents = incidents.filter((i) => i.status === "Active" || i.status === "Investigating");
  const filtered = incidents
    .filter((i) => (statusFilter === "All" || i.status === statusFilter) && (severityFilter === "All" || i.severity === severityFilter) && (!search || i.title.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => fmtHealthTs(b.startedAt).localeCompare(fmtHealthTs(a.startedAt)) || b.startedAt.localeCompare(a.startedAt));

  return (
    <div className="space-y-4">
      {activeIncidents.length === 0 ? (
        <Card><CardBody className="flex items-center gap-2.5"><CheckCircle2 size={18} style={{ color: T.success }} /><span className="text-[13px] font-medium" style={{ color: T.text }}>No active incidents</span></CardBody></Card>
      ) : activeIncidents.map((inc) => {
        const isActive = inc.status === "Active";
        const bg = isActive ? T.dangerSoft : T.warningSoft;
        const fg = isActive ? T.danger : T.warning;
        return (
          <Card key={inc.id} style={{ background: bg, borderColor: fg }}>
            <CardBody className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1"><AlertTriangle size={15} style={{ color: fg }} /><span className="text-[13px] font-semibold" style={{ color: fg }}>{isActive ? "ACTIVE" : "INVESTIGATING"}: {inc.title}</span></div>
                <div className="text-[12px]" style={{ color: T.text2 }}>Started {fmtDuration(inc.startedAt, null)} ago · {inc.severity} · Owner: {inc.owner} · Affected: {svcNamesShort(inc.affectedServices, services)}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => onOpenDetail(inc.id)}>View Timeline</Button>
                <Button size="sm" onClick={() => onOpenDetail(inc.id, true)}>Add Note</Button>
                <Button size="sm" variant="primary" onClick={() => onQuickResolve(inc.id)}>Mark Resolved</Button>
              </div>
            </CardBody>
          </Card>
        );
      })}

      <Card>
        <CardHeader title="Incident History" />
        <CardBody className="flex items-center gap-2 flex-wrap !pb-3">
          {["All", ...INCIDENT_STATUSES].map((s) => <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</FilterPill>)}
          <div className="w-px h-5" style={{ background: T.border }} />
          {["All", ...INCIDENT_SEVERITIES].map((s) => <FilterPill key={s} active={severityFilter === s} onClick={() => setSeverityFilter(s)}>{s}</FilterPill>)}
          <SearchInput value={search} onChange={setSearch} placeholder="Search incidents..." />
        </CardBody>
        <Table head={["Timestamp", "Title", "Services", "Severity", "Duration", "Status", "Owner", ""]}>
          {filtered.map((inc) => (
            <tr key={inc.id} className="hover:bg-[var(--t-hover)] cursor-pointer" onClick={() => onOpenDetail(inc.id)}>
              <Td className="whitespace-nowrap text-[12px]" style={{ color: T.text2 }}>{fmtHealthTs(inc.startedAt)}</Td>
              <Td className="font-medium" style={{ color: T.primary }}>{inc.title}</Td>
              <Td className="text-[12px]" style={{ color: T.text2 }}>{svcNamesShort(inc.affectedServices, services)}</Td>
              <Td><Badge tone={INCIDENT_SEVERITY_TONE[inc.severity]}>{inc.severity}</Badge></Td>
              <Td>{inc.status === "Active" || inc.status === "Investigating" ? "Ongoing" : fmtDuration(inc.startedAt, inc.resolvedAt)}</Td>
              <Td><Badge tone={INCIDENT_STATUS_TONE[inc.status]}>{inc.status}</Badge></Td>
              <Td>{inc.owner}</Td>
              <Td><ChevronRight size={14} style={{ color: T.text3 }} /></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

/* ============================================================
   DEPLOYMENTS
   ============================================================ */
function DeploymentDetailDrawer({ deployment, incidents, onClose, onRollback, onOpenIncident }) {
  if (!deployment) return null;
  const linked = deployment.linkedIncidentId ? incidents.find((i) => i.id === deployment.linkedIncidentId) : null;
  const canRollback = deployment.status === "Success";
  return (
    <Drawer open={!!deployment} onClose={onClose} width={560}>
      <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: T.border }}>
        <div>
          <div className="font-mono text-[20px] font-bold" style={{ color: T.text }}>{deployment.version}</div>
          <div className="flex items-center gap-1.5 mt-1.5"><Badge tone={DEPLOY_ENV_TONE[deployment.environment]}>{deployment.environment}</Badge><Badge tone={DEPLOY_STATUS_TONE[deployment.status]}>{deployment.status}</Badge></div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--t-hover)] shrink-0"><X size={16} style={{ color: T.text3 }} /></button>
      </div>
      <div className="px-5 py-4 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Deployed By">{deployment.deployedBy}</Field>
          <Field label="Timestamp">{fmtHealthTs(deployment.timestamp)}</Field>
          <Field label="Duration">{deployment.duration}</Field>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Affected Services</div>
          <div className="flex flex-wrap gap-1.5">{deployment.services.map((s) => <Badge key={s} tone="gray">{s}</Badge>)}</div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Changelog</div>
          <p className="text-[13px]" style={{ color: T.text2 }}>{deployment.changelog}</p>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Post-Deploy Health</div>
          <table className="w-full text-[12.5px] border-separate" style={{ borderSpacing: 0 }}>
            <thead><tr>
              <th className="text-left px-2 py-1.5" style={{ color: T.text3, boxShadow: `inset 0 -1px 0 ${T.border}` }}>Metric</th>
              <th className="text-left px-2 py-1.5" style={{ color: T.text3, boxShadow: `inset 0 -1px 0 ${T.border}` }}>Before</th>
              <th className="text-left px-2 py-1.5" style={{ color: T.text3, boxShadow: `inset 0 -1px 0 ${T.border}` }}>After</th>
            </tr></thead>
            <tbody>
              {Object.keys(deployment.postDeployHealth.before).map((k) => {
                const after = deployment.postDeployHealth.after[k];
                const worse = String(after).includes("⚠");
                return (
                  <tr key={k}>
                    <td className="px-2 py-1.5" style={{ color: T.text, boxShadow: `inset 0 -1px 0 ${T.border}` }}>{k}</td>
                    <td className="px-2 py-1.5" style={{ color: T.text2, boxShadow: `inset 0 -1px 0 ${T.border}` }}>{deployment.postDeployHealth.before[k]}</td>
                    <td className="px-2 py-1.5" style={{ color: worse ? T.danger : T.text2, fontWeight: worse ? 600 : 400, boxShadow: `inset 0 -1px 0 ${T.border}` }}>{after}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {linked && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.text3 }}>Linked Incident</div>
            <button onClick={() => onOpenIncident(linked.id)} className="w-full text-left rounded-lg border p-2.5 hover:bg-[var(--t-subtle)]" style={{ borderColor: T.border }}>
              <div className="flex items-center justify-between gap-2"><span className="text-[13px] font-medium" style={{ color: T.primary }}>{linked.title}</span><Badge tone={INCIDENT_STATUS_TONE[linked.status]}>{linked.status}</Badge></div>
            </button>
          </div>
        )}
        <div className="pt-3 border-t flex items-center gap-2" style={{ borderColor: T.border }}>
          <Button variant="danger" disabled={!canRollback} onClick={() => onRollback(deployment.id)}><RotateCcw size={14} />Rollback</Button>
          {!canRollback && <span className="text-[11px]" style={{ color: T.text3 }}>{deployment.status === "Rolled Back" ? "Already rolled back" : "Not eligible for rollback"}</span>}
        </div>
      </div>
    </Drawer>
  );
}

function DeploymentsTab({ deployments, onOpenDetail }) {
  const [envFilter, setEnvFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = deployments.filter((d) =>
    (envFilter === "All" || d.environment === envFilter) &&
    (statusFilter === "All" || d.status === statusFilter) &&
    (!search || d.version.toLowerCase().includes(search.toLowerCase()) || d.changelog.toLowerCase().includes(search.toLowerCase())));
  return (
    <Card>
      <CardHeader title="Deployment History" sub="Read-only — deployments originate from CI/CD" />
      <CardBody className="flex items-center gap-2 flex-wrap !pb-3">
        {["All", ...DEPLOY_ENVIRONMENTS].map((e) => <FilterPill key={e} active={envFilter === e} onClick={() => setEnvFilter(e)}>{e}</FilterPill>)}
        <div className="w-px h-5" style={{ background: T.border }} />
        {["All", ...DEPLOY_STATUSES].map((s) => <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</FilterPill>)}
        <SearchInput value={search} onChange={setSearch} placeholder="Search version or changelog..." />
      </CardBody>
      <Table head={["Timestamp", "Version", "Environment", "Deployed By", "Duration", "Status", "Services", "Changelog"]}>
        {filtered.map((d) => (
          <tr key={d.id} className="hover:bg-[var(--t-hover)] cursor-pointer" onClick={() => onOpenDetail(d.id)}>
            <Td className="whitespace-nowrap text-[12px]" style={{ color: T.text2 }}>{fmtHealthTs(d.timestamp)}</Td>
            <Td className="font-mono font-semibold" style={{ color: T.text }}>{d.version}</Td>
            <Td><Badge tone={DEPLOY_ENV_TONE[d.environment]}>{d.environment}</Badge></Td>
            <Td>{d.deployedBy}</Td>
            <Td>{d.duration}</Td>
            <Td><Badge tone={DEPLOY_STATUS_TONE[d.status]}>{d.status}</Badge></Td>
            <Td className="text-[12px]" style={{ color: T.text2 }}>{d.services.slice(0, 2).join(", ")}{d.services.length > 2 ? ` +${d.services.length - 2}` : ""}</Td>
            <Td className="text-[12px] max-w-[220px] truncate" style={{ color: T.text2 }}>{d.changelog}</Td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

/* ============================================================
   DEPENDENCIES
   ============================================================ */
function DependencyCard({ dep, onCheckNow }) {
  const accent = dep.status === "Down" ? T.danger : dep.status === "Slow" ? T.warning : null;
  const pctIncrease = dep.currentLatency && dep.baselineLatency ? Math.round(((dep.currentLatency - dep.baselineLatency) / dep.baselineLatency) * 100) : null;
  const showSpike = pctIncrease != null && dep.currentLatency > dep.baselineLatency * 1.5;
  return (
    <Card style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}>
      <CardBody className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div><div className="text-[13.5px] font-semibold" style={{ color: T.text }}>{dep.name}</div><div className="text-[11px]" style={{ color: T.text3 }}>{dep.category}</div></div>
          <Badge tone={DEP_STATUS_TONE[dep.status]}>{dep.status}</Badge>
        </div>
        <div className="text-[12.5px]" style={{ color: T.text2 }}>
          Latency: {dep.currentLatency != null ? `${dep.currentLatency}ms` : "—"} (baseline: {dep.baselineLatency}ms)
          {showSpike && <span className="ml-1.5 font-semibold" style={{ color: T.danger }}>▲ {pctIncrease}%</span>}
        </div>
        <div className="text-[11px]" style={{ color: T.text3 }}>Last checked: {fmtAgo(dep.lastCheckedMinutesAgo)}</div>
        {dep.note && <div className="text-[11.5px] rounded-md px-2 py-1.5" style={{ background: T.subtle, color: T.text2 }}>{dep.note}</div>}
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.text3 }}>Used by</div>
          <div className="text-[12px]" style={{ color: T.text }}>{dep.dependents.join(" · ")}</div>
        </div>
        <div className="flex gap-2 pt-1">
          <a href={dep.statusPageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium border" style={{ borderColor: T.border, color: T.text }}>Status Page <ExternalLink size={12} /></a>
          <Button size="sm" onClick={() => onCheckNow(dep.id)}>Check Now</Button>
        </div>
      </CardBody>
    </Card>
  );
}

function DependenciesTab({ dependencies, onCheckNow }) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = dependencies.filter((d) => (category === "All" || d.category === category) && (!search || d.name.toLowerCase().includes(search.toLowerCase())));
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {["All", ...DEPENDENCY_CATEGORIES].map((c) => <FilterPill key={c} active={category === c} onClick={() => setCategory(c)}>{c}</FilterPill>)}
        <SearchInput value={search} onChange={setSearch} placeholder="Search dependencies..." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((d) => <DependencyCard key={d.id} dep={d} onCheckNow={onCheckNow} />)}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export function HealthPage({ go }) {
  const store = useStore();
  const [services, setServices] = useState(SEED_SERVICES);
  const [incidents, setIncidents] = useState(SEED_INCIDENTS);
  const [deployments, setDeployments] = useState(SEED_DEPLOYMENTS);
  const [dependencies, setDependencies] = useState(SEED_DEPENDENCIES);
  const [tab, setTab] = useState("Status Board");
  const [refreshedAgo, setRefreshedAgo] = useState(2);

  const [serviceDetailId, setServiceDetailId] = useState(null);
  const [incidentDetailId, setIncidentDetailId] = useState(null);
  const [incidentAutoNote, setIncidentAutoNote] = useState(false);
  const [deployDetailId, setDeployDetailId] = useState(null);
  const [createIncidentOpen, setCreateIncidentOpen] = useState(false);

  const serviceDetail = serviceDetailId ? services.find((s) => s.id === serviceDetailId) : null;
  const incidentDetail = incidentDetailId ? incidents.find((i) => i.id === incidentDetailId) : null;
  const deployDetail = deployDetailId ? deployments.find((d) => d.id === deployDetailId) : null;

  const overallStatus = computeOverallStatus(services);
  const bannerTone = overallStatusTone(overallStatus);
  const bannerBg = bannerTone === "danger" ? T.dangerSoft : bannerTone === "warning" ? T.warningSoft : bannerTone === "info" ? T.primarySoft : T.successSoft;
  const bannerColor = bannerTone === "danger" ? T.danger : bannerTone === "warning" ? T.warning : bannerTone === "info" ? T.primary : T.success;
  const BannerIcon = overallStatus === "Partial Outage" ? XCircle : overallStatus === "Partial Degradation" ? AlertTriangle : overallStatus === "Maintenance" ? Wrench : CheckCircle2;
  const downCount = services.filter((s) => s.status === "Down").length;
  const degradedCount = services.filter((s) => s.status === "Degraded").length;
  const maintCount = services.filter((s) => s.status === "Maintenance").length;
  const bannerDetail = overallStatus === "Partial Outage" ? `${downCount} service${downCount !== 1 ? "s" : ""} down`
    : overallStatus === "Partial Degradation" ? `${degradedCount} service${degradedCount !== 1 ? "s" : ""} affected`
    : overallStatus === "Maintenance" ? `${maintCount} service${maintCount !== 1 ? "s" : ""} in maintenance` : null;

  const avgUptime = computeAvgUptime(services);
  const activeIncidentCount = countActiveIncidents(incidents);
  const resolvedThisWeek = countResolvedThisWeek(incidents);

  const openIncidentDetail = (id, autoNote = false) => { setIncidentDetailId(id); setIncidentAutoNote(autoNote); };
  const jumpToIncident = (id) => { setServiceDetailId(null); setDeployDetailId(null); setTab("Incidents"); openIncidentDetail(id); };

  const refreshAll = () => { setServices((ss) => ss.map((s) => ({ ...s, lastCheckedMinutesAgo: 0 }))); setRefreshedAgo(0); store.notify("All services refreshed"); };
  const checkServiceNow = (id) => { setServices((ss) => ss.map((s) => (s.id === id ? { ...s, lastCheckedMinutesAgo: 0 } : s))); const s = services.find((x) => x.id === id); store.notify(`Checked ${s ? s.name : "service"}`); };
  const checkDependencyNow = (id) => { setDependencies((ds) => ds.map((d) => (d.id === id ? { ...d, lastCheckedMinutesAgo: 0 } : d))); const d = dependencies.find((x) => x.id === id); store.notify(`Checked ${d ? d.name : "dependency"}`); };

  const handleCreateIncident = (data) => {
    const id = "inc-" + nextHealthId();
    const incident = { id, title: data.title, description: data.description, severity: data.severity, status: "Active", affectedServices: data.affectedServices, startedAt: nowHealthTs(), resolvedAt: null, owner: data.owner, createdBy: ADMIN, timeline: [{ timestamp: nowHealthTs(), actor: ADMIN, text: "Incident created" }] };
    setIncidents((is) => [incident, ...is]);
    store.createIncident(incident);
    setCreateIncidentOpen(false);
  };
  const handleAddNote = (id, text) => {
    setIncidents((is) => is.map((i) => (i.id === id ? { ...i, timeline: [...i.timeline, { timestamp: nowHealthTs(), actor: ADMIN, text }] } : i)));
    store.notify("Note added");
  };
  const handleEscalate = (id, newSeverity) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc || inc.severity === newSeverity) return;
    setIncidents((is) => is.map((i) => (i.id === id ? { ...i, severity: newSeverity, timeline: [...i.timeline, { timestamp: nowHealthTs(), actor: ADMIN, text: `Severity changed from ${i.severity} to ${newSeverity}` }] } : i)));
    store.escalateIncident(id, inc.title, inc.severity, newSeverity);
  };
  const handleChangeOwner = (id, newOwner) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc || inc.owner === newOwner) return;
    setIncidents((is) => is.map((i) => (i.id === id ? { ...i, owner: newOwner, timeline: [...i.timeline, { timestamp: nowHealthTs(), actor: ADMIN, text: `Owner changed from ${i.owner} to ${newOwner}` }] } : i)));
    store.changeIncidentOwner(id, inc.title, inc.owner, newOwner);
  };
  const handleResolve = (id) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc) return;
    const resolvedAt = nowHealthTs();
    setIncidents((is) => is.map((i) => (i.id === id ? { ...i, status: "Resolved", resolvedAt, timeline: [...i.timeline, { timestamp: resolvedAt, actor: ADMIN, text: "Incident marked resolved" }] } : i)));
    store.resolveIncident(id, inc.title);
  };
  const handleRollback = (id) => {
    const dep = deployments.find((d) => d.id === id);
    if (!dep) return;
    setDeployments((ds) => ds.map((d) => (d.id === id ? { ...d, status: "Rolled Back" } : d)));
    store.rollbackDeploy(id, dep.version);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="System Health" desc="Platform status, performance, incidents, deployments and external dependencies" actions={<>
        <Button onClick={refreshAll}><RefreshCw size={15} /> Refresh All</Button>
        <Button variant="primary" onClick={() => setCreateIncidentOpen(true)}><Plus size={15} /> Create Incident</Button>
      </>} />

      <div className="rounded-xl flex items-center justify-between px-4 py-3 mb-4 shrink-0 flex-wrap gap-2" style={{ background: bannerBg }}>
        <div className="flex items-center gap-2.5">
          <BannerIcon size={18} style={{ color: bannerColor }} />
          <span className="text-[13.5px] font-semibold" style={{ color: bannerColor }}>{overallStatus}{bannerDetail ? ` — ${bannerDetail}` : ""}</span>
        </div>
        <span className="text-[12px]" style={{ color: T.text2 }}>Last check: {fmtAgo(refreshedAgo)}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Overall Uptime (30d)" value={`${avgUptime}%`} sub="SLA target 99.9%" trend={Number(avgUptime) >= 99.9 ? "pos" : "warn"} />
        <Kpi label="Avg API Latency" value={`${API_PERFORMANCE.avgResponseTime}ms`} sub={`P95: ${API_PERFORMANCE.p95Latency}ms`} trend={API_PERFORMANCE.avgResponseTime < 200 ? "pos" : "warn"} />
        <Kpi label="Error Rate (24h)" value={`${API_PERFORMANCE.errorRate}%`} sub={API_PERFORMANCE.errorRate < 1 ? "within threshold" : "above threshold"} trend={API_PERFORMANCE.errorRate < 1 ? "pos" : "warn"} />
        <Kpi label="Active Incidents" value={String(activeIncidentCount)} sub={`${resolvedThisWeek} resolved this week`} trend={activeIncidentCount > 0 ? "warn" : "pos"} />
      </div>

      <div className="flex gap-0.5 border-b mb-4 shrink-0 flex-wrap" style={{ borderColor: T.border }}>
        {HEALTH_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2.5 text-[13px] font-medium -mb-px border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5"
            style={tab === t ? { color: T.primary, borderColor: T.primary } : { color: T.text2, borderColor: "transparent" }}>
            {t}{t === "Incidents" && !!activeIncidentCount && <Badge tone="danger">{activeIncidentCount}</Badge>}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {tab === "Status Board" && <StatusBoardTab services={services} onOpenDetail={setServiceDetailId} />}
        {tab !== "Status Board" && (
          <div className="flex-1 min-h-0 overflow-y-auto pb-1">
            {tab === "Performance" && <PerformanceTab go={go} />}
            {tab === "Incidents" && <IncidentsTab incidents={incidents} services={services} onOpenDetail={openIncidentDetail} onQuickResolve={handleResolve} />}
            {tab === "Deployments" && <DeploymentsTab deployments={deployments} onOpenDetail={setDeployDetailId} />}
            {tab === "Dependencies" && <DependenciesTab dependencies={dependencies} onCheckNow={checkDependencyNow} />}
          </div>
        )}
      </div>

      <ServiceDetailDrawer service={serviceDetail} services={services} incidents={incidents} onClose={() => setServiceDetailId(null)} onCheckNow={checkServiceNow} onOpenIncident={jumpToIncident} go={go} />
      <IncidentDetailDrawer incident={incidentDetail} services={services} autoNote={incidentAutoNote} onClose={() => setIncidentDetailId(null)} onAddNote={handleAddNote} onEscalate={handleEscalate} onChangeOwner={handleChangeOwner} onResolve={handleResolve} />
      <DeploymentDetailDrawer deployment={deployDetail} incidents={incidents} onClose={() => setDeployDetailId(null)} onRollback={handleRollback} onOpenIncident={jumpToIncident} />
      <CreateIncidentModal open={createIncidentOpen} services={services} onClose={() => setCreateIncidentOpen(false)} onCreate={handleCreateIncident} />
    </div>
  );
}
