import { createRequire } from "module";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

import mysql from "mysql2/promise";

const conn = await mysql.createConnection(DATABASE_URL);

// Verificar activeAttendants com deduplicação por nome
const [rows] = await conn.execute(`
  SELECT
    COUNT(*) AS totalDemands,
    SUM(CASE WHEN hasAttendant = 1 THEN 1 ELSE 0 END) AS totalWithAttendant,
    SUM(CASE WHEN hasAttendant = 0 THEN 1 ELSE 0 END) AS totalWithoutAttendant,
    COUNT(DISTINCT CASE WHEN hasAttendant = 1 AND attendantStatus = 'active' AND attendantName IS NOT NULL AND attendantName != '' THEN LOWER(TRIM(attendantName)) END) AS uniqueActiveAttendants,
    COUNT(DISTINCT CASE WHEN hasAttendant = 1 AND attendantStatus = 'inactive' AND attendantName IS NOT NULL AND attendantName != '' THEN LOWER(TRIM(attendantName)) END) AS uniqueInactiveAttendants
  FROM demands
`);

console.log("=== Valores corrigidos (demands.stats) ===");
console.log(rows[0]);

// Verificar mediadores únicos na tabela mediators
const [med] = await conn.execute(`
  SELECT
    COUNT(*) AS totalMediators,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeMediators,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactiveMediators
  FROM mediators
`);
console.log("\n=== Mediadores na tabela mediators ===");
console.log(med[0]);

await conn.end();
