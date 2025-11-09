import { useState } from "react";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Midlertidig mock data
  const friends: Friendship[] = [
    { 
      id: "1", 
      userId: "me", 
      friendId: "2", 
      status: "accepted",
      friend: { id: "2", username: "Shahd", name: "Shahd", status: "online" }
    },
    { 
      id: "3", 
      userId: "4", 
      friendId: "me", 
      status: "pending",
      friend: { id: "4", username: "Rami", name: "Rami", status: "offline" }
    },
  ];

  const searchResults: User[] = [];

  const acceptedFriends = friends.filter((f) => f.status === "accepted");
  const pendingRequests = friends.filter((f) => f.status === "pending");

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

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <article>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Venneliste</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {acceptedFriends.length} {acceptedFriends.length === 1 ? "venn" : "venner"}
          </p>
        </article>
        <Button onClick={() => setShowAddModal(true)}>+ Legg til venner</Button>
      </header>

      {pendingRequests.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Ventende forespørsler ({pendingRequests.length})
          </h2>
          <ul className="space-y-2">
            {pendingRequests.map((friendship) => {
              if (!friendship.friend) return null;
              const isPendingFromMe = friendship.userId !== friendship.friend.id;
              
              return (
                <li
                  key={friendship.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20"
                >
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

                  <nav className="flex gap-2">
                    {!isPendingFromMe && (
                      <Button variant="primary" onClick={() => alert("Aksepter")}>
                        Aksepter
                      </Button>
                    )}
                    <Button variant="danger" onClick={() => alert("Avvis")}>
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Venner
        </h2>
        {acceptedFriends.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Du har ingen venner ennå. Legg til noen!
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {acceptedFriends.map((friendship) => {
              if (!friendship.friend) return null;
              
              return (
                <li
                  key={friendship.id}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition group"
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
                    onClick={() => alert("Fjern")}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 dark:text-red-400 text-sm"
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
        <aside className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <article className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Legg til venner
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery("");
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </section>

            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.length === 0 && searchQuery.trim().length >= 2 && (
                <li className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  Ingen brukere funnet
                </li>
              )}

              {searchResults.map((user) => (
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

                  <Button variant="primary" onClick={() => alert("Legg til")}>
                    Legg til
                  </Button>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      )}
    </section>
  );
}