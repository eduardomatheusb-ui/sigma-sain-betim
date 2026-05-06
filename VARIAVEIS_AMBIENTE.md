# 🔐 Variáveis de Ambiente — SIGMA SAIN BETIM

**Versão:** 1.0  
**Data:** 2026-05-06  
**Status:** ✅ Completo  

---

## 📋 Resumo Executivo

O SIGMA requer **16 variáveis de ambiente** para funcionar em produção no Netlify:
- **11 obrigatórias** (sem elas, o sistema não funciona)
- **5 opcionais** (melhoram funcionalidades, mas não quebram o sistema)

**Tempo de configuração:** 15-20 minutos  
**Dificuldade:** Baixa (copiar e colar valores)  
**Risco:** Mínimo (valores são públicos ou já fornecidos)

---

## 🔴 VARIÁVEIS OBRIGATÓRIAS

### 1. DATABASE_URL

**Finalidade:** Conexão com o banco de dados MySQL/TiDB  
**Tipo:** String  
**Obrigatória:** ✅ SIM

**Formato:**
```
mysql://username:password@host:port/database_name
```

**Exemplo Real:**
```
mysql://betim_user:Senha123!@gateway05.us-east-1.prod.aws.tidbcloud.com:4000/sigma_db
```

**Como Encontrar:**

Se você está usando **TiDB Cloud** (recomendado):
1. Acesse https://tidbcloud.com
2. Vá para seu cluster
3. Clique em "Connect"
4. Copie a string de conexão MySQL
5. Substitua `<password>` pela sua senha

Se você está usando **MySQL Local/Remoto**:
1. Peça ao seu administrador de banco de dados
2. Formato: `mysql://user:pass@host:port/db`

**Validação:**
```bash
# Testar conexão localmente
mysql -h seu-host -u seu-user -p seu-db

# Deve conectar sem erros
```

---

### 2. VITE_APP_ID

**Finalidade:** ID da aplicação no Manus OAuth  
**Tipo:** String  
**Obrigatória:** ✅ SIM

**Exemplo Real:**
```
app_sigma_betim_prod_nZ3ZivJqPxTZgHM3ED6P8R
```

**Como Encontrar:**

1. Acesse https://manus.im (seu painel)
2. Vá para "Configurações" → "Apps"
3. Procure por "SIGMA" ou "sigma-sain-betim"
4. Copie o "App ID"

**Se não tiver:**
1. Clique em "Criar Nova App"
2. Nome: `SIGMA SAIN BETIM`
3. Descrição: `Sistema de Gestão de Mediadores e Atendimentos`
4. Clique em "Criar"
5. Copie o App ID gerado

---

### 3. OAUTH_SERVER_URL

**Finalidade:** URL do servidor OAuth do Manus  
**Tipo:** String (URL)  
**Obrigatória:** ✅ SIM

**Valor Padrão (Sempre Este):**
```
https://api.manus.im
```

**Nunca Mude Este Valor.**

---

### 4. VITE_OAUTH_PORTAL_URL

**Finalidade:** URL do portal de login do Manus (frontend)  
**Tipo:** String (URL)  
**Obrigatória:** ✅ SIM

**Valor Padrão (Sempre Este):**
```
https://portal.manus.im
```

**Nunca Mude Este Valor.**

---

### 5. JWT_SECRET

**Finalidade:** Chave secreta para assinar cookies de sessão JWT  
**Tipo:** String (valor aleatório)  
**Obrigatória:** ✅ SIM

**Requisitos:**
- Mínimo 32 caracteres
- Deve ser aleatório e único
- Nunca compartilhe ou exponha

**Como Gerar:**

**Opção 1: Via Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Opção 2: Via OpenSSL**
```bash
openssl rand -hex 32
```

**Opção 3: Via Python**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Exemplo Real:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**⚠️ IMPORTANTE:**
- Gere um valor **novo e único** para produção
- Não use o mesmo valor em múltiplos ambientes
- Se vazar, regenere imediatamente
- Armazene em um local seguro (Netlify Secrets, não em Git)

---

### 6. OWNER_OPEN_ID

**Finalidade:** OpenID do proprietário do projeto no Manus  
**Tipo:** String  
**Obrigatória:** ✅ SIM

