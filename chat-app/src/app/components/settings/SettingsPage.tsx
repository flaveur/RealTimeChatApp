'use client';

import { rwsdk } from "@/app/lib/rwsdk";
import { getTheme, setTheme, subscribe, type Theme } from "@/app/lib/theme";
import AppLayout from "../ui/AppLayout";
import { Button } from "../ui/Button";
import { useEffect, useState, useSyncExternalStore, useRef } from "react";

export default function SettingsPage() {
  // Lokal state for form-felter
  const [statusText, setStatusText] = useState("");
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  
  /**
   * useSyncExternalStore - React 18 hook for ekstern state
   * 
   * Denne hooken lar React komponenter "subscribe" til ekstern state
   * (state som ikke administreres av React). Perfekt for tema som
   * lagres i localStorage.
   * 
   * Parametere:
   * 1. subscribe - funksjon som registrerer en callback
   * 2. getTheme - funksjon som returnerer nåværende verdi
   * 3. () => "system" - fallback for server-side rendering
   */
  const theme = useSyncExternalStore(subscribe, getTheme, () => "system");
  
  // Ref for å nullstille file input etter opplasting
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Lydinnstilling lagres i localStorage (ikke server)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Hent brukerdata ved oppstart
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me", { credentials: "same-origin" });
        if (res.ok) {
          const data = await res.json() as { avatarUrl?: string; statusText?: string };
          setCurrentAvatarUrl(data.avatarUrl ?? null);
          setStatusText(data.statusText ?? "");
        }
      } catch (err) {
        console.error("Kunne ikke hente brukerdata:", err);
      }
    }
    fetchUser();
  }, []);

  
  useEffect(() => {
    const saved = localStorage.getItem("notifications.sound");
    if (saved !== null) {
      setSoundEnabled(saved === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("notifications.sound", String(soundEnabled));
  }, [soundEnabled]);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [savingStatusText, setSavingStatusText] = useState(false);
  const [statusTextError, setStatusTextError] = useState<string | null>(null);
  const [statusTextSuccess, setStatusTextSuccess] = useState(false);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      const data = await res.json() as { success?: boolean; avatarUrl?: string; error?: string };
      
      if (!res.ok) {
        throw new Error(data.error || "Kunne ikke laste opp bilde");
      }

      if (data.avatarUrl) {
        setCurrentAvatarUrl(data.avatarUrl);
        // Oppdater rwsdk state så UserStatus oppdateres
        rwsdk.auth.updateAvatar(data.avatarUrl);
      }
    } catch (err: any) {
      setAvatarError(err.message);
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSaveStatusText(e: React.FormEvent) {
    e.preventDefault();
    setStatusTextError(null);
    setStatusTextSuccess(false);
    
    const trimmed = statusText.trim();
    if (trimmed.length > 100) {
      setStatusTextError("Statustekst kan være maks 100 tegn");
      return;
    }
    
    setSavingStatusText(true);
    try {
      const result = await rwsdk.auth.setStatusText(trimmed);
      if (!result.ok) {
        throw new Error(result.error || "Kunne ikke lagre statustekst");
      }
      setStatusTextSuccess(true);
      setTimeout(() => setStatusTextSuccess(false), 2000);
    } catch (err: any) {
      setStatusTextError(err.message);
    } finally {
      setSavingStatusText(false);
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
      <section className="space-y-4 md:space-y-6 pb-4 md:pb-6 overflow-y-auto h-full hide-scrollbar">

        {/* PROFILBILDE */}
        <article className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Profilbilde
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last opp et bilde av deg selv
            </p>
          </header>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Nåværende profilbilde */}
            <div className="relative">
              {currentAvatarUrl ? (
                <img 
                  src={currentAvatarUrl} 
                  alt="Ditt profilbilde" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                  <span className="text-white text-2xl font-bold">?</span>
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {uploadingAvatar ? "Laster opp..." : "Velg bilde"}
              </label>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG, GIF eller WebP. Maks 5MB.
              </p>
              {avatarError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{avatarError}</p>
              )}
            </div>
          </div>
        </article>

        {/* STATUSTEKST */}
        <article className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Statustekst
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Legg til en personlig melding som vises ved siden av statusen din
            </p>
          </header>

          <form onSubmit={handleSaveStatusText} className="space-y-4">
            <fieldset>
              <legend className="sr-only">Statustekst</legend>
              <label
                htmlFor="statusText"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Hva driver du med?
              </label>
              <input
                id="statusText"
                name="statusText"
                type="text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder="Skriv din statustekst her..."
                maxLength={100}
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3
                           focus:ring-2 focus:ring-blue-500 outline-none text-base"
              />
              <p className="mt-1 text-xs text-gray-400">{statusText.length}/100 tegn</p>
              {statusTextError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{statusTextError}</p>
              )}
              {statusTextSuccess && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">Statustekst lagret!</p>
              )}
            </fieldset>

            <footer>
              <Button type="submit" disabled={savingStatusText} className="w-full sm:w-auto">
                {savingStatusText ? "Lagrer..." : "Lagre statustekst"}
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
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme(t);
                  }}
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
                  <div className="w-5 h-5 flex-shrink-0">
                    {theme === t && (
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
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
    if (!rwsdk.auth.isInitialized()) {
      rwsdk.auth.fetchCurrentUser();
    }
    
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
          onClick={(e) => {
            e.preventDefault();
            handleStatusChange(value);
          }}
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
          <div className="w-5 h-5 flex-shrink-0">
            {currentStatus === value && (
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}


/**
 * SettingsPage - Innstillinger for bruker
 * 
 * Denne komponenten lar brukeren konfigurere:
  - Profilbilde (opplasting til R2 bucket)
  - Statustekst (personlig melding)
  - Status (tilgjengelig/opptatt/borte)
  - Tema (lyst/mørkt/system)
  - Varsler (lydinnstillinger)
   - Utlogging
 
  Tekniske detaljer:
  useSyncExternalStore for tema
  FormData for filopplasting
  rwsdk for global state management
  localStorage for varslings-preferanser
 
  Kode skrevet med hjelp fra AI (GitHub Copilot / Claude).
 */