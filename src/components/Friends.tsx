import { useState } from "react";

// Typer
interface User {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  status: "online" | "busy" | "away" | "offline";
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
  
  // Midlertidig mock data
  const friends = [
    { id: "1", name: "Shahd", status: "online" as const, avatarUrl: undefined },
    { id: "2", name: "Jan", status: "away" as const, avatarUrl: undefined },
  ];

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
            {friends.length} {friends.length === 1 ? "venn" : "venner"}
          </p>
        </article>
        <Button onClick={() => setShowAddModal(true)}>+ Legg til venner</Button>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Venner
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <li
              key={friend.id}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <figure className="relative h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 overflow-hidden">
                {friend.avatarUrl ? (
                  <img src={friend.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="h-full w-full flex items-center justify-center text-white font-bold">
                    {friend.name[0].toUpperCase()}
                  </span>
                )}
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${statusColors[friend.status]}`}
                  title={statusLabels[friend.status]}
                />
              </figure>

              <article className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {friend.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {statusLabels[friend.status]}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {showAddModal && (
        <aside className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <article className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Legg til venner
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </header>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Søkefunksjon kommer snart...
            </p>
          </article>
        </aside>
      )}
    </section>
  );
}