**Exemplo Real:**
```
DnS8TPgCSmASUzjSWX74qf
```

**Como Encontrar:**

1. Acesse https://manus.im
2. Clique no seu perfil (canto superior direito)
3. Vá para "Configurações"
4. Procure por "OpenID" ou "User ID"
5. Copie o valor

**Ou via API:**
```bash
curl -H "Authorization: Bearer seu-token" https://api.manus.im/v1/auth/me
# Procure pelo campo "open_id" na resposta
```

---

### 7. OWNER_NAME

**Finalidade:** Nome do proprietário (exibido em notificações e relatórios)  
**Tipo:** String  
**Obrigatória:** ✅ SIM

**Exemplo Real:**
```
Eduardo Matheus Brito Almeida
```

**Como Encontrar:**

1. Acesse https://manus.im
2. Clique no seu perfil
3. Copie seu nome completo

---

### 8. BUILT_IN_FORGE_API_URL

**Finalidade:** URL da API Manus (servidor)  
**Tipo:** String (URL)  
**Obrigatória:** ✅ SIM

**Valor Padrão (Sempre Este):**
```
https://api.manus.im/forge
```

**Nunca Mude Este Valor.**

---

### 9. BUILT_IN_FORGE_API_KEY

**Finalidade:** Chave de API do Manus (servidor)  
**Tipo:** String (Bearer token)  
**Obrigatória:** ✅ SIM

