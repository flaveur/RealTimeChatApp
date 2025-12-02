"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    loadMe();
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeId !== null) {
      loadConversation(activeId);
      markAsRead(activeId);
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
      const data = await res.json();
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
      const data = await res.json();
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
      <div className="flex h-full items-center justify-center bg-gray-950">
        <p className="text-gray-400">Laster meldinger...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-950">
      <div className="w-64 border-r border-gray-800 flex flex-col bg-gray-900/50">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">Samtaler</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">Ingen samtaler enda</p>
              <p className="text-xs text-gray-500">Legg til venner for å starte en chat</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {conversations.map((conv) => (
                <li key={conv.friend.id}>
                  <button
                    onClick={() => setActiveId(conv.friend.id)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors relative ${
                      conv.friend.id === activeId
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800"
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
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(conv.friend.status)}`} />
                    </figure>
                    <figcaption className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{getDisplayName(conv.friend)}</p>
                      <p className="truncate text-xs text-gray-400">
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

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeId !== null && activeFriend ? (
          <>
            <header className="px-6 py-4 border-b border-gray-800 bg-gray-900 flex items-center gap-3 flex-shrink-0">
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
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(activeFriend.status)}`} />
              </figure>
              <div>
                <h2 className="text-lg font-semibold text-white">{getDisplayName(activeFriend)}</h2>
                <p className="text-xs text-gray-400 capitalize">{activeFriend.status}</p>
              </div>
            </header>

            <section className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Ingen meldinger ennå. Start samtalen!</p>
              ) : (
                messages.map((m) => (
                  <MessageBubble key={m.id} message={m} selfId={me?.id} friend={activeFriend} />
                ))
              )}
            </section>

            <footer className="border-t border-gray-800 bg-gray-900 p-4 flex-shrink-0">
              <form onSubmit={sendMessage} className="flex items-end gap-3">
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
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <section className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${mine ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"}`}>
        {!mine && (
          <p className="text-xs font-semibold mb-1 opacity-70">
            {friend.displayName || friend.username}
          </p>
        )}
        <p>{message.content}</p>
        <time dateTime={message.createdAt} className="block text-xs opacity-70 mt-1">
          {new Date(message.createdAt).toLocaleTimeString("no-NO", { hour: '2-digit', minute: '2-digit' })}
        </time>
      </section>
    </article>
  );
}