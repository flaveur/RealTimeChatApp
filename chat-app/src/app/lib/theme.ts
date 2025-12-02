// Minimal theme utilities used by UI components. Keeps behavior simple
// and works as a shim until a full implementation is provided.

export type Theme = 'light' | 'dark' | 'system';

const listeners: Array<() => void> = [];

// Sjekk om bruker foretrekker mørk modus basert på systeminnstillinger
function prefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme() {
  const t = getTheme();
  const shouldBeDark = t === 'dark' || (t === 'system' && prefersDark());
  
  if (shouldBeDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function getTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) ?? 'system';
}

export function setTheme(t: Theme) {
  localStorage.setItem('theme', t);
  applyTheme();
  listeners.forEach((l) => l());
}

export function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

// Lytt på endringer i systemets fargepreferanse
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'system') {
      applyTheme();
      listeners.forEach((l) => l());
    }
  });
}

export default { applyTheme, getTheme, setTheme, subscribe };
