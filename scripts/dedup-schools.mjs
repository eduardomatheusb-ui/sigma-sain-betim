/**
 * Script de deduplicação de escolas.
 * Para cada escola duplicada (inserida pelo seed com nome abreviado),
 * migra os vínculos para a escola original (nome completo) e remove a duplicata.
 *
 * Mapeamento: id_duplicata → id_original
 */

import { createConnection } from "mysql2/promise";

const u = new URL(process.env.DATABASE_URL);
const conn = await createConnection({
  host: u.hostname, port: parseInt(u.port) || 4000,
  user: decodeURIComponent(u.username), password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//, ""), ssl: { rejectUnauthorized: false }
});

console.log("✅ Conectado!\n");

// ─── mapeamento manual: id_duplicata → id_original ──────────────────────────
// Formato: [id_duplicata, id_original, "nome_duplicata → nome_original"]
// IDs originais: 3-90 (cadastrados antes do seed)
// IDs duplicatas: 30001-30087 (inseridos pelo seed)

const MAPA = [
  // Escolas Municipais (E M)
  [30001, 3,  "ABILIO GOMES DA COSTA → E M Abílio Gomes da Costa"],
  [30002, 4,  "ADELINA GONÇALVES → E M Adelina Gonçalves Campos"],
  [30003, 5,  "ADELINA MESQUITA JANUZZI → E M Adelina Mesquita Januzzi"],
  [30004, 6,  "ALAIR FERREIRA → E M Alair Ferreira de Souza"],
  [30005, 7,  "ALICE PINHEIRO → E M Alice Pinheiro Araújo"],
  [30006, 8,  "ANA CÂNDIDA → E M Ana Cândida de Jesus"],
  [30087, 9,  "ÂNGELA MAIA → E M Ângela Ribeiro Batista Maia"],
  // ANTÔNIO D'ASSIS: duas variações (30007 e 30008) → id 10
  [30007, 10, "ANTÔNIO D' ASSIS → E M Antônio D'Assis Martins"],
  [30008, 10, "ANTÔNIO D'ASSIS → E M Antônio D'Assis Martins"],
  [30009, 11, "ANTÔNIO HONORIO → E M Antônio Honório da Silva"],
  // ANTÔNIO TEREZA: não tem correspondente exato, manter como está (escola parceira?)
  // [30010, ?, "ANTÔNIO TEREZA"],
  [30011, 12, "ARISTIDES JOSÉ DA SILVA → E M Aristides José da Silva"],
  [30012, 13, "ARTHUR TRINDADE → E M Arthur Trindade"],
  [30013, null, "BELIZARIO FERREIRA → sem correspondente (manter)"],
  [30014, null, "BENTO MACHADO RIBEIRO → sem correspondente (manter)"],
  // CIM Alessandro Ferreira
  [30017, 64, "CIM ALESSANDRO FERREIRA → CIM Alessandro Ferreira de Souza"],
  [30018, 65, "CIM ANTONIO BERNARDES → CIM Antônio Bernardes (Icaivera)"],
  [30019, 67, "CIM CANTINHO DO BEIJA FLOR → CIM Cantinho do Beija-Flor"],
  [30020, 69, "CIM CONCEIÇÃO GUILHERMININA → CIM Conceição Guilhermina da Silva"],
  [30021, 73, "CIM EMANOEL MARCELINO → CIM Emanuel Marcelino Maia Silva"],
  [30022, 74, "CIM EMILIO MAFIA → CIM Emílio Mafia Gomes"],
  [30023, 75, "CIM ENIS DE SOUZA → CIM Enis de Souza Soares"],
  [30024, 77, "CIM JOSE ALVES PINTO → CIM José Alves Pinto"],
  [30025, 78, "CIM MARIA ENGRACIA → CIM Maria Engrácia de Souza"],
  [30028, 85, "CIM SÃO LUÍZ → CIM São Luiz"],
  [30026, 87, "CIM SILVANA PEDROSA → CIM Silvana Rodrigues Silva Pedrosa"],
  [30027, 88, "CIM SONIA MARIA FERREIRA → CIM Sônia Maria Ferreira"],
  // CETAP
  [30015, 91, "CETAP → Centro Educacional Técnico e de Artes Profissionais"],
  // CIM (genérico) - manter como está se não tiver correspondente
  // [30016, ?, "CIM → ?"],
  // Escolas com nome parcial
  [30033, 60, "E.M. TITO FLAVIUS LIMA ANDRADE → E M Tito Flávius Lima Andrade"],
  [30034, 15, "EDIR TEREZINHA DE ALMEIDA → E M Edir Terezinha de Almeida Fagundes"],
  [30035, 16, "EDMEIA DUARTE DE OLIVEIRA BRAGA → E M Edméia Duarte de Oliveira Braga"],
  [30036, 16, "EDMÉIA DUARTE DE OLIVEIRA BRAGA → E M Edméia Duarte de Oliveira Braga"],
  [30037, 17, "EDVALDO FALEIRO → E M Edvaldo Faleiro de Aguiar"],
  [30038, 18, "FAUSTO FIGUEIREDO → E M Fausto Figueiredo de Oliveira"],
  [30039, 19, "FLORESTAN FERNANDES → E M Florestan Fernandes"],
  [30040, 20, "FRANCISCO DE SALES BARBOSA → E M Francisco de Sales Barbosa"],
  [30041, 21, "FREI EDGARD GROOT → E M Frei Edgard Groot"],
  [30042, 22, "FREI ROGATO → E M Frei Rogato"],
  [30043, 23, "GEFERSON VENTURA → E M Geferson Ventura de Souza"],
  [30044, 24, "GERALDO JORGE MEIRA → E M Geraldo Jorge Meira"],
  [30045, 25, "GILBERTO ALVES DA SILVA → E M Gilberto Alves da Silva"],
  [30046, 26, "GINO JOSÉ → E M Gino José de Souza"],
  [30047, 27, "ISAURA COELHO → E M Isaura Coelho"],
  [30048, 28, "ISRAEL JOSÉ CARLOS → E M Israel José Carlos"],
  [30055, 29, "JOÃO BATISTA MACHADO DE BRITO → E M João Batista Machado de Brito"],
  [30049, 30, "JORGE AFONSO → E M Jorge Afonso Defensor"],
  [30051, 31, "JOSÉ MIRANDA SOBRINHO → E M José Miranda Sobrinho"],
  [30052, 32, "JOSÉ NOGUEIRA → E M José Nogueira Duarte"],
  [30053, 33, "JOSÉ SALUSTIANO LARA → E M José Salustiano Lara"],
  [30054, 34, "JOSÉ VILAÇA GUIMARÃES → E M José Vilaça Guimarães"],
  [30050, 35, "JOSEFINA MACEDO → E M Josefina Macedo Gontijo"],
  [30056, 36, "LÚCIA FARAGE → E M Lúcia Farage de Freitas Gumiero"],
  [30057, 38, "MARCILIO DE MELO REZENDE → E M Marcílio Melo Rezende"],
  [30058, 39, "MARGARIDA SOARES → E M Margarida Soares Guimarães"],
  [30059, 40, "MARIA ARACÉLIA → E M Maria Aracélia Alves"],
  [30060, 41, "MARIA CRISTINA → E M Maria Cristina"],
  [30061, 42, "MARIA DA CONCEIÇÃO BRITO → E M Maria da Conceição Brito"],
  [30062, 43, "MARIA DA PENHA DOS SANTOS ALMEIDA → E M Maria da Penha dos Santos Almeida"],
  [30063, 44, "MARIA DE LOURDES DE OLIVEIRA → E M Maria de Lourdes Oliveira"],
  [30064, 45, "MARIA ELENA → E M Maria Elena da Cunha Braz"],
  [30065, 45, "MARIA ELENA DA CUNHA BRAZ → E M Maria Elena da Cunha Braz"],
  [30066, 46, "MARIA JOSÉ CAMPOS → E M Maria José Campos"],
  [30067, 47, "MARIA MOURICI GRANIERI → E M Maria Mourici Granieri"],
  [30068, 48, "MÁRIO MARCOS → E M Mario Marcos Cordeiro Tupynambá"],
  [30069, 49, "OLÍMPIA MARIA DA GLÓRIA → E M Olímpia Maria da Glória"],
  [30070, 50, "OSORIO ALEIXO → E M Osório Aleixo da Silva"],
  [30071, 51, "PAULO MONTEIRO LARA → E M Paulo Monteiro Lara"],
  [30072, 52, "PREFEITO ALCIDES BRAZ → E M Prefeito Alcides Braz"],
  [30073, 53, "PRESIDENTE RAUL SOARES → E M Presidente Raul Soares"],
  [30074, 54, "PROFESSOR KÁSSIO VINÍCIUS DE CASTRO → E M Professor Kássio Vinícius Castro Gomes"],
  [30075, 55, "RAUL SARAIVA RIBEIRO → E M Raul Saraiva Ribeiro"],
  [30076, 56, "RITA MARIA → E M Rita Maria Silva - Tia Ritinha"],
  [30077, 57, "SEBASTIANA DINIZ CARDOSO → E M Sebastiana Diniz Matos Cardoso"],
  [30078, 57, "SEBASTIANA DINIZ MATTOS CARDOSO → E M Sebastiana Diniz Matos Cardoso"],
  [30079, 58, "SEBASTIAO FERREIRA → E M Sebastião Ferreira de Oliveira"],
  [30080, 59, "SILVIO LOBO → E M Silvio Lobo"],
  [30081, 60, "TITO FLAVIUS → E M Tito Flávius Lima Andrade"],
  [30084, 61, "VALÉRIO PALHARES → E M Valério Ferreira Palhares"],
  [30085, 62, "VEREADOR RAFAEL BARBIZAN → E M Vereador Rafael Barbizan"],
  [30086, 63, "WALDEMAR D' LUZ → E M Waldemar D'Luz Gonçalves"],
  // Entradas sem correspondente real (remover pois são ruído)
  // [30029, null, "CLOVIS SALGADO"],
  // [30030, null, "COABITADA CANDIDO PORTINARI"],
  // [30031, null, "CONFERIR"],
  // [30032, null, "DO BAIRRO SÃO CRISTOVÃO"],
  // [30082, null, "TOTAL"],
  // [30083, null, "TOTAL CIM"],
];

