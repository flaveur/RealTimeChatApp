'use client';

import { Button } from "@/components/ui/Button";
import { useState } from "react";

// Presentational only; wrapped by AppLayout in FriendList page
export default function Friends() {
  const [search, setSearch] = useState("");
  const friends = [
    { name: "Shahd", status: "online" },
    { name: "Jan", status: "away" },
    { name: "Rami", status: "busy" },
    { name: "Luka", status: "online" },
  ];

  const filtered = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const colors: Record<string, string> = {
    online: "bg-green-500",
    busy: "bg-red-500",
    away: "bg-yellow-400",
  };

  return (
    <>
      <header className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Se og søk etter venner
        </p>
      </header>

      {/* Søking */}
      <section aria-label="Søk etter venner" className="mb-6">
        <form role="search" className="flex items-center gap-3">
          <label htmlFor="search" className="sr-only">
            Søk i venneliste
          </label>
          <input
            id="search"
            type="search"
            placeholder="Søk etter venner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </form>
      </section>

      {/* Liste */}
      <section aria-label="Venner">
        {filtered.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Ingen venner funnet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((friend) => (
              <li
                key={friend.name}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700
                           bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <figure className="relative h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600">
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${colors[friend.status]}`}
                    title={friend.status}
                  />
                </figure>

                <article className="flex-1">
                  <h2 className="text-gray-900 dark:text-white font-medium leading-tight">
                    {friend.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {friend.status === "online"
                      ? "Tilgjengelig"
                      : friend.status === "busy"
                      ? "Opptatt"
                      : "Borte"}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Knapp */}
      <footer className="mt-8 text-center">
        <Button type="button">+ Legg til venner</Button>
      </footer>
    </>
  );
}