// src/app/lib/rwsdk.ts - Forenklet versjon
export type Status = "online" | "busy" | "away";

export type RWUser = {
  id: string;
  name: string;
  avatarUrl?: string;
  status: Status;
};

export type RWThread = { id: string; title: string; lastMessage?: string; avatarUrl?: string };
export type RWMessage = { id: string; authorId: string; text: string; createdAt: string; authorName?: string; authorAvatar?: string };

type Unsub = () => void;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(cb => cb());

let me: RWUser | null = null;

async function loadCurrentUser() {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/me", { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json() as any;
      me = data?.user ?? null;
      notify();
    }
  } catch (err) {
    console.error("Failed to load user:", err);
  }
}

// Auto-load bruker i browser
if (typeof window !== "undefined") {
  void loadCurrentUser();
}

export const rwsdk = {
  auth: {
    useCurrentUser: () => me,
    onChange: (cb: () => void): Unsub => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    setStatus(status: Status) {
      if (!me) return;
      me = { ...me, status };
      fetch("/api/me/status", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ status }) 
      }).catch(() => {});
      notify();
    },
    async updateName(name: string) {
      const res = await fetch("/api/me/name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as any;
        return { ok: false, error: data.error };
      }
      const data = await res.json() as any;
      if (me) me = { ...me, name: data.name };
      notify();
      return { ok: true };
    },
    async updateAvatar(file: File) {
      const form = new FormData();
      form.append("avatar", file);
      const res = await fetch("/api/me/avatar", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as any;
        return { ok: false, error: data.error };
      }
      const data = await res.json() as any;
      if (me) me = { ...me, avatarUrl: data.avatarUrl };
      notify();
      return { ok: true, avatarUrl: data.avatarUrl };
    },
  },

  chat: {
    async listThreads(): Promise<RWThread[]> {
      try {
        const res = await fetch("/api/threads");
        if (!res.ok) return [];
        const data = await res.json() as any;
        return data.threads || [];
      } catch {
        return [];
      }
    },
    subscribe(threadId: string, cb: (msgs: RWMessage[]) => void): Unsub {
      let mounted = true;
      async function poll() {
        if (!mounted) return;
        try {
          const res = await fetch(`/api/messages?threadId=${encodeURIComponent(threadId)}`);
          if (res.ok) {
            const data = await res.json() as any;
            cb(data.messages || []);
          }
        } catch {}
        if (mounted) setTimeout(poll, 2000);
      }
      void poll();
      return () => { mounted = false; };
    },
    async send(threadId: string, text: string) {
      await fetch("/api/messages", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ threadId, text }) 
      });
    }
  }
};