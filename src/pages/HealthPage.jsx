import { Server, Database, Bot, Wifi, RefreshCw } from "lucide-react";
import { T } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import { PageHeader, Button, Kpi, Card, CardHeader, Table, Td, Badge } from "../components/ui.jsx";

export function HealthPage() {
  const store = useStore();
  const svc = [{ n: "API Gateway", s: "Operational", up: "99.98%", icon: Server }, { n: "Lead Ingestion", s: "Operational", up: "99.95%", icon: Database }, { n: "AI Enrichment", s: "Degraded", up: "97.20%", icon: Bot }, { n: "Webhooks", s: "Operational", up: "99.90%", icon: Wifi }];
  const st = { Operational: "success", Degraded: "warning", Down: "danger" };
  return (<>
    <PageHeader title="System Health" desc="Real-time service status and uptime" actions={<Button onClick={() => store.notify("Status refreshed")}><RefreshCw size={15} /> Refresh</Button>} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Kpi label="Uptime (30d)" value="99.94%" sub="SLA 99.9%" trend="pos" /><Kpi label="Avg Latency" value="142ms" sub="p95" /><Kpi label="Error Rate" value="0.08%" sub="within threshold" trend="pos" /><Kpi label="Incidents" value="1" sub="AI degraded" trend="warn" />
    </div>
    <Card><CardHeader title="Services" />
      <Table head={["Service", "Status", "Uptime (30d)"]}>
        {svc.map((s, i) => (
          <tr key={i} className="hover:bg-[#F8F9FC]">
            <Td><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: T.subtle }}><s.icon size={15} style={{ color: T.text2 }} /></div><span className="font-medium">{s.n}</span></div></Td>
            <Td><Badge tone={st[s.s]}>{s.s}</Badge></Td><Td className="font-medium">{s.up}</Td>
          </tr>
        ))}
      </Table>
    </Card>
  </>);
}
