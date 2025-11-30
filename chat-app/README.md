# RealTimeChatApp 

Denne repositoryen inneholder appen vår, RealTimeChatApp (Cloudflare Worker + Vite + RedwoodSDK).

Denne README- filen er en oversikt over kommandoene man skriver inn for å kjøre applikasjonen.

Prerequisites
- Node 18+ (LTS recommended)
- pnpm (package manager)
- wrangler (if you plan to run Cloudflare Worker locally / deploy)

Hvis du ikke har pnpm installert, kjør denne kommandoen:

```powershell
npm install -g pnpm
```

Repository layout
- `chat-app/` — main-appen (inneholder `package.json`). Kjør kommandoene fra denne mappen

Kommandoer (PowerShell)

Installere dependencies:

```powershell
pnpm install
```

bruk kun pnpm install inne chat-app:

```powershell
cd .\chat-app\
pnpm install
```

Run dev (Vite)

For å kjøre applikasjonen

```powershell
cd .\chat-app\
pnpm run dev
```

Build for production

```powershell
pnpm --filter ./chat-app build
```

Preview the built site (local static server)

```powershell
pnpm --filter ./chat-app preview
```

Cloudflare Worker development & deploy

Run the worker locally (wrangler required):

```powershell
cd .\chat-app\
px wrangler dev
```

Deploy (wrangler configured):

```powershell
cd .\chat-app\
wrangler publish
```

Database (Drizzle / D1)

Generate eller apply migrations (drizzle-kit + scripts provided):

```powershell
cd .\chat-app\
pnpm run migrate:apply:d1

# Run seed 
pnpm run seed
```


## Tailwind / CSS

- Tailwind er konfigurert til å kjøres gjennom PostCSS. Appen importerer `src/app/styles.css` fra `src/app/Document.tsx`.
- Hvis Tailwind-klasser ikke blir brukt, sjekk at `src/app/Document.tsx` inneholder både `import './styles.css'` (for dev) og stilark-lenken `styles.css?url` i `<head>`. Prosjektet er allerede satt opp slik.

- Du kan verifye Tailwind-bygget med hjelpeskriptet:

```
pnpm --filter ./chat-app verify:tailwind 
```

## Push

- Ved push, så SKAL node_modules og pnpm-lock filen fjernes slik at det unngås bugs.

## Feilsøking

- Hvis `pnpm run dev` avsluttes med kode 1: sjekk at du kjører kommandoen fra `chat-app`-mappen.


- Hvis stilene mangler, verifiser at `src/app/Document.tsx` inneholder både `import './styles.css'` og `<link rel="stylesheet" href={stylesUrl} />`.


- Hvis migreringer feiler, sjekk at D1-databasen og miljøvariabler i `wrangler.toml` / `wrangler.jsonc` er konfigurert korrekt.

## Annet informasjon

- Bruk `pnpm --filter ./chat-app <script>` for å kjøre skript fra workspace-roten.


