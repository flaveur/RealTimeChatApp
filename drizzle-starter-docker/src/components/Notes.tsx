"use client";

import { useState } from "react";

export default function Notes() {
  const [notes, setNotes] = useState<string[]>([]);
  const [text, setText] = useState("");

  const addNote = () => {
    if (!text.trim()) return;
    setNotes([...notes, text.trim()]);
    setText("");
  };

  const deleteNote = (i: number) => setNotes(notes.filter((_, idx) => idx !== i));

  return (
    <div className="p-6 w-full space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Mine notater</h2>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv et notat..."
          className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400"
        />
        <button
          onClick={addNote}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Legg Til</button>
                        </div>

      {notes.length ? (
        <ul className="space-y-2">
          {notes.map((note, i) => (
            <li
              key={i}
              className="flex justify-between items-center p-3 bg-gray-50 rounded border"
            >
              <span>{note}</span>
              <button
                onClick={() => deleteNote(i)}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Slett
              </button>
            </li>
          ))}
        </ul>
                    ) : (
                     <p className="text-gray-500 text-sm">Ingen notater ennå.</p>
                         )}


  </div>
  );
}