# ✅ Checklist Final de Deploy — SIGMA SAIN BETIM

**Versão:** 1.0  
**Data:** 2026-05-06  
**Status:** ✅ Pronto para Deploy  

---

## 🎯 Objetivo

Este checklist garante que você seguirá **todos os passos na ordem correta** para fazer deploy do SIGMA no Netlify **sem perder dados, funcionalidades ou configurações**.

**Tempo estimado:** 45-60 minutos  
**Dificuldade:** Baixa (passo a passo)  
**Risco:** Mínimo (dados estão seguros em TiDB Cloud)

---

## 📋 FASE 1: PREPARAÇÃO LOCAL (15 minutos)

### 1.1 Baixar/Clonar Projeto

- [ ] Acessei https://manus.im
- [ ] Fui para "Projetos" → "sigma-sain-betim"
- [ ] Cliquei em "Histórico de Versões"
- [ ] Selecionei versão `4402a637`
- [ ] Cliquei em "Baixar como ZIP" ou "Visualizar"

**OU**

- [ ] Clonei do GitHub: `git clone https://github.com/eduardomatheusb-ui/sigma-sain-betim.git`
- [ ] Entrei no diretório: `cd sigma-sain-betim`

### 1.2 Verificar Arquivos

- [ ] Arquivo `package.json` existe
- [ ] Arquivo `netlify.toml` existe
- [ ] Arquivo `drizzle/schema.ts` existe
- [ ] Arquivo `server/_core/index.ts` existe
- [ ] Arquivo `client/src/App.tsx` existe
- [ ] Arquivo `GUIA_OPERACIONAL_DEPLOY.md` existe
- [ ] Arquivo `VARIAVEIS_AMBIENTE.md` existe
- [ ] Arquivo `BANCO_DADOS_PRESERVACAO.md` existe
- [ ] Arquivo `OAUTH_E_DEPENDENCIAS_MANUS.md` existe

### 1.3 Instalar Dependências

```bash
pnpm install
```

- [ ] Comando completou sem erros
- [ ] Pasta `node_modules` foi criada
- [ ] Arquivo `pnpm-lock.yaml` existe

### 1.4 Verificar Build Local

```bash
pnpm build
```

- [ ] Build completou sem erros
- [ ] Pasta `dist` foi criada
- [ ] Arquivo `dist/public/index.html` existe
- [ ] Arquivo `dist/index.js` existe

### 1.5 Verificar Testes

```bash
pnpm test
```

- [ ] Todos os 147 testes passaram
- [ ] Nenhum erro de TypeScript
- [ ] Nenhum aviso crítico

---

## 📋 FASE 2: GITHUB (10 minutos)

### 2.1 Verificar Repositório

```bash
git remote -v
```

- [ ] Remoto `user_github` existe
- [ ] URL aponta para `https://github.com/eduardomatheusb-ui/sigma-sain-betim.git`

### 2.2 Verificar Status

```bash
git status
```

- [ ] Branch é `main`
- [ ] Está atualizado com `origin/main`

### 2.3 Fazer Push (Se Necessário)

```bash
git add .
git commit -m "Preparar para deploy no Netlify"
git push user_github main
```

- [ ] Push completou sem erros
- [ ] Código está no GitHub

### 2.4 Verificar no GitHub

1. Acesse https://github.com/eduardomatheusb-ui/sigma-sain-betim
2. Verifique se:
   - [ ] Branch `main` existe
   - [ ] Último commit é recente
   - [ ] Todos os arquivos estão lá

---

## 📋 FASE 3: NETLIFY SETUP (10 minutos)

### 3.1 Criar Conta Netlify

1. Acesse https://netlify.com
2. Clique em "Sign up"
3. Escolha "GitHub" como opção de login

- [ ] Conta Netlify criada
- [ ] Logado no Netlify

### 3.2 Conectar Repositório

1. Clique em "Add new site"
2. Selecione "Import an existing project"
3. Escolha "GitHub" como provedor
4. Autorize Netlify a acessar seus repositórios
5. Selecione `sigma-sain-betim`

- [ ] Repositório conectado
- [ ] Netlify pode acessar código

### 3.3 Verificar Build Settings

Netlify deve detectar automaticamente:

- [ ] Build command: `pnpm build`
- [ ] Publish directory: `dist/public`
- [ ] Functions directory: `dist`
- [ ] Node version: `22.13.0` (ou compatível)

Se não detectar, configure manualmente:

1. Vá para "Settings" → "Build & deploy"
2. Clique em "Edit settings"
3. Configure:
   - Build command: `pnpm build`
   - Publish directory: `dist/public`
   - Functions directory: `dist`

- [ ] Build settings configurados corretamente

