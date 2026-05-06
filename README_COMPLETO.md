# 📚 SIGMA SAIN BETIM — Sistema Completo de Gestão de Mediadores e Atendimentos

## 🎯 Visão Geral

**SIGMA SAIN BETIM** é uma plataforma web completa para gestão da equipe de apoio e inclusão da Secretaria de Educação de Betim. O sistema permite:

- ✅ Cadastro e gestão de alunos, escolas e mediadores
- ✅ Acompanhamento de casos com quadro visual (Farol)
- ✅ Gestão de demandas internas e externas
- ✅ Controle de acesso granular por usuário
- ✅ Relatórios e dashboards
- ✅ Exportação de dados para Excel
- ✅ Autenticação segura (OAuth + senha)

---

## 📊 Estatísticas do Projeto

| Métrica | Valor |
|---------|-------|
| Alunos cadastrados | 1.125+ |
| Escolas | 95+ |
| Mediadores | 280+ |
| Demandas externas | 70+ |
| Testes automatizados | 147 ✅ |
| Linhas de código | 50.000+ |
| Componentes React | 100+ |
| Procedures tRPC | 80+ |
| Tabelas no banco | 15+ |
| Perfis de acesso | 7 |

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                  │
│  - Vite + Tailwind CSS 4                               │
│  - tRPC Client + React Query                           │
│  - Componentes shadcn/ui                               │
│  - Dashboards e relatórios                             │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/tRPC
┌────────────────▼────────────────────────────────────────┐
│                Backend (Express + tRPC)                 │
│  - Node.js + TypeScript                                │
│  - Autenticação OAuth + JWT                            │
│  - Validação Zod                                       │
│  - Procedures tRPC                                     │
└────────────────┬────────────────────────────────────────┘
                 │ SQL
┌────────────────▼────────────────────────────────────────┐
│           Banco de Dados (TiDB/MySQL)                  │
│  - 15+ tabelas                                         │
│  - Relacionamentos normalizados                        │
│  - Migrations automáticas (Drizzle)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Instalação Local

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/sigma-sain-betim.git
cd sigma-sain-betim

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# 4. Iniciar servidor de desenvolvimento
pnpm dev

# 5. Acessar em http://localhost:3000
```

### Variáveis de Ambiente Necessárias

```env
# Banco de dados
DATABASE_URL=mysql://user:password@host:port/database

# Autenticação
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
JWT_SECRET=seu_jwt_secret

# APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=sua_api_key
```

---

## 📁 Estrutura do Projeto

```
sigma-sain-betim/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas principais
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilidades
│   │   └── App.tsx           # Roteamento principal
│   └── index.html
├── server/                    # Backend Express + tRPC
│   ├── routers/              # Procedures tRPC
│   ├── db.ts                 # Query helpers
│   ├── _core/                # Autenticação, OAuth, contexto
│   └── index.ts              # Servidor principal
├── drizzle/                   # Schema e migrations
│   ├── schema.ts             # Definição de tabelas
│   └── migrations/           # SQL migrations
├── scripts/                   # Scripts auxiliares
│   └── migrate-legacy-students.mjs
├── dist/                      # Build de produção
├── package.json
├── vite.config.ts
├── tsconfig.json
└── netlify.toml              # Configuração Netlify
```

---

## 🔐 Autenticação

### OAuth (Manus)

O sistema usa OAuth do Manus para autenticação segura:

1. Usuário clica em "Entrar com Manus"
2. Redireciona para portal Manus
3. Após login, retorna com token JWT
4. Sistema cria sessão automática

### Login por Senha

Alternativa para usuários sem acesso ao OAuth:

1. Criar usuário com senha no painel admin
2. Usuário faz login com email + senha
3. Senha é verificada com bcrypt
4. Sessão criada com JWT

---

## 👥 Perfis de Acesso

| Perfil | Descrição | Permissões |
|--------|-----------|-----------|
| **admin** | Administrador do sistema | Acesso total |
| **user** | Usuário padrão | Acesso limitado |
| **craei_assessor** | Assessor CRAEI | Gestão de casos |
| **coordenacao_adjunta** | Coordenação Adjunta | Supervisão |
| **setor_atendentes** | Setor de Atendentes | Atendimento |
| **coordenacao_nucleo** | Coordenação de Núcleo | Organização |
| **guest** | Convidado | Visualização apenas |

**Permissões customizáveis:** Cada usuário pode ter permissões específicas por módulo (Visualizar, Editar, Deletar).

---

## 📋 Módulos Principais

### 1. Acompanhamento de Casos (Farol)
- Quadro visual com status de casos
- Filtros por escola, mediador, status
- Criação e edição de casos
- Exportação para Excel
- Busca de aluno dependente de escola

### 2. Demandas Externas
- Registro de demandas de órgãos externos
- Vinculação a alunos e escolas
- Rastreamento de status
- Histórico de alterações

### 3. Demandas Internas
- Registro de demandas internas
- Gestão de prioridades
- Atribuição a mediadores
- Acompanhamento

### 4. Cadastros
- **Alunos:** 1.125+ registros com dados completos
- **Escolas:** 95+ escolas de Betim
- **Mediadores:** Atendentes e profissionais de apoio
- **Usuários:** Gestão de acesso

### 5. Relatórios
- Dashboards com métricas
- Gráficos de acompanhamento
- Exportação de dados
- Filtros por período e escola

### 6. Administração
- Painel de permissões por usuário
- Gestão de módulos
- Controle de acesso granular
- Auditoria de ações

---

## 🧪 Testes

### Rodar Testes

```bash
# Todos os testes
pnpm test

