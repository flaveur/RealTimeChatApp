"use client";

import React, { useState } from "react";

export default function Friends() {
  const [searchTerm, setSearchTerm] = useState("");

  const friends = [
    { name: "Shahd" },
    { name: "Jan" },
    { name: "Rami" },
    { name: "Luka" },
    { name: "Roger" },
    { name: "Peter" },
    { name: "Steven" },
    { name: "Chris" },
  ];

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="bg-white rounded-3xl p-8 shadow-md w-full">
      <form className="mb-6" role="search" aria-label="Søk etter venner">
        <label htmlFor="search" className="sr-only">
          Søk etter venner
        </label>
        <input
          id="search"
          type="search"
          placeholder="Søk etter venner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </form>

      <section aria-label="Venner">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Venner</h2>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <li
                key={friend.name}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl shadow hover:shadow-md transition"
              >
                <figure className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0" />
                <span className="font-medium text-gray-800">{friend.name}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500 col-span-full">
              Ingen venner funnet.
            </p>
          )}
        </ul>

        <button className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition">
          + Legg til venner
        </button>
      </section>
    </main>
  );
}
