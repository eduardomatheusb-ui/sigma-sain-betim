/**
 * Normalização completa dos nomes de escolas:
 * 1. Atualiza o campo `name` de cada escola para o nome oficial padronizado
 * 2. Atualiza o campo `schoolName` em demands para refletir o nome padronizado
 * 3. Atualiza o campo `code` para o padrão slug correto
 * 4. Trata escolas sem par real (BELIZARIO FERREIRA, BENTO MACHADO RIBEIRO)
 */

import { createConnection } from "mysql2/promise";

const u = new URL(process.env.DATABASE_URL);
const conn = await createConnection({
  host: u.hostname, port: parseInt(u.port) || 4000,
  user: decodeURIComponent(u.username), password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//, ""), ssl: { rejectUnauthorized: false }
});
console.log("✅ Conectado!\n");

// ─── Mapeamento: id → nome oficial padronizado ────────────────────────────────
// Baseado na lista completa do banco + nomes corretos da PBH/Betim
const nomeOficial = {
  // E M
  3:  "E M Abílio Gomes da Costa",
  4:  "E M Adelina Gonçalves Campos",
  5:  "E M Adelina Mesquita Januzzi",
  6:  "E M Alair Ferreira de Souza",
  7:  "E M Alice Pinheiro Araújo",
  8:  "E M Ana Cândida de Jesus",
  9:  "E M Ângela Ribeiro Batista Maia",
  10: "E M Antônio D'Assis Martins",
  11: "E M Antônio Honório da Silva",
  12: "E M Aristides José da Silva",
  13: "E M Arthur Trindade",
  14: "E M Barão do Rio Branco",
  15: "E M Edir Terezinha de Almeida Fagundes",
  16: "E M Edméia Duarte de Oliveira Braga",
  17: "E M Edvaldo Faleiro de Aguiar",
  18: "E M Fausto Figueiredo de Oliveira",
  19: "E M Florestan Fernandes",
  20: "E M Francisco de Sales Barbosa",
  21: "E M Frei Edgard Groot",
  22: "E M Frei Rogato",
  23: "E M Geferson Ventura de Souza",
  24: "E M Geraldo Jorge Meira",
  25: "E M Gilberto Alves da Silva",
  26: "E M Gino José de Souza",
  27: "E M Isaura Coelho",
  28: "E M Israel José Carlos",
  29: "E M João Batista Machado de Brito",
  30: "E M Jorge Afonso Defensor",
  31: "E M José Miranda Sobrinho",
  32: "E M José Nogueira Duarte",
  33: "E M José Salustiano Lara",
  34: "E M José Vilaça Guimarães",
  35: "E M Josefina Macedo Gontijo",
  36: "E M Lúcia Farage de Freitas Gumiero",
  37: "E M Manoel Saturnino de Carvalho",
  38: "E M Marcílio Melo Rezende",
  39: "E M Margarida Soares Guimarães",
  40: "E M Maria Aracélia Alves",
  41: "E M Maria Cristina",
  42: "E M Maria da Conceição Brito",
  43: "E M Maria da Penha dos Santos Almeida",
  44: "E M Maria de Lourdes Oliveira",
  45: "E M Maria Elena da Cunha Braz",
  46: "E M Maria José Campos",
  47: "E M Maria Mourici Granieri",
  48: "E M Mário Marcos Cordeiro Tupynambá",
  49: "E M Olímpia Maria da Glória",
  50: "E M Osório Aleixo da Silva",
  51: "E M Paulo Monteiro Lara",
  52: "E M Prefeito Alcides Braz",
  53: "E M Presidente Raul Soares",
  54: "E M Professor Kássio Vinícius Castro Gomes",
  55: "E M Raul Saraiva Ribeiro",
  56: "E M Rita Maria Silva - Tia Ritinha",
  57: "E M Sebastiana Diniz Matos Cardoso",
  58: "E M Sebastião Ferreira de Oliveira",
  59: "E M Silvio Lobo",
  60: "E M Tito Flávius Lima Andrade",
  61: "E M Valério Ferreira Palhares",
  62: "E M Vereador Rafael Barbizan",
  63: "E M Waldemar D'Luz Gonçalves",
  // Escolas criadas no seed
  30088: "E M Clóvis Salgado",
  30089: "E M Antônio Tereza",
  30090: "E M do Bairro São Cristóvão",
  30091: "E M Coabitada Cândido Portinari",
  // Escolas sem par (manter mas padronizar)
  30013: "E M Belizário Ferreira",
  30014: "E M Bento Machado Ribeiro",
  // CIM
  64: "CIM Alessandro Ferreira de Souza",
  65: "CIM Antônio Bernardes (Icaivera)",
  66: "CIM Bem-Me-Quer",
  67: "CIM Cantinho do Beija-Flor",
  68: "CIM Castorina Moreira de Jesus - Dona Nina",
  69: "CIM Conceição Guilhermina da Silva",
  70: "CIM Criança Esperança",
  71: "CIM Dom Bosco",
  72: "CIM Dona Marta de Jesus",
  73: "CIM Emanuel Marcelino Maia Silva",
  74: "CIM Emílio Mafia Gomes",
  75: "CIM Enis de Souza Soares",
  76: "CIM Geraldo Jorge Meira",
  77: "CIM José Alves Pinto",
  78: "CIM Maria Engrácia de Souza",
  79: "CIM Paulo Monteiro Lara",
  80: "CIM Pequeno Príncipe",
  81: "CIM Rafaela Santana Assis",
  82: "CIM Recanto Alvorada",
  83: "CIM Recanto da Criança",
  84: "CIM Santo Paschoalin",
  85: "CIM São Luiz",
  86: "CIM Sementes do Amanhã",
  87: "CIM Silvana Rodrigues Silva Pedrosa",
  88: "CIM Sônia Maria Ferreira",
  89: "CIM Tia Dulce",
  90: "CIM Wilma da Costa Pinto Afonso",
  // Outros
  91: "CETAP - Centro Educacional Técnico e de Artes Profissionais",
};

