// Lightweight shim for rwsdk used by UI components during build.
// Replace with the real rwsdk wrapper when available.

export type Status = "online" | "busy" | "away" | "offline";

type User = {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string | null;
  statusText?: string | null;
  status: Status;
};

const listeners: Array<() => void> = [];

const state = {
  currentUser: null as User | null,
  initialized: false,
  // Snapshot for useSyncExternalStore - ny referanse ved hver endring
  snapshot: null as User | null,
};

function notifyListeners() {
  // Lag en ny snapshot-referanse slik at useSyncExternalStore oppdager endringen
  state.snapshot = state.currentUser ? { ...state.currentUser } : null;
  listeners.forEach((l) => l());
}

export const rwsdk = {
  auth: {
    useCurrentUser() {
      // Returner snapshot for useSyncExternalStore-kompatibilitet
      return state.snapshot;
    },
    // Direkte tilgang til currentUser (for ikke-reaktiv bruk)
    getCurrentUser() {
      return state.currentUser;
    },
    isInitialized() {
      return state.initialized;
    },
    onChange(cb: () => void) {
      listeners.push(cb);
      return () => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },
    // Hent brukerdata fra API
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
    // Oppdater lokal state og notify listeners
    updateLocalUser(updates: Partial<User>) {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...updates };
        notifyListeners();
      }
    },
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
  // Minimal chat API shim
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
