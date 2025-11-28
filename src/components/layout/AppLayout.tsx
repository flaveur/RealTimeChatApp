import { applyTheme } from "@/app/lib/theme";
import { useActivityMonitor } from "@/app/lib/useActivityMonitor";
import Sidebar from "@/components/Sidebar";
import { ReactNode, useEffect } from "react";

interface Props {
  title?: string;
  children: ReactNode;
}

export default function AppLayout({ title, children }: Props) {
  useEffect(() => applyTheme(), []);

  // Overvåk brukeraktivitet for automatisk "away"-status
  useActivityMonitor();

  return (
    <main
      className="min-h-screen bg-gray-100
                 dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
                 text-gray-900 dark:text-gray-100 transition-colors pb-20 md:pb-0"
    >
      <section className="mx-auto flex flex-col md:flex-row max-w-[1500px] gap-4 md:gap-6 px-3 md:px-6 py-4 md:py-10">
        {/* Desktop Sidebar - Skjult på mobil */}
        <aside
          aria-label="Navigasjon"
          className="hidden md:block w-64 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800
                     rounded-2xl p-6 shadow-lg flex-shrink-0"
        >
          <Sidebar />
        </aside>

        {/* Hovedinnhold */}
        <article
          className="flex-1 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 
                     rounded-xl md:rounded-3xl shadow-2xl p-4 md:p-8 backdrop-blur-lg transition-all"
        >
          {title && (
            <header className="mb-4 md:mb-8 border-b border-gray-300/20 dark:border-gray-700/40 pb-3 md:pb-4">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                {title}
              </h1>
            </header>
          )}
          {children}
        </article>
      </section>

      {/* Mobil Bunnmeny - Kun synlig på mobil */}
      <nav
        aria-label="Mobil navigasjon"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-lg z-50"
      >
        <Sidebar />
      </nav>
    </main>
  );
}
