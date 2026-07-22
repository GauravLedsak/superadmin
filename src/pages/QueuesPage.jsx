import React, { useState } from "react";
import {
  RefreshCw, Trash2, PlayCircle, PauseCircle, XCircle, CheckCircle2, AlertTriangle, Clock,
  Activity, History,
} from "lucide-react";
import { T } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import { PageHeader, Button, Menu, Card, CardHeader, CardBody, Badge } from "../components/ui.jsx";

/* ---- Queue Monitor — working retry ---- */
/* ---- Queue Monitor — single BullMQ-style queue (leadQueue), matches the ingestion
   pipeline leads flow through: addLead jobs failing in the same way the Lead & Record
   Mgmt "Integration Health" section already surfaces (auth/validation errors upstream). ---- */
export const genObjectId = (seed) => { let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0; return h.toString(16).padStart(8, "0") + seed.length.toString(16).padStart(4, "0") + "a1b2c3d4e5f6".slice(0, 12); };

export const SEED_FAILED_JOBS = [
  { id: "4277", name: "addLead", attempts: 3, error: "No lead details provided in lead worker for job 4277", data: { client: genObjectId("MedLinks"), data: { lead_details: [], source: genObjectId("IndiaMART"), group: genObjectId("grp-1"), stage: genObjectId("Kickoff") }, logId: genObjectId("log-4277") }, failedAt: "22 Jul 2026, 4:25:27 am" },
  { id: "4276", name: "addLead", attempts: 3, error: "Auth error: IndiaMART API token expired", data: { client: genObjectId("BrightPath Edu"), data: { lead_details: [{ phone: null }], source: genObjectId("IndiaMART"), group: genObjectId("grp-2"), stage: genObjectId("Training") }, logId: genObjectId("log-4276") }, failedAt: "22 Jul 2026, 4:19:04 am" },
  { id: "4271", name: "enrichLead", attempts: 2, error: "AI enrichment timeout after 8000ms for job 4271", data: { client: genObjectId("Derma Purtitys"), data: { lead_id: "ld-014", model: "ledsak-ai-v3" }, logId: genObjectId("log-4271") }, failedAt: "22 Jul 2026, 3:58:12 am" },
  { id: "4268", name: "addLead", attempts: 1, error: "No lead details provided in lead worker for job 4268", data: { client: genObjectId("MedLinks"), data: { lead_details: [], source: genObjectId("IndiaMART"), group: genObjectId("grp-1"), stage: genObjectId("Configuring") }, logId: genObjectId("log-4268") }, failedAt: "22 Jul 2026, 3:40:51 am" },
  { id: "4260", name: "dedupeLead", attempts: 3, error: "Duplicate match confidence below merge threshold (61%) for job 4260", data: { client: genObjectId("Urban Autohub"), data: { lead_id: "ld-013", matchId: "ld-009" }, logId: genObjectId("log-4260") }, failedAt: "22 Jul 2026, 2:12:37 am" },
  { id: "4254", name: "addLead", attempts: 3, error: "Auth error: IndiaMART API token expired", data: { client: genObjectId("BrightPath Edu"), data: { lead_details: [], source: genObjectId("IndiaMART"), group: genObjectId("grp-2"), stage: genObjectId("Training") }, logId: genObjectId("log-4254") }, failedAt: "22 Jul 2026, 1:47:22 am" },
  { id: "4249", name: "syncTenant", attempts: 2, error: "Tenant webhook responded 503 for job 4249", data: { client: genObjectId("Rezoni"), data: { webhook: "https://rezoni.example/hooks/leads" }, logId: genObjectId("log-4249") }, failedAt: "21 Jul 2026, 11:30:09 pm" },
  { id: "4241", name: "addLead", attempts: 3, error: "No lead details provided in lead worker for job 4241", data: { client: genObjectId("MedLinks"), data: { lead_details: [], source: genObjectId("IndiaMART"), group: genObjectId("grp-1"), stage: genObjectId("Kickoff") }, logId: genObjectId("log-4241") }, failedAt: "21 Jul 2026, 10:05:44 pm" },
  { id: "4233", name: "sendNotification", attempts: 1, error: "SMTP connection refused for job 4233", data: { client: genObjectId("Varun Group"), data: { channel: "email", template: "lead-assigned" }, logId: genObjectId("log-4233") }, failedAt: "21 Jul 2026, 8:52:16 pm" },
  { id: "4227", name: "enrichLead", attempts: 2, error: "AI enrichment timeout after 8000ms for job 4227", data: { client: genObjectId("Derma Purtitys"), data: { lead_id: "ld-008", model: "ledsak-ai-v3" }, logId: genObjectId("log-4227") }, failedAt: "21 Jul 2026, 7:14:39 pm" },
];

