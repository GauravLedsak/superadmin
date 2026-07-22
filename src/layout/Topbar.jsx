import { useState } from "react";
import { PanelLeft, PanelLeftClose, RefreshCw, RotateCcw, Bell, Sun, Moon } from "lucide-react";
import { T } from "../theme.js";
import { ONBOARD_STORAGE_KEY } from "../data/seed.js";
import { LEADS_STORAGE_KEY, LEADS_AUDIT_KEY, PII_GRANTS_KEY } from "../data/leads.js";
import { useStore } from "../store/StoreContext.jsx";
import { Modal, Button } from "../components/ui.jsx";
import { PAGE_TITLES } from "../routes.js";
import { NotifPanel } from "./NotifPanel.jsx";
import { ProfileDropdown } from "./ProfileDropdown.jsx";

export const ALL_DEMO_STORAGE_KEYS = [ONBOARD_STORAGE_KEY, LEADS_STORAGE_KEY, LEADS_AUDIT_KEY, PII_GRANTS_KEY];


export function Topbar({ onGo, active, collapsed, onToggleCollapse, theme, onToggleTheme }) {
  const store = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [checkedOut, setCheckedOut] = useState(true);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [lastSynced] = useState(() => new Date().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }).replace(",", ""));
  const unread = store.notifs.filter((n) => !n.read).length;
  const pageTitle = PAGE_TITLES[active] || "Dashboard";
  const handleResetAllDemoData = () => {
    ALL_DEMO_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };
  return (
    <div className="flex items-center gap-4 px-5 py-3" style={{ background: T.sidebar, borderRadius: 14, boxShadow: "0 4px 24px rgba(0,0,0,.18)", color: "#fff" }}>
      <button onClick={onToggleCollapse} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>
        {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
      </button>
      <div className="text-[17px] font-bold shrink-0" style={{ color: "#fff" }}>{pageTitle}</div>
      <div className="hidden md:flex items-center gap-1.5 text-[12px] pl-2 border-l" style={{ color: "rgba(255,255,255,.6)", borderColor: "rgba(255,255,255,.2)" }}>
        <RefreshCw size={13} /> Last Synced — {lastSynced}
        <button onClick={() => setResetConfirm(true)} title="Reset demo data" className="ml-0.5 p-1 rounded" style={{ color: "rgba(255,255,255,.5)" }}><RotateCcw size={12} /></button>
      </div>
      <Modal open={resetConfirm} onClose={() => setResetConfirm(false)} title="Reset Demo Data"
        footer={<><Button onClick={() => setResetConfirm(false)}>Cancel</Button><Button variant="danger" onClick={handleResetAllDemoData}><RotateCcw size={13} />Reset everything</Button></>}>
        <p className="text-[13px]" style={{ color: T.text2 }}>
          This restores every module's original seed data — Lead & Record Management (including the leads that start <strong style={{ color: T.danger }}>failed</strong> or <strong style={{ color: T.purple }}>duplicate</strong>) and Client Onboarding — and clears all local mutations, audit trails, and PII access grants. The page will reload.
        </p>
        <div className="mt-3 rounded-lg px-3 py-2 text-[12px]" style={{ background: T.warningSoft, color: T.warningFg }}>
          This is a demo-data reset only — it doesn't touch the rest of the app, and can't be undone.
        </div>
      </Modal>
      <div className="flex items-center gap-2.5 ml-auto">
        <label className="flex items-center gap-2 text-[12px] font-medium cursor-pointer select-none" style={{ color: "rgba(255,255,255,.85)" }}>
          <span className="hidden sm:inline">{checkedOut ? "Checked Out" : "Checked In"}</span>
          <button type="button" role="switch" aria-checked={checkedOut} onClick={() => setCheckedOut((c) => !c)} className="w-9 h-5 rounded-full relative transition-colors" style={{ background: checkedOut ? "#fff" : "rgba(255,255,255,.25)" }}>
            <span className="absolute top-0.5 w-4 h-4 rounded-full transition-all" style={{ background: checkedOut ? T.primary : "#fff", left: checkedOut ? 18 : 2 }} />
          </button>
        </label>
        <button onClick={onToggleTheme} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <div className="relative">
          <button onClick={() => setNotifOpen((o) => !o)} onBlur={() => setTimeout(() => setNotifOpen(false), 200)} className="relative w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>
            <Bell size={17} />{unread > 0 && <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: T.danger }}>{unread}</span>}
          </button>
          <NotifPanel open={notifOpen} onClose={() => setNotifOpen(false)} onGo={onGo} />
        </div>
        <ProfileDropdown onGo={onGo} />
      </div>
    </div>
  );
}
