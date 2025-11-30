#!/usr/bin/env tsx
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbName = process.env.D1_NAME || process.env.D1_DATABASE || 'chat-appd1';
const sqlFile = path.resolve(__dirname, '../drizzle/migrations/0001_init.sql');

if (!sqlFile) {
  console.error('Cannot find migration SQL file:', sqlFile);
  process.exit(1);
}

console.log(`Running D1 migration against database: ${dbName}`);

try {
  execSync(`npx wrangler d1 execute ${dbName} --file "${sqlFile}"`, { stdio: 'inherit' });
  console.log('Migration executed successfully.');
} catch (err) {
  const error = err as Error;
  console.error('Migration failed:', error.message || err);
  process.exit(1);
}