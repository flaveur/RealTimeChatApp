#!/usr/bin/env tsx
import { execSync } from 'child_process';
import fs from 'fs';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const migrations = [
  './drizzle/migrations/0001_init.sql',
  './drizzle/migrations/0002_add_social_features.sql'
];

const dbName = process.env.D1_NAME || process.env.D1_DATABASE || 'chat_db';

if (process.env.D1_NAME || process.env.D1_DATABASE) {
  console.log(`Executing migrations against D1 database '${dbName}' using wrangler d1 execute`);
  
  for (const sqlPath of migrations) {
    if (!fs.existsSync(sqlPath)) {
      console.warn(`⚠️  Migration SQL not found at ${sqlPath}, skipping...`);
      continue;
    }

    try {
      console.log(`\n📦 Running migration: ${sqlPath}`);
      execSync(`npx wrangler d1 execute ${dbName} --file ${sqlPath}`, { stdio: 'inherit' });
      console.log(`✅ Migration ${sqlPath} executed successfully.`);
    } catch (err) {
      const error = err as Error;
      console.error(`❌ Migration ${sqlPath} failed:`, error.message || err);
      process.exit(1);
    }
  }
  
  console.log('\n✅ All migrations executed successfully.');
} else {
  console.log('No D1 database name provided in env (D1_NAME or D1_DATABASE).');
  console.log('To seed D1, set D1_NAME and ensure `npx wrangler` is logged in.');
  console.log('\nMigrations to run:\n');
  
  for (const sqlPath of migrations) {
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      console.log(`\n--- ${sqlPath} ---`);
      console.log(sql);
    }
  }
}

/*Seed script for D1 database med Wrangler

Hele scriptet er skrevet av GitHub Copilot. */