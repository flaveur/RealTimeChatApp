#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import bcrypt from 'bcryptjs';

const __dirname = path.resolve();
const dbName = process.env.D1_NAME || process.env.D1_DATABASE || 'chat-appd1';

async function run(): Promise<void> {
  const password = 'password';
  const hash = await bcrypt.hash(password, 10);

  // Seed SQL som samsvarer med migrasjonsskjemaet
  // users: id, username, display_name, password, created_at, status, avatar_url, status_text
  // messages: id, sender_id, receiver_id, content, read_at, created_at
  const sql = `-- Seed demo brukere
INSERT OR IGNORE INTO users (id, username, display_name, password, status, created_at) 
VALUES (1, 'demo', 'Demo User', '${hash}', 'online', datetime('now'));

INSERT OR IGNORE INTO users (id, username, display_name, password, status, created_at) 
VALUES (2, 'testuser', 'Test Bruker', '${hash}', 'offline', datetime('now'));

-- Legg til vennskap mellom demo og testuser
INSERT OR IGNORE INTO friendships (user_id, friend_id, created_at)
VALUES (1, 2, datetime('now'));

INSERT OR IGNORE INTO friendships (user_id, friend_id, created_at)
VALUES (2, 1, datetime('now'));

-- Seed noen meldinger mellom brukerne
INSERT OR IGNORE INTO messages (sender_id, receiver_id, content, created_at)
VALUES (1, 2, 'Hei! Velkommen til chat-appen.', datetime('now', '-5 minutes'));

INSERT OR IGNORE INTO messages (sender_id, receiver_id, content, created_at)
VALUES (2, 1, 'Takk! Dette ser bra ut.', datetime('now', '-3 minutes'));

INSERT OR IGNORE INTO messages (sender_id, receiver_id, content, created_at)
VALUES (1, 2, 'Ja, den støtter meldinger, venner og notater!', datetime('now', '-1 minutes'));
`;

  fs.writeFileSync(path.resolve(__dirname, 'drizzle/seed_demo.sql'), sql, 'utf8');

  console.log(`Wrote seed SQL to ${path.resolve(__dirname, 'drizzle/seed_demo.sql')}`);
  
  try {
    console.log(`Executing seed SQL against D1 database '${dbName}' using wrangler d1 execute`);
    execSync(`npx wrangler d1 execute ${dbName} --file "${path.resolve(__dirname, 'drizzle/seed_demo.sql')}"`, { stdio: 'inherit' });
    console.log('\n✅ Seed executed successfully!');
    console.log('Demo brukere opprettet:');
    console.log('  - Brukernavn: demo     Passord: password');
    console.log('  - Brukernavn: testuser Passord: password');
  } catch (err) {
    const error = err as Error;
    console.error('Seeding failed:', error.message || err);
    process.exit(1);
  }
}

run();

/*Seed script for D1 database med Wrangler

Hele scriptet er skrevet av GitHub Copilot. */