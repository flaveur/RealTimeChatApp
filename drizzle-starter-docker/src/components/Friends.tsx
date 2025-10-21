"use client";

import { useState, useMemo } from "react";

export default function Friends() {
  if (typeof window === "undefined") {
    return <p>Laster venneliste</p>;
  }

  // Eksisterende venner
  const friendsList = [
    { id: 1, name: "Rami", status: "online" },
    { id: 2, name: "Luka", status: "offline" },
    { id: 3, name: "Jan", status: "offline" },
  ];

  // Falsk data for søk
  const allUsers = [
    ...friendsList,
    { id: 3, name: "Bruh", status: "offline" },
    { id: 4, name: "67", status: "online" },
    { id: 5, name: "Hei", status: "offline" },
  ];

  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return friendsList;
    return allUsers.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Søk etter venner..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400"
      />

      <ul className="space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((friend) => (
            <li
              key={friend.id}
              className="flex items-center justify-between rounded-lg border p-3 bg-gray-50"
            >
              <span className="font-medium">{friend.name}</span>
              <span
                className={`text-sm ${
                  friend.status === "online"
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {friend.status}
              </span>
            </li>
          ))
        ) : (
          <p className="text-gray-500 text-sm">Ingen resultater</p>
        )}
      </ul>
    </div>
  );
}
