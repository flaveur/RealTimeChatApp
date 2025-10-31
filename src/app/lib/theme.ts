// Enkel tema-håndtering for light/dark/system mode
// Basert på Tailwind CSS dark mode: https://tailwindcss.com/docs/dark-mode

export type Theme = "light" | "dark" | "system";

const THEME_KEY = "app-theme";
let currentTheme: Theme = "system";
const listeners = new Set<() => void>();

// Initialiser fra localStorage
if (typeof window !== "undefined") {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored && ["light", "dark", "system"].includes(stored)) {
    currentTheme = stored;
  }
}

export function getTheme(): Theme {
  return currentTheme;
}

export function setTheme(theme: Theme): void {
  currentTheme = theme;
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_KEY, theme);
  }
  applyTheme();
  listeners.forEach(cb => cb());
}

export function applyTheme(): void {
  if (typeof window === "undefined") return;

  const theme = getTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Lytt til system tema endringer
if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (currentTheme === "system") {
      applyTheme();
    }
  });
}
