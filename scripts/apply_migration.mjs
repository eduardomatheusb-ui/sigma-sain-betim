import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL || '';
console.log('DB URL disponível:', !!url);
console.log('DB URL prefix:', url.substring(0, 40) + '...');

// Parsear a URL de conexão
// Formato: mysql://user:pass@host:port/dbname?ssl=...
try {
  const parsed = new URL(url);
  console.log('Host:', parsed.hostname);
  console.log('Port:', parsed.port);
  console.log('Database:', parsed.pathname.slice(1));
  console.log('User:', parsed.username);

  const conn = await mysql.createConnection({
    host: parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  console.log('\n✓ Conexão estabelecida!\n');

  // Verificar se os campos já existem
  const [cols] = await conn.execute("SHOW COLUMNS FROM `schools`");
  const colNames = cols.map(c => c.Field);
  console.log('Colunas atuais em schools:', colNames.join(', '));

  const migrations = [];

  if (!colNames.includes('isActive')) {
    migrations.push("ALTER TABLE `schools` ADD `isActive` boolean DEFAULT true NOT NULL");
  } else {
    console.log('⚠ Campo isActive já existe');
  }

  if (!colNames.includes('type')) {
    migrations.push("ALTER TABLE `schools` ADD `type` varchar(50) DEFAULT 'EM'");
  } else {
    console.log('⚠ Campo type já existe');
  }

  // Verificar tabelas de histórico
  const [tables] = await conn.execute("SHOW TABLES");
  const tableNames = tables.map(t => Object.values(t)[0]);
  console.log('\nTabelas existentes:', tableNames.join(', '));

  if (!tableNames.includes('student_edit_history')) {
    migrations.push(`CREATE TABLE \`student_edit_history\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`studentId\` int NOT NULL,
      \`editedBy\` int NOT NULL,
      \`editedByName\` varchar(255),
      \`fieldChanged\` varchar(100) NOT NULL,
      \`oldValue\` text,
      \`newValue\` text,
      \`reason\` text,
      \`editedAt\` timestamp NOT NULL DEFAULT (now()),
      CONSTRAINT \`student_edit_history_id\` PRIMARY KEY(\`id\`)
    )`);
  } else {
    console.log('⚠ Tabela student_edit_history já existe');
  }

  if (!tableNames.includes('mediator_status_change_history')) {
    migrations.push(`CREATE TABLE \`mediator_status_change_history\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`mediatorId\` int NOT NULL,
      \`previousStatus\` varchar(50) NOT NULL,
      \`newStatus\` varchar(50) NOT NULL,
      \`reason\` text,
      \`inactivityReason\` varchar(255),
      \`returnDate\` date,
      \`changedBy\` int NOT NULL,
      \`changedByName\` varchar(255),
      \`changedAt\` timestamp NOT NULL DEFAULT (now()),
      CONSTRAINT \`mediator_status_change_history_id\` PRIMARY KEY(\`id\`)
    )`);
  } else {
    console.log('⚠ Tabela mediator_status_change_history já existe');
  }

  if (migrations.length === 0) {
    console.log('\n✓ Todas as migrations já foram aplicadas!');
  } else {
    console.log(`\nAplicando ${migrations.length} migration(s)...`);
    for (const sql of migrations) {
      try {
        await conn.execute(sql);
        console.log('✓ Aplicado:', sql.substring(0, 60) + '...');
      } catch (err) {
        console.error('✗ Erro:', err.message);
      }
    }
  }

  await conn.end();
  console.log('\n✓ Concluído!');
} catch (err) {
  console.error('Erro:', err.message);
  process.exit(1);
}
