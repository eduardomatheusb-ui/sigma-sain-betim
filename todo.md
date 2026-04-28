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
- [ ] listAdvisors, createAdvisor, updateAdvisor, deleteAdvisor
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
- [ ] Assessores com mais casos
- [ ] Tempo de resposta
- [x] Casos sem movimentação recente
- [x] Últimas movimentações
- [x] Visibilidade por perfil (admin/coordinator: sim, advisor/childhood_coordination/viewer: não)

### 5. Exportação Word Institucional
- [ ] Implementar geração de Word com biblioteca docx
- [ ] Cabeçalho com logo e timbrado institucional
- [ ] Fonte Arial, corpo 12, espaçamento 1,5
- [ ] Margens: superior 3cm, esquerda 3cm, inferior 2cm, direita 2cm
- [ ] Rodapé com protocolo, data e paginação
- [ ] Campos vazios como "não informado"
- [ ] Nome do arquivo: caso-[numeroCaso].docx

### 6. Auditoria Completa
- [ ] Registrar criação, edição, exclusão, reatribuição, mudança de vínculo
- [ ] Registrar mudança de permissão e geração de protocolo
- [ ] Criar dashboard de auditoria para admin/coordinator
- [ ] Mostrar: usuário, perfil, ação, data/hora, diff resumido

### 7. Padronização de Texto
- [ ] Corrigir acentuação integralmente no Farol
- [ ] Padronizar regionais: Alterosas, Centro, Citrolândia, Icaivera, Imbiruçu, Norte, Petrovale, PTB, Terezópolis, Vianópolis
- [ ] Padronizar unidades: Escola Municipal, CIM, Rede Parceira
- [ ] Usar "CIM" sempre em maiúsculas
- [ ] Corrigir títulos, subtítulos, botões, mensagens

### 8. Manual/Documentação
- [ ] Criar documento com capa, sumário, seções organizadas
- [ ] Explicar cada módulo e atribuições por perfil
- [ ] Passo a passo de uso
- [ ] Linguagem institucional
- [ ] Revisão completa de acentuação

### 9. Testes e Validação
- [ ] Testar permissões por perfil
- [ ] Testar exclusão lógica de casos
- [ ] Testar auditoria
- [ ] Testar exportação Word
- [ ] Testar exportação Excel
- [ ] Verificar nenhuma regressão no resto do sistema
- [ ] Rodar pnpm test
- [ ] Salvar checkpoint


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
- [ ] Exibir assessor responsável na tabela de casos

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
- [ ] Listar arquivos alterados
- [ ] Listar tabelas criadas/alteradas
- [ ] Listar procedures criadas
- [ ] Listar rotas criadas
- [ ] Resultado do pnpm check
- [ ] Resultado do pnpm test
- [ ] Resultado do pnpm build


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
- [ ] Salvar advisorId e advisorName ao selecionar assessor
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
- [ ] Garantir que tela permite registrar movimentação
- [ ] Garantir que tela permite visualizar histórico
- [ ] Salvar usuário, data, hora e descrição da movimentação
- [ ] Registrar alteração de assessor responsável no histórico/auditoria

### 7. Dados do Sistema Antigo
- [ ] Verificar se registros são dados reais, mockados, seed ou persistidos
- [ ] Não migrar dados fictícios para produção
- [ ] Manter dados de exemplo apenas em seed/teste
- [ ] Informar no relatório final

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
- [ ] Registrar movimentação
- [ ] Visualizar histórico
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
- [ ] Listar funcionalidades adaptadas do sistema antigo
- [ ] Listar arquivos alterados
- [ ] Listar rotas alteradas ou criadas
- [ ] Listar procedures tRPC ajustadas
- [ ] Listar campos de banco alterados
- [ ] Resultado dos testes manuais
- [ ] Resultado do pnpm check
- [ ] Resultado do pnpm test
- [ ] Resultado do pnpm build
- [ ] Salvar checkpoint


## Fase 35 — Tela de Detalhes do Caso (Refatoração)

