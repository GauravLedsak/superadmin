import { useState } from "react";
import { CheckCircle2, ShieldCheck, HeartHandshake, Globe } from "lucide-react";
import { T } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import { PageHeader, Button, Tabs, Card, CardHeader, CardBody, Field, Switch, Badge } from "../components/ui.jsx";

export function SettingsPage() {
  const store = useStore();
  const [tab, setTab] = useState("Company");
  const [flags, setFlags] = useState({ ai: true, churn: true, collect: false, emr: true, dms: false, reseller: false });
  return (<>
    <PageHeader title="Settings" desc="Company profile, feature flags and compliance" actions={<Button variant="primary" onClick={() => store.notify("Settings saved")}><CheckCircle2 size={15} /> Save Changes</Button>} />
    <Tabs tabs={["Company", "Feature Flags", "Compliance"]} value={tab} onChange={setTab} />
    {tab === "Company" && <Card><CardHeader title="Company Profile" /><CardBody><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Company Name">LEDSAK Technologies Pvt Ltd</Field><Field label="GST Number"><span className="font-mono">07AAFCL9438H1Z5</span></Field>
      <Field label="Founder / CEO">Saif Khan</Field><Field label="Founded">2023</Field>
      <div className="sm:col-span-2"><Field label="Registered Office">Block-D, Balaji Estate, Kalkaji, New Delhi 110019</Field></div>
      <Field label="Currency">INR (₹)</Field><Field label="Timezone">Asia/Kolkata (IST)</Field>
    </div></CardBody></Card>}
    {tab === "Feature Flags" && <Card><CardBody className="space-y-1">
      {[["ai", "AI Lead Summarization", "OpenAI-powered context", "Global"], ["churn", "AI Churn Prediction", "ML on success", "Global"], ["collect", "LEDSAK Collect", "1.5% take-rate", "Beta · 3 clients"], ["emr", "EMR Bridge (Cliniceo)", "Two-way sync", "Healthcare only"], ["dms", "Dealership DMS Bridge", "Two-way sync", "Beta · 1 client"], ["reseller", "Reseller Program", "White-label & splits", "Disabled"]].map(([k, label, desc, env]) => (
        <div key={k} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: T.border }}><div><div className="text-[13px] font-medium" style={{ color: T.text }}>{label}</div><div className="text-xs" style={{ color: T.text2 }}>{desc} · {env}</div></div><Switch on={flags[k]} onClick={() => { setFlags((f) => ({ ...f, [k]: !f[k] })); store.notify("Flag updated"); }} /></div>
      ))}
    </CardBody></Card>}
    {tab === "Compliance" && <Card><CardBody className="space-y-2">
      {[[ShieldCheck, "DPDP Act 2023 — Compliant", "Consent · retention · PII masking", "Active", "success"], [HeartHandshake, "ABDM (Ayushman Bharat)", "ABHA ID · for Clinic OS", "In Progress", "warning"], [CheckCircle2, "ISO 27001", "Certified · audit Aug 2026", "Active", "success"], [Globe, "HIPAA-ready", "BAA template available", "Ready", "gray"]].map((c, i) => { const Icon = c[0]; return (
        <div key={i} className="flex gap-3 items-center p-3 rounded-lg border" style={{ borderColor: T.border }}><div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.primarySoft }}><Icon size={16} style={{ color: T.primary }} /></div><div className="flex-1"><div className="text-[13px] font-medium" style={{ color: T.text }}>{c[1]}</div><div className="text-xs" style={{ color: T.text2 }}>{c[2]}</div></div><Badge tone={c[4]}>{c[3]}</Badge></div>); })}
    </CardBody></Card>}
  </>);
}
