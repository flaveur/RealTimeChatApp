#!/usr/bin/env tsx
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbName = process.env.D1_NAME || process.env.D1_DATABASE || 'chat-appd1';
const migrationsDir = path.resolve(__dirname, '../drizzle/migrations');

if (!existsSync(migrationsDir)) {
  console.error('Migrations directory not found:', migrationsDir);
  process.exit(1);
}

// Hent alle SQL-filer og sorter dem
const migrationFiles = readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

if (migrationFiles.length === 0) {
  console.log('No migration files found.');
  process.exit(0);
}

console.log(`Running ${migrationFiles.length} migration(s) against database: ${dbName}`);
console.log('Using --local flag for local development\n');

let successCount = 0;
let failCount = 0;

for (const file of migrationFiles) {
  const sqlFile = path.join(migrationsDir, file);
  console.log(`\n📦 Running migration: ${file}`);
  
  try {
    execSync(`npx wrangler d1 execute ${dbName} --local --file="${sqlFile}"`, { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    successCount++;
  } catch (err) {
    const error = err as Error;
    console.error(`❌ Migration failed: ${file}`, error.message || err);
    failCount++;
    // Continue with next migration instead of exiting
  }
}

console.log('\n' + '='.repeat(50));
console.log(`✅ Successful: ${successCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log('='.repeat(50));

if (failCount > 0) {
  console.log('\n⚠️  Some migrations failed. Check the errors above.');
  process.exit(1);
} else {
  console.log('\n🎉 All migrations completed successfully!');
}