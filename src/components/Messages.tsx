/**
 * Messages.tsx - Chat/Meldinger side
 *
 * Implementert med GitHub Copilot
 *
 * Hovedside for chat-funksjonalitet med tråder (samtaler) og meldinger.
 * Viser liste over venner (aksepterte vennskap) og lar brukere sende meldinger.
 *
 * Responsive design:
 * - Desktop: Trådliste til venstre, meldinger til høyre (side-by-side)
 * - Mobil: Full-skjerm visning av enten trådliste ELLER meldinger
 *   - Tilbake-knapp for å gå fra chat tilbake til trådliste
 *
 * Funksjoner:
 * - Real-time oppdatering av meldinger via rwsdk
 * - Profilbilder i trådliste og meldingsbobler
 * - Automatisk scrolling til nye meldinger
 */

import { rwsdk, type RWMessage, type RWThread } from "@/app/lib/rwsdk";
import AppLayout from "@/components/ui/AppLayout";
import { Button } from "@/components/ui/Button";
import { useEffect, useMemo, useState, useRef } from "react";

export default function MessagesPage() {
  const [threads, setThreads] = useState<RWThread[]>([]); // Liste over samtaler (venner)
  const [activeId, setActiveId] = useState<string | null>(null); // Aktiv samtale-ID
  const [messages, setMessages] = useState<RWMessage[]>([]); // Meldinger i aktiv samtale
  const [me, setMe] = useState(() => rwsdk.auth.useCurrentUser()); // Innlogget bruker
  const [text, setText] = useState(""); // Input-felt for ny melding
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  //Hent tråder (samtaler) ved første lasting
  //Copilot: Setter automatisk første tråd som aktiv hvis ingen er valgt
  useEffect(() => {
    rwsdk.chat.listThreads().then((t) => {
      setThreads(t);
      if (!activeId && t.length) setActiveId(t[0].id);
    });
  }, []);

  //Oppdater brukerdata når den endres
  //Copilot: Viktig for å vise riktig avatar og status
  useEffect(() => {
    const unsub = rwsdk.auth.onChange(() => setMe(rwsdk.auth.useCurrentUser()));
    return unsub;
  }, []);

  //Lytt på meldinger i aktiv tråd (real-time updates)
  //Copilot: rwsdk.chat.subscribe returnerer en unsubscribe-funksjon
  useEffect(() => {
    if (!activeId) return;
    const unsub = rwsdk.chat.subscribe(activeId, setMessages);
    return unsub; // Cleanup ved unmount eller når activeId endres
  }, [activeId]);

  /**
  Sender ny melding til aktiv samtale
  Copilot: Tømmer input-feltet etter sending
   */
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !text.trim()) return;
    await rwsdk.chat.send(activeId, text.trim());
    setText("");
  }

  // Beregn tittel for aktiv samtale (vennens navn)
  const activeTitle = useMemo(
    () => threads.find((t) => t.id === activeId)?.title ?? "",
    [threads, activeId]
  );

  return (
    <AppLayout title="Meldinger">
      {/* Hovedcontainer: Flex-col på mobil, flex-row på desktop */}
      <section className="flex flex-col md:flex-row h-[calc(100vh-12rem)] md:h-[80vh] rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <aside
          className={`${
            activeId && threads.length > 0 ? "hidden md:block" : "block"
          } w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto`}
        >
          <header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Samtaler
            </h2>
          </header>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {threads.length === 0 ? (
              <li className="px-4 py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                  Ingen samtaler enda
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">
                  Legg til venner for å starte en chat
                </p>
              </li>
            ) : (
              threads.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveId(t.id)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
                      t.id === activeId
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {/* Profilbilde eller initialer 
                      Copilot: avatarUrl kommer fra /api/threads med vennens profilbilde
                  */}
                    <figure className="h-10 w-10 flex-shrink-0">
                      <span className="block h-full w-full rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden flex items-center justify-center">
                        {t.avatarUrl ? (
                          <img
                            src={t.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="h-full w-full flex items-center justify-center text-white font-bold text-sm">
                            {t.title[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                      </span>
                    </figure>
                    <figcaption className="min-w-0 flex-1">
                      <p className="truncate font-medium">{t.title}</p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {t.lastMessage ?? "Ingen meldinger"}
                      </p>
                    </figcaption>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        {/* Meldinger - Full bredde på mobil */}
        <article
          className={`${
            !activeId && threads.length > 0 ? "hidden md:flex" : "flex"
          } flex-1 flex-col bg-white dark:bg-gray-900`}
        >
          {activeId ? (
            <>
              <header className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center gap-3">
                {/* Tilbake-knapp på mobil */}
                <button
                  onClick={() => setActiveId(null)}
                  className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                  aria-label="Tilbake til samtaler"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                  {activeTitle || "Samtale"}
                </h2>
              </header>

              <section
                aria-live="polite"
                className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3"
              >
                {messages.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Ingen meldinger ennå.
                  </p>
                ) : (
                  messages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      selfId={me?.id ?? ""}
                    />
                  ))
                )}
              </section>

              <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 md:p-4">
                <form
                  onSubmit={sendMessage}
                  className="flex items-end gap-2 md:gap-3"
                >
                  <label htmlFor="message" className="sr-only">
                    Melding
                  </label>
                  <textarea
                    ref={textareaRef}
                    id="message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e as any);
                      }
                    }}
                    placeholder="Skriv en melding..."
                    rows={1}
                    style={{
                      minHeight: "44px",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                    className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600
                              bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 md:px-4 py-2
                              focus:ring-2 focus:ring-blue-500 outline-none text-sm md:text-base"
                  />
                  <Button type="submit" disabled={!text.trim()}>
                    Send
                  </Button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p className="text-sm md:text-base">
                Velg en samtale for å starte
              </p>
            </div>
          )}
        </article>
      </section>
    </AppLayout>
  );
}

function MessageBubble({
  message,
  selfId,
}: {
  message: RWMessage;
  selfId: string;
}) {
  const mine = message.authorId === selfId;

  return (
    <article
      className={`flex gap-2 items-end ${
        mine ? "justify-end" : "justify-start"
      }`}
    >
      {/* Profilbilde for andre (vises på venstre side) */}
      {!mine && (
        <figure className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 overflow-hidden">
          {message.authorAvatar ? (
            <img
              src={message.authorAvatar}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="h-full w-full flex items-center justify-center text-white font-bold text-xs">
              {message.authorName?.[0]?.toUpperCase() || "?"}
            </span>
          )}
        </figure>
      )}

      <section
        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
          mine
            ? "bg-blue-600 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        }`}
      >
        {!mine && message.authorName && (
          <p className="text-xs font-semibold mb-1 opacity-70">
            {message.authorName}
          </p>
        )}
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

      {/* Profilbilde for egen bruker (vises på høyre side) */}
      {mine && message.authorAvatar && (
        <figure className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 overflow-hidden">
          <img
            src={message.authorAvatar}
            alt=""
            className="h-full w-full object-cover"
          />
        </figure>
      )}
    </article>
  );
}
