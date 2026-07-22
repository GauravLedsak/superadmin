import { useState } from "react";
import { Filter, Download } from "lucide-react";
import { T } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import { PageHeader, Button, Card, CardHeader, Table, Td, Badge, Pagination, usePagination } from "../components/ui.jsx";

export function LogsPage() {
  const store = useStore();
  const [typeFilter, setTypeFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const logs = [
    { time: "10:42:18", actor: "Saif Khan", action: "Updated plan for Dermalife", type: "Billing", ip: "103.21.x.x" },
    { time: "10:31:05", actor: "system", action: "Retried invoice INV-2453", type: "System", ip: "—" },
    { time: "09:58:44", actor: "Luv", action: "Impersonated priya@dermapuritys.com", type: "Access", ip: "103.21.x.x" },
    { time: "09:40:12", actor: "Saif Khan", action: "Suspended Rezoni user", type: "Access", ip: "103.21.x.x" },
    { time: "09:12:30", actor: "system", action: "Feature flag 'AI Churn' enabled", type: "Config", ip: "—" },
    { time: "08:55:01", actor: "Vishal", action: "Exported revenue report", type: "Data", ip: "49.36.x.x" },
  ];
  const tone = { Billing: "brand", System: "gray", Access: "warning", Config: "purple", Data: "success" };
  const types = ["All", ...Array.from(new Set(logs.map((l) => l.type)))];
  const filtered = typeFilter === "All" ? logs : logs.filter((l) => l.type === typeFilter);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(filtered, 10);
  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="Logs & Audit Trail" desc="Admin actions and forensic history · retained 7 years" actions={<>
        <div className="relative">
          <Button onClick={() => setFilterOpen((o) => !o)} onBlur={() => setTimeout(() => setFilterOpen(false), 150)}><Filter size={15} /> {typeFilter === "All" ? "Filter" : typeFilter}</Button>
          {filterOpen && (
            <div className="absolute right-0 top-9 z-20 w-40 rounded-lg border bg-[var(--t-surface)] py-1 shadow-lg" style={{ borderColor: T.border }}>
              {types.map((t) => (
                <button key={t} onMouseDown={() => setTypeFilter(t)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left hover:bg-[var(--t-subtle)]" style={{ color: T.text }}>{t}</button>
              ))}
            </div>
          )}
        </div>
        <Button onClick={() => store.notify("Audit log exported")}><Download size={15} /> Export</Button>
      </>} />
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden"><CardHeader title="Recent Activity" sub="Live · newest first" />
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} />
        <Table head={["Time", "Actor", "Action", "Type", "IP"]}>
          {pageRows.map((l, i) => (
            <tr key={i} className="hover:bg-[#F8F9FC]">
              <Td className="font-mono text-xs" style={{ color: T.text2 }}>{l.time}</Td><Td className="font-medium">{l.actor}</Td><Td>{l.action}</Td><Td><Badge tone={tone[l.type]}>{l.type}</Badge></Td><Td className="font-mono text-xs" style={{ color: T.text3 }}>{l.ip}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
