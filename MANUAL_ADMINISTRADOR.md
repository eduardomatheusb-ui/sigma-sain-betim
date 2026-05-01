# Manual do Administrador — NEXUS

**Plataforma de Gestão e Articulação da Rede de Inclusão**

**Versão:** 1.0  
**Data:** 01 de maio de 2026  
**Público:** Administradores do Sistema  
**Status:** Pronto para Uso Inicial Assistido

---

## Índice

1. [Introdução](#introdução)
2. [Acesso ao Sistema](#acesso-ao-sistema)
3. [Visão Geral da Interface](#visão-geral-da-interface)
4. [Dashboard Estratégico](#dashboard-estratégico)
5. [Dashboard Gerencial](#dashboard-gerencial)
6. [Cadastro de Alunos](#cadastro-de-alunos)
7. [Cadastro de Escolas](#cadastro-de-escolas)
8. [Gestão de Mediadores](#gestão-de-mediadores)
9. [Quadro de Mediadores](#quadro-de-mediadores)
10. [Acompanhamento de Casos](#acompanhamento-de-casos)
11. [Relatórios](#relatórios)
12. [Configurações](#configurações)
13. [Troubleshooting](#troubleshooting)

---

## Introdução

O NEXUS é uma plataforma de gestão integrada para coordenar ações de inclusão educacional, mediação de conflitos e acompanhamento de alunos em risco. Como administrador, você tem acesso completo a todos os módulos e funcionalidades do sistema.

**Responsabilidades principais:**
- Gerenciar usuários e permissões
- Manter cadastro de escolas e alunos
- Acompanhar mediadores e seus vínculos
- Gerar relatórios consolidados
- Monitorar segurança e performance do sistema

---

## Acesso ao Sistema

### Login

1. Acesse a URL do NEXUS no navegador
2. Clique em "Entrar com Manus"
3. Autentique-se com suas credenciais Manus
4. Você será redirecionado para a página inicial

### Logout

1. Clique no ícone de usuário no canto inferior esquerdo
2. Selecione "Sair"
3. Você será desconectado e redirecionado para a página de login

### Recuperação de Senha

Se esqueceu sua senha, acesse o portal de autenticação Manus e utilize a opção "Esqueci minha senha".

---

## Visão Geral da Interface

A interface do NEXUS é organizada em um menu lateral com os seguintes grupos principais:

| Grupo | Descrição | Acesso |
|-------|-----------|--------|
| **Página Inicial** | Visão geral do sistema com KPIs | Público |
| **Dashboard** | Painéis estratégicos e gerenciais | Admin, Assessor, Coordenador |
| **Cadastro** | Alunos e Escolas | Admin, Coordenador |
| **Mediadores** | Quadro e gestão de mediadores | Admin, Coordenador, Escola |
| **Acompanhamento de Casos** | Casos e auditoria | Admin, Assessor |
| **Relatórios** | Exportação de dados | Admin, Assessor, Coordenador |
| **Configurações** | Usuários, Segurança, Assessores | Admin |

### Menu Lateral

O menu lateral esquerdo permite navegar entre os diferentes módulos. Clique no ícone de menu (≡) para expandir/recolher o menu em dispositivos móveis.

---

## Dashboard Estratégico

O Dashboard Estratégico fornece uma visão consolidada de indicadores-chave de desempenho (KPIs) do sistema.

### Indicadores Principais

| Indicador | Descrição | Atualização |
|-----------|-----------|-------------|
| **Total de Alunos** | Quantidade total de alunos cadastrados | Tempo real |
| **Mediadores Ativos** | Quantidade de mediadores em atividade | Tempo real |
| **Escolas Atualizadas** | Escolas com dados atualizados | Semanal |
| **Escolas Pendentes** | Escolas com dados desatualizados | Semanal |
| **Atendimentos Pendentes** | Casos aguardando ação | Tempo real |
| **Vagas em Aberto** | Posições de mediador não preenchidas | Tempo real |

### Gráficos e Análises

O dashboard inclui gráficos de distribuição por deficiência, turno, e ranking de escolas por cobertura de atendimento.

**Para exportar dados do dashboard:**
1. Clique no botão "Exportar" (se disponível)
2. Selecione o formato (CSV, Excel)
3. O arquivo será baixado automaticamente

---

## Dashboard Gerencial

O Dashboard Gerencial oferece visão detalhada para gerentes de coordenação, incluindo métricas de desempenho por escola e mediador.

### Seções Principais

**Métricas por Escola:** Visualize o desempenho de cada escola em relação a metas de cobertura e atendimento.

**Mediadores por Status:** Acompanhe quantos mediadores estão ativos, em licença, ou desligados.

**Tendências Temporais:** Gráficos de evolução de indicadores ao longo do tempo.

---

## Cadastro de Alunos

### Adicionar Novo Aluno

1. Acesse **Cadastro → Alunos**
2. Clique no botão "+ Novo Aluno"
3. Preencha os campos obrigatórios:
   - **Nome:** Nome completo do aluno
   - **Matrícula:** Número de matrícula na escola
   - **Escola:** Selecione a escola (autocomplete)
   - **Série/Turma:** Série e turma do aluno
   - **Deficiência:** Tipo de deficiência (se aplicável)
   - **Turno:** Período (matutino, vespertino, noturno)

4. Clique em "Salvar"

### Editar Aluno

1. Acesse **Cadastro → Alunos**
2. Localize o aluno na lista
3. Clique no ícone de edição (lápis)
4. Altere os campos desejados
5. Clique em "Salvar"

### Excluir Aluno

1. Acesse **Cadastro → Alunos**
2. Localize o aluno na lista
3. Clique no ícone de exclusão (lixo)
4. Confirme a exclusão

**Nota:** A exclusão é permanente e não pode ser desfeita. Use com cuidado.

---

## Cadastro de Escolas

### Adicionar Nova Escola

1. Acesse **Cadastro → Escolas**
2. Clique no botão "+ Nova Escola"
3. Preencha os campos obrigatórios:
   - **Nome:** Nome da escola
   - **INEP:** Código INEP (se disponível)
   - **Endereço:** Endereço completo
   - **Telefone:** Telefone de contato
   - **Email:** Email institucional
   - **Regional:** Regional de educação

4. Clique em "Salvar"

### Editar Escola

1. Acesse **Cadastro → Escolas**
2. Clique no nome da escola
3. Altere os campos desejados
4. Clique em "Salvar"

---

## Gestão de Mediadores

### Adicionar Mediador

1. Acesse **Mediadores → Mediadores**
2. Clique em "+ Novo Mediador"
3. Preencha os dados:
   - **Nome:** Nome completo
   - **CPF:** CPF (único no sistema)
   - **Escola:** Escola de vinculação
   - **Status:** Ativo, Inativo, Licença, etc.
   - **Data de Admissão:** Data de início

4. Clique em "Salvar"

### Alterar Status de Mediador

1. Acesse **Mediadores → Mediadores**
2. Localize o mediador
3. Clique no menu de ações (⋯)
4. Selecione "Alterar Status"
5. Escolha o novo status
6. Clique em "Confirmar"

**Statuses disponíveis:**
- **Ativo:** Mediador em atividade
- **Inativo:** Mediador não ativo
- **Licença Médica:** Afastado por motivo de saúde
- **Afastamento Temporário:** Ausência temporária
- **Desligado:** Mediador desligado da rede
- **Substituído:** Posição ocupada por outro mediador
- **Vaga em Aberto:** Posição não preenchida

---

## Quadro de Mediadores

O Quadro de Mediadores oferece visão consolidada de todos os mediadores e seus vínculos com alunos e escolas.

### Visualizar Quadro

1. Acesse **Mediadores → Quadro de Mediadores**
2. Selecione filtros (escola, status, período)
3. Visualize a tabela com informações de cada mediador

### Exportar Quadro

1. Clique no botão "Exportar CSV"
2. O arquivo será baixado automaticamente

### Registrar Alterações

Ao alterar status de mediadores, o sistema registra automaticamente:
- Data da alteração
- Usuário que realizou a alteração
- Tipo de alteração
- Motivo (se aplicável)

---

## Acompanhamento de Casos

### Criar Novo Caso

1. Acesse **Acompanhamento de Casos → Casos**
2. Clique em "+ Novo Caso"
3. Preencha os dados:
   - **Aluno:** Selecione o aluno (autocomplete)
   - **Tipo de Caso:** Conflito, Inclusão, Atendimento, etc.
   - **Descrição:** Descrição detalhada do caso
   - **Prioridade:** Baixa, Média, Alta, Urgente
   - **Responsável:** Assessor ou mediador responsável

4. Clique em "Salvar"

### Acompanhar Caso

1. Acesse **Acompanhamento de Casos → Casos**
2. Clique no caso desejado
3. Visualize histórico de movimentações
4. Adicione comentários ou atualizações
5. Altere o status conforme necessário

### Auditoria de Casos

1. Acesse **Acompanhamento de Casos → Auditoria**
2. Visualize histórico completo de todas as alterações
3. Filtre por data, usuário, ou tipo de alteração

---

## Relatórios

### Gerar Relatório

1. Acesse **Relatórios**
2. Selecione o tipo de relatório desejado
3. Configure filtros (período, escola, mediador, etc.)
4. Clique em "Gerar"
5. Selecione o formato (CSV, Excel, PDF)
6. O arquivo será baixado

### Tipos de Relatórios Disponíveis

| Tipo | Descrição | Frequência |
|------|-----------|-----------|
| **Cobertura de Atendimento** | Alunos com/sem mediador | Semanal |
| **Status de Mediadores** | Distribuição por status | Diária |
| **Casos Abertos** | Casos em andamento | Tempo real |
| **Histórico de Alterações** | Auditoria de mudanças | Sob demanda |

---

## Configurações

### Gerenciar Usuários

1. Acesse **Configurações → Usuários e Segurança**
2. Visualize lista de usuários
3. Clique em um usuário para editar
4. Altere dados ou permissões
5. Clique em "Salvar"

### Criar Novo Usuário

1. Acesse **Configurações → Usuários e Segurança**
2. Clique em "+ Novo Usuário"
3. Preencha:
   - **Email:** Email institucional
   - **Nome:** Nome completo
   - **Perfil:** Admin, Assessor, Coordenador, Escola, Externo
   - **Escola:** (se aplicável)

4. Clique em "Enviar Convite"

### Gerenciar Assessores

1. Acesse **Configurações → Assessores**
2. Visualize lista de assessores
3. Adicione ou remova assessores conforme necessário

---

## Troubleshooting

### Problema: Não consigo fazer login

**Solução:**
1. Verifique se está usando o email correto
2. Clique em "Esqueci minha senha" para resetar
3. Verifique se sua conta está ativa (contate suporte)

### Problema: Não consigo visualizar dados de uma escola

**Solução:**
1. Verifique se você tem permissão de admin
2. Verifique se a escola está cadastrada
3. Recarregue a página (F5)

### Problema: Erro ao salvar aluno

**Solução:**
1. Verifique se todos os campos obrigatórios foram preenchidos
2. Verifique se a matrícula já existe
3. Verifique se a escola selecionada está ativa

### Problema: Relatório não gera

**Solução:**
1. Verifique se selecionou filtros válidos
2. Tente novamente em alguns minutos
3. Contate suporte se o problema persistir

---

## Contato e Suporte

**Email de Suporte:** suporte@nexus.betim.gov.br  
**Telefone:** (31) 3334-XXXX  
**Horário:** Segunda a sexta, 8h às 17h  
**SLA:** Resposta em até 2 horas para problemas críticos

---

**Última atualização:** 01 de maio de 2026  
**Próxima revisão:** 01 de junho de 2026
