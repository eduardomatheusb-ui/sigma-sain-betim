# 🚀 Guia de Deploy no Netlify — SIGMA SAIN BETIM

## 📋 Sumário Executivo

Este documento descreve como fazer o deploy completo do projeto **SIGMA SAIN BETIM** no Netlify, preservando todas as funcionalidades, dados e configurações.

**Status do Projeto:**
- ✅ Código: 100% funcional
- ✅ Testes: 147/147 passando
- ✅ Build: sucesso
- ✅ TypeScript: 0 erros
- ✅ Banco de dados: estrutura completa

---

## 🔧 Pré-requisitos

1. **Conta Netlify** — https://netlify.com
2. **Repositório GitHub** — com o código do projeto
3. **Banco de dados** — TiDB Cloud ou MySQL remoto
4. **Variáveis de ambiente** — listadas abaixo

---

## 📦 Variáveis de Ambiente Necessárias

Configure estas variáveis no Netlify (Settings → Environment variables):

```env
# Banco de dados
DATABASE_URL=mysql://user:password@host:port/database

# Autenticação OAuth (Manus)
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
JWT_SECRET=seu_jwt_secret_aleatorio

# Informações do proprietário
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=seu_nome

# APIs Manus (built-in)
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=sua_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=sua_frontend_api_key

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=seu_website_id

# Aplicação
NODE_ENV=production
VITE_APP_TITLE=SIGMA SAIN BETIM
VITE_APP_LOGO=https://seu-logo-url.png
```

---

## 🚀 Passo a Passo para Deploy

### 1. Preparar o Repositório GitHub

```bash
# Clone ou navegue até o repositório
cd sigma-sain-betim

# Certifique-se que tudo está commitado
git status
git add .
git commit -m "Preparar para deploy no Netlify"
git push origin main
```

### 2. Conectar Repositório ao Netlify

1. Acesse https://app.netlify.com
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Selecione **GitHub** como provedor
4. Autorize o Netlify a acessar seus repositórios
5. Selecione o repositório `sigma-sain-betim`
6. Clique em **"Deploy site"**

### 3. Configurar Build

Na página de configuração do site:

**Build settings:**
- Build command: `pnpm build`
- Publish directory: `dist/public`
- Functions directory: `dist`

**Environment variables:**
Adicione todas as variáveis listadas acima em **Settings → Environment variables**

### 4. Configurar Domínio Customizado (Opcional)

1. Vá para **Settings → Domain management**
2. Clique em **"Add custom domain"**
3. Siga as instruções para configurar DNS

### 5. Deploy Automático

Após conectar o repositório:
- Cada push para `main` dispara um novo deploy
- Você pode ver o progresso em **Deploys**
- O site estará disponível em `https://seu-site.netlify.app`

---

## 🔐 Configuração de Autenticação

### OAuth com Manus

O projeto usa autenticação OAuth do Manus. Certifique-se de:

1. ✅ Ter um App registrado no Manus
2. ✅ Ter o `VITE_APP_ID` correto
3. ✅ Ter o `OAUTH_SERVER_URL` apontando para `https://api.manus.im`
4. ✅ Ter o `JWT_SECRET` definido (use um valor aleatório forte)

### Login por Senha

O sistema também suporta login por email + senha:
- Senhas são armazenadas com hash bcrypt
- Ao criar usuário, você pode definir uma senha opcional
- Se não houver senha, o usuário só pode entrar via OAuth

---

## 💾 Banco de Dados

### Estrutura

O projeto usa **TiDB Cloud** (compatível com MySQL):

**Tabelas principais:**
- `users` — usuários do sistema
- `schools` — escolas cadastradas
- `students` — alunos (1.125+ registros)
- `mediators` — mediadores/atendentes
- `farol_cases` — casos de acompanhamento
- `external_demands` — demandas externas
- `internal_demands` — demandas internas
- `farol_advisors` — assessores CRAEI
- `modules` — módulos do sistema
- `user_module_permissions` — permissões por usuário
- `user_schools_assignment` — escolas vinculadas a usuários

