"use client";

/**
 * FriendsClient - Klientside komponent for vennehåndtering
 * 
 * Denne komponenten håndterer all vennerelatert funksjonalitet:
 * - Visning av eksisterende venner
 * - Motta og sende venneforespørsler
 * - Søke etter nye venner
 * - Fjerne venner
 * 
 * Arkitektur:
 * - Bruker tabs for å bytte mellom forskjellige visninger
 * - Hvert tab-bytte trigger en ny API-forespørsel (useEffect)
 * - Live filtrering av søkeresultater (klientside)
 * 
 * API-endepunkter brukt:
 * - GET  /api/friends          → Hent venneliste
 * - GET  /api/friends/requests → Hent venneforespørsler
 * - GET  /api/friends/search   → Hent alle brukere (for søk)
 * - POST /api/friends/request  → Send venneforespørsel
 * - POST /api/friends/accept   → Godta forespørsel
 * - POST /api/friends/reject   → Avslå forespørsel
 * - DELETE /api/friends/remove → Fjern venn
 * 
 * Kode skrevet med assistanse fra AI (GitHub Copilot / Claude).
 */

import React, { useState, useEffect } from "react";
import "./friends.css";

// Mulige tabs i UI
type Tab = "friends" | "requests" | "search";

/**
 * Interface for en venn i vennelisten
 */
interface Friend {
  id: string;
  username: string;
  displayName?: string;
  status: string;
  avatarUrl?: string;
  createdAt: string;
}

/**
 * Interface for en venneforespørsel
 * ID er UUID fra databasen
 */
interface FriendRequest {
  id: string;  // ID er UUID i databasen
  type: "received" | "sent";
  sender?: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  receiver?: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  status: string;
  createdAt: string;
}

/**
 * Interface for søkeresultat
 */
interface SearchResult {
  id: string;
  username: string;
  displayName?: string;
  status: string;
  avatarUrl?: string;
}

