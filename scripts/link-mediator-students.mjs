/**
 * Script: link-mediator-students.mjs
 * Objetivo: Cruzar attendantName dos demands com mediators e popular mediator_students
 * Lógica:
 *  1. Para cada demand com hasAttendant=true e attendantName preenchido
 *  2. Buscar mediador pelo nome (case-insensitive, trim) na mesma escola
 *  3. Se encontrar, inserir em mediator_students (mediatorId, demandId)
 *  4. Evitar duplicatas com INSERT IGNORE
 */

import mysql from 'mysql2/promise';

const url = new URL(process.env.DATABASE_URL);
const conn = await mysql.createConnection({
  host: url.hostname,
  port: url.port || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
});

console.log('=== Vinculando Mediadores ↔ Alunos ===\n');

// 1. Buscar todos os demands com atendente
const [demands] = await conn.execute(
  `SELECT id, studentName, attendantName, schoolId, schoolName 
   FROM demands 
   WHERE hasAttendant = 1 AND attendantName IS NOT NULL AND attendantName != ''
   ORDER BY schoolId, attendantName`
);
console.log(`Demands com atendente: ${demands.length}`);

// 2. Buscar todos os mediadores
const [mediators] = await conn.execute(
  `SELECT id, name, schoolId FROM mediators ORDER BY schoolId, name`
);
console.log(`Mediadores cadastrados: ${mediators.length}`);

// 3. Verificar se mediator_students já tem dados
const [[existing]] = await conn.execute('SELECT COUNT(*) c FROM mediator_students');
console.log(`Vínculos existentes em mediator_students: ${existing.c}`);

if (existing.c > 0) {
  console.log('\nLimpando vínculos existentes para recriar...');
  await conn.execute('DELETE FROM mediator_students');
}

// 4. Criar mapa de mediadores por escola: schoolId -> Map(nomeNormalizado -> mediatorId)
const mediatorsBySchool = new Map();
for (const m of mediators) {
  if (!mediatorsBySchool.has(m.schoolId)) {
    mediatorsBySchool.set(m.schoolId, new Map());
  }
  const normalized = m.name.trim().toUpperCase().replace(/\s+/g, ' ');
  mediatorsBySchool.get(m.schoolId).set(normalized, m.id);
}

// 5. Cruzar e inserir vínculos
let linked = 0;
let notFound = 0;
const notFoundList = [];

for (const demand of demands) {
  const schoolMap = mediatorsBySchool.get(demand.schoolId);
  if (!schoolMap) {
    notFound++;
    notFoundList.push({ demand: demand.studentName, attendant: demand.attendantName, school: demand.schoolName, reason: 'escola sem mediadores' });
    continue;
  }

  const attendantNorm = demand.attendantName.trim().toUpperCase().replace(/\s+/g, ' ');
  
  // Busca exata primeiro
  let mediatorId = schoolMap.get(attendantNorm);
  
  // Se não encontrou, busca parcial (nome contém ou é contido)
  if (!mediatorId) {
    for (const [mName, mId] of schoolMap.entries()) {
      if (mName.includes(attendantNorm) || attendantNorm.includes(mName)) {
        mediatorId = mId;
        break;
      }
    }
  }

  // Se ainda não encontrou, busca em todas as escolas (mediador pode estar em escola diferente)
  if (!mediatorId) {
    for (const [, schoolMapOther] of mediatorsBySchool.entries()) {
      const exactMatch = schoolMapOther.get(attendantNorm);
      if (exactMatch) {
        mediatorId = exactMatch;
        break;
      }
    }
  }

  if (mediatorId) {
    try {
      await conn.execute(
        'INSERT IGNORE INTO mediator_students (mediatorId, demandId, createdAt) VALUES (?, ?, NOW())',
        [mediatorId, demand.id]
      );
      linked++;
    } catch (err) {
      // Ignorar duplicatas
    }
  } else {
    notFound++;
    notFoundList.push({ demand: demand.studentName, attendant: demand.attendantName, school: demand.schoolName, reason: 'mediador não encontrado' });
  }
}

console.log(`\n✅ Vínculos criados: ${linked}`);
console.log(`⚠️  Não encontrados: ${notFound}`);

if (notFoundList.length > 0 && notFoundList.length <= 20) {
  console.log('\nRegistros não vinculados:');
  notFoundList.forEach(r => console.log(`  - ${r.demand} → "${r.attendant}" (${r.school}): ${r.reason}`));
} else if (notFoundList.length > 20) {
  console.log(`\nPrimeiros 20 não vinculados:`);
  notFoundList.slice(0, 20).forEach(r => console.log(`  - ${r.demand} → "${r.attendant}" (${r.school}): ${r.reason}`));
}

// 6. Verificar resultado final
const [[finalCount]] = await conn.execute('SELECT COUNT(*) c FROM mediator_students');
const [[distinctMediators]] = await conn.execute('SELECT COUNT(DISTINCT mediatorId) c FROM mediator_students');
const [[distinctStudents]] = await conn.execute('SELECT COUNT(DISTINCT demandId) c FROM mediator_students');

console.log(`\n=== Resultado Final ===`);
console.log(`Total de vínculos: ${finalCount.c}`);
console.log(`Mediadores com alunos vinculados: ${distinctMediators.c}`);
console.log(`Alunos vinculados a mediadores: ${distinctStudents.c}`);

await conn.end();
process.exit(0);
