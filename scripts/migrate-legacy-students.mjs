/**
 * migrate-legacy-students.mjs
 *
 * Migra os alunos da tabela legada `demands` para a tabela oficial `students`.
 *
 * Mapeamento de campos:
 *   demands.studentName      → students.name          (obrigatório)
 *   demands.schoolId         → students.schoolId       (obrigatório)
 *   demands.dateOfBirth      → students.dateOfBirth
 *   demands.cpf              → students.cpf
 *   demands.shift            → students.shift
 *   demands.grade            → students.grade
 *   demands.disabilities     → students.disability     (JSON → string)
 *   demands.usesWheelchair   → students.usesWheelchair
 *   demands.usesWalker       → students.usesWalker
 *   demands.usesProsthesis   → students.usesProsthesis
 *   demands.homeCare         → students.homeCare
 *   demands.needsAttendant   → students.needsAttendant
 *   demands.notes            → students.notes
 *   demands.id               → students.enrollmentNumber (como string, prefixo "LEG-")
 *
 * Status padrão: 'active' (alunos ativos no sistema legado)
 *
 * Uso: node scripts/migrate-legacy-students.mjs
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Load env
import { config } from 'dotenv';
config({ path: join(projectRoot, '.env.local') });
config({ path: join(projectRoot, '.env') });

// Dynamic import of mysql2 from project node_modules
const { createPool } = await import(join(projectRoot, 'node_modules/mysql2/promise.js'));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada. Verifique .env.local');
  process.exit(1);
}

console.log('🔌 Conectando ao banco de dados...');
const pool = createPool(DATABASE_URL);

async function migrate() {
  const conn = await pool.getConnection();

  try {
    // 1. Verificar estado atual
    const [currentStudents] = await conn.execute('SELECT COUNT(*) as cnt FROM students');
    const currentCount = currentStudents[0].cnt;
    console.log(`📊 Alunos atualmente em students: ${currentCount}`);

    if (currentCount > 0) {
      console.log('⚠️  Tabela students já possui registros.');
      console.log('   Para re-executar, limpe a tabela primeiro: TRUNCATE TABLE students;');
      console.log('   Abortando para evitar duplicatas.');
      return;
    }

    // 2. Buscar todos os registros legados
    const [legacyRows] = await conn.execute(
      'SELECT * FROM demands ORDER BY id ASC'
    );
    console.log(`📥 Registros legados encontrados: ${legacyRows.length}`);

    // 3. Migrar em lotes de 100
    const BATCH_SIZE = 100;
    let inserted = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < legacyRows.length; i += BATCH_SIZE) {
      const batch = legacyRows.slice(i, i + BATCH_SIZE);
      const values = [];
      const placeholders = [];

      for (const row of batch) {
        // Pular registros sem nome ou sem escola
        if (!row.studentName || !row.studentName.trim()) {
          skipped++;
          continue;
        }

        // Converter disabilities (JSON array) para string
        let disabilityStr = null;
        if (row.disabilities) {
          try {
            const arr = JSON.parse(row.disabilities);
            disabilityStr = Array.isArray(arr) ? arr.join(', ') : String(row.disabilities);
          } catch {
            disabilityStr = String(row.disabilities);
          }
        }

        // Número de matrícula legado (prefixo LEG- + id original)
        const enrollmentNumber = `LEG-${row.id}`;

        placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        values.push(
          row.studentName.trim(),           // name
          row.schoolId || null,              // schoolId
          row.dateOfBirth || null,           // dateOfBirth
          row.cpf || null,                   // cpf
          'active',                          // status (todos ativos na migração)
          enrollmentNumber,                  // enrollmentNumber
          null,                              // guardianName
          null,                              // guardianPhone
          row.notes || null,                 // notes
          disabilityStr,                     // disability
          row.shift || 'morning',            // shift
          row.grade || null,                 // grade
          row.usesWheelchair ? 1 : 0,        // usesWheelchair
          row.usesWalker ? 1 : 0,            // usesWalker
          row.usesProsthesis ? 1 : 0,        // usesProsthesis
          row.homeCare ? 1 : 0,              // homeCare
          row.needsAttendant || 'yes'        // needsAttendant
        );
      }

      if (placeholders.length === 0) continue;

      try {
        const sql = `
          INSERT INTO students 
            (name, schoolId, dateOfBirth, cpf, status, enrollmentNumber, 
             guardianName, guardianPhone, notes, disability, shift, grade,
             usesWheelchair, usesWalker, usesProsthesis, homeCare, needsAttendant)
          VALUES ${placeholders.join(', ')}
        `;
        await conn.execute(sql, values);
        inserted += placeholders.length;

        const progress = Math.round(((i + batch.length) / legacyRows.length) * 100);
        process.stdout.write(`\r   Progresso: ${progress}% (${inserted} inseridos)`);
      } catch (err) {
        errors.push({ batch: i, error: err.message });
        console.error(`\n❌ Erro no lote ${i}-${i + BATCH_SIZE}:`, err.message);
      }
    }

    console.log('\n');

    // 4. Verificar resultado
    const [finalCount] = await conn.execute('SELECT COUNT(*) as cnt FROM students');
    console.log(`✅ Migração concluída!`);
    console.log(`   Inseridos: ${inserted}`);
    console.log(`   Ignorados (sem nome): ${skipped}`);
    console.log(`   Erros: ${errors.length}`);
    console.log(`   Total em students: ${finalCount[0].cnt}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Erros encontrados:');
      errors.forEach(e => console.log(`   Lote ${e.batch}: ${e.error}`));
    }

    // 5. Amostra de verificação
    const [sample] = await conn.execute(
      'SELECT id, name, schoolId, status, enrollmentNumber FROM students LIMIT 5'
    );
    console.log('\n📋 Amostra dos primeiros registros migrados:');
    sample.forEach(r => console.log(`   [${r.id}] ${r.name} | Escola: ${r.schoolId} | Matrícula: ${r.enrollmentNumber}`));

  } finally {
    conn.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('❌ Erro fatal:', err.message);
  process.exit(1);
});
