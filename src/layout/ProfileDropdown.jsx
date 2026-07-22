import { useState } from "react";
import { ChevronDown, UserCog, LogOut } from "lucide-react";
import { T } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";

export function ProfileDropdown({ onGo }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition" style={{ background: "rgba(255,255,255,.12)" }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[11px]" style={{ background: "#fff", color: T.primary }}>SK</div>
        <div className="text-left hidden sm:block"><div className="text-[12px] font-medium leading-tight text-white">Saif Khan</div><div className="text-[10px]" style={{ color: "rgba(255,255,255,.6)" }}>Super Admin</div></div>
        <ChevronDown size={14} style={{ color: "rgba(255,255,255,.6)" }} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-30 w-52 rounded-xl border bg-[var(--t-surface)] shadow-xl py-1" style={{ borderColor: T.border }} onMouseDown={(e) => e.stopPropagation()}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: T.border }}>
            <div className="text-[13px] font-medium" style={{ color: T.text }}>Saif Khan</div>
            <div className="text-[11px]" style={{ color: T.text2 }}>Founder · Super Admin</div>
          </div>
          <button onMouseDown={() => { onGo("settings"); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-left hover:bg-[var(--t-subtle)]" style={{ color: T.text }}><UserCog size={14} /> Profile & Settings</button>
          <button onMouseDown={() => store.notify("Logged out")} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-left hover:bg-[var(--t-subtle)]" style={{ color: T.danger }}><LogOut size={14} /> Log Out</button>
        </div>
      )}
    </div>
  );
}
