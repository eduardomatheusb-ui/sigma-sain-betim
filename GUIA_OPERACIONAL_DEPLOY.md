# 🚀 GUIA OPERACIONAL DE DEPLOY — SIGMA SAIN BETIM

**Versão:** 1.0  
**Data:** 2026-05-06  
**Status:** ✅ Pronto para produção  

---

## 📋 ÍNDICE

1. [Como Acessar o Projeto](#1-como-acessar-o-projeto)
2. [Repositório GitHub](#2-repositório-github)
3. [Variáveis de Ambiente](#3-variáveis-de-ambiente-completas)
4. [Banco de Dados](#4-preservação-do-banco-de-dados)
5. [Autenticação OAuth](#5-autenticação-oauth-manus)
6. [Checklist de Deploy](#6-checklist-final-de-deploy)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Como Acessar o Projeto

### Opção A: Via Manus WebDev (Recomendado)

O projeto está salvo como checkpoint no Manus:

```
Checkpoint ID: manus-webdev://4402a637
```

**Como acessar:**

1. Acesse o painel Manus em https://manus.im
2. Vá para "Projetos" → "sigma-sain-betim"
3. Clique em "Histórico de Versões"
4. Selecione a versão `4402a637`
5. Clique em "Visualizar" ou "Baixar como ZIP"

**Arquivos inclusos:**
- ✅ Código completo (frontend + backend)
- ✅ Configurações (vite.config.ts, tsconfig.json)
- ✅ Banco de dados (schema.ts, migrations)
- ✅ Documentação (README, DEPLOY_NETLIFY.md)
- ✅ netlify.toml (pronto para deploy)

### Opção B: Baixar ZIP Direto

```bash
# Via Manus CLI (se disponível)
manus download project sigma-sain-betim --version 4402a637

# Ou baixe manualmente do painel Manus
```

### Opção C: Git Clone (Se repositório GitHub está sincronizado)

```bash
git clone https://github.com/seu-usuario/sigma-sain-betim.git
cd sigma-sain-betim
git checkout main
```

---

## 2. Repositório GitHub

### Verificar se Repositório Existe

```bash
# Verificar se o projeto está em um repositório GitHub
git remote -v

# Se houver output, o repositório já existe
# Se não houver, você precisa criar um novo
```

### Criar Novo Repositório GitHub

**Passo 1: Criar repositório no GitHub**

1. Acesse https://github.com/new
2. Nome: `sigma-sain-betim`
3. Descrição: "Sistema de Gestão de Mediadores e Atendimentos - Secretaria de Educação de Betim"
4. Privado (recomendado)
5. Clique em "Create repository"

**Passo 2: Conectar repositório local ao GitHub**

```bash
# Navegar até o diretório do projeto
cd sigma-sain-betim

# Adicionar repositório remoto
git remote add origin https://github.com/seu-usuario/sigma-sain-betim.git

# Verificar conexão
git remote -v

# Fazer push inicial
git branch -M main
git push -u origin main
```

**Passo 3: Verificar se tudo foi sincronizado**

```bash
# Verificar status
git status

# Deve retornar: "On branch main, nothing to commit"
```

### Se Repositório Já Existe

```bash
# Apenas fazer push das mudanças
git add .
git commit -m "Preparar para deploy no Netlify - Checkpoint 4402a637"
git push origin main
```

---

## 3. Variáveis de Ambiente Completas

### Tabela de Variáveis

| Variável | Finalidade | Exemplo | Obrigatória | Onde Encontrar |
|----------|-----------|---------|-------------|----------------|
| `DATABASE_URL` | Conexão com banco de dados | `mysql://user:pass@host:4000/sigma` | ✅ SIM | TiDB Cloud Console |
| `VITE_APP_ID` | ID da aplicação Manus OAuth | `app_abc123xyz` | ✅ SIM | Manus Dashboard → Apps |
| `OAUTH_SERVER_URL` | URL do servidor OAuth | `https://api.manus.im` | ✅ SIM | Padrão Manus |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login | `https://portal.manus.im` | ✅ SIM | Padrão Manus |
| `JWT_SECRET` | Chave secreta para JWT | `seu_jwt_secret_aleatorio_muito_longo` | ✅ SIM | Gere um valor aleatório |
| `OWNER_OPEN_ID` | OpenID do proprietário | `DnS8TPgCSmASUzjSWX74qf` | ✅ SIM | Seu perfil Manus |
| `OWNER_NAME` | Nome do proprietário | `Eduardo Matheus Brito Almeida` | ✅ SIM | Seu perfil Manus |
| `BUILT_IN_FORGE_API_URL` | URL da API Manus | `https://api.manus.im/forge` | ✅ SIM | Padrão Manus |
| `BUILT_IN_FORGE_API_KEY` | Chave da API Manus (servidor) | `key_server_abc123` | ✅ SIM | Manus Dashboard → API Keys |
| `VITE_FRONTEND_FORGE_API_URL` | URL da API para frontend | `https://api.manus.im/forge` | ✅ SIM | Padrão Manus |
| `VITE_FRONTEND_FORGE_API_KEY` | Chave da API para frontend | `key_frontend_abc123` | ✅ SIM | Manus Dashboard → API Keys |
| `VITE_ANALYTICS_ENDPOINT` | Endpoint de analytics (opcional) | `https://analytics.manus.im` | ❌ NÃO | Manus Analytics |
| `VITE_ANALYTICS_WEBSITE_ID` | ID do website para analytics | `website_123` | ❌ NÃO | Manus Analytics |
| `VITE_APP_TITLE` | Título da aplicação | `SIGMA SAIN BETIM` | ❌ NÃO | Qualquer valor |
| `VITE_APP_LOGO` | URL do logo | `https://seu-logo.png` | ❌ NÃO | URL pública da imagem |
| `NODE_ENV` | Ambiente | `production` | ✅ SIM | Padrão Netlify |

### Como Configurar no Netlify

1. Acesse o site no Netlify
2. Vá para **Settings** → **Environment variables**
3. Clique em **Add a variable**
4. Preencha cada variável da tabela acima
5. Clique em **Save**

**Exemplo de configuração:**

```
DATABASE_URL = mysql://betim_user:senha123@gateway05.us-east-1.prod.aws.tidbcloud.com:4000/sigma_db
VITE_APP_ID = app_sigma_betim_prod
OAUTH_SERVER_URL = https://api.manus.im
JWT_SECRET = aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uVwXyZ
...
```

---

## 4. Preservação do Banco de Dados

### Onde Está o Banco Atualmente

**Hospedagem:** TiDB Cloud (MySQL compatível)  
**Localização:** `gateway05.us-east-1.prod.aws.tidbcloud.com:4000`  
**Dados:** 1.125+ alunos, 95+ escolas, 280+ mediadores, 15+ tabelas

### Será Mantido Após Deploy?

✅ **SIM, 100% será mantido.**

O banco de dados está **fora do Netlify** (em TiDB Cloud), então:
- Não é afetado pelo deploy
- Dados persistem indefinidamente
- Você pode fazer deploy quantas vezes quiser

### Migração do Banco (Se necessário)

Se você quiser mudar o banco de dados:

**Passo 1: Fazer backup do banco atual**

```bash
# Via MySQL CLI
mysqldump -h gateway05.us-east-1.prod.aws.tidbcloud.com \
  -u betim_user -p sigma_db > backup_sigma_2026_05_06.sql

# Ou via TiDB Cloud Console:
# 1. Acesse TiDB Cloud
# 2. Vá para seu cluster
# 3. Clique em "Backup"
# 4. Clique em "Create Backup"
```

**Passo 2: Criar novo banco (se necessário)**

```bash
# Criar novo cluster no TiDB Cloud
# Ou usar outro MySQL/MariaDB

# Executar migrations no novo banco
pnpm db:push
```

**Passo 3: Importar dados (se necessário)**

```bash
# Restaurar backup
mysql -h novo-host -u user -p sigma_db < backup_sigma_2026_05_06.sql
```

**Passo 4: Atualizar DATABASE_URL no Netlify**

```
DATABASE_URL = mysql://novo_user:nova_senha@novo-host:4000/sigma_db
```

### Restaurar Dados em Caso de Problema

**Opção 1: Restaurar do backup**

```bash
mysql -h seu-host -u user -p sigma_db < backup_sigma_2026_05_06.sql
```

**Opção 2: Usar snapshot do TiDB Cloud**

1. Acesse TiDB Cloud Console
2. Vá para seu cluster
3. Clique em "Restore"
4. Selecione o snapshot desejado
5. Clique em "Restore"

**Opção 3: Rollback via Manus**

Se o projeto foi quebrado:

1. Acesse Manus → Projetos → sigma-sain-betim
2. Vá para "Histórico de Versões"
3. Selecione versão anterior
4. Clique em "Rollback"

---

## 5. Autenticação OAuth Manus

### Continuará Funcionando no Netlify?

✅ **SIM, 100% funcionará.**

O OAuth do Manus funciona via **redirecionamentos HTTP**, não depende de onde o frontend está hospedado.

**Fluxo:**

```
1. Usuário clica "Entrar com Manus"
2. Redireciona para https://portal.manus.im (Manus)
3. Usuário faz login no Manus
4. Manus redireciona de volta para seu site no Netlify
5. Seu site cria sessão JWT
6. Usuário logado ✅
```

### Configuração Necessária

Você precisa registrar o URL do Netlify no Manus:

1. Acesse Manus Dashboard
2. Vá para Apps → seu app
3. Em "Redirect URLs", adicione:
   - `https://seu-site.netlify.app/api/oauth/callback`
   - `https://seu-dominio-customizado.com/api/oauth/callback` (se tiver)
4. Salve

### Alternativa: Login por Senha

O sistema também suporta login por email + senha:

- Não depende do Manus
- Funciona em qualquer lugar
- Senhas são hasheadas com bcrypt

---

## 6. Checklist Final de Deploy

### ✅ Pré-Deploy (Faça Agora)

- [ ] Baixar ou clonar o projeto (Opção A, B ou C acima)
- [ ] Verificar se `package.json` existe
- [ ] Verificar se `netlify.toml` existe
- [ ] Verificar se `DEPLOY_NETLIFY.md` existe
- [ ] Rodar `pnpm install` localmente
- [ ] Rodar `pnpm build` (deve completar sem erros)
- [ ] Rodar `pnpm test` (deve passar 147/147 testes)

### ✅ GitHub (Faça Agora)

- [ ] Criar repositório no GitHub (se não existir)
- [ ] Fazer `git remote add origin` (se novo)
- [ ] Fazer `git push -u origin main`
- [ ] Verificar se código está no GitHub

### ✅ Netlify (Faça Agora)

- [ ] Criar conta no Netlify (https://netlify.com)
- [ ] Clicar em "Add new site" → "Import an existing project"
- [ ] Selecionar GitHub como provedor
- [ ] Autorizar Netlify a acessar seus repositórios
- [ ] Selecionar `sigma-sain-betim`
- [ ] Verificar build settings:
  - Build command: `pnpm build`
  - Publish directory: `dist/public`
  - Functions directory: `dist`

### ✅ Variáveis de Ambiente (Faça Agora)

- [ ] Ir para Netlify → Settings → Environment variables
- [ ] Adicionar todas as 16 variáveis da tabela acima
- [ ] Verificar se `DATABASE_URL` está correto
- [ ] Verificar se `VITE_APP_ID` está correto
- [ ] Verificar se `JWT_SECRET` é um valor aleatório forte

### ✅ Banco de Dados (Faça Agora)

- [ ] Verificar se banco está acessível
- [ ] Fazer backup do banco atual
- [ ] Testar conexão: `mysql -h seu-host -u user -p`
- [ ] Verificar se todas as tabelas existem

### ✅ Manus OAuth (Faça Agora)

- [ ] Registrar URL do Netlify no Manus
  - `https://seu-site.netlify.app/api/oauth/callback`
- [ ] Verificar se `VITE_APP_ID` está correto
- [ ] Verificar se `OAUTH_SERVER_URL` é `https://api.manus.im`

### ✅ Deploy (Faça Agora)

- [ ] Fazer push final: `git push origin main`
- [ ] Netlify inicia build automaticamente
- [ ] Aguardar build completar (5-10 minutos)
- [ ] Verificar se build foi bem-sucedido
- [ ] Acessar site em `https://seu-site.netlify.app`

### ✅ Testes Pós-Deploy (Faça Agora)

- [ ] Testar login via OAuth Manus
- [ ] Testar login via email + senha
- [ ] Acessar Dashboard
- [ ] Verificar se métricas carregam (1.125 alunos, 95 escolas, etc.)
- [ ] Acessar "Acompanhamento de Casos"
- [ ] Criar um novo caso
- [ ] Testar busca de aluno (dependente de escola)
- [ ] Acessar "Demandas Externas"
- [ ] Criar uma nova demanda
- [ ] Testar exportação para Excel
- [ ] Acessar "Relatórios"
- [ ] Verificar se gráficos carregam
- [ ] Acessar "Usuários" (admin)
- [ ] Verificar se lista de usuários carrega
- [ ] Acessar "Permissões" (admin)
- [ ] Verificar se matriz de permissões carrega

### ✅ Validação Final (Faça Agora)

- [ ] Todos os dados foram preservados (1.125 alunos, etc.)
- [ ] Nenhuma funcionalidade foi perdida
- [ ] Nenhuma tela está quebrada
- [ ] Todos os formulários salvam corretamente
- [ ] Todos os dashboards carregam dados
- [ ] Autenticação funciona
- [ ] Permissões funcionam
- [ ] Exportações funcionam

---

## 7. Troubleshooting

### Erro: "Build failed"

**Solução:**

```bash
# Verificar erros localmente
pnpm build

# Se tiver erro, verificar:
npx tsc --noEmit  # TypeScript errors
pnpm test         # Test errors
```

### Erro: "Cannot connect to database"

**Solução:**

1. Verificar se `DATABASE_URL` está correto
2. Verificar se banco está online
3. Testar conexão local:
   ```bash
   mysql -h seu-host -u user -p
   ```

### Erro: "OAuth callback failed"

**Solução:**

1. Verificar se `VITE_APP_ID` está correto
2. Verificar se URL do Netlify está registrada no Manus
3. Verificar se `OAUTH_SERVER_URL` é `https://api.manus.im`

### Erro: "Alunos não carregam"

**Solução:**

1. Verificar se banco tem dados (1.125 alunos)
2. Verificar se `DATABASE_URL` está correto
3. Verificar logs do servidor

### Site Carregando Lentamente

**Solução:**

1. Normal para primeira carga (cold start)
2. Netlify aquece o servidor após 2-3 requisições
3. Usar CDN para assets estáticos

---

## 📞 Suporte Rápido

| Problema | Solução |
|----------|---------|
| Build não funciona | Rodar `pnpm build` localmente e verificar erros |
| Banco não conecta | Verificar `DATABASE_URL` e credenciais |
| OAuth não funciona | Registrar URL do Netlify no Manus |
| Dados não aparecem | Verificar se banco tem dados, rodar migrations |
| Permissões não funcionam | Verificar painel de permissões (admin) |

---

## 🎉 Você Está Pronto!

Siga o **Checklist Final de Deploy** acima, na ordem exata, e seu sistema estará em produção no Netlify com todos os dados, funcionalidades e configurações preservadas.

**Tempo estimado:** 30-60 minutos  
**Dificuldade:** Baixa (passo a passo)  
**Risco:** Mínimo (dados estão seguros no banco externo)  

---

**Versão:** 1.0  
**Data:** 2026-05-06  
**Status:** ✅ Pronto para produção
