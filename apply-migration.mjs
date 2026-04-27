import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function applyMigration() {
  try {
    const connection = await mysql.createConnection(connectionString);
    console.log('Connected to database');

    // Apply migration SQL
    const sqlStatements = [
      `ALTER TABLE \`farol_advisors\` ADD COLUMN \`email\` varchar(255) NOT NULL DEFAULT ''`,
      `ALTER TABLE \`farol_advisors\` ADD COLUMN \`telefone\` varchar(20) NOT NULL DEFAULT ''`,
      `ALTER TABLE \`farol_advisors\` ADD COLUMN \`cargo\` varchar(100) NOT NULL DEFAULT ''`,
      `ALTER TABLE \`farol_advisors\` ADD COLUMN \`areaAtuacao\` varchar(100) NOT NULL DEFAULT ''`,
      `ALTER TABLE \`farol_advisors\` ADD COLUMN \`createdBy\` int DEFAULT NULL`,
      `ALTER TABLE \`farol_advisors\` ADD COLUMN \`updatedBy\` int DEFAULT NULL`,
      `ALTER TABLE \`farol_advisors\` ADD COLUMN \`isDeleted\` boolean DEFAULT false`,
      `ALTER TABLE \`farol_advisors\` ADD COLUMN \`deletedAt\` datetime DEFAULT NULL`,
      `ALTER TABLE \`farol_advisors\` ADD COLUMN \`deletedBy\` int DEFAULT NULL`,
      `CREATE INDEX \`idx_farol_advisors_regional\` ON \`farol_advisors\` (\`regional\`)`,
      `CREATE INDEX \`idx_farol_advisors_ativo\` ON \`farol_advisors\` (\`active\`)`,
      `CREATE INDEX \`idx_farol_advisors_isDeleted\` ON \`farol_advisors\` (\`isDeleted\`)`,
      `CREATE INDEX \`idx_farol_advisors_areaAtuacao\` ON \`farol_advisors\` (\`areaAtuacao\`)`,
    ];

    for (const sql of sqlStatements) {
      try {
        console.log(`Executing: ${sql.substring(0, 60)}...`);
        await connection.execute(sql);
        console.log('✓ Success');
      } catch (error) {
        // Ignore "column already exists" errors
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
          console.log('⚠ Column or index already exists (skipped)');
        } else {
          console.error('✗ Error:', error.message);
        }
      }
    }

    await connection.end();
    console.log('Migration completed');
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
}

applyMigration();