// Filtrar apenas os que têm mapeamento real (id_original não null)
const mapaReal = MAPA.filter(([, orig]) => orig !== null);
// Entradas para deletar sem migrar (ruído puro)
const ruido = [30029, 30030, 30031, 30032, 30082, 30083, 30010, 30016];

console.log(`📋 ${mapaReal.length} pares de deduplicação identificados`);
console.log(`🗑️  ${ruido.length} entradas de ruído para remover\n`);

// ─── migrar vínculos ─────────────────────────────────────────────────────────

let totalMigrations = 0;

for (const [dupId, origId, desc] of mapaReal) {
  // Migrar demands
  const [r1] = await conn.execute(
    "UPDATE demands SET schoolId = ? WHERE schoolId = ?",
    [origId, dupId]
  );
  // Migrar mediators
  const [r2] = await conn.execute(
    "UPDATE mediators SET schoolId = ? WHERE schoolId = ?",
    [origId, dupId]
  );
  // Migrar weekly_snapshots
  await conn.execute(
    "UPDATE weekly_snapshots SET schoolId = ? WHERE schoolId = ?",
    [origId, dupId]
  );
  // Migrar mediator_students (se houver)
  // (não tem schoolId direto, mas mediators já foram migrados)

  const moved = r1.affectedRows + r2.affectedRows;
  if (moved > 0) {
    console.log(`  ✅ ${desc} (${moved} registros migrados)`);
  }
  totalMigrations += moved;
}

