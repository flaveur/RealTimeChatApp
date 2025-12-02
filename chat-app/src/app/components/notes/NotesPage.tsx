import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/Button";
import Sidebar from "@/app/components/Sidebar";

interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      setLoading(true);
      const res = await fetch("/api/notes", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Kunne ikke hente notater");
      const data = (await res.json()) as { notes: Note[] };
      setNotes(data.notes || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newNote.trim(), content: "" }),
        credentials: "same-origin",
      });

      if (!res.ok) throw new Error("Kunne ikke opprette notat");
      await fetchNotes();
      setNewNote("");
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm("Er du sikker på at du vil slette dette notatet?")) return;

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (!res.ok) throw new Error("Kunne ikke slette notat");
      await fetchNotes();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <main className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-3xl p-4 sm:p-8 shadow-sm transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-center">Laster notater...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:block w-72 p-4 border-r">
        <Sidebar />
      </aside>

      <main className="flex-1 p-6">
        <main className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm transition-colors pb-6 md:pb-8">
          <header className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Mine notater</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Opprett, søk og administrer dine notater</p>
          </header>

          {error && (
            <aside className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </aside>
          )}

          <section aria-label="Søk etter notater" className="mb-4 md:mb-6">
            <form role="search">
              <label htmlFor="search" className="sr-only">Søk i notater</label>
              <input id="search" type="search" placeholder="Søk i notater..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none text-base" />
            </form>
          </section>

          <section aria-label="Legg til nytt notat" className="mb-6 md:mb-8">
            <form onSubmit={handleAddNote} className="flex flex-col gap-3">
              <label htmlFor="newNote" className="sr-only">Nytt notat</label>
              <textarea id="newNote" placeholder="Skriv et nytt notat..." value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={3} className="w-full resize-none px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none text-base" />
              <Button type="submit" disabled={!newNote.trim()} className="self-end">Legg til</Button>
            </form>
          </section>

          <section aria-label="Liste over notater">
            {filteredNotes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">{notes.length === 0 ? "Du har ingen notater ennå." : "Ingen notater samsvarer med søket."}</p>
            ) : (
              <ul className="space-y-3">
                {filteredNotes.map((note) => (
                  <li key={note.id} className="group flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <article className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">{note.title}</h3>
                      {note.content && <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line break-words">{note.content}</p>}
                      <time className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">{new Date(note.createdAt).toLocaleString("no-NO")}</time>
                    </article>
                    <Button type="button" variant="danger" onClick={() => handleDelete(note.id)} className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-end sm:self-start">Slett</Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </main>
    </div>
  );
}