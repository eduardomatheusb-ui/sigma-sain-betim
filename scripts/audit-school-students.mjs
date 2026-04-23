import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// 1. Alunos sem schoolId
const [[noSchool]] = await conn.execute('SELECT COUNT(*) as total FROM demands WHERE schoolId IS NULL OR schoolId = 0');
console.log('Alunos sem schoolId:', noSchool.total);

// 2. Distribuição por escola (top 15)
const [dist] = await conn.execute('SELECT schoolId, COUNT(*) as total FROM demands GROUP BY schoolId ORDER BY total DESC LIMIT 15');
console.log('\nDistribuição de alunos por schoolId (top 15):');
dist.forEach(r => console.log(`  schoolId=${r.schoolId}: ${r.total} alunos`));

// 3. Alunos com hasAttendant=true mas sem schoolId
const [[withAttNoSchool]] = await conn.execute('SELECT COUNT(*) as total FROM demands WHERE hasAttendant = 1 AND (schoolId IS NULL OR schoolId = 0)');
console.log('\nAlunos com atendente mas sem schoolId:', withAttNoSchool.total);

// 4. Verificar se os schoolIds dos alunos existem na tabela schools
const [[orphanStudents]] = await conn.execute(`
  SELECT COUNT(*) as total FROM demands d
  LEFT JOIN schools s ON d.schoolId = s.id
  WHERE d.schoolId IS NOT NULL AND d.schoolId != 0 AND s.id IS NULL
`);
console.log('\nAlunos com schoolId que não existe em schools:', orphanStudents.total);

// 5. Verificar usuários escola e seus schoolIds
const [schoolUsers] = await conn.execute('SELECT id, name, schoolId, role FROM users WHERE role = "school" LIMIT 10');
console.log('\nUsuários com perfil escola (primeiros 10):');
schoolUsers.forEach(u => console.log(`  userId=${u.id}, name=${u.name}, schoolId=${u.schoolId}`));

// 6. Verificar se há escolas sem alunos
const [[schoolsWithNoStudents]] = await conn.execute(`
  SELECT COUNT(*) as total FROM schools s
  LEFT JOIN demands d ON s.id = d.schoolId
  WHERE d.id IS NULL AND s.isActive = 1
`);
console.log('\nEscolas ativas sem alunos cadastrados:', schoolsWithNoStudents.total);

// 7. Verificar alunos com hasAttendant=true por escola (top 10)
const [withAtt] = await conn.execute(`
  SELECT d.schoolId, s.name as schoolName, 
    SUM(CASE WHEN d.hasAttendant = 1 THEN 1 ELSE 0 END) as comAtendente,
    SUM(CASE WHEN d.hasAttendant = 0 OR d.hasAttendant IS NULL THEN 1 ELSE 0 END) as semAtendente,
    COUNT(*) as total
  FROM demands d
  LEFT JOIN schools s ON d.schoolId = s.id
  GROUP BY d.schoolId, s.name
  ORDER BY total DESC
  LIMIT 10
`);
console.log('\nAlunos com/sem atendente por escola (top 10):');
withAtt.forEach(r => console.log(`  ${r.schoolName || 'NULL'} (id=${r.schoolId}): total=${r.total}, comAtendente=${r.comAtendente}, semAtendente=${r.semAtendente}`));

await conn.end();
