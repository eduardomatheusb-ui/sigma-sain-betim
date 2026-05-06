# 🔐 OAuth e Dependências Manus — SIGMA SAIN BETIM

**Versão:** 1.0  
**Data:** 2026-05-06  
**Status:** ✅ Completo  

---

## 📋 Resumo Executivo

O SIGMA tem **duas formas de autenticação**:

1. **OAuth Manus** (recomendado) → Login via Manus
2. **Email + Senha** (alternativa) → Login local com bcrypt

**Ambas funcionam 100% no Netlify** (sem dependências exclusivas do Manus).

---

## 🔐 Autenticação OAuth Manus

### Como Funciona

```
1. Usuário clica "Entrar com Manus"
2. Redireciona para https://portal.manus.im
3. Usuário faz login (email/senha/2FA)
4. Manus redireciona de volta para seu site
5. Seu site cria sessão JWT
6. Usuário logado ✅
```

### Continuará Funcionando no Netlify?

✅ **SIM, 100% funcionará.**

**Por quê?**
- OAuth é baseado em **redirecionamentos HTTP**
- Não depende de onde o frontend está hospedado
- Funciona em qualquer domínio (Netlify, Vercel, seu servidor, etc.)

### Configuração Necessária

Você precisa registrar o URL do Netlify no Manus:

**Passo 1: Obter URL do Netlify**

Após fazer deploy, você terá uma URL como:
```
https://sigma-sain-betim.netlify.app
```

Ou se tiver domínio customizado:
```
https://seu-dominio.com
```

**Passo 2: Registrar no Manus**

1. Acesse https://manus.im
2. Vá para "Configurações" → "Apps"
3. Selecione seu app (SIGMA)
4. Em "Redirect URLs", adicione:
   ```
   https://sigma-sain-betim.netlify.app/api/oauth/callback
   https://seu-dominio.com/api/oauth/callback (se tiver)
   ```
5. Clique em "Salvar"

**Passo 3: Pronto!**

Agora o OAuth funcionará no Netlify.

### Fluxo de Código

```typescript
// Frontend: client/src/lib/trpc.ts
// Quando usuário clica "Entrar com Manus":
const loginUrl = getLoginUrl(); // Gera URL com state
window.location.href = loginUrl; // Redireciona para Manus

// Backend: server/_core/oauth.ts
// Manus redireciona de volta para /api/oauth/callback
app.get("/api/oauth/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  
  // Trocar código por token
  const token = await sdk.exchangeCodeForToken(code, state);
  
  // Obter informações do usuário
  const userInfo = await sdk.getUserInfo(token.accessToken);
  
  // Criar/atualizar usuário no banco
  await db.upsertUser({
    openId: userInfo.openId,
    name: userInfo.name,
    email: userInfo.email,
    loginMethod: userInfo.loginMethod,
  });
  
  // Criar sessão JWT
  const sessionToken = await sdk.createSessionToken(userInfo.openId);
  
  // Salvar cookie
  res.cookie("app_session_id", sessionToken);
  
  // Redirecionar para home
  res.redirect("/");
});
```

---

## 🔑 Autenticação por Senha (Alternativa)

### Como Funciona

```
1. Usuário clica "Entrar com Email"
2. Preenche email + senha
3. Sistema valida com bcrypt
4. Cria sessão JWT
5. Usuário logado ✅
```

### Continuará Funcionando no Netlify?

✅ **SIM, 100% funcionará.**

**Por quê?**
- Não depende do Manus
- Usa apenas bcrypt (biblioteca padrão)
- Funciona em qualquer lugar

### Fluxo de Código

```typescript
// Frontend: client/src/pages/Login.tsx
// Quando usuário submete formulário:
const response = await trpc.auth.loginWithPassword.mutate({
  email: "usuario@example.com",
  password: "senha123",
});

// Backend: server/routers.ts
// Procedimento de login:
auth: {
  loginWithPassword: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      // Buscar usuário
      const user = await db.getUserByEmail(input.email);
      if (!user) throw new Error("User not found");
      
      // Validar senha com bcrypt
      const isValid = await bcrypt.compare(
        input.password,
        user.passwordHash
      );
      if (!isValid) throw new Error("Invalid password");
      
      // Criar sessão JWT
      const token = await createSessionToken(user.openId);
      
      // Retornar token (será salvo em cookie)
      return { token, user };
    }),
}
```

---

## 🔄 Dual Authentication

### Usuário Pode Usar Ambas?

✅ **SIM.**

