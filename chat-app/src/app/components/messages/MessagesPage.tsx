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
      <aside className="w-56 border-r border-gray-800 flex flex-col bg-gray-950 py-4">
        <div className="px-4 mb-4">
          <div className="p-4 rounded-2xl border border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-3 mb-4">
              <figure className="relative h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">
                  {me?.name
                    ? me.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "?"}
                </span>
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></span>
              </figure>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{me?.name ?? "User"}</p>
                <p className="text-xs text-gray-400">Frakoblet</p>
              </div>
            </div>
            <button className="w-full text-center text-xs px-3 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition font-medium">
              Rediger profil
            </button>
          </div>
        </div>

        <nav className="px-4 space-y-2">
          <a
            href="/messages"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm transition hover:bg-blue-700"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Meldinger
          </a>
          <a
            href="/friends"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800/50 font-medium text-sm transition"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6 1h-2.5a3.5 3.5 0 0 0-3 1.6 3.5 3.5 0 0 0-3-1.6H6c-2.2 0-4 1.8-4 4v2h2v-2c0-1.1.9-2 2-2h2.5c.83 0 1.54.4 2 1 .46-.6 1.17-1 2-1H18c1.1 0 2 .9 2 2v2h2v-2c0-2.2-1.8-4-4-4z" />
            </svg>
            Venneliste
          </a>
          <a
            href="/notes"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800/50 font-medium text-sm transition"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Mine notater
          </a>
          <a
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800/50 font-medium text-sm transition"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.1.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.1-.62l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            Innstillinger
          </a>
        </nav>
      </aside>

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