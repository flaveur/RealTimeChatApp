'use client';

import "@/app/styles.css";
import NotesPage from "@/app/components/notes/NotesPage";
import Sidebar from "@/app/components/Sidebar/Sidebar";

export default function Notes() {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <aside className="w-72 p-4 border-r bg-white dark:bg-gray-800">
        <nav className="flex flex-col gap-4 md:gap-6">

          <Sidebar />
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mine notater</h1>
        </header>
        <NotesPage />
      </main>
    </div>
  );
}
