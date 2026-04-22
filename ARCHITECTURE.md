# SIGMA - Arquitetura de Dados e Sistema

## Visão Geral

O SIGMA é um sistema de gestão integrada para a SAIN (Secretaria Adjunta de Inclusão) do município de Betim, focado no acompanhamento de alunos com necessidades especiais, mediadores e atendimentos escolares.

## Modelo de Dados

### Entidades Principais

#### 1. **Users** (Usuários)
Estende a tabela base com campos específicos para o SIGMA.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | Chave primária |
| openId | varchar | Identificador OAuth Manus |
| name | text | Nome completo |
| email | varchar | Email |
| role | enum | admin \| school_user |
| schoolId | int | FK para schools (null para admin) |
| isActive | boolean | Status do usuário |
| createdAt | timestamp | Data de criação |
| updatedAt | timestamp | Data de atualização |

#### 2. **Schools** (Escolas)
Unidades escolares da rede municipal.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | Chave primária |
| name | varchar | Nome da escola |
| code | varchar | Código único |
| address | text | Endereço |
| phone | varchar | Telefone |
| principal | varchar | Nome do diretor |
| createdAt | timestamp | Data de criação |
| updatedAt | timestamp | Data de atualização |

#### 3. **Students** (Alunos)
Alunos com necessidades especiais acompanhados pelo sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | Chave primária |
| name | varchar | Nome completo |
| dateOfBirth | date | Data de nascimento |
| cpf | varchar | CPF |
| schoolId | int | FK para schools |
| specialNeeds | text | Descrição das necessidades |
| status | enum | active \| inactive \| transferred |
| enrollmentNumber | varchar | Matrícula |
| guardianName | varchar | Nome do responsável |
| guardianPhone | varchar | Telefone do responsável |
| notes | text | Observações gerais |
| createdAt | timestamp | Data de criação |
| updatedAt | timestamp | Data de atualização |

#### 4. **Mediators** (Mediadores)
Profissionais que realizam atendimentos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | Chave primária |
| name | varchar | Nome completo |
| cpf | varchar | CPF |
| professionalLicense | varchar | Registro profissional |
| specialization | varchar | Especialização |
| schoolId | int | FK para schools (vinculação principal) |
| status | enum | active \| inactive \| on_leave |
| maxAttendances | int | Carga máxima de atendimentos |
| createdAt | timestamp | Data de criação |
| updatedAt | timestamp | Data de atualização |

#### 5. **Attendances** (Atendimentos)
Registro de atendimentos individuais e compartilhados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | Chave primária |
| studentId | int | FK para students |
| mediatorId | int | FK para mediators |
| schoolId | int | FK para schools |
| attendanceDate | date | Data do atendimento |
| startTime | time | Hora de início |
| endTime | time | Hora de término |
| description | text | Descrição do atendimento |
| status | enum | completed \| pending \| cancelled |
| type | enum | individual \| shared |
| notes | text | Observações |
| createdAt | timestamp | Data de criação |
| updatedAt | timestamp | Data de atualização |

#### 6. **SharedAttendances** (Atendimentos Compartilhados)
Vinculação de múltiplos mediadores a um atendimento.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | Chave primária |
| attendanceId | int | FK para attendances |
| mediatorId | int | FK para mediators |
| role | varchar | Papel do mediador (principal, apoio) |
| createdAt | timestamp | Data de criação |

#### 7. **ExternalDemands** (Demandas Externas)
Solicitações vindas de fora da rede.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | Chave primária |
| studentId | int | FK para students (opcional) |
| schoolId | int | FK para schools |
| demandType | varchar | Tipo de demanda |
| source | varchar | Origem (família, órgão externo, etc.) |
| description | text | Descrição da demanda |
| status | enum | pending \| in_progress \| resolved \| closed |
| priority | enum | low \| medium \| high |
| assignedTo | int | FK para users (responsável) |
| dueDate | date | Data limite |
| notes | text | Observações |
| createdAt | timestamp | Data de criação |
| updatedAt | timestamp | Data de atualização |

## Fluxos de Acesso

### Perfil: Admin SAIN
- Acesso total ao sistema
- Visão global de todas as escolas
- Dashboard com indicadores gerenciais
- Gestão de usuários
- Geração de relatórios consolidados

### Perfil: Usuário de Escola
- Acesso apenas aos dados da sua escola
- Visualização de alunos, mediadores e atendimentos da unidade
- Registro de atendimentos
- Visualização de demandas externas da escola
- Sem acesso a gestão de usuários

## Indicadores Principais (Dashboard SAIN)

1. **Total de Alunos**: Contagem de alunos ativos no sistema
2. **Mediadores Ativos**: Contagem de mediadores com status ativo
3. **Atendimentos em Andamento**: Contagem de atendimentos com status pending
4. **Demandas Pendentes**: Contagem de demandas externas com status pending
5. **Distribuição por Escola**: Gráfico com quantidade de alunos por unidade escolar
6. **Atendimentos por Período**: Gráfico de atendimentos realizados (últimos 30 dias)

## Identidade Visual

### Cores Institucionais
- **Azul Primário**: #004B99 (Betim)
- **Verde Secundário**: #9AC331 (Betim)
- **Branco**: #FFFFFF (Fundo)
- **Cinza Neutro**: #F5F5F5 (Superfícies)

### Tipografia
- **Fonte Principal**: Inter ou similar sans-serif moderna
- **Tamanho Base**: 16px
- **Line Height**: 1.5

### Componentes
- Sidebar com navegação principal
- Cards para agrupamento de informações
- Tabelas para listagens
- Modais para formulários
- Gráficos para indicadores

## Fluxo de Navegação

```
Home/Dashboard
├── Dashboard Gerencial (Admin SAIN)
├── Alunos
│   ├── Listagem
│   ├── Cadastro
│   └── Detalhes
├── Mediadores
│   ├── Listagem
│   ├── Cadastro
│   └── Detalhes
├── Escolas
│   ├── Visão Consolidada
│   └── Detalhes
├── Atendimentos
│   ├── Listagem
│   ├── Registro
│   └── Histórico
├── Demandas Externas
│   ├── Listagem
│   ├── Registro
│   └── Acompanhamento
├── Usuários (Admin)
│   ├── Listagem
│   ├── Criação
│   └── Edição
└── Relatórios
    ├── Filtros
    └── Exportação
```

## Segurança e Controle de Acesso

- **Autenticação**: OAuth Manus
- **Autorização**: Role-based (admin | school_user)
- **Isolamento de Dados**: Usuários de escola veem apenas dados da sua unidade
- **Auditoria**: Registro de criação e atualização em todas as tabelas