console.log(`\n📦 Total de registros migrados: ${totalMigrations}`);

// ─── remover duplicatas ──────────────────────────────────────────────────────

console.log("\n🗑️  Removendo escolas duplicadas...");

// IDs a remover = todos os dupId do mapa + ruído
const idsParaRemover = [
  ...mapaReal.map(([dupId]) => dupId),
  ...ruido,
];

// Remover em lotes
const placeholders = idsParaRemover.map(() => "?").join(",");
const [delResult] = await conn.execute(
  `DELETE FROM schools WHERE id IN (${placeholders})`,
  idsParaRemover
);

console.log(`   ✅ ${delResult.affectedRows} escolas duplicadas removidas`);

// ─── verificar resultado ─────────────────────────────────────────────────────

const [[countResult]] = await conn.execute("SELECT COUNT(*) as n FROM schools");
const [[demandResult]] = await conn.execute("SELECT COUNT(*) as n FROM demands");
const [[mediatorResult]] = await conn.execute("SELECT COUNT(*) as n FROM mediators");

console.log("\n" + "=".repeat(60));
console.log("✅ DEDUPLICAÇÃO CONCLUÍDA!");
console.log("=".repeat(60));
console.log(`🏫 Escolas restantes: ${countResult.n}`);
console.log(`📋 Demands (intactos): ${demandResult.n}`);
console.log(`👤 Mediadores (intactos): ${mediatorResult.n}`);

await conn.end();
