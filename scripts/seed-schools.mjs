/**
 * Script para cadastrar as 89 escolas reais de Betim no banco do SIGMA.
 * Uso: node scripts/seed-schools.mjs
 */
import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env') });

const schools = [
  // Escolas Municipais (EM)
  { name: 'E M Abílio Gomes da Costa', code: 'e-m-abilio-gomes-da-costa' },
  { name: 'E M Adelina Gonçalves Campos', code: 'e-m-adelina-goncalves-campos' },
  { name: 'E M Adelina Mesquita Januzzi', code: 'e-m-adelina-mesquita-januzzi' },
  { name: 'E M Alair Ferreira de Souza', code: 'e-m-alair-ferreira-de-souza' },
  { name: 'E M Alice Pinheiro Araújo', code: 'e-m-alice-pinheiro-araujo' },
  { name: 'E M Ana Cândida de Jesus', code: 'e-m-ana-candida-de-jesus' },
  { name: 'E M Ângela Ribeiro Batista Maia', code: 'e-m-angela-ribeiro-batista-maia' },
  { name: 'E M Antônio D\'Assis Martins', code: 'e-m-antonio-dassis-martins' },
  { name: 'E M Antônio Honório da Silva', code: 'e-m-antonio-honorio-da-silva' },
  { name: 'E M Aristides José da Silva', code: 'e-m-aristides-jose-da-silva' },
  { name: 'E M Arthur Trindade', code: 'e-m-arthur-trindade' },
  { name: 'E M Barão do Rio Branco', code: 'e-m-barao-do-rio-branco' },
  { name: 'E M Edir Terezinha de Almeida Fagundes', code: 'e-m-edir-terezinha-de-almeida-fagundes' },
  { name: 'E M Edméia Duarte de Oliveira Braga', code: 'e-m-edmeia-duarte-de-oliveira-braga' },
  { name: 'E M Edvaldo Faleiro de Aguiar', code: 'e-m-edvaldo-faleiro-de-aguiar' },
  { name: 'E M Fausto Figueiredo de Oliveira', code: 'e-m-fausto-figueiredo-de-oliveira' },
  { name: 'E M Florestan Fernandes', code: 'e-m-florestan-fernandes' },
  { name: 'E M Francisco de Sales Barbosa', code: 'e-m-francisco-de-sales-barbosa' },
  { name: 'E M Frei Edgard Groot', code: 'e-m-frei-edgard-groot' },
  { name: 'E M Frei Rogato', code: 'e-m-frei-rogato' },
  { name: 'E M Geferson Ventura de Souza', code: 'e-m-geferson-ventura-de-souza' },
  { name: 'E M Geraldo Jorge Meira', code: 'e-m-geraldo-jorge-meira' },
  { name: 'E M Gilberto Alves da Silva', code: 'e-m-gilberto-alves-da-silva' },
  { name: 'E M Gino José de Souza', code: 'e-m-gino-jose-de-souza' },
  { name: 'E M Isaura Coelho', code: 'e-m-isaura-coelho' },
  { name: 'E M Israel José Carlos', code: 'e-m-israel-jose-carlos' },
  { name: 'E M João Batista Machado de Brito', code: 'e-m-joao-batista-machado-de-brito' },
  { name: 'E M Jorge Afonso Defensor', code: 'e-m-jorge-afonso-defensor' },
  { name: 'E M José Miranda Sobrinho', code: 'e-m-jose-miranda-sobrinho' },
  { name: 'E M José Nogueira Duarte', code: 'e-m-jose-nogueira-duarte' },
  { name: 'E M José Salustiano Lara', code: 'e-m-jose-salustiano-lara' },
  { name: 'E M José Vilaça Guimarães', code: 'e-m-jose-vilaca-guimaraes' },
  { name: 'E M Josefina Macedo Gontijo', code: 'e-m-josefina-macedo-gontijo' },
  { name: 'E M Lúcia Farage de Freitas Gumiero', code: 'e-m-lucia-farage-de-freitas-gumiero' },
  { name: 'E M Manoel Saturnino de Carvalho', code: 'e-m-manoel-saturnino-de-carvalho' },
  { name: 'E M Marcílio Melo Rezende', code: 'e-m-marcilio-melo-rezende' },
  { name: 'E M Margarida Soares Guimarães', code: 'e-m-margarida-soares-guimaraes' },
  { name: 'E M Maria Aracélia Alves', code: 'e-m-maria-aracelia-alves' },
  { name: 'E M Maria Cristina', code: 'e-m-maria-cristina' },
  { name: 'E M Maria da Conceição Brito', code: 'e-m-maria-da-conceicao-brito' },
  { name: 'E M Maria da Penha dos Santos Almeida', code: 'e-m-maria-da-penha-dos-santos-almeida' },
  { name: 'E M Maria de Lourdes Oliveira', code: 'e-m-maria-de-lourdes-oliveira' },
  { name: 'E M Maria Elena da Cunha Braz', code: 'e-m-maria-elena-da-cunha-braz' },
  { name: 'E M Maria José Campos', code: 'e-m-maria-jose-campos' },
  { name: 'E M Maria Mourici Granieri', code: 'e-m-maria-mourici-granieri' },
  { name: 'E M Mario Marcos Cordeiro Tupynambá', code: 'e-m-mario-marcos-cordeiro-tupynamba' },
  { name: 'E M Olímpia Maria da Glória', code: 'e-m-olimpia-maria-da-gloria' },
  { name: 'E M Osório Aleixo da Silva', code: 'e-m-osorio-aleixo-da-silva' },
  { name: 'E M Paulo Monteiro Lara', code: 'e-m-paulo-monteiro-lara' },
  { name: 'E M Prefeito Alcides Braz', code: 'e-m-prefeito-alcides-braz' },
  { name: 'E M Presidente Raul Soares', code: 'e-m-presidente-raul-soares' },
  { name: 'E M Professor Kássio Vinícius Castro Gomes', code: 'e-m-professor-kassio-vinicius-castro-gomes' },
  { name: 'E M Raul Saraiva Ribeiro', code: 'e-m-raul-saraiva-ribeiro' },
  { name: 'E M Rita Maria Silva - Tia Ritinha', code: 'e-m-rita-maria-silva-tia-ritinha' },
  { name: 'E M Sebastiana Diniz Matos Cardoso', code: 'e-m-sebastiana-diniz-matos-cardoso' },
  { name: 'E M Sebastião Ferreira de Oliveira', code: 'e-m-sebastiao-ferreira-de-oliveira' },
  { name: 'E M Silvio Lobo', code: 'e-m-silvio-lobo' },
  { name: 'E M Tito Flávius Lima Andrade', code: 'e-m-tito-flavius-lima-andrade' },
  { name: 'E M Valério Ferreira Palhares', code: 'e-m-valerio-ferreira-palhares' },
  { name: 'E M Vereador Rafael Barbizan', code: 'e-m-vereador-rafael-barbizan' },
  { name: 'E M Waldemar D\'Luz Gonçalves', code: 'e-m-waldemar-dluz-goncalves' },
  // CIMs
  { name: 'CIM Alessandro Ferreira de Souza', code: 'cim-alessandro-ferreira-de-souza' },
  { name: 'CIM Antônio Bernardes (Icaivera)', code: 'cim-antonio-bernardes-icaivera' },
  { name: 'CIM Antônio Honório da Silva', code: 'cim-antonio-honorio-da-silva' },
  { name: 'CIM Cantinho do Beija-Flor', code: 'cim-cantinho-do-beija-flor' },
  { name: 'CIM Castorina Moreira de Jesus - Dona Nina', code: 'cim-castorina-moreira-de-jesus-dona-nina' },
  { name: 'CIM Conceição Guilhermina da Silva', code: 'cim-conceicao-guilhermina-da-silva' },
  { name: 'CIM Criança Esperança', code: 'cim-crianca-esperanca' },
  { name: 'CIM Dom Bosco', code: 'cim-dom-bosco' },
  { name: 'CIM Dona Marta de Jesus', code: 'cim-dona-marta-de-jesus' },
  { name: 'CIM Emanuel Marcelino Maia Silva', code: 'cim-emanuel-marcelino-maia-silva' },
  { name: 'CIM Emílio Mafia Gomes', code: 'cim-emilio-mafia-gomes' },
  { name: 'CIM Enis de Souza Soares', code: 'cim-enis-de-souza-soares' },
  { name: 'CIM Geraldo Jorge Meira', code: 'cim-geraldo-jorge-meira' },
  { name: 'CIM José Alves Pinto', code: 'cim-jose-alves-pinto' },
  { name: 'CIM Maria Engrácia de Souza', code: 'cim-maria-engracia-de-souza' },
  { name: 'CIM Paulo Monteiro Lara', code: 'cim-paulo-monteiro-lara' },
  { name: 'CIM Pequeno Príncipe', code: 'cim-pequeno-principe' },
  { name: 'CIM Rafaela Santana Assis', code: 'cim-rafaela-santana-assis' },
  { name: 'CIM Recanto Alvorada', code: 'cim-recanto-alvorada' },
  { name: 'CIM Recanto da Criança', code: 'cim-recanto-da-crianca' },
  { name: 'CIM Santo Paschoalin', code: 'cim-santo-paschoalin' },
  { name: 'CIM São Luiz', code: 'cim-sao-luiz' },
  { name: 'CIM Sementes do Amanhã', code: 'cim-sementes-do-amanha' },
  { name: 'CIM Silvana Rodrigues Silva Pedrosa', code: 'cim-silvana-rodrigues-silva-pedrosa' },
  { name: 'CIM Sônia Maria Ferreira', code: 'cim-sonia-maria-ferreira' },
  { name: 'CIM Tia Dulce', code: 'cim-tia-dulce' },
  { name: 'CIM Wilma da Costa Pinto Afonso', code: 'cim-wilma-da-costa-pinto-afonso' },
  // Outros
  { name: 'Centro Educacional Técnico e de Artes Profissionais', code: 'centro-educ-tecnico-artes-profissionais' },
];

