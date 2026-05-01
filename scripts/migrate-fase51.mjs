import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sql = readFileSync(join(__dirname, '../drizzle/0016_external_demands_full.sql'), 'utf-8');

// Split on semicolons, filter empty
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL not set');
const conn = await mysql.createConnection(dbUrl);

let ok = 0;
let failed = 0;

for (const stmt of statements) {
  try {
    await conn.execute(stmt);
    console.log('✓', stmt.slice(0, 80).replace(/\n/g, ' '));
    ok++;
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME' || err.message?.includes('Duplicate column')) {
      console.log('⚠ (already exists, skipping)', stmt.slice(0, 60).replace(/\n/g, ' '));
      ok++;
    } else {
      console.error('✗', err.message, '\n  SQL:', stmt.slice(0, 80).replace(/\n/g, ' '));
      failed++;
    }
  }
}

await conn.end();
console.log(`\nDone: ${ok} OK, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