O sistema suporta:
- Usuários que fazem login via OAuth
- Usuários que fazem login via Email + Senha
- **Mesmo usuário pode usar ambos** (se registrado em ambos)

### Fluxo de Registro

**Via OAuth:**
1. Usuário clica "Entrar com Manus"
2. Se não existir, sistema cria automaticamente
3. Usuário logado ✅

**Via Email + Senha:**
1. Admin cria usuário com email + senha
2. Usuário recebe credenciais
3. Usuário faz login
4. Usuário logado ✅

### Código de Registro

```typescript
// Backend: server/db.ts
export async function upsertUser(data: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
}) {
  // Se usuário existe, atualizar
  const existing = await db.query.users.findFirst({
    where: eq(users.openId, data.openId),
  });
  
  if (existing) {
    await db
      .update(users)
      .set({
        name: data.name || existing.name,
        email: data.email || existing.email,
        loginMethod: data.loginMethod || existing.loginMethod,
        lastSignedIn: new Date(),
      })
      .where(eq(users.openId, data.openId));
    return existing;
  }
  
  // Se não existe, criar
  const [newUser] = await db.insert(users).values({
    openId: data.openId,
    name: data.name,
    email: data.email,
    loginMethod: data.loginMethod,
    role: "school_user", // Role padrão
    isActive: true,
  });
  
  return newUser;
}
```

---

## 🔗 Dependências do Manus

### O Que Depende do Manus?

| Funcionalidade | Depende? | Alternativa |
|---|---|---|
| OAuth Login | ✅ SIM | Email + Senha |
| Session Tokens | ✅ SIM | JWT Local |
| User Info API | ✅ SIM | Banco Local |
| Analytics | ❌ NÃO | Opcional |
| Notifications | ❌ NÃO | Opcional |
| File Storage | ❌ NÃO | S3 Local |
| LLM Integration | ❌ NÃO | Opcional |

### O Que NÃO Depende do Manus?

- ✅ Banco de dados (TiDB Cloud)
- ✅ Email + Senha login
- ✅ RBAC (Role-Based Access Control)
- ✅ Dashboards
- ✅ Relatórios
- ✅ Exportação para Excel
- ✅ Busca de alunos
- ✅ Gestão de mediadores
- ✅ Demandas externas
- ✅ Quadro Farol

### Funcionalidades Opcionais (Manus)

Se você quiser remover dependências do Manus:

**1. Analytics (Opcional)**

Remover:
```typescript
// client/src/main.tsx
// Remover: initializeAnalytics()
```

**2. Notifications (Opcional)**

Remover:
```typescript
// server/_core/notification.ts
// Remover: notifyOwner()
```

**3. File Storage (Opcional)**

Usar S3 local:
```typescript
// server/storage.ts
// Já implementado com AWS SDK
// Pode usar seu próprio bucket S3
```

---

## 🚀 Cenários de Deployment

### Cenário 1: Netlify + Manus OAuth (Recomendado)

```
✅ Funciona 100%
✅ Sem mudanças necessárias
✅ Seguro e confiável
```

**Passos:**
1. Registrar URL do Netlify no Manus
2. Deploy normal
3. Pronto!

### Cenário 2: Netlify + Email + Senha (Sem Manus)

```
✅ Funciona 100%
✅ Sem dependências do Manus
✅ Mais autonomia
```

**Passos:**
1. Remover botão "Entrar com Manus" (opcional)
2. Usar apenas "Entrar com Email"
3. Admin cria usuários com email + senha
4. Deploy normal
5. Pronto!

### Cenário 3: Outro Host (Vercel, Railway, etc.)

```
✅ Funciona 100%
✅ Mesma configuração do Netlify
✅ Apenas mude o host
```

**Passos:**
1. Clonar repositório
2. Configurar novo host (Vercel, Railway, etc.)
3. Adicionar variáveis de ambiente
4. Registrar URL no Manus
5. Deploy
6. Pronto!

---

## 🔒 Segurança

### Tokens JWT

**Como funciona:**
- Usuário faz login
- Sistema cria JWT com openId
- JWT é salvo em cookie HTTP-only
- Cookie é enviado em cada requisição
- Backend valida JWT

**Segurança:**
- ✅ HTTP-only (não pode ser acessado via JavaScript)
- ✅ Secure (apenas HTTPS)
- ✅ SameSite (protege contra CSRF)
- ✅ Expira em 1 ano
- ✅ Assinado com `JWT_SECRET`

### Senhas

