'use client';

import { rwsdk, type Status } from "@/app/lib/rwsdk";
import { useSyncExternalStore } from "react";

export default function UserStatus() {
  // Abonner på endringer i brukeren fra rwsdk
  const me = useSyncExternalStore(
    rwsdk.auth.onChange,
    () => rwsdk.auth.useCurrentUser(),
    () => rwsdk.auth.useCurrentUser()
  );

  if (!me)
    return (
      <aside className="text-gray-500 dark:text-gray-400 text-sm">
        Laster brukerstatus...
      </aside>
    );

  const labels: Record<Status, string> = {
    online: "Tilgjengelig",
    busy: "Opptatt",
    away: "Borte",
  };

  const colors: Record<Status, string> = {
    online: "bg-green-500",
    busy: "bg-red-500",
    away: "bg-yellow-400",
  };

  return (
    <section
      aria-label="Brukerstatus"
      className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700
                 bg-white dark:bg-gray-900 p-4 transition-colors shadow-sm"
    >
      {/* Profilbilde + statusindikator */}
      <figure
        className="relative h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"
        aria-hidden
      >
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${colors[me.status]}`}
          title={labels[me.status]}
        />
      </figure>

      {/* Navn og status */}
      <article className="flex-1">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
          {me.name}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {labels[me.status]}
        </p>
      </article>
    </section>
  );
}