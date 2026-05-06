# 🔐 Primeiro Acesso - Criar Administrador

**Versão:** 1.0  
**Data:** 2026-05-06  
**Status:** ✅ Completo

---

## 📋 Resumo

Este guia explica como criar o **primeiro usuário administrador** do SIGMA com segurança.

**Tempo:** 10 minutos  
**Dificuldade:** Baixa  
**Risco:** Mínimo

---

## ❓ Existe Administrador Já Criado?

**Resposta:** Não. O sistema vem vazio (sem usuários pré-criados).

**Por quê?** Por segurança. Cada instalação cria seu próprio admin com suas próprias credenciais.

---

## 🔑 Opção 1: Criar Admin via OAuth Manus (Recomendado)

### Passo 1: Fazer Login via OAuth

1. Acesse seu site: `https://seu-site.netlify.app`
2. Clique em **"Entrar com Manus"**
3. Você será redirecionado para `https://portal.manus.im`
4. Faça login com suas credenciais Manus
5. Você será redirecionado de volta para o site
6. ✅ Você está logado

### Passo 2: Verificar Seu Perfil

1. Clique no seu perfil (canto superior direito)
2. Você deve ver seu nome e email
3. Anote seu **OpenID** (você precisará depois)

### Passo 3: Conectar ao Banco de Dados

Você precisa promover seu usuário a admin. Existem 2 formas:

**Forma A: Via Interface (Se Implementada)**

1. Vá para "Usuários" (se tiver acesso)
2. Procure seu usuário
3. Mude o perfil para "admin"
4. Salve

**Forma B: Via Banco de Dados (Seguro)**

```bash
# Conectar ao banco
mysql -h gateway05.us-east-1.prod.aws.tidbcloud.com \
  -u betim_user -p sigma_db

# Executar comando SQL
UPDATE users SET role = 'admin' WHERE openId = 'SEU_OPEN_ID';

# Verificar
SELECT id, name, email, role FROM users WHERE openId = 'SEU_OPEN_ID';
```

### Passo 4: Recarregar Página

1. Volte para o site
2. Recarregue a página (F5)
3. Você agora é admin ✅

### Passo 5: Verificar Acesso Admin

1. Você deve ver menu "Usuários" (admin only)
2. Você deve ver menu "Permissões" (admin only)
3. Se vir, você é admin ✅

---

## 🔑 Opção 2: Criar Admin via Email + Senha (Alternativa)

### Passo 1: Conectar ao Banco de Dados

```bash
# Conectar
mysql -h gateway05.us-east-1.prod.aws.tidbcloud.com \
  -u betim_user -p sigma_db
```

### Passo 2: Gerar Hash da Senha

Você precisa de uma senha hasheada com bcrypt. Use Node.js:

```bash
node -e "
const bcrypt = require('bcryptjs');
const senha = 'SuaSenhaForte123!';
const hash = bcrypt.hashSync(senha, 10);
console.log('Senha:', senha);
console.log('Hash:', hash);
"
```

**Exemplo de saída:**
```
Senha: SuaSenhaForte123!
Hash: $2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRST
```

### Passo 3: Inserir Usuário Admin no Banco

```sql
INSERT INTO users (
  openId,
  name,
  email,
  passwordHash,
  loginMethod,
  role,
  isActive,
  createdAt,
  updatedAt,
  lastSignedIn
) VALUES (
  'admin_local_001',
  'Administrador',
  'admin@sigma.local',
  '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRST',
  'email',
  'admin',
  true,
  NOW(),
  NOW(),
  NOW()
);
```

**Valores a usar:**
- `openId`: `admin_local_001` (ou qualquer valor único)
- `name`: Seu nome
- `email`: Seu email
- `passwordHash`: Hash gerado no Passo 2
- `loginMethod`: `email`
- `role`: `admin`
- `isActive`: `true`

### Passo 4: Fazer Login

