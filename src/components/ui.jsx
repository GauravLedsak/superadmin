import React, { useState, useMemo } from "react";
import {
  ArrowUpRight, ArrowDownRight, ChevronDown, ChevronRight, Star, MessageSquare, Mail,
  ArrowLeft, MoreHorizontal, X, CheckCircle2, Search, Copy, Check,
} from "lucide-react";
import { T, cx } from "../theme.js";
import { fmtLakh } from "../lib/format.js";

export function Card({ className, style, onClick, children }) {
  return (
    <div onClick={onClick} className={cx("rounded-xl border", onClick && "cursor-pointer hover:shadow-md transition-shadow", className)}
      style={{ background: T.surface, borderColor: T.border, boxShadow: "0 1px 3px rgba(26,31,54,.06), 0 1px 2px rgba(26,31,54,.04)", ...style }}>
      {children}
    </div>
  );
}
export function CardHeader({ title, action, sub }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.border }}>
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight" style={{ color: T.text }}>{title}</h3>
        {sub && <p className="text-xs mt-0.5" style={{ color: T.text2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
export const CardBody = ({ className, children }) => <div className={cx("px-5 py-4", className)}>{children}</div>;

export function Button({ variant = "default", size = "md", className, style, children, ...p }) {
  const base = "inline-flex items-center gap-1.5 font-medium rounded-lg transition-all border select-none disabled:opacity-50";
  const sizes = { md: "px-3.5 py-2 text-[13px]", sm: "px-2.5 py-1.5 text-xs", icon: "w-9 h-9 justify-center p-0" };
  const variants = {
    default: { background: T.surface, color: T.text, borderColor: T.border },
    primary: { background: T.primary, color: "#fff", borderColor: T.primary, boxShadow: "0 1px 2px rgba(41,95,178,.25)" },
    ghost: { background: "transparent", color: T.text2, border: "1px solid transparent" },
    danger: { background: T.surface, color: T.danger, borderColor: T.dangerBorder },
  };
  return (
    <button {...p} className={cx(base, sizes[size], "hover:brightness-[.97]", className)} style={{ ...variants[variant], ...style }}>{children}</button>
  );
}

export function Badge({ tone = "gray", children }) {
  const map = {
    success: [T.successSoft, T.successFg], danger: [T.dangerSoft, T.dangerFg], warning: [T.warningSoft, T.warningFg],
    info: [T.primarySoft, T.accentText], purple: [T.purpleSoft, T.purpleFg], gray: [T.graySoft, T.text2], brand: [T.primarySoft, T.accentText],
    // Critical severity (Logs & Audit) — visually louder than plain "danger" per spec: dark/bold.
    dangerStrong: [T.dangerStrong, T.dangerStrongFg],
  };
  const [bg, fg] = map[tone] || map.gray;
  return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: bg, color: fg }}>{children}</span>;
}

// Small icon-button that copies a value to the clipboard and flashes a checkmark — used
// throughout Logs & Audit detail drawers for IDs, correlation IDs, IPs.
export function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const onCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(String(value)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); });
  };
  return (
    <button onClick={onCopy} title={`Copy ${label || "value"}`} className="inline-flex items-center gap-1 p-0.5 rounded hover:bg-[var(--t-hover)]" style={{ color: copied ? T.success : T.text3 }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

// Collapsible, monospace pretty-printed JSON block — used for raw payloads / stack traces
// across Logs & Audit detail drawers. `collapsedLines` controls how many lines show by
// default before a "Show more" toggle appears.
export function JSONBlock({ data, collapsedLines = 8 }) {
  const [open, setOpen] = useState(false);
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const lines = text.split("\n");
  const needsToggle = lines.length > collapsedLines;
  const shown = open || !needsToggle ? text : lines.slice(0, collapsedLines).join("\n") + "\n…";
  return (
    <div className="rounded-lg border" style={{ borderColor: T.border, background: T.subtle }}>
      <pre className="text-[11.5px] font-mono px-3 py-2.5 overflow-x-auto whitespace-pre-wrap" style={{ color: T.text2 }}>{shown}</pre>
      {needsToggle && (
        <button onClick={() => setOpen((o) => !o)} className="w-full text-center text-[11px] font-medium py-1.5 border-t hover:bg-[var(--t-hover)]" style={{ borderColor: T.border, color: T.primary }}>
          {open ? "Show less" : `Show ${lines.length - collapsedLines} more lines`}
        </button>
      )}
    </div>
  );
}

// Checkbox dropdown for multi-select filters (e.g. Severity) — closes on outside click.
export function MultiSelectFilter({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border" style={{ borderColor: selected.length ? T.primary : T.border, background: selected.length ? T.primarySoft : T.surface, color: selected.length ? T.accentText : T.text }}>
        {label}{selected.length ? ` (${selected.length})` : ""} <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-30 w-44 rounded-lg border bg-[var(--t-surface)] shadow-lg py-1" style={{ borderColor: T.border }}>
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-3 py-1.5 text-[13px] cursor-pointer hover:bg-[var(--t-subtle)]" style={{ color: T.text }}>
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="w-3.5 h-3.5 rounded" style={{ accentColor: T.primary }} />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// Date/time range filter with quick presets + a custom start/end fallback — shared by every
// Logs & Audit tab. `presets` is a plain string list; "Custom" reveals two datetime inputs.
export function DateRangeFilter({ presets, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const isCustom = value.preset === "Custom";
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border" style={{ borderColor: value.preset ? T.primary : T.border, background: value.preset ? T.primarySoft : T.surface, color: value.preset ? T.accentText : T.text }}>
        {value.preset || "Date range"} <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-30 w-56 rounded-lg border bg-[var(--t-surface)] shadow-lg py-1" style={{ borderColor: T.border }}>
          {presets.map((p) => (
            <button key={p} onClick={() => { onChange({ preset: p, start: null, end: null }); if (p !== "Custom") setOpen(false); }} className="w-full flex items-center px-3 py-1.5 text-[13px] text-left hover:bg-[var(--t-subtle)]" style={{ color: p === value.preset ? T.primary : T.text }}>{p}</button>
          ))}
          {isCustom && (
            <div className="px-3 py-2 space-y-1.5 border-t" style={{ borderColor: T.border }}>
              <input type="datetime-local" value={value.start || ""} onChange={(e) => onChange({ ...value, start: e.target.value })} className="w-full px-2 py-1 rounded border text-xs" style={{ borderColor: T.border }} />
              <input type="datetime-local" value={value.end || ""} onChange={(e) => onChange({ ...value, end: e.target.value })} className="w-full px-2 py-1 rounded border text-xs" style={{ borderColor: T.border }} />
            </div>
          )}
          {value.preset && (
            <button onClick={() => { onChange({ preset: null, start: null, end: null }); setOpen(false); }} className="w-full flex items-center px-3 py-1.5 text-[13px] text-left border-t hover:bg-[var(--t-subtle)]" style={{ color: T.text3, borderColor: T.border }}>Clear</button>
          )}
        </div>
      )}
    </div>
  );
}

export function Avatar({ name, tone = "brand", size = 28 }) {
  const map = { brand: [T.primarySoft, T.accentText], green: [T.successSoft, T.successFg], purple: [T.purpleSoft, T.purpleFg] };
  const [bg, fg] = map[tone] || map.brand;
  return <div className="rounded-full flex items-center justify-center font-semibold shrink-0" style={{ width: size, height: size, fontSize: size * 0.4, background: bg, color: fg }}>{name.charAt(0).toUpperCase()}</div>;
}

export function Progress({ value, tone, w = 70 }) {
  const color = tone || (value >= 75 ? T.success : value >= 50 ? T.warning : T.danger);
  return (
    <div className="inline-flex items-center gap-2">
      <div className="h-1.5 rounded-full overflow-hidden" style={{ width: w, background: T.border }}><div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} /></div>
      <span className="text-xs font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}

export const RISK_TONE = { High: "danger", Medium: "warning", Low: "success" };
export const STATUS_TONE = { Active: "success", Trial: "warning", Suspended: "danger", Churned: "danger", Paid: "success", Pending: "warning", Failed: "danger", Open: "danger", Resolved: "success", Invited: "warning" };
export function statusBadge(s) { return <Badge tone={STATUS_TONE[s] || RISK_TONE[s] || "gray"}>{s}</Badge>; }
// Separate from statusBadge/STATUS_TONE — "Open" means something different (and not
// urgent) for a CS task than it does for a support ticket, so task statuses get their own tones.
export const TASK_STATUS_TONE = { Open: "gray", "In Progress": "info", Done: "success", Skipped: "warning" };
export function taskStatusBadge(s) { return <Badge tone={TASK_STATUS_TONE[s] || "gray"}>{s}</Badge>; }

export function Kpi({ label, value, sub, trend }) {
  const c = trend === "pos" ? T.success : trend === "neg" ? T.danger : trend === "warn" ? T.warning : T.text2;
  const Ic = trend === "pos" ? ArrowUpRight : trend === "neg" ? ArrowDownRight : null;
  return (
    <div className="rounded-xl border transition-all hover:-translate-y-0.5" style={{ background: T.surface, borderColor: T.border, boxShadow: "0 2px 8px rgba(26,31,54,.07)", padding: "20px 16px" }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: T.text3 }}>{label}</div>
      <div className="text-[28px] leading-none font-bold mt-2 tracking-tight" style={{ color: T.text }}>{value}</div>
      {sub && <div className="text-xs mt-2 flex items-center gap-1" style={{ color: c }}>{Ic && <Ic size={13} />}{sub}</div>}
    </div>
  );
}

// Table body scrolls internally, filling whatever height its flex parent gives it — the
// header row stays pinned via `sticky` so only the rows scroll, never the page itself.
// Pass `fill` (default) inside a `flex flex-col` Card sized by the page layout; pass
// `maxHeight` instead for standalone use outside a flex-fill container.
export function Table({ head, children, maxHeight }) {
  return (
    <div className={cx("overflow-auto", !maxHeight && "flex-1 min-h-0")} style={{ maxHeight, minHeight: maxHeight ? 160 : undefined }}>
      <table className="w-full border-separate text-[13px]" style={{ borderSpacing: 0 }}>
        <thead><tr>{head.map((h, i) => (
          // box-shadow instead of border-b: with border-collapse, Chromium resolves each
          // cell's shared bottom border independently at fractional zoom/DPR, so adjacent
          // columns' lines land on different sub-pixel rows and visibly step/break. An inset
          // box-shadow paints per-cell with no collapse resolution, so it can't misalign.
          <th key={i} className="sticky top-0 z-10 text-left text-[11px] font-semibold uppercase tracking-wider px-3.5 py-2.5 whitespace-nowrap" style={{ color: T.text3, boxShadow: `inset 0 -1px 0 ${T.border}`, background: T.subtle }}>{h}</th>
        ))}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// Client-side pagination for list pages: slices `rows` into a page, resetting to page 1
// whenever the filtered row count or page size changes (new filters shouldn't strand you on page 4).
export function usePagination(rows, initialPerPage = 10) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  React.useEffect(() => { setPage(1); }, [rows.length, perPage]);
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => rows.slice((safePage - 1) * perPage, safePage * perPage), [rows, safePage, perPage]);
  return { pageRows, page: safePage, setPage, perPage, setPerPage, totalPages, total: rows.length };
}

// Full pagination bar — results-per-page selector, row-range label, numbered pages, and
// (when a selection is active) a "Selected N" indicator, matching the product's own list UI.
export function Pagination({ page, totalPages, setPage, perPage, setPerPage, total, selectedCount }) {
  const pageNumbers = useMemo(() => {
    const set = new Set([1, totalPages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= totalPages));
    return Array.from(set).sort((a, b) => a - b);
  }, [page, totalPages]);
  if (total === 0) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 flex-wrap gap-3" style={{ borderColor: T.border }}>
      <div className="flex items-center gap-3 text-[12px]" style={{ color: T.text2 }}>
        <div className="flex items-center gap-1.5">
          <span>Result Per Page</span>
          <div className="relative">
            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="appearance-none pl-2.5 pr-6 py-1 rounded-md text-xs border outline-none" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.text3 }} />
          </div>
        </div>
        {!!selectedCount && <span className="font-medium" style={{ color: T.primary }}>Selected {selectedCount}</span>}
        <span style={{ color: T.text3 }}>{from}–{to} of {total} shown</span>
      </div>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--t-subtle)]" style={{ borderColor: T.border, color: T.text2 }}>
          <ChevronLeftIcon /> Prev
        </button>
        {pageNumbers.map((n, i) => (
          <React.Fragment key={n}>
            {i > 0 && n - pageNumbers[i - 1] > 1 && <span className="px-1 text-xs" style={{ color: T.text3 }}>…</span>}
            <button onClick={() => setPage(n)} className="w-7 h-7 rounded-md text-xs font-medium" style={n === page ? { background: T.primary, color: "#fff" } : { color: T.text2 }}>{n}</button>
          </React.Fragment>
        ))}
        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--t-subtle)]" style={{ borderColor: T.border, color: T.text2 }}>
          Next <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
