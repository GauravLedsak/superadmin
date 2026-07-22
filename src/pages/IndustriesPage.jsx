import { Plus, Car, Stethoscope, GraduationCap, ShoppingCart, Building2, LayoutTemplate, Pencil } from "lucide-react";
import { T } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import { PageHeader, Button, Badge } from "../components/ui.jsx";

export function IndustriesPage() {
  const store = useStore();
  const verts = [["Automotive Dealership", Car, 48, "brand", "Multi-brand showroom workflow"], ["Healthcare / Clinic", Stethoscope, 37, "purple", "Patient lead + EMR bridge"], ["Education", GraduationCap, 38, "success", "Admissions funnel"], ["Ecommerce", ShoppingCart, 26, "warning", "Abandoned-cart recovery"], ["Real Estate", Building2, 45, "gray", "Site-visit scheduling"], ["Other / Custom", LayoutTemplate, 121, "gray", "Blank starter workflow"]];
  return (<>
    <PageHeader title="Industries & Templates" desc="Vertical presets and onboarding workflow templates" actions={<Button variant="primary" onClick={() => store.notify("New template created")}><Plus size={15} /> New Template</Button>} />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {verts.map((v, i) => { const Icon = v[1]; return (
        <div key={i} className="rounded-lg border bg-[var(--t-surface)] p-4 hover:shadow-md transition-shadow" style={{ borderColor: T.border, boxShadow: "0 1px 2px rgba(26,31,54,.05)" }}>
          <div className="flex items-start justify-between mb-3"><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: T.primarySoft }}><Icon size={18} style={{ color: T.primary }} /></div><Badge tone={v[3]}>{v[2]} tenants</Badge></div>
          <div className="text-[14px] font-semibold" style={{ color: T.text }}>{v[0]}</div><div className="text-xs mb-3" style={{ color: T.text2 }}>{v[4]}</div>
          <Button size="sm" className="w-full justify-center" onClick={() => store.notify(`Editing ${v[0]} template`)}><Pencil size={13} /> Edit template</Button>
        </div>); })}
    </div>
  </>);
}
