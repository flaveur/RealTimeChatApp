"use client";

import AppLayout from "@/app/components/ui/AppLayout";
import { Button } from "@/app/components/ui/Button";
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
    <AppLayout title="Meldinger">
      <section className="messages-root">
        <aside className={`${activeId && threads.length > 0 ? 'hidden md:block' : 'block'} messages-sidebar`}>
          <header className="messages-sidebar-header">
            <h2 className="messages-sidebar-title">Samtaler</h2>
          </header>
          <ul className="messages-thread-list">
            {threads.map((t) => (
              <li key={t.id}>
                <button onClick={() => setActiveId(t.id)} className={`messages-thread-item ${t.id === activeId ? 'active' : ''}`}>
                  <figure className="messages-thread-avatar">
                    {t.avatarUrl ? <img src={t.avatarUrl} alt="" className="object-cover" /> : <span className="messages-initials">{t.title[0]?.toUpperCase() || "?"}</span>}
                  </figure>
                  <figcaption className="messages-thread-meta">
                    <p className="truncate font-medium">{t.title}</p>
                    <p className="truncate text-xs text-muted">{t.lastMessage ?? "Ingen meldinger"}</p>
                  </figcaption>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <article className={`${!activeId && threads.length > 0 ? 'hidden md:flex' : 'flex'} messages-article`}>
          {activeId ? (
            <>
              <header className="messages-article-header">
                <button onClick={() => setActiveId(null)} className="md:hidden p-2" aria-label="Tilbake til samtaler">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-base md:text-lg font-semibold">{activeTitle || "Samtale"}</h2>
              </header>

              <section aria-live="polite" className="messages-list">
                {messages.length === 0 ? <p className="text-muted text-sm">Ingen meldinger ennå.</p> : messages.map((m) => <MessageBubble key={m.id} message={m} selfId={me?.id ?? ""} />)}
              </section>

              <footer className="messages-footer">
                <form onSubmit={sendMessage} className="flex items-end gap-2 md:gap-3 w-full">
                  <label htmlFor="message" className="sr-only">Melding</label>
                  <textarea id="message" value={text} onChange={(e) => setText(e.target.value)} placeholder="Skriv en melding..." rows={1} className="messages-input" />
                  <Button type="submit" disabled={!text.trim()}>Send</Button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted"><p className="text-sm md:text-base">Velg en samtale for å starte</p></div>
          )}
        </article>
      </section>
    </AppLayout>
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
