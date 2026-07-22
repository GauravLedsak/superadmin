import { Eye, X } from "lucide-react";
import { T } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";

export function ImpersonationBanner() {
  const store = useStore();
  if (!store.impersonating) return null;
  const name = store.impersonating.name || store.impersonating;
  return (
    <div className="flex items-center gap-2 px-7 py-2 text-[13px] text-white" style={{ background: T.warning }}>
      <Eye size={15} /> <span className="font-medium">Viewing as {name}</span>
      <span style={{ opacity: 0.9 }}>— actions are performed on their behalf</span>
      <button onClick={store.stopImpersonate} className="ml-auto flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium" style={{ background: "rgba(255,255,255,.25)" }}><X size={13} /> Exit</button>
    </div>
  );
}

