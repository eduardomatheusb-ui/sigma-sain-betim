# Roteiros de Teste — Homologação Assistida com Usuários Reais

**Fase 55.1 — Validação de Documentação e Usabilidade**

**Data:** 01 de maio de 2026  
**Versão:** 1.0

---

## Instruções Gerais

**Para todos os usuários:**
1. Leia o roteiro antes de começar
2. Siga as tarefas na ordem indicada
3. Registre qualquer dificuldade ou erro encontrado
4. Tire screenshots se algo não funcionar como esperado
5. Ao final, preencha o formulário de feedback
6. Tempo estimado: 30-45 minutos por perfil

---

## Roteiro 1: Administrador

**Tempo estimado:** 45 minutos  
**Objetivo:** Validar acesso completo a todos os módulos e permissões

### Tarefa 1: Acessar o Sistema
1. Abra o navegador
2. Acesse a URL: https://nexusbetim.manus.space
3. Clique em "Entrar com Manus"
4. Autentique-se com suas credenciais de administrador
5. Você deve ser redirecionado para a página inicial

**Resultado esperado:** ✅ Login bem-sucedido, página inicial carregada

### Tarefa 2: Validar Menu Completo
1. Verifique se o menu lateral mostra todos os itens:
   - Página Inicial
   - Dashboard (com 3 submenus)
   - Cadastro (com 2 submenus)
   - Mediadores (com 2 submenus)
   - Acompanhamento de Casos (com 2 submenus)
   - Demandas Externas
   - Relatórios
   - Configurações (com 2 submenus)

2. Clique em cada item para confirmar que abre corretamente

**Resultado esperado:** ✅ Todos os 8 grupos de menu visíveis e funcionando

### Tarefa 3: Acessar Usuários e Segurança
1. Clique em **Configurações** no menu
2. Clique em **Usuários e Segurança**
3. Você deve ver uma lista de usuários
4. Verifique se consegue visualizar: Nome, Email, Perfil, Status

**Resultado esperado:** ✅ Página de usuários carregada com dados visíveis

### Tarefa 4: Acessar Dashboards
1. Clique em **Dashboard** no menu
2. Clique em **Dashboard Estratégico**
3. Visualize os indicadores (Total de Alunos, Mediadores Ativos, etc.)
4. Volte e clique em **Dashboard Gerencial**
5. Visualize as métricas por escola e mediador
6. Volte e clique em **Dashboard de Acompanhamento de Casos**
7. Visualize os casos em andamento

**Resultado esperado:** ✅ Todos os 3 dashboards carregam com dados

### Tarefa 5: Acessar Demandas Externas
1. Clique em **Demandas Externas** no menu
2. Visualize as abas: Nova Demanda, Todas, Em Andamento, Aguardando Resposta, Encaminhadas
3. Clique em cada aba para confirmar que funcionam

**Resultado esperado:** ✅ Todas as abas de Demandas Externas funcionando

### Tarefa 6: Validar Cadastro
1. Clique em **Cadastro** no menu
2. Clique em **Alunos**
3. Você deve ver uma lista de alunos
4. Volte e clique em **Escolas**
5. Você deve ver uma lista de escolas

**Resultado esperado:** ✅ Cadastros de Alunos e Escolas carregando

### Tarefa 7: Validar Mediadores
1. Clique em **Mediadores** no menu
2. Clique em **Quadro de Mediadores**
3. Visualize a tabela com mediadores
4. Volte e clique em **Mediadores**
5. Visualize a lista de mediadores

**Resultado esperado:** ✅ Quadro e lista de mediadores funcionando

### Tarefa 8: Validar Permissões Gerais
1. Verifique se consegue acessar todas as áreas sem erro "Acesso Negado"
2. Se receber erro de permissão, anote qual área
3. Confirme que não há mensagens de erro não esperadas

**Resultado esperado:** ✅ Acesso completo a todos os módulos

---

## Roteiro 2: Assessor SAIN

**Tempo estimado:** 30 minutos  
**Objetivo:** Validar fluxo de acompanhamento de casos e demandas externas

### Tarefa 1: Acessar o Sistema
1. Abra o navegador
2. Acesse a URL: https://nexusbetim.manus.space
3. Clique em "Entrar com Manus"
4. Autentique-se com suas credenciais de Assessor SAIN
5. Você deve ser redirecionado para a página inicial

**Resultado esperado:** ✅ Login bem-sucedido

### Tarefa 2: Acessar Acompanhamento de Casos
1. Clique em **Acompanhamento de Casos** no menu
2. Clique em **Casos**
3. Visualize a lista de casos
4. Clique em um caso para ver detalhes
5. Verifique se consegue adicionar comentário

**Resultado esperado:** ✅ Casos carregam e detalhes visíveis

### Tarefa 3: Acessar Demandas Externas
1. Clique em **Demandas Externas** no menu
2. Visualize as abas disponíveis
3. Verifique se consegue ver demandas existentes

**Resultado esperado:** ✅ Demandas Externas acessível

### Tarefa 4: Criar Demanda Externa de Teste
1. Clique em **Demandas Externas** → **Nova Demanda**
2. Preencha os campos:
   - Órgão: "Teste"
   - Prioridade: "Média"
   - Prazo: Data de hoje + 7 dias
   - Resumo: "Demanda de teste para homologação"
3. Clique em **Salvar**
4. Verifique se protocolo foi gerado e exibido em toast

**Resultado esperado:** ✅ Demanda criada com protocolo gerado

### Tarefa 5: Alterar Status de Demanda
1. Clique na demanda que acabou de criar
2. Altere o status para "Em Andamento"
3. Clique em **Salvar**
4. Verifique se status foi atualizado

**Resultado esperado:** ✅ Status alterado com sucesso

---

