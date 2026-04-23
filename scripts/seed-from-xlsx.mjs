/**
 * Seed script: importa dados da planilha DEMANDADEATENDENTEPENDENTE.xlsx
 * para o banco do SIGMA sem alterar a estrutura existente.
 *
 * Tabelas populadas:
 *   - schools   → escolas únicas das duas abas
 *   - mediators → mediadores únicos da aba "DEMANDA ATENDIDA OK"
 *   - demands   → alunos sem mediador (aba 1) + alunos com mediador (aba 2)
 *
 * Execução: node scripts/seed-from-xlsx.mjs
 */

import { createConnection } from "mysql2/promise";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const __dirname = dirname(fileURLToPath(import.meta.url));
const XLSX_PATH = "/home/ubuntu/upload/DEMANDADEATENDENTEPENDENTE.xlsx";

// ─── helpers ────────────────────────────────────────────────────────────────

function clean(val) {
  if (val == null) return null;
  return String(val).replace(/\s+/g, " ").trim();
}

function cleanUpper(val) {
  const c = clean(val);
  return c ? c.toUpperCase() : null;
}

function normalizeShift(val) {
  if (!val) return "morning";
  const v = String(val).toLowerCase().trim();
  if (v.includes("tarde")) return "afternoon";
  if (v.includes("noite")) return "evening";
  if (v.includes("integral") || v.includes("full")) return "full";
  return "morning"; // manhã é o default
}

function normalizeDisability(val) {
  if (!val) return null;
  return String(val).replace(/\s+/g, " ").trim().toUpperCase();
}

function formatDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    // Validar ano razoável
    if (y < 1900 || y > 2030) return null;
    return `${y}-${m}-${d}`;
  }
  // Tentar parse de string
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

function normalizeCpf(val) {
  if (!val) return null;
  return String(val).replace(/[^\d\-\.\/]/g, "").trim().substring(0, 20);
}

function generateCode(name, index) {
  // Gera código único para escola baseado no nome
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 8);
  return `${slug}${String(index).padStart(3, "0")}`;
}

// ─── leitura da planilha ────────────────────────────────────────────────────

console.log("📖 Lendo planilha...");
const workbook = XLSX.readFile(XLSX_PATH, { cellDates: true });

// Aba 1: Alunos sem mediador
const ws1 = workbook.Sheets["RELAÇAO DE ALUNOS SEM MEDIADOR("];
const raw1 = XLSX.utils.sheet_to_json(ws1, { header: 1, defval: null });

// Aba 2: Demanda atendida (com mediador)
const ws2 = workbook.Sheets["DEMANDA ATENDIDA OK"];
const raw2 = XLSX.utils.sheet_to_json(ws2, { header: 1, defval: null });

// ─── extrair dados ──────────────────────────────────────────────────────────

// Aba 1: cabeçalho na linha 3 (índice 2)
// Colunas: ESCOLAS MUNICIPAIS | ALUNO | DATA DE NASCIMENTO | CPF | DIAGNÓSTICO | TURNO | HIPÓTESE | POSSUI ATENDENTE?
const alunosSem = [];
for (let i = 3; i < raw1.length; i++) {
  const row = raw1[i];
  const escola = cleanUpper(row[0]);
  const aluno = clean(row[1]);
  if (!escola || !aluno) continue;
  alunosSem.push({
    escola,
    aluno,
    dataNasc: formatDate(row[2]),
    cpf: normalizeCpf(row[3]),
    diagnostico: normalizeDisability(row[4]),
    turno: normalizeShift(row[5]),
    hipotese: normalizeDisability(row[6]),
  });
}

// Aba 2: cabeçalho na linha 1 (índice 0)
// Colunas: ENCAMINHAMENTO DATA | NOME DO MEDIADOR | ESCOLAS MUNICIPAIS/CIM | ALUNO | (merge) | CPF DO ALUNO | DIAGNÓSTICO | MANHÃ | HIPÓTESE | MEDIADOR | OBSERVAÇÃO
const alunosCom = [];
const mediadoresMap = new Map(); // nome_upper → { escola_upper, ... }

for (let i = 1; i < raw2.length; i++) {
  const row = raw2[i];
  const escola = cleanUpper(row[2]);
  const aluno = clean(row[3]);
  const mediadorNome = clean(row[1]);
  if (!escola || !aluno) continue;

  const turnoRaw = row[7];
  const turno = normalizeShift(turnoRaw);

  alunosCom.push({
    escola,
    aluno,
    mediadorNome: mediadorNome ? mediadorNome.toUpperCase() : null,
    cpf: normalizeCpf(row[5]),
    diagnostico: normalizeDisability(row[6]),
    turno,
    hipotese: normalizeDisability(row[8]),
    dataEncaminhamento: formatDate(row[0]),
  });

  // Registrar mediador
  if (mediadorNome && mediadorNome.trim()) {
    const key = mediadorNome.trim().toUpperCase();
    if (!mediadoresMap.has(key)) {
      mediadoresMap.set(key, { nome: mediadorNome.trim().toUpperCase(), escola });
    }
  }
}

