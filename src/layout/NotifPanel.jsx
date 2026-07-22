import { TriangleAlert, AlertTriangle, CheckCircle2, CircleDot } from "lucide-react";
import { T } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";

export function NotifPanel({ open, onClose, onGo }) {
  const store = useStore();
  const iconMap = { danger: [TriangleAlert, T.danger], warning: [AlertTriangle, T.warning], success: [CheckCircle2, T.success], info: [CircleDot, T.primary] };
  if (!open) return null;
  return (
    <div className="absolute right-0 top-11 z-30 w-80 rounded-xl border bg-[var(--t-surface)] shadow-xl" style={{ borderColor: T.border }} onMouseDown={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: T.border }}>
        <span className="text-[14px] font-semibold" style={{ color: T.text }}>Notifications</span>
        <button onClick={store.markAllRead} className="text-xs font-medium" style={{ color: T.primary }}>Mark all read</button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {store.notifs.map((n) => { const [Ic, col] = iconMap[n.icon]; return (
          <button key={n.id} onClick={() => { store.markNotifRead(n.id); onGo(n.page); onClose(); }} className="w-full flex gap-3 items-start px-4 py-3 text-left border-b hover:bg-[var(--t-subtle)]" style={{ borderColor: T.border, background: n.read ? "#fff" : T.subtle }}>
            <Ic size={16} style={{ color: col, marginTop: 2 }} />
            <div className="flex-1"><div className="text-[13px]" style={{ color: T.text, fontWeight: n.read ? 400 : 600 }}>{n.title}</div><div className="text-[11px] mt-0.5" style={{ color: T.text3 }}>{n.time}</div></div>
            {!n.read && <span className="w-2 h-2 rounded-full mt-1.5" style={{ background: T.primary }} />}
          </button>
        ); })}
      </div>
    </div>
  );
}