## Roteiro 3: Coordenador

**Tempo estimado:** 30 minutos  
**Objetivo:** Validar acesso a dashboards, cadastros e mediadores

### Tarefa 1: Acessar o Sistema
1. Abra o navegador
2. Acesse a URL: https://nexusbetim.manus.space
3. Clique em "Entrar com Manus"
4. Autentique-se com suas credenciais de Coordenador
5. Você deve ser redirecionado para a página inicial

**Resultado esperado:** ✅ Login bem-sucedido

### Tarefa 2: Acessar Dashboard Permitido
1. Clique em **Dashboard** no menu
2. Verifique se consegue acessar **Dashboard Estratégico**
3. Verifique se consegue acessar **Dashboard Gerencial**
4. Verifique se consegue acessar **Dashboard de Acompanhamento de Casos** (se autorizado)

**Resultado esperado:** ✅ Dashboards permitidos acessíveis

### Tarefa 3: Acessar Cadastro
1. Clique em **Cadastro** no menu
2. Clique em **Alunos**
3. Visualize a lista de alunos
4. Volte e clique em **Escolas**
5. Visualize a lista de escolas

**Resultado esperado:** ✅ Cadastros acessíveis

### Tarefa 4: Acessar Mediadores
1. Clique em **Mediadores** no menu
2. Clique em **Quadro de Mediadores**
3. Visualize a tabela
4. Volte e clique em **Mediadores**
5. Visualize a lista

**Resultado esperado:** ✅ Mediadores acessíveis

### Tarefa 5: Validar Bloqueios
1. Tente acessar **Configurações** (deve estar bloqueado ou vazio)
2. Verifique se consegue acessar **Demandas Externas** (se autorizado)
3. Anote qualquer acesso negado ou inesperado

**Resultado esperado:** ✅ Bloqueios funcionando corretamente

---

## Roteiro 4: Escola (Secretário)

**Tempo estimado:** 25 minutos  
**Objetivo:** Validar acesso restrito e isolamento de dados

### Tarefa 1: Acessar o Sistema
1. Abra o navegador
2. Acesse a URL: https://nexusbetim.manus.space
3. Clique em "Entrar com Manus"
4. Autentique-se com suas credenciais de Escola
5. Você deve ser redirecionado para a página inicial

**Resultado esperado:** ✅ Login bem-sucedido

### Tarefa 2: Acessar Quadro de Mediadores
1. Clique em **Mediadores** no menu
2. Clique em **Quadro de Mediadores**
3. Visualize a tabela com mediadores da sua escola
4. Verifique se consegue exportar em CSV

**Resultado esperado:** ✅ Quadro de Mediadores da própria escola visível

### Tarefa 3: Acessar Cadastro de Alunos
1. Clique em **Cadastro** no menu
2. Clique em **Alunos**
3. Visualize alunos da sua escola
4. Verifique se consegue editar um aluno
5. Verifique se consegue adicionar novo aluno

**Resultado esperado:** ✅ Alunos da própria escola visíveis e editáveis

### Tarefa 4: Tentar Acessar Áreas Bloqueadas
1. Tente clicar em **Demandas Externas** (deve estar bloqueado ou não aparecer)
2. Tente clicar em **Configurações** (deve estar bloqueado ou não aparecer)
3. Tente clicar em **Dashboard** (deve estar bloqueado ou não aparecer)
4. Anote o que acontece em cada tentativa

**Resultado esperado:** ✅ Áreas bloqueadas não acessíveis

### Tarefa 5: Validar Isolamento de Dados
1. Verifique se consegue visualizar apenas dados da sua escola
2. Tente editar um aluno de outra escola (se conseguir acessar)
3. Anote se consegue ou não editar dados de outras escolas

**Resultado esperado:** ✅ Dados isolados por escola

---

## Roteiro 5: Profissional Externo

**Tempo estimado:** 15 minutos  
**Objetivo:** Validar acesso restrito a "Meus Casos"

### Tarefa 1: Acessar o Sistema
1. Abra o navegador
2. Acesse a URL: https://nexusbetim.manus.space
3. Clique em "Entrar com Manus"
4. Autentique-se com suas credenciais de Profissional Externo
5. Você deve ser redirecionado para a página inicial

**Resultado esperado:** ✅ Login bem-sucedido

### Tarefa 2: Acessar Meus Casos
1. Clique em **Acompanhamento de Casos** no menu
2. Clique em **Meus Casos**
3. Visualize os casos atribuídos a você
4. Clique em um caso para ver detalhes

**Resultado esperado:** ✅ Meus Casos acessível e com dados

### Tarefa 3: Validar Bloqueios
1. Tente acessar **Demandas Externas** (deve estar bloqueado)
2. Tente acessar **Configurações** (deve estar bloqueado)
3. Tente acessar **Dashboard** (deve estar bloqueado)
4. Tente acessar **Cadastro** (deve estar bloqueado)
5. Anote se consegue ou não acessar

**Resultado esperado:** ✅ Acesso restrito apenas a Meus Casos

---

## Checklist de Validação

Após completar o roteiro, verifique:

- [ ] Conseguiu fazer login sem dificuldade
- [ ] Menu está claro e fácil de navegar
- [ ] Encontrou as funções que precisava
- [ ] Nenhuma tela ficou confusa
- [ ] Nenhuma mensagem de erro inesperada
- [ ] Documentação ajudou no entendimento
- [ ] Permissões estão corretas para seu perfil
- [ ] Dados estão corretos (se aplicável)
- [ ] Velocidade do sistema é aceitável
- [ ] Pronto para preencher formulário de feedback

---

**Próximo passo:** Preencha o formulário de feedback com suas observações.

**Obrigado pela participação na homologação!**

---

**Última atualização:** 01 de maio de 2026
