import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'sigma_sain_betim',
});

try {
  console.log('Applying migration: Add nome column to farol_cases...');
  
  // Check if column already exists
  const [columns] = await connection.execute(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'farol_cases' AND COLUMN_NAME = 'nome'"
  );
  
  if (columns.length === 0) {
    // Add column
    await connection.execute(
      "ALTER TABLE `farol_cases` ADD COLUMN `nome` varchar(255) NOT NULL DEFAULT '' AFTER `dataEntrada`"
    );
    console.log('✅ Column `nome` added successfully');
  } else {
    console.log('✅ Column `nome` already exists');
  }
  
  await connection.end();
  console.log('Migration completed successfully');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
