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

  const sql = `-- Add password column if missing (may error on some SQLite versions)
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
ALTER TABLE users ADD COLUMN password TEXT;
COMMIT;

INSERT INTO users (username, display_name, password, created_at) VALUES ('demo', 'Demo User', '${hash}', datetime('now'));
INSERT INTO messages (user_id, body, created_at) VALUES (1, 'Welcome to the demo chat', datetime('now'));
INSERT INTO messages (user_id, body, created_at) VALUES (1, 'This message was seeded', datetime('now'));
`;

  fs.writeFileSync(path.resolve(__dirname, 'drizzle/seed_demo.sql'), sql, 'utf8');

  console.log(`Wrote seed SQL to ${path.resolve(__dirname, 'drizzle/seed_demo.sql')}`);
  
  try {
    console.log(`Executing seed SQL against D1 database '${dbName}' using wrangler d1 execute`);
    execSync(`npx wrangler d1 execute ${dbName} --file "${path.resolve(__dirname, 'drizzle/seed_demo.sql')}"`, { stdio: 'inherit' });
    console.log('Seed executed successfully. Demo user password:', password);
  } catch (err) {
    const error = err as Error;
    console.error('Seeding failed:', error.message || err);
    process.exit(1);
  }
}

run();