1. Acesse seu site: `https://seu-site.netlify.app`
2. Clique em **"Entrar com Email"**
3. Preencha:
   - Email: `admin@sigma.local`
   - Senha: `SuaSenhaForte123!`
4. Clique em "Entrar"
5. ✅ Você está logado como admin

### Passo 5: Verificar Acesso Admin

1. Você deve ver menu "Usuários"
2. Você deve ver menu "Permissões"
3. Se vir, você é admin ✅

---

## ⚠️ Segurança - Boas Práticas

### ✅ Faça

- ✅ Use senha forte (12+ caracteres, números, símbolos)
- ✅ Guarde a senha em local seguro
- ✅ Mude a senha após primeiro login
- ✅ Crie usuários adicionais para outros admins
- ✅ Use OAuth quando possível (mais seguro)

### ❌ Não Faça

- ❌ Não use senha simples (123456, admin, etc.)
- ❌ Não compartilhe senha com ninguém
- ❌ Não deixe senha em texto plano em arquivos
- ❌ Não use mesmo email para múltiplos usuários
- ❌ Não exponha hash de senha

---

## 🔄 Depois do Primeiro Acesso

### 1. Criar Mais Usuários

1. Vá para "Usuários"
2. Clique em "Novo Usuário"
3. Preencha:
   - Nome
   - Email
   - Perfil (role)
   - Senha (se email + senha)
4. Clique em "Salvar"

### 2. Configurar Permissões

1. Vá para "Permissões"
2. Selecione um perfil (ex: `craei_assessor`)
3. Configure matriz de permissões
4. Clique em "Salvar"

### 3. Criar Escolas

1. Vá para "Escolas" (se disponível)
2. Clique em "Nova Escola"
3. Preencha dados
4. Clique em "Salvar"

### 4. Importar Alunos

Alunos já estão no banco (1.125+). Você pode:
- Visualizar em "Acompanhamento de Casos"
- Buscar por escola
- Criar novos casos

---

## 🆘 Troubleshooting

### Erro: "Usuário não encontrado"

**Causa:** Usuário não existe no banco  
**Solução:**
1. Verificar se fez login via OAuth
2. Se sim, usuário deve ter sido criado automaticamente
3. Se não, criar manualmente via SQL

### Erro: "Acesso negado"

**Causa:** Usuário não é admin  
**Solução:**
1. Conectar ao banco
2. Executar: `UPDATE users SET role = 'admin' WHERE email = 'seu-email';`
3. Recarregar página

### Erro: "Senha incorreta"

**Causa:** Senha errada ou hash incorreto  
**Solução:**
1. Gerar novo hash: `bcrypt.hashSync('nova-senha', 10)`
2. Atualizar no banco: `UPDATE users SET passwordHash = 'novo-hash' WHERE email = 'seu-email';`
3. Tentar login novamente

### Erro: "Email já existe"

**Causa:** Email já cadastrado  
**Solução:**
1. Usar email diferente
2. Ou atualizar usuário existente

---

## ✅ Checklist - Primeiro Acesso

- [ ] Acessei o site em `https://seu-site.netlify.app`
- [ ] Fiz login via OAuth Manus OU Email + Senha
- [ ] Verifiquei meu perfil
- [ ] Promovi meu usuário a admin (via banco)
- [ ] Recarreguei a página
- [ ] Vejo menu "Usuários" (admin only)
- [ ] Vejo menu "Permissões" (admin only)
- [ ] Sou admin ✅

---

## 📞 Suporte

Se tiver problemas:

1. Verificar se banco está online
2. Verificar se usuário existe: `SELECT * FROM users WHERE email = 'seu-email';`
3. Verificar se role é 'admin': `SELECT role FROM users WHERE email = 'seu-email';`
4. Verificar logs do Netlify

---

**Versão:** 1.0  
**Data:** 2026-05-06  
**Status:** ✅ Completo
