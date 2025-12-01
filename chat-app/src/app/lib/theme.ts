// Minimal theme utilities used by UI components. Keeps behavior simple
// and works as a shim until a full implementation is provided.

export type Theme = 'light' | 'dark' | 'system';

const listeners: Array<() => void> = [];

export function applyTheme() {
  const t = getTheme();
  if (t === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

export function getTheme(): Theme {
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

export default { applyTheme, getTheme, setTheme, subscribe };
