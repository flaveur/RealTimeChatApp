'use client';

import { rwsdk, type RWMessage, type RWThread } from "@/app/lib/rwsdk";
import AppLayout from "@/components/ui/AppLayout";
import { Button } from "@/components/ui/Button";
import { useEffect, useMemo, useState } from "react";

export default function MessagesPage() {
  const [threads, setThreads] = useState<RWThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<RWMessage[]>([]);
  const [me, setMe] = useState(() => rwsdk.auth.useCurrentUser());
  const [text, setText] = useState("");

  // Hent tråder
  useEffect(() => {
    rwsdk.chat.listThreads().then((t) => {
      setThreads(t);
      if (!activeId && t.length) setActiveId(t[0].id);
    });
  }, []);

  // Oppdater brukerdata
  useEffect(() => {
    const unsub = rwsdk.auth.onChange(() => setMe(rwsdk.auth.useCurrentUser()));
    return unsub;
  }, []);

  // Lytt på meldinger i aktiv tråd
  useEffect(() => {
    if (!activeId) return;
    const unsub = rwsdk.chat.subscribe(activeId, setMessages);
    return unsub;
  }, [activeId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !text.trim()) return;
    await rwsdk.chat.send(activeId, text.trim());
    setText("");
  }

  const activeTitle = useMemo(
    () => threads.find((t) => t.id === activeId)?.title ?? "",
    [threads, activeId]
  );

  return (
    <AppLayout title="Meldinger">
      <section className="flex h-[80vh] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Trådliste */}
        <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
          <header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Samtaler
            </h2>
          </header>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setActiveId(t.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
                    t.id === activeId
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300"
                  }`}
                >
                  <figure
                    className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600"
                    aria-hidden
                  />
                  <figcaption className="min-w-0">
                    <p className="truncate font-medium">{t.title}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {t.lastMessage ?? "Ingen meldinger"}
                    </p>
                  </figcaption>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Meldinger */}
        <article className="flex flex-1 flex-col bg-white dark:bg-gray-900">
          <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeTitle || "Samtale"}
            </h2>
          </header>

          <section
            aria-live="polite"
            className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
          >
            {messages.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Ingen meldinger ennå.
              </p>
            ) : (
              messages.map((m) => (
                <MessageBubble key={m.id} message={m} selfId={me?.id ?? ""} />
              ))
            )}
          </section>

          <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
            <form onSubmit={sendMessage} className="flex items-end gap-3">
              <label htmlFor="message" className="sr-only">
                Melding
              </label>
              <textarea
                id="message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Skriv en melding..."
                rows={2}
                className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2
                           focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Button type="submit" disabled={!text.trim()}>
                Send
              </Button>
            </form>
          </footer>
        </article>
      </section>
    </AppLayout>
  );
}

function MessageBubble({ message, selfId }: { message: RWMessage; selfId: string }) {
  const mine = message.authorId === selfId;
  return (
    <article className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <section
        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
          mine
            ? "bg-blue-600 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        }`}
      >
        <p>{message.text}</p>
        <time
          dateTime={message.createdAt}
          className="block text-xs opacity-70 mt-1"
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </section>
    </article>
  );
}