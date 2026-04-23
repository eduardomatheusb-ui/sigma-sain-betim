import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Carregar DATABASE_URL do ambiente ou do .env
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  try {
    const envPath = resolve(__dirname, "../.env");
    const envContent = readFileSync(envPath, "utf8");
    const match = envContent.match(/DATABASE_URL=(.+)/);
    if (match) dbUrl = match[1].trim();
  } catch {}
}
if (!dbUrl) {
  // Tentar via env do processo do servidor
  const envServerPath = resolve(__dirname, "../server/_core/env.ts");
  console.log("DATABASE_URL não encontrado. Tentando via processo...");
}

const conn = await mysql.createConnection(dbUrl);

// 1. Total de alunos (demands)
const [[{ total_students }]] = await conn.execute("SELECT COUNT(*) as total_students FROM demands");

// 2. Alunos com atendente (hasAttendant = 1 ou attendantName não nulo)
const [[{ with_attendant }]] = await conn.execute(
  "SELECT COUNT(*) as with_attendant FROM demands WHERE hasAttendant = 1 OR (attendantName IS NOT NULL AND attendantName != '')"
);

// 3. Alunos sem atendente
const without_attendant = total_students - with_attendant;

// 4. Mediadores ativos (status = 'active')
const [[{ active_mediators }]] = await conn.execute(
  "SELECT COUNT(DISTINCT id) as active_mediators FROM mediators WHERE status = 'active'"
);

// 5. Total de mediadores
const [[{ total_mediators }]] = await conn.execute("SELECT COUNT(DISTINCT id) as total_mediators FROM mediators");

// 6. Vínculos mediador↔aluno (mediator_students)
const [links] = await conn.execute("SELECT mediatorId, demandId FROM mediator_students");

// Calcular carga por mediador
const mediatorLoadMap = new Map();
for (const link of links) {
  const mid = link.mediatorId;
  if (!mediatorLoadMap.has(mid)) mediatorLoadMap.set(mid, new Set());
  mediatorLoadMap.get(mid).add(link.demandId);
}

// 7. Atendentes compartilhados (carga >= 2)
let sharedMediators = 0;
let mediators1 = 0;
let mediators2 = 0;
let mediators3plus = 0;
let totalLinkedStudents = 0;
let studentsInSharedCare = 0;

for (const [mid, students] of mediatorLoadMap.entries()) {
  const count = students.size;
  totalLinkedStudents += count;
  if (count === 1) mediators1++;
  else if (count === 2) { mediators2++; sharedMediators++; studentsInSharedCare += count; }
  else if (count >= 3) { mediators3plus++; sharedMediators++; studentsInSharedCare += count; }
}

// 8. Média de alunos por atendente (com vínculo)
const avgStudentsPerMediator = mediatorLoadMap.size > 0
  ? (totalLinkedStudents / mediatorLoadMap.size).toFixed(2)
  : "0.00";

// 9. Taxa de cobertura
const coverageRate = total_students > 0
  ? ((with_attendant / total_students) * 100).toFixed(1)
  : "0.0";

// 10. Rankings por escola (deduplicado por mediador)
const [mediatorRows] = await conn.execute(
  "SELECT id, schoolId, status FROM mediators WHERE status IN ('vacancy', 'on_leave', 'temp_leave')"
);
const schoolDemandMap = new Map();
for (const m of mediatorRows) {
  if (!schoolDemandMap.has(m.schoolId)) schoolDemandMap.set(m.schoolId, new Set());
  schoolDemandMap.get(m.schoolId).add(m.id);
}
const [schoolRows] = await conn.execute("SELECT id, name FROM schools");
const schoolRanking = schoolRows
  .map(s => ({ name: s.name, demand: schoolDemandMap.get(s.id)?.size || 0 }))
  .filter(s => s.demand > 0)
  .sort((a, b) => b.demand - a.demand);

const emRanking = schoolRanking.filter(s => s.name.startsWith("E M") || s.name.startsWith("EM ")).slice(0, 5);
const cimRanking = schoolRanking.filter(s => s.name.startsWith("CIM")).slice(0, 5);

console.log("\n========== VALIDAÇÃO DOS INDICADORES DO DASHBOARD ==========\n");
console.log(`Total de alunos (demands):          ${total_students}`);
console.log(`Alunos COM atendente:               ${with_attendant}`);
console.log(`Alunos SEM atendente:               ${without_attendant}`);
console.log(`Taxa de cobertura:                  ${coverageRate}%`);
console.log(`\nMediadores ativos (únicos):         ${active_mediators}`);
console.log(`Total de mediadores (todos status): ${total_mediators}`);
console.log(`Mediadores com vínculo em MS:       ${mediatorLoadMap.size}`);
console.log(`\nAtendentes compartilhados (2+):     ${sharedMediators}`);
console.log(`Alunos em atend. compartilhado:     ${studentsInSharedCare}`);
console.log(`Média de alunos por atendente:      ${avgStudentsPerMediator}`);
console.log(`\nDistribuição de carga:`);
console.log(`  Atendentes com 1 aluno:           ${mediators1}`);
console.log(`  Atendentes com 2 alunos:          ${mediators2}`);
console.log(`  Atendentes com 3+ alunos:         ${mediators3plus}`);
console.log(`\nTop 5 EMs com maior demanda (deduplicado):`);
emRanking.forEach((s, i) => console.log(`  ${i+1}. ${s.name}: ${s.demand} mediadores em demanda`));
console.log(`\nTop 5 CIMs com maior demanda (deduplicado):`);
cimRanking.forEach((s, i) => console.log(`  ${i+1}. ${s.name}: ${s.demand} mediadores em demanda`));
console.log("\n=============================================================\n");

await conn.end();
