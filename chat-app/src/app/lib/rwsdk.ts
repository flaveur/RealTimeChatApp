/**
 * rwsdk - RedwoodSDK Klient-shim
 * 
 * Dette er en lettvekt "shim" (mellomlag) som simulerer deler av
 * RedwoodSDK's klient-API for bruk i UI-komponenter.
 * 
 * Hovedformål:
 * 1. Holder styr på innlogget bruker (currentUser)
 * 2. Synkroniserer brukerdata med serveren via API-kall
 * 3. Varsler React-komponenter om endringer via et pub/sub mønster
 * 
 * Arkitektur:
 * - Bruker et sentralt "state" objekt for global tilstand
 * - "listeners" array holder callback-funksjoner fra React hooks
 * - "snapshot" brukes for useSyncExternalStore kompatibilitet
 * 
 * Kode skrevet med assistanse fra AI (GitHub Copilot / Claude).
 */

// Lightweight shim for rwsdk used by UI components during build.
// Replace with the real rwsdk wrapper when available.

// Mulige statuser for en bruker
export type Status = "online" | "busy" | "away" | "offline";

// Bruker-type som representerer innlogget bruker
type User = {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string | null;
  statusText?: string | null;
  status: Status;
};

/**
 * Liste over callback-funksjoner som skal kalles ved endringer.
 * Hver React-komponent som bruker useAuth() registrerer seg her.
 */
const listeners: Array<() => void> = [];

/**
 * Global tilstand for autentisering.
 * 
 * - currentUser: Den faktiske brukerdataen
 * - initialized: Om vi har forsøkt å hente brukerdata fra server
 * - snapshot: Kopi av currentUser for React's useSyncExternalStore
 *   (React trenger en ny objektreferanse for å oppdage endringer)
 */
const state = {
  currentUser: null as User | null,
  initialized: false,
  // Snapshot for useSyncExternalStore - ny referanse ved hver endring
  snapshot: null as User | null,
};

/**
 * Varsler alle registrerte listeners om at tilstanden har endret seg.
 * Lager en ny snapshot-referanse slik at React oppdager endringen.
 */
function notifyListeners() {
  // Lag en ny snapshot-referanse slik at useSyncExternalStore oppdager endringen
  state.snapshot = state.currentUser ? { ...state.currentUser } : null;
  listeners.forEach((l) => l());
}

/**
 * Hovedobjektet som eksporteres - inneholder alle auth-metoder
 */
export const rwsdk = {
  auth: {
    /**
     * Henter nåværende bruker (for useSyncExternalStore)
     * Returnerer snapshot som har ny referanse ved hver endring
     */
    useCurrentUser() {
      // Returner snapshot for useSyncExternalStore-kompatibilitet
      return state.snapshot;
    },
    
    /**
     * Direkte tilgang til currentUser (for ikke-reaktiv bruk)
     * Bruk useCurrentUser() i React-komponenter for reaktivitet
     */
    getCurrentUser() {
      return state.currentUser;
    },
    
    /**
     * Sjekker om vi har forsøkt å hente brukerdata
     */
    isInitialized() {
      return state.initialized;
    },
    
    /**
     * Registrerer en callback som kalles ved endringer.
     * Returnerer en "unsubscribe" funksjon for opprydding.
     * 
     * Brukes av React's useSyncExternalStore:
     * useSyncExternalStore(rwsdk.auth.onChange, rwsdk.auth.useCurrentUser)
     */
    onChange(cb: () => void) {
      listeners.push(cb);
      // Returner unsubscribe-funksjon
      return () => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },
    
    /**
     * Henter brukerdata fra API-et (/api/me)
     * Kalles ved app-oppstart for å sjekke om brukeren er innlogget
     */
    async fetchCurrentUser() {
      try {
        const res = await fetch("/api/me", { credentials: "same-origin" });
        if (res.ok) {
          const data = await res.json();
          state.currentUser = {
            id: data.id,
            name: data.name || data.username,
            username: data.username,
            avatarUrl: data.avatarUrl,
            statusText: data.statusText,
            status: data.status || "offline",
          };
          state.initialized = true;
          // Oppdater snapshot og notify
          state.snapshot = { ...state.currentUser };
          notifyListeners();
          return state.currentUser;
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
      state.initialized = true;
      state.snapshot = null;
      return null;
    },
    
    /**
     * Oppdaterer lokal brukerdata uten server-kall
     * Nyttig for optimistiske oppdateringer
     */
    updateLocalUser(updates: Partial<User>) {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...updates };
        notifyListeners();
      }
    },
    
    /**
     * Oppdaterer brukerens status (online/busy/away/offline)
     * Synkroniserer med serveren via PUT /api/me/status
     */
    async setStatus(s: Status) {
      try {
        const res = await fetch("/api/me/status", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: s }),
          credentials: "same-origin",
        });
        if (!res.ok) return { ok: false, error: "Failed to update status" };
        
        if (state.currentUser) {
          state.currentUser.status = s;
          notifyListeners();
        }
        return { ok: true };
      } catch (error) {
        return { ok: false, error: String(error) };
      }
    },
    
    /**
     * Oppdaterer brukerens statustekst (f.eks. "I et møte")
     * Synkroniserer med serveren via PUT /api/me/status-text
     */
    async setStatusText(statusText: string) {
      try {
        const res = await fetch("/api/me/status-text", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statusText }),
          credentials: "same-origin",
        });
        if (!res.ok) {
          const data = await res.json() as { error?: string };
          return { ok: false, error: data.error || "Failed to update status text" };
        }
        
        if (state.currentUser) {
          state.currentUser.statusText = statusText || null;
          notifyListeners();
        }
        return { ok: true };
      } catch (error) {
        return { ok: false, error: String(error) };
      }
    },
    
    /**
     * Oppdaterer brukerens profilbilde (kun lokalt)
     * Server-oppdatering skjer via egen avatar-upload API
     */
    async updateAvatar(avatarUrl: string) {
      try {
        if (state.currentUser) {
          state.currentUser.avatarUrl = avatarUrl;
          notifyListeners();
        }
        return { ok: true };
      } catch (error) {
        return { ok: false, error: String(error) };
      }
    },
  },
  
  /**
   * Minimal chat API shim - placeholder for fremtidig implementasjon
   * Denne delen er ikke fullt implementert ennå
   */
  chat: {
    async listThreads() {
      return [] as any[];
    },
    subscribe(_threadId: string, cb: (msgs: any[]) => void) {
      // no-op: return unsubscribe
      return () => {};
    },
    async send(_threadId: string, _text: string) {
      return { ok: true };
    },
  },
};

export default rwsdk;

