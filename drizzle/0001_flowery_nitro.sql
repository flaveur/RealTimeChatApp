-- Oppretter meldings-tabell hvis den ikke finnes
CREATE TABLE IF NOT EXISTS `messages` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `sender_id` integer NOT NULL,
  `receiver_id` integer NOT NULL,
  `content` text NOT NULL,
  `timestamp` integer DEFAULT 1761913253527
);

-- Sletter unik epost-indeks hvis den finnes
DROP INDEX IF EXISTS `users_email_unique`;

-- Legg kun til kolonner hvis de ikke allerede eksisterer
-- SQLite støtter ikke "ADD COLUMN IF NOT EXISTS" direkte, så vi bruker trygge ALTERs
-- Disse blir bare kjørt én gang under første migrasjon
PRAGMA foreign_keys=off;

-- Fjernet eksplicit BEGIN/COMMIT: Cloudflare D1 remote migrations støtter ikke
-- SQL-transaksjoner i migrasjons-skript (bruk state.storage.transaction i JS).
-- Derfor kjører vi endringene enkeltvis uten eksplisitt TRANSACTION-blokk.
-- sjekk kolonner i users
-- Ingen ALTER TABLE her for å unngå "duplicate column" på eksisterende DB-installasjoner.
-- Hvis du trenger å legge til kolonner på en database som mangler dem, lag en
-- egen migrasjon som kjøres kun mot databaser som trenger oppdateringen.

PRAGMA foreign_keys=on;

-- Opprett unik indeks for brukernavn hvis den ikke finnes
CREATE UNIQUE INDEX IF NOT EXISTS `users_username_unique` ON `users` (`username`);

-- DROP COLUMN støttes ikke på alle SQLite-versjoner; fjern disse for å unngå feil
-- dersom kolonnene allerede er fjernet eller ikke finnes.
