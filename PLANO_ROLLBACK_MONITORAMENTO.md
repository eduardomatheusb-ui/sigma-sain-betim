# Plano de Rollback e Monitoramento — NEXUS

**Procedimentos de contingência, rollback e monitoramento para uso inicial assistido**

**Data:** 01 de maio de 2026  
**Versão:** 1.0  
**Status:** Pronto para Implementação

---

## 1. Visão Geral

Este plano define os procedimentos para:
- Monitorar a saúde do sistema
- Identificar problemas rapidamente
- Executar rollback se necessário
- Recuperar de falhas

---

## 2. Checkpoint de Referência

### Versão Estável Atual

**Versão:** 132db7e3  
**Data:** 01 de maio de 2026  
**Descrição:** Fase 55 — Reorganização de Menu Lateral (COMPLETA)

**O que está incluído:**
- ✅ Menu reorganizado com Dashboard, Cadastro, Mediadores, Acompanhamento de Casos
- ✅ 147 testes passando
- ✅ 0 erros TypeScript
- ✅ Todas as permissões validadas
- ✅ Segurança básica implementada

**Como recuperar para esta versão:**
```bash
git checkout 132db7e3
```

---

## 3. Monitoramento de Logs

### Logs Disponíveis

| Log | Localização | Frequência | Ação |
|-----|-------------|-----------|------|
| **Dev Server** | `.manus-logs/devserver.log` | Contínuo | Verificar diariamente |
| **Browser Console** | `.manus-logs/browserConsole.log` | Contínuo | Verificar se houver erro |
| **Network Requests** | `.manus-logs/networkRequests.log` | Contínuo | Verificar se houver lentidão |
| **Session Replay** | `.manus-logs/sessionReplay.log` | Contínuo | Verificar se houver problema |

### Como Acessar Logs

1. Acesse o diretório `.manus-logs/` do projeto
2. Abra o arquivo de log desejado
3. Use `grep` ou `tail` para filtrar informações

**Exemplo:**
```bash
tail -f .manus-logs/devserver.log
grep "ERROR" .manus-logs/devserver.log
```

### O Que Procurar

- ❌ **ERROR:** Erros críticos
- ⚠️ **WARN:** Avisos importantes
- ℹ️ **INFO:** Informações gerais
- 🔍 **DEBUG:** Informações de debug

---

## 4. Alertas Críticos

### Alertas a Monitorar

| Alerta | Severidade | Ação | Tempo de Resposta |
|--------|-----------|------|------------------|
| **Sistema Fora do Ar** | 🔴 Crítica | Ativar contingência | 15 minutos |
| **Perda de Dados** | 🔴 Crítica | Restaurar backup | 30 minutos |
| **Taxa de Erro > 1%** | 🔴 Crítica | Investigar | 1 hora |
| **Tempo de Resposta > 5s** | 🟠 Alta | Investigar | 2 horas |
| **Erro ao Salvar** | 🟠 Alta | Investigar | 2 horas |
| **Acesso Negado Indevido** | 🟠 Alta | Investigar | 2 horas |

---

## 5. Checklist de Monitoramento Diário

### Manhã (8h)

- [ ] Verificar se sistema está online
- [ ] Verificar logs de erro da noite anterior
- [ ] Verificar se backups foram executados
- [ ] Verificar performance (tempo de resposta)
- [ ] Verificar se há alertas pendentes

### Meio do Dia (12h)

- [ ] Verificar se há problemas de acesso
- [ ] Verificar se há erros de permissão
- [ ] Verificar se há problemas de dados
- [ ] Verificar feedback de usuários

### Fim do Dia (17h)

- [ ] Resumir problemas do dia
- [ ] Documentar soluções aplicadas
- [ ] Preparar relatório para próximo dia
- [ ] Confirmar que backups foram executados

---

## 6. Procedimento de Rollback

### Quando Fazer Rollback

Fazer rollback quando:
- ❌ Sistema está fora do ar
- ❌ Perda de dados ocorreu
- ❌ Segurança foi comprometida
- ❌ Múltiplos usuários afetados
- ❌ Problema não pode ser resolvido rapidamente

### Passos para Rollback

**1. Parar o Sistema**
```bash
# Parar o servidor
pnpm stop
```

**2. Restaurar Versão Anterior**
```bash
# Voltar para versão estável
git checkout 132db7e3
```

**3. Restaurar Banco de Dados (se necessário)**
```bash
# Restaurar backup mais recente
# Contatar admin para acesso ao backup
```

**4. Reiniciar o Sistema**
```bash
# Instalar dependências
pnpm install

# Iniciar servidor
pnpm dev
```

**5. Validar Sistema**
- [ ] Verificar se sistema está online
- [ ] Testar login com cada perfil
- [ ] Verificar se dados estão intactos
- [ ] Verificar se permissões funcionam
- [ ] Confirmar que alertas foram resolvidos

**6. Comunicar Usuários**
- [ ] Enviar email explicando o rollback
- [ ] Informar tempo de indisponibilidade
- [ ] Fornecer contato de suporte
- [ ] Solicitar feedback

---

## 7. Plano de Contingência

### Cenário 1: Sistema Fora do Ar

**Causa:** Servidor indisponível

**Ação Imediata:**
1. Verificar status do servidor
2. Reiniciar servidor se necessário
3. Verificar logs de erro
4. Comunicar usuários

**Se não resolver em 15 minutos:**
1. Ativar rollback para versão anterior
2. Restaurar backup se necessário
3. Comunicar usuários sobre atraso

### Cenário 2: Perda de Dados