async function seedSchools() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log(`🏫 Iniciando cadastro de ${schools.length} escolas...\n`);
  
  // Limpar escolas de teste (com nomes inválidos)
  const [deleted] = await conn.execute(
    "DELETE FROM schools WHERE name IN ('dfggfdfdg') OR (name NOT LIKE 'E M %' AND name NOT LIKE 'CIM %' AND name NOT LIKE 'Centro %')"
  );
  console.log(`🗑️  Removidas ${deleted.affectedRows} escolas de teste\n`);
  
  let created = 0;
  let skipped = 0;
  
  for (const school of schools) {
    const [existing] = await conn.execute(
      'SELECT id FROM schools WHERE code = ? LIMIT 1',
      [school.code]
    );
    
    if (existing.length > 0) {
      // Atualizar o nome caso tenha mudado
      await conn.execute(
        'UPDATE schools SET name = ?, updatedAt = NOW() WHERE code = ?',
        [school.name, school.code]
      );
      skipped++;
    } else {
      await conn.execute(
        'INSERT INTO schools (name, code, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())',
        [school.name, school.code]
      );
      created++;
      console.log(`✅ ${school.name}`);
    }
  }
  
  const [total] = await conn.execute('SELECT COUNT(*) as total FROM schools');
  
  await conn.end();
  
  console.log(`\n✅ Concluído!`);
  console.log(`   Criadas: ${created}`);
  console.log(`   Já existiam: ${skipped}`);
  console.log(`   Total no banco: ${total[0].total}`);
}

seedSchools().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
