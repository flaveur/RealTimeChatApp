'use client';

import { useEffect, useState, useSyncExternalStore } from "react";
import Sidebar from "../../components/Sidebar";
import { rwsdk } from "../lib/rwdsk";
import {
  applyTheme,
  getTheme,
  setTheme,
  subscribe,
  type Theme,
} from "../lib/theme";
import UserStatusEditable from "./UserStatusEditable";

export default function Settings() {
  // Tailwind dark-mode strategy (html.dark) – bruk applyTheme ved mount
  // Ref: https://tailwindcss.com/docs/dark-mode
  useEffect(() => {
    applyTheme();
  }, []);

  // ✅ Bruk hooken direkte i stedet for useSyncExternalStore
  // Live-bruker (navn/status) via enkel store + useSyncExternalStore
  // Ref: https://react.dev/reference/react/useSyncExternalStore
  const me = rwsdk.auth.useCurrentUser?.() ?? null;

  // local state for navn (lagres til localStorage via rwsdk.auth.setName)
  // Ref: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  const [name, setName] = useState(me?.name ?? "");
  useEffect(() => {
    setName(me?.name ?? "");
  }, [me?.name]);

  // Tema (light/dark/system), med synk mot html.dark
  const theme = useSyncExternalStore(
    subscribe,
    () => getTheme(),
    () => "system"
  );

  function saveName(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Implementer setName i rwsdk.auth i neste oblig
    console.log("Lagrer navn:", name.trim());
    alert(`Navn lagret: ${name.trim()} (mock)`);
  }

  return (
    <section className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <main className="mx-auto flex max-w-[1400px] gap-0 p-4">
        <Sidebar />
        
        <section className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-6 space-y-8">
          <header>
            <h1 className="text-2xl font-semibold dark:text-white">Innstillinger</h1>
            <p className="text-gray-600 dark:text-gray-400">Tilpass konto, status og utseende</p>
          </header>

      {/* PROFIL (kort/seksjon) – inspirasjon: Tailwind UI Settings */}
      {/* https://tailwindui.com/components/application-ui/forms/settings */}
      <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <header className="mb-4">
          <h2 className="text-lg font-medium dark:text-white">Profil</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Oppdater visningsnavnet ditt</p>
        </header>

        {/* Tilgjengelig skjema (fieldset/label/legend) – MDN */}
        {/* https://developer.mozilla.org/en-US/docs/Learn/Forms/Accessibility */}
        <form onSubmit={saveName} className="max-w-md space-y-4">
          <fieldset className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium dark:text-gray-200">
              Visningsnavn
            </label>
            <input
              id="name"
              name="name"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 px-3 py-2 outline-none focus:border-brand-blue dark:focus:border-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Skriv navnet ditt"
            />
          </fieldset>

          <section aria-label="Avatar" className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"
            />
            <button
              type="button"
              className="rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200"
            >
              Endre avatar (kommer)
            </button>
          </section>

          <footer>
            <button
              type="submit"
              className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
            >
              Lagre navn
            </button>
          </footer>
        </form>
      </section>

      {/* STATUS – bruker redigerbar status-komponent (radio-løsning) */}
      {/* Headless UI Radio Group inspirasjon (tilgjengelige radios): */}
      {/* https://headlessui.com/react/radio-group */}
      <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <header className="mb-4">
          <h2 className="text-lg font-medium dark:text-white">Status</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Velg om du er tilgjengelig, opptatt eller borte
          </p>
        </header>
        <UserStatusEditable />
      </section>

      {/* UTSEENDE – tema-valg, lagres i localStorage og applikeres til html.dark */}
      {/* Tailwind Dark Mode (class): https://tailwindcss.com/docs/dark-mode */}
      <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <header className="mb-4">
          <h2 className="text-lg font-medium dark:text-white">Utseende</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tema for appen</p>
        </header>

        <form>
          <fieldset className="space-y-2">
            <legend className="sr-only">Tema</legend>

            {(["light", "dark", "system"] as Theme[]).map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
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
      </section>

      {/* VARSLER – placeholder (disabled) */}
      <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <header className="mb-4">
          <h2 className="text-lg font-medium dark:text-white">Varsler</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Visualisering for alpha, ikke aktiv ennå</p>
        </header>

        <ul className="space-y-2">
          <li>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" disabled />
              Lyd ved ny melding
            </label>
          </li>
          <li>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" disabled />
              Desktop-varsler
            </label>
          </li>
        </ul>
      </section>

      {/* PERSONVERN – placeholder (disabled toggles) */}
      <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <header className="mb-4">
          <h2 className="text-lg font-medium dark:text-white">Personvern</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kommer i beta</p>
        </header>

        <ul className="space-y-2">
          <li>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" disabled />
              Lesekvitteringer
            </label>
          </li>
          <li>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" disabled />
              Vis "skriver…"-indikator
            </label>
          </li>
        </ul>
      </section>

      {/* LOGG UT */}
      <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <header className="mb-4">
          <h2 className="text-lg font-medium dark:text-white">Konto</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Administrer din pålogging</p>
        </header>

        <button
          type="button"
          onClick={() => {
            // Fjern auth cookies
            document.cookie = "authToken=; path=/; max-age=0";
            document.cookie = "userEmail=; path=/; max-age=0";
            // Naviger til login
            window.location.href = "/login";
          }}
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Logg ut
        </button>
          </section>
        </section>
      </main>
    </section>
  );
}