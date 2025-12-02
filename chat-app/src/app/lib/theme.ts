/**
 * Theme utilities med synkronisering til server
 * 
 * Denne modulen håndterer temavalg (lys/mørk/system) for applikasjonen.
 * Temaet lagres både i localStorage for rask tilgang og synkroniseres
 * til serveren for persistens på tvers av enheter.
 * 
 * Kilde/inspirasjon: RedwoodSDK dokumentasjon for klient-side state management
 * https://rwsdk.com/docs
 */

export type Theme = 'light' | 'dark' | 'system';

// Liste over subscribers som blir varslet når tema endres
// Brukes av useSyncExternalStore i React for reaktiv oppdatering
const listeners: Array<() => void> = [];
let isInitialized = false;

/**
 * Sjekker om brukerens system foretrekker mørk modus
 * Bruker CSS Media Query via JavaScript
 */
function prefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Anvender valgt tema på dokumentet
 * Legger til/fjerner 'dark' klasse på html-elementet
 * og setter color-scheme for native elementer
 */
export function applyTheme() {
  const t = getTheme();
  const shouldBeDark = t === 'dark' || (t === 'system' && prefersDark());
  
  if (shouldBeDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
}

/**
 * Henter gjeldende tema fra localStorage
 * Returnerer 'dark' som standard hvis ikke satt
 */
export function getTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'dark';
  return (localStorage.getItem('theme') as Theme) ?? 'dark';
}

/**
 * Setter nytt tema og oppdaterer UI
 * @param t - Nytt tema ('light', 'dark', eller 'system')
 * @param saveToServer - Om temaet skal lagres til serveren (default: true)
 */
export function setTheme(t: Theme, saveToServer = true) {
  localStorage.setItem('theme', t);
  applyTheme();
  // Varsle alle subscribers om endringen
  listeners.forEach((l) => l());
  
  // Lagre til server i bakgrunnen for synkronisering
  if (saveToServer) {
    saveThemeToServer(t);
  }
}

/**
 * Lagrer tema til server via API
 * Kjører asynkront uten å blokkere UI
 */
async function saveThemeToServer(theme: Theme) {
  try {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
      credentials: 'same-origin',
    });
  } catch (err) {
    console.error('Kunne ikke lagre tema til server:', err);
  }
}

/**
 * Henter brukerens lagrede tema fra serveren
 * Brukes ved oppstart for å synkronisere på tvers av enheter
 */
export async function loadThemeFromServer(): Promise<Theme | null> {
  try {
    const res = await fetch('/api/settings', { credentials: 'same-origin' });
    if (res.ok) {
      const data = await res.json() as { theme?: Theme };
      return data.theme ?? null;
    }
  } catch (err) {
    console.error('Kunne ikke hente tema fra server:', err);
  }
  return null;
}

/**
 * Initialiserer tema ved oppstart
 * Bruker localStorage først for umiddelbar respons,
 * deretter synkroniserer med server for konsistens
 */
export async function initializeTheme() {
  if (isInitialized) return;
  isInitialized = true;
  
  // Først bruk localStorage for umiddelbar respons (unngår flash)
  applyTheme();
  
  // Deretter synkroniser med server
  const serverTheme = await loadThemeFromServer();
  if (serverTheme && serverTheme !== getTheme()) {
    setTheme(serverTheme, false); // Ikke lagre tilbake til server (unngår loop)
  }
}

/**
 * Subscriber-funksjon for React useSyncExternalStore
 * Returnerer en cleanup-funksjon for å avregistrere
 */
export function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

// Lytt på endringer i systemets fargepreferanse
// Oppdaterer automatisk når bruker endrer systemtema
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'system') {
      applyTheme();
      listeners.forEach((l) => l());
    }
  });
  
  // Initialiser tema ved oppstart
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyTheme();
    });
  } else {
    applyTheme();
  }
}

export default { applyTheme, getTheme, setTheme, subscribe, initializeTheme, loadThemeFromServer };
