import { useState } from "react";
import { Plus, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { T } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  PageHeader, Button, Kpi, FilterPill, Card, Table, Td, Badge, statusBadge, Menu, Pagination,
  usePagination,
} from "../components/ui.jsx";

export function SupportPage() {
  const store = useStore();
  const [filter, setFilter] = useState("All");
  const pt = { High: "danger", Medium: "warning", Low: "gray" };
  const rows = store.tickets.filter((t) => filter === "All" || t.status === filter);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(rows, 10);
  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="Support & Tickets" desc="Tenant support requests and SLA tracking"
        actions={<Button variant="primary" onClick={() => store.notify("New ticket created")}><Plus size={15} /> New Ticket</Button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Open Tickets" value={String(store.tickets.filter((t) => t.status === "Open").length)} sub="live" trend="warn" />
        <Kpi label="Avg First Response" value="1.8h" sub="SLA 4h" trend="pos" />
        <Kpi label="Resolved (7d)" value="34" sub="94% in SLA" trend="pos" />
        <Kpi label="CSAT" value="4.6/5" sub="118 ratings" trend="pos" />
      </div>
      <div className="flex gap-2 mb-3.5 shrink-0">{["All", "Open", "Pending", "Resolved"].map((f) => <FilterPill key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</FilterPill>)}</div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={["Ticket", "Subject", "Tenant", "Priority", "Owner", "Status", ""]}>
          {pageRows.map((t) => (
            <tr key={t.id} className="hover:bg-[#F8F9FC]">
              <Td className="font-mono text-xs">{t.id}</Td>
              <Td className="font-medium">{t.subj}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{t.tenant}</Td>
              <Td><Badge tone={pt[t.pri]}>{t.pri}</Badge></Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{t.owner}</Td>
              <Td>{statusBadge(t.status)}</Td>
              <Td><Menu items={[
                { label: "Mark resolved", icon: CheckCircle2, onClick: () => store.setTicketStatus(t.id, "Resolved") },
                { label: "Mark pending", icon: Clock, onClick: () => store.setTicketStatus(t.id, "Pending") },
                { label: "Reopen", icon: RefreshCw, onClick: () => store.setTicketStatus(t.id, "Open") },
              ]} /></Td>
            </tr>
          ))}
          {!rows.length && <tr><Td colSpan={7} className="text-center py-10" style={{ color: T.text3 }}>No tickets</Td></tr>}
        </Table>
      </Card>
    </div>
  );
}
