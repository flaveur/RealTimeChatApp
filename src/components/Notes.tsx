'use client';

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function Notes() {
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const [search, setSearch] = useState("");

  const filteredNotes = notes.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase())
  );

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes((prev) => [newNote.trim(), ...prev]);
    setNewNote("");
  }

  function handleDelete(note: string) {
    setNotes((prev) => prev.filter((n) => n !== note));
  }

  return (
    <main className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-3xl p-4 sm:p-8 shadow-sm transition-colors">
      {/* Topptekst */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Mine notater</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Opprett, søk og administrer dine notater
        </p>
      </header>

      {/* Søkefelt */}
      <section aria-label="Søk etter notater" className="mb-6">
        <form role="search" className="flex items-center gap-3">
          <label htmlFor="search" className="sr-only">
            Søk i notater
          </label>
          <input
            id="search"
            type="search"
            placeholder="Søk i notater..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </form>
      </section>

      {/* Nytt notat */}
      <section aria-label="Legg til nytt notat" className="mb-8">
        <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="newNote" className="sr-only">
            Nytt notat
          </label>
          <textarea
            id="newNote"
            placeholder="Skriv et nytt notat..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            className="flex-1 resize-none px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Button type="submit" disabled={!newNote.trim()}>
            Legg til
          </Button>
        </form>
      </section>

      {/* Notatliste */}
      <section aria-label="Liste over notater">
        {filteredNotes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {notes.length === 0
              ? "Du har ingen notater ennå."
              : "Ingen notater samsvarer med søket."}
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredNotes.map((note, index) => (
              <li
                key={index}
                className="group flex justify-between items-start gap-3 p-4 rounded-xl border 
                           border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                           hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <article className="flex-1">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line break-words">
                    {note}
                  </p>
                </article>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleDelete(note)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Slett
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}