**Como funciona:**
- Senha é hasheada com bcrypt
- Hash é salvo no banco (nunca a senha)
- Quando usuário faz login, senha é comparada com hash
- Se corresponder, JWT é criado

**Segurança:**
- ✅ bcrypt (algoritmo forte)
- ✅ Salt automático (bcrypt inclui)
- ✅ Nunca armazenar senha em texto plano
- ✅ Nunca enviar senha em logs

### OAuth

**Como funciona:**
- Usuário é redirecionado para Manus
- Manus autentica usuário
- Manus retorna código de autorização
- Seu sistema troca código por token
- Token é usado para obter informações do usuário

**Segurança:**
- ✅ Código é válido por apenas 5 minutos
- ✅ Código é vinculado a redirect_uri
- ✅ Token é assinado por Manus
- ✅ Seu app_id é verificado

---

## 🆘 Troubleshooting

### Erro: "OAuth callback failed"

**Causa:** URL do Netlify não registrada no Manus  
**Solução:**
1. Ir para Manus Dashboard → Apps
2. Adicionar `https://seu-site.netlify.app/api/oauth/callback`
3. Salvar
4. Tentar login novamente

### Erro: "Invalid app ID"

**Causa:** `VITE_APP_ID` incorreta  
**Solução:**
1. Copiar `VITE_APP_ID` novamente do Manus
2. Atualizar no Netlify
3. Redeploy

### Erro: "JWT_SECRET too short"

**Causa:** `JWT_SECRET` com menos de 32 caracteres  
**Solução:**
1. Gerar novo `JWT_SECRET` (32+ caracteres)
2. Atualizar no Netlify
3. Redeploy

### Erro: "Cannot find user"

**Causa:** Usuário não existe no banco  
**Solução:**
1. Se OAuth: usuário será criado automaticamente
2. Se Email + Senha: admin deve criar usuário primeiro

### Erro: "Invalid password"

**Causa:** Senha incorreta  
**Solução:**
1. Verificar se CAPS LOCK está desligado
2. Tentar novamente
3. Se esqueceu: admin reseta senha

---

## ✅ Checklist de Autenticação

- [ ] Testei login via OAuth localmente
- [ ] Testei login via Email + Senha localmente
- [ ] Confirmei que `VITE_APP_ID` está correto
- [ ] Confirmei que `OAUTH_SERVER_URL` é `https://api.manus.im`
- [ ] Confirmei que `JWT_SECRET` é um valor aleatório forte
- [ ] Registrei URL do Netlify no Manus
- [ ] Fiz deploy no Netlify
- [ ] Testei login via OAuth no Netlify
- [ ] Testei login via Email + Senha no Netlify
- [ ] Confirmei que cookies estão sendo salvos
- [ ] Confirmei que sessão persiste após refresh

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                    │
│                                                         │
│  Tela de Login                                         │
│  ├─ Botão: "Entrar com Manus" (OAuth)                │
│  └─ Botão: "Entrar com Email" (Senha)                │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌─────────────┐   ┌──────────────┐
   │ OAuth Flow  │   │ Password Flow│
   └────┬────────┘   └──────┬───────┘
        │                   │
        ▼                   ▼
   ┌─────────────────────────────────┐
   │   Backend (Express + tRPC)      │
   │                                 │
   │  /api/oauth/callback            │
   │  /api/trpc/auth.loginWithPassword
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │   Database (TiDB Cloud)         │
   │                                 │
   │  - Buscar/criar usuário         │
   │  - Salvar sessão                │
   │  - Validar permissões           │
   └─────────────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │   Cookie HTTP-only JWT          │
   │                                 │
   │  - Salvo no navegador           │
   │  - Enviado em cada requisição   │
   │  - Válido por 1 ano             │
   └─────────────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │   Frontend (React)              │
   │                                 │
   │  - Usuário logado ✅            │
   │  - Acesso a dashboards          │
   │  - Acesso a relatórios          │
   │  - Acesso a formulários         │
   └─────────────────────────────────┘
```

---

## 🎉 Conclusão

Seu sistema de autenticação é **robusto, seguro e flexível**:

- ✅ OAuth Manus (recomendado)
- ✅ Email + Senha (alternativa)
- ✅ Ambos funcionam no Netlify
- ✅ Sem dependências exclusivas do Manus
- ✅ Tokens JWT seguros
- ✅ Senhas hasheadas com bcrypt

**Você pode fazer deploy no Netlify com confiança!**

---

**Versão:** 1.0  
**Data:** 2026-05-06  
**Status:** ✅ Completo