export const ChevronLeftIcon = ({ size = 13 }) => <ChevronRight size={size} className="rotate-180" />;

// Click-to-sort column header — pass an array of these inside a Table's `head` prop wherever
// a column should be sortable. `sort` is { key, dir }; clicking the active column flips dir,
// clicking a new column selects it desc-first (matches "default sort by timestamp desc").
export function SortableTh({ label, sortKey, sort, onChange }) {
  const active = sort.key === sortKey;
  return (
    <button onClick={() => onChange({ key: sortKey, dir: active && sort.dir === "desc" ? "asc" : "desc" })} className="inline-flex items-center gap-0.5 hover:opacity-80">
      {label}
      {active && <ChevronDown size={11} className={active && sort.dir === "asc" ? "rotate-180" : ""} />}
    </button>
  );
}

// Closes a menu on outside click only — unlike onBlur+setTimeout, this doesn't fire while
// interacting with elements inside the menu itself (checkboxes, drill-in navigation, drag).
export function useClickOutside(ref, onOutside) {
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onOutside(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

// Row-selection for bulk actions: tracks a Set of selected row ids scoped to the current
// (filtered) row list — selection auto-drops any id that filters out from under it.
export function useRowSelection(pageRows, allRows, idKey = "id") {
  const [selected, setSelected] = useState(() => new Set());
  const lastClickedRef = React.useRef(null);
  const pageIds = useMemo(() => pageRows.map((r) => r[idKey]), [pageRows, idKey]);
  const allIds = useMemo(() => allRows.map((r) => r[idKey]), [allRows, idKey]);
  React.useEffect(() => {
    setSelected((s) => {
      const idSet = new Set(allIds);
      const next = new Set([...s].filter((id) => idSet.has(id)));
      return next.size === s.size ? s : next;
    });
  }, [allIds]);
  // Gmail-style shift-click: extends the selection across every row between the last
  // clicked checkbox and this one (within the current page), instead of just toggling one.
  // `prevClicked` is captured *before* calling setSelected (not mutated inside the updater)
  // so the range computation stays correct and idempotent even if the updater runs more
  // than once for a single click (React StrictMode double-invokes it in dev).
  const toggle = (id, opts) => {
    const prevClicked = lastClickedRef.current;
    lastClickedRef.current = id;
    setSelected((s) => {
      const n = new Set(s);
      if (opts?.shiftKey && prevClicked != null) {
        const lastIdx = pageIds.indexOf(prevClicked);
        const curIdx = pageIds.indexOf(id);
        if (lastIdx !== -1 && curIdx !== -1) {
          const [from, to] = lastIdx < curIdx ? [lastIdx, curIdx] : [curIdx, lastIdx];
          for (let i = from; i <= to; i++) n.add(pageIds[i]);
          return n;
        }
      }
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const selectPage = () => setSelected(new Set(pageIds));
  const selectAllFiltered = () => setSelected(new Set(allIds));
  const clear = () => setSelected(new Set());
  const toggleAll = () => (pageIds.every((id) => selected.has(id)) ? clear() : selectPage());
  const isAll = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  return { selected, toggle, toggleAll, selectPage, selectAllFiltered, clear, isAll, isSome: selected.size > 0, totalFiltered: allIds.length };
}

// Gmail hides row checkboxes until you hover the row (or it's already checked) — the parent
// <tr> needs className="group" for the reveal to work.
export function RowCheckbox({ checked, onChange, indeterminate }) {
  const ref = React.useRef(null);
  const shiftRef = React.useRef(false);
  React.useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  // shiftKey only exists on the mousedown/click MouseEvent, not the change event, so it's
  // captured on mousedown and read back inside onChange. Letting onChange (not a
  // preventDefault-ed click) drive the toggle keeps the checkbox's native activation
  // behavior intact — calling preventDefault() on a checkbox's click desyncs React's
  // internal "tracked value" for that DOM node, silently breaking later controlled updates.
  return (
    <input ref={ref} type="checkbox" checked={checked}
      onMouseDown={(e) => { shiftRef.current = e.shiftKey; }}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e, shiftRef.current)}
      className="w-4 h-4 rounded cursor-pointer"
      style={{ accentColor: T.primary }} />
  );
}

// Star toggle for favoriting a row (Gmail-style), sits beside the row checkbox.
export function StarToggle({ starred, onToggle }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="flex items-center justify-center p-0.5 rounded hover:bg-[var(--t-hover)]" title={starred ? "Unstar" : "Star"}>
      <Star size={15} fill={starred ? T.warning : "none"} style={{ color: starred ? T.warning : T.text3 }} />
    </button>
  );
}

// Select-all header control, Gmail-style: the checkbox itself toggles the current page,
// while the adjoining chevron opens a menu to select the page, everything matching the
// current filters, or to clear the selection entirely.
export function SelectAllHeader({ sel }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex items-center gap-0.5">
      <RowCheckbox checked={sel.isAll} indeterminate={sel.isSome && !sel.isAll} onChange={sel.toggleAll} />
      <button onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} onBlur={() => setTimeout(() => setOpen(false), 200)} className="p-0.5 rounded hover:bg-[var(--t-hover)]" style={{ color: T.text3 }}>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-30 w-56 rounded-xl border bg-[var(--t-surface)] shadow-xl py-1 normal-case font-normal" style={{ borderColor: T.border }} onMouseDown={(e) => e.stopPropagation()}>
          <button onMouseDown={() => { sel.selectPage(); setOpen(false); }} className="w-full flex items-center px-4 py-2 text-[13px] text-left hover:bg-[var(--t-subtle)]" style={{ color: T.text }}>Select this page</button>
          <button onMouseDown={() => { sel.selectAllFiltered(); setOpen(false); }} className="w-full flex items-center px-4 py-2 text-[13px] text-left hover:bg-[var(--t-subtle)]" style={{ color: T.text }}>Select all {sel.totalFiltered} that match filters</button>
          <button onMouseDown={() => { sel.clear(); setOpen(false); }} className="w-full flex items-center px-4 py-2 text-[13px] text-left hover:bg-[var(--t-subtle)]" style={{ color: T.text }}>Clear selection</button>
        </div>
      )}
    </div>
  );
}

