import { useState } from "react";
import { Plus, ShieldCheck, XCircle, Lock, Pencil } from "lucide-react";
import { T } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import { PageHeader, Button, Tabs, Card, CardBody, Table, Td, Switch } from "../components/ui.jsx";

export function SecurityPage() {
  const store = useStore();
  const [tab, setTab] = useState("Roles");
  const [policies, setPolicies] = useState([["Enforce 2FA for admins", true], ["Require SSO for Brand CEOs", true], ["Auto-expire sessions (12h)", true], ["IP allowlist for platform admin", false]]);
  const roles = [["Super Admin (CMO)", "Full platform", 3, "All"], ["Brand CEO", "Single brand", 12, "Brand data, users, reports"], ["Team Lead", "Team", 48, "Assign leads, view team"], ["Telecaller", "Own leads", 2085, "View & update own leads"]];
  return (<>
    <PageHeader title="Security & Access" desc="Roles matching the 4-tier tenant hierarchy, sessions and policies" actions={<Button variant="primary" onClick={() => store.notify("New role created")}><Plus size={15} /> New Role</Button>} />
    <Tabs tabs={["Roles", "Sessions", "Policies"]} value={tab} onChange={setTab} />
    {tab === "Roles" && <Card><Table head={["Role", "Scope", "Users", "Permissions", ""]}>
      {roles.map((r, i) => (<tr key={i} className="hover:bg-[#F8F9FC]"><Td><div className="flex items-center gap-2.5"><ShieldCheck size={16} style={{ color: T.primary }} /><span className="font-medium">{r[0]}</span></div></Td><Td className="text-xs" style={{ color: T.text2 }}>{r[1]}</Td><Td>{r[2].toLocaleString("en-IN")}</Td><Td className="text-xs" style={{ color: T.text2 }}>{r[3]}</Td><Td><button onClick={() => store.notify(`Editing ${r[0]}`)} className="p-1 rounded hover:bg-[var(--t-hover)]"><Pencil size={15} style={{ color: T.text3 }} /></button></Td></tr>))}
    </Table></Card>}
    {tab === "Sessions" && <Card><Table head={["User", "Device", "Location", "Started", ""]}>
      {[["Saif Khan", "Chrome · macOS", "New Delhi", "2h ago"], ["Luv", "Safari · iPhone", "Delhi", "22m ago"], ["Vishal", "Chrome · Windows", "Mumbai", "1h ago"]].map((s, i) => (<tr key={i} className="hover:bg-[#F8F9FC]"><Td className="font-medium">{s[0]}</Td><Td className="text-xs" style={{ color: T.text2 }}>{s[1]}</Td><Td className="text-xs" style={{ color: T.text2 }}>{s[2]}</Td><Td className="text-xs" style={{ color: T.text2 }}>{s[3]}</Td><Td><Button size="sm" variant="danger" onClick={() => store.notify(`Session revoked — ${s[0]}`)}><XCircle size={13} /> Revoke</Button></Td></tr>))}
    </Table></Card>}
    {tab === "Policies" && <Card><CardBody className="space-y-3">
      {policies.map((p, i) => (<div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: T.border }}><div className="flex items-center gap-2.5"><Lock size={16} style={{ color: T.text2 }} /><span className="text-[13px] font-medium" style={{ color: T.text }}>{p[0]}</span></div><Switch on={p[1]} onClick={() => { setPolicies((ps) => ps.map((x, j) => j === i ? [x[0], !x[1]] : x)); store.notify("Policy updated"); }} /></div>))}
    </CardBody></Card>}
  </>);
}
