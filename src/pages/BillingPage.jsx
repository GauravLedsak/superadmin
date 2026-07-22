import { useState } from "react";
import { Download, Plus, RefreshCw, Mail, CheckCircle2 } from "lucide-react";
import { T } from "../theme.js";
import { fmtINR } from "../lib/format.js";
import { useStore } from "../store/StoreContext.jsx";
import { PageHeader, Button, Kpi, Tabs, Card, CardHeader, CardBody, Table, Td, Badge, statusBadge } from "../components/ui.jsx";

export function BillingPage() {
  const store = useStore();
  const [tab, setTab] = useState("Invoices");
  const failed = store.invoices.filter((i) => i.status === "Failed");
  const pending = store.invoices.filter((i) => i.status === "Pending");
  const collected = store.invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amt, 0);
  return (
    <>
      <PageHeader title="Subscriptions & Billing" desc="Invoices, payments, dunning and plan assignments"
        actions={<><Button onClick={() => store.notify("Invoices exported")}><Download size={15} /> Export</Button><Button variant="primary" onClick={() => store.notify("New invoice created")}><Plus size={15} /> New Invoice</Button></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi label="Collected (MTD)" value={fmtINR(collected)} sub="paid invoices" trend="pos" />
        <Kpi label="Outstanding" value={fmtINR(pending.reduce((s, i) => s + i.amt, 0))} sub={`${pending.length} pending`} trend="warn" />
        <Kpi label="Failed" value={fmtINR(failed.reduce((s, i) => s + i.amt, 0))} sub={`${failed.length} to recover`} trend="neg" />
        <Kpi label="Avg Invoice" value={fmtINR(9083)} sub="across paid tenants" />
      </div>
      <Tabs tabs={["Invoices", `Dunning (${failed.length})`]} value={tab} onChange={setTab} />
      {tab === "Invoices" && (
        <Card>
          <Table head={["Invoice", "Client", "Amount", "Method", "Date", "Status", ""]}>
            {store.invoices.map((iv) => (
              <tr key={iv.id} className="hover:bg-[#F8F9FC]">
                <Td className="font-mono text-xs">{iv.id}</Td>
                <Td className="font-medium">{iv.client}</Td>
                <Td className="font-medium">{fmtINR(iv.amt)}</Td>
                <Td className="text-xs" style={{ color: T.text2 }}>{iv.method}</Td>
                <Td className="text-xs" style={{ color: T.text2 }}>{iv.date}</Td>
                <Td>{statusBadge(iv.status)}</Td>
                <Td>{iv.status === "Failed" && <Button size="sm" onClick={() => store.retryInvoice(iv.id)}><RefreshCw size={13} /> Retry</Button>}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
      {tab.startsWith("Dunning") && (
        failed.length ? (
          <Card>
            <CardHeader title="Failed Payments — recovery queue" action={<Button size="sm" variant="primary" onClick={() => { failed.forEach((f) => store.retryInvoice(f.id)); }}><RefreshCw size={13} /> Retry all</Button>} />
            <Table head={["Invoice", "Client", "Amount", "Reason", "Date", ""]}>
              {failed.map((iv) => (
                <tr key={iv.id} className="hover:bg-[#F8F9FC]">
                  <Td className="font-mono text-xs">{iv.id}</Td>
                  <Td className="font-medium">{iv.client}</Td>
                  <Td className="font-medium">{fmtINR(iv.amt)}</Td>
                  <Td><Badge tone="danger">{iv.failReason}</Badge></Td>
                  <Td className="text-xs" style={{ color: T.text2 }}>{iv.date}</Td>
                  <Td><div className="flex gap-1.5"><Button size="sm" onClick={() => store.retryInvoice(iv.id)}><RefreshCw size={13} /> Retry</Button><Button size="sm" onClick={() => store.notify("Dunning email sent")}><Mail size={13} /> Email</Button></div></Td>
                </tr>
              ))}
            </Table>
          </Card>
        ) : (
          <Card><CardBody><div className="py-12 text-center"><CheckCircle2 size={28} style={{ color: T.success, margin: "0 auto 8px" }} /><div className="text-[15px] font-semibold" style={{ color: T.text }}>All caught up</div><p className="text-[13px] mt-1" style={{ color: T.text2 }}>No failed payments to recover.</p></div></CardBody></Card>
        )
      )}
    </>
  );
}

