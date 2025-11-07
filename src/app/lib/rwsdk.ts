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
      // Ingen mock-tråder som standard — returner en tom liste slik at UI kan hente reelle data
      return [];
    },
    subscribe(threadId: string, cb: (msgs: RWMessage[]) => void): Unsub {
      // Ingen forhåndsseedede meldinger — kaller tilbake med en tom tabell. Reell
      // implementasjon bør abonnere på backend eller realtime-tjeneste.
      cb([]);
      return () => {};
    },
    async send(threadId: string, text: string): Promise<void> {
      console.log("SEND →", threadId, text);
    }
  }
};