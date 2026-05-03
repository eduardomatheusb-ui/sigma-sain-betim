import { getDb } from '../server/db.ts';
import { students } from '../drizzle/schema.ts';
import { like, eq, and } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  if (!db) { console.log('DB not available'); process.exit(1); }

  // Test 1: Total count
  const total = await db.execute('SELECT COUNT(*) as cnt FROM students');
  console.log('Total alunos em students:', (total[0] as any[])[0].cnt);

  // Test 2: Search "Bryan" in school 3
  const result = await db
    .select({ id: students.id, name: students.name, schoolId: students.schoolId, status: students.status })
    .from(students)
    .where(and(
      like(students.name, '%Bryan%'),
      eq(students.schoolId, 3),
      eq(students.status, 'active')
    ))
    .limit(5);
  console.log('\nBusca "Bryan" escola 3:', JSON.stringify(result));

  // Test 3: Count per school (top 5)
  const bySchool = await db.execute(
    'SELECT schoolId, COUNT(*) as cnt FROM students WHERE status = "active" GROUP BY schoolId ORDER BY cnt DESC LIMIT 5'
  );
  console.log('\nTop 5 escolas por alunos:', JSON.stringify((bySchool[0] as any[])));

  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
