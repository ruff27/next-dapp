"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isLight = resolvedTheme === "light";
  return (
    <button
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className="rounded-xl border border-zinc-200/70 bg-white/80 px-3 py-1.5 text-sm transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
      title={isLight ? "Switch to dark" : "Switch to light"}
    >
      {isLight ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
