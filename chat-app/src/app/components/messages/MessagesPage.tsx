"use client";

import { useEffect, useMemo, useState } from "react";
import { rwsdk } from "@/app/lib/rwsdk";
import "./messages.css";

interface RWThread {
  id: string;
  title: string;
  avatarUrl?: string | null;
  lastMessage?: string | null;
}

interface RWMessage {
  id: string;
  authorId: string;
  authorName?: string | null;
  authorAvatar?: string | null;
  text: string;
  createdAt: string;
}

export default function MessagesPageComponent() {
  const [threads, setThreads] = useState<RWThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<RWMessage[]>([]);
  const [me, setMe] = useState(() => rwsdk.auth.useCurrentUser?.());
  const [text, setText] = useState("");

  useEffect(() => {
    rwsdk.chat?.listThreads?.().then((t: RWThread[] = []) => {
      setThreads(t);
      if (!activeId && t.length) setActiveId(t[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const unsub = rwsdk.auth.onChange?.(() => setMe(rwsdk.auth.useCurrentUser?.()));
    return unsub;
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const unsub = rwsdk.chat?.subscribe?.(activeId, (msgs: RWMessage[]) => setMessages(msgs));
    return unsub;
  }, [activeId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !text.trim()) return;
    await rwsdk.chat?.send?.(activeId, text.trim());
    setText("");
  }

  const activeTitle = useMemo(() => threads.find((t) => t.id === activeId)?.title ?? "", [threads, activeId]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-950">
      

      <div className="w-64 border-r border-gray-800 flex flex-col bg-gray-900/50">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">Samtaler</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">Ingen samtaler enda</p>
              <p className="text-xs text-gray-500">Legg til venner for å starte en chat</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {threads.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveId(t.id)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
                      t.id === activeId
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <figure className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {t.avatarUrl ? (
                        <img src={t.avatarUrl} alt="" className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {t.title[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                    </figure>
                    <figcaption className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="truncate text-xs text-gray-400">
                        {t.lastMessage ?? "Ingen meldinger"}
                      </p>
                    </figcaption>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeId ? (
          <>
            <header className="px-6 py-4 border-b border-gray-800 bg-gray-900 flex items-center gap-3 flex-shrink-0">
              <h2 className="text-lg font-semibold text-white">{activeTitle || "Samtale"}</h2>
            </header>

            <section className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Ingen meldinger ennå.</p>
              ) : (
                messages.map((m) => <MessageBubble key={m.id} message={m} selfId={me?.id ?? ""} />)
              )}
            </section>

            <footer className="border-t border-gray-800 bg-gray-900 p-4 flex-shrink-0">
              <form onSubmit={sendMessage} className="flex items-end gap-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Skriv en melding..."
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-gray-700 bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 transition text-sm"
                >
                  Send
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="text-sm">Velg en samtale for å starte</p>
          </div>
        )}
      </main>
    </div>
  );
}

function MessageBubble({ message, selfId }: { message: any; selfId: string }) {
  const mine = message.authorId === selfId;
  return (
    <article className={`flex gap-2 items-end ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && (
        <figure className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 overflow-hidden">
          {message.authorAvatar ? <img src={message.authorAvatar} alt="" className="h-full w-full object-cover" /> : <span className="h-full w-full flex items-center justify-center text-white font-bold text-xs">{message.authorName?.[0]?.toUpperCase() || "?"}</span>}
        </figure>
      )}

      <section className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${mine ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"}`}>
        {!mine && message.authorName && <p className="text-xs font-semibold mb-1 opacity-70">{message.authorName}</p>}
        <p>{message.text}</p>
        <time dateTime={message.createdAt} className="block text-xs opacity-70 mt-1">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
      </section>

      {mine && message.authorAvatar && (
        <figure className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 overflow-hidden"><img src={message.authorAvatar} alt="" className="h-full w-full object-cover" /></figure>
      )}
    </article>
  );
}