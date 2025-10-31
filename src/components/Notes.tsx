"use client";

import { useEffect, useMemo, useState } from "react";

type Note = { id: string; title: string; body: string; updatedAt: number };
const STORAGE_KEY = "notes.v1";

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    if (!selectedId && notes.length) setSelectedId(notes[0].id);
  }, [notes, selectedId]);

  const selected = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId]
  );

  function createNote() {
    const n: Note = {
      id: crypto.randomUUID(),
      title: "Nytt notat",
      body: "",
      updatedAt: Date.now(),
    };
    setNotes((ns) => [n, ...ns]);
    setSelectedId(n.id);
  }

  function updateSelected(patch: Partial<Note>) {
    if (!selected) return;
    setNotes((ns) =>
      ns.map((n) =>
        n.id === selected.id ? { ...n, ...patch, updatedAt: Date.now() } : n
      )
    );
  }

  function saveSelected() {
    if (!selected) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function deleteNote(id: string) {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  }

  return (
    <main className="w-full p-6">
      <section
        aria-label="Notater"
        className="grid grid-cols-[360px_minmax(0,1fr)] gap-14 items-start"
      >
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Mine notater</h2>

          {notes.length ? (
            <ul className="grid gap-4">
              {notes.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => setSelectedId(n.id)}
                    className={`note-pill ${
                      n.id === selectedId ? "note-pill-active" : ""
                    } rounded-xl px-3 py-2 w-full text-left transition border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
                    title={new Date(n.updatedAt).toLocaleString()}
                  >
                    <strong>{n.title || "Uten tittel"}</strong>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Ingen notater ennå.
            </p>
          )}

          <footer className="mt-5 flex gap-3">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
              onClick={createNote}
            >
              ＋ Nytt notat
            </button>

            {selected && (
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
                onClick={() => deleteNote(selected.id)}
              >
                Slett
              </button>
            )}
          </footer>
        </section>

        <article className="editor-wrap bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <section className="panel">
            <header className="mb-3">
              <input
                className="w-full text-base font-semibold bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                value={selected?.title ?? "Nytt notat"}
                onChange={(e) => updateSelected({ title: e.target.value })}
                placeholder="Tittel"
              />
              <hr className="title-rule border-gray-200 dark:border-gray-700" />
            </header>

            <section className="panel-inner">
              <textarea
                className="editor-textarea h-[420px] w-full bg-transparent text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Skriv notat her..."
                value={selected?.body || ""}
                onChange={(e) => updateSelected({ body: e.target.value })}
              />
            </section>

            {selected && (
              <footer className="mt-4 flex justify-between items-center">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Sist endret:{" "}
                  {new Date(selected.updatedAt).toLocaleString()}
                </span>

                <div className="flex gap-3">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                    onClick={saveSelected}
                  >
                    Lagre
                  </button>

                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
                    onClick={() => deleteNote(selected.id)}
                  >
                    Slett
                  </button>
                </div>
              </footer>
            )}
          </section>
        </article>
      </section>
    </main>
  );
}
