/**
 * Corrige schoolId inválidos em demands e mediators.
 *
 * Estratégia:
 * 1. Para demands: cruzar demands.schoolName com schools.name (normalizado) → atualizar schoolId
 * 2. Para mediators de teste (ids 2-9 com schoolId inexistente): nullificar schoolId
 * 3. Para mediators da planilha com schoolId inválido: cruzar pelo nome do mediador
 *    com demands que têm attendantName igual → pegar schoolId do demand correspondente
 */

import { createConnection } from "mysql2/promise";

const u = new URL(process.env.DATABASE_URL);
const conn = await createConnection({
  host: u.hostname, port: parseInt(u.port) || 4000,
  user: decodeURIComponent(u.username), password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//, ""), ssl: { rejectUnauthorized: false }
});
console.log("✅ Conectado!\n");

// ─── 1. Carregar todas as escolas e criar índice de busca ────────────────────

const [schools] = await conn.execute("SELECT id, name FROM schools");

// Normalizar: remover acentos, uppercase, remover prefixos comuns
function normalize(str) {
  if (!str) return "";
  return str
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/^(E\.?\s*M\.?\s*|CIM\s+|ESCOLA\s+MUNICIPAL\s+)/i, "") // remove prefixos
    .replace(/\s+/g, " ")
    .trim();
}

// Índice: nome_normalizado → id
const schoolIndex = new Map();
for (const s of schools) {
  const key = normalize(s.name);
  schoolIndex.set(key, s.id);
  // Também indexar o nome completo sem normalização de prefixo
  schoolIndex.set(s.name.toUpperCase().trim(), s.id);
}

console.log(`📚 ${schools.length} escolas indexadas\n`);

// ─── 2. Corrigir demands com schoolId inválido ───────────────────────────────

// Buscar todos os demands com schoolId inválido
const [invalidDemands] = await conn.execute(`
  SELECT d.id, d.schoolName, d.schoolId
  FROM demands d
  LEFT JOIN schools s ON d.schoolId = s.id
  WHERE s.id IS NULL
`);

console.log(`📋 ${invalidDemands.length} demands com schoolId inválido para corrigir`);

let demandsFixed = 0;
let demandsNotFound = 0;
const notFoundSchools = new Set();

for (const d of invalidDemands) {
  const schoolName = d.schoolName;
  if (!schoolName) { demandsNotFound++; continue; }

  // Tentar encontrar escola pelo nome normalizado
  const normName = normalize(schoolName);
  let schoolId = schoolIndex.get(normName) || schoolIndex.get(schoolName.toUpperCase().trim());

  // Busca parcial: verificar se alguma escola contém o nome normalizado
  if (!schoolId) {
    for (const [key, id] of schoolIndex.entries()) {
      if (key.includes(normName) || normName.includes(key)) {
        schoolId = id;
        break;
      }
    }
  }

  if (schoolId) {
    await conn.execute("UPDATE demands SET schoolId = ? WHERE id = ?", [schoolId, d.id]);
    demandsFixed++;
  } else {
    demandsNotFound++;
    notFoundSchools.add(schoolName);
  }
}

console.log(`   ✅ ${demandsFixed} demands corrigidos`);
if (demandsNotFound > 0) {
  console.log(`   ⚠️  ${demandsNotFound} demands sem escola correspondente`);
  console.log(`   Escolas não encontradas: ${[...notFoundSchools].join(", ")}`);
}

// ─── 3. Corrigir mediators com schoolId inválido ─────────────────────────────

const [invalidMediators] = await conn.execute(`
  SELECT m.id, m.name, m.schoolId
  FROM mediators m
  LEFT JOIN schools s ON m.schoolId = s.id
  WHERE s.id IS NULL
`);

console.log(`\n👤 ${invalidMediators.length} mediators com schoolId inválido para corrigir`);

let mediatorsFixed = 0;
let mediatorsNulled = 0;

for (const m of invalidMediators) {
  // Tentar encontrar schoolId via demands.attendantName
  const [matchingDemands] = await conn.execute(`
    SELECT d.schoolId, COUNT(*) as cnt
    FROM demands d
    JOIN schools s ON d.schoolId = s.id
    WHERE UPPER(TRIM(d.attendantName)) = UPPER(TRIM(?))
    GROUP BY d.schoolId
    ORDER BY cnt DESC
    LIMIT 1
  `, [m.name]);

  if (matchingDemands.length > 0 && matchingDemands[0].schoolId) {
    await conn.execute("UPDATE mediators SET schoolId = ? WHERE id = ?", [matchingDemands[0].schoolId, m.id]);
    mediatorsFixed++;
  } else {
    // Mediator de teste ou sem dados — nullificar schoolId
    await conn.execute("UPDATE mediators SET schoolId = NULL WHERE id = ?", [m.id]);
    mediatorsNulled++;
  }
}

console.log(`   ✅ ${mediatorsFixed} mediators corrigidos via demands`);
console.log(`   ℹ️  ${mediatorsNulled} mediators de teste com schoolId nullificado`);

// ─── 4. Verificação final ─────────────────────────────────────────────────────

const [[d_inv]] = await conn.execute(`
  SELECT COUNT(*) as n FROM demands d
  LEFT JOIN schools s ON d.schoolId = s.id
  WHERE s.id IS NULL AND d.schoolId IS NOT NULL
`);
const [[m_inv]] = await conn.execute(`
  SELECT COUNT(*) as n FROM mediators m
  LEFT JOIN schools s ON m.schoolId = s.id
  WHERE s.id IS NULL AND m.schoolId IS NOT NULL
`);
const [[d_null]] = await conn.execute("SELECT COUNT(*) as n FROM demands WHERE schoolId IS NULL");
const [[m_null]] = await conn.execute("SELECT COUNT(*) as n FROM mediators WHERE schoolId IS NULL");

console.log("\n" + "=".repeat(60));
console.log("✅ CORREÇÃO CONCLUÍDA!");
console.log("=".repeat(60));
console.log(`Demands com schoolId inválido restantes: ${d_inv.n}`);
console.log(`Demands com schoolId NULL: ${d_null.n}`);
console.log(`Mediators com schoolId inválido restantes: ${m_inv.n}`);
console.log(`Mediators com schoolId NULL: ${m_null.n}`);

await conn.end();