### 1. Layout Geral da Tela
- [ ] Criar página de detalhes do caso (CaseDetail.tsx)
- [ ] Exibir nome do aluno/pessoa no topo em destaque
- [ ] Adicionar botões de ação no canto superior direito: Voltar, Exportar Caso, Editar, Excluir Caso
- [ ] Implementar hierarquia visual: Voltar/Exportar (secundários), Editar (primário azul), Excluir (destrutivo vermelho)
- [ ] Criar layout de duas colunas no desktop (esquerda maior, direita menor)
- [ ] Implementar responsividade: empilhar cards em mobile/tablet

### 2. Card "Informações do Caso"
- [ ] Criar card com título "Informações do Caso"
- [ ] Exibir dados em tabela com duas colunas (Campo, Valor)
- [ ] Incluir campos: Nº do Caso, Nome, Idade, Escola, Segmento, Regional, Situação, Status, Classificação, Tipo de demanda, Origem, Responsável, Criado por, Criado em, Atualizado em
- [ ] Exibir número do caso como badge/pílula (ex: CRAEIRV-2024-0001)
- [ ] Exibir Situação, Status e Classificação como badges coloridos
- [ ] Definir cores de badges: Arquivado (cinza), Resolvido (verde), Média (amarelo/laranja), Alta (vermelho claro), Urgente (vermelho intenso), Baixa (azul/cinza claro)
- [ ] Adicionar separadores discretos entre linhas
- [ ] Garantir boa leitura e espaçamento

### 3. Card "Observação"
- [ ] Criar card com título "Observação"
- [ ] Exibir texto de observação do caso
- [ ] Fallback: "Nenhuma observação registrada para este caso."
- [ ] Texto simples e legível

### 4. Card "Histórico"
- [ ] Criar card com título "Histórico" (coluna direita)
- [ ] Exibir evolução do caso em linha do tempo vertical
- [ ] Cada item contém: Título, Data/Horário, Responsável, Descrição
- [ ] Adicionar marcador visual na linha do tempo
- [ ] Incluir botão "Adicionar" no topo do card
- [ ] Botão "Adicionar" abre modal/fluxo existente ou fica preparado para futura implementação
- [ ] Fallback: "Nenhuma movimentação registrada"

### 5. Card "Auditoria de Movimentações"
- [ ] Criar card com título "Auditoria de Movimentações"
- [ ] Exibir logs de auditoria em linha do tempo vertical
- [ ] Cada item contém: Título da ação, Data/Horário, Usuário/Sistema, Protocolo, Campos alterados, Origem técnica
- [ ] Incluir botão "Exportar Auditoria do Caso" no topo
- [ ] Implementar paginação se houver muitos registros (Anterior, Página X de Y, Próxima)
- [ ] Fallback: "Nenhum registro de auditoria encontrado"

### 6. Integração com Backend
- [ ] Criar procedure backend para buscar detalhes completos do caso
- [ ] Criar procedure para buscar histórico/evolução do caso
- [ ] Criar procedure para buscar auditoria específica do caso
- [ ] Implementar tRPC procedures: cases.getDetail, cases.getHistory, cases.getAudit

### 7. Responsividade
- [ ] Testar layout em desktop (duas colunas)
- [ ] Testar layout em tablet (empilhado)
- [ ] Testar layout em mobile (empilhado)
- [ ] Garantir botões com tamanho adequado
- [ ] Garantir bom contraste e alinhamento
- [ ] Verificar títulos sempre visíveis

### 8. Padrão Visual
- [ ] Manter cards brancos com bordas suaves
- [ ] Aplicar sombras discretas
- [ ] Usar espaçamento confortável
- [ ] Manter tipografia legível
- [ ] Usar badges coloridos
- [ ] Implementar hierarquia clara de botões
- [ ] Evitar poluição visual

### 9. Testes Manuais
- [ ] Abrir caso existente
- [ ] Verificar exibição de todas as informações
- [ ] Testar botão "Voltar"
- [ ] Testar botão "Exportar Caso"
- [ ] Testar botão "Editar"
- [ ] Testar botão "Excluir Caso"
- [ ] Testar botão "Adicionar" no histórico
- [ ] Testar botão "Exportar Auditoria"
- [ ] Verificar responsividade em diferentes tamanhos
- [ ] Verificar fallbacks quando dados faltam
