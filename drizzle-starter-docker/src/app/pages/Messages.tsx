'use client';

import { rwsdk, type RWMessage, type RWThread } from "@/app/lib/rwdsk";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function Messages() {
  const [threads, setThreads] = useState<RWThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<RWMessage[]>([]);

  useEffect(() => {
    rwsdk.chat.listThreads().then((t: RWThread[]) => {
      setThreads(t);
      if (!activeId && t.length) setActiveId(t[0].id);
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const off = rwsdk.chat.subscribe(activeId, setMessages);
    return off;
  }, [activeId]);

  const activeTitle = useMemo(
    () => threads.find(t => t.id === activeId)?.title ?? "",
    [threads, activeId]
  );

  return (
    <section className="min-h-screen bg-gray-100">
      <main className="mx-auto flex max-w-[1400px] gap-0 p-4">
        <Sidebar />

        <section className="w-80 border-r bg-white">
          <header className="border-b px-4 py-3">
            <h2 className="text-sm font-medium text-gray-600">Samtaler</h2>
          </header>
          <ul className="divide-y">
            {threads.map(t => (
              <li key={t.id}>
                <button
                  onClick={() => setActiveId(t.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left
                    ${t.id === activeId ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  aria-current={t.id === activeId ? "true" : "false"}
                >
                  <span className="inline-flex h-8 w-8 rounded-full bg-gray-200" aria-hidden />
                  <span className="min-w-0">
                    <strong className="block truncate text-sm">{t.title}</strong>
                    <span className="block truncate text-xs text-gray-500">{t.lastMessage ?? "\u00A0"}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex min-h-[80vh] flex-1 flex-col bg-white">
          <header className="border-b px-6 py-4">
            <h2 className="text-base font-semibold">{activeTitle}</h2>
          </header>

          <section className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
            {messages.map(m => (
              <MessageBubble key={m.id} message={m} selfId="u-anne" />
            ))}
          </section>

          <footer className="border-t px-6 py-4">
            <MessageInput
              disabled={!activeId}
              onSend={async (text) => {
                if (!activeId || !text.trim()) return;
                await rwsdk.chat.send(activeId, text.trim());
              }}
            />
          </footer>
        </section>
      </main>
    </section>
  );
}

function MessageBubble({ message, selfId }: { message: RWMessage; selfId: string }) {
  const mine = message.authorId === selfId;
  return (
    <article className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <section className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm leading-relaxed
        ${mine ? "bg-brand-blue text-white" : "bg-gray-200 text-gray-800"}`}>
        <p>{message.text}</p>
        <time className={`mt-1 block text-[11px] opacity-75 ${mine ? "text-white" : "text-gray-600"}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </time>
      </section>
    </article>
  );
}

function MessageInput({ onSend, disabled }: { onSend: (text: string) => void | Promise<void>; disabled?: boolean }) {
  const [text, setText] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await onSend(text);
    setText("");
  }
  return (
    <form onSubmit={submit} className="flex items-center gap-3">
      <label className="sr-only" htmlFor="message">Skriv en melding</label>
      <textarea
        id="message"
        className="min-h-10 w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 outline-none focus:border-brand-blue focus:bg-white"
        placeholder="Skriv en melding..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