---

## 📋 FASE 4: VARIÁVEIS DE AMBIENTE (15 minutos)

### 4.1 Preparar Valores

Antes de adicionar no Netlify, prepare todos os valores:

**Obrigatórias (11):**

- [ ] `DATABASE_URL` = `mysql://betim_user:senha@gateway05.us-east-1.prod.aws.tidbcloud.com:4000/sigma_db`
- [ ] `VITE_APP_ID` = `app_sigma_betim_prod` (copiar do Manus Dashboard)
- [ ] `OAUTH_SERVER_URL` = `https://api.manus.im`
- [ ] `VITE_OAUTH_PORTAL_URL` = `https://portal.manus.im`
- [ ] `JWT_SECRET` = (gerar novo: 32+ caracteres aleatórios)
- [ ] `OWNER_OPEN_ID` = (copiar do seu perfil Manus)
- [ ] `OWNER_NAME` = (seu nome completo)
- [ ] `BUILT_IN_FORGE_API_URL` = `https://api.manus.im/forge`
- [ ] `BUILT_IN_FORGE_API_KEY` = (copiar do Manus Dashboard → API Keys)
- [ ] `VITE_FRONTEND_FORGE_API_URL` = `https://api.manus.im/forge`
- [ ] `VITE_FRONTEND_FORGE_API_KEY` = (copiar do Manus Dashboard → API Keys)

**Opcionais (5):**

- [ ] `NODE_ENV` = `production` (Netlify define automaticamente)
- [ ] `VITE_APP_TITLE` = `SIGMA SAIN BETIM` (opcional)
- [ ] `VITE_APP_LOGO` = (URL do logo, opcional)
- [ ] `VITE_ANALYTICS_ENDPOINT` = (opcional)
- [ ] `VITE_ANALYTICS_WEBSITE_ID` = (opcional)

### 4.2 Adicionar no Netlify

1. Acesse seu site no Netlify
2. Vá para "Settings" → "Environment variables"
3. Para cada variável:
   - Clique em "Add a variable"
   - Preencha "Key" (nome da variável)
   - Preencha "Value" (valor)
   - Clique em "Save"

- [ ] `DATABASE_URL` adicionada
- [ ] `VITE_APP_ID` adicionada
- [ ] `OAUTH_SERVER_URL` adicionada
- [ ] `VITE_OAUTH_PORTAL_URL` adicionada
- [ ] `JWT_SECRET` adicionada
- [ ] `OWNER_OPEN_ID` adicionada
- [ ] `OWNER_NAME` adicionada
- [ ] `BUILT_IN_FORGE_API_URL` adicionada
- [ ] `BUILT_IN_FORGE_API_KEY` adicionada
- [ ] `VITE_FRONTEND_FORGE_API_URL` adicionada
- [ ] `VITE_FRONTEND_FORGE_API_KEY` adicionada

### 4.3 Verificar Variáveis

1. Vá para "Settings" → "Environment variables"
2. Verifique se todas as 11 variáveis obrigatórias estão lá

- [ ] Todas as 11 variáveis obrigatórias estão configuradas
- [ ] Nenhuma variável tem valor vazio

---

## 📋 FASE 5: BANCO DE DADOS (5 minutos)

### 5.1 Verificar Conexão

```bash
# Localmente, testar conexão
mysql -h gateway05.us-east-1.prod.aws.tidbcloud.com \
  -u betim_user -p -e "SELECT COUNT(*) FROM sigma_db.students;"
```

- [ ] Conexão funcionou
- [ ] Retornou número de alunos (1.125+)

### 5.2 Fazer Backup

1. Acesse https://tidbcloud.com
2. Vá para seu cluster
3. Clique em "Backup"
4. Clique em "Create Backup"
5. Aguarde conclusão

- [ ] Backup foi criado
- [ ] Backup foi concluído com sucesso

### 5.3 Verificar Dados

```bash
mysql -h seu-host -u seu-user -p seu-db -e "
SELECT 
  'students' as table_name, COUNT(*) as count FROM students
UNION
SELECT 'schools', COUNT(*) FROM schools
UNION
SELECT 'mediators', COUNT(*) FROM mediators
UNION
SELECT 'attendances', COUNT(*) FROM attendances
UNION
SELECT 'external_demands', COUNT(*) FROM external_demands;
"
```

- [ ] 1.125+ alunos
- [ ] 95+ escolas
- [ ] 280+ mediadores
- [ ] 5.000+ atendimentos
- [ ] 200+ demandas externas

---

## 📋 FASE 6: OAUTH MANUS (5 minutos)

### 6.1 Obter URL do Netlify

Após fazer deploy, você terá uma URL como:

