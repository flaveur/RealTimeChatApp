// src/app/lib/rwsdk.ts
export type Status = "online" | "busy" | "away";

export type RWUser = {
  id: string;
  name: string;
  avatarUrl?: string;
  status: Status;
};

export type RWThread = { id: string; title: string; lastMessage?: string };
export type RWMessage = { id: string; authorId: string; text: string; createdAt: string };

type Unsub = () => void;

// ----- Client-backed auth/chat adapter -----
const listeners = new Set<() => void>();

function notify() {
  for (const cb of listeners) cb();
}

let me: RWUser | null = null;

async function loadCurrentUser() {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/me", { credentials: "same-origin" });
    if (!res.ok) {
      // fall back to locally stored username (set at login) so the UI shows
      // something even if cookies/origin prevent /api/me from authenticating.
      const fallbackName = localStorage.getItem("username");
      me = fallbackName ? { id: `local-${fallbackName}`, name: fallbackName, status: "online" as Status } : null;
      notify();
      return;
    }
    const data = (await res.json()) as any;
    me = data?.user ?? null;
    notify();
  } catch (err) {
    const fallbackName = typeof window !== "undefined" ? localStorage.getItem("username") : null;
    me = fallbackName ? { id: `local-${fallbackName}`, name: fallbackName, status: "online" as Status } : null;
    notify();
  }
}

// Trigger initial load in the browser
if (typeof window !== "undefined") {
  // fire-and-forget
  void loadCurrentUser();
}

export const rwsdk = {
  auth: {
    useCurrentUser(): RWUser | null {
      return me;
    },
    onChange(cb: () => void): Unsub {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    // Update local state and (optionally) notify backend later
    setStatus(next: Status) {
      if (!me) return;
      me = { ...me, status: next };
      // best-effort notify backend (ignore result)
      try {
        fetch("/api/me/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      } catch (_) {}
      notify();
    },
  },

  chat: {
    async listThreads(): Promise<RWThread[]> {
      try {
  const res = await fetch("/api/threads");
  if (!res.ok) return [];
  const data = (await res.json()) as any;
  return data.threads || [];
      } catch (err) {
        console.error("listThreads error:", err);
        return [];
      }
    },
    subscribe(threadId: string, cb: (msgs: RWMessage[]) => void): Unsub {
      // Simple polling subscription (every 2s)
      let mounted = true;
      async function poll() {
        if (!mounted) return;
        try {
          const res = await fetch(`/api/messages?threadId=${encodeURIComponent(threadId)}`);
          if (res.ok) {
            const data = (await res.json()) as any;
            cb(data.messages || []);
          }
        } catch (err) {
          console.error("subscribe poll error:", err);
        }
        if (mounted) setTimeout(poll, 2000);
      }
      void poll();
      return () => { mounted = false; };
    },
    async send(threadId: string, text: string): Promise<void> {
      try {
        await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ threadId, text }) });
      } catch (err) {
        console.error("send error:", err);
      }
    }
  }
};