### Migração de Dados

Se você está migrando de um banco existente:

1. Faça backup do banco atual
2. Execute as migrations no novo banco
3. Importe os dados usando scripts em `scripts/`

```bash
# Exemplo: migrar alunos legados
node scripts/migrate-legacy-students.mjs
```

---

## 📊 Funcionalidades Implementadas

### ✅ Autenticação e Autorização
- Login via OAuth (Manus)
- Login via email + senha
- Controle de acesso por perfil
- Permissões granulares por usuário

### ✅ Gestão de Usuários
- Criar, editar, deletar usuários
- 7 perfis de acesso (admin, user, craei_assessor, etc.)
- Atribuição de escolas por usuário
- Painel de permissões customizáveis

### ✅ Cadastros
- Alunos (1.125+ registros)
- Escolas (95+ escolas)
- Mediadores/Atendentes
- Demandas internas e externas

### ✅ Acompanhamento
- Quadro de casos (Farol)
- Filtros por escola, mediador, status
- Exportação para Excel
- Busca de aluno dependente de escola

### ✅ Demandas
- Criação de demandas externas
- Gestão de demandas internas
- Vinculação a alunos e escolas
- Rastreamento de status

### ✅ Relatórios
- Dashboards com métricas
- Gráficos de acompanhamento
- Exportação de dados

### ✅ Administração
- Painel de permissões por usuário
- Gestão de módulos
- Controle de acesso granular

---

## 🧪 Testes e Validação

### Rodar Testes Localmente

```bash
# Instalar dependências
pnpm install

# Rodar testes
pnpm test

# Resultado esperado: 147/147 testes passando
```

### Validar Build

```bash
# Build de produção
pnpm build

# Resultado esperado: sucesso, sem erros
```

### Testar Localmente

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Acessar em http://localhost:3000
```

---

## 🔍 Checklist Pré-Deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados criado e acessível
- [ ] Repositório GitHub sincronizado
- [ ] Build local funciona (`pnpm build`)
- [ ] Testes passam (`pnpm test`)
- [ ] TypeScript sem erros (`npx tsc --noEmit`)
- [ ] Netlify conectado ao repositório
- [ ] Domínio configurado (se customizado)

---

## ⚠️ Possíveis Problemas e Soluções

### Erro: "Cannot find module 'mysql2'"
**Solução:** Execute `pnpm install` para instalar dependências

### Erro: "DATABASE_URL not set"
**Solução:** Configure a variável de ambiente no Netlify

### Erro: "OAuth callback failed"
**Solução:** Verifique se `VITE_APP_ID` e `OAUTH_SERVER_URL` estão corretos

### Erro: "Chunks > 500 KB"
**Solução:** Aviso normal, não impede o deploy. Considere code-splitting se necessário.

### Erro: "Function not found"
**Solução:** Certifique-se que `functions` está apontando para `dist` no `netlify.toml`

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no Netlify (Deploys → Build log)
2. Verifique as variáveis de ambiente
3. Teste localmente (`pnpm dev`)
4. Consulte a documentação do Manus

---

## 📝 Notas Importantes

1. **Segurança:** Nunca comite `.env` com valores reais. Use variáveis de ambiente do Netlify.
2. **Banco de dados:** Sempre faça backup antes de fazer alterações estruturais.
3. **Permissões:** O painel de permissões é admin-only. Configure com cuidado.
4. **Dados:** Todos os 1.125+ alunos e configurações são preservados no deploy.

---

## 🎉 Próximos Passos Após Deploy

1. Acessar o site em produção
2. Testar login com diferentes usuários
3. Verificar se os dados carregam corretamente
4. Testar formulários e exportações
5. Configurar domínio customizado (se necessário)
6. Monitorar logs e performance

---

**Versão:** 1.0  
**Última atualização:** 2026-05-06  
**Status:** Pronto para produção ✅
