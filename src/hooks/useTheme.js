import { useState } from "react";

const THEME_KEY = "ledsak_theme";

// index.html already stamps data-theme on <html> before first paint (avoids a flash of
// the wrong theme) — this just reads that same decision back into React state so the
// toggle button and localStorage stay in sync with it.
const getInitialTheme = () => {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
  }
  return "light";
};

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  const applyTheme = (next) => {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
  };

  const toggleTheme = () => applyTheme(theme === "dark" ? "light" : "dark");

  return { theme, toggleTheme };
}
