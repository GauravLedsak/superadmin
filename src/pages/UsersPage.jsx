import { useState } from "react";
import { Download, UserPlus, LogIn, Key, Mail, Power, Ban } from "lucide-react";
import { T, cx } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import {
  PageHeader, Button, Kpi, Card, Table, Td, SelectAllHeader, RowCheckbox, NameCell, Badge,
  statusBadge, Menu, SearchInput, FilterPill, Pagination, usePagination, useRowSelection,
  BulkActionsMenu,
} from "../components/ui.jsx";

export function UsersPage() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("All");
  const roles = ["All", ...Array.from(new Set(store.users.map((u) => u.role)))];
  const rows = store.users.filter((u) =>
    (u.name.toLowerCase().includes(q.toLowerCase()) || u.tenant.toLowerCase().includes(q.toLowerCase())) &&
    (role === "All" || u.role === role));
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } = usePagination(rows, 10);
  const sel = useRowSelection(pageRows, rows);
  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader title="CRM Users" desc="Cross-tenant directory · roles, activity, impersonation"
        actions={sel.isSome
          ? <BulkActionsMenu count={sel.selected.size} onAction={(kind) => { store.notify(`${kind === "whatsapp" ? "WhatsApp" : "Email"} queued for ${sel.selected.size} user(s)`); sel.clear(); }} />
          : <><Button onClick={() => store.notify("Users exported")}><Download size={15} /> Export</Button><Button variant="primary" onClick={() => store.notify("Invite sent")}><UserPlus size={15} /> Invite User</Button></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        <Kpi label="Total Users" value="2,148" sub="across 564 tenants" />
        <Kpi label="Active (7d)" value="1,642" sub="76% engagement" trend="pos" />
        <Kpi label="Suspended" value={String(store.users.filter((u) => u.status === "Suspended").length)} sub="policy / non-payment" trend="warn" />
        <Kpi label="Pending Invites" value={String(store.users.filter((u) => u.status === "Invited").length)} sub="not yet accepted" />
      </div>
      <div className="flex gap-2 items-center mb-3.5 flex-wrap shrink-0">
        <SearchInput value={q} onChange={setQ} placeholder="Search users or tenants…" />
        {roles.map((r) => <FilterPill key={r} active={role === r} onClick={() => setRole(r)}>{r}</FilterPill>)}
      </div>
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={total} selectedCount={sel.selected.size} />
        <Table head={[<SelectAllHeader key="__all" sel={sel} />, "User", "Tenant", "Role", "Status", "Last active", ""]}>
          {pageRows.map((u) => (
            <tr key={u.id} className={cx("group hover:bg-[#F8F9FC]", sel.selected.has(u.id) && "bg-[#EEF2FF]")}>
              <Td><RowCheckbox checked={sel.selected.has(u.id)} onChange={(e, shiftKey) => sel.toggle(u.id, { shiftKey })} /></Td>
              <Td><NameCell name={u.name} sub={u.email} tone={u.role.includes("CEO") ? "purple" : "brand"} /></Td>
              <Td className="font-medium">{u.tenant}</Td>
              <Td><Badge tone={u.role.includes("CMO") || u.role.includes("CEO") ? "brand" : "gray"}>{u.role}</Badge></Td>
              <Td>{statusBadge(u.status)}</Td>
              <Td className="text-xs" style={{ color: T.text2 }}>{u.last}</Td>
              <Td><div className="flex items-center gap-1">
                <button onClick={() => store.impersonate(u)} className="p-1 rounded hover:bg-[var(--t-hover)]" title="Impersonate"><LogIn size={15} style={{ color: T.primary }} /></button>
                <Menu items={[
                  { label: "Reset password", icon: Key, onClick: () => store.resetPassword(u.name) },
                  u.status === "Invited" ? { label: "Resend invite", icon: Mail, onClick: () => store.resendInvite(u.id) } : null,
                  { divider: true },
                  u.status === "Suspended"
                    ? { label: "Reactivate", icon: Power, onClick: () => store.setUserStatus(u.id, "Active") }
                    : { label: "Suspend", icon: Ban, danger: true, onClick: () => store.setUserStatus(u.id, "Suspended") },
                ].filter(Boolean)} />
              </div></Td>
            </tr>
          ))}
          {!rows.length && <tr><Td colSpan={7} className="text-center py-10" style={{ color: T.text3 }}>No users match</Td></tr>}
        </Table>
      </Card>
    </div>
  );
}