# Resultado esperado: 147/147 testes passando ✅
```

### Testes Incluídos

- ✅ Autenticação e autorização
- ✅ CRUD de usuários
- ✅ Gestão de casos
- ✅ Demandas
- ✅ Permissões
- ✅ Validações Zod
- ✅ Integrações tRPC

---

## 🏗️ Build e Deploy

### Build Local

```bash
# Build de produção
pnpm build

# Resultado: dist/ com frontend + backend compilados
```

### Deploy no Netlify

```bash
# 1. Conectar repositório ao Netlify
# 2. Configurar variáveis de ambiente
# 3. Netlify faz deploy automático a cada push

# Ou fazer deploy manual:
netlify deploy --prod
```

Veja **DEPLOY_NETLIFY.md** para instruções detalhadas.

---

## 🔄 Fluxos Principais

### Fluxo 1: Criar Caso de Acompanhamento

```
1. Usuário acessa "Acompanhamento de Casos"
2. Clica em "Novo Caso"
3. Seleciona escola (busca local)
4. Seleciona aluno (busca dependente da escola)
5. Preenche dados do caso
6. Salva no banco de dados
7. Caso aparece no quadro Farol
```

### Fluxo 2: Criar Demanda Externa

```
1. Usuário acessa "Demandas Externas"
2. Clica em "Nova Demanda"
3. Seleciona escola e aluno
4. Preenche informações da demanda
5. Salva no banco
6. Demanda rastreável e editável
```

### Fluxo 3: Gerenciar Permissões

```
1. Admin acessa "Permissões"
2. Seleciona usuário
3. Marca checkboxes de permissões (Visualizar, Editar, Deletar)
4. Seleciona escolas vinculadas
5. Salva permissões
6. Usuário vê apenas módulos permitidos
```

---

## 🐛 Troubleshooting

### Erro: "Aluno não encontrado"
- Verificar se a escola está selecionada
- Verificar se há alunos cadastrados para essa escola
- Tentar buscar com nome parcial

### Erro: "Permissão negada"
- Verificar perfil do usuário
- Verificar permissões no painel admin
- Verificar se usuário está vinculado à escola

### Erro: "Banco de dados indisponível"
- Verificar `DATABASE_URL`
- Verificar conexão de rede
- Verificar credenciais do banco

### Erro: "OAuth falhou"
- Verificar `VITE_APP_ID`
- Verificar `OAUTH_SERVER_URL`
- Verificar se app está registrado no Manus

---

## 📝 Documentação Adicional

- **DEPLOY_NETLIFY.md** — Guia completo de deploy
- **SIGMA-SISTEMA-DOCUMENTACAO.md** — Documentação técnica detalhada
- **todo.md** — Histórico de features implementadas

---

## 🤝 Contribuindo

Para contribuir ao projeto:

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Faça suas alterações
3. Rode testes: `pnpm test`
4. Commit: `git commit -m "Add: sua feature"`
5. Push: `git push origin feature/sua-feature`
6. Abra um Pull Request

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação em `DEPLOY_NETLIFY.md`
2. Verifique os logs do servidor
3. Rode testes localmente
4. Consulte a documentação técnica

---

## 📄 Licença

Este projeto é propriedade da Secretaria de Educação de Betim.

---

## 🎉 Status

**Versão:** 1.0  
**Status:** ✅ Pronto para produção  
**Última atualização:** 2026-05-06  
**Testes:** 147/147 passando  
**Build:** Sucesso  

---

## 📊 Funcionalidades Implementadas

### ✅ Fase 1: Autenticação
- [x] Login OAuth (Manus)
- [x] Login por senha (email + bcrypt)
- [x] Sessões JWT
- [x] Logout

### ✅ Fase 2: Gestão de Usuários
- [x] CRUD de usuários
- [x] 7 perfis de acesso
- [x] Atribuição de escolas
- [x] Painel de permissões

### ✅ Fase 3: Cadastros
- [x] Alunos (1.125+ registros)
- [x] Escolas (95+ escolas)
- [x] Mediadores
- [x] Busca de aluno dependente de escola

### ✅ Fase 4: Acompanhamento
- [x] Quadro Farol
- [x] Criação de casos
- [x] Filtros e buscas
- [x] Exportação Excel

### ✅ Fase 5: Demandas
- [x] Demandas externas
- [x] Demandas internas
- [x] Rastreamento
- [x] Histórico

### ✅ Fase 6: Permissões
- [x] Permissões granulares
- [x] Painel de administração
- [x] Validação no backend

---

**Desenvolvido com ❤️ para a Secretaria de Educação de Betim**