export default function FriendsClient() {
  // Aktiv tab (friends/requests/search)
  const [activeTab, setActiveTab] = useState<Tab>("friends");
  
  // Data for hver tab
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<{ received: FriendRequest[]; sent: FriendRequest[] }>({
    received: [],
    sent: [],
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // Søk og UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Effect som henter data når aktiv tab endres
   * Hver tab har sin egen fetch-funksjon
   */
  useEffect(() => {
    if (activeTab === "friends") {
      fetchFriends();
    } else if (activeTab === "requests") {
      fetchRequests();
    } else if (activeTab === "search") {
      fetchAllUsers();
    }
  }, [activeTab]);

  async function fetchAllUsers() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/friends/search", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Kunne ikke hente brukere");
      const data = await res.json() as { users: SearchResult[] };
      setSearchResults(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFriends() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/friends", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Kunne ikke hente venner");
      const data = await res.json() as { friends: Friend[] };
      setFriends(data.friends || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRequests() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/friends/requests", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Kunne ikke hente venneforespørsler");
      const data = await res.json() as { received: FriendRequest[]; sent: FriendRequest[] };
      setRequests({
        received: data.received || [],
        sent: data.sent || [],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Filtrer brukere basert på søketekst (live filtrering)
  const filteredUsers = searchResults.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      (user.displayName?.toLowerCase().includes(query) ?? false)
    );
  });

  async function sendFriendRequest(username: string) {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Kunne ikke sende venneforespørsel");
      }

      alert("Venneforespørsel sendt!");
      fetchAllUsers(); // Oppdater listen
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function acceptRequest(requestId: string) {
    try {
      console.log("Sending accept request for id:", requestId);
      const res = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
        credentials: "same-origin",
      });

      const data = await res.json() as { success?: boolean; error?: string };
      console.log("Accept response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Kunne ikke akseptere forespørsel");
      }
      
      alert("Venneforespørsel akseptert!");
      fetchRequests();
      fetchFriends();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function rejectRequest(requestId: string) {
    try {
      console.log("Sending reject request for id:", requestId);
      const res = await fetch("/api/friends/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
        credentials: "same-origin",
      });

      const data = await res.json() as { success?: boolean; error?: string };
      console.log("Reject response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Kunne ikke avslå forespørsel");
      }
      
      alert("Venneforespørsel avslått");
      fetchRequests();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function removeFriend(friendId: string) {
    if (!confirm("Er du sikker på at du vil fjerne denne vennen?")) return;

    try {
      const res = await fetch("/api/friends/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
        credentials: "same-origin",
      });

      if (!res.ok) throw new Error("Kunne ikke fjerne venn");
      
      alert("Venn fjernet");
      fetchFriends();
    } catch (err: any) {
      alert(err.message);
    }
  }

  const pendingRequestsCount = requests.received.length;

  return (
    <div className="friends-container">
      <main className="friends-main">
        <div className="friends-content">
          <header className="friends-header">
            <h1 className="friends-title">Venneliste</h1>
            <p className="friends-subtitle">
              Administrer venner, søk etter nye kontakter og behandle venneforespørsler
            </p>
          </header>

          {error && (
            <aside className="friends-error" role="alert">
              {error}
            </aside>
          )}

          <nav className="friends-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === "friends"}
              className={`friends-tab ${activeTab === "friends" ? "active" : "inactive"}`}
              onClick={() => setActiveTab("friends")}
            >
              Mine venner ({friends.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "requests"}
              className={`friends-tab ${activeTab === "requests" ? "active" : "inactive"}`}
              onClick={() => setActiveTab("requests")}
            >
              Forespørsler
              {pendingRequestsCount > 0 && (
                <span className="friends-badge ml-2">{pendingRequestsCount}</span>
              )}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "search"}
              className={`friends-tab ${activeTab === "search" ? "active" : "inactive"}`}
              onClick={() => setActiveTab("search")}
            >
              Søk etter venner
            </button>
          </nav>

          {loading && <p className="friends-loading">Laster...</p>}

          {!loading && activeTab === "friends" && (
            <section aria-label="Mine venner">
              {friends.length === 0 ? (
                <p className="friends-empty">
                  Du har ingen venner ennå. Bruk søk-fanen for å finne og legge til venner!
                </p>
              ) : (
                <ul className="friends-list">
                  {friends.map((friend) => (
                    <li key={friend.id} className="friend-item">
                      <div className="friend-info">
                        <figure className="friend-avatar" aria-hidden="true">
                          {friend.avatarUrl ? (
                            <img src={friend.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="friend-initials">
                              {(friend.displayName || friend.username)?.[0]?.toUpperCase() || "?"}
                            </span>
                          )}
                        </figure>
                        <div className="friend-details">
                          <h3 className="friend-name">
                            {friend.displayName || friend.username}
                          </h3>
                          <p className="friend-username">@{friend.username}</p>
                          <span
                            className={`friend-status ${
                              friend.status === "online" ? "online" : "offline"
                            }`}
                          >
                            {friend.status === "online" ? "Pålogget" : "Frakoblet"}
                          </span>
                        </div>
                      </div>
                      <div className="friend-actions">
                        <a
                          href={`/messages?friend=${friend.id}`}
                          className="friend-btn friend-btn-primary"
                        >
                          Send melding
                        </a>
                        <button
                          onClick={() => removeFriend(friend.id)}
                          className="friend-btn friend-btn-danger"
                        >
                          Fjern
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {!loading && activeTab === "requests" && (
            <section aria-label="Venneforespørsler">
              <div className="mb-8">
                <h2 className="friends-results-title">Mottatte forespørsler</h2>
                {requests.received.length === 0 ? (
                  <p className="friends-empty">Ingen ventende forespørsler</p>
                ) : (
                  <ul className="friends-list">
                    {requests.received.map((req) => (
                      <li key={req.id} className="friend-item">
                        <div className="friend-info">
                          <figure className="friend-avatar" aria-hidden="true">
                            {req.sender?.avatarUrl ? (
                              <img src={req.sender.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span className="friend-initials">
                                {req.sender?.displayName?.[0]?.toUpperCase() ||
                                  req.sender?.username?.[0]?.toUpperCase() ||
                                  "?"}
                              </span>
                            )}
                          </figure>
                          <div className="friend-details">
                            <h3 className="friend-name">
                              {req.sender?.displayName || req.sender?.username}
                            </h3>
                            <p className="friend-username">
                              @{req.sender?.username}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(req.createdAt).toLocaleDateString("no-NO")}
                            </p>
                          </div>
                        </div>
                        <div className="friend-actions">
                          <button
                            onClick={() => acceptRequest(req.id)}
                            className="friend-btn friend-btn-success"
                          >
                            Godta
                          </button>
                          <button
                            onClick={() => rejectRequest(req.id)}
                            className="friend-btn friend-btn-secondary"
                          >
                            Avslå
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h2 className="friends-results-title">Sendte forespørsler</h2>
                {requests.sent.length === 0 ? (
                  <p className="friends-empty">Ingen sendte forespørsler</p>
                ) : (
                  <ul className="friends-list">
                    {requests.sent.map((req) => (
                      <li key={req.id} className="friend-item">
                        <div className="friend-info">
                          <figure className="friend-avatar" aria-hidden="true">
                            {req.receiver?.avatarUrl ? (
                              <img src={req.receiver.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span className="friend-initials">
                                {req.receiver?.displayName?.[0]?.toUpperCase() ||
                                  req.receiver?.username?.[0]?.toUpperCase() ||
                                  "?"}
                              </span>
                            )}
                          </figure>
                          <div className="friend-details">
                            <h3 className="friend-name">
                              {req.receiver?.displayName || req.receiver?.username}
                            </h3>
                            <p className="friend-username">
                              @{req.receiver?.username}
                            </p>
                            <span className="friend-status">Venter på svar</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          {!loading && activeTab === "search" && (
            <section aria-label="Søk etter venner">
              <div className="friends-search-section">
                <div className="friends-search-form">
                  <input
                    type="search"
                    placeholder="Filtrer etter brukernavn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="friends-search-input"
                    aria-label="Søk etter venner"
                  />
                </div>
              </div>

              {filteredUsers.length > 0 ? (
                <div className="friends-results">
                  <h2 className="friends-results-title">Brukere ({filteredUsers.length})</h2>
                  <ul className="friends-list">
                    {filteredUsers.map((user) => (
                      <li key={user.id} className="friend-item">
                        <div className="friend-info">
                          <figure className="friend-avatar" aria-hidden="true">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span className="friend-initials">
                                {user.displayName?.[0]?.toUpperCase() ||
                                  user.username?.[0]?.toUpperCase() ||
                                  "?"}
                              </span>
                            )}
                          </figure>
                          <div className="friend-details">
                            <h3 className="friend-name">
                              {user.displayName || user.username}
                            </h3>
                            <p className="friend-username">
                              {user.username}
                            </p>
                          </div>
                        </div>
                        <div className="friend-actions">
                          <button
                            onClick={() => sendFriendRequest(user.username)}
                            className="friend-btn friend-btn-primary"
                          >
                            Legg til venn
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="friends-empty">
                  {searchQuery.trim() ? "Ingen brukere matcher søket ditt" : "Ingen brukere funnet"}
                </p>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

