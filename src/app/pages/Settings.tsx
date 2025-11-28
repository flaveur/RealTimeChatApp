import { rwsdk } from "@/app/lib/rwsdk";
import { getTheme, setTheme, subscribe, type Theme } from "@/app/lib/theme";
import AppLayout from "@/components/ui/AppLayout";
import { Button } from "@/components/ui/Button";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/*Settings-siden gir brukeren kontroll over profil, status, tema, varsler og konto.
  Mobile: Stablede seksjoner, full bredde-knapper, større touch-områder (p-4 md:p-6)
  Desktop: Side-ved-side layout, kompakte knapper (w-full sm:w-auto)
 */
export default function Settings() {
  //Hent innlogget bruker fra rwsdk (reaktivt via useCurrentUser)
  const me = rwsdk.auth.useCurrentUser?.() ?? null;
  const [name, setName] = useState(me?.name ?? "");
  //useSyncExternalStore synkroniserer tema-state med localStorage via theme.ts
  const theme = useSyncExternalStore(subscribe, getTheme, () => "system");

  //Varsler state: Lagre brukerpreferanser for notifikasjoner i localStorage
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("notifications.sound");
    return saved !== null ? saved === "true" : true; // Standard: lyd på
  });
  const [desktopEnabled, setDesktopEnabled] = useState(() => {
    const saved = localStorage.getItem("notifications.desktop");
    return saved !== null ? saved === "true" : false; // Standard: desktop-varsler av
  });
  const [mentionsOnly, setMentionsOnly] = useState(() => {
    const saved = localStorage.getItem("notifications.mentionsOnly");
    return saved !== null ? saved === "true" : false; // Standard: alle varsler, ikke bare mentions
  });

  //Synkroniser navn-state med innlogget bruker når brukerdata oppdateres
  useEffect(() => {
    setName(me?.name ?? "");
  }, [me?.name]);

  //Lagre varsel-preferanser til localStorage når de endres
  //Copilot forklarer: useEffect oppdaterer localStorage automatisk når state endres
  useEffect(() => {
    localStorage.setItem("notifications.sound", String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("notifications.desktop", String(desktopEnabled));
  }, [desktopEnabled]);

  useEffect(() => {
    localStorage.setItem("notifications.mentionsOnly", String(mentionsOnly));
  }, [mentionsOnly]);

  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  /*Lagre brukerens visningsnavn til databasen
   * 
   Dette er implementert med Copilot.
   Validerer at navnet er minst 2 tegn langt
   Sender PUT /api/me/name via rwsdk.auth.updateName()
   Viser feilmelding hvis API returnerer error
   rwsdk notifiserer automatisk andre komponenter om oppdatert brukernavn
   */
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

  /*
    handleLogout: Logger ut brukeren og sender til login-siden
   Sender POST /api/logout som sletter session-cookie og setter status til "offline"
   Redirecter til /login (via window.location.href for full page refresh)
   finally-blokk sikrer redirect selv om API feiler
   */
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
        <article
          aria-labelledby="profil"
          className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm"
        >
          <header className="mb-4">
            <h2
              id="profil"
              className="text-base md:text-lg font-semibold text-gray-900 dark:text-white"
            >
              Profil
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Oppdater navnet ditt og profilbilde
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
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {nameError}
                </p>
              )}
            </fieldset>

            <AvatarUploader />

            <footer>
              <Button
                type="submit"
                disabled={savingName}
                className="w-full sm:w-auto"
              >
                {savingName ? "Lagrer..." : "Lagre navn"}
              </Button>
            </footer>
          </form>
        </article>

        {/* STATUS */}
        <article
          aria-labelledby="status"
          className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm"
        >
          <header className="mb-4">
            <h2
              id="status"
              className="text-base md:text-lg font-semibold text-gray-900 dark:text-white"
            >
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
          className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm"
        >
          <header className="mb-4">
            <h2
              id="theme"
              className="text-base md:text-lg font-semibold text-gray-900 dark:text-white"
            >
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
                system: "Følg systeminnstillinger",
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
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {labels[t]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {descriptions[t]}
                    </p>
                  </div>
                  {theme === t && (
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
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
          className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm"
        >
          <header className="mb-4">
            <h2
              id="notifications"
              className="text-base md:text-lg font-semibold text-gray-900 dark:text-white"
            >
              Varsler
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tilpass hvordan du mottar varsler
            </p>
          </header>

          <div className="space-y-3">
            {/* Lydvarsler */}
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
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Lyd ved ny melding
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Spill av lyd når du mottar nye meldinger
                </p>
              </div>
              <div
                className={`flex-shrink-0 w-12 h-6 rounded-full transition ${
                  soundEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white shadow transform transition ${
                    soundEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </label>

            {/* Desktop-varsler */}
            <label
              className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg border-2 cursor-pointer transition ${
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
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Desktop-varsler
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Vis varsler på skrivebordet når du får nye meldinger
                </p>
              </div>
              <div
                className={`flex-shrink-0 w-12 h-6 rounded-full transition ${
                  desktopEnabled
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white shadow transform transition ${
                    desktopEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </label>

            {/* Kun ved mentions */}
            <label
              className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg border-2 cursor-pointer transition ${
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
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Kun ved mentions
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Motta varsler bare når noen nevner deg direkte
                </p>
              </div>
              <div
                className={`flex-shrink-0 w-12 h-6 rounded-full transition ${
                  mentionsOnly ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white shadow transform transition ${
                    mentionsOnly ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>
        </article>

        {/* KONTO */}
        <article
          aria-labelledby="account"
          className="rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm"
        >
          <header className="mb-4">
            <h2
              id="account"
              className="text-base md:text-lg font-semibold text-gray-900 dark:text-white"
            >
              Konto
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Administrer pålogging og brukerkonto
            </p>
          </header>

          <footer>
            <Button
              variant="danger"
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              Logg ut
            </Button>
          </footer>
        </article>
      </section>
    </AppLayout>
  );
}

/**
  UserStatusEditable: Lar brukeren velge sin tilgjengelighetsstatus
   Viser tre radio-knapper: online (grønn), busy (rød), away (gul)
   Sender POST /api/me/status via rwsdk.auth.setStatus() når bruker endrer valg
   Lytter til onChange-events fra rwsdk for å oppdatere UI når status endres eksternt
  (f.eks. automatisk "away" fra useActivityMonitor eller "offline" ved logout)
  currentStatus vises med blå border og checkmark-ikon
 */
function UserStatusEditable() {
  const [user, setUser] = useState(() => rwsdk.auth.useCurrentUser());

  // Lytt til endringer i brukerdata via rwsdk.auth.onChange
  // Copilot forklarer: Dette holder komponenten synkronisert med status-endringer fra andre kilder
  useEffect(() => {
    const unsub = rwsdk.auth.onChange(() => {
      setUser(rwsdk.auth.useCurrentUser());
    });
    return unsub; // Cleanup: fjern listener ved unmount
  }, []);

  // Sender ny status til backend via rwsdk.auth.setStatus()
  const handleStatusChange = (newStatus: "online" | "busy" | "away") => {
    rwsdk.auth.setStatus(newStatus);
  };

  const currentStatus = user?.status ?? "online";

  const statusOptions = [
    {
      value: "online" as const,
      label: "Tilgjengelig",
      color: "bg-green-500",
      description: "Du er tilgjengelig for chat",
    },
    {
      value: "busy" as const,
      label: "Opptatt",
      color: "bg-red-500",
      description: "Ikke forstyrr",
    },
    {
      value: "away" as const,
      label: "Borte",
      color: "bg-yellow-400",
      description: "Midlertidig utilgjengelig",
    },
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
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
          {currentStatus === value && (
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </label>
      ))}
    </div>
  );
}

/*
AvatarUploader komponent er implementer med Copilot.
 AvatarUploader: Komponent for å laste opp profilbilde til R2storage
 Copilot forklarer:
 * - Viser nåværende avatar (fra me.avatarUrl) eller preview av valgt fil
 * - onSelect: Validerer at fil er bilde og under 2MB, viser preview med URL.createObjectURL
 * - onUpload: Sender fil til POST /api/me/avatar via rwsdk.auth.updateAvatar()
 * - Backend lagrer bildet i R2 bucket og oppdaterer users.avatarUrl i database
 * - rwsdk.notify oppdaterer automatisk me.avatarUrl, som får preview til å fjernes
 * - useMemo kombinerer preview (lokal) og me.avatarUrl (server) for å vise riktig bilde
 */
function AvatarUploader() {
  const me = rwsdk.auth.useCurrentUser?.() ?? null;
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Fjern preview når avatarUrl oppdateres fra server
  useEffect(() => {
    setPreview(null);
  }, [me?.avatarUrl]);

  // Vis preview hvis fil er valgt, ellers vis lagret avatarUrl
  const current = useMemo(
    () => preview ?? me?.avatarUrl ?? null,
    [preview, me?.avatarUrl]
  );

  /* onSelect: Validerer valgt fil og viser lokal preview
     URL.createObjectURL lager en temporary URL for å vise bildet før opplasting
   */
  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Filen må være et bilde");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError("Bildet er for stort (maks 2MB)");
      return;
    }
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  /*
  
  onUpload: Laster opp bildet til R2 via rwsdk.auth.updateAvatar()

  Sender multipart/form-data til POST /api/me/avatar
   Backend lagrer fil i R2 med filnavn: avatars/{userId}-{timestamp}.{ext}
   Oppdaterer users.avatarUrl i database til /api/avatar/{userId}
   rwsdk.notify trigger re-render av alle komponenter som bruker me.avatarUrl
   */
  async function onUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const res = await rwsdk.auth.updateAvatar(file);
    setUploading(false);
    if (!res.ok) {
      setError(res.error ?? "Kunne ikke laste opp avatar");
      return;
    }
    // Fjern preview siden avatarUrl nå er satt via rwsdk.notify
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <section className="flex items-center gap-4">
      <figure className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-gray-500">Ingen</span>
        )}
      </figure>
      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" onChange={onSelect} />
        <Button
          type="button"
          variant="secondary"
          onClick={onUpload}
          disabled={uploading}
        >
          {uploading ? "Laster opp..." : "Last opp"}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </section>
  );
}
