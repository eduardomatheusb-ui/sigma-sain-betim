/**
 * Script de migração: importa dados do sistema quadrodemediadores (Netlify)
 * para o banco de dados do SIGMA.
 * 
 * Uso: node scripts/migrate-from-netlify.mjs
 */

import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL não encontrada.');
  process.exit(1);
}

// Dados extraídos do sistema antigo
const rawData = JSON.parse(readFileSync(join(__dirname, '..', 'migration-data.json'), 'utf-8'));

function parseTurmaTurno(raw) {
  if (!raw) return { grade: null, shift: null };
  const parts = raw.split('/').map(p => p.trim());
  const grade = parts[0] || null;
  const shiftRaw = (parts[1] || '').toLowerCase();
  let shift = 'full';
  if (shiftRaw.includes('manhã') || shiftRaw.includes('manha')) shift = 'morning';
  else if (shiftRaw.includes('tarde')) shift = 'afternoon';
  else if (shiftRaw.includes('noite')) shift = 'evening';
  else if (shiftRaw.includes('integral')) shift = 'full';
  return { grade, shift };
}

function parseAtendimento(raw) {
  if (!raw) return { status: 'inactive', isShared: false, inactivityReason: null };
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  
  let status = 'active';
  let inactivityReason = null;
  
  const statusLine = lines.find(l => /inativo/i.test(l));
  if (statusLine) {
    status = 'inactive';
    const match = statusLine.match(/inativo:\s*(.+)/i);
    if (match) inactivityReason = match[1].trim();
  }

  const isShared = lines.some(l => /compartilhado/i.test(l));
  return { status, isShared, inactivityReason };
}

function parseAtendente(raw) {
  if (!raw) return { name: null };
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  // Primeiro linha é o nome do atendente principal
  const name = lines[0] || null;
  return { name };
}

async function migrate() {
  console.log('🚀 Iniciando migração do sistema quadrodemediadores...\n');
  
  const conn = await mysql.createConnection(DATABASE_URL);
  
  let schoolsCreated = 0;
  let studentsCreated = 0;
  let mediatorsCreated = 0;
  let skipped = 0;

  for (const record of rawData) {
    try {
      const schoolName = record.unidade?.trim();
      if (!schoolName || schoolName.length < 3) {
        console.log(`⚠️  Pulando - escola inválida: "${schoolName}"`);
        skipped++;
        continue;
      }

      // 1. Garantir que a escola existe
      const [schoolRows] = await conn.execute(
        'SELECT id FROM schools WHERE name = ? LIMIT 1',
        [schoolName]
      );
      
      let schoolId;
      if (schoolRows.length === 0) {
        const [result] = await conn.execute(
          'INSERT INTO schools (name, code, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())',
          [schoolName, schoolName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 50) + '-' + Date.now()]
        );
        schoolId = result.insertId;
        schoolsCreated++;
        console.log(`🏫 Escola criada: ${schoolName} (ID: ${schoolId})`);
      } else {
        schoolId = schoolRows[0].id;
        console.log(`🏫 Escola existente: ${schoolName} (ID: ${schoolId})`);
      }

      // 2. Criar o aluno
      const studentName = record.aluno?.trim();
      if (!studentName || studentName.length < 2) {
        console.log(`⚠️  Pulando - aluno inválido: "${studentName}"`);
        skipped++;
        continue;
      }

      const { grade, shift } = parseTurmaTurno(record.turma_turno);

      const [existingStudents] = await conn.execute(
        'SELECT id FROM students WHERE name = ? AND schoolId = ? LIMIT 1',
        [studentName, schoolId]
      );

      let studentId;
      if (existingStudents.length > 0) {
        studentId = existingStudents[0].id;
        console.log(`ℹ️  Aluno já existe: ${studentName} (ID: ${studentId})`);
      } else {
        const [result] = await conn.execute(
          `INSERT INTO students (name, schoolId, grade, shift, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, 'active', NOW(), NOW())`,
          [studentName, schoolId, grade, shift]
        );
        studentId = result.insertId;
        studentsCreated++;
        console.log(`👤 Aluno criado: ${studentName} (ID: ${studentId})`);
      }

      // 3. Criar o mediador se houver
      const { name: mediatorName } = parseAtendente(record.atendente);
      const { status: mediatorStatus, isShared, inactivityReason } = parseAtendimento(record.atendimento);

      if (mediatorName && mediatorName.length >= 2) {
        const [existingMediators] = await conn.execute(
          'SELECT id FROM mediators WHERE name = ? AND schoolId = ? LIMIT 1',
          [mediatorName, schoolId]
        );

        if (existingMediators.length === 0) {
          const [result] = await conn.execute(
            `INSERT INTO mediators (name, schoolId, status, isShared, inactivityReason, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [mediatorName, schoolId, mediatorStatus, isShared ? 1 : 0, inactivityReason]
          );
          mediatorsCreated++;
          console.log(`🧑‍🏫 Mediador criado: ${mediatorName} (ID: ${result.insertId})`);
        } else {
          console.log(`ℹ️  Mediador já existe: ${mediatorName}`);
        }
      }

    } catch (err) {
      console.error(`❌ Erro ao processar "${record.aluno}":`, err.message);
      skipped++;
    }
  }

  await conn.end();

  console.log('\n✅ Migração concluída!');
  console.log(`   🏫 Escolas criadas: ${schoolsCreated}`);
  console.log(`   👤 Alunos criados: ${studentsCreated}`);
  console.log(`   🧑‍🏫 Mediadores criados: ${mediatorsCreated}`);
  console.log(`   ⚠️  Registros pulados: ${skipped}`);
}

migrate().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
