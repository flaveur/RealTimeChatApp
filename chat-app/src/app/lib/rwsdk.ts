// Lightweight shim for rwsdk used by UI components during build.
// Replace with the real rwsdk wrapper when available.

export type Status = "online" | "busy" | "away" | "offline";

type User = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  status?: Status;
};

const listeners: Array<() => void> = [];

const state = {
  currentUser: null as User | null,
};

export const rwsdk = {
  auth: {
    useCurrentUser() {
      return state.currentUser;
    },
    onChange(cb: () => void) {
      listeners.push(cb);
      return () => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },
    async setStatus(s: Status) {
      try {
        const res = await fetch("/api/me/status", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: s }),
        });
        if (!res.ok) return { ok: false, error: "Failed to update status" };
        
        if (state.currentUser) state.currentUser.status = s;
        listeners.forEach((l) => l());
        return { ok: true };
      } catch (error) {
        return { ok: false, error: String(error) };
      }
    },
    async updateName(name: string) {
      try {
        const res = await fetch("/api/me/name", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) {
          const data = await res.json();
          return { ok: false, error: data.error || "Failed to update name" };
        }
        
        if (state.currentUser) state.currentUser.name = name;
        listeners.forEach((l) => l());
        return { ok: true };
      } catch (error) {
        return { ok: false, error: String(error) };
      }
    },
    async updateAvatar(file: File) {
      // Avatar opplasting er ikke implementert ennå
      return { ok: true };
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
