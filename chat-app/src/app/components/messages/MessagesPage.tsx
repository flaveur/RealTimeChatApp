"use client";

import { useEffect, useState, useRef } from "react";
import "./messages.css";

interface Friend {
  id: number;
  username: string;
  displayName?: string;
  status: string;
  avatarUrl?: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  readAt?: string;
  createdAt: string;
}

interface Conversation {
  friend: Friend;
  lastMessage: Message | null;
  unreadCount: number;
}

export default function MessagesPageComponent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(true); // For mobil navigasjon
  const menuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  //Scroller til bunnen når nye meldinger kommer
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //lukker menyen når man klikker utenfor
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadMe();
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeId !== null) {
      loadConversation(activeId);
      markAsRead(activeId);
      // På mobil, så skjuler samtale-listen når en samtale er valgt
      if (window.innerWidth < 768) {
        setShowConversations(false);
      }
    }
  }, [activeId]);

  async function loadMe() {
    try {
      const res = await fetch("/api/me", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setMe(data);
      }
    } catch (err) {
      console.error("Feil ved henting av bruker:", err);
    }
  }

  async function loadConversations() {
    try {
      setLoading(true);
      const res = await fetch("/api/messages", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Kunne ikke hente samtaler");
      const data = await res.json() as { conversations: Conversation[] };
      setConversations(data.conversations || []);
      
      if (data.conversations && data.conversations.length > 0 && activeId === null) {
        setActiveId(data.conversations[0].friend.id);
      }
    } catch (err: any) {
      console.error("Feil ved henting av samtaler:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadConversation(friendId: number) {
    try {
      const res = await fetch(`/api/messages/${friendId}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("Kunne ikke hente meldinger");
      const data = await res.json() as { messages: Message[]; friend: Friend };
      setMessages(data.messages || []);
      setActiveFriend(data.friend);
    } catch (err: any) {
      console.error("Feil ved henting av meldinger:", err);
    }
  }

  async function markAsRead(friendId: number) {
    try {
      await fetch(`/api/messages/${friendId}/read`, {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (err) {
      console.error("Feil ved marking som lest:", err);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (activeId === null || !text.trim()) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeId, content: text.trim() }),
        credentials: "same-origin",
      });

      if (!res.ok) throw new Error("Kunne ikke sende melding");
      
      setText("");
      await loadConversation(activeId);
      await loadConversations();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleRemoveFriend() {
    if (!activeId || !activeFriend) return;
    
    const confirmRemove = confirm(`Er du sikker på at du vil fjerne ${activeFriend.displayName || activeFriend.username} som venn?`);
    if (!confirmRemove) return;

    try {
      const res = await fetch("/api/friends/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId: String(activeId) }),
        credentials: "same-origin",
      });

      if (!res.ok) throw new Error("Kunne ikke fjerne venn");
      
      setMenuOpen(false);
      setActiveId(null);
      setActiveFriend(null);
      setMessages([]);
      setShowConversations(true);
      await loadConversations();
      alert("Venn fjernet");
    } catch (err: any) {
      alert(err.message);
    }
  }

  function handleBackToConversations() {
    setShowConversations(true);
  }

  const getInitials = (name?: string, username?: string) => {
    if (name) return name[0]?.toUpperCase();
    if (username) return username[0]?.toUpperCase();
    return "?";
  };

  const getDisplayName = (friend: Friend) => {
    return friend.displayName || friend.username;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "busy": return "bg-red-500";
      case "away": return "bg-yellow-400";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-400">Laster meldinger...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Samtale-liste - skjult på mobil når en samtale er aktiv */}
      <div className={`
        ${showConversations ? 'flex' : 'hidden'} 
        md:flex
        w-full md:w-64 
        border-r border-gray-200 dark:border-gray-800 
        flex-col 
        bg-white dark:bg-gray-900/50
        absolute md:relative
        inset-0 md:inset-auto
        z-10
      `}>
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Samtaler</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ingen samtaler enda</p>
              <p className="text-xs text-gray-500">Legg til venner for å starte en chat</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {conversations.map((conv) => (
                <li key={conv.friend.id}>
                  <button
                    onClick={() => setActiveId(conv.friend.id)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors relative ${
                      conv.friend.id === activeId
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <figure className="relative h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden flex items-center justify-center">
                        {conv.friend.avatarUrl ? (
                          <img src={conv.friend.avatarUrl} alt="" className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {getInitials(conv.friend.displayName, conv.friend.username)}
                          </span>
                        )}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(conv.friend.status)}`} />
                    </figure>
                    <figcaption className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{getDisplayName(conv.friend)}</p>
                      <p className={`truncate text-xs ${conv.friend.id === activeId ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
                        {conv.lastMessage?.content || "Ingen meldinger"}
                      </p>
                    </figcaption>
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Selve chatområde - Dette er implementert med en del hjelp av Github Copilot*/}
      <main className={`
        ${!showConversations ? 'flex' : 'hidden'} 
        md:flex
        flex-1 flex-col 
        overflow-hidden
        min-h-0
      `}>
        {activeId !== null && activeFriend ? (
          <>
            <header className="px-3 md:px-6 py-3 md:py-4 pt-4 md:pt-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3 flex-shrink-0">
              {/* Tilbake-knapp for mobil */}
              <button
                onClick={handleBackToConversations}
                className="md:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                aria-label="Tilbake til samtaler"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <figure className="relative h-10 w-10 flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden flex items-center justify-center">
                  {activeFriend.avatarUrl ? (
                    <img src={activeFriend.avatarUrl} alt="" className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {getInitials(activeFriend.displayName, activeFriend.username)}
                    </span>
                  )}
                </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(activeFriend.status)}`} />
              </figure>
              <div className="flex-1 min-w-0">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">{getDisplayName(activeFriend)}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{activeFriend.status}</p>
              </div>
              
              {/* Dropdown meny */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  aria-label="Meny"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={handleRemoveFriend}
                      className="w-full text-left px-4 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                      </svg>
                      Fjern venn
                    </button>
                  </div>
                )}
              </div>
            </header>

            <section className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4 bg-gray-50 dark:bg-transparent min-h-0">
              {messages.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">Ingen meldinger ennå. Start samtalen!</p>
              ) : (
                messages.map((m) => (
                  <MessageBubble key={m.id} message={m} selfId={me?.id} friend={activeFriend} />
                ))
              )}
              <div ref={messagesEndRef} />
            </section>

            <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 md:p-4 flex-shrink-0">
              <form onSubmit={sendMessage} className="flex items-end gap-2 md:gap-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  placeholder="Skriv en melding..."
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3 md:px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="px-3 md:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 transition text-sm flex-shrink-0"
                >
                  Send
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center p-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">Velg en samtale for å starte</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MessageBubble({ message, selfId, friend }: { message: Message; selfId: number; friend: Friend }) {
  const mine = message.senderId === selfId;
  
  return (
    <article className={`flex gap-2 items-end ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && (
        <figure className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {friend.avatarUrl ? (
            <img src={friend.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-white font-bold text-xs">
              {friend.displayName?.[0]?.toUpperCase() || friend.username?.[0]?.toUpperCase() || "?"}
            </span>
          )}
        </figure>
      )}

      <section className={`max-w-[70%] px-3 md:px-4 py-2 rounded-2xl text-sm leading-relaxed ${mine ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"}`}>
        {!mine && (
          <p className="text-xs font-semibold mb-1 opacity-70">
            {friend.displayName || friend.username}
          </p>
        )}
        <p className="break-words">{message.content}</p>
        <time dateTime={message.createdAt} className="block text-xs opacity-70 mt-1">
          {new Date(message.createdAt).toLocaleTimeString("no-NO", { hour: '2-digit', minute: '2-digit' })}
        </time>
      </section>
    </article>
  );
}