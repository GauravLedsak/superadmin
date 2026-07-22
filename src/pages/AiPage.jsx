import { Sparkles } from "lucide-react";
import { T } from "../theme.js";
import { fmtINR } from "../lib/format.js";
import { STATS } from "../data/seed.js";
import { useStore } from "../store/StoreContext.jsx";
import { PageHeader, Button, Kpi, Card, CardHeader, CardBody, BarList, Badge } from "../components/ui.jsx";

export function AiPage() {
  const store = useStore();
  return (<>
    <PageHeader title="AI Intelligence" desc="Summarization, scoring and churn prediction usage" actions={<Button variant="primary" onClick={() => store.notify("Model configuration opened")}><Sparkles size={15} /> Configure Models</Button>} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Kpi label="Summaries (30d)" value="4,830" sub="+840" trend="pos" /><Kpi label="Tenants Using AI" value={String(STATS.aiUsed)} sub={`of ${STATS.total}`} trend="warn" />
      <Kpi label="Avg Score Lift" value="+18%" sub="conversion" trend="pos" /><Kpi label="Token Spend" value={fmtINR(41200)} sub="within budget" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2"><CardHeader title="Feature Adoption" /><CardBody>
        <BarList max={100} fmt={(v) => v + "%"} rows={[{ label: "Summarization", value: 86, color: T.primary }, { label: "Scoring", value: 64, color: T.primary }, { label: "Churn prediction", value: 41, color: T.purple }, { label: "Auto-reply drafts", value: 28, color: T.warning }]} />
      </CardBody></Card>
      <Card><CardHeader title="Models" /><CardBody className="space-y-2.5">
        {[["Summarization", "GPT-4o mini", "Live", "success"], ["Scoring", "Custom ML v3", "Live", "success"], ["Churn", "Custom ML v2", "Retraining", "warning"]].map((m, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border" style={{ borderColor: T.border }}>
            <div><div className="text-[13px] font-medium" style={{ color: T.text }}>{m[0]}</div><div className="text-xs" style={{ color: T.text2 }}>{m[1]}</div></div><Badge tone={m[3]}>{m[2]}</Badge>
          </div>
        ))}
      </CardBody></Card>
    </div>
  </>);
}
