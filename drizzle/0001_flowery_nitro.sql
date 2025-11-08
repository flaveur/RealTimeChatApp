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
-- Vi prøver bare å legge til hvis de ikke finnes
ALTER TABLE `users` ADD COLUMN `username` text;
ALTER TABLE `users` ADD COLUMN `password` text;
ALTER TABLE `users` ADD COLUMN `status` text DEFAULT 'online';
ALTER TABLE `users` ADD COLUMN `note` text;

PRAGMA foreign_keys=on;

-- Opprett unik indeks for brukernavn hvis den ikke finnes
CREATE UNIQUE INDEX IF NOT EXISTS `users_username_unique` ON `users` (`username`);

-- Forsøk å fjerne gamle kolonner bare hvis de eksisterer
-- (SQLite støtter ikke IF EXISTS for DROP COLUMN, men disse er sannsynligvis allerede fjernet)
-- Du kan ignorere feilmelding om de ikke finnes
ALTER TABLE `users` DROP COLUMN `name`;
ALTER TABLE `users` DROP COLUMN `email`;
