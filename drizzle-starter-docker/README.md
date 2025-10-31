# Info

For å bruke denne må du ha docker installert lokalt.

Se [docker sin hjemmeside](https://www.docker.com/get-started/) for installasjonsinstruksjoner

Hvis på Mac så anbefales det å bruke [orbstack](https://orbstack.dev/) som er en lettere og raskere versjon av docker desktop

Når docker er installert, så kan du starte prosjektet med

```bash
docker compose up --build
```

Hvis du vil kjøre i bakgrunnen kan du legge til `-d` flagget

```bash
docker compose up --build -d
```

Hvis du vil stoppe serveren kan du bruke

```bash
docker compose down
```

Hvis denne feiler så kan det hende du først må slette node_modules og lock filen. Deretter installere og prøve å starte serveren med uten docker. Dette for å få laget ".wrangler" mappen.

````markdown
# Info

Docker-oppsettet er fjernet fra dette repositoryet for å forenkle lokal utvikling på Windows. Hvis du likevel trenger Docker-filer senere, er de sikkerhetskopiert i repo-roten under `docker-backup/`.

Bruk heller lokal utviklingsflyt med pnpm (anbefalt) eller npm.

Rask start (pnpm):

```powershell
pnpm install
pnpm dev
```

Rask start (npm):

```powershell
npm install
npm run dev
```

Hvis du får problemer med native avhengigheter (f.eks. better-sqlite3), kjør:

```powershell
pnpm approve-builds
pnpm install
```

Backup av tidligere Docker-filer:

 - `docker-backup/Dockerfile`
 - `docker-backup/docker-compose.yml`
 - `docker-backup/.dockerignore`
 - `docker-backup/README.md.docker-backup`

Hvis du ønsker at jeg fjerner alle Docker-artefakter permanent eller rydder flere docker-relaterte referanser i andre filer (for eksempel `vite.config.mts`), si ifra så ordner jeg det.

````

