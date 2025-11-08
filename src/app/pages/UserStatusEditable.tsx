'use client';

import { rwsdk, type Status } from "@/app/lib/rwsdk";
import { useState, useSyncExternalStore } from "react";

export default function UserStatusEditable() {
  const me = useSyncExternalStore(
    rwsdk.auth.onChange,
    () => rwsdk.auth.useCurrentUser(),
    () => rwsdk.auth.useCurrentUser()
  );

  const [open, setOpen] = useState(false);
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

  function setStatus(s: Status) {
    rwsdk.auth.setStatus(s);
    setOpen(false);
  }

  if (!me)
    return (
      <aside className="text-gray-500 dark:text-gray-400 text-sm">
        Laster bruker...
      </aside>
    );

  return (
    <section
      aria-label="Brukerstatus"
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 transition-colors"
    >
      <header className="flex items-center gap-3">
        <figure
          className="relative h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"
          aria-hidden
        >
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${colors[me.status]}`}
            title={labels[me.status]}
          />
        </figure>

        <article className="flex-1">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
            {me.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {labels[me.status]}
          </p>
        </article>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="status-panel"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Endre status
        </button>
      </header>

      {open && (
        <form
          id="status-panel"
          aria-label="Velg status"
          className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4"
        >
          <fieldset className="space-y-2">
            <legend className="sr-only">Statusvalg</legend>
            {(["online", "busy", "away"] as Status[]).map((s) => (
              <label
                key={s}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  defaultChecked={me.status === s}
                  onChange={() => setStatus(s)}
                  className="accent-blue-600"
                />
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${colors[s]}`}
                    aria-hidden
                  />
                  <span>{labels[s]}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </form>
      )}
    </section>
  );
}