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

// ----- ALPHA: enkel lokal status-store -----
const listeners = new Set<() => void>();

function readStatus(): Status {
  if (typeof window === "undefined") return "busy";
  const s = localStorage.getItem("status");
  return (s === "online" || s === "busy" || s === "away") ? s : "busy";
}

let me: RWUser = { id: "u-anne", name: "Anne", status: readStatus() };

function notify() {
  for (const cb of listeners) cb();
}

export const rwsdk = {
  auth: {
    useCurrentUser(): RWUser {
      return me;
    },
    onChange(cb: () => void): Unsub {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    setStatus(next: Status) {
      me = { ...me, status: next };
      if (typeof window !== "undefined") localStorage.setItem("status", next);
      notify();
    },
  },

  chat: {
    async listThreads(): Promise<RWThread[]> {
      return [
        { id: "t-shahd", title: "Shahd", lastMessage: "Send det i kveld?" },
        { id: "t-jan",   title: "Jan",   lastMessage: "👍" },
        { id: "t-rami",  title: "Rami",  lastMessage: "Klar for demo" },
        { id: "t-luka",  title: "Luka",  lastMessage: "Ikke glem å levere arbeidskrav :)" }
      ];
    },
    subscribe(threadId: string, cb: (msgs: RWMessage[]) => void): Unsub {
      const seed: RWMessage[] = [
        { id: "m1", authorId: "t-luka", text: "Ikke glem å levere arbeidskrav :)", createdAt: "2025-10-20T10:15:00Z" },
        { id: "m2", authorId: "u-anne", text: "Takk! :)", createdAt: "2025-10-20T10:16:00Z" }
      ];
      cb(seed);
      return () => {};
    },
    async send(threadId: string, text: string): Promise<void> {
      console.log("SEND →", threadId, text);
    }
  }
};