// Dropdown shown in place of the page's primary "Add" action once rows are selected.
export function BulkActionsMenu({ count, onAction }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium text-white" style={{ background: T.primary }}>
        {count} selected <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-30 w-52 rounded-xl border bg-[var(--t-surface)] shadow-xl py-1" style={{ borderColor: T.border }} onMouseDown={(e) => e.stopPropagation()}>
          <button onMouseDown={() => { onAction("whatsapp"); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-left hover:bg-[var(--t-subtle)]" style={{ color: T.text }}><MessageSquare size={14} /> Bulk WhatsApp</button>
          <button onMouseDown={() => { onAction("email"); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-left hover:bg-[var(--t-subtle)]" style={{ color: T.text }}><Mail size={14} /> Bulk Email</button>
        </div>
      )}
    </div>
  );
}
export const Td = ({ className, style, children, colSpan }) => (
  <td colSpan={colSpan} className={cx("px-3.5 py-3 align-middle", className)} style={{ boxShadow: `inset 0 -1px 0 ${T.border}`, ...style }}>{children}</td>
);
export function NameCell({ name, sub, tone, onClick, hideAvatar }) {
  return (
    <div className={cx("flex items-center gap-2.5", onClick && "cursor-pointer group")} onClick={onClick}>
      {!hideAvatar && <Avatar name={name} tone={tone} />}
      <div><div className={cx("font-medium", onClick && "group-hover:underline")} style={{ color: onClick ? T.primary : T.text }}>{name}</div>{sub && <div className="text-[11px]" style={{ color: T.text2 }}>{sub}</div>}</div>
    </div>
  );
}

export function PageHeader({ title, desc, actions, back }) {
  return (
    <div className="flex justify-between items-start mb-5 gap-4 flex-wrap">
      <div>
        {back && <button onClick={back} className="flex items-center gap-1 text-[13px] mb-2 hover:underline" style={{ color: T.primary }}><ArrowLeft size={14} /> Back</button>}
        <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: T.text }}>{title}</h1>
        {desc && <p className="text-[13px] mt-1" style={{ color: T.text2 }}>{desc}</p>}
      </div>
      <div className="flex gap-2 flex-wrap">{actions}</div>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-0.5 border-b mb-4" style={{ borderColor: T.border }}>
      {tabs.map((t) => {
        const on = t === value;
        return <button key={t} onClick={() => onChange(t)} className="px-3.5 py-2.5 text-[13px] font-medium -mb-px border-b-2 transition-colors whitespace-nowrap"
          style={on ? { color: T.primary, borderColor: T.primary } : { color: T.text2, borderColor: "transparent" }}>{t}</button>;
      })}
    </div>
  );
}