// ─── 1. Atualizar nomes das escolas ──────────────────────────────────────────

console.log("🏫 Normalizando nomes das escolas...");
let updated = 0;
for (const [id, nome] of Object.entries(nomeOficial)) {
  const [result] = await conn.execute(
    "UPDATE schools SET name = ?, updatedAt = NOW() WHERE id = ? AND name != ?",
    [nome, parseInt(id), nome]
  );
  if (result.affectedRows > 0) {
    console.log(`   ✅ id ${id}: → "${nome}"`);
    updated++;
  }
}
console.log(`   Total: ${updated} escolas atualizadas\n`);

// ─── 2. Atualizar schoolName nos demands para o nome oficial ─────────────────

console.log("📋 Atualizando schoolName nos demands...");
let demandsUpdated = 0;

// Buscar todos os demands e atualizar schoolName para o nome oficial da escola vinculada
const [demands] = await conn.execute(`
  SELECT d.id, d.schoolId, d.schoolName, s.name as officialName
  FROM demands d
  JOIN schools s ON d.schoolId = s.id
  WHERE d.schoolName != s.name
`);

console.log(`   ${demands.length} demands com schoolName diferente do nome oficial`);

// Atualizar em lote
if (demands.length > 0) {
  const [result] = await conn.execute(`
    UPDATE demands d
    JOIN schools s ON d.schoolId = s.id
    SET d.schoolName = s.name, d.updatedAt = NOW()
    WHERE d.schoolName != s.name
  `);
  demandsUpdated = result.affectedRows;
  console.log(`   ✅ ${demandsUpdated} demands atualizados`);
}

// ─── 3. Atualizar schoolName nos mediators ────────────────────────────────────

console.log("\n👤 Atualizando schoolName nos mediators (se existir campo)...");
// Verificar se mediators tem campo schoolName
const [cols] = await conn.execute("SHOW COLUMNS FROM mediators LIKE 'schoolName'");
if (cols.length > 0) {
  const [result] = await conn.execute(`
    UPDATE mediators m
    JOIN schools s ON m.schoolId = s.id
    SET m.schoolName = s.name, m.updatedAt = NOW()
    WHERE m.schoolName != s.name OR m.schoolName IS NULL
  `);
  console.log(`   ✅ ${result.affectedRows} mediators atualizados`);
} else {
  console.log("   ℹ️  Mediators não tem campo schoolName — OK");
}

// ─── 4. Verificação final ─────────────────────────────────────────────────────

const [[sc]] = await conn.execute("SELECT COUNT(*) as n FROM schools");
const [[dm]] = await conn.execute("SELECT COUNT(*) as n FROM demands");
const [[me]] = await conn.execute("SELECT COUNT(*) as n FROM mediators");

// Verificar se ainda há demands com schoolName diferente do nome oficial
const [[mismatch]] = await conn.execute(`
  SELECT COUNT(*) as n FROM demands d
  JOIN schools s ON d.schoolId = s.id
  WHERE d.schoolName != s.name
`);

console.log("\n" + "=".repeat(60));
console.log("✅ NORMALIZAÇÃO CONCLUÍDA!");
console.log("=".repeat(60));
console.log(`🏫 Escolas: ${sc.n}`);
console.log(`📋 Demands: ${dm.n}`);
console.log(`👤 Mediadores: ${me.n}`);
console.log(`Demands com schoolName divergente: ${mismatch.n}`);

// Listar escolas finais
const [escolas] = await conn.execute("SELECT id, name FROM schools ORDER BY name");
console.log("\n📋 Lista final de escolas:");
escolas.forEach(e => console.log(`   [${e.id}] ${e.name}`));

await conn.end();
