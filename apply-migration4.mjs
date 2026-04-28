import mysql from 'mysql2/promise';
import { createConnection } from 'mysql2/promise';

async function applyMigration() {
  try {
    // Parse DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not set');
    }

    // Create connection using DATABASE_URL
    const connection = await createConnection(dbUrl);

    // Add DEFAULT '' to nome column if it doesn't have one
    await connection.execute(`
      ALTER TABLE farol_cases 
      MODIFY COLUMN nome VARCHAR(255) NOT NULL DEFAULT ''
    `);
    console.log('✅ Migration applied: nome column now has DEFAULT value');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

applyMigration();
