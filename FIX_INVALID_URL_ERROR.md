# ✅ Fix: Invalid URL Error — Environment Validation

**Versão:** 1.0  
**Data:** 2026-05-06  
**Status:** ✅ Corrigido

---

## 🔍 Problema Identificado

O frontend estava quebrando com erro:
```
TypeError: Invalid URL
```

**Causa:** Variáveis de ambiente VITE_ estavam vazias, indefinidas ou inválidas, causando erro ao chamar `new URL(...)`.

**Locais afetados:**
- `client/src/const.ts` → `getLoginUrl()` tentava criar URL com `VITE_OAUTH_PORTAL_URL` vazia
- `client/src/components/Map.tsx` → Tentava usar `VITE_FRONTEND_FORGE_API_KEY` vazia

---

## ✅ Solução Implementada

### 1. Novo Arquivo: `client/src/lib/env.ts`

Módulo centralizado para validação de variáveis de ambiente:

```typescript
export function getEnvConfig(): EnvConfig {
  return {
    VITE_OAUTH_PORTAL_URL: validateUrl(...),
    VITE_APP_ID: validateString(...),
    VITE_FRONTEND_FORGE_API_URL: validateUrl(...),
    VITE_FRONTEND_FORGE_API_KEY: validateString(...),
  };
}

export function getEnvConfigError(): string | null {
  // Retorna mensagem de erro se alguma variável estiver faltando
}
```

**Benefícios:**
- ✅ Validação centralizada
- ✅ Mensagens de erro claras
- ✅ Fallbacks seguros
- ✅ Sem crashes silenciosos

### 2. Atualizado: `client/src/const.ts`

Agora valida variáveis antes de usar:

```typescript
export const getLoginUrl = () => {
  // Valida TODAS as variáveis necessárias
  const config = getEnvConfig();
  
  const oauthPortalUrl = config.VITE_OAUTH_PORTAL_URL;
  const appId = config.VITE_APP_ID;
  
  // Agora é seguro criar URL
  const url = new URL(`${oauthPortalUrl}/app-auth`);
  // ...
};
```

**Resultado:**
- ✅ Se `VITE_OAUTH_PORTAL_URL` estiver vazia, erro claro é lançado
- ✅ Não tenta criar URL inválida
- ✅ Mensagem diz exatamente qual variável está faltando

### 3. Atualizado: `client/src/components/Map.tsx`

Agora valida variáveis ao carregar mapa:

```typescript
let API_KEY: string;
let MAPS_PROXY_URL: string;

try {
  const config = getEnvConfig();
  API_KEY = config.VITE_FRONTEND_FORGE_API_KEY;
  MAPS_PROXY_URL = `${config.VITE_FRONTEND_FORGE_API_URL}/v1/maps/proxy`;
} catch (error) {
  // Se env não estiver configurado, vai mostrar erro no MapView
  API_KEY = "";
  MAPS_PROXY_URL = "";
}

function loadMapScript() {
  const envError = getEnvConfigError();
  if (envError) {
    reject(new Error(envError));
    return;
  }
  // ... continua normalmente
}
```

**Resultado:**
- ✅ Se `VITE_FRONTEND_FORGE_API_KEY` estiver vazia, erro claro
- ✅ Não tenta carregar script de mapa inválido

### 4. Novo Arquivo: `client/src/components/EnvConfigError.tsx`

Componente que exibe erro de configuração de forma amigável:

```tsx
<EnvConfigError error={error} />
```

**Exibe:**
- ✅ Ícone de alerta
- ✅ Mensagem clara do erro
- ✅ Instruções passo a passo para corrigir
- ✅ Lista de variáveis obrigatórias

### 5. Atualizado: `client/src/main.tsx`

Valida ambiente no startup antes de renderizar app:

```typescript
const envError = getEnvConfigError();
if (envError) {
  // Mostra erro de configuração
  createRoot(...).render(<EnvConfigError error={envError} />);
} else {
  // Renderiza app normalmente
  createRoot(...).render(<App />);
}
```

