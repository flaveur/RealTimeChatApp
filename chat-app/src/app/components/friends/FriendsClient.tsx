"use client";

import React, { useState, useEffect } from "react";
import "./friends.css";

type Tab = "friends" | "requests" | "search";

interface Friend {
  id: string;
  username: string;
  displayName?: string;
  status: string;
  createdAt: string;
}

interface FriendRequest {
  id: string;
  type: "received" | "sent";
  sender?: {
    id: string;
    username: string;
    displayName?: string;
  };
  receiver?: {
    id: string;
    username: string;
    displayName?: string;
  };
  status: string;
  createdAt: string;
}

interface SearchResult {
  id: string;
  username: string;
  displayName?: string;
  status: string;
}

export default function FriendsClient() {
  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<{ received: FriendRequest[]; sent: FriendRequest[] }>({
    received: [],
    sent: [],
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "friends") {
      fetchFriends();
    } else if (activeTab === "requests") {
      fetchRequests();
    }
  }, [activeTab]);

  async function fetchFriends() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/friends", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Kunne ikke hente venner");
      const data = await res.json();
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
      const data = await res.json();
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

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setError("Søk må være minst 2 tegn");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Søk feilet");
      const data = await res.json();
      setSearchResults(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendFriendRequest(username: string) {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kunne ikke sende venneforespørsel");
      }

      alert("Venneforespørsel sendt!");
      setSearchResults([]);
      setSearchQuery("");
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function acceptRequest(requestId: string) {
    try {
      const res = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
        credentials: "same-origin",
      });

      if (!res.ok) throw new Error("Kunne ikke akseptere forespørsel");
      
      alert("Venneforespørsel akseptert!");
      fetchRequests();
      if (activeTab === "friends") fetchFriends();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function rejectRequest(requestId: string) {
    try {
      const res = await fetch("/api/friends/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
        credentials: "same-origin",
      });

      if (!res.ok) throw new Error("Kunne ikke avslå forespørsel");
      
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
                          <span className="friend-initials">
                            {(friend.displayName || friend.username)?.[0]?.toUpperCase() || "?"}
                          </span>
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
                            <span className="friend-initials">
                              {req.sender?.displayName?.[0]?.toUpperCase() ||
                                req.sender?.username?.[0]?.toUpperCase() ||
                                "?"}
                            </span>
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
                            <span className="friend-initials">
                              {req.receiver?.displayName?.[0]?.toUpperCase() ||
                                req.receiver?.username?.[0]?.toUpperCase() ||
                                "?"}
                            </span>
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
                <form onSubmit={handleSearch} className="friends-search-form">
                  <input
                    type="search"
                    placeholder="Søk etter brukernavn eller e-post..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="friends-search-input"
                    aria-label="Søk etter venner"
                  />
                  <button
                    type="submit"
                    disabled={searchQuery.trim().length < 2}
                    className="friends-search-btn"
                  >
                    Søk
                  </button>
                </form>
              </div>

              {searchResults.length > 0 && (
                <div className="friends-results">
                  <h2 className="friends-results-title">Søkeresultater</h2>
                  <ul className="friends-list">
                    {searchResults.map((user) => (
                      <li key={user.id} className="friend-item">
                        <div className="friend-info">
                          <figure className="friend-avatar" aria-hidden="true">
                            <span className="friend-initials">
                              {user.displayName?.[0]?.toUpperCase() ||
                                user.username?.[0]?.toUpperCase() ||
                                "?"}
                            </span>
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
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

