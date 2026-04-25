import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [totals] = await conn.execute(`
  SELECT 
    COUNT(*) as total,
    COUNT(school_id) as com_escola,
    SUM(CASE WHEN school_id IS NULL THEN 1 ELSE 0 END) as sem_escola,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as ativos
  FROM mediators
`);
console.log('Mediadores:', JSON.stringify(totals[0]));

const [sample] = await conn.execute(`SELECT id, name, school_id, status FROM mediators LIMIT 5`);
console.log('Amostra:', JSON.stringify(sample));

// Verificar se há escola com mediadores
const [bySchool] = await conn.execute(`
  SELECT school_id, COUNT(*) as qtd FROM mediators 
  WHERE school_id IS NOT NULL 
  GROUP BY school_id 
  LIMIT 5
`);
console.log('Mediadores por escola:', JSON.stringify(bySchool));

// Verificar demands com attendantName
const [demandsSample] = await conn.execute(`
  SELECT school_name, attendant_name, has_attendant FROM demands 
  WHERE has_attendant = 1 LIMIT 5
`);
console.log('Demands com atendente:', JSON.stringify(demandsSample));

await conn.end();
