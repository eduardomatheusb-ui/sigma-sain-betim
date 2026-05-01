# NEXUS — Histórico de Migrations

> **Importante:** As migrations deste projeto são aplicadas manualmente via `webdev_execute_sql` (não via `drizzle-kit migrate`). O journal do Drizzle (`meta/_journal.json`) registra apenas as migrations 0000–0009 geradas automaticamente. As migrations 0010+ foram aplicadas manualmente e estão documentadas aqui.

---

## Ordem Correta de Execução (ambiente limpo)

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `0000_bitter_wolverine.sql` | Schema inicial (users, schools, students, mediators, attendances, externalDemands) | ✅ Aplicada |
| `0001_watery_living_tribunal.sql` | Expansão inicial do schema | ✅ Aplicada |
| `0002_wet_rocket_racer.sql` | Campos adicionais | ✅ Aplicada |
| `0003_ordinary_boomer.sql` | Campos adicionais | ✅ Aplicada |
| `0004_outstanding_talkback.sql` | Campos adicionais | ✅ Aplicada |
| `0005_peaceful_mentor.sql` | **USAR ESTE** — Schema completo com demands, mediatorStudents, statusHistory, weeklySnapshots | ✅ Aplicada |
| ~~`0005_add_evening_shift.sql`~~ | **IGNORAR** — Duplicata do 0005, conteúdo já incluído em `0005_peaceful_mentor.sql` | ⚠️ Duplicata |
| `0006_create_demands.sql` | Criação da tabela demands (Quadro de Atendentes) | ✅ Aplicada |
| `0007` (journal) | Campos adicionais | ✅ Aplicada |
| `0008_pink_maria_hill.sql` | Campos adicionais | ✅ Aplicada |
| `0009_flat_kate_bishop.sql` | Expansão do schema do Farol | ✅ Aplicada |
| `0010_expand_farol_correct.sql` | **USAR ESTE** — Estrutura correta do farol_cases, farol_case_history, farol_audit, farol_advisors | ✅ Aplicada |
| ~~`0010_expand_farol.sql`~~ | **IGNORAR** — Versão com DROP TABLE problemático, substituída por `0010_expand_farol_correct.sql` | ⚠️ Duplicata |
| `0011_farol_advisors_complete.sql` | Campos completos do farol_advisors | ✅ Aplicada |
| `0012_add_nome_to_farol_cases.sql` | Campo `nome` no farol_cases | ✅ Aplicada |
| `0013_expand_role_enum.sql` | Adiciona roles: `sain_assessor`, `coordinator`, `external_professional`, `school_user` | ✅ Aplicada |
| `0014_farol_advisors_userid.sql` | Campo `userId` (FK → users) no farol_advisors | ✅ Aplicada |
| `0015_coordinator_and_user_schools.sql` | Tabela `user_schools` (many-to-many usuário-escola) + migração de dados | ✅ Aplicada |

---

## Arquivos Duplicados a Ignorar

- **`0005_add_evening_shift.sql`**: Adiciona `evening` ao enum `shift` de `students`. Este conteúdo já está incluído em `0005_peaceful_mentor.sql`. Não executar separadamente.
- **`0010_expand_farol.sql`**: Versão problemática com `DROP TABLE` e `ALTER TABLE` conflitantes. Substituída por `0010_expand_farol_correct.sql`.

---

## Notas para Deploy em Ambiente Limpo

1. Executar as migrations na ordem numérica, **ignorando os arquivos duplicados** listados acima.
2. Após aplicar `0015_coordinator_and_user_schools.sql`, verificar se a migração de dados (`INSERT INTO user_schools SELECT ...`) foi executada.
3. O banco de dados de produção (TiDB/MySQL) já tem todas as migrations aplicadas. Esta documentação é para referência em novos ambientes.

---

## Fonte Oficial de Dados de Alunos

> **IMPORTANTE:** A tabela `demands` é a **fonte oficial** para contagem e listagem de alunos no sistema NEXUS. A tabela `students` existe para compatibilidade com o módulo de atendimentos, mas **não deve ser usada** para dashboards, relatórios ou exports. Use sempre `demands` para evitar divergências.

```typescript
// ✅ CORRETO — usar demands para contar alunos
const count = await db.select({ id: demands.id }).from(demands).where(eq(demands.schoolId, schoolId));

// ❌ INCORRETO — não usar students para contagens
const count = await db.select({ id: students.id }).from(students).where(eq(students.schoolId, schoolId));
```
