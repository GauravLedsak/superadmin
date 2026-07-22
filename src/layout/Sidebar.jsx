import { ChevronDown } from "lucide-react";
import { T, cx } from "../theme.js";
import { DASHBOARD_ITEM, SETTINGS_ITEM, NAV } from "../routes.js";
import ledsakLogo from "../assets/ledsak-logo.svg";
import { useState } from "react";

export function NavButton({ item, active, onNav, collapsed }) {
  const on = item.id === active; const Icon = item.icon;
  return (
    <button onClick={() => onNav(item.id)} title={collapsed ? item.label : undefined}
      className={cx("w-full my-px flex items-center rounded-md text-[13px] text-left transition-colors", collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2")}
      style={on ? { background: "#fff", color: T.primary, fontWeight: 600, boxShadow: "0 1px 2px rgba(0,0,0,.12)" } : { background: "transparent", color: T.sidebarText }}
      onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = T.sidebarHover; }} onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
      <Icon size={17} className="shrink-0" />
      {!collapsed && <span className="flex-1">{item.label}</span>}
      {!collapsed && item.badge && <span className="text-[10px] px-1.5 py-px rounded-full font-semibold" style={on ? { background: item.badge === "!" ? T.danger : T.primary, color: "#fff" } : { background: item.badge === "!" ? T.danger : "rgba(255,255,255,.25)", color: "#fff" }}>{item.badge}</span>}
    </button>
  );
}

/* ============================================================
   SIDEBAR — collapsible groups (plain text section label + chevron),
   expanded by default. Dashboard pinned top / Settings pinned bottom.
   Also supports a collapsed icon-rail mode toggled from the Topbar.
   ============================================================ */
export function Sidebar({ active, onNav, collapsed }) {
  const [open, setOpen] = useState(() => Object.fromEntries(NAV.map((g) => [g.section, true])));
  const toggle = (s) => setOpen((o) => ({ ...o, [s]: !o[s] }));
  return (
    <aside className={cx("shrink-0 flex flex-col h-full transition-[width] duration-150", collapsed ? "w-[72px]" : "w-[248px]")} style={{ background: T.sidebar, overflow: "hidden", borderRadius: "0 16px 16px 0", boxShadow: "0 4px 24px rgba(0,0,0,.18)" }}>
      {/* Brand — fixed, never scrolls */}
      <div className="flex items-center justify-center px-5 py-[18px] border-b shrink-0" style={{ borderColor: T.sidebarHover }}>
        {collapsed ? (
          <div className="w-7 h-6 overflow-hidden shrink-0"><img src={ledsakLogo} alt="LEDSAK" className="h-6 w-auto max-w-none" /></div>
        ) : (
          <img src={ledsakLogo} alt="LEDSAK" className="h-6 w-auto" />
        )}
      </div>
      {/* Nav groups — collapsible via chevron, expanded by default. Dashboard scrolls as
          the first item here rather than being pinned separately above. */}
      <nav className="flex-1 py-2 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: T.sidebarHover + " transparent" }}>
        <div className="px-2 mb-2">
          <NavButton item={DASHBOARD_ITEM} active={active} onNav={onNav} collapsed={collapsed} />
        </div>
        {NAV.map((g) => {
          const isOpen = !!open[g.section]; const hasActive = g.items.some((it) => it.id === active);
          return (
            <div key={g.section} className="mb-3">
              {!collapsed && (
                <button onClick={() => toggle(g.section)} className="w-full flex items-center gap-1 px-4 mb-1 text-[11px] font-medium transition-colors" style={{ color: T.sidebarMuted }}>
                  <ChevronDown size={12} className="transition-transform" style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }} />
                  <span className="flex-1 text-left">{g.section}</span>
                  {!isOpen && hasActive && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#fff" }} />}
                </button>
              )}
              {(collapsed || isOpen) && g.items.map((it) => (
                <div key={it.id} className="px-2">
                  <NavButton item={it} active={active} onNav={onNav} collapsed={collapsed} />
                </div>
              ))}
            </div>
          );
        })}
      </nav>
      {/* Settings — pinned to the absolute bottom, outside any group */}
      <div className="px-2 pb-2 pt-1 border-t shrink-0" style={{ borderColor: T.sidebarHover }}>
        <NavButton item={SETTINGS_ITEM} active={active} onNav={onNav} collapsed={collapsed} />
      </div>
    </aside>
  );
}
