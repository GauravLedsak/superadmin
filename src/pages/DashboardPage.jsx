import { Calendar, Download, LayoutGrid, TriangleAlert, Wifi, CreditCard, Clock, ChevronRight } from "lucide-react";
import { T } from "../theme.js";
import { fmtINR, fmtLakh, fmtK, isTaskOverdue } from "../lib/format.js";
import { STATS, PLAN_DIST, MRR_TREND } from "../data/seed.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  PageHeader, Button, Kpi, Card, CardHeader, CardBody, Badge, BarChart, Table, Td, NameCell,
  Progress, BarList,
} from "../components/ui.jsx";

export function DashboardPage({ go }) {
  const store = useStore();
  const atRisk = store.clients.filter((c) => c.churnRisk !== "Low");
  const failedPayments = store.invoices.filter((i) => i.status === "Failed");
  const brokenFeeds = store.clients.filter((c) => !c.providerOk);
  const overdueTasks = store.tenantTasks.filter(isTaskOverdue);
  return (
    <>
      <PageHeader title="Dashboard Command Center" desc="Live SaaS state — revenue, clients, ops, risks · refreshed 2 min ago"
        actions={<><Button onClick={() => store.notify("Date range: This Month")}><Calendar size={15} /> This Month</Button><Button onClick={() => store.notify("Dashboard PDF exported")}><Download size={15} /> Export PDF</Button><Button variant="primary" onClick={() => store.notify("Dashboard customization opened")}><LayoutGrid size={15} /> Customize</Button></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Kpi label="MRR (Approx)" value={fmtINR(STATS.mrr)} sub={`${STATS.paidCt} paid clients`} trend="pos" />
        <Kpi label="ARR (Run-rate)" value={fmtLakh(STATS.arr)} sub="Annualized" />
        <Kpi label="Total Tenants" value={STATS.total.toLocaleString("en-IN")} sub={`${STATS.subscribed} paid · ${STATS.free} free`} />
        <Kpi label="In Onboarding" value={String(store.onboarding.length)} sub="pipeline" trend="pos" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi label="Leads Processed" value={fmtK(STATS.leads)} sub="all tenants" trend="pos" />
        <Kpi label="Free → Paid" value={Math.round(STATS.subscribed / STATS.total * 100) + "%"} sub="below target" trend="neg" />
        <Kpi label="AI Summaries" value={STATS.aiUsed} sub="underutilized" trend="warn" />
        <Kpi label="Failed Payments" value={String(failedPayments.length)} sub={fmtINR(failedPayments.reduce((s, i) => s + i.amt, 0))} trend="neg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader title="MRR Trend · Last 6 months" action={<Badge tone="success">+{fmtINR(6379)} net new</Badge>} />
          <CardBody><BarChart data={MRR_TREND} max={340000} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Needs Attention" />
          <CardBody className="space-y-1.5">
            <button onClick={() => go("cs")} className="w-full text-left flex gap-3 items-start p-2.5 rounded-lg hover:brightness-95" style={{ background: T.dangerSoft, borderLeft: `3px solid ${T.danger}` }}>
              <div className="w-6 h-6 rounded-full bg-[var(--t-surface)] flex items-center justify-center shrink-0"><TriangleAlert size={14} style={{ color: T.danger }} /></div>
              <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{atRisk.length} tenants at churn risk</div><div className="text-xs" style={{ color: T.text2 }}>Health below 75 — review now</div></div>
            </button>
            <button onClick={() => go("integrations")} className="w-full text-left flex gap-3 items-start p-2.5 rounded-lg hover:brightness-95" style={{ background: T.dangerSoft, borderLeft: `3px solid ${T.danger}` }}>
              <div className="w-6 h-6 rounded-full bg-[var(--t-surface)] flex items-center justify-center shrink-0"><Wifi size={14} style={{ color: T.danger }} /></div>
              <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{brokenFeeds.length} lead feeds down</div><div className="text-xs" style={{ color: T.text2 }}>CarWale sync interrupted</div></div>
            </button>
            <button onClick={() => go("subs")} className="w-full text-left flex gap-3 items-start p-2.5 rounded-lg hover:brightness-95" style={{ background: T.warningSoft, borderLeft: `3px solid ${T.warning}` }}>
              <div className="w-6 h-6 rounded-full bg-[var(--t-surface)] flex items-center justify-center shrink-0"><CreditCard size={14} style={{ color: T.warning }} /></div>
              <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{failedPayments.length} payments to recover</div><div className="text-xs" style={{ color: T.text2 }}>Retry in billing</div></div>
            </button>
            {overdueTasks.length > 0 && (
              <button onClick={() => go("cs")} className="w-full text-left flex gap-3 items-start p-2.5 rounded-lg hover:brightness-95" style={{ background: T.dangerSoft, borderLeft: `3px solid ${T.danger}` }}>
                <div className="w-6 h-6 rounded-full bg-[var(--t-surface)] flex items-center justify-center shrink-0"><Clock size={14} style={{ color: T.danger }} /></div>
                <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{overdueTasks.length} overdue CS tasks</div><div className="text-xs" style={{ color: T.text2 }}>Across all tenants — review playbook progress</div></div>
              </button>
            )}
          </CardBody>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Top Clients by Leads" action={<Button variant="ghost" size="sm" onClick={() => go("clients")}>View all <ChevronRight size={13} /></Button>} />
          <Table head={["Client", "Industry", "Leads", "Health"]}>
            {[...store.clients].sort((a, b) => b.leads - a.leads).slice(0, 5).map((c) => (
              <tr key={c.id} className="hover:bg-[#F8F9FC]">
                <Td><NameCell name={c.name} sub={c.branch} onClick={() => go("clients")} /></Td>
                <Td><Badge tone={c.industry === "Clinic" ? "purple" : "gray"}>{c.industry}</Badge></Td>
                <Td className="font-medium">{c.leads.toLocaleString("en-IN")}</Td>
                <Td><Progress value={c.health} /></Td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card>
          <CardHeader title="Revenue by Plan" action={<Button variant="ghost" size="sm" onClick={() => go("subs")}>Details <ChevronRight size={13} /></Button>} />
          <CardBody><BarList max={70000} fmt={fmtINR} rows={PLAN_DIST.map((p) => ({ label: p.plan, value: p.mrr, note: `${p.clients} clients` }))} /></CardBody>
        </Card>
      </div>
    </>
  );
}
