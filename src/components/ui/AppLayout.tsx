'use client';

import { applyTheme } from "@/app/lib/theme";
import Sidebar from "@/components/Sidebar";
import { ReactNode, useEffect } from "react";

interface Props {
  title?: string;
  children: ReactNode;
}

export default function AppLayout({ title, children }: Props) {
  useEffect(() => applyTheme(), []);

  return (
    <main
      className="min-h-screen bg-gray-100
                 dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
                 text-gray-900 dark:text-gray-100 transition-colors"
    >
      <section className="mx-auto flex max-w-[1500px] gap-6 px-6 py-10">
        {/* Sidebar */}
        <aside
          aria-label="Navigasjon"
          className="w-64 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800
                     rounded-2xl p-6 shadow-lg flex-shrink-0"
        >
          <Sidebar />
        </aside>

        {/* Hovedinnhold */}
        <article
          className="flex-1 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-3xl
                     shadow-2xl p-8 backdrop-blur-lg transition-all"
        >
          {title && (
            <header className="mb-8 border-b border-gray-300/20 dark:border-gray-700/40 pb-4">
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                {title}
              </h1>
            </header>
          )}
          {children}
        </article>
      </section>
    </main>
  );
}