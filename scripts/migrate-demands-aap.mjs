import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const migrations = [
  "ALTER TABLE demands ADD COLUMN usesWheelchair BOOLEAN DEFAULT false",
  "ALTER TABLE demands ADD COLUMN usesWalker BOOLEAN DEFAULT false",
  "ALTER TABLE demands ADD COLUMN usesProsthesis BOOLEAN DEFAULT false",
  "ALTER TABLE demands ADD COLUMN homeCare BOOLEAN DEFAULT false",
  "ALTER TABLE demands ADD COLUMN needsAttendant ENUM('yes','no','nam') DEFAULT 'yes'",
];

const conn = await mysql.createConnection(DATABASE_URL);
for (const sql of migrations) {
  try {
    await conn.query(sql);
    console.log("OK:", sql.slice(0, 60));
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME") console.log("SKIP (exists):", sql.slice(0, 60));
    else console.error("ERROR:", e.message);
  }
}
await conn.end();
console.log("Done");