```
https://sigma-sain-betim.netlify.app
```

- [ ] URL do Netlify obtida

### 6.2 Registrar no Manus

1. Acesse https://manus.im
2. Vá para "Configurações" → "Apps"
3. Selecione seu app (SIGMA)
4. Em "Redirect URLs", adicione:
   ```
   https://sigma-sain-betim.netlify.app/api/oauth/callback
   ```
5. Clique em "Salvar"

- [ ] URL registrada no Manus
- [ ] Salvo com sucesso

---

## 📋 FASE 7: DEPLOY (10 minutos)

### 7.1 Fazer Deploy

**Opção 1: Automático (Recomendado)**

```bash
git push origin main
```

Netlify detectará o push e iniciará build automaticamente.

**Opção 2: Manual**

1. Acesse seu site no Netlify
2. Vá para "Deploys"
3. Clique em "Trigger deploy" → "Deploy site"

- [ ] Deploy iniciado
- [ ] Build começou

### 7.2 Aguardar Build

1. Vá para "Deploys"
2. Aguarde o build completar (5-10 minutos)
3. Verifique status:
   - [ ] Build bem-sucedido (verde ✅)
   - [ ] Nenhum erro
   - [ ] Deploy ativo

### 7.3 Obter URL Final

1. Vá para "Deploys"
2. Clique no deploy bem-sucedido
3. Copie a URL (ex: `https://sigma-sain-betim.netlify.app`)

- [ ] URL final obtida

---

## 📋 FASE 8: TESTES PÓS-DEPLOY (15 minutos)

### 8.1 Testar Carregamento

1. Acesse `https://seu-site.netlify.app`
2. Aguarde página carregar

- [ ] Página carregou sem erros
- [ ] Nenhuma mensagem de erro no console

### 8.2 Testar Login OAuth

1. Clique em "Entrar com Manus"
2. Você será redirecionado para `https://portal.manus.im`
3. Faça login com suas credenciais Manus
4. Você será redirecionado de volta para o site

- [ ] Redirecionamento para Manus funcionou
- [ ] Login no Manus funcionou
- [ ] Redirecionamento de volta funcionou
- [ ] Usuário logado ✅

### 8.3 Testar Login por Senha

1. Clique em "Entrar com Email"
2. Preencha email e senha
3. Clique em "Entrar"

- [ ] Formulário aceitou dados
- [ ] Login funcionou
- [ ] Usuário logado ✅

### 8.4 Testar Dashboard

1. Acesse "Dashboard" ou página inicial
2. Verifique se dados carregam:
   - [ ] Número de alunos (1.125+)
   - [ ] Número de escolas (95+)
   - [ ] Número de mediadores (280+)
   - [ ] Gráficos carregam

### 8.5 Testar Acompanhamento de Casos

1. Vá para "Acompanhamento de Casos"
2. Clique em "Novo Caso"
3. Preencha formulário:
   - [ ] Selecione escola
   - [ ] Busque aluno (deve filtrar por escola)
   - [ ] Preencha outros campos
   - [ ] Clique em "Salvar"

- [ ] Caso foi criado
- [ ] Dados foram salvos no banco

### 8.6 Testar Demandas Externas

1. Vá para "Demandas Externas"
2. Clique em "Nova Demanda"
3. Preencha formulário:
   - [ ] Selecione escola
   - [ ] Busque aluno (deve filtrar por escola)
   - [ ] Preencha outros campos
   - [ ] Clique em "Salvar"

- [ ] Demanda foi criada
- [ ] Dados foram salvos no banco

### 8.7 Testar Exportação

1. Vá para "Quadro Farol" ou "Acompanhamento"
2. Clique em "Exportar para Excel"
3. Arquivo deve fazer download

- [ ] Download funcionou
- [ ] Arquivo é um Excel válido
- [ ] Dados estão corretos

### 8.8 Testar Relatórios

1. Vá para "Relatórios"
2. Selecione filtros (escola, período, etc.)
3. Clique em "Gerar Relatório"

- [ ] Relatório foi gerado
- [ ] Gráficos carregam
- [ ] Dados estão corretos

### 8.9 Testar Permissões (Admin)

1. Faça login como admin
2. Vá para "Usuários"
3. Verifique se lista de usuários carrega

- [ ] Lista carregou
- [ ] Dados estão corretos

### 8.10 Testar Painel de Permissões (Admin)

1. Vá para "Permissões"
2. Selecione um perfil (ex: `craei_assessor`)
3. Verifique matriz de permissões

- [ ] Matriz carregou
- [ ] Checkboxes funcionam
- [ ] Pode salvar permissões

---

## 📋 FASE 9: VALIDAÇÃO FINAL (5 minutos)

