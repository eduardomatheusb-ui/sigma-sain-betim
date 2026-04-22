import 'dotenv/config';
import { createConnection } from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL not set'); process.exit(1); }

const conn = await createConnection(url);

const statements = [
  `CREATE TABLE IF NOT EXISTS mediator_students (
    id int AUTO_INCREMENT PRIMARY KEY,
    mediatorId int NOT NULL,
    studentId int NOT NULL,
    isPrimary boolean NOT NULL DEFAULT true,
    startDate date,
    endDate date,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS status_history (
    id int AUTO_INCREMENT PRIMARY KEY,
    mediatorId int NOT NULL,
    previousStatus varchar(50) NOT NULL,
    newStatus varchar(50) NOT NULL,
    reason text,
    changedBy int,
    changedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS weekly_snapshots (
    id int AUTO_INCREMENT PRIMARY KEY,
    schoolId int NOT NULL,
    weekReference varchar(20) NOT NULL,
    submittedBy int,
    submittedByName varchar(255),
    snapshotData text,
    status enum('submitted','validated','rejected') NOT NULL DEFAULT 'submitted',
    notes text,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

for (const stmt of statements) {
  try {
    const label = stmt.slice(0, 60).replace(/\n/g, ' ');
    console.log('Executing:', label + '...');
    await conn.execute(stmt);
    console.log('OK');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Add result column to attendances if not exists
try {
  console.log('Adding result column to attendances...');
  await conn.execute("ALTER TABLE attendances ADD COLUMN result text AFTER type");
  console.log('OK');
} catch (err) {
  if (err.message.includes('Duplicate column')) {
    console.log('Column already exists, skipping');
  } else {
    console.error('Error:', err.message);
  }
}

await conn.end();
console.log('Migration complete');
