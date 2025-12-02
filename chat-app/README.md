# RealTimeChatApp

## 📋 Innholdsfortegnelse

- [Om prosjektet](#om-prosjektet)
- [Teknologier](#teknologier)
- [Forutsetninger](#forutsetninger)
- [Installasjon og oppsett](#installasjon-og-oppsett)
- [Kjøring av applikasjonen](#kjøring-av-applikasjonen)
- [Opprette bruker](#opprette-bruker)
- [Funksjonalitet](#funksjonalitet)
- [Prosjektstruktur](#prosjektstruktur)
- [Database](#database)
- [API-endepunkter](#api-endepunkter)
- [Kilder og referanser](#kilder-og-referanser)

---

## Om prosjektet

RealTimeChatApp er en fullstack chat-applikasjon som lar brukere:
- Registrere seg og logge inn
- Legge til venner og håndtere venneforespørsler
- Sende meldinger til venner i sanntid
- Opprette og administrere personlige notater
- Tilpasse profil, status og tema (lys/mørk modus)

Applikasjonen er bygget med fokus på moderne webutviklingspraksis og demonstrerer bruk av React Server Components (RSC), Cloudflare D1 database, og responsive design for både desktop og mobil.

---

## Teknologier

| Teknologi | Versjon | Beskrivelse |
|-----------|---------|-------------|
| [RedwoodSDK](https://rwsdk.com) | 1.0.0-beta.22 | Fullstack React-rammeverk for Cloudflare Workers |
| [React](https://react.dev) | 19.2.0 | UI-bibliotek med Server Components støtte |
| [TypeScript](https://www.typescriptlang.org) | 5.9.3 | Typet JavaScript |
| [Tailwind CSS](https://tailwindcss.com) | 4.1.16 | Utility-first CSS-rammeverk |
| [Drizzle ORM](https://orm.drizzle.team) | 0.44.7 | TypeScript ORM for SQL-databaser |
| [Cloudflare D1](https://developers.cloudflare.com/d1/) | - | SQLite-basert serverless database |
| [Cloudflare R2](https://developers.cloudflare.com/r2/) | - | Objektlagring for profilbilder |
| [Vite](https://vitejs.dev) | 7.1.12 | Byggverktøy og utviklingsserver |

---

## Forutsetninger

Før du starter, sørg for at du har installert:

1. Ha node lastet ned. 

2. **pnpm** - Vi bruker pnpm som package manager
   ```bash
   npm install -g pnpm
   ```
3. **Wrangler - Installeres automatisk med prosjektet


---

## Installasjon og oppsett

### 1. Velg riktig path
```bash

cd RealTimeChatApp/chat-app
```

### 2. Installer avhengigheter
```bash
pnpm install / pnpm i
```

### 3. Logg inn med Cloudflare (kun første gang)

#### Logg inn på Cloudflare
```bash
npx wrangler login
```

### 4. Kjør database-migrasjoner
```bash
# Generer TypeScript types
pnpm generate

# Kjør migrasjoner mot lokal D1
pnpm migrate
```

### 5. Seed demo-bruker (valgfritt)
For å opprette en test-bruker automatisk:
```bash
pnpm seed:demo
```
Dette oppretter to brukere med:
- **Brukernavn**: `demo`
- **Passord**: `password`

- **Brukernavn**: `test`
- **Passord**: `password`



## Kjøring av applikasjonen

### Utviklingsmodus (lokalt)

Etter at du har lastet ned med avhengihetene med

```bash
pnpm install
```

Kan du kjøre inn denne kommandoen

```bash
pnpm run dev
```
Åpne [http://localhost:5173](http://localhost:5173) i nettleseren.

Eller se hva terminalen gir.


---

## Opprette bruker

### Via applikasjonen (anbefalt)

1. Gå til [http://localhost:5173/register](http://localhost:5173/register)
2. Fyll inn:
   - E-post
   - Brukernavn
   - Passord
3. Klikk "Registrer"




### Logge inn
1. Gå til [http://localhost:5173/login](http://localhost:5173/login)
2. Skriv inn brukernavn og passord
3. Klikk "Logg inn"

---


## Eksempel: Testing av applikasjonen

- Når man har kjørt pnpm seed:demo, så får man inn to brukere å velge mellom

- Man kan logge inn på Demo Bruker og chatte med test bruker.

- Etter man har gjort det, kan man logge ut av Demo, og deretter lage seg en ny bruker

- Med Test bruker kan man legge Demo til som venn, og deretter teste meldingsfunksjonen. 

## Funksjonalitet

### Autentisering
- Registrering med brukernavn og passord
- Innlogging med sesjonsbasert autentisering
- Sikker passordhashing med bcrypt
- Automatisk utlogging ved sesjonsutløp

### Meldinger
- Send og motta meldinger i sanntid
- Se samtaleoversikt med uleste meldinger
- Mobilvennlig chat-visning med navigasjon

### Venner
- Søk etter andre brukere
- Send venneforespørsler
- Godta eller avslå forespørsler
- Se venneliste med online-status

### Notater
- Opprett personlige notater
- Søk i notater
- Slett notater

### Innstillinger
- Last opp profilbilde
- Sett statusmelding
- Velg online-status (Tilgjengelig, Opptatt, Borte)
- Bytt mellom lys og mørk modus
- Tema lagres i database og synkroniseres

### Responsivt design
- Tilpasset layout for mobil og desktop
- Bunnnavigasjon på mobil
- Sidebar-navigasjon på desktop



## Database

Applikasjonen bruker Cloudflare D1 (SQLite) med Drizzle ORM.



## Kilder og referanser

### Dokumentasjon og læringsressurser

- RedwoodSDK Dokumentasjon: 

    https://rwsdk.com/docs
  - Brukt for routing, middleware, React Server Components og Cloudflare-integrasjon
  
- Drizzle ORM Dokumentasjon: 

    https://orm.drizzle.team/docs/overview
  - Brukt for database-skjema, migrasjoner og spørringer

- Cloudflare D1 Dokumentasjon: 

    https://developers.cloudflare.com/d1/
  - Brukt for database-oppsett og tilkobling

- Cloudflare R2 Dokumentasjon: 

    https://rwsdk.com/docs
    https://developers.cloudflare.com/r2/
  - Brukt for lagring av profilbilder

- Typescript, React og tilsvarende dokumentasjon: 


    https://react.dev

    https://www.typescriptlang.org/cheatsheets/

        https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html

        https://www.typescriptlang.org/docs/handbook/intro.html

         - Brukt for komponenter, hooks og Server komponenter

    https://digitalgnist.notion.site/Leksjon-17-29354b19b51f80b3bcedc645f17ab5c0


    Github kilder:
    https://github.com/mariuswallin/hiof-2025-webapp
    

    Oppsettet av prosjektet (Inspirasjon):
    https://github.com/mariuswallin/hiof-2025-webapp/tree/main/lectures/l-17

    KI:

    En del av koden er implementert ved hjelp av Github Copilot
    Samtidig så er det brukt ChatGPT, Claude AI og Qwen for forståelse av hva koden gjør.

    Nærmere dokumentasjon finner du skrevet direkte i koden.


- Tailwind CSS v4 Dokumentasjon: https://tailwindcss.com/docs
  - Brukt for styling og responsivt design
  - Mer spesifikt Tailwind dokumentasjonen for vite.

### Kodeeksempler og inspirasjon

- RedwoodSDK Standard Starter Template
- Tailwind UI komponenter for layout-inspirasjon
- Oppsettet av prosjektet (Inspirasjon):
    https://github.com/mariuswallin/hiof-2025-webapp/tree/main/lectures/l-17
---



Gruppe 21 - Eksamensinnlevering [ ITF31619-1 25H Webapplikasjoner ]
