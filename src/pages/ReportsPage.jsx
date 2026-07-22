import { Plus, FileText, PlayCircle, Download } from "lucide-react";
import { T } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import { PageHeader, Button, Kpi, Card, CardHeader, Table, Td, Badge } from "../components/ui.jsx";

export function ReportsPage() {
  const store = useStore();
  const reports = [["Monthly revenue summary", "Finance", "1st of month"], ["Tenant health digest", "Success", "Weekly · Mon"], ["Lead source performance", "Sales", "Weekly · Fri"], ["AI usage & spend", "Ops", "Monthly"], ["Churn cohort analysis", "Success", "Manual"]];
  return (<>
    <PageHeader title="Reports & BI" desc="Saved reports, scheduled exports and dashboards" actions={<Button variant="primary" onClick={() => store.notify("New report created")}><Plus size={15} /> New Report</Button>} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Kpi label="Saved Reports" value="28" sub="12 scheduled" /><Kpi label="Exports (30d)" value="146" sub="PDF + CSV" trend="pos" /><Kpi label="Dashboards" value="9" sub="shared" /><Kpi label="Scheduled" value="12" sub="auto-delivered" />
    </div>
    <Card><CardHeader title="Saved Reports" />
      <Table head={["Report", "Category", "Schedule", ""]}>
        {reports.map((r, i) => (
          <tr key={i} className="hover:bg-[#F8F9FC]">
            <Td><div className="flex items-center gap-2.5"><FileText size={16} style={{ color: T.primary }} /><span className="font-medium">{r[0]}</span></div></Td>
            <Td><Badge tone="gray">{r[1]}</Badge></Td><Td className="text-xs" style={{ color: T.text2 }}>{r[2]}</Td>
            <Td><div className="flex gap-1"><button onClick={() => store.notify(`Running ${r[0]}`)} className="p-1 rounded hover:bg-[var(--t-hover)]" title="Run"><PlayCircle size={15} style={{ color: T.primary }} /></button><button onClick={() => store.notify("Downloaded")} className="p-1 rounded hover:bg-[var(--t-hover)]"><Download size={15} style={{ color: T.text3 }} /></button></div></Td>
          </tr>
        ))}
      </Table>
    </Card>
  </>);
}
