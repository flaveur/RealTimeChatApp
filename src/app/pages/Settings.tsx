'use client';

import { rwsdk } from "@/app/lib/rwsdk";
import { getTheme, setTheme, subscribe, type Theme } from "@/app/lib/theme";
import AppLayout from "@/components/ui/AppLayout";
import { Button } from "@/components/ui/Button";
import { useEffect, useState, useSyncExternalStore } from "react";

export default function Settings() {
  const me = rwsdk.auth.useCurrentUser?.() ?? null;
  const [name, setName] = useState(me?.name ?? "");
  const theme = useSyncExternalStore(subscribe, getTheme, () => "system");

  useEffect(() => {
    setName(me?.name ?? "");
  }, [me?.name]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    alert(`Navn lagret: ${name.trim()}`);
  }

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <AppLayout title="Innstillinger">
      <section className="space-y-6">

        {/* PROFIL */}
        <article
          aria-labelledby="profil"
          className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm"
        >
          <header className="mb-4">
            <h2 id="profil" className="text-lg font-semibold text-gray-900 dark:text-white">
              Profil
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Oppdater navnet ditt og profilbilde
            </p>
          </header>

          <form onSubmit={handleSave} className="space-y-4 max-w-sm">
            <fieldset>
              <legend className="sr-only">Brukernavn</legend>
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Visningsnavn
              </label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Skriv navnet ditt"
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 
                           focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </fieldset>

            <section className="flex items-center gap-3">
              <figure className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700" aria-hidden />
              <Button type="button" variant="secondary">
                Endre avatar (kommer)
              </Button>
            </section>

            <footer>
              <Button type="submit">Lagre navn</Button>
            </footer>
          </form>
        </article>

        {/* STATUS */}
        <article
          aria-labelledby="status"
          className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm"
        >
          <header className="mb-4">
            <h2 id="status" className="text-lg font-semibold text-gray-900 dark:text-white">
              Status
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Velg om du er tilgjengelig, opptatt eller borte
            </p>
          </header>

          <UserStatusEditable />
        </article>

        {/* TEMA */}
        <article
          aria-labelledby="theme"
          className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm"
        >
          <header className="mb-4">
            <h2 id="theme" className="text-lg font-semibold text-gray-900 dark:text-white">
              Utseende
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Velg lys eller mørk modus
            </p>
          </header>

          <form className="space-y-2">
            <fieldset>
              <legend className="sr-only">Tema</legend>
              {(["light", "dark", "system"] as Theme[]).map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <input
                    type="radio"
                    name="theme"
                    value={t}
                    checked={theme === t}
                    onChange={() => setTheme(t)}
                  />
                  <span className="capitalize">
                    {t === "light" ? "Lyst" : t === "dark" ? "Mørkt" : "System"}
                  </span>
                </label>
              ))}
            </fieldset>
          </form>
        </article>

        {/* VARSLER */}
        <article
          aria-labelledby="notifications"
          className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm"
        >
          <header className="mb-4">
            <h2 id="notifications" className="text-lg font-semibold text-gray-900 dark:text-white">
              Varsler
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Funksjonalitet kommer senere
            </p>
          </header>

          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <input type="checkbox" disabled /> Lyd ved ny melding
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" disabled /> Desktop-varsler
            </li>
          </ul>
        </article>

        {/* KONTO */}
        <article
          aria-labelledby="account"
          className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm"
        >
          <header className="mb-4">
            <h2 id="account" className="text-lg font-semibold text-gray-900 dark:text-white">
              Konto
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Administrer pålogging og brukerkonto
            </p>
          </header>

          <footer>
            <Button variant="danger" onClick={handleLogout}>
              Logg ut
            </Button>
          </footer>
        </article>
      </section>
    </AppLayout>
  );
}

/* STATUS-KOMPONENT */
function UserStatusEditable() {
  const [status, setStatus] = useState<"online" | "busy" | "away">("online");
  const labels = { online: "Tilgjengelig", busy: "Opptatt", away: "Borte" };

  return (
    <form className="space-y-2">
      <fieldset>
        <legend className="sr-only">Brukerstatus</legend>
        {(["online", "busy", "away"] as const).map((s) => (
          <label
            key={s}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <input
              type="radio"
              name="status"
              value={s}
              checked={status === s}
              onChange={() => setStatus(s)}
            />
            <span>{labels[s]}</span>
          </label>
        ))}
      </fieldset>
    </form>
  );
}