**Exemplo Real:**
```
key_server_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Como Encontrar:**

1. Acesse https://manus.im
2. Vá para "Configurações" → "API Keys"
3. Procure por "Server Key" ou "Backend Key"
4. Copie o valor

**Se não tiver:**
1. Clique em "Gerar Nova Chave"
2. Tipo: "Server" ou "Backend"
3. Clique em "Gerar"
4. Copie a chave (será mostrada apenas uma vez!)

**⚠️ IMPORTANTE:**
- Esta chave é **sensível** (acesso ao servidor)
- Nunca exponha em Git ou logs
- Use apenas no backend (Netlify Functions)
- Se vazar, regenere imediatamente

---

### 10. VITE_FRONTEND_FORGE_API_URL

**Finalidade:** URL da API Manus (frontend)  
**Tipo:** String (URL)  
**Obrigatória:** ✅ SIM

**Valor Padrão (Sempre Este):**
```
https://api.manus.im/forge
```

**Nunca Mude Este Valor.**

---

### 11. VITE_FRONTEND_FORGE_API_KEY

**Finalidade:** Chave de API do Manus (frontend)  
**Tipo:** String (Bearer token)  
**Obrigatória:** ✅ SIM

**Exemplo Real:**
```
key_frontend_xyz789abc456def123ghi012jkl345mno678pqr901stu234vwx
```

**Como Encontrar:**

1. Acesse https://manus.im
2. Vá para "Configurações" → "API Keys"
3. Procure por "Frontend Key" ou "Public Key"
4. Copie o valor

**Se não tiver:**
1. Clique em "Gerar Nova Chave"
2. Tipo: "Frontend" ou "Public"
3. Clique em "Gerar"
4. Copie a chave

**Nota:**
- Esta chave é **menos sensível** que a do servidor
- Pode ser exposta no frontend (será visível no navegador)
- Use apenas para requisições do cliente

---

## 🟡 VARIÁVEIS OPCIONAIS

### 12. NODE_ENV

**Finalidade:** Ambiente de execução  
**Tipo:** String  
**Obrigatória:** ❌ NÃO (padrão: `production`)

**Valores Válidos:**
```
production   ← Use no Netlify
development  ← Use localmente
```

**Valor Recomendado para Netlify:**
```
production
```

**Nota:**
- Netlify define automaticamente como `production`
- Não precisa configurar manualmente

---

### 13. VITE_APP_TITLE

**Finalidade:** Título da aplicação (exibido na aba do navegador)  
**Tipo:** String  
**Obrigatória:** ❌ NÃO (padrão: `SIGMA`)

**Exemplo Real:**
```
SIGMA SAIN BETIM
```

**Onde Aparece:**
- Aba do navegador
- Cabeçalho da página
- Notificações

---

### 14. VITE_APP_LOGO

**Finalidade:** URL do logo da aplicação  
**Tipo:** String (URL)  
**Obrigatória:** ❌ NÃO (padrão: logo padrão)

**Exemplo Real:**
```
https://seu-dominio.com/logo.png
```

**Requisitos:**
- Deve ser uma URL pública
- Formato: PNG, JPG, SVG
- Tamanho recomendado: 200x200px ou maior
- Deve estar hospedado em um servidor acessível

**Onde Aparece:**
- Cabeçalho da página
- Notificações
- Relatórios

---

### 15. VITE_ANALYTICS_ENDPOINT

**Finalidade:** Endpoint para rastreamento de analytics  
**Tipo:** String (URL)  
**Obrigatória:** ❌ NÃO (padrão: desabilitado)

**Exemplo Real:**
```
https://analytics.seu-dominio.com/api/events
```

**Quando Usar:**
- Se quiser rastrear uso do sistema
- Se tiver um serviço de analytics próprio

---

### 16. VITE_ANALYTICS_WEBSITE_ID

**Finalidade:** ID do website para analytics  
**Tipo:** String  
**Obrigatória:** ❌ NÃO (padrão: desabilitado)

**Exemplo Real:**
```
website_sigma_betim_prod
```

**Quando Usar:**
- Se estiver usando `VITE_ANALYTICS_ENDPOINT`

---

## 📝 Tabela de Referência Rápida

| # | Variável | Obrigatória | Exemplo | Onde Encontrar |
|---|----------|-------------|---------|----------------|
| 1 | `DATABASE_URL` | ✅ | `mysql://user:pass@host:4000/db` | TiDB Cloud Console |
| 2 | `VITE_APP_ID` | ✅ | `app_sigma_betim_prod` | Manus Dashboard → Apps |
| 3 | `OAUTH_SERVER_URL` | ✅ | `https://api.manus.im` | Padrão (não mude) |
| 4 | `VITE_OAUTH_PORTAL_URL` | ✅ | `https://portal.manus.im` | Padrão (não mude) |
| 5 | `JWT_SECRET` | ✅ | `a1b2c3d4...` | Gere um valor aleatório |
| 6 | `OWNER_OPEN_ID` | ✅ | `DnS8TPgCSmASUzjSWX74qf` | Seu perfil Manus |
| 7 | `OWNER_NAME` | ✅ | `Eduardo Matheus Brito Almeida` | Seu perfil Manus |
| 8 | `BUILT_IN_FORGE_API_URL` | ✅ | `https://api.manus.im/forge` | Padrão (não mude) |
| 9 | `BUILT_IN_FORGE_API_KEY` | ✅ | `key_server_abc123...` | Manus Dashboard → API Keys |
| 10 | `VITE_FRONTEND_FORGE_API_URL` | ✅ | `https://api.manus.im/forge` | Padrão (não mude) |
| 11 | `VITE_FRONTEND_FORGE_API_KEY` | ✅ | `key_frontend_xyz789...` | Manus Dashboard → API Keys |
| 12 | `NODE_ENV` | ❌ | `production` | Netlify (automático) |
| 13 | `VITE_APP_TITLE` | ❌ | `SIGMA SAIN BETIM` | Qualquer valor |
| 14 | `VITE_APP_LOGO` | ❌ | `https://seu-logo.png` | URL pública |
| 15 | `VITE_ANALYTICS_ENDPOINT` | ❌ | `https://analytics.seu-dominio.com` | Seu serviço |
| 16 | `VITE_ANALYTICS_WEBSITE_ID` | ❌ | `website_sigma_betim` | Seu serviço |

---

## 🚀 Como Configurar no Netlify

### Passo 1: Acessar Configurações

1. Acesse https://netlify.com
2. Vá para seu site (sigma-sain-betim)
3. Clique em **Settings**
4. Na barra lateral, clique em **Environment variables**

### Passo 2: Adicionar Variáveis

1. Clique em **Add a variable**
2. Preencha:
   - **Key:** Nome da variável (ex: `DATABASE_URL`)
   - **Value:** Valor (ex: `mysql://user:pass@host:4000/db`)
3. Clique em **Save**
4. Repita para cada variável

### Passo 3: Verificar Configuração

