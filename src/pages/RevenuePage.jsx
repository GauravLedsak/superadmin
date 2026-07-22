import { useState } from "react";
import { Calendar, Download, Pencil, Plus } from "lucide-react";
import { T } from "../theme.js";
import { fmtINR, fmtLakh } from "../lib/format.js";
import { STATS, MRR_TREND } from "../data/seed.js";
import { useStore } from "../store/StoreContext.jsx";
import { PageHeader, Button, Tabs, Kpi, Card, CardHeader, CardBody, BarChart, BarList, Badge } from "../components/ui.jsx";

export function RevenuePage() {
  const store = useStore();
  const [tab, setTab] = useState("Analytics");
  return (
    <>
      <PageHeader title="Revenue & Plans" desc="MRR movement, plan mix and the pricing catalog"
        actions={<><Button onClick={() => store.notify("Date range: Last 6 months")}><Calendar size={15} /> Last 6 months</Button><Button onClick={() => store.notify("Revenue report exported")}><Download size={15} /> Export</Button></>} />
      <Tabs tabs={["Analytics", "Plan Catalog"]} value={tab} onChange={setTab} />
      {tab === "Analytics" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Kpi label="MRR" value={fmtINR(STATS.mrr)} sub="+2.1% MoM" trend="pos" />
            <Kpi label="ARR" value={fmtLakh(STATS.arr)} sub="Annualized" />
            <Kpi label="Net New" value={fmtINR(6379)} sub="this month" trend="pos" />
            <Kpi label="Gross Churn" value={fmtINR(4167)} sub="1 account" trend="neg" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2"><CardHeader title="MRR Trend" /><CardBody><BarChart data={MRR_TREND} max={340000} /></CardBody></Card>
            <Card><CardHeader title="MRR Movement" /><CardBody>
              <BarList max={72000} fmt={fmtINR} rows={[
                { label: "Starting", value: 305700, color: T.text3 }, { label: "New", value: 8546, color: T.success },
                { label: "Expansion", value: 4200, color: T.primary }, { label: "Contraction", value: 2300, color: T.warning },
                { label: "Churn", value: 4167, color: T.danger }, { label: "Ending", value: STATS.mrr, color: T.primary },
              ]} />
            </CardBody></Card>
          </div>
        </>
      )}
      {tab === "Plan Catalog" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {store.spPlans.map((p) => (
            <div key={p.id} className="rounded-lg border bg-[var(--t-surface)] p-4" style={{ borderColor: T.border, boxShadow: "0 1px 2px rgba(26,31,54,.05)" }}>
              <div className="flex items-start justify-between mb-2">
                <div><div className="text-[14px] font-semibold" style={{ color: T.text }}>{p.name}</div><div className="text-xs" style={{ color: T.text2 }}>{p.cycle}</div></div>
                <Badge tone="success">{p.clients} clients</Badge>
              </div>
              <div className="text-[22px] font-semibold my-2" style={{ color: T.text }}>{p.price ? fmtINR(p.price) : "Free"}<span className="text-xs font-normal" style={{ color: T.text3 }}>{p.price ? " /mo" : ""}</span></div>
              <div className="text-xs mb-3" style={{ color: T.text2 }}>{p.seats} seats · {p.features.join(" · ")}</div>
              <Button size="sm" className="w-full justify-center" onClick={() => store.notify(`Editing ${p.name}`)}><Pencil size={13} /> Edit plan</Button>
            </div>
          ))}
          <button onClick={() => store.notify("New plan draft created")} className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 py-8 hover:bg-[var(--t-subtle)] transition" style={{ borderColor: T.borderStrong, color: T.text2 }}>
            <Plus size={22} /><span className="text-[13px] font-medium">New plan</span>
          </button>
        </div>
      )}
    </>
  );
}

