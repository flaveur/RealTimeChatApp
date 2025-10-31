import Notes from "../../components/Notes";
import Sidebar from "../../components/Sidebar";

export default function NotesPage() {
  return (
    <section className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <main className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:flex-row">
        <section className="flex flex-1 bg-white dark:bg-gray-900 rounded-lg shadow-md">
          <Sidebar />
        <Notes />
        </section>
      </main>
    </section>
  );
}