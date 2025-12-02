import "@/app/styles.css";
import MessagesPage from "@/app/components/messages/MessagesPage";

export default function Messages() {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <aside className="w-72 p-4 border-r bg-white dark:bg-gray-800">
        <nav className="flex flex-col gap-4 md:gap-6">
          {/* Sidebar content */}
          <Sidebar />
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Meldinger</h1>
        </header>
        <MessagesPage />
      </main>
    </div>
  );
}
