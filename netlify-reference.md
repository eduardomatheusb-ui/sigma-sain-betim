# Referência do Sistema Netlify (quadrodemediadores)

## Formulário de Cadastro ("Novo registro")

### Campos do formulário (em ordem):
1. E-mail* (input email)
2. Unidade educacional* (input text com autocomplete das escolas)
3. Nome completo do aluno* (input text)
4. Data de nascimento* (input date)
5. CPF ou certidão* (input text)
6. Turno* (select: Integral | Manhã | Tarde | Noite)
7. Turma* (input text)
8. Deficiência/Transtorno* (checkboxes múltiplos):
   - Deficiência visual - baixa visão
   - Deficiência visual - cegueira
   - Visão monocular
   - Deficiência auditiva - surdez
   - Deficiência auditiva - baixa audição
   - Surdocegueira
   - Deficiência sensorial
   - Deficiência física
   - Deficiência intelectual
   - Síndrome de Down
   - TEA - Transtorno do Espectro Autista
   - TDAH - Transtorno de Déficit de Atenção e Hiperatividade
   - TOD - Transtorno Opositor Desafiador
   - TPAC - Transtorno do Processamento Auditivo Central
   - TAG - Transtorno de Ansiedade Generalizada
   - Dislexia
   - Disgrafia
   - Discalculia
   - Altas habilidades/superdotação
   - Em hipótese diagnóstica (em avaliação)
   - P300 - potencial evocado auditivo
   - Outro
9. Situação do atendimento* (select: Com atendente | Sem atendente | Aguardando substituição | Parcialmente atendido)
10. Situação do atendente* (select: Ativo | Inativo)
11. O aluno possui atendente?* (select: Sim | Não)
12. Nome completo do atendente (input text - aparece quando "Sim")
13. O atendente é compartilhado?* (select: Sim | Não)
14. Observação geral (textarea)
15. Botão: "Cadastrar demanda"

## Tabela de Registros
Colunas: ALUNO | UNIDADE | TURMA/TURNO | ATENDIMENTO | ATENDENTE | ATUALIZADO | AÇÕES
Busca: "Buscar por aluno, atendente, unidade ou e-mail"
Ações: Editar | Excluir (admin)

## Dashboard Gerencial

### Filtros:
- Período (select: Últimos 7 dias | Últimos 30 dias | Últimos 90 dias | Últimos 12 meses)
- Escola (select: Todas + lista de escolas)
- Tipo de unidade (select: Todos | EM | CIM | Outro)
- Turno (select: Todos | Integral | Manhã | Tarde | Noite)
- Botão: "Atualizar dashboard"

### Cards de métricas (8 cards):
1. ALUNOS COM ATENDENTE
2. ALUNOS SEM ATENDENTE
3. ATENDENTES ATIVOS
4. ATENDENTES INATIVOS
5. DEMANDAS EM ABERTO
6. ESCOLAS COM FALTA DE ATENDENTE
7. TAXA DE COBERTURA (%)
8. SUBSTITUIÇÕES PENDENTES

### Tabelas de ranking:
- Top 10 EMs com maior demanda (colunas: ESCOLA | SEM ATENDENTE | ABERTAS | DEFICIT)
- Top 10 CIMs com maior demanda (mesmas colunas)
  Nota: "Prioridade aplicada: 1) alunos sem atendente, 2) demandas em aberto, 3) deficit de cobertura."

### Gráficos (6 gráficos):
1. Deficiência/Transtorno (rosca/donut)
2. Faixa etária (rosca/donut)
3. Turno (barras)
4. Situação do atendimento (rosca/donut: Com atendente | Sem atendente)
5. Motivo de inatividade (barras horizontais)
6. Evolução por período (linha: Alunos sem atendente | Atendentes ativos | Atendentes inativos | Demandas em aberto)

### Indicadores extras (seção abaixo dos gráficos)

## Estrutura de Navegação
- Cadastros (aba principal)
- Dashboard Gerencial
- Usuários

## Seção de Escolas (dentro de Cadastros)
- "89 escolas cadastradas"
- Botão "Mostrar lista" / "Ocultar lista"
- Tabela: ESCOLA | IDENTIFICADOR DA ESCOLA | STATUS | REGISTROS VINCULADOS | AÇÕES
- Ações: Copiar identificador | Inativar | Excluir escola
- Formulário de cadastro de escola: Nome da escola* + Identificador da escola*