export function Field({ label, children }) {
  return <div><div className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.text3 }}>{label}</div><div className="text-[13px]" style={{ color: T.text }}>{children}</div></div>;
}

export function Switch({ on, onClick }) {
  return (
    <button onClick={onClick} className="relative shrink-0 rounded-full transition-colors" style={{ width: 36, height: 20, background: on ? T.primary : T.borderStrong }}>
      <span className="absolute top-0.5 rounded-full bg-[var(--t-surface)] transition-all" style={{ width: 16, height: 16, left: on ? 18 : 2, boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
    </button>
  );
}

export function BarList({ rows, max, fmt }) {
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={i}>
          <div className="flex justify-between text-[11px] mb-1"><span style={{ color: T.text }}>{r.label}</span><span className="font-medium" style={{ color: T.text2 }}>{fmt ? fmt(r.value) : r.value}{r.note ? ` · ${r.note}` : ""}</span></div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: T.border }}><div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: r.color || T.primary }} /></div>
        </div>
      ))}
    </div>
  );
}

export function BarChart({ data, max, fmt }) {
  return (
    <div className="flex items-end gap-2.5 h-40 px-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="text-[11px] font-semibold" style={{ color: T.text }}>{(fmt || fmtLakh)(d.v)}</div>
          <div className="w-full rounded-t transition-opacity hover:opacity-85" style={{ height: `${(d.v / max) * 100}%`, minHeight: 12, background: i === data.length - 1 ? T.primary : T.borderStrong }} />
          <div className="text-[11px]" style={{ color: T.text3 }}>{d.m}</div>
        </div>
      ))}
    </div>
  );
}