### 9.1 Verificar Dados Preservados

```bash
# Conectar ao banco
mysql -h seu-host -u seu-user -p seu-db

# Contar registros
SELECT COUNT(*) FROM students;      # Deve ser 1.125+
SELECT COUNT(*) FROM schools;       # Deve ser 95+
SELECT COUNT(*) FROM mediators;     # Deve ser 280+
SELECT COUNT(*) FROM attendances;   # Deve ser 5.000+
```

- [ ] 1.125+ alunos preservados
- [ ] 95+ escolas preservadas
- [ ] 280+ mediadores preservados
- [ ] 5.000+ atendimentos preservados

### 9.2 Verificar Funcionalidades

- [ ] Login funciona (OAuth + Senha)
- [ ] Dashboard carrega dados
- [ ] Busca de alunos funciona (dependente de escola)
- [ ] Criação de casos funciona
- [ ] Criação de demandas funciona
- [ ] Exportação para Excel funciona
- [ ] Relatórios funcionam
- [ ] Permissões funcionam
- [ ] Nenhuma tela está quebrada
- [ ] Nenhuma mensagem de erro

### 9.3 Verificar Performance

1. Abra DevTools (F12)
2. Vá para "Network"
3. Recarregue página
4. Verifique:

- [ ] Tempo de carregamento < 5 segundos
- [ ] Nenhum erro 404 ou 500
- [ ] Todos os assets carregaram
- [ ] API responde rápido

### 9.4 Verificar Logs

1. Vá para "Settings" → "Logs"
2. Verifique se há erros:

- [ ] Nenhum erro crítico
- [ ] Nenhum aviso importante
- [ ] Logs estão limpos

---

## 📋 FASE 10: DOCUMENTAÇÃO (5 minutos)

### 10.1 Documentar URL Final

- [ ] URL do site: `https://seu-site.netlify.app`
- [ ] URL do repositório: `https://github.com/eduardomatheusb-ui/sigma-sain-betim`
- [ ] URL do Manus: `https://manus.im`
- [ ] URL do TiDB Cloud: `https://tidbcloud.com`

### 10.2 Documentar Credenciais

Armazene em local seguro (não em Git):

- [ ] `DATABASE_URL` documentada
- [ ] `VITE_APP_ID` documentada
- [ ] `JWT_SECRET` documentada
- [ ] Credenciais de admin documentadas

### 10.3 Documentar Procedimentos

- [ ] Como fazer deploy (git push)
- [ ] Como fazer backup do banco
- [ ] Como restaurar de backup
- [ ] Como adicionar novo usuário
- [ ] Como resetar senha

---

## ✅ FASE 11: CONCLUSÃO

### 11.1 Verificar Tudo

- [ ] Todas as 10 fases completadas
- [ ] Todos os testes passaram
- [ ] Nenhum erro ou aviso
- [ ] Dados foram preservados
- [ ] Funcionalidades funcionam
- [ ] Performance está boa

### 11.2 Comunicar Sucesso

- [ ] Notificar stakeholders
- [ ] Documentar URL final
- [ ] Fornecer credenciais de teste
- [ ] Fornecer guias de uso

### 11.3 Monitoramento Contínuo

- [ ] Verificar logs regularmente
- [ ] Monitorar performance
- [ ] Fazer backup semanal
- [ ] Atualizar documentação

---

## 🎉 PARABÉNS!

Você completou o deploy do SIGMA no Netlify com sucesso! 🚀

**O que foi alcançado:**
- ✅ Código em produção
- ✅ Banco de dados preservado (1.125+ alunos, 95+ escolas, 280+ mediadores)
- ✅ Autenticação funcionando (OAuth + Senha)
- ✅ Dashboards e relatórios funcionando
- ✅ Todas as funcionalidades operacionais
- ✅ Performance otimizada
- ✅ Dados seguros em backup

**Próximos passos:**
1. Comunicar URL final aos usuários
2. Fornecer credenciais de teste
3. Treinar usuários no novo ambiente
4. Monitorar logs e performance
5. Fazer backup regular

---

## 📞 Suporte Rápido

| Problema | Solução |
|----------|---------|
| Build falha | Rodar `pnpm build` localmente e verificar erros |
| Banco não conecta | Verificar `DATABASE_URL` e credenciais |
| OAuth não funciona | Registrar URL do Netlify no Manus |
| Dados não aparecem | Verificar se banco tem dados, rodar migrations |
| Permissões não funcionam | Verificar painel de permissões (admin) |
| Performance lenta | Verificar logs, otimizar queries |

---

**Versão:** 1.0  
**Data:** 2026-05-06  
**Status:** ✅ Pronto para Deploy
