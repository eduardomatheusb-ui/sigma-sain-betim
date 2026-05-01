import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL not set');

const conn = await mysql.createConnection(dbUrl);

const statements = [
  // 1. Add new columns to externalDemands
  "ALTER TABLE `externalDemands` ADD COLUMN `protocolo` VARCHAR(100) NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `origem` VARCHAR(255) NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `orgaoSetor` VARCHAR(255) NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `tipoDocumento` ENUM('oficio','notificacao','recomendacao','requisicao','encaminhamento','solicitacao','denuncia','outros') NOT NULL DEFAULT 'oficio'",
  "ALTER TABLE `externalDemands` ADD COLUMN `dataRecebimento` DATE NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `prazoResposta` DATE NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `dataEncaminhamento` DATE NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `prioridade` ENUM('baixa','media','alta','urgente') NOT NULL DEFAULT 'media'",
  "ALTER TABLE `externalDemands` ADD COLUMN `responsavelId` INT NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `responsavelNome` VARCHAR(255) NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `studentName` VARCHAR(255) NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `resumo` TEXT NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `descricaoCompleta` TEXT NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `documentosLinks` TEXT NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `respostaElaborada` TEXT NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `situacaoFinal` TEXT NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `createdBy` INT NULL",
  "ALTER TABLE `externalDemands` ADD COLUMN `createdByName` VARCHAR(255) NULL",

  // 2. Modify status enum to include new institutional values
  `ALTER TABLE \`externalDemands\` MODIFY COLUMN \`status\` ENUM('Recebida','Triagem/Protocolo','Em instrução técnica','Devolvida para complementação','Em validação do gabinete','Aguardando assinatura','Assinada','Encaminhada à SEMED','Arquivada','pending','in_progress','resolved','closed') NOT NULL DEFAULT 'Recebida'`,

  // 3. Make schoolId optional
  "ALTER TABLE `externalDemands` MODIFY COLUMN `schoolId` INT NULL",

  // 4. Create movements table
  `CREATE TABLE IF NOT EXISTS \`externalDemandMovements\` (
    \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`demandId\` INT NOT NULL,
    \`statusAnterior\` VARCHAR(100) NULL,
    \`statusNovo\` VARCHAR(100) NOT NULL,
    \`observacao\` TEXT NULL,
    \`userId\` INT NOT NULL,
    \`userName\` VARCHAR(255) NOT NULL,
    \`userRole\` VARCHAR(50) NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  // 5. Create audit table
  `CREATE TABLE IF NOT EXISTS \`externalDemandAudit\` (
    \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`demandId\` INT NOT NULL,
    \`acao\` ENUM('criacao','edicao','mudanca_status','exclusao') NOT NULL,
    \`campoAlterado\` VARCHAR(100) NULL,
    \`valorAnterior\` TEXT NULL,
    \`valorNovo\` TEXT NULL,
    \`userId\` INT NOT NULL,
    \`userName\` VARCHAR(255) NOT NULL,
    \`userRole\` VARCHAR(50) NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

let ok = 0;
let skipped = 0;
let failed = 0;

for (const stmt of statements) {
  try {
    await conn.execute(stmt);
    console.log('OK:', stmt.slice(0, 70).replace(/\n/g, ' ').replace(/\s+/g, ' '));
    ok++;
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME' || (err.message && err.message.includes('Duplicate column'))) {
      console.log('SKIP (already exists):', stmt.slice(0, 50).replace(/\n/g, ' '));
      skipped++;
    } else {
      console.error('FAIL:', err.message, '\n  SQL:', stmt.slice(0, 80).replace(/\n/g, ' '));
      failed++;
    }
  }
}

await conn.end();
console.log(`\nResult: ${ok} OK, ${skipped} skipped, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
