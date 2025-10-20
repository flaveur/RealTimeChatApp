// src/app/lib/rwsdk.ts
export type RWUser = { id: string; name: string; avatarUrl?: string; status?: "online"|"busy"|"away" };
export type RWThread = { id: string; title: string; lastMessage?: string };
export type RWMessage = { id: string; authorId: string; text: string; createdAt: string };

type Unsub = () => void;

export const rwsdk = {
  auth: {
    // TODO: bytt til ekte Redwood SDK-auth
    useCurrentUser(): RWUser | null {
      return { id: "u-anne", name: "Anne", status: "busy" };
    }
  },
  chat: {
    // TODO: bytt til ekte kall mot Redwood SDK
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