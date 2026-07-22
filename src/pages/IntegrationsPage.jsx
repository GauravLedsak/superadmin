import { useState } from "react";
import {
  Plus, Filter, X, TriangleAlert, RefreshCw, Car, Globe, MessageSquare, Stethoscope,
  CreditCard, Server,
} from "lucide-react";
import { T } from "../theme.js";
import { computeIntegrationHealth, loadLeads, SEED_LEADS } from "../data/leads.js";
import { useStore } from "../store/StoreContext.jsx";
import { PageHeader, Button, Badge } from "../components/ui.jsx";

export function IntegrationsPage({ filter }) {
  const store = useStore();
  const brokenTenants = store.clients.filter((c) => !c.providerOk);
  const leadHealth = computeIntegrationHealth(loadLeads() || SEED_LEADS);
  const indiaMartHealth = leadHealth.find((h) => h.source === "IndiaMART");
  const [filterDismissed, setFilterDismissed] = useState(false);
  const activeFilter = !filterDismissed && filter?.source ? filter : null;
  const integ = [
    { name: "CarWale", cat: "Lead provider", icon: Car, tenants: 42, ok: brokenTenants.every((t) => t.provider !== "CarWale") },
    { name: "CarDekho", cat: "Lead provider", icon: Car, tenants: 38, ok: true },
    { name: "IndiaMART", cat: "Lead provider", icon: Globe, tenants: indiaMartHealth?.total || 0, ok: indiaMartHealth?.status === "Healthy" },
    { name: "WhatsApp Business", cat: "Messaging", icon: MessageSquare, tenants: 210, ok: true },
    { name: "Cliniceo EMR", cat: "Healthcare", icon: Stethoscope, tenants: 12, ok: true },
    { name: "Razorpay", cat: "Payments", icon: CreditCard, tenants: 56, ok: true },
    { name: "Dealer DMS", cat: "Automotive", icon: Server, tenants: 1, ok: true, beta: true },
  ];
  // Deep-linked from Lead & Record Mgmt: bump the matching integration to the top so it's
  // immediately visible without scrolling or hunting through the grid.
  const matches = (it) => activeFilter && (it.name === activeFilter.source || it.name.startsWith(activeFilter.source));
  const sortedInteg = activeFilter ? [...integ].sort((a, b) => (matches(b) ? 1 : 0) - (matches(a) ? 1 : 0)) : integ;
  return (
    <>
      <PageHeader title="Integrations" desc="Lead providers, messaging, payments and vertical connectors"
        actions={<Button variant="primary" onClick={() => store.notify("Integration added")}><Plus size={15} /> Add Integration</Button>} />
      {activeFilter && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg mb-4" style={{ background: T.primarySoft, border: `1px solid ${T.primary}` }}>
          <Filter size={14} style={{ color: T.accentText }} />
          <span className="text-[13px] flex-1" style={{ color: T.text }}>
            Filtered from Lead & Record Management — <strong>{activeFilter.source}</strong>{activeFilter.tenants?.length ? ` affects ${activeFilter.tenants.length} tenant${activeFilter.tenants.length !== 1 ? "s" : ""}: ${activeFilter.tenants.join(", ")}` : ""}
          </span>
          <button onClick={() => setFilterDismissed(true)} className="text-[12px] flex items-center gap-1 px-2 py-1 rounded" style={{ color: T.accentText }}><X size={11} />Clear</button>
        </div>
      )}
      {brokenTenants.length > 0 && (
        <div className="flex gap-3 items-center p-3.5 rounded-lg mb-4" style={{ background: T.dangerSoft, borderLeft: `3px solid ${T.danger}` }}>
          <TriangleAlert size={18} style={{ color: T.danger }} />
          <div className="flex-1"><div className="text-[13px] font-medium" style={{ color: T.text }}>{brokenTenants.length} tenant feeds are down</div>
            <div className="text-xs" style={{ color: T.text2 }}>{brokenTenants.map((t) => t.name).join(", ")}</div></div>
          <Button size="sm" onClick={() => store.notify("Reconnect requests sent to affected tenants")}><RefreshCw size={13} /> Reconnect all</Button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedInteg.map((it, i) => (
          <div key={i} className="rounded-lg border bg-[var(--t-surface)] p-4 hover:shadow-md transition-shadow" style={matches(it) ? { borderColor: T.primary, boxShadow: `0 0 0 2px ${T.primarySoft}` } : { borderColor: T.border, boxShadow: "0 1px 2px rgba(26,31,54,.05)" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: T.subtle }}><it.icon size={18} style={{ color: T.primary }} /></div>
              <Badge tone={it.beta ? "warning" : it.ok ? "success" : "danger"}>{it.beta ? "Beta" : it.ok ? "Connected" : "Feed down"}</Badge>
            </div>
            <div className="text-[14px] font-semibold" style={{ color: T.text }}>{it.name}</div>
            <div className="text-xs mb-3" style={{ color: T.text2 }}>{it.cat}</div>
            <div className="flex items-center justify-between text-xs pt-3 border-t" style={{ borderColor: T.border }}>
              <span style={{ color: T.text3 }}>Connected tenants</span><span className="font-medium" style={{ color: T.text }}>{it.tenants}</span>
            </div>
            {!it.ok && <Button size="sm" className="w-full justify-center mt-3" onClick={() => store.notify(`${it.name} reconnect started`)}><RefreshCw size={13} /> Reconnect</Button>}
          </div>
        ))}
      </div>
    </>
  );
}
