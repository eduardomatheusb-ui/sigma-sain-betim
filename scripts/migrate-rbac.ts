import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const migration = fs.readFileSync(path.join(__dirname, '../drizzle/rbac_migration.sql'), 'utf8');
const statements = migration.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

(async () => {
  console.log(`Executing ${statements.length} migration statements...`);
  
  for (const stmt of statements) {
    try {
      await db.execute(sql.raw(stmt));
      console.log('✓ Executed:', stmt.substring(0, 70).replace(/\n/g, ' '));
    } catch (err: any) {
      console.error('✗ Error:', err.message);
    }
  }
  console.log('Migration complete!');
  process.exit(0);
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
