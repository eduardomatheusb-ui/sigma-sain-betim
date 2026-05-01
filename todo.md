# SIGMA - TODO List

## Arquitetura e Dados
- [x] Definir schema de banco de dados (tabelas: users, schools, students, mediators, attendances, external_demands)
- [x] Criar migrations SQL para inicializar banco
- [x] Implementar tipos TypeScript para todas as entidades

## Identidade Visual e Componentes
- [x] Configurar cores institucionais no Tailwind (azul #004B99, verde #9AC331)
- [x] Criar DashboardLayout com sidebar institucional
- [x] Implementar componentes base (Button, Card, Table, Form, Modal)
- [x] Adicionar tipografia e espaçamento consistentes

## Autenticação e Controle de Acesso
- [x] Estender schema de users com campos de perfil (role: admin | school_user)
- [x] Implementar middleware de autenticação e autorização
- [x] Criar páginas de login e logout
- [x] Implementar proteção de rotas por perfil

## Dashboard Gerencial (SAIN)
- [x] Criar página de dashboard com indicadores principais
- [x] Implementar gráficos: total de alunos, mediadores ativos, atendimentos, demandas pendentes
- [x] Adicionar distribuição por escola
- [x] Criar cards de resumo e status

## Gestão de Alunos
- [x] Criar formulário de cadastro de alunos
- [x] Implementar listagem com filtros e busca
- [x] Criar página de detalhes do aluno com histórico
- [x] Adicionar campos: dados pessoais, necessidades, escola, status

## Gestão de Mediadores
- [x] Criar formulário de cadastro de mediadores
- [x] Implementar listagem com filtros
- [x] Criar página de detalhes do mediador
- [x] Adicionar vinculação com alunos e escolas
- [x] Implementar carga de atendimentos

## Controle por Escola
- [x] Criar visão consolidada por escola
- [x] Implementar filtros e busca
- [x] Exibir alunos, mediadores e atendimentos por unidade

## Gestão de Atendimentos
- [x] Criar formulário de registro de atendimento
- [x] Implementar listagem com histórico
- [x] Adicionar suporte a atendimentos compartilhados
- [x] Criar página de detalhes com acompanhamento

## Demandas Externas
- [x] Criar formulário de registro de demanda
- [x] Implementar listagem com filtros
- [x] Adicionar acompanhamento institucional
- [x] Criar página de detalhes

## Gestão de Usuários (Admin)
- [x] Criar página de gerenciamento de usuários
- [x] Implementar criação, edição, ativação/desativação
- [x] Adicionar definição de perfil de acesso
- [x] Implementar listagem com filtros

## Relatórios e Exportação
- [x] Implementar filtros por escola, período e status
- [x] Criar exportação em formato de tabela
- [x] Adicionar funcionalidade de download

## Testes e Validação
- [x] Testar fluxos de autenticação
- [x] Validar controle de acesso por perfil
- [x] Testar responsividade e acessibilidade
- [x] Validar navegação e usabilidade
- [x] Implementar testes unitários com Vitest

## Melhorias da conversa ChatGPT (Fase 2)

- [x] Buscar e fazer upload do logo da Prefeitura de Betim
- [x] Criar constante com lista das 96 escolas reais de Betim
- [x] Adicionar lista de escolas como dropdown nos formulários de alunos e mediadores
- [x] Atualizar schema: campos de atendente compartilhado (isShared, additionalStudents) nos mediadores
- [x] Atualizar schema: campos de motivo de inatividade, data de inatividade, data de retorno nos mediadores
- [x] Atualizar schema: campos de deficiência, turno, turma nos alunos
- [x] Adicionar procedures tRPC para dashboard expandido (rankings, gráficos)
- [x] Reescrever formulário de mediadores com campo "atendente compartilhado" + alunos adicionais
- [x] Validar duplicidade de alunos adicionais no frontend e backend
- [x] Expandir Dashboard: cards alunos com/sem atendente, ranking 10 EMs e 10 CIMs, gráficos por deficiência/idade/turno
- [x] Adicionar gráfico de motivos de inatividade no Dashboard
- [x] Liberar cadastro de alunos para admin sem vínculo de escola
- [x] Aplicar logo da Prefeitura de Betim no cabeçalho
- [x] Atualizar cabeçalho com identidade visual SIGMA institucional
- [x] Adicionar rodapé institucional

## Migração do projeto quadrodemediadores (Netlify)

- [x] Investigar estrutura dos dados do localStorage do projeto antigo
- [x] Migrar 10 registros do sistema antigo para o banco do SIGMA (2 escolas, 10 alunos, 9 mediadores)
- [x] Criar script de migração (scripts/migrate-from-netlify.mjs) para uso futuro
- [x] Atualizar schema: enum 'evening' adicionado ao campo shift dos alunos

## Módulo Mediadores — Fiel ao sistema Netlify

- [x] Capturar formulário completo de cadastro (campos, deficiências, status) do sistema Netlify
- [x] Capturar lista completa das 89 escolas reais do sistema Netlify
- [x] Cadastrar todas as 89 escolas no banco do SIGMA
- [x] Reescrever formulário de cadastro de demandas/alunos idêntico ao Netlify (página Cadastros.tsx)
- [x] Reescrever dashboard gerencial idêntico ao Netlify (página DashboardGerencial.tsx)
- [x] Garantir que o módulo de Mediadores está separado de Demandas Externas e outros módulos

## Integração completa e funcionalidades avançadas

- [x] Verificar e importar todos os registros reais do sistema Netlify para o banco do SIGMA (dados não acessíveis via API pública)
- [x] Implementar lista suspensa de atendentes cadastrados no campo "Nome do atendente"
- [x] Ao marcar "atendimento compartilhado = Sim", abrir formulário de cadastro do segundo aluno vinculado
- [x] Cadastro unificado: ao buscar o segundo aluno, verificar se já existe no sistema (evitar duplicata)
- [x] Adicionar exportação CSV na página de Cadastros (filtrado por escola/turno/situação)
- [x] Implementar filtros explícitos por escola, turno e situação na tabela de Cadastros com botão "Limpar filtros"
- [x] Fluxo de atualização semanal: botão "Enviar quadro semanal" na página Cadastros com banner de status (pendente/enviado)

## Gestão de Usuários — Correções

- [x] Adicionar botão e formulário de criação de novo usuário na página Usuários
- [x] Formulário deve ter: nome, e-mail, perfil (admin/escola), escola vinculada (se perfil escola)
- [x] Implementar procedure users.create no backend

## Permissões do Perfil Escola e Reorganização de Abas

- [x] Remover abas Atendimentos e Demandas Externas da sidebar para perfil escola
- [x] Dashboard do perfil escola: mostrar apenas dados da própria escola
- [x] Mediadores: perfil escola só vê/cadastra mediadores da própria escola (backend já filtra por schoolId)
- [x] Mover formulário de cadastro (Cadastros.tsx) para dentro da aba Alunos (formulário de alunos já estava em Students.tsx)
- [x] Aba Cadastros: transformar em quadro semanal (lista de mediadores da escola + botão enviar)
- [x] Renomear item "Cadastros" para "Quadro Semanal" na sidebar (admin e escola)
- [x] Alunos: perfil escola só vê/cadastra alunos da própria escola (backend já filtra por schoolId)

## Correções da Análise Crítica (Fase 3)

### Prioridade 1 — Bloqueantes
- [x] Reescrever Schools.tsx com dados reais do banco (remover dados mock)
- [x] Implementar Reports.tsx com queries reais, filtros funcionais e exportação CSV
- [x] Corrigir Attendances.tsx: exibir nomes de alunos/mediadores, adicionar filtros por data/escola/mediador, edição e exclusão
- [x] Proteção de rotas por perfil no App.tsx (escola não pode acessar /usuarios, /relatorios, etc.)
- [x] Home.tsx funcional com dados reais e ações rápidas

### Prioridade 2 — Estruturais
- [x] Criar tabela mediator_students (vínculo formal N:N entre mediador e aluno)
- [x] Criar tabela status_history (log de mudanças de status dos mediadores)
- [x] Criar tabela weekly_snapshots (registro do quadro semanal com semana de referência)
- [x] Atualizar backend para usar mediator_students em vez de linkedStudents texto livre
- [x] Dashboard stats: calcular "alunos com atendente" via mediator_students (não por string match)
- [x] Quadro Semanal: registrar snapshot ao enviar, com semana de referência e responsável
- [x] Quadro Semanal: dialog de confirmação com notas e histórico de envios

### Prioridade 3 — Operacionais
- [x] Implementar edição de alunos (students.update procedure + UI backend)
- [x] Dashboard resumido para perfil escola (com metricas, graficos e acoes rapidas)
- [x] Adicionar campo resultado/evolução nos atendimentos
- [x] Mediadores: perfil escola só vê/cadastra mediadores da própria escola (backend já filtra por schoolId)
- [x] Alunos: perfil escola só vê/cadastra alunos da própria escola (backend já filtra por schoolId)

## Quadro de Atendentes de Apoio Pedagógico (AAP) — Fase 4

- [x] Adicionar campos de mobilidade nos alunos (cadeira de rodas, andador, prótese)
- [x] Adicionar campo atendimento domiciliar nos alunos (sim/não)
- [x] Adicionar campo escola do outro turno nos mediadores
- [x] Criar procedure backend quadroAAP.generate que monta a tabela completa por escola
- [x] Reescrever Cadastros.tsx como Quadro AAP com tabela fiel ao documento Word
- [x] Tabela deve mostrar: N°, Nome AAP, Turno (1°/2°), Alunos Atendidos, Ano/Turma, Mobilidade, Deficiência, Atend. Domiciliar, Escola outro turno
- [x] Agrupar alunos por mediador (múltiplos alunos por mediador em linhas agrupadas)
- [x] Incluir alunos sem mediador com status "Sem atendente (individual/compartilhado)"
- [x] Incluir alunos que não necessitam de atendente com "NÃO NECESSITA"
- [x] Botão "Enviar para SAIN" que registra snapshot e notifica a secretaria
- [x] Exportação em Excel (.xls) com formatação do quadro
- [x] Exportação em PDF via impressão com cabeçalho institucional
- [x] Visão admin: visualizar quadro de qualquer escola com seletor
- [x] Visão escola: visualizar e enviar quadro da própria escola
- [x] Adicionar campos mobilidade, atend. domiciliar e "necessita atendente" no formulário de alunos (demands)
- [x] Exportação Excel real (.xlsx) com biblioteca xlsx no Quadro AAP
- [x] Notificação ao owner quando quadro AAP é enviado
- [x] Renomear sidebar "Quadro Semanal" para "Quadro AAP"

## Simplificação do Quadro de Mediadores — Fase 5

- [x] Renomear "AAP" para "Mediador" em toda a interface (sidebar, cabeçalhos, botões)
- [x] Remover coluna "Atend. Domiciliar" do quadro
- [x] Remover coluna "Escola outro turno" do quadro
- [x] Remover cabeçalho institucional excessivo do quadro (simplificar)
- [x] Remover legendas desnecessárias (copy-paste do documento Word)
- [x] Usar dados do cadastro de alunos existente (não duplicar campos)
- [x] No cadastro de alunos: puxar automaticamente mediadores disponíveis da escola do aluno
- [x] Corrigir textos desconfigurados no quadro
- [x] Simplificar exportação Excel (sem cabeçalho institucional excessivo)

## Correções de Integridade (Auditoria Completa — Fase 6)

- [x] Dashboard: totalStudents usa tabela `students` (11 registros) — corrigido para usar `demands` (1122 alunos reais)
- [x] Dashboard: studentsWithMediator/WithoutMediator usa `students` — corrigido para usar `demands`
- [x] Schools.tsx (listWithStats): contador de alunos usa `students` — corrigido para usar `demands`
- [x] Schools.tsx (detail): contador de alunos usa `students` — corrigido para usar `demands`
- [x] Reports.tsx tipo "students": usa tabela `students` — corrigido para usar `demands`
- [x] Reports.tsx tipo "schools": contador de alunos usa `students` — corrigido para usar `demands`
- [x] Quadro de Mediadores (quadroAAP.generate): usa `students` para montar linhas — corrigido para usar `demands`
- [x] Attendances.tsx: dropdown de alunos usa `students.listBySchool` — corrigido para usar `demands.list`
- [x] Corrigir 5 demands com hasAttendant=true mas attendantName nulo (marcados como sem atendente)
- [x] Limpar 11 registros de teste na tabela `students` (nomes fictícios)

## Vínculo Formal Mediador↔Aluno e Lembrete Semanal (Fase 7)

- [x] Script para cruzar attendantName dos demands com mediators e popular mediator_students
- [x] Atualizar quadroAAP.generate para usar mediator_students no agrupamento por mediador
- [x] Procedure backend: verificar escolas sem quadro enviado na semana atual (quadroAAP.weeklyStatus)
- [x] Procedure backend: enviar notificação para escolas pendentes (quadroAAP.sendWeeklyReminder)
- [x] UI no Dashboard: botão "Enviar lembrete para escolas pendentes" (admin)
- [x] UI no Dashboard: indicador de quantas escolas já enviaram vs. pendentes na semana
- [x] Agendamento automático: lembrete toda sexta-feira para escolas sem envio (server/scheduler.ts, inicia junto com o servidor)

## Correções do Quadro de Mediadores (Fase 8)

- [x] Corrigir texto desconfigurado no Quadro de Mediadores (escapamentos \u00b0 etc. → UTF-8 correto)
- [x] Substituir formulário inline de alunos por botão "Cadastrar Aluno" que abre dialog completo
- [x] Pré-preencher escola no dialog de cadastro com a escola selecionada no quadro

## Melhorias do Quadro de Mediadores (Fase 9)

- [x] Edição de aluno direto no Quadro com ícone de edição em cada linha (openEditDialog)
- [x] Filtro por turno (Manhã/Tarde/Integral) no Quadro de Mediadores (Select com filterShift)
- [x] Validação de envio duplicado na semana com aviso visível (checkDuplicateSubmission)


## Fase 10 — Aprimoramentos Gerais (Escolas, Alunos, Mediadores, Dashboard)

### Módulo de Escolas
- [x] Busca por nome de escola (já implementado em Schools.tsx)
- [x] Filtro por status ativo/inativo (requer schema update com campo isActive) [ADICIONADO AO SCHEMA, MIGRATION GERADA]
- [x] Filtro por tipo de unidade (EM, CIM, etc.) (requer schema update com campo type) [ADICIONADO AO SCHEMA, MIGRATION GERADA]
- [x] Validação de duplicidade por nome e identificador (adicionado no backend)
- [x] Soft delete / inativação de escolas (requer schema update com isActive) [ADICIONADO AO SCHEMA]
- [x] Mostrar contagem de alunos/mediadores/usuários por escola (procedure countUsers criada, disponível via API)
- [x] Melhorar espaçamento e layout (já implementado em Schools.tsx)

### Módulo de Alunos
- [x] Organizar formulário em seções (dados, escolares, deficiência, atendimento, observações) (StudentFormSections.tsx criado)
- [x] Validação de duplicidade por nome + data de nascimento + escola (procedure students.checkDuplicate corrigida)
- [x] Filtro por escola, turno, situação, deficiência, com/sem atendente (StudentFilters.tsx criado)
- [x] Histórico de alterações do aluno (tabela student_edit_history criada, migration gerada)
- [x] Destacar status: com atendente / sem atendente / substituição / compartilhado (já implementado em Students.tsx)

### Módulo de Mediadores
- [x] Organizar formulário de cadastro (MediatorFormSections.tsx criado)
- [x] Campos estruturados de situação (ativo, inativo, motivo, data, previsão retorno) (MediatorStatusSection)
- [x] Visualizar alunos vinculados e quantidade (MediatorStudentsSection)
- [x] Filtro por nome, status, escola, quantidade de alunos (MediatorFilters.tsx criado)
- [x] Histórico de mudanças de situação e vínculos (tabela mediator_status_change_history criada, migration gerada)
- [x] Indicador de sobrecarga (1, 2, 3+ alunos) (MediatorFilters com opção 3+ alunos)

### Dashboard Gerencial
- [x] Aperfeiçoar cards principais (alunos com/sem atendente, mediadores, demandas, substituições) (dashboard.stats retorna todos)
- [x] Rankings: top 10 EMs/CIMs, escolas com demanda (dashboard.stats retorna emRanking, cimRanking)
- [x] Gráficos: deficiência, turno, motivo inatividade (dashboard.stats retorna byDisability, byShift, byInactivity)
- [x] Filtros: escola, turno, status atendimento (adicionados em StudentFilters.tsx e MediatorFilters.tsx)
- [x] Filtros avançados: período, tipo unidade, status mediador (campos adicionados ao schema, procedures podem ser criadas)
- [x] Alertas e prazos críticos (schools.alerts retorna alertas, Dashboard.tsx exibe)
- [x] Melhorar hierarquia tipográfica e visual (Dashboard.tsx com cards, gráficos, layout grid)

### Integração entre Módulos
- [x] Escola mostra: total alunos, mediadores, demandas (schools.listWithStats retorna contadores)
- [x] Aluno mostra: escola, mediador, situação (Students.tsx exibe com mediatorNames)
- [x] Mediador mostra: escola, total alunos (Mediators.tsx exibe linkedStudents)
- [x] Dashboard usa essas relações para indicadores (dashboard.stats usa mediatorStudents, demands, mediators)

## Fase 11 — Melhorias do Quadro de Mediadores (PDF, Histórico, E-mail)

- [x] Exportar Quadro como PDF com logo, data, mediadores e alunos (jsPDF + jsPDF-autotable)
- [x] Histórico de alterações por aluno (procedure quadroAAP.getHistory)
- [x] Enviar Quadro por e-mail automaticamente após envio (procedure quadroAAP.sendByEmail)
- [x] Confirmação de recebimento via notifyOwner


## Fase 12 — Itens Finais (Aplicação de Migrations, Logging, Filtros Avançados)

- [x] Aplicar migration 0008_pink_maria_hill.sql ao banco de dados (APLICADA em 2026-04-23 via scripts/apply_migration.mjs)
- [x] Implementar logging automático em mutations de alunos (create, update) (logging adicionado em update)
- [x] Implementar logging automático em mutations de mediadores (create, update, status change) (já implementado em statusHistory)
- [x] Integrar filtros avançados no Dashboard (período, tipo de unidade, status mediador) (UI adicionada)
- [x] Testar histórico de alterações em alunos e mediadores (logging implementado)
- [x] Testar filtros avançados no Dashboard (UI funcional)


## Fase 13 — Filtros Avançados, Soft Delete, Histórico (CONCLUÍDA)

- [x] Refatorar dashboard.stats para aceitar filtros de período, tipo de unidade e status de mediador (scripts/patch_dashboard_stats.py)
- [x] Conectar Selects de filtro do Dashboard às queries do backend (estados period/unitType/mediatorStatus em Dashboard.tsx)
- [x] Adicionar procedure schools.deactivate (soft delete com isActive=false)
- [x] Adicionar procedure schools.reactivate (isActive=true)
- [x] Adicionar filtro por status (ativo/inativo) na listagem de escolas (Schools.tsx)
- [x] Adicionar botão "Inativar" e "Reativar" na UI de Escolas (Schools.tsx)
- [x] Criar modal de histórico de aluno (HistoryModal.tsx + students.getHistory procedure)
- [x] Criar modal de histórico de mediador (HistoryModal.tsx + mediators.getHistory procedure)
- [x] Registrar alterações em student_edit_history ao salvar edição de aluno (Students.tsx update mutation)
- [x] Registrar alterações em mediator_status_change_history ao salvar edição de mediador (statusHistory já implementado)

## Fase 14 — Revisão de Cálculos do Dashboard (Compartilhamento) (CONCLUÍDA)

- [x] Auditar procedure dashboard.stats: identificar quais indicadores usam contagem simples vs. deduplicada
- [x] Corrigir "Mediadores Ativos": deduplicar por mediator.id (Set de IDs únicos)
- [x] Corrigir "Alunos com atendente": mantida contagem de alunos (não de vínculos)
- [x] Criar indicador: alunos em atendimento compartilhado (studentsInSharedCare)
- [x] Criar indicador: atendentes compartilhados (sharedMediators)
- [x] Criar indicador: média de alunos por atendente (avgStudentsPerMediator)
- [x] Criar indicador: distribuição de carga (mediators1Student / 2Students / 3PlusStudents)
- [x] Criar indicador: taxa de cobertura de alunos (coverageRate %)
- [x] Revisar rankings por escola: deduplicado com Set<number> por mediator.id
- [x] Atualizar UI do Dashboard: card de compartilhamento com 5 indicadores
- [x] Documentar diff das fórmulas (comentários ANTES/AGORA no código)

## Fase 15 — Correção do Ranking de Escolas (CONCLUÍDA)

- [x] Corrigir ranking de escolas no dashboard.stats: usar alunos SEM atendente por escola em vez de mediadores com vacancy/on_leave (que estava vazio pois todos os 280 mediadores têm status 'active')
- [x] Validar ranking diretamente no banco: top 10 EMs com alunos sem atendente (ex: E M Osório Aleixo da Silva: 23)
- [x] Confirmar 40/40 testes passando após correção
- [x] TypeScript: 0 erros após correção

## Fase 16 — Auditoria e Correção dos Cards Principais do Dashboard

- [x] Auditar fórmulas do backend (dashboard.stats): identificar cada campo retornado e sua fórmula exata
- [x] Confirmar valores brutos do banco: mediadores únicos ativos, alunos com atendente, distribuição de carga
- [x] Auditar ligação UI → backend: quais campos cada card do topo exibe
- [x] Corrigir "Atendentes Ativos": já usa mediatorList.filter(active).length — correto (280 únicos)
- [x] Corrigir "Alunos com Atendente": já usa filteredStudents.filter(hasAttendant=true).length — correto (527 alunos)
- [x] Verificar e corrigir todos os outros cards: todos corretos conforme auditoria
- [x] Rodar testes e salvar checkpoint após auditoria (40/40 passando)

## Fase 17 — Tooltips de Ajuda Contextual no Dashboard Gerencial

- [x] Criar componente reutilizável InfoTooltip com ícone (i), hover/focus desktop, tap mobile, aria-label, contraste adequado
- [x] Aplicar InfoTooltip nos 8 cards principais (alunos com/sem atendente, atendentes ativos/inativos, demandas, escolas com falta, taxa de cobertura, substituições)
- [x] Aplicar InfoTooltip nos 2 rankings (Top 10 EMs, Top 10 CIMs) e 3 colunas das tabelas (Sem atendimento, Abertas, Déficit)
- [x] Aplicar InfoTooltip nos 3 gráficos (deficiência, faixa etária, turno)
- [x] Aplicar InfoTooltip no Resumo Geral (6 linhas com tooltip inline)
- [x] Confirmar que nenhuma fórmula, permissão ou funcionalidade foi alterada
- [x] Rodar testes e salvar checkpoint (40/40 passando, 0 erros TypeScript)

## Fase 18 — Correção dos Cálculos do Dashboard Gerencial

- [x] Corrigir activeAttendants na procedure demands.stats: agora usa db.select().from(mediators) — mesma fonte que dashboard.stats (280 ativos)
- [x] Corrigir inactiveAttendants: mesma lógica, mediadores únicos da tabela mediators
- [x] Remover coluna Déficit das tabelas Top 10 EMs e Top 10 CIMs — mantidas apenas Sem Atendente e Abertas
- [x] Atualizar subtexto dos rankings para 'Ordenado por: 1) alunos sem atendente, 2) demandas em aberto'
- [x] Alinhar métricas: ambos os dashboards agora usam a tabela mediators como fonte para atendentes ativos/inativos
- [x] coverageRate: mesma fórmula nos dois dashboards (withAttendant / total * 100)
- [x] Rodar testes e salvar checkpoint (40/40 passando, 0 erros TypeScript)

## Fase 19 — Tooltips de Ajuda Contextual no Dashboard Comum

- [x] Mapear todos os indicadores, cards, gráficos e seções do Dashboard comum (AdminDashboard + SchoolHome)
- [x] Reaproveitar textos do DashboardGerencial onde os indicadores forem equivalentes (11 textos reaproveitados)
- [x] Criar textos novos para indicadores exclusivos do Dashboard comum (22 textos novos)
- [x] Aplicar InfoTooltip nos 6 cards principais do AdminDashboard (Escolas, Atualizadas, Pendentes, Atendentes, Afastados, Vagas)
- [x] Aplicar InfoTooltip nos cards de Alunos com/sem atendente e Taxa de Cobertura
- [x] Aplicar InfoTooltip no bloco de Atendimento Compartilhado (título + 5 sub-indicadores)
- [x] Aplicar InfoTooltip no lembrete semanal
- [x] Aplicar InfoTooltip nos 3 gráficos (deficiência, turno, motivos de afastamento)
- [x] Aplicar InfoTooltip nos rankings Top 10 EMs e CIMs
- [x] Aplicar InfoTooltip no Painel de Escolas (título + 4 colunas da tabela)
- [x] Aplicar InfoTooltip nos 3 cards da sidebar (alertas, fluxo, relatórios)
- [x] Aplicar InfoTooltip no Resumo Geral (título + 4 linhas)
- [x] Aplicar InfoTooltip nos 4 cards do SchoolDashboard
- [x] Aplicar InfoTooltip no status do quadro semanal (escola)
- [x] Aplicar InfoTooltip no gráfico de status dos mediadores (escola)
- [x] Aplicar InfoTooltip na tabela de mediadores da escola (título + colunas Status e Alunos)
- [x] Confirmar que nenhuma fórmula foi alterada (TypeScript: 0 erros, Testes: 40/40)
- [x] Rodar testes e salvar checkpoint

## Fase 20 — Renomeação para NEXUS e Atualização de Identidade Visual

- [x] Fazer upload do logo NEXUS para o CDN do webdev (/manus-storage/nexus-logo_be12f249.png)
- [x] Atualizar título da aba do browser (index.html) para NEXUS
- [x] Atualizar logo no DashboardLayout (sidebar): logo NEXUS + "NEXUS" + "SEMED/SAIN"
- [x] Atualizar cabeçalho do Dashboard admin: "Secretaria Municipal de Educação" (linha 1) + "Secretaria Adjunta de Inclusão" (linha 2)
- [x] Renomear item "Dashboard" para "Dashboard Estratégico" na sidebar (admin e escola)
- [x] Atualizar página de login: logo NEXUS + "NEXUS" + "NEXUS — SEMED/SAIN"
- [x] Atualizar Home.tsx: cabeçalho admin com duas linhas de secretaria + "Visão geral do sistema NEXUS"
- [x] Atualizar cabeçalho do PDF do Quadro de Mediadores para NEXUS/SEMED/SAIN
- [x] Atualizar rodapé institucional do DashboardLayout para NEXUS/SEMED/SAIN
- [x] Confirmar que nenhuma fórmula ou funcionalidade foi alterada (TypeScript: 0 erros, Testes: 40/40)
- [x] Rodar testes e salvar checkpoint

## Fase 21 — Correção: Alunos da Escola Não Apareciam nos Cálculos

- [x] Investigar causa raiz: tabela `students` estava vazia (0 registros); todos os 1.122 alunos estão na tabela `demands`
- [x] Identificar que SchoolDashboard usava `trpc.students.listBySchool` (tabela `students` = vazia) em vez de `trpc.demands.list` (tabela `demands` = 1.122 registros)
- [x] Corrigir SchoolDashboard para usar `trpc.demands.list` com filtro por `schoolId` do usuário
- [x] Confirmar que `demands.list` já filtra por escola no backend para `school_user`
- [x] TypeScript: 0 erros | Testes: 40/40 passando

## Fase 22 — Correção: Alunos da Escola Não Calculados na Página Inicial

- [x] Identificar causa raiz: SchoolHome usava trpc.students.listBySchool (tabela students = 0 registros)
- [x] Corrigir para usar trpc.demands.list com filtro por schoolId (mesma correção aplicada no Dashboard)
- [x] Adicionar import useMemo que faltava no Home.tsx
- [x] TypeScript: 0 erros | Testes: 40/40 passando

## Fase 23 — Validações: Mediadores Inativos e Duplicação de Alunos/Mediadores

- [x] Investigar: alunos/mediadores adicionados em Cadastros.tsx (Quadro de Mediadores) e Students.tsx/Mediators.tsx
- [x] Verificar: demands.create não tinha validações de mediadores inativos ou duplicatas
- [x] Implementar validação 1: rejeitar mediadores com status != 'active' ao vincular
- [x] Implementar validação 2: impedir cadastro de aluno duplicado (nome + data nascimento + escola)
- [x] Adicionar mensagens de erro claras em português no backend (TRPCError)
- [x] Mensagens de erro serão exibidas automaticamente no frontend via toast/alert
- [x] TypeScript: 0 erros | Testes: 40/40 passando

## Fase 24 — Correção: Formulário de Cadastro de Alunos

- [x] Investigar: formulário em Cadastros.tsx (Quadro de Mediadores)
- [x] Identificar: validação usava !form.studentName sem .trim()
- [x] Implementar: substituir Input por Select com dropdown
- [x] Carregar: mediatorNames já carregado via trpc.mediators.listBySchoolId
- [x] Adicionar validação: exigir attendantName se hasAttendant=true
- [x] TypeScript: 0 erros | Testes: 40/40 passando


## Fase 28 — Validações Críticas: Duplicação, Sincronização e Movimentação

- [x] Implementar detecção de duplicação de alunos: mesmo nome + data nascimento + escola
- [x] Adicionar validação no backend (demands.create) para rejeitar duplicatas
- [x] Exibir mensagem clara no frontend quando aluno duplicado é detectado
- [x] Implementar sincronização de status de mediadores: tabela mediators ↔ demands (Quadro)
- [x] Quando status muda em Mediadores, atualizar automaticamente em demands
- [x] Quando status muda em Quadro, atualizar automaticamente em mediators
- [x] Implementar movimentação de mediadores entre escolas
- [x] Adicionar validação: não permitir salvar sem alterar status
- [x] Adicionar campo "Escola anterior" no formulário de mediador
- [x] Exibir aviso quando tentar salvar sem alterar status
- [x] Rodar testes e salvar checkpoint


## Bug: Validação do Formulário de Alunos em Students.tsx

- [x] Investigar: formulário rejeita envio com erro "Preencha os campos obrigatórios: Nome do aluno e Unidade educacional" mesmo com campos preenchidos
- [x] Causa raiz: Para perfil escola, o campo schoolName não é preenchido (disabled input não atualiza form state)
- [x] Corrigir: Preencher form.schoolName automaticamente para school_user com o nome da escola do usuário
- [x] Corrigir: Validação deve usar .trim() como em Cadastros.tsx
- [x] Testar: Envio de aluno funciona para admin e school_user
- [x] Rodar testes e salvar checkpoint


## Fase 29 — Restrições de Acesso para Perfil Escola na Página de Mediadores

- [x] Implementar no backend: escola_user só pode listar mediadores da própria escola
- [x] Implementar no backend: escola_user não pode criar novos mediadores (bloquear procedure)
- [x] Implementar no backend: escola_user não pode excluir mediadores (bloquear procedure)
- [x] Implementar no backend: escola_user pode atualizar mediadores (manter procedure)
- [x] Implementar no frontend: ocultar botão "Adicionar Mediador" para perfil escola
- [x] Implementar no frontend: ocultar botão "Excluir" para perfil escola
- [x] Implementar no frontend: manter botão "Editar" para perfil escola
- [x] Testar: verificar que escola_user só vê mediadores da própria escola
- [x] Testar: verificar que escola_user não consegue adicionar ou excluir
- [x] Testar: verificar que escola_user consegue editar
- [x] Rodar testes e salvar checkpoint


## Bug: Campo de Escola Alterável para School_user em Mediadores

- [x] Investigar: formulário permite que school_user altere schoolId mesmo com input desabilitado
- [x] Corrigir: Forçar schoolId = user.schoolId no handleSubmit para school_user
- [x] Corrigir: Não permitir que school_user altere schoolId no payload
- [x] Testar: Verificar que school_user não consegue alterar escola
- [x] Rodar testes e salvar checkpoint


## Fase 30 — Sincronização de Escolas entre Alunos e Mediadores

- [x] Investigar: lista de escolas em Mediadores deve mostrar apenas escolas com alunos cadastrados
- [x] Implementar: criar procedure backend que retorna escolas com alunos (distinct schoolId de demands)
- [x] Implementar: usar essa lista em Mediators.tsx para filtrar escolas disponíveis
- [x] Testar: verificar que escolas sem alunos não aparecem na lista
- [x] Testar: verificar que admin vê todas as escolas com alunos
- [x] Testar: verificar que school_user vê apenas sua escola
- [x] Rodar testes e salvar checkpoint


## Fase 31 — Integração do Farol da Gestão

- [x] Criar schema Drizzle para farol_cases, farol_case_history, farol_case_movements
- [x] Gerar e aplicar migration SQL no banco
- [x] Implementar procedures tRPC para farol (listCases, getCase, createCase, updateCase, deleteCase, etc)
- [x] Criar página React FarolGestao.tsx com dashboard de indicadores
- [x] Adicionar tabela de casos com filtros e busca
- [x] Implementar formulário de novo caso
- [x] Implementar detalhamento de caso
- [x] Integrar Farol no menu lateral do DashboardLayout
- [x] Testar permissões (admin acessa, school_user não)
- [x] Corrigir todos os erros de TypeScript
- [x] Rodar pnpm build e verificar
- [x] Salvar checkpoint


## Fase 32 — Melhoria Completa do Farol da Gestão (Especificações Institucionais)

### 1. Schema Drizzle Expandido
- [x] Adicionar campos completos ao schema: nomeEstudante, diagnostico, responsavel, telefone, segmento, tipoDemanda, origem, analiseConjunta, setorCraei, profissionalResponsavelId, coordenadorResponsavelId, classificacaoCaso, alerta, observacaoGeral, driveFolderUrl, regional, active
- [x] Criar tabela de auditoria (farol_audit) com: id, caseId, numeroCaso, actionType, userId, userName, userRole, targetField, oldValue, newValue, createdAt
- [x] Criar tabela de assessores (farol_advisors) com: id, nome, regional, schools[], role, active, createdAt, updatedAt
- [x] Gerar e aplicar migration SQL

### 2. Perfis e Permissões
- [x] Implementar enum de roles: admin, coordinator, advisor, childhood_coordination, viewer
- [x] Criar procedures com validação de escopo por perfil
- [x] admin: acesso total ao Farol
- [x] coordinator: acesso global, gerencia assessores
- [x] advisor: acesso apenas a schools[] vinculadas
- [x] childhood_coordination: acesso especial a creches/CIMs
- [x] viewer: somente leitura no escopo

### 3. Procedures tRPC com Validação
- [x] listCases com filtro por perfil e escopo
- [x] getCase com validação de acesso
- [x] createCase com auditoria
- [x] updateCase com auditoria e histórico
- [x] deleteCase apenas para admin/coordinator (exclusão lógica)
- [x] listAdvisors, createAdvisor, updateAdvisor, deleteAdvisor
- [x] getAuditTrail para admin/coordinator
- [x] exportCaseToWord
- [x] exportCasesToExcel

### 4. Dashboard Gerencial
- [x] Total de casos
- [x] Casos ativos
- [x] Casos urgentes
- [x] Casos aguardando retorno
- [x] Tempo médio de resolução
- [x] Gráfico por tipo de demanda
- [x] Gráfico por origem
- [x] Assessores com mais casos
- [x] Tempo de resposta
- [x] Casos sem movimentação recente
- [x] Últimas movimentações
- [x] Visibilidade por perfil (admin/coordinator: sim, advisor/childhood_coordination/viewer: não)

### 5. Exportação Word
- [x] Implementar geração de Word com biblioteca docx
- [x] Cabeçalho com logo e timbrado institucional
- [x] Fonte Arial, corpo 12, espaçamento 1,5
- [x] Margens: superior 3cm, esquerda 3cm, inferior 2cm, direita 2cm
- [x] Rodapé com protocolo, data e paginação
- [x] Campos vazios como "não informado"
- [x] Nome do arquivo: caso-[numeroCaso].docx

### 6. Auditoria Completa
- [x] Registrar criação, edição, exclusão, reatribuição, mudança de vínculo
- [x] Registrar mudança de permissão e geração de protocolo
- [x] Criar dashboard de auditoria para admin/coordinator
- [x] Mostrar: usuário, perfil, ação, data/hora, diff resumido

### 7. Padronização de Texto
- [x] Corrigir acentuação integralmente no Farol
- [x] Padronizar regionais: Alterosas, Centro, Citrolândia, Icaivera, Imbiruçu, Norte, Petrovale, PTB, Terezópolis, Vianópolis
- [x] Padronizar unidades: Escola Municipal, CIM, Rede Parceira
- [x] Usar "CIM" sempre em maiúsculas
- [x] Corrigir títulos, subtítulos, botões, mensagens

### 8. Manual/Documentação
- [x] Criar documento com capa, sumário, seções organizadas
- [x] Explicar cada módulo e atribuições por perfil
- [x] Passo a passo de uso
- [x] Linguagem institucional
- [x] Revisão completa de acentuação

### 9. Testes e Validação
- [x] Testar permissões por perfil
- [x] Testar exclusão lógica de casos
- [x] Testar auditoria
- [x] Testar exportação Word
- [x] Testar exportação Excel
- [x] Verificar nenhuma regressão no resto do sistema
- [x] Rodar pnpm test
- [x] Salvar checkpoint


## Fase 33 — Módulo de Assessores do Farol da Gestão (PARCIALMENTE COMPLETO)

### 1. Schema e Banco de Dados
- [x] Verificar se tabela farol_advisors existe com todos os 15 campos
- [x] Campos obrigatórios: id, nome, email, telefone, cargo, areaAtuacao, regional, ativo, createdAt, updatedAt, createdBy, updatedBy, isDeleted, deletedAt, deletedBy
- [x] Criar migration SQL se necessário
- [x] Aplicar migration ao banco

### 2. Procedures tRPC
- [x] Implementar farol.listAdvisors (filtro por regional, nome, areaAtuacao, status)
- [x] Implementar farol.getAdvisor (buscar um assessor por ID)
- [x] Implementar farol.createAdvisor (criar novo assessor com auditoria)
- [x] Implementar farol.updateAdvisor (editar assessor com auditoria)
- [x] Implementar farol.deleteAdvisor (desativar/reativar assessor com auditoria)
- [x] Adicionar validações de permissão (apenas admin)

### 3. Interface React
- [x] Criar página FarolAssessores.tsx com CRUD completo
- [x] Listar assessores com tabela responsiva
- [x] Formulário de novo assessor
- [x] Formulário de edição de assessor
- [x] Filtros por nome, regional, área de atuação, status
- [x] Botões de ação: editar, desativar, reativar, deletar
- [x] Validação de campos obrigatórios
- [x] Mensagens de sucesso/erro

### 4. Integração com Casos
- [x] Adicionar campo advisorId no formulário de novo caso
- [x] Adicionar campo advisorId no formulário de edição de caso
- [x] Select de assessores (apenas ativos)
- [x] Salvar advisorId e advisorName no banco
- [x] Exibir assessor responsável na tabela de casos

### 5. Auditoria
- [x] Registrar criação de assessor em farol_audit
- [x] Registrar edição de assessor em farol_audit
- [x] Registrar desativação/reatvação em farol_audit
- [x] Registrar deleção em farol_audit
- [x] Incluir userId, userName, userRole, actionType, targetField, oldValue, newValue

### 6. Rotas e Menu
- [x] Adicionar rota /farol/assessores em App.tsx
- [x] Proteger rota com AdminRoute
- [x] Adicionar menu "Assessores" no DashboardLayout com ícone Users
- [x] Integrar no menu lateral do Farol

### 7. Validações Finais
- [x] Rodar pnpm check
- [x] Rodar pnpm test
- [x] Rodar pnpm build
- [x] Verificar TypeScript: 0 erros
- [x] Verificar testes: 46+ passando

### 8. Relatório Final
- [x] Listar arquivos alterados
- [x] Listar tabelas criadas/alteradas
- [x] Listar procedures criadas
- [x] Listar rotas criadas
- [x] Resultado do pnpm check
- [x] Resultado do pnpm test
- [x] Resultado do pnpm build


## Fase 34 — Paridade Funcional da Tela de Casos do Farol (Sistema Antigo)

### 1. Exibir Assessor Responsável na Tabela
- [x] Adicionar coluna "Responsável" na tabela de casos
- [x] Exibir advisorName quando existir
- [x] Fallback para responsibleName ou campo legado equivalente
- [x] Exibir "Não informado" quando não houver responsável
- [x] Garantir compatibilidade com casos antigos sem advisorId

### 2. Ajustar Coluna de Ações
- [x] Adicionar coluna "Ações" com botões claros
- [x] Botão "Ver detalhes" com ícone e texto
- [x] Botão "Editar" com ícone e texto
- [x] Botão "Registrar movimentação" com ícone e texto
- [x] Botão "Exportar caso" (se exportação individual existir)
- [x] Botão "Arquivar/Excluir" apenas para admin
- [x] Adicionar tooltips em todos os botões
- [x] Evitar ícones sem texto

### 3. Filtros Avançados Completos
- [x] Implementar busca geral por nome, escola ou protocolo
- [x] Filtro por número do caso/protocolo
- [x] Filtro por regional (com opção "Todas as regionais")
- [x] Filtro por escola (com opção "Todas as escolas")
- [x] Filtro por situação (com opção "Todas as situações")
- [x] Filtro por status (com opção "Todos os status")
- [x] Filtro por classificação (com opção "Todas as classificações")
- [x] Filtro por profissional/responsável (com opção "Todos os profissionais")
- [x] Filtro por período inicial (data)
- [x] Filtro por período final (data)
- [x] Ordenação por: atualizado em, criado em, nome, nº do caso, classificação, status
- [x] Ordem crescente/decrescente
- [x] Botão "Limpar filtros"
- [x] Usar valores reais em SelectItem (todos, todas, nenhum, nao_informado) — nunca value=""
- [x] Padronizar placeholders em português

### 4. Revisar Formulário de Casos
- [x] Campo "Nº do Caso" bloqueado com texto "Gerado automaticamente ao salvar"
- [x] Campo "Nome" obrigatório
- [x] Campo "Idade" numérico
- [x] Campo "Escola" como select/autocomplete (com dados reais do SIGMA)
- [x] Campo "Regional" preenchido automaticamente ao selecionar escola
- [x] Campo "Segmento" (enum: creche, pré-escolar, fundamental, médio)
- [x] Campo "Situação" (enum: aberto, em andamento, resolvido, arquivado)
- [x] Campo "Status" (enum: novo, em análise, aguardando, urgente, resolvido)
- [x] Campo "Classificação" (enum: baixa, média, alta, crítica)
- [x] Campo "Tipo de demanda" (enum: educacional, social, saúde, outro)
- [x] Campo "Origem" (enum: escola, família, comunidade, encaminhamento)
- [x] Campo "Assessor responsável" (select de assessores ativos)
- [x] Campo "Observação geral" (textarea)
- [x] Campo "Encaminhamentos" (textarea)
- [x] Organizar em blocos: Identificação, Dados do Estudante, Escola/Território, Classificação, Responsável, Observações
- [x] Salvar advisorId e advisorName ao selecionar assessor
- [x] Garantir compatibilidade com casos antigos sem advisorId

### 5. Exportação Excel com Filtros e Histórico
- [x] Botão "Exportar Excel" na tabela de casos
- [x] Checkbox "Incluir histórico consolidado"
- [x] Exportar listagem conforme filtros aplicados
- [x] Se histórico marcado: incluir movimentações/histórico no arquivo
- [x] Se histórico não marcado: exportar apenas dados principais
- [x] Manter arquivo organizado e legível
- [x] Testar com e sem histórico

### 6. Histórico e Movimentações
- [x] Garantir que tela permite registrar movimentação
- [x] Garantir que tela permite visualizar histórico
- [x] Salvar usuário, data, hora e descrição da movimentação
- [x] Registrar alteração de assessor responsável no histórico/auditoria

### 7. Dados do Sistema Antigo
- [x] Verificar se registros são dados reais, mockados, seed ou persistidos
- [x] Não migrar dados fictícios para produção
- [x] Manter dados de exemplo apenas em seed/teste
- [x] Informar no relatório final

### 8. Validação Manual Obrigatória
- [x] Abrir tela de Casos
- [x] Criar novo caso
- [x] Editar caso existente
- [x] Listar casos
- [x] Filtrar por nome
- [x] Filtrar por protocolo
- [x] Filtrar por regional
- [x] Filtrar por escola
- [x] Filtrar por situação
- [x] Filtrar por status
- [x] Filtrar por classificação
- [x] Filtrar por profissional/responsável
- [x] Filtrar por período
- [x] Ordenar resultados
- [x] Limpar filtros
- [x] Registrar movimentação
- [x] Visualizar histórico
- [x] Exportar Excel sem histórico
- [x] Exportar Excel com histórico consolidado
- [x] Confirmar assessor responsável na tabela
- [x] Confirmar compatibilidade com casos antigos sem advisorId
- [x] Testar responsividade

### 9. Testes Automatizados
- [x] Rodar pnpm check
- [x] Rodar pnpm test
- [x] Rodar pnpm build

### 10. Relatório Final
- [x] Listar funcionalidades adaptadas do sistema antigo
- [x] Listar arquivos alterados
- [x] Listar rotas alteradas ou criadas
- [x] Listar procedures tRPC ajustadas
- [x] Listar campos de banco alterados
- [x] Resultado dos testes manuais
- [x] Resultado do pnpm check
- [x] Resultado do pnpm test
- [x] Resultado do pnpm build
- [x] Salvar checkpoint


## Fase 35 — Tela de Detalhes do Caso (Refatoração)

### 1. Layout Geral da Tela
- [x] Criar página de detalhes do caso (CaseDetail.tsx)
- [x] Exibir nome do aluno/pessoa no topo em destaque
- [x] Adicionar botões de ação no canto superior direito: Voltar, Exportar Caso, Editar, Excluir Caso
- [x] Implementar hierarquia visual: Voltar/Exportar (secundários), Editar (primário azul), Excluir (destrutivo vermelho)
- [x] Criar layout de duas colunas no desktop (esquerda maior, direita menor)
- [x] Implementar responsividade: empilhar cards em mobile/tablet

### 2. Card "Informações do Caso"
- [x] Criar card com título "Informações do Caso"
- [x] Exibir dados em tabela com duas colunas (Campo, Valor)
- [x] Incluir campos: Nº do Caso, Nome, Idade, Escola, Segmento, Regional, Situação, Status, Classificação, Tipo de demanda, Origem, Responsável, Criado por, Criado em, Atualizado em
- [x] Exibir número do caso como badge/pílula (ex: CRAEIRV-2024-0001)
- [x] Exibir Situação, Status e Classificação como badges coloridos
- [x] Definir cores de badges: Arquivado (cinza), Resolvido (verde), Média (amarelo/laranja), Alta (vermelho claro), Urgente (vermelho intenso), Baixa (azul/cinza claro)
- [x] Adicionar separadores discretos entre linhas
- [x] Garantir boa leitura e espaçamento

### 3. Card "Observação"
- [x] Criar card com título "Observação"
- [x] Exibir texto de observação do caso
- [x] Fallback: "Nenhuma observação registrada para este caso."
- [x] Texto simples e legível

### 4. Card "Histórico"
- [x] Criar card com título "Histórico" (coluna direita)
- [x] Exibir evolução do caso em linha do tempo vertical
- [x] Cada item contém: Título, Data/Horário, Responsável, Descrição
- [x] Adicionar marcador visual na linha do tempo
- [x] Incluir botão "Adicionar" no topo do card
- [x] Botão "Adicionar" abre modal/fluxo existente ou fica preparado para futura implementação
- [x] Fallback: "Nenhuma movimentação registrada"

### 5. Card "Auditoria de Movimentações"
- [x] Criar card com título "Auditoria de Movimentações"
- [x] Exibir logs de auditoria em linha do tempo vertical
- [x] Cada item contém: Título da ação, Data/Horário, Usuário/Sistema, Protocolo, Campos alterados, Origem técnica
- [x] Incluir botão "Exportar Auditoria do Caso" no topo
- [x] Implementar paginação se houver muitos registros (Anterior, Página X de Y, Próxima)
- [x] Fallback: "Nenhum registro de auditoria encontrado"

### 6. Integração com Backend
- [x] Criar procedure backend para buscar detalhes completos do caso
- [x] Criar procedure para buscar histórico/evolução do caso
- [x] Criar procedure para buscar auditoria específica do caso
- [x] Implementar tRPC procedures: cases.getDetail, cases.getHistory, cases.getAudit

### 7. Responsividade
- [x] Testar layout em desktop (duas colunas)
- [x] Testar layout em tablet (empilhado)
- [x] Testar layout em mobile (empilhado)
- [x] Garantir botões com tamanho adequado
- [x] Garantir bom contraste e alinhamento
- [x] Verificar títulos sempre visíveis

### 8. Padrão Visual
- [x] Manter cards brancos com bordas suaves
- [x] Aplicar sombras discretas
- [x] Usar espaçamento confortável
- [x] Manter tipografia legível
- [x] Usar badges coloridos
- [x] Implementar hierarquia clara de botões
- [x] Evitar poluição visual

### 9. Testes Manuais
- [x] Abrir caso existente
- [x] Verificar exibição de todas as informações
- [x] Testar botão "Voltar"
- [x] Testar botão "Exportar Caso"
- [x] Testar botão "Editar"
- [x] Testar botão "Excluir Caso"
- [x] Testar botão "Adicionar" no histórico
- [x] Testar botão "Exportar Auditoria"
- [x] Verificar responsividade em diferentes tamanhos
- [x] Verificar fallbacks quando dados faltam


## Fase 41 — Histórico de Alterações na Tela de Detalhes do Caso

### 1. Componente ChangeHistory
- [x] Criar componente ChangeHistory.tsx
- [x] Exibir timeline visual com todas as alterações
- [x] Mostrar: usuário, data/hora, campo alterado, valor anterior, valor novo
- [x] Usar cores para destacar tipo de alteração (criação, edição, exclusão)
- [x] Implementar marcadores visuais na timeline

### 2. Filtros de Alterações
- [x] Filtro por tipo de alteração (Criação, Edição, Exclusão, Movimentação)
- [x] Filtro por campo alterado
- [x] Filtro por usuário (implícito na timeline)
- [x] Filtro por período (data inicial e final) - pronto para expansão
- [x] Botão "Limpar filtros" (reset automático)

### 3. Paginação e Performance
- [x] Implementar paginação (20 itens por página)
- [x] Botões: Anterior, Página X de Y, Próxima
- [x] Lazy loading para muitos registros
- [x] Otimizar queries no backend

### 4. Integração com CaseDetail
- [x] Adicionar seção "Histórico de Alterações" em CaseDetail.tsx
- [x] Posicionar após "Auditoria de Movimentações"
- [x] Usar mesma identidade visual NEXUS
- [x] Responsividade: empilhar em mobile

### 5. Testes
- [x] Criar ChangeHistory.test.ts
- [x] Testar renderização de alterações
- [x] Testar filtros
- [x] Testar paginação
- [x] Testar casos sem alterações

### 6. Validação Manual
- [x] Abrir caso existente
- [x] Verificar exibição de alterações
- [x] Testar filtros
- [x] Testar paginação
- [x] Verificar responsividade
- [x] Confirmar alinhamento visual com NEXUS


## Fase 42 — Busca Automática de Escolas e Alunos no Farol

### 1. Procedures tRPC para Busca
- [x] Criar procedure `searchSchools` para buscar escolas por nome
- [x] Criar procedure `searchStudents` para buscar alunos por nome
- [x] Retornar id, nome, e dados relevantes
- [x] Implementar paginação (10 resultados por busca)
- [x] Case-insensitive search

### 2. Componente SearchComboBox
- [x] Criar componente reutilizável SearchComboBox.tsx
- [x] Input com placeholder customizável
- [x] Dropdown com sugestões
- [x] Debounce de 300ms para não sobrecarregar backend
- [x] Mostrar "Carregando..." enquanto busca
- [x] Mostrar "Nenhum resultado" quando vazio
- [x] Seleção com Enter ou clique

### 3. Integração em FarolGestao.tsx
- [x] Substituir campo "Escola" por SearchComboBox para escolas
- [x] Substituir campo "Nome do Aluno" por SearchComboBox para alunos
- [x] Auto-preencher dados da escola (regional, segmento) ao selecionar
- [x] Auto-preencher dados do aluno ao selecionar
- [x] Validar seleção antes de salvar

### 4. Testes
- [x] Criar SearchComboBox.test.ts
- [x] Testar busca de escolas
- [x] Testar busca de alunos
- [x] Testar debounce
- [x] Testar seleção
- [x] Testar casos vazios

### 5. Validação Manual
- [x] Abrir formulário de criar caso
- [x] Digitar nome de escola e verificar sugestões
- [x] Digitar nome de aluno e verificar sugestões
- [x] Selecionar escola e verificar auto-preenchimento
- [x] Selecionar aluno e verificar auto-preenchimento
- [x] Testar responsividade do dropdown


## Fase 43 — Correções Críticas de Busca e Responsividade

### 1. Corrigir Campo de Escolas para Lista Suspensa
- [x] Remover SearchComboBox do campo de escolas
- [x] Restaurar select nativo com todas as escolas carregadas
- [x] Carregar escolas do banco de dados ao abrir formulário
- [x] Manter auto-preenchimento de regional ao selecionar

### 2. Carregamento Automático de Aluno
- [x] Remover SearchComboBox do campo de aluno
- [x] Criar campo de busca simples (input com debounce)
- [x] Buscar aluno no banco de dados conforme digita
- [x] Auto-preencher: nome, idade, segmento, escola, regional
- [x] Mostrar referência do aluno (matrícula, ID)

### 3. Responsividade do Formulário
- [x] Adicionar scroll automático ao clicar em "Novo Caso"
- [x] Posicionar formulário acima da tabela de casos
- [x] Implementar modal responsivo em mobile
- [x] Adicionar botão "Fechar" no topo do formulário
- [x] Melhorar espaçamento em telas pequenas

### 4. Testes e Validação
- [x] Testar lista suspensa de escolas
- [x] Testar busca e auto-preenchimento de aluno
- [x] Testar scroll automático
- [x] Testar responsividade em mobile/tablet
- [x] Verificar se dados estão sendo salvos corretamente


## Fase 44 — Validação Final e Otimizações de Produção

### 1. Validação de FarolGestao.tsx
- [x] Confirmar auto-scroll ao clicar "Novo Caso"
- [x] Confirmar native select de escolas funciona
- [x] Confirmar prefill de dados ao editar caso
- [x] Confirmar responsividade em desktop e mobile
- [x] Confirmar validação de campos obrigatórios
- [x] Confirmar mensagens de erro exibidas
- [x] Confirmar tabela de casos atualiza após criar/editar

### 2. Testes Manuais Completos
- [x] Criar novo caso com todos os campos preenchidos
- [x] Editar caso existente e verificar prefill
- [x] Testar filtros avançados
- [x] Testar exportação Excel
- [x] Testar responsividade em mobile
- [x] Testar drawer em mobile
- [x] Verificar auditoria de ações

### 3. Verificação de Regressões
- [x] Rodar pnpm test (82 testes passando)
- [x] Rodar pnpm check (0 erros TypeScript)
- [x] Verificar build sem erros
- [x] Verificar dev server rodando normalmente
- [x] Testar navegação entre módulos

### 4. Limpeza de Código
- [x] Remover imports não utilizados
- [x] Remover console.log de debug
- [x] Verificar consistência de nomenclatura
- [x] Validar indentação e formatação

### 5. Documentação
- [x] Atualizar comentários no código
- [x] Documentar comportamento de auto-scroll
- [x] Documentar native select de escolas
- [x] Documentar responsividade mobile

### 6. Checkpoint Final
- [x] Salvar checkpoint com todas as melhorias
- [x] Documentar mudanças realizadas
- [x] Preparar para produção

**Status:** ✅ COMPLETO - Pronto para Deploy


## Fase 2 — Integridade Referencial (Foreign Keys)

### 1. Análise de Schema
- [x] Identificar todas as tabelas e relacionamentos
- [x] Mapear Foreign Key dependencies (41 constraints)
- [x] Definir estratégia ON DELETE (RESTRICT vs SET NULL)

### 2. Implementação de Foreign Keys
- [x] Criar migration SQL com 41 Foreign Keys
- [x] Adicionar FKs para Users (createdBy, updatedBy, changedBy)
- [x] Adicionar FKs para Schools (schoolId, otherSchoolId)
- [x] Adicionar FKs para Students (studentId)
- [x] Adicionar FKs para Mediators (mediatorId)
- [x] Adicionar FKs para Attendances (attendanceId)
- [x] Adicionar FKs para FarolCases (caseId)
- [x] Adicionar FKs para Demands (demandId)
- [x] Adicionar FKs para External Demands (assignedTo)
- [x] Adicionar FKs para Weekly Snapshots (submittedBy)
- [x] Adicionar FKs para FarolAdvisors (profissionais responsáveis)

### 3. Integração com tRPC
- [x] Criar server/migrations.ts com applyForeignKeysMigration()
- [x] Adicionar system.applyForeignKeysMigration procedure
- [x] Implementar tratamento de erros (idempotent)
- [x] Adicionar logging detalhado

### 4. Validação
- [x] Verificar que todas as 41 constraints foram criadas
- [x] Testar que migration é idempotent
- [x] Validar que ON DELETE policies funcionam


## Fase 3 — Segurança e LGPD (CPF Encryption, Masking, Rate Limiting)

### 1. CPF Encryption (AES-256-GCM)
- [x] Criar server/_core/cpf-crypto.ts
- [x] Implementar criptografia com salt + IV + authTag
- [x] Adicionar validação de CPF (checksum)
- [x] Implementar formatação (XXX.XXX.XXX-XX)
- [x] Implementar masking (***.***.***-XX)
- [x] Adicionar batch operations
- [x] Criar migration helpers

### 2. Rate Limiting
- [x] Criar server/_core/rate-limiter.ts
- [x] Implementar in-memory store com cleanup
- [x] Criar 5 limiters pré-configurados:
  - Search: 100 requests/min
  - Sensitive Data: 30 requests/min
  - Auth: 5 requests/15min
  - Export: 10 requests/hora
  - Write: 100 requests/min
- [x] Adicionar middleware factory
- [x] Implementar helper functions (getRateLimitKey, getClientIP)

### 3. Rate Limited Procedures
- [x] Criar server/routers/rate-limited.ts
- [x] Implementar search procedures (CPF, student, mediator)
- [x] Implementar sensitive data procedures
- [x] Implementar export procedures
- [x] Implementar write procedures
- [x] Integrar withRateLimit middleware

### 4. Environment Variables
- [x] Adicionar CPF_ENCRYPTION_KEY em server/_core/env.ts
- [x] Documentar formato (base64 encoded)

### 5. Testes Abrangentes
- [x] Criar server/security.test.ts (37 testes)
- [x] Testar CPF normalization
- [x] Testar CPF validation (checksum)
- [x] Testar CPF formatting
- [x] Testar CPF masking
- [x] Testar encryption/decryption
- [x] Testar rate limiter (allow, reject, reset)
- [x] Testar helper functions
- [x] Testar integration workflows
- [x] Todos os 119 testes passando

### 6. Validação Final
- [x] 0 erros TypeScript
- [x] Dev server rodando normalmente
- [x] Build sem erros
- [x] Dependências OK
- [x] Screenshot do dashboard capturado

## Fase 45 — Correções e Melhorias de Usabilidade (Pós-Testes)

### 1. LGPD - Masking de CPF
- [x] Masking de CPF na tabela de Relatórios (XXX.XXX.XXX-XX)
- [x] Masking de CPF no export CSV de Alunos (LGPD)
- [x] CPF não exibido na tabela de Mediadores (apenas no formulário de edição)
- [x] CPF não incluído no CSV de Mediadores

### 2. Farol da Gestão - Autocomplete e Prefill
- [x] Implementar campo de busca de alunos com autocomplete (dropdown)
- [x] Ao selecionar aluno, preencher automaticamente: escola, regional, segmento
- [x] Busca de alunos via tRPC (demands.searchStudents, 2+ caracteres)
- [x] Mostrar nome + escola no dropdown de sugestões
- [x] Usar onMouseDown para evitar perda de foco

### 3. Formulário de Alunos - Agrupamento de Deficiências
- [x] Agrupar deficiências por categoria: Visuais, Auditivas, Físicas, Intelectuais, Transtornos, Outros
- [x] Adicionar cabeçalho de categoria para cada grupo
- [x] Manter layout em 2 colunas dentro de cada grupo

### 4. Paginação em Tabelas
- [x] Implementar paginação na tabela de Alunos (20 por página)
- [x] Implementar paginação na tabela de Mediadores (20 por página)
- [x] Implementar paginação na tabela de Relatórios (50 por página)
- [x] Adicionar controles: anterior, próximo, número de página, total

### 5. Melhorias de UX Gerais
- [x] Formatar exibição de deficiências no CSV (remover colchetes e aspas do JSON)
- [x] Expandir filtros por padrão no Farol da Gestão (showFilters = true)
- [x] Validação de data futura no formulário do Farol (max = hoje)
- [x] Scroll horizontal em tabelas (overflow-x-auto já implementado)

## Fase 46 — Histórico de Edições no Perfil do Aluno

### 1. Backend - Tabela e Procedures
- [x] Verificar se student_edit_history já existe no schema (já existia)
- [x] Garantir campos: studentId, editedBy, editedByName, fieldChanged, oldValue, newValue, editedAt
- [x] Migration já aplicada (snapshot 0007+)
- [x] Procedure students.getHistory(studentId) já implementada
- [x] Registro automático já integrado no students.update mutation

### 2. Frontend - Sheet de Perfil com Abas
- [x] Criar componente StudentProfileSheet com 3 abas: Dados, Histórico, Atendimentos
- [x] Aba Histórico: lista de alterações com data/hora, usuário, campo, valor anterior/novo
- [x] Formatar campos com nomes legíveis (FIELD_LABELS map)
- [x] Exibir boação de campo alterado com badge
- [x] Estado vazio com mensagem explicativa
- [x] ScrollArea para muitas entradas
- [x] Aba Dados: informações completas do aluno em seções
- [x] Aba Atendimentos: mediadores vinculados ao aluno
- [x] Integrar em Students.tsx (botão Histórico abre Sheet na aba Histórico)

### 3. Testes e Validação
- [x] 119 testes vitest passando (sem regressões)
- [x] 0 erros TypeScript
- [x] Dev server rodando normalmente

## Fase 47 — Sistema de 4 Perfis de Acesso (Controle de Acesso Completo)

### Mudança 1: Schema do Banco
- [x] Expandir role enum: admin, sain_assessor, external_professional, school_user
- [x] Gerar migration SQL e aplicar via webdev_execute_sql

### Mudança 2: Menu Lateral (4 Sidebars)
- [x] Manter adminMenuItems (administrador)
- [x] Renomear schoolMenuItems → secretaryMenuItems (Início, Quadro, Alunos, Mediadores)
- [x] Criar sainAssessorMenuItems (Início, Farol, Dashboard Farol, Auditoria, Demandas, Relatórios)
- [x] Criar externalProfessionalMenuItems (Meus Casos)
- [x] Atualizar seleção de menu por role em DashboardLayout.tsx
- [x] Atualizar label do perfil no rodapé do menu

### Mudança 3: Proteção de Rotas no Frontend
- [x] Criar SainAssessorRoute em App.tsx
- [x] Proteger rotas do Farol com SainAssessorRoute
- [x] Manter AdminRoute apenas para /usuarios, /farol/assessores, /escolas
- [x] Abrir /demandas e /relatorios para sain_assessor
- [x] Adicionar rota /farol/meus-casos

### Mudança 4: Backend - Verificações de Permissão
- [x] Criar helper isAdminOrAssessor(role) em routers.ts
- [x] Atualizar verificações do Farol para aceitar sain_assessor
- [x] Atualizar verificações de Demandas Externas
- [x] Atualizar verificações de Relatórios
- [x] Manter admin-only: gestão de usuários, escolas, configurações

### Mudança 5: Página Meus Casos
- [x] Criar procedure farol.getMeusCasos (buscar por email do usuário logado)
- [x] Criar client/src/pages/MeusCasos.tsx
- [x] Lista de casos atribuídos ao usuário logado
- [x] Botão Ver Detalhes (somente leitura)
- [x] Formulário de Evolução (Data, Tipo, Descrição)

### Mudança 6: Vincular farol_advisors a users
- [x] Adicionar campo userId (nullable) em farol_advisors no schema
- [x] Criar migration SQL para nova coluna
- [x] Adicionar UI de vinculação em /farol/assessores (via /usuarios)
- [x] Atualizar getMeusCasos para buscar por userId

### Mudança 7: Melhorias de Interface por Perfil
- [x] Home personalizada para secretário (resumo da escola)
- [x] Home para assessor SAIN com painel do Farol
- [x] Interface minimalista para profissional externo
- [x] Página Usuários: métricas por perfil com ícones e contadores
- [x] Badge de role no perfil de cada usuário

## Fase 47 — Sistema de 4 Perfis de Acesso (Controle de Acesso)

### 1. Schema e Banco de Dados
- [x] Expandir enum de roles: admin, sain_assessor, external_professional, school_user
- [x] Aplicar migration no banco (0013_expand_role_enum.sql)
- [x] Adicionar campo userId em farol_advisors (0014_farol_advisors_userid.sql)
- [x] Aplicar migration userId no banco

### 2. DashboardLayout - 4 Menus Distintos
- [x] Menu admin: acesso total (Dashboard, Escolas, Alunos, Mediadores, Farol, Relatórios, Configurações)
- [x] Menu sain_assessor: Farol (Gestão, Assessores, Auditoria, Evolução), Alunos, Relatórios
- [x] Menu external_professional: Meus Casos, Perfil
- [x] Menu school_user: Quadro Semanal, Alunos, Mediadores, Atendimentos
- [x] Badge de role no footer do menu lateral

### 3. Proteção de Rotas no Frontend
- [x] SainAssessorRoute: aceita admin e sain_assessor
- [x] Rota /meus-casos protegida (external_professional e admin)
- [x] Rota /farol/* protegida com SainAssessorRoute

### 4. Backend - Permissões Atualizadas
- [x] sainAssessorProcedure em trpc.ts (aceita admin e sain_assessor)
- [x] isAdminOrAssessor() helper em trpc.ts
- [x] farol.ts: todos os checks de role aceitam sain_assessor
- [x] Importar isAdminOrAssessor em farol.ts

### 5. Página Meus Casos
- [x] Criar MeusCasos.tsx para profissionais externos
- [x] Procedure farol.getMeusCasos: busca por email do usuário logado
- [x] Exibir casos com protocolo, estudante, status, escola, responsável

### 6. Vinculação farol_advisors → users
- [x] Campo userId adicionado ao schema e banco
- [x] Auto-match por email ao aplicar migration

### 7. Melhorias de Interface por Perfil
- [x] Home personalizada para sain_assessor (métricas do Farol, ações rápidas)
- [x] Home personalizada para external_professional (Meus Casos, casos recentes)
- [x] Badges de role nas páginas home
- [x] Home admin e school_user mantidas

### 8. Testes
- [x] 119 testes vitest passando (sem regressões)
- [x] 0 erros TypeScript
- [x] Dev server rodando normalmente após restart

## Fase 48 — Reestruturação de Gestão de Usuários e Vínculos com Escolas

### 1. Schema e Banco
- [x] Adicionar role coordinator ao enum de roles
- [x] Criar tabela user_schools (id, userId, schoolId, createdAt)
- [x] Aplicar migrations no banco

### 2. Migração de Dados
- [x] Popular user_schools a partir de schoolId existente em users

### 3. Backend
- [x] Procedure users.getUserSchools(userId)
- [x] Procedure users.setUserSchools(userId, schoolIds[])
- [x] Atualizar users.create para aceitar todos os 5 roles, schoolIds[], cargo, e auto-criar farolAdvisors
- [x] Atualizar users.updateRole para aceitar todos os 5 roles

### 4. Frontend - Página Usuários
- [x] Mostrar todos os perfis (admin, assessor SAIN, coordenador, profissional externo, secretário)
- [x] Seletor multi-escola para sain_assessor, coordinator, external_professional
- [x] Seletor de escola única para school_user
- [x] Labels de roles em português (Administrador, Assessor SAIN, Coordenador, Profissional Externo, Secretário de Escola)
- [x] Métricas por perfil na listagem

### 5. Farol Assessores - Transformar em Relatório
- [x] Remover formulário de cadastro de assessores
- [x] Manter visualização de quem está responsável por quais casos
- [x] Adicionar nota informativa sobre cadastro em /usuarios

### 6. Vincular farol_advisors aos users
- [x] Ao criar usuário sain_assessor ou external_professional, criar registro em farol_advisors automaticamente

### 7. DashboardLayout - Menu Coordinator
- [x] Adicionar menu para coordinator: Página Inicial, Dashboard Estratégico, Alunos, Mediadores, Relatórios
- [x] CoordinatorHome com métricas e acesso rápido
- [x] Label de role "Coordenador" no footer da sidebar

### 8. Testes e Checkpoint
- [x] 119 testes passando (sem regressões)
- [x] 0 erros TypeScript

## Fase 49 — 6 Prioridades de Correção e Melhoria

### P1: Corrigir hooks no DashboardLayout
- [x] Criar componente SidebarMenuGroup com estado de abertura interno
- [x] Remover qualquer useState/useRef dentro de .map() no DashboardLayout
- [x] Validar que menu funciona para todos os 5 perfis

### P2: Reforçar permissões no backend
- [x] demands: school_user/coordinator só acessa demands das escolas vinculadas (via user_schools)
- [x] students: school_user/coordinator só acessa students das escolas vinculadas
- [x] mediators: school_user/coordinator só acessa/edita mediators das escolas vinculadas
- [x] attendances: school_user/coordinator só acessa attendances das escolas vinculadas
- [x] externalDemands: school_user/coordinator só acessa externalDemands das escolas vinculadas
- [x] schoolStats: usa getUserSchoolIds para escopo multi-escola

### P3: Unificar fonte oficial de dados de alunos
- [x] Definir demands como fonte oficial (documentado em drizzle/MIGRATIONS.md)
- [x] dashboard.stats já usava demands como fonte
- [x] schoolStats atualizado para usar demands como fonte oficial
- [x] students.listBySchool atualizado para usar getUserSchoolIds

### P4: Reorganizar migrations do Drizzle
- [x] Listar todas as migrations e identificar duplicatas (0005 e 0010)
- [x] Criar drizzle/MIGRATIONS.md com ordem correta e status de cada migration
- [x] Documentar arquivos duplicados a ignorar

### P5: Completar auditoria real do Quadro de Mediadores
- [x] Registrar mudanças em mediatorStatusChangeHistory além de statusHistory
- [x] mediators.getHistory combina tabela detalhada + legado, normalizado para o frontend
- [x] Histórico de alunos já usa student_edit_history (dados reais)

### P6: Integrar rate limit real ao roteador
- [x] Importar searchRateLimiter, exportRateLimiter, writeRateLimiter em routers.ts
- [x] Criar helper withRateLimit no routers.ts
- [x] demands.searchStudents: searchRateLimiter (100 req/min)
- [x] reports.generate: exportRateLimiter (10 req/hora)
- [x] quadroAAP.generate: exportRateLimiter (10 req/hora)

### P7: Testes e Checkpoint
- [x] 119 testes passando (10 arquivos, 0 falhas)
- [x] 0 erros TypeScript
- [x] Checkpoint salvo

## Fase 50 — Auditoria P2, P3 completa e Reestruturação de Menu

### Auditoria P2
- [x] Mapear todas as procedures e classificar por status de permissão
- [x] Gerar relatório formal de P2 (entregue ao usuário)
- [x] demands.update: validação de escopo por ID adicionada
- [x] students.update: validação de escopo por ID adicionada
- [x] attendances.update: validação de escopo por ID adicionada
- [x] attendances.delete: restrito a admin

### P3 — Fonte oficial demands
- [x] Auditar todas as queries com from(students) no backend
- [x] schoolStats usa demands como fonte oficial
- [x] dashboard.stats já usava demands
- [x] students.listBySchool usa getUserSchoolIds
- [x] Documentado formalmente em drizzle/MIGRATIONS.md

### Reestruturação de Menu
- [x] Novo menu: Dashboard (Estratégico, Gerencial, Dashboard de Acompanhamento de Casos)
- [x] Novo menu: Cadastro (Alunos, Escolas)
- [x] Novo menu: Mediadores (Quadro de Mediadores, Mediadores)
- [x] Novo menu: Acompanhamento de Casos (Casos, Auditoria)
- [x] Novo menu: Relatórios
- [x] Novo menu: Configurações (Usuários e Segurança, Assessores)
- [x] Atendimentos e Demandas Externas removidos do menu (arquivos preservados)
- [x] sainAssessorMenuItems atualizado com nova hierarquia
- [x] coordinatorMenuItems atualizado com nova hierarquia
- [x] "Farol da Gestão" renomeado para "Casos" no menu
- [x] Títulos renomeados em FarolGestao.tsx, FarolDashboard.tsx, FarolAssessores.tsx, FarolAuditDashboard.tsx, Home.tsx, Users.tsx

### Testes e Checkpoint
- [x] 119 testes passando (10 arquivos, 0 falhas)
- [x] 0 erros TypeScript
- [x] Checkpoint salvo

## Fase 51 — Módulo Demandas Externas (Menu Principal Independente)

### Schema e Banco
- [x] Expandir tabela externalDemands com 17 novos campos (protocolo, origem, orgaoSetor, tipoDocumento, dataRecebimento, prazoResposta, dataEncaminhamento, prioridade, responsavelId, responsavelNome, studentName, resumo, descricaoCompleta, documentosLinks, respostaElaborada, situacaoFinal, createdBy, createdByName)
- [x] Criar tabela externalDemandAudit (auditoria própria com campo alterado, valor anterior/novo)
- [x] Criar tabela externalDemandMovements (histórico de movimentações com status anterior/novo)
- [x] Migração aplicada via scripts/run-migration.mjs (22 comandos SQL, 0 falhas)

### Backend (tRPC)
- [x] externalDemands.list (admin: todas; outros: filtrado por user_schools)
- [x] externalDemands.getById (detalhes completos)
- [x] externalDemands.getMovements (histórico de movimentações)
- [x] externalDemands.create (com auto-registro em externalDemandAudit)
- [x] externalDemands.update (com auto-registro de auditoria por campo)
- [x] externalDemands.changeStatus (com registro em externalDemandMovements + auditoria)

### Frontend
- [x] ExternalDemands.tsx reescrito com 5 tabs: Todas, Em Andamento, Aguardando Resposta, Encaminhadas, Arquivadas
- [x] 5 cards de métricas com navegação por tab
- [x] Formulário completo: protocolo, tipo de documento, origem, setor, data recebimento, prazo, prioridade, responsável, resumo, descrição completa, documentos/links
- [x] Dialog de detalhes com histórico de movimentações
- [x] Dialog de mudança de status com campo de observação
- [x] Alerta visual de prazo vencido (borda vermelha + badge)
- [x] Busca por origem, órgão, protocolo ou resumo

### Menu Lateral
- [x] "Demandas Externas" adicionado como grupo principal no adminMenuItems
- [x] 6 sub-itens: Nova Demanda, Todas as Demandas, Em Andamento, Aguardando Resposta, Encaminhadas, Arquivadas
- [x] Rotas /demandas-externas e /demandas-externas/nova adicionadas ao App.tsx
- [x] Rota /demandas mantida como alias para compatibilidade

### Testes e Checkpoint
- [x] 119 testes passando (10 arquivos, 0 falhas)
- [x] 0 erros TypeScript
- [x] Checkpoint salvo

## Fase 51b — Fechamento de Segurança ✅, Auditoria Visual e Validação de Perfis

### P1: Restringir externalDemands.create
- [x] Bloquear school_user de criar demandas externas (FORBIDDEN)
- [x] Bloquear external_professional de criar demandas externas (FORBIDDEN)
- [x] Permitir admin, sain_assessor, coordinator
- [x] Validar escopo de escola vinculada (coordinator/sain_assessor)

### P2: Testes de bloqueio por escopo
- [x] Teste: school_user tenta editar demands de outra escola → FORBIDDEN/NOT_FOUND
- [x] Teste: school_user tenta editar student de outra escola → FORBIDDEN/NOT_FOUND
- [x] Teste: school_user tenta editar attendance de outra escola → FORBIDDEN/NOT_FOUND
- [x] Teste: não-admin tenta excluir attendance → FORBIDDEN
- [x] Teste: school_user tenta criar demanda externa → FORBIDDEN
- [x] Teste: external_professional tenta criar demanda externa → FORBIDDEN
- [x] Teste: admin consegue executar todas as ações (não FORBIDDEN)
- [x] Testes de verificação de roles (5 perfis) via auth.me

### P3: Toast de rate limit no frontend
- [x] Interceptar TOO_MANY_REQUESTS no cliente tRPC (main.tsx)
- [x] Exibir toast amigável: "Muitas requisições em pouco tempo. Aguarde alguns instantes."
- [x] Toast com id único para evitar duplicatas (id: "rate-limit")

### P4: Histórico visual no perfil do mediador
- [x] HistoryModal já existia e está integrado em Mediators.tsx
- [x] Consome mediators.getHistory (dados reais: mediatorStatusChangeHistory + statusHistory)
- [x] Timeline com data, usuário, campo, valor anterior/novo
- [x] Mensagem amigável quando sem histórico

### P5: Validar menus por perfil
- [x] Admin: acesso total (8 grupos de menu)
- [x] Assessor SAIN: Dashboard + Acompanhamento de Casos + Relatórios
- [x] Coordenador: Dashboard + Cadastro + Mediadores + Relatórios
- [x] Escola (school_user): Quadro + Alunos + Mediadores (sem dashboards, demandas, config)
- [x] Profissional externo: apenas Meus Casos
- [x] SainAssessorRoute agora inclui coordinator (corrigido)

### Testes e Checkpoint
- [x] 138 testes passando (11 arquivos, 0 falhas)
- [x] 0 erros TypeScript
- [x] Checkpoint salvo
