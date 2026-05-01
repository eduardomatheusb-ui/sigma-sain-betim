# Correção de Busca de Aluno - Progresso

## Status: EM PROGRESSO

### Mudanças Realizadas em FarolGestao.tsx:

1. ✅ Adicionados estados:
   - `selectedSchoolId` - ID da escola selecionada
   - `selectedStudentId` - ID do aluno selecionado

2. ✅ Query de busca atualizada:
   - Agora passa `schoolId` como parâmetro
   - Só busca se `selectedSchoolId` estiver definido

3. ✅ Função `handleSchoolChange` criada:
   - Limpa busca de aluno ao trocar escola
   - Reseta `selectedStudentId`
   - Limpa input de nome do aluno

4. ✅ Select de escola atualizado:
   - Agora chama `handleSchoolChange` ao mudar

### Mudanças Pendentes:

1. ⏳ Atualizar Input de aluno:
   - Desabilitar até escola ser selecionada
   - Mostrar mensagem "Selecione primeiro a escola..."
   - Placeholder dinâmico

2. ⏳ Atualizar dropdown de resultados:
   - Mostrar "Nenhum aluno cadastrado para esta escola"
   - Mostrar "Aluno não encontrado nesta escola"
   - Usar `name` em vez de `studentName`

3. ⏳ Aplicar mesmo padrão em ExternalDemands.tsx

4. ⏳ Testes manuais

5. ⏳ Relatório final

### Próximas Ações:

Reescrever completamente a seção de Input de aluno (linhas 361-411) em FarolGestao.tsx
