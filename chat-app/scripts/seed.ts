#!/usr/bin/env tsx
import { execSync } from 'child_process';
import fs from 'fs';

const sqlPath = './drizzle/migrations/0001_init.sql';

if (!fs.existsSync(sqlPath)) {
  console.error('Migration SQL not found at', sqlPath);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');
const dbName = process.env.D1_NAME || process.env.D1_DATABASE || 'chat_db';

if (process.env.D1_NAME || process.env.D1_DATABASE) {
  console.log(`Executing SQL against D1 database '${dbName}' using wrangler d1 execute`);
  
  try {
    execSync(`npx wrangler d1 execute ${dbName} --file ${sqlPath}`, { stdio: 'inherit' });
    console.log('Seed executed successfully.');
  } catch (err) {
    const error = err as Error;
    console.error('Seed failed:', error.message || err);
    process.exit(1);
  }
} else {
  console.log('No D1 database name provided in env (D1_NAME or D1_DATABASE).');
  console.log('To seed D1, set D1_NAME and ensure `npx wrangler` is logged in.');
  console.log('\nSQL to run:\n');
  console.log(sql);
}