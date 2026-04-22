import mysql from "mysql2/promise";
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL not set");

const conn = await mysql.createConnection(dbUrl);

const migrations = [
  // Students: mobilidade
  "ALTER TABLE students ADD COLUMN IF NOT EXISTS usesWheelchair BOOLEAN DEFAULT false",
  "ALTER TABLE students ADD COLUMN IF NOT EXISTS usesWalker BOOLEAN DEFAULT false",
  "ALTER TABLE students ADD COLUMN IF NOT EXISTS usesProsthesis BOOLEAN DEFAULT false",
  // Students: atendimento domiciliar
  "ALTER TABLE students ADD COLUMN IF NOT EXISTS homeCare BOOLEAN DEFAULT false",
  // Students: necessita de atendente
  "ALTER TABLE students ADD COLUMN IF NOT EXISTS needsAttendant ENUM('yes','no','nam') DEFAULT 'yes'",
  // Mediators: escola do outro turno
  "ALTER TABLE mediators ADD COLUMN IF NOT EXISTS otherSchoolId INT DEFAULT NULL",
];

for (const sql of migrations) {
  try {
    await conn.execute(sql);
    console.log("OK:", sql.substring(0, 80));
  } catch (err) {
    // Ignore "duplicate column" errors
    if (err.code === "ER_DUP_FIELDNAME" || err.errno === 1060) {
      console.log("SKIP (already exists):", sql.substring(0, 80));
    } else {
      console.error("ERROR:", err.message, "SQL:", sql.substring(0, 80));
    }
  }
}

await conn.end();
console.log("Migration complete!");
