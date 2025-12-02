import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/Button";
import "./notes.css";


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
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
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
    if (!newTitle.trim()) {
      alert("Tittel er nødvendig");
      return;
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() }),
        credentials: "same-origin",
      });

      if (!res.ok) throw new Error("Kunne ikke opprette notat");
      await fetchNotes();
      setNewTitle("");
      setNewContent("");
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
      <div className="notes-container">
        <main className="notes-main">
          <div className="notes-content">
            <p className="notes-loading">Laster notater...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <main className="notes-main">
        <div className="notes-content">
          <header className="notes-header">
            <h1 className="notes-title">Mine notater</h1>
            <p className="notes-subtitle">Opprett, søk og administrer dine notater</p>
          </header>

          {error && (
            <aside className="notes-error" role="alert">
              {error}
            </aside>
          )}

          <section aria-label="Søk etter notater" className="notes-search-section">
            <form role="search">
              <label htmlFor="search" className="sr-only">Søk i notater</label>
              <input 
                id="search" 
                type="search" 
                placeholder="Søk i notater..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="notes-search-input"
              />
            </form>
          </section>

          <section aria-label="Legg til nytt notat" className="notes-add-section">
            <form onSubmit={handleAddNote} className="notes-add-form">
              <div className="space-y-3">
                <div>
                  <label htmlFor="newTitle" className="sr-only">Tittel på notat</label>
                  <input 
                    id="newTitle" 
                    type="text"
                    placeholder="Tittel på notatet..." 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    className="notes-input"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label htmlFor="newContent" className="sr-only">Innhold i notat</label>
                  <textarea 
                    id="newContent" 
                    placeholder="Skriv notatet ditt her..." 
                    value={newContent} 
                    onChange={(e) => setNewContent(e.target.value)} 
                    rows={4} 
                    className="notes-textarea"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={!newTitle.trim()} 
                className="notes-btn notes-btn-primary self-end"
              >
                Legg til
              </button>
            </form>
          </section>

          <section aria-label="Liste over notater" className="notes-list-section">
            {filteredNotes.length === 0 ? (
              <p className="notes-empty">
                {notes.length === 0 ? "Du har ingen notater ennå." : "Ingen notater samsvarer med søket."}
              </p>
            ) : (
              <ul className="notes-list">
                {filteredNotes.map((note) => (
                  <li key={note.id} className="note-item">
                    <article className="note-content">
                      <h3 className="note-title">{note.title}</h3>
                      {note.content && <p className="note-body">{note.content}</p>}
                      <time className="note-time">{new Date(note.createdAt).toLocaleString("no-NO")}</time>
                    </article>
                    <div className="note-actions">
                      <button 
                        type="button" 
                        onClick={() => handleDelete(note.id)} 
                        className="notes-btn notes-btn-danger"
                      >
                        Slett
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