```
✅ DATABASE_URL = mysql://...
✅ VITE_APP_ID = app_...
✅ OAUTH_SERVER_URL = https://api.manus.im
✅ VITE_OAUTH_PORTAL_URL = https://portal.manus.im
✅ JWT_SECRET = a1b2c3d4...
✅ OWNER_OPEN_ID = DnS8TPgCSmASUzjSWX74qf
✅ OWNER_NAME = Eduardo Matheus Brito Almeida
✅ BUILT_IN_FORGE_API_URL = https://api.manus.im/forge
✅ BUILT_IN_FORGE_API_KEY = key_server_...
✅ VITE_FRONTEND_FORGE_API_URL = https://api.manus.im/forge
✅ VITE_FRONTEND_FORGE_API_KEY = key_frontend_...
```

### Passo 4: Redeploy

1. Vá para "Deploys"
2. Clique em "Trigger deploy" → "Deploy site"
3. Aguarde o build completar (5-10 minutos)

---

## ✅ Checklist de Configuração

- [ ] Copiei `DATABASE_URL` do TiDB Cloud
- [ ] Copiei `VITE_APP_ID` do Manus Dashboard
- [ ] Confirmei que `OAUTH_SERVER_URL` é `https://api.manus.im`
- [ ] Confirmei que `VITE_OAUTH_PORTAL_URL` é `https://portal.manus.im`
- [ ] Gerei um `JWT_SECRET` aleatório (32+ caracteres)
- [ ] Copiei `OWNER_OPEN_ID` do meu perfil Manus
- [ ] Copiei `OWNER_NAME` do meu perfil Manus
- [ ] Confirmei que `BUILT_IN_FORGE_API_URL` é `https://api.manus.im/forge`
- [ ] Copiei `BUILT_IN_FORGE_API_KEY` do Manus Dashboard
- [ ] Confirmei que `VITE_FRONTEND_FORGE_API_URL` é `https://api.manus.im/forge`
- [ ] Copiei `VITE_FRONTEND_FORGE_API_KEY` do Manus Dashboard
- [ ] Adicionei todas as variáveis no Netlify
- [ ] Fiz redeploy do site
- [ ] Testei login no site em produção

---

## 🔒 Boas Práticas de Segurança

### ✅ Faça

- ✅ Armazene chaves sensíveis no Netlify (não em Git)
- ✅ Regenere `JWT_SECRET` regularmente
- ✅ Monitore logs de erro para vazamentos
- ✅ Use HTTPS em todas as URLs
- ✅ Revise permissões de API regularmente

### ❌ Não Faça

- ❌ Nunca commite `.env` no Git
- ❌ Nunca compartilhe `JWT_SECRET` ou `BUILT_IN_FORGE_API_KEY`
- ❌ Nunca use valores de teste em produção
- ❌ Nunca exponha valores em logs ou mensagens de erro
- ❌ Nunca reutilize `JWT_SECRET` em múltiplos ambientes

---

## 🆘 Troubleshooting

### Erro: "Cannot connect to database"

**Causa:** `DATABASE_URL` incorreta  
**Solução:**
1. Verificar se `DATABASE_URL` está correto
2. Testar conexão localmente: `mysql -h seu-host -u seu-user -p`
3. Verificar se banco está online

### Erro: "Invalid app ID"

**Causa:** `VITE_APP_ID` incorreta  
**Solução:**
1. Copiar `VITE_APP_ID` novamente do Manus Dashboard
2. Verificar se não tem espaços em branco
3. Redeploy

### Erro: "OAuth callback failed"

**Causa:** URL do Netlify não registrada no Manus  
**Solução:**
1. Ir para Manus Dashboard → Apps
2. Adicionar `https://seu-site.netlify.app/api/oauth/callback` em "Redirect URLs"
3. Salvar
4. Redeploy

### Erro: "JWT_SECRET too short"

**Causa:** `JWT_SECRET` com menos de 32 caracteres  
**Solução:**
1. Gerar novo `JWT_SECRET` com 32+ caracteres
2. Atualizar no Netlify
3. Redeploy

---

## 📞 Suporte

Se tiver dúvidas sobre variáveis de ambiente:

1. Consulte este documento
2. Verifique os logs do Netlify
3. Contate suporte do Manus em https://help.manus.im

---

**Versão:** 1.0  
**Data:** 2026-05-06  
**Status:** ✅ Completo