// Escolas únicas
const escolasSet = new Set([
  ...alunosSem.map((a) => a.escola),
  ...alunosCom.map((a) => a.escola),
]);
const escolasArr = Array.from(escolasSet).sort();

console.log(`📊 Dados extraídos:`);
console.log(`   Escolas únicas: ${escolasArr.length}`);
console.log(`   Mediadores únicos: ${mediadoresMap.size}`);
console.log(`   Alunos SEM mediador: ${alunosSem.length}`);
console.log(`   Alunos COM mediador: ${alunosCom.length}`);

// ─── conexão com banco ──────────────────────────────────────────────────────

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL não encontrada no ambiente");
  process.exit(1);
}

// Parse DATABASE_URL usando URL API
const u = new URL(dbUrl);
const host = u.hostname;
const port = parseInt(u.port) || 4000;
const user = decodeURIComponent(u.username);
const password = decodeURIComponent(u.password);
const database = u.pathname.replace(/^\//, "");
const dbParams = { host, port, user, password, database, ssl: { rejectUnauthorized: false } };

console.log(`\n🔌 Conectando ao banco ${host}:${port}/${database}...`);
const conn = await createConnection(dbParams);
console.log("✅ Conectado!\n");

// ─── inserir escolas ────────────────────────────────────────────────────────

console.log("🏫 Inserindo escolas...");
const escolaIdMap = new Map(); // nome_upper → id

// Buscar escolas já existentes
const [existingSchools] = await conn.execute("SELECT id, name FROM schools");
for (const s of existingSchools) {
  escolaIdMap.set(s.name.toUpperCase().trim(), s.id);
}

let escolasInseridas = 0;
let escolasExistentes = 0;

for (let i = 0; i < escolasArr.length; i++) {
  const nomeUpper = escolasArr[i];
  if (escolaIdMap.has(nomeUpper)) {
    escolasExistentes++;
    continue;
  }
  const code = generateCode(nomeUpper, i + 1);
  // Verificar se code já existe
  const [codeCheck] = await conn.execute("SELECT id FROM schools WHERE code = ?", [code]);
  const finalCode = codeCheck.length > 0 ? `${code}X${i}` : code;

  const [result] = await conn.execute(
    "INSERT INTO schools (name, code, weeklyStatus, createdAt, updatedAt) VALUES (?, ?, 'pending', NOW(), NOW())",
    [nomeUpper, finalCode]
  );
  escolaIdMap.set(nomeUpper, result.insertId);
  escolasInseridas++;
}

console.log(`   ✅ ${escolasInseridas} escolas inseridas, ${escolasExistentes} já existiam`);

// ─── inserir mediadores ─────────────────────────────────────────────────────

console.log("\n👤 Inserindo mediadores...");
const mediadorIdMap = new Map(); // nome_upper → id

// Buscar mediadores já existentes
const [existingMediators] = await conn.execute("SELECT id, name FROM mediators");
for (const m of existingMediators) {
  mediadorIdMap.set(m.name.toUpperCase().trim(), m.id);
}

let mediadoresInseridos = 0;
let mediadoresExistentes = 0;

for (const [nomeUpper, info] of mediadoresMap.entries()) {
  if (mediadorIdMap.has(nomeUpper)) {
    mediadoresExistentes++;
    continue;
  }
  const schoolId = escolaIdMap.get(info.escola) || null;
  if (!schoolId) {
    console.warn(`   ⚠️  Escola não encontrada para mediador: ${nomeUpper} (escola: ${info.escola})`);
    continue;
  }
  const [result] = await conn.execute(
    `INSERT INTO mediators (name, schoolId, status, isShared, createdAt, updatedAt)
     VALUES (?, ?, 'active', false, NOW(), NOW())`,
    [nomeUpper, schoolId]
  );
  mediadorIdMap.set(nomeUpper, result.insertId);
  mediadoresInseridos++;
}

console.log(`   ✅ ${mediadoresInseridos} mediadores inseridos, ${mediadoresExistentes} já existiam`);

// ─── inserir demands (alunos sem mediador) ──────────────────────────────────

console.log("\n📋 Inserindo alunos SEM mediador...");

// Buscar demands já existentes para evitar duplicatas
const [existingDemands] = await conn.execute(
  "SELECT studentName, schoolName FROM demands"
);
const existingDemandKeys = new Set(
  existingDemands.map((d) => `${d.studentName.toUpperCase().trim()}|${d.schoolName.toUpperCase().trim()}`)
);

let semInseridos = 0;
let semExistentes = 0;
let semErros = 0;

for (const a of alunosSem) {
  const key = `${a.aluno.toUpperCase().trim()}|${a.escola}`;
  if (existingDemandKeys.has(key)) {
    semExistentes++;
    continue;
  }

  const schoolId = escolaIdMap.get(a.escola) || null;
  const disabilities = a.diagnostico ? JSON.stringify([a.diagnostico]) : JSON.stringify([]);

  try {
    await conn.execute(
      `INSERT INTO demands
        (schoolName, studentName, dateOfBirth, cpf, shift, disabilities,
         attendanceStatus, attendantStatus, hasAttendant, isShared,
         needsAttendant, schoolId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'without_attendant', 'inactive', false, false, 'yes', ?, NOW(), NOW())`,
      [
        a.escola,
        a.aluno,
        a.dataNasc,
        a.cpf,
        a.turno,
        disabilities,
        schoolId,
      ]
    );
    existingDemandKeys.add(key);
    semInseridos++;
  } catch (err) {
    semErros++;
    if (semErros <= 3) console.warn(`   ⚠️  Erro ao inserir aluno sem mediador: ${a.aluno} — ${err.message}`);
  }
}

console.log(`   ✅ ${semInseridos} inseridos, ${semExistentes} já existiam, ${semErros} erros`);

// ─── inserir demands (alunos com mediador) ──────────────────────────────────

console.log("\n📋 Inserindo alunos COM mediador...");

let comInseridos = 0;
let comExistentes = 0;
let comErros = 0;

for (const a of alunosCom) {
  const key = `${a.aluno.toUpperCase().trim()}|${a.escola}`;
  if (existingDemandKeys.has(key)) {
    comExistentes++;
    continue;
  }

  const schoolId = escolaIdMap.get(a.escola) || null;
  const disabilities = a.diagnostico ? JSON.stringify([a.diagnostico]) : JSON.stringify([]);
  const attendantName = a.mediadorNome || null;

  try {
    await conn.execute(
      `INSERT INTO demands
        (schoolName, studentName, cpf, shift, disabilities,
         attendanceStatus, attendantStatus, hasAttendant, attendantName, isShared,
         needsAttendant, schoolId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'with_attendant', 'active', true, ?, false, 'yes', ?, NOW(), NOW())`,
      [
        a.escola,
        a.aluno,
        a.cpf,
        a.turno,
        disabilities,
        attendantName,
        schoolId,
      ]
    );
    existingDemandKeys.add(key);
    comInseridos++;
  } catch (err) {
    comErros++;
    if (comErros <= 3) console.warn(`   ⚠️  Erro ao inserir aluno com mediador: ${a.aluno} — ${err.message}`);
  }
}

console.log(`   ✅ ${comInseridos} inseridos, ${comExistentes} já existiam, ${comErros} erros`);

// ─── vincular mediadores a alunos (mediator_students) ──────────────────────

console.log("\n🔗 Criando vínculos mediador↔aluno...");

// Buscar demands recém inseridos com mediador
const [demandsComMediador] = await conn.execute(
  "SELECT id, studentName, schoolName, attendantName FROM demands WHERE hasAttendant = true AND attendantName IS NOT NULL"
);

let vinculosInseridos = 0;
let vinculosErros = 0;

// Buscar students existentes para vincular
// Como os alunos estão em demands (não em students), criamos o vínculo via demands
// Não criamos mediator_students aqui pois não temos students.id correspondente
// O vínculo real é feito via demands.attendantName

console.log(`   ℹ️  ${demandsComMediador.length} demands com mediador registrados`);
console.log(`   ℹ️  Vínculo via demands.attendantName já estabelecido`);

// ─── resumo final ───────────────────────────────────────────────────────────

await conn.end();

console.log("\n" + "=".repeat(60));
console.log("✅ SEED CONCLUÍDO COM SUCESSO!");
console.log("=".repeat(60));
console.log(`🏫 Escolas:    ${escolasInseridas} novas + ${escolasExistentes} existentes`);
console.log(`👤 Mediadores: ${mediadoresInseridos} novos + ${mediadoresExistentes} existentes`);
console.log(`📋 Alunos s/ mediador: ${semInseridos} inseridos`);
console.log(`📋 Alunos c/ mediador: ${comInseridos} inseridos`);
console.log(`📊 Total demands: ${semInseridos + comInseridos}`);