/* Dropdown menu (row actions) --------------------------------------- */
export function Menu({ items }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} onBlur={() => setTimeout(() => setOpen(false), 150)} className="p-1 rounded hover:bg-[var(--t-hover)]"><MoreHorizontal size={16} style={{ color: T.text3 }} /></button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border bg-[var(--t-surface)] py-1 shadow-lg" style={{ borderColor: T.border }}>
          {items.map((it, i) => it.divider ? <div key={i} className="my-1 border-t" style={{ borderColor: T.border }} /> : (
            <button key={i} onMouseDown={it.onClick} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left hover:bg-[var(--t-subtle)]" style={{ color: it.danger ? T.danger : T.text }}>
              {it.icon && <it.icon size={14} />}{it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Drawer (tenant 360 / detail panels) ------------------------------- */
export function Drawer({ open, onClose, children, width = 620 }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(26,31,54,.35)" }} />
      <div className="absolute right-0 top-0 h-full bg-[var(--t-surface)] shadow-2xl overflow-y-auto animate-[slideIn_.2s_ease]" style={{ width: "min(92vw," + width + "px)" }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* Modal -------------------------------------------------------------- */
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(26,31,54,.35)" }} />
      <div className="relative w-full max-w-md rounded-xl bg-[var(--t-surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.border }}>
          <h3 className="text-[15px] font-semibold" style={{ color: T.text }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--t-hover)]"><X size={16} style={{ color: T.text3 }} /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: T.border }}>{footer}</div>}
      </div>
    </div>
  );
}

/* Toast -------------------------------------------------------------- */
export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] text-white shadow-lg animate-[slideIn_.2s_ease]" style={{ background: T.text }}>
      <CheckCircle2 size={15} style={{ color: T.success }} /> {msg}
    </div>
  );
}

/* Filter pill -------------------------------------------------------- */
export function FilterPill({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="px-2.5 py-1.5 rounded-md text-xs border transition"
      style={active ? { background: T.primarySoft, borderColor: T.primary, color: T.accentText } : { background: T.surface, borderColor: T.border, color: T.text }}>{children}</button>
  );
}

/* Search input ------------------------------------------------------- */
export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1 max-w-[300px]">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.text3 }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-2" style={{ borderColor: T.border, background: T.surface, "--tw-ring-color": T.ring }} />
    </div>
  );
}
