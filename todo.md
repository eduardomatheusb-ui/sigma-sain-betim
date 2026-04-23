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
- [ ] Busca por nome de escola
- [ ] Filtro por status (ativa/inativa)
- [ ] Filtro por tipo de unidade (EM, CIM, etc.)
- [ ] Validação de duplicidade por nome e identificador
- [ ] Soft delete / inativação de escolas
- [ ] Mostrar contagem de alunos/mediadores/usuários por escola
- [ ] Melhorar espaçamento e layout

### Módulo de Alunos
- [ ] Organizar formulário em seções (dados, escolares, deficiência, atendimento, observações)
- [ ] Validação de duplicidade por nome + data de nascimento + escola
- [ ] Filtro por escola, turno, situação, deficiência, com/sem atendente
- [ ] Histórico de alterações do aluno
- [ ] Destacar status: com atendente / sem atendente / substituição / compartilhado

### Módulo de Mediadores
- [ ] Organizar formulário de cadastro
- [ ] Campos estruturados de situação (ativo, inativo, motivo, data, previsão retorno)
- [ ] Visualizar alunos vinculados e quantidade
- [ ] Filtro por nome, status, escola, quantidade de alunos
- [ ] Histórico de mudanças de situação e vínculos
- [ ] Indicador de sobrecarga (1, 2, 3+ alunos)

### Dashboard Gerencial
- [ ] Aperfeiçoar cards principais (alunos com/sem atendente, mediadores, demandas, substituições)
- [ ] Rankings: top 10 EMs/CIMs, escolas sem atendente, mediadores inativos
- [ ] Gráficos: deficiência, faixa etária, turno, situação, motivo inatividade, evolução, tipo unidade
- [ ] Filtros: período, escola, tipo unidade, turno, status atendimento, status mediador
- [ ] Alertas e prazos críticos
- [ ] Melhorar hierarquia tipográfica e visual

### Integração entre Módulos
- [ ] Escola mostra: total alunos, mediadores, demandas, sem atendente
- [ ] Aluno mostra: escola, mediador, situação, compartilhado
- [ ] Mediador mostra: escola(s), total alunos, situação, compartilhado
- [ ] Dashboard usa essas relações para indicadores consistentes

## Fase 11 — Melhorias do Quadro de Mediadores (PDF, Histórico, E-mail)

- [x] Exportar Quadro como PDF com logo, data, mediadores e alunos (jsPDF + jsPDF-autotable)
- [x] Histórico de alterações por aluno (procedure quadroAAP.getHistory)
- [x] Enviar Quadro por e-mail automaticamente após envio (procedure quadroAAP.sendByEmail)
- [x] Confirmação de recebimento via notifyOwner