**Causa:** Erro ao salvar ou corrupção de dados

**Ação Imediata:**
1. Parar o sistema
2. Restaurar backup mais recente
3. Verificar integridade dos dados
4. Reiniciar sistema

**Se dados ainda estiverem corrompidos:**
1. Restaurar backup anterior
2. Reprocessar dados manualmente se necessário
3. Comunicar usuários sobre perda de dados

### Cenário 3: Segurança Comprometida

**Causa:** Acesso não autorizado ou vazamento de dados

**Ação Imediata:**
1. Parar o sistema
2. Investigar causa
3. Revogar acessos comprometidos
4. Restaurar backup se necessário
5. Comunicar usuários

**Se comprometimento for grave:**
1. Ativar rollback para versão anterior
2. Resetar todas as senhas
3. Auditar todos os acessos
4. Comunicar usuários

---

## 8. Métricas de Saúde

### Indicadores a Acompanhar

| Métrica | Meta | Frequência | Ação |
|---------|------|-----------|------|
| **Uptime** | > 99% | Diária | Investigar se < 99% |
| **Tempo de Resposta** | < 2s | Diária | Investigar se > 5s |
| **Taxa de Erro** | < 0,1% | Diária | Investigar se > 1% |
| **Satisfação do Usuário** | > 4/5 | Semanal | Coletar feedback |
| **Backup Status** | 100% | Diária | Verificar se falhou |

### Dashboard de Monitoramento

**Ferramentas Recomendadas:**
- Grafana (visualização de métricas)
- Prometheus (coleta de métricas)
- ELK Stack (análise de logs)
- Sentry (rastreamento de erros)

---

## 9. Comunicação

### Canais de Comunicação

| Tipo | Canal | Destinatário | Frequência |
|------|-------|-------------|-----------|
| **Alerta Crítico** | Email + SMS | Admin, Suporte | Imediato |
| **Alerta Alto** | Email | Admin, Suporte | Imediato |
| **Alerta Médio** | Email | Admin | Diário |
| **Relatório** | Email | Stakeholders | Semanal |

### Template de Comunicação

**Assunto:** [ALERTA] Sistema NEXUS - [Tipo de Problema]

**Corpo:**
```
Prezados,

Informamos que foi detectado um problema no sistema NEXUS:

Problema: [Descrição do problema]
Severidade: [Crítica/Alta/Média]
Hora de Detecção: [Hora]
Status: [Investigando/Resolvendo/Resolvido]
Tempo Estimado de Resolução: [Tempo]

Ações Tomadas:
- [Ação 1]
- [Ação 2]

Próximos Passos:
- [Próximo passo 1]
- [Próximo passo 2]

Contato de Suporte: suporte@nexus.betim.gov.br
Telefone: (31) 3334-XXXX

Obrigado pela compreensão.
```

---

## 10. Documentação de Incidentes

### Formulário de Incidente

| Campo | Descrição |
|-------|-----------|
| **ID do Incidente** | Número único |
| **Data/Hora** | Quando ocorreu |
| **Tipo** | Qual tipo de problema |
| **Severidade** | Crítica/Alta/Média/Baixa |
| **Descrição** | O que aconteceu |
| **Causa Raiz** | Por que aconteceu |
| **Ações Tomadas** | O que foi feito |
| **Resultado** | Como foi resolvido |
| **Lições Aprendidas** | O que aprender |
| **Tempo de Resolução** | Quanto tempo levou |

### Exemplo de Incidente

```
ID: INC-001
Data/Hora: 01/05/2026 10:30
Tipo: Sistema Fora do Ar
Severidade: Crítica
Descrição: Sistema NEXUS indisponível por 15 minutos
Causa Raiz: Servidor web parou de responder
Ações Tomadas: Reiniciou servidor, verificou logs
Resultado: Sistema restaurado
Lições Aprendidas: Implementar monitoramento automático
Tempo de Resolução: 15 minutos
```

---

## 11. Testes de Recuperação

### Teste Mensal de Rollback

1. **Agendar:** Primeira sexta-feira do mês, 18h
2. **Preparar:** Notificar usuários com 1 semana de antecedência
3. **Executar:** Fazer rollback para versão anterior
4. **Validar:** Verificar se sistema funciona corretamente
5. **Documentar:** Registrar resultado do teste
6. **Restaurar:** Voltar para versão atual

### Teste Mensal de Backup

1. **Agendar:** Segunda sexta-feira do mês, 18h
2. **Executar:** Restaurar backup em ambiente de teste
3. **Validar:** Verificar integridade dos dados
4. **Documentar:** Registrar resultado do teste
5. **Arquivar:** Guardar resultado para referência

---

## 12. Contatos de Emergência

### Escalação

| Nível | Nome | Telefone | Email | Disponibilidade |
|-------|------|----------|-------|-----------------|
| **1º Nível** | Suporte Técnico | (31) 3334-XXXX | suporte@nexus.betim.gov.br | 8h-17h |
| **2º Nível** | Administrador | (31) 99999-XXXX | admin@nexus.betim.gov.br | 24/7 |
| **3º Nível** | Desenvolvedor | (31) 98888-XXXX | dev@nexus.betim.gov.br | 24/7 |

---

## Assinatura e Aprovação

**Preparado por:** Equipe de Desenvolvimento  
**Data:** 01 de maio de 2026  
**Aprovado por:** Administrador do Sistema  
**Data de Aprovação:** ___/___/______

---

**Última atualização:** 01 de maio de 2026  
**Próxima revisão:** 01 de junho de 2026
