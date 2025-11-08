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
  
  // Varsler state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("notifications.sound");
    return saved !== null ? saved === "true" : true;
  });
  const [desktopEnabled, setDesktopEnabled] = useState(() => {
    const saved = localStorage.getItem("notifications.desktop");
    return saved !== null ? saved === "true" : false;
  });
  const [mentionsOnly, setMentionsOnly] = useState(() => {
    const saved = localStorage.getItem("notifications.mentionsOnly");
    return saved !== null ? saved === "true" : false;
  });

  useEffect(() => {
    setName(me?.name ?? "");
  }, [me?.name]);

  useEffect(() => {
    localStorage.setItem("notifications.sound", String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("notifications.desktop", String(desktopEnabled));
  }, [desktopEnabled]);

  useEffect(() => {
    localStorage.setItem("notifications.mentionsOnly", String(mentionsOnly));
  }, [mentionsOnly]);

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

          <div className="space-y-3 max-w-md">
            {(["light", "dark", "system"] as Theme[]).map((t) => {
              const labels = { light: "Lyst", dark: "Mørkt", system: "System" };
              const descriptions = {
                light: "Lyst fargetema",
                dark: "Mørkt fargetema",
                system: "Følg systeminnstillinger"
              };
              return (
                <label
                  key={t}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                    theme === t
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={t}
                    checked={theme === t}
                    onChange={() => setTheme(t)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{labels[t]}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{descriptions[t]}</p>
                  </div>
                  {theme === t && (
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              );
            })}
          </div>
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
              Tilpass hvordan du mottar varsler
            </p>
          </header>

          <div className="space-y-3 max-w-md">
            {/* Lydvarsler */}
            <label
              className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                soundEnabled
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/30"
              }`}
            >
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Lyd ved ny melding</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Spill av lyd når du mottar nye meldinger
                </p>
              </div>
              <div className={`flex-shrink-0 w-12 h-6 rounded-full transition ${
                soundEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}>
                <div className={`h-6 w-6 rounded-full bg-white shadow transform transition ${
                  soundEnabled ? "translate-x-6" : "translate-x-0"
                }`} />
              </div>
            </label>

            {/* Desktop-varsler */}
            <label
              className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                desktopEnabled
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/30"
              }`}
            >
              <input
                type="checkbox"
                checked={desktopEnabled}
                onChange={(e) => setDesktopEnabled(e.target.checked)}
                className="sr-only"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Desktop-varsler</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Vis varsler på skrivebordet når du får nye meldinger
                </p>
              </div>
              <div className={`flex-shrink-0 w-12 h-6 rounded-full transition ${
                desktopEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}>
                <div className={`h-6 w-6 rounded-full bg-white shadow transform transition ${
                  desktopEnabled ? "translate-x-6" : "translate-x-0"
                }`} />
              </div>
            </label>

            {/* Kun ved mentions */}
            <label
              className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                mentionsOnly
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/30"
              }`}
            >
              <input
                type="checkbox"
                checked={mentionsOnly}
                onChange={(e) => setMentionsOnly(e.target.checked)}
                className="sr-only"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Kun ved mentions</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Motta varsler bare når noen nevner deg direkte
                </p>
              </div>
              <div className={`flex-shrink-0 w-12 h-6 rounded-full transition ${
                mentionsOnly ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}>
                <div className={`h-6 w-6 rounded-full bg-white shadow transform transition ${
                  mentionsOnly ? "translate-x-6" : "translate-x-0"
                }`} />
              </div>
            </label>
          </div>
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
  const [user, setUser] = useState(() => rwsdk.auth.useCurrentUser());
  
  // Lytt til endringer i brukerdata
  useEffect(() => {
    const unsub = rwsdk.auth.onChange(() => {
      setUser(rwsdk.auth.useCurrentUser());
    });
    return unsub;
  }, []);

  const handleStatusChange = (newStatus: "online" | "busy" | "away") => {
    rwsdk.auth.setStatus(newStatus);
  };

  const currentStatus = user?.status ?? "online";

  const statusOptions = [
    { value: "online" as const, label: "Tilgjengelig", color: "bg-green-500", description: "Du er tilgjengelig for chat" },
    { value: "busy" as const, label: "Opptatt", color: "bg-red-500", description: "Ikke forstyrr" },
    { value: "away" as const, label: "Borte", color: "bg-yellow-400", description: "Midlertidig utilgjengelig" },
  ];

  return (
    <div className="space-y-3 max-w-md">
      {statusOptions.map(({ value, label, color, description }) => (
        <label
          key={value}
          className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
            currentStatus === value
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/30"
          }`}
        >
          <input
            type="radio"
            name="status"
            value={value}
            checked={currentStatus === value}
            onChange={() => handleStatusChange(value)}
            className="sr-only"
          />
          <span className={`h-4 w-4 rounded-full ${color} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          </div>
          {currentStatus === value && (
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </label>
      ))}
    </div>
  );
}