export function QueuesPage() {
  const store = useStore();
  const [failedJobs, setFailedJobs] = useState(SEED_FAILED_JOBS);
  const [activeJobs, setActiveJobs] = useState([]);
  const [completed, setCompleted] = useState(14);
  const [waiting, setWaiting] = useState(0);
  const [delayed, setDelayed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }));
  const [retrying, setRetrying] = useState(null); // job id currently retrying

  const touch = () => setLastUpdated(new Date().toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }));

  const handleRefresh = () => { touch(); store.notify("Queue refreshed"); };

  const retryJob = (id) => {
    setRetrying(id);
    setTimeout(() => {
      setFailedJobs((jobs) => jobs.filter((j) => j.id !== id));
      setCompleted((c) => c + 1);
      setRetrying(null);
      touch();
      store.notify(`Job ${id} retried and completed`);
    }, 900);
  };

  const retryAll = () => {
    const ids = failedJobs.map((j) => j.id);
    setRetrying("all");
    setTimeout(() => {
      setFailedJobs([]);
      setCompleted((c) => c + ids.length);
      setRetrying(null);
      touch();
      store.notify(`${ids.length} job(s) retried and completed`);
    }, 1200);
  };

  const clearCompleted = () => { setCompleted(0); store.notify("Completed jobs cleared"); };
  const togglePaused = () => { setPaused((p) => !p); store.notify(paused ? "Queue resumed" : "Queue paused"); };

  // Health reflects backlog/congestion (is the queue keeping up?), not the dead-letter count —
  // a healthy queue can still be sitting on old failed jobs waiting for someone to retry them.
  const isDown = !paused && waiting > 50;
  const isHealthy = !paused && !isDown && waiting <= 20;
  const healthLabel = paused ? "PAUSED" : isDown ? "DOWN" : isHealthy ? "HEALTHY" : "DEGRADED";
  const healthTone = paused ? "gray" : isDown ? "danger" : isHealthy ? "success" : "warning";
  const bannerBg = paused ? T.subtle : isDown ? T.dangerSoft : isHealthy ? T.successSoft : T.warningSoft;
  const bannerColor = paused ? T.text2 : isDown ? T.danger : isHealthy ? T.success : T.warning;
  const bannerIcon = paused ? PauseCircle : isDown ? XCircle : isHealthy ? CheckCircle2 : AlertTriangle;
  const bannerText = paused ? "Queue is paused — no jobs are being processed" : isDown ? "Queue is unhealthy — failure rate requires attention" : isHealthy ? "Queue is operating normally" : "Queue is degraded — elevated failure rate";

  const stats = [
    { label: "Waiting", value: waiting, sub: "Jobs in queue", icon: Clock, color: T.primary },
    { label: "Active", value: activeJobs.length, sub: "Currently processing", icon: Activity, color: T.success },
    { label: "Completed", value: completed, sub: "Successfully finished", icon: CheckCircle2, color: T.success },
    { label: "Failed", value: failedJobs.length, sub: "Requires attention", icon: XCircle, color: T.danger },
    { label: "Delayed", value: delayed, sub: "Scheduled for later", icon: History, color: T.warning },
  ];

  return (
    <>
      <PageHeader title="Queue Monitor" desc="Monitor BullMQ workers, queue health, and job statistics"
        actions={<>
          {failedJobs.length > 0 && <Button onClick={retryAll} disabled={retrying === "all"} style={{ borderColor: T.dangerBorder, color: T.danger }}><RefreshCw size={14} className={retrying === "all" ? "animate-spin" : ""} />Retry all failed ({failedJobs.length})</Button>}
          <Button onClick={handleRefresh}><RefreshCw size={15} /> Refresh</Button>
          <Menu items={[
            { label: paused ? "Resume queue" : "Pause queue", icon: paused ? PlayCircle : PauseCircle, onClick: togglePaused },
            { label: "Clear completed jobs", icon: Trash2, onClick: clearCompleted },
          ]} />
        </>} />

      {/* Queue Health Status */}
      <Card className="mb-4">
        <CardHeader title="Queue Health Status" sub={`leadQueue · Last updated: ${lastUpdated}`} action={<Badge tone={healthTone}>{healthLabel}</Badge>} />
        <CardBody>
          <div className="flex items-center gap-3 rounded-lg p-4" style={{ background: bannerBg }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: T.surface }}>
              {React.createElement(bannerIcon, { size: 18, style: { color: bannerColor } })}
            </div>
            <div>
              <div className="text-[13px] font-semibold" style={{ color: T.text }}>{bannerText}</div>
              <div className="text-[12px] mt-0.5" style={{ color: T.text2 }}>{activeJobs.length} active job{activeJobs.length !== 1 ? "s" : ""}, {waiting} waiting, {failedJobs.length} failed</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border bg-[var(--t-surface)]" style={{ borderColor: T.border, boxShadow: "0 1px 2px rgba(26,31,54,.05)", padding: "18px 20px" }}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium" style={{ color: T.text }}>{label}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <div className="text-[26px] leading-none font-semibold mt-3 tracking-tight" style={{ color: T.text }}>{value}</div>
            <div className="text-xs mt-2" style={{ color: T.text3 }}>{sub}</div>
          </div>
        ))}
        <div className="rounded-lg border bg-[var(--t-surface)]" style={{ borderColor: T.border, boxShadow: "0 1px 2px rgba(26,31,54,.05)", padding: "18px 20px" }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium" style={{ color: T.text }}>Paused</span>
            <PauseCircle size={16} style={{ color: paused ? T.warning : T.text3 }} />
          </div>
          <div className="text-[15px] font-semibold mt-3" style={{ color: paused ? T.warning : T.text3 }}>{paused ? "Yes" : "No"}</div>
          <div className="text-xs mt-2" style={{ color: T.text3 }}>{paused ? "Temporarily stopped" : "Queue running normally"}</div>
        </div>
      </div>

      {/* Failed Jobs + Active Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title={<span className="flex items-center gap-1.5"><XCircle size={15} style={{ color: T.danger }} />Failed Jobs</span>} sub="Most recent job failures (up to 5)"
            action={failedJobs.length > 0 && <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: T.danger }}>{failedJobs.length}</span>} />
          <CardBody className="space-y-3">
            {failedJobs.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 size={28} style={{ color: T.success }} className="mx-auto mb-2" />
                <div className="text-[13px] font-medium" style={{ color: T.text }}>No failed jobs</div>
              </div>
            ) : failedJobs.slice(0, 5).map((j) => (
              <div key={j.id} className="rounded-lg p-3.5 space-y-2" style={{ background: T.dangerSoft, border: "1px solid #F3C6C6" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>Job ID</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded" style={{ background: T.surface, color: T.text }}>{j.id}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: T.danger }}>{j.attempts} attempt{j.attempts !== 1 ? "s" : ""}</span>
                </div>
                <div className="text-[12px]"><span className="font-semibold" style={{ color: T.text }}>Name: </span><span style={{ color: T.text2 }}>{j.name}</span></div>
                <div>
                  <div className="text-[11px] font-semibold mb-1" style={{ color: T.text }}>Error:</div>
                  <div className="text-[11px] px-2.5 py-1.5 rounded" style={{ background: T.dangerStrong, color: T.dangerStrongFg }}>{j.error}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold mb-1" style={{ color: T.text }}>Job Data:</div>
                  <pre className="text-[10px] font-mono rounded-lg p-2 overflow-auto" style={{ background: T.surface, color: T.text2, maxHeight: 140 }}>{JSON.stringify(j.data, null, 2)}</pre>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[11px]" style={{ color: T.text3 }}>Failed: {j.failedAt}</span>
                  <Button size="sm" onClick={() => retryJob(j.id)} disabled={retrying === j.id}><RefreshCw size={12} className={retrying === j.id ? "animate-spin" : ""} />Retry</Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<span className="flex items-center gap-1.5"><Activity size={15} style={{ color: T.success }} />Active Jobs</span>} sub="Currently processing jobs (up to 5)" />
          <CardBody>
            {activeJobs.length === 0 ? (
              <div className="text-center py-16">
                <RefreshCw size={26} style={{ color: T.text3 }} className="mx-auto mb-3" />
                <div className="text-[13px] font-medium" style={{ color: T.text }}>No active jobs</div>
                <div className="text-[12px] mt-1" style={{ color: T.text3 }}>Queue is idle</div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeJobs.slice(0, 5).map((j) => (
                  <div key={j.id} className="rounded-lg p-3.5" style={{ background: T.successSoft, border: "1px solid #A7F3D0" }}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded" style={{ background: T.surface, color: T.text }}>{j.id}</span>
                      <RefreshCw size={13} className="animate-spin" style={{ color: T.success }} />
                    </div>
                    <div className="text-[12px] mt-2"><span className="font-semibold" style={{ color: T.text }}>Name: </span><span style={{ color: T.text2 }}>{j.name}</span></div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
