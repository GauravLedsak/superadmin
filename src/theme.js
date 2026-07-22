// Every color here resolves through a CSS custom property (defined for both themes in
// index.css) so toggling [data-theme] on <html> re-themes every T.xxx usage instantly,
// without needing components to re-render. Sidebar/topbar tokens are the one exception —
// the sidebar stays the same brand blue in both themes, so they're plain literals.
export const T = {
  primary: "var(--t-primary)", primaryDark: "var(--t-primary-dark)", primarySoft: "var(--t-primary-soft)", accentText: "var(--t-accent-text)",
  sidebar: "#295FB2", sidebarHover: "#1E4A8F", sidebarText: "#E8EEFA", sidebarMuted: "#DDE6F7",
  bg: "var(--t-bg)", surface: "var(--t-surface)", subtle: "var(--t-subtle)", hover: "var(--t-hover)", border: "var(--t-border)", borderStrong: "var(--t-border-strong)",
  text: "var(--t-text)", text2: "var(--t-text2)", text3: "var(--t-text3)", ring: "var(--t-ring)",
  success: "var(--t-success)", successSoft: "var(--t-success-soft)", warning: "var(--t-warning)", warningSoft: "var(--t-warning-soft)",
  danger: "var(--t-danger)", dangerSoft: "var(--t-danger-soft)", purple: "var(--t-purple)", purpleSoft: "var(--t-purple-soft)",
  // Foreground colors for the *Soft tone pairs above (badges, alert boxes) — kept separate
  // since a fg that's readable on a light pastel bg isn't automatically readable once that
  // bg goes dark-and-muted in dark mode.
  successFg: "var(--t-success-fg)", dangerFg: "var(--t-danger-fg)", warningFg: "var(--t-warning-fg)", purpleFg: "var(--t-purple-fg)",
  successBorder: "var(--t-success-border)", dangerBorder: "var(--t-danger-border)",
  dangerStrong: "var(--t-danger-strong)", dangerStrongFg: "var(--t-danger-strong-fg)",
  graySoft: "var(--t-gray-soft)",
};

export const cx = (...a) => a.filter(Boolean).join(" ");
