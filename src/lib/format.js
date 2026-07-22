import { NOW } from "../data/constants.js";

export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const parseTaskDate = (s) => {
  if (!s) return null;
  const [dd, mon, yyyy] = s.split(" ");
  const mIdx = MONTHS_SHORT.indexOf(mon);
  if (mIdx === -1) return null;
  return new Date(Number(yyyy), mIdx, Number(dd));
};
export const fmtTaskDate = (d) => `${String(d.getDate()).padStart(2, "0")} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
export const TODAY = parseTaskDate(NOW);
export const isTaskOverdue = (t) => t.status !== "Done" && t.status !== "Skipped" && isOverdue(t.dueDate);

export const fmtINR = (n) => "₹" + Number(n).toLocaleString("en-IN");
export const fmtLakh = (n) => "₹" + (n / 100000).toFixed(1) + "L";
export const fmtK = (n) => (n / 1000).toFixed(0) + "K";
export const fmtRecords = (n) => n >= 100000 ? (n / 100000) + " lakh" : n.toLocaleString("en-IN");

export const parseDate = (s) => {
  if (!s) return null;
  const parts = s.split("-");
  if (parts.length === 3 && parts[2].length === 4) {
    return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  }
  const match = s.match(/^(\d{1,2})\s+(\w{3})\s+(\d{4})$/);
  if (match) return new Date(+match[3], MONTHS_SHORT.indexOf(match[2]), +match[1]);
  return new Date(s);
};
// Built from the same local-time constructor as parseDate (rather than `new Date("2026-05-13")`)
// so day-boundary comparisons don't drift with the host's UTC offset.
export const TODAY_DATE = new Date(2026, 4, 13);
export const isOverdue = (dueDateStr) => { const d = parseDate(dueDateStr); return d && d < TODAY_DATE; };
export const daysUntil = (dateStr) => { const d = parseDate(dateStr); if (!d) return null; return Math.round((d - TODAY_DATE) / 864e5); };
