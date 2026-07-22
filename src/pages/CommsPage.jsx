import { Send, Mail, Clock, Phone } from "lucide-react";
import { T } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import { PageHeader, Button, Kpi, Card, CardHeader, CardBody, BarList, Badge } from "../components/ui.jsx";

export function CommsPage() {
  const store = useStore();
  return (<>
    <PageHeader title="Communication Center" desc="WhatsApp, SMS and email delivery" actions={<Button variant="primary" onClick={() => store.notify("Broadcast composer opened")}><Send size={15} /> New Broadcast</Button>} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Kpi label="Sent (30d)" value="182,400" sub="all channels" trend="pos" /><Kpi label="Delivery Rate" value="97.8%" sub="above target" trend="pos" />
      <Kpi label="WhatsApp Read" value="71%" sub="open rate" trend="pos" /><Kpi label="Failed" value="1.2%" sub="invalid numbers" trend="warn" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2"><CardHeader title="Channel Volume" /><CardBody>
        <BarList max={120000} fmt={(v) => v.toLocaleString("en-IN")} rows={[{ label: "WhatsApp", value: 108000, color: T.success }, { label: "SMS", value: 46000, color: T.primary }, { label: "Email", value: 28400, color: T.purple }]} />
      </CardBody></Card>
      <Card><CardHeader title="Templates" /><CardBody className="space-y-2">
        {[["Lead welcome", "WhatsApp", Mail], ["Renewal reminder", "Email", Clock], ["Missed-call follow-up", "SMS", Phone]].map((t, i) => { const Icon = t[2]; return (
          <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg border" style={{ borderColor: T.border }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}><Icon size={15} style={{ color: T.primary }} /></div>
            <div className="flex-1"><div className="text-[13px] font-medium" style={{ color: T.text }}>{t[0]}</div><div className="text-xs" style={{ color: T.text2 }}>{t[1]}</div></div><Badge tone="success">Approved</Badge>
          </div>); })}
      </CardBody></Card>
    </div>
  </>);
}
