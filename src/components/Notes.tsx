"use client";

import { useEffect, useMemo, useState } from "react";

type Note = { id: number; title: string; body: string; updated_at: number };

// Sett denne til worker-URL hvis du faktisk HAR et API som funker.
// La den stå tom hvis du vil kjøre helt lokalt uten server.
const API_BASE = "https://real-time-chat-app.harlooo.workers.dev";
// eksempel: const API_BASE = "https://real-time-chat-app.harlooo.workers.dev";

const LS_KEY = "notes_v1";

function now() { return Date.now(); }
function makeNote(partial: Partial<Note> = {}): Note {
  return {
    id: partial.id ?? -now(),            // negativ = lokal/optimistisk
    title: partial.title ?? "Nytt notat",
    body: partial.body ?? "",
    updated_at: partial.updated_at ?? now(),
  };
}

async function tryFetch(path: string, init?: RequestInit) {
  if (!API_BASE) throw new Error("no api");
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(await res.text().catch(()=>"bad"));
  return res;
}

export default function Notes() {
  // 1) last lokalt, alltid minst ett notat
  const initial: Note[] = useMemo(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const parsed: Note[] = raw ? JSON.parse(raw) : [];
      return parsed.length ? parsed : [makeNote()];
    } catch {
      return [makeNote()];
    }
  }, []);

  const [notes, setNotes] = useState<Note[]>(initial);
  const [selectedId, setSelectedId] = useState<number>(initial[0].id);

  // persist lokalt
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(notes));
  }, [notes]);

  const selected = notes.find(n => n.id === selectedId) ?? notes[0];

  // 2) forsøk å hente fra server (hvis den finnes)
  useEffect(() => {
    (async () => {
      try {
        const res = await tryFetch("/api/notes");
        const data: Note[] = await res.json();
        if (Array.isArray(data) && data.length) {
          setNotes(data);
          setSelectedId(data[0].id);
        } else if (!data?.length) {
          // server tom? prøv å poste det lokale valgte
          const createRes = await tryFetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: selected.title, body: selected.body }),
          });
          const created: Note = await createRes.json();
          setNotes([created]);
          setSelectedId(created.id);
        }
      } catch {
        // ingen server? null stress – vi kjører lokalt.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createNote() {
    const temp = makeNote();
    // legg inn lokalt umiddelbart
    setNotes(prev => [temp, ...prev]);
    setSelectedId(temp.id);

    // prøv å sync’e
    try {
      const res = await tryFetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: temp.title, body: temp.body }),
      });
      const created: Note = await res.json();
      // bytt ut temp med ekte id
      setNotes(prev => prev.map(n => n.id === temp.id ? created : n));
      setSelectedId(created.id);
    } catch {
      // ignorer – lokalt er allerede OK
    }
  }

  function updateSelected(patch: Partial<Note>) {
    const updated: Note = { ...selected, ...patch, updated_at: now() };
    // lokalt først
    setNotes(prev => prev.map(n => n.id === selected.id ? updated : n));

    // sync (hvis mulig)
    if (selected.id > 0) {
      tryFetch(`/api/notes/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }).catch(() => {});
    } else {
      // temp → prøv å lage ekte på server
      tryFetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: updated.title, body: updated.body }),
      })
        .then(r => r.json())
        .then((created: Note) => {
          setNotes(prev => prev.map(n => n.id === selected.id ? created : n));
          setSelectedId(created.id);
        })
        .catch(() => {});
    }
  }

  function deleteNote(id: number) {
    const next = notes.filter(n => n.id !== id);
    const fixed = next.length ? next : [makeNote()];
    setNotes(fixed);
    setSelectedId(fixed[0].id);

    if (id > 0) {
      tryFetch(`/api/notes/${id}`, { method: "DELETE" }).catch(() => {});
    }
  }

  function saveSelected() {
    // Vi autosync’er uansett. Knappen beholdes for UX.
    alert("Lagret lokalt. Synk skjer automatisk når serveren svarer.");
  }

  return (
    <main className="w-full p-6">
      <section aria-label="Notater" className="grid grid-cols-[360px_minmax(0,1fr)] gap-14 items-start">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Mine notater</h2>

          <ul className="grid gap-4">
            {notes.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => setSelectedId(n.id)}
                  className={`note-pill ${n.id === selectedId ? "note-pill-active" : ""} rounded-xl px-3 py-2 w-full text-left transition border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
                  title={new Date(n.updated_at).toLocaleString()}
                >
                  <strong>{n.title || "Uten tittel"}</strong>
                  {n.id < 0 && <em className="ml-2 text-xs opacity-70">(lokal)</em>}
                </button>
              </li>
            ))}
          </ul>

          <footer className="mt-5 flex gap-3">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition" onClick={createNote}>
              ＋ Nytt notat
            </button>

            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition" onClick={() => deleteNote(selected.id)}>
              Slett
            </button>
          </footer>
        </section>

        <article className="editor-wrap bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <section className="panel">
            <header className="mb-3">
              <input
                className="w-full text-base font-semibold bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                value={selected.title}
                onChange={(e) => updateSelected({ title: e.target.value })}
                placeholder="Tittel"
              />
              <hr className="title-rule border-gray-200 dark:border-gray-700" />
            </header>

            <section className="panel-inner">
              <textarea
                className="editor-textarea h-[420px] w-full bg-transparent text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Skriv notat her..."
                value={selected.body}
                onChange={(e) => updateSelected({ body: e.target.value })}
              />
            </section>

            <footer className="mt-4 flex justify-between items-center">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Sist endret: {new Date(selected.updated_at).toLocaleString()}
                {selected.id < 0 && " (ikke synket)"}
              </span>

              <nav className="flex gap-3">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition" onClick={saveSelected}>
                  Lagre
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition" onClick={() => deleteNote(selected.id)}>
                  Slett
                </button>
              </nav>
            </footer>
          </section>
        </article>
      </section>
    </main>
  );
}
