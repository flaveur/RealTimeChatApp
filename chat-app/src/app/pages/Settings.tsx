'use client';

import { rwsdk } from "@/app/lib/rwsdk";
import { getTheme, setTheme, subscribe, type Theme } from "@/app/lib/theme";
import AppLayout from "../components/ui/AppLayout";
import { Button } from "../components/ui/Button";
import { useEffect, useState, useSyncExternalStore } from "react";

export default function Settings() {
  const me = rwsdk.auth.useCurrentUser?.() ?? null;
  const [name, setName] = useState(me?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const theme = useSyncExternalStore(subscribe, getTheme, () => "system");
  
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load from localStorage only on client
  useEffect(() => {
    const saved = localStorage.getItem("notifications.sound");
    if (saved !== null) {
      setSoundEnabled(saved === "true");
    }
  }, []);

  useEffect(() => {
    setName(me?.name ?? "");
  }, [me?.name]);

  useEffect(() => {
    localStorage.setItem("notifications.sound", String(soundEnabled));
  }, [soundEnabled]);

  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setNameError(null);
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError("Navn må være minst 2 tegn");
      return;
    }
    setSavingName(true);
    const res = await rwsdk.auth.updateName(trimmed);
    setSavingName(false);
    if (!res.ok) {
      setNameError(res.error ?? "Kunne ikke lagre navn");
      return;
    }
  }

  async function handleSaveAvatar(e: React.FormEvent) {
    e.preventDefault();
    setAvatarError(null);
    const trimmed = avatarUrl.trim();
    if (trimmed.length === 0) {
      setAvatarError("Avatar URL kan ikke være tom");
      return;
    }
    setSavingAvatar(true);
    try {
      const res = await fetch("/api/me/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: trimmed }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kunne ikke lagre profilbilde");
      }
      setAvatarUrl("");
      alert("Profilbilde oppdatert!");
    } catch (err: any) {
      setAvatarError(err.message);
    } finally {
      setSavingAvatar(false);
    }
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
      <section className="space-y-4 md:space-y-6 pb-4 md:pb-0">

        {/* PROFIL */}
        <article className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Profil
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Oppdater navnet ditt
            </p>
          </header>

          <form onSubmit={handleSave} className="space-y-4">
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
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3
                           focus:ring-2 focus:ring-blue-500 outline-none text-base"
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{nameError}</p>
              )}
            </fieldset>

            <footer>
              <Button type="submit" disabled={savingName} className="w-full sm:w-auto">
                {savingName ? "Lagrer..." : "Lagre navn"}
              </Button>
            </footer>
          </form>
        </article>

        {/* PROFILBILDE */}
        <article className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Profilbilde
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Legg til URL til profilbildet ditt
            </p>
          </header>

          <form onSubmit={handleSaveAvatar} className="space-y-4">
            <fieldset>
              <legend className="sr-only">Profilbilde URL</legend>
              <label
                htmlFor="avatarUrl"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Avatar URL
              </label>
              <input
                id="avatarUrl"
                name="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3
                           focus:ring-2 focus:ring-blue-500 outline-none text-base"
              />
              {avatarError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{avatarError}</p>
              )}
            </fieldset>

            <footer>
              <Button type="submit" disabled={savingAvatar} className="w-full sm:w-auto">
                {savingAvatar ? "Lagrer..." : "Lagre profilbilde"}
              </Button>
            </footer>
          </form>
        </article>

        {/* STATUS */}
        <article className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Status
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Velg om du er tilgjengelig, opptatt eller borte
            </p>
          </header>

          <UserStatusEditable />
        </article>

        {/* TEMA */}
        <article className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Utseende
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Velg lys eller mørk modus
            </p>
          </header>

          <div className="space-y-3">
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
                  className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg border-2 cursor-pointer transition ${
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
                  <div className="flex-1 min-w-0">
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
        <article className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Varsler
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tilpass hvordan du mottar varsler
            </p>
          </header>

          <div className="space-y-3">
            <label
              className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg border-2 cursor-pointer transition ${
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
          </div>
        </article>

        {/* KONTO */}
        <article className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Konto
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Administrer pålogging og brukerkonto
            </p>
          </header>

          <footer>
            <Button variant="danger" onClick={handleLogout} className="w-full sm:w-auto">
              Logg ut
            </Button>
          </footer>
        </article>
      </section>
    </AppLayout>
  );
}

function UserStatusEditable() {
  const [user, setUser] = useState(() => rwsdk.auth.useCurrentUser());
  
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
    <div className="space-y-3">
      {statusOptions.map(({ value, label, color, description }) => (
        <label
          key={value}
          className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg border-2 cursor-pointer transition ${
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
