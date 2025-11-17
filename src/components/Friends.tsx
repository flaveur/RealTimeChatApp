import { useState, useEffect } from "react";

// Typer
interface User {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  status: "online" | "busy" | "away" | "offline";
}

interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: "pending" | "accepted";
  createdAt?: string;
  friend: User | null;
}

// Knapp
function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const base = "px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export default function Friends() {
  // State
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Henter venner ved oppstart
  useEffect(() => {
    fetchFriends();
  }, []);

  // Søker etter brukere når query endres
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Henter alle venner
  async function fetchFriends() {
    try {
      setLoading(true);
      const res = await fetch("/api/friends");
      if (!res.ok) throw new Error("Kunne ikke hente venner");
      const data = await res.json() as { friends: Friendship[] };
      setFriends(data.friends || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Søker etter brukere
  async function searchUsers() {
    try {
      setSearching(true);
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Søk feilet");
      const data = await res.json() as { users: User[] };
      setSearchResults(data.users || []);
    } catch (err: any) {
      console.error("Søk feilet:", err);
    } finally {
      setSearching(false);
    }
  }

  // Sender venneforespørsel
  async function sendFriendRequest(friendId: string) {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Kunne ikke sende forespørsel");
      }

      setSearchQuery("");
      setShowAddModal(false);
      await fetchFriends();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Aksepter venneforespørselen
  async function acceptFriend(friendshipId: string) {
    try {
      const res = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId }),
      });

      if (!res.ok) throw new Error("Kunne ikke akseptere forespørsel");
      await fetchFriends();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Fjerner venn
  async function removeFriend(friendshipId: string) {
    if (!confirm("Er du sikker på at du vil fjerne denne vennen?")) return;

    try {
      const res = await fetch("/api/friends/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId }),
      });

      if (!res.ok) throw new Error("Kunne ikke fjerne venn");
      await fetchFriends();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Filtrer venner
  const acceptedFriends = friends.filter((f) => f.status === "accepted");
  const pendingRequests = friends.filter((f) => f.status === "pending");

  // Status-farger og labels
  const statusColors: Record<string, string> = {
    online: "bg-green-500",
    busy: "bg-red-500",
    away: "bg-yellow-400",
    offline: "bg-gray-400",
  };

  const statusLabels: Record<string, string> = {
    online: "Tilgjengelig",
    busy: "Opptatt",
    away: "Borte",
    offline: "Frakoblet",
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Laster venner...</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 md:space-y-6 pb-4 md:pb-0">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <article>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Venneliste</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {acceptedFriends.length} {acceptedFriends.length === 1 ? "venn" : "venner"}
          </p>
        </article>
        <Button onClick={() => setShowAddModal(true)}>+ Legg til venner</Button>
      </header>

      {error && (
        <aside className="p-3 md:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </aside>
      )}

      {pendingRequests.length > 0 && (
        <section>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Ventende forespørsler ({pendingRequests.length})
          </h2>
          <ul className="space-y-2">
            {pendingRequests.map((friendship) => {
              if (!friendship.friend) return null;
              const isPendingFromMe = friendship.userId !== friendship.friend.id;
              
              return (
                <li
                  key={friendship.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 md:p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <figure className="relative h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 overflow-hidden">
                      {friendship.friend.avatarUrl ? (
                        <img src={friendship.friend.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="h-full w-full flex items-center justify-center text-white font-bold">
                          {friendship.friend.name[0].toUpperCase()}
                        </span>
                      )}
                    </figure>

                    <article className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {friendship.friend.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isPendingFromMe ? "Venter på svar..." : "Vil være venn med deg"}
                      </p>
                    </article>
                  </div>

                  <nav className="flex gap-2 sm:flex-shrink-0">
                    {!isPendingFromMe && (
                      <Button variant="primary" onClick={() => acceptFriend(friendship.id)}>
                        Aksepter
                      </Button>
                    )}
                    <Button variant="danger" onClick={() => removeFriend(friendship.id)}>
                      {isPendingFromMe ? "Avbryt" : "Avvis"}
                    </Button>
                  </nav>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Venner
        </h2>
        {acceptedFriends.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Du har ingen venner ennå. Legg til noen!
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {acceptedFriends.map((friendship) => {
              if (!friendship.friend) return null;
              
              return (
                <li
                  key={friendship.id}
                  className="group flex items-center gap-3 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
                >
                  <figure className="relative h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 overflow-hidden">
                    {friendship.friend.avatarUrl ? (
                      <img src={friendship.friend.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="h-full w-full flex items-center justify-center text-white font-bold">
                        {friendship.friend.name[0].toUpperCase()}
                      </span>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${statusColors[friendship.friend.status]}`}
                      title={statusLabels[friendship.friend.status]}
                    />
                  </figure>

                  <article className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {friendship.friend.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {statusLabels[friendship.friend.status]}
                    </p>
                  </article>

                  <button
                    onClick={() => removeFriend(friendship.id)}
                    className="opacity-0 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity text-red-600 hover:text-red-700 dark:text-red-400 text-sm p-2"
                    title="Fjern venn"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {showAddModal && (
        <aside className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <article className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                Legg til venner
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery("");
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 -mr-2"
              >
                ✕
              </button>
            </header>

            <section className="mb-4">
              <label htmlFor="search" className="sr-only">Søk etter brukernavn</label>
              <input
                id="search"
                type="text"
                placeholder="Søk etter brukernavn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-base"
              />
            </section>

            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {searching && (
                <li className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  Søker...
                </li>
              )}
              
              {!searching && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
                <li className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  Ingen brukere funnet
                </li>
              )}

              {!searching && searchResults.map((user) => {
                const alreadyFriends = friends.some(
                  (f) => f.friend?.id === user.id
                );

                return (
                  <li
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                  >
                    <figure className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="h-full w-full flex items-center justify-center text-white font-bold text-sm">
                          {user.name[0].toUpperCase()}
                        </span>
                      )}
                    </figure>

                    <article className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                    </article>

                    {alreadyFriends ? (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Allerede venn
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => sendFriendRequest(user.id)}
                      >
                        Legg til
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </article>
        </aside>
      )}
    </section>
  );
}