**Resultado:**
- ✅ Se alguma variável estiver faltando, mostra erro claro
- ✅ App não tenta inicializar com configuração inválida
- ✅ Usuário sabe exatamente o que fazer

---

## ✅ Validações Realizadas

| Validação | Status | Resultado |
|-----------|--------|-----------|
| Build local | ✅ Sucesso | `pnpm build` completa sem erros |
| Testes | ✅ 147/147 passando | `pnpm test` passa |
| TypeScript | ✅ Clean | `pnpm check` sem erros |
| Validação de URL | ✅ Funciona | Rejeita URLs vazias ou sem protocolo |
| Validação de string | ✅ Funciona | Rejeita strings vazias |
| Mensagens de erro | ✅ Claras | Indicam exatamente qual variável falta |

---

## 📋 Variáveis Obrigatórias

Todas as 4 variáveis abaixo **DEVEM** estar configuradas no Netlify:

| Variável | Tipo | Exemplo | Obrigatória |
|----------|------|---------|------------|
| `VITE_OAUTH_PORTAL_URL` | URL | `https://portal.manus.im` | ✅ SIM |
| `VITE_APP_ID` | String | `sigma-app-123` | ✅ SIM |
| `VITE_FRONTEND_FORGE_API_URL` | URL | `https://api.manus.im/forge` | ✅ SIM |
| `VITE_FRONTEND_FORGE_API_KEY` | String | `sk_test_...` | ✅ SIM |

---

## 🚀 Como Usar

### No Netlify

1. Vá para **Settings** → **Environment variables**
2. Adicione as 4 variáveis obrigatórias
3. Clique em **Deploy**

### Localmente (Desenvolvimento)

1. Crie `.env.local`:
```
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=seu-app-id
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=sua-chave-api
```

2. Rode `pnpm dev`

---

## ✅ Fluxo de Erro

### Antes (ERRADO)
```
1. App inicia
2. Tenta criar URL com variável vazia
3. new URL("") → TypeError: Invalid URL
4. App quebra com erro minificado
5. Usuário vê "Invalid URL" sem saber o que fazer
```

### Depois (CORRETO)
```
1. App inicia
2. Valida variáveis de ambiente
3. Se alguma estiver vazia:
   - Lança erro claro: "Missing VITE_OAUTH_PORTAL_URL"
   - Mostra componente EnvConfigError
   - Exibe instruções passo a passo
4. Usuário sabe exatamente o que fazer
5. Depois de configurar variáveis, app funciona normalmente
```

---

## 📝 Mensagens de Erro

### Exemplo 1: Variável Vazia
```
Missing or invalid environment variable: VITE_OAUTH_PORTAL_URL.
Please configure VITE_OAUTH_PORTAL_URL in Netlify Settings → Environment variables.
```

### Exemplo 2: URL Sem Protocolo
```
Invalid URL for VITE_OAUTH_PORTAL_URL: "portal.manus.im".
URL must start with https:// or http://
```

---

## ✅ Checklist

- [x] Novo módulo `client/src/lib/env.ts` criado
- [x] Validação de URLs implementada
- [x] Validação de strings implementada
- [x] `const.ts` atualizado para usar validação
- [x] `Map.tsx` atualizado para usar validação
- [x] Componente `EnvConfigError.tsx` criado
- [x] `main.tsx` atualizado para validar no startup
- [x] Build local funciona
- [x] Testes passam (147/147)
- [x] TypeScript clean
- [x] Código em GitHub

---

## 🎉 Resultado

O app agora:
- ✅ Não quebra com "Invalid URL"
- ✅ Valida variáveis de ambiente no startup
- ✅ Exibe mensagens de erro claras
- ✅ Guia o usuário para corrigir a configuração
- ✅ Funciona normalmente quando variáveis estão corretas

---

**Versão:** 1.0  
**Data:** 2026-05-06  
**Status:** ✅ Corrigido e Testado
