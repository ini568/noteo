import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";
type Mode = "system" | "light" | "dark";

const ThemeContext = createContext({
  mode: "system" as Mode,
  theme: "light" as Theme, // effective theme
  toggle: () => {},
  setTheme: (_: Theme) => {},
  setMode: (_: Mode) => {}
});

function getSystemTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem("themeMode") as Mode) || "system");
  const [explicitTheme, setExplicitTheme] = useState<Theme>(() => (localStorage.getItem("theme") as Theme) || "light");

  const theme = useMemo<Theme>(() => (mode === "system" ? getSystemTheme() : explicitTheme), [mode, explicitTheme]);

  useEffect(() => {
    // persist
    localStorage.setItem("themeMode", mode);
    localStorage.setItem("theme", explicitTheme);
  }, [mode, explicitTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("theme-dark");
    else root.classList.remove("theme-dark");
  }, [theme]);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const on = () => {
      const root = document.documentElement;
      if (mq?.matches) root.classList.add("theme-dark");
      else root.classList.remove("theme-dark");
    };
    try { mq?.addEventListener?.("change", on); } catch { mq?.addListener?.(on as any); }
    on();
    return () => { try { mq?.removeEventListener?.("change", on); } catch { mq?.removeListener?.(on as any); } };
  }, [mode]);

  const toggle = () => setExplicitTheme(t => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ mode, theme, toggle, setTheme: setExplicitTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
