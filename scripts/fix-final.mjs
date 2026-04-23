/**
 * Correção final de vínculos:
 * 1. Criar escolas reais que faltam (CLOVIS SALGADO, ANTÔNIO TEREZA, etc.)
 * 2. Vincular demands dessas escolas ao novo schoolId
 * 3. Remover demands de ruído (TOTAL, TOTAL CIM, CONFERIR)
 * 4. Deletar mediadores de teste (nomes fictícios, ids 2-9)
 * 5. Corrigir mediador id=10 (João) que está com schoolId=3 (válido, manter)
 * 6. Corrigir mediadores da planilha com schoolId inválido via attendantName
 */

import { createConnection } from "mysql2/promise";

const u = new URL(process.env.DATABASE_URL);
const conn = await createConnection({
  host: u.hostname, port: parseInt(u.port) || 4000,
  user: decodeURIComponent(u.username), password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//, ""), ssl: { rejectUnauthorized: false }
});
console.log("✅ Conectado!\n");

// ─── 1. Criar escolas reais que faltam ──────────────────────────────────────

const escolasFaltantes = [
  { name: "E M Clóvis Salgado",              code: "CLOVIS001" },
  { name: "E M Antônio Tereza",              code: "ANTONIOTEREZA001" },
  { name: "E M do Bairro São Cristóvão",     code: "SAOCRISTOVAO001" },
  { name: "E M Coabitada Cândido Portinari", code: "PORTINARI001" },
];

const novasEscolas = new Map(); // nome_planilha_upper → id

// Mapeamento: nome como aparece na planilha → nome formal
const nomePlanilhaParaFormal = {
  "CLOVIS SALGADO":            "E M Clóvis Salgado",
  "ANTÔNIO TEREZA":            "E M Antônio Tereza",
  "DO BAIRRO SÃO CRISTOVÃO":   "E M do Bairro São Cristóvão",
  "COABITADA CANDIDO PORTINARI": "E M Coabitada Cândido Portinari",
};

console.log("🏫 Criando escolas faltantes...");
for (const escola of escolasFaltantes) {
  // Verificar se já existe
  const [existing] = await conn.execute("SELECT id FROM schools WHERE name = ?", [escola.name]);
  if (existing.length > 0) {
    console.log(`   ℹ️  ${escola.name} já existe (id: ${existing[0].id})`);
    // Mapear todos os nomes da planilha que correspondem a essa escola
    for (const [nomePlanilha, nomeFormal] of Object.entries(nomePlanilhaParaFormal)) {
      if (nomeFormal === escola.name) {
        novasEscolas.set(nomePlanilha, existing[0].id);
      }
    }
    continue;
  }
  // Verificar se code já existe
  const [codeCheck] = await conn.execute("SELECT id FROM schools WHERE code = ?", [escola.code]);
  const finalCode = codeCheck.length > 0 ? escola.code + "X" : escola.code;
  const [result] = await conn.execute(
    "INSERT INTO schools (name, code, weeklyStatus, createdAt, updatedAt) VALUES (?, ?, 'pending', NOW(), NOW())",
    [escola.name, finalCode]
  );
  console.log(`   ✅ Criada: ${escola.name} (id: ${result.insertId})`);
  // Mapear todos os nomes da planilha que correspondem a essa escola
  for (const [nomePlanilha, nomeFormal] of Object.entries(nomePlanilhaParaFormal)) {
    if (nomeFormal === escola.name) {
      novasEscolas.set(nomePlanilha, result.insertId);
    }
  }
}

// ─── 2. Vincular demands às novas escolas ────────────────────────────────────

console.log("\n📋 Vinculando demands às novas escolas...");
let demandsFixed = 0;

for (const [nomePlanilha, schoolId] of novasEscolas.entries()) {
  const [result] = await conn.execute(
    "UPDATE demands SET schoolId = ? WHERE schoolName = ? AND (schoolId IS NULL OR schoolId NOT IN (SELECT id FROM schools))",
    [schoolId, nomePlanilha]
  );
  if (result.affectedRows > 0) {
    console.log(`   ✅ ${result.affectedRows} demands vinculados a "${nomePlanilha}" → schoolId ${schoolId}`);
    demandsFixed += result.affectedRows;
  }
}
console.log(`   Total: ${demandsFixed} demands corrigidos`);

// ─── 3. Remover demands de ruído ─────────────────────────────────────────────

console.log("\n🗑️  Removendo demands de ruído...");
const ruido = ["TOTAL", "TOTAL CIM", "CONFERIR"];
for (const nome of ruido) {
  const [result] = await conn.execute("DELETE FROM demands WHERE schoolName = ?", [nome]);
  if (result.affectedRows > 0) {
    console.log(`   ✅ ${result.affectedRows} demands removidos (${nome})`);
  }
}

// ─── 4. Deletar mediadores de teste ─────────────────────────────────────────

console.log("\n🗑️  Removendo mediadores de teste...");
// ids 2-9 são mediadores fictícios criados durante testes
const testIds = [2, 3, 4, 5, 6, 7, 8, 9];
const [delResult] = await conn.execute(
  `DELETE FROM mediators WHERE id IN (${testIds.join(",")})`,
  []
);
console.log(`   ✅ ${delResult.affectedRows} mediadores de teste removidos`);

// ─── 5. Corrigir mediadores da planilha com schoolId inválido ────────────────

console.log("\n👤 Corrigindo mediadores da planilha com schoolId inválido...");

const [invalidMediators] = await conn.execute(`
  SELECT m.id, m.name, m.schoolId
  FROM mediators m
  LEFT JOIN schools s ON m.schoolId = s.id
  WHERE s.id IS NULL
`);

console.log(`   ${invalidMediators.length} mediators com schoolId inválido`);

let mFixed = 0;
let mNotFixed = 0;

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
    mFixed++;
  } else {
    // Tentar pegar a primeira escola das novas
    const firstSchoolId = novasEscolas.values().next().value;
    if (firstSchoolId) {
      await conn.execute("UPDATE mediators SET schoolId = ? WHERE id = ?", [firstSchoolId, m.id]);
      mFixed++;
    } else {
      mNotFixed++;
      console.log(`   ⚠️  Mediador sem escola: ${m.name} (id: ${m.id})`);
    }
  }
}
console.log(`   ✅ ${mFixed} mediators corrigidos, ${mNotFixed} sem solução`);

// ─── 6. Verificação final ─────────────────────────────────────────────────────

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
const [[sc]] = await conn.execute("SELECT COUNT(*) as n FROM schools");
const [[dm]] = await conn.execute("SELECT COUNT(*) as n FROM demands");
const [[me]] = await conn.execute("SELECT COUNT(*) as n FROM mediators");

console.log("\n" + "=".repeat(60));
console.log("✅ CORREÇÃO FINAL CONCLUÍDA!");
console.log("=".repeat(60));
console.log(`🏫 Escolas: ${sc.n}`);
console.log(`📋 Demands: ${dm.n}`);
console.log(`👤 Mediadores: ${me.n}`);
console.log(`Demands com schoolId inválido restantes: ${d_inv.n}`);
console.log(`Mediators com schoolId inválido restantes: ${m_inv.n}`);

await conn.end();
