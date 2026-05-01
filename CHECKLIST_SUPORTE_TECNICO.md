# Checklist de Suporte Técnico Inicial — NEXUS

**Procedimentos e verificações para suporte técnico no uso inicial do sistema**

**Data:** 01 de maio de 2026  
**Versão:** 1.0

---

## 1. Verificação Pré-Uso

### Antes de Liberar o Sistema para Usuários

- [ ] Confirmar que todos os usuários foram cadastrados
- [ ] Confirmar que todas as escolas foram cadastradas
- [ ] Confirmar que todas as permissões foram configuradas
- [ ] Testar login com cada perfil (Admin, Assessor, Coordenador, Escola, Externo)
- [ ] Confirmar que dados de alunos foram importados/cadastrados
- [ ] Confirmar que dados de mediadores foram importados/cadastrados
- [ ] Verificar que backups automáticos estão funcionando
- [ ] Confirmar que logs estão sendo registrados

---

## 2. Procedimentos de Login

### Ajudar Usuário com Primeiro Acesso

1. **Verificar Email:** Confirmar que o usuário recebeu email de convite
2. **Verificar Credenciais:** Confirmar que email e senha estão corretos
3. **Verificar Permissões:** Confirmar que o usuário tem permissão para acessar
4. **Testar Login:** Fazer login com as credenciais do usuário
5. **Confirmar Acesso:** Confirmar que o usuário consegue acessar todos os módulos permitidos

### Checklist de Troubleshooting

- [ ] Email de convite foi enviado?
- [ ] Usuário recebeu o email?
- [ ] Usuário confirmou o email?
- [ ] Senha foi criada corretamente?
- [ ] Perfil foi atribuído corretamente?
- [ ] Escola foi vinculada corretamente?

---

## 3. Reset de Senha

### Procedimento Padrão

1. **Solicitar Email:** Pedir email do usuário
2. **Gerar Link:** Gerar link de reset de senha
3. **Enviar Email:** Enviar email com link
4. **Confirmar Recebimento:** Confirmar que usuário recebeu
5. **Testar Nova Senha:** Testar login com nova senha

### Checklist

- [ ] Email foi enviado?
- [ ] Link é válido?
- [ ] Usuário conseguiu criar nova senha?
- [ ] Login funciona com nova senha?

---

## 4. Problemas Comuns e Soluções

### Problema: "Acesso Negado"

**Causas Possíveis:**
- Usuário não tem permissão
- Perfil não foi atribuído
- Escola não foi vinculada

**Solução:**
1. Verificar perfil do usuário
2. Verificar se escola foi vinculada
3. Verificar permissões de acesso
4. Atribuir permissões se necessário

### Problema: "Página em Branco"

**Causas Possíveis:**
- Navegador não compatível
- Cache do navegador
- Conexão de internet

**Solução:**
1. Tentar outro navegador
2. Limpar cache (Ctrl+Shift+Delete)
3. Verificar conexão de internet
4. Recarregar página (F5)

### Problema: "Erro ao Salvar"

**Causas Possíveis:**
- Campos obrigatórios não preenchidos
- Dados duplicados
- Conexão perdida

**Solução:**
1. Verificar campos obrigatórios
2. Verificar se dados já existem
3. Verificar conexão de internet
4. Tentar novamente

### Problema: "Relatório Não Gera"

**Causas Possíveis:**
- Filtros inválidos
- Muitos dados
- Timeout do servidor

**Solução:**
1. Verificar filtros
2. Reduzir período de dados
3. Tentar novamente em alguns minutos
4. Contatar admin se persistir

### Problema: "Não Consigo Visualizar Dados de Outra Escola"

**Causas Possíveis:**
- Permissão restrita
- Isolamento de dados por escola
- Usuário não tem acesso

**Solução:**
1. Confirmar que é esperado (isolamento de dados)
2. Verificar permissões
3. Contatar admin se necessário

---

## 5. Contatos de Suporte

### Níveis de Suporte

| Nível | Responsável | Contato | Tempo de Resposta |
|-------|-------------|---------|------------------|
| **1 - Primeiro Nível** | Suporte Técnico | suporte@nexus.betim.gov.br | 2 horas |
| **2 - Segundo Nível** | Administrador | admin@nexus.betim.gov.br | 4 horas |
| **3 - Terceiro Nível** | Desenvolvedor | dev@nexus.betim.gov.br | 24 horas |

### Informações de Contato

**Email de Suporte:** suporte@nexus.betim.gov.br  
**Telefone:** (31) 3334-XXXX  
**WhatsApp:** (31) 99999-XXXX  
**Horário de Atendimento:** Segunda a sexta, 8h às 17h  
**Emergências:** Disponível 24/7 (ligar para admin)

---

## 6. SLA (Acordo de Nível de Serviço)

| Tipo de Problema | Prioridade | Tempo de Resposta | Tempo de Resolução |
|---|---|---|---|
| **Sistema Fora do Ar** | Crítica | 15 minutos | 1 hora |
| **Perda de Dados** | Crítica | 30 minutos | 2 horas |
| **Erro ao Salvar** | Alta | 1 hora | 4 horas |
| **Acesso Negado** | Alta | 1 hora | 2 horas |
| **Dúvida de Uso** | Média | 2 horas | 24 horas |
| **Melhoria Solicitada** | Baixa | 24 horas | Próxima sprint |

---

## 7. Checklist de Início de Operação

### Dia 1 (Liberação)

- [ ] Todos os usuários conseguem fazer login
- [ ] Todos os dados foram importados
- [ ] Menu está funcionando corretamente
- [ ] Permissões estão corretas
- [ ] Suporte técnico está disponível
- [ ] Documentação foi distribuída

### Semana 1

- [ ] Monitorar problemas de login
- [ ] Monitorar problemas de permissão
- [ ] Coletar feedback dos usuários
- [ ] Documentar problemas encontrados
- [ ] Criar FAQ com problemas comuns

### Mês 1

- [ ] Revisar logs de erro
- [ ] Avaliar performance
- [ ] Coletar feedback detalhado
- [ ] Planejar melhorias
- [ ] Documentar lições aprendidas

---

## 8. Monitoramento

### Indicadores a Acompanhar

- **Uptime:** Disponibilidade do sistema (meta: 99%)
- **Tempo de Resposta:** Velocidade do sistema (meta: < 2s)
- **Taxa de Erro:** Quantidade de erros (meta: < 0,1%)
- **Satisfação do Usuário:** Feedback dos usuários (meta: > 4/5)

### Ferramentas de Monitoramento

- Logs de erro (verificar diariamente)
- Performance (verificar semanalmente)
- Backup (verificar diariamente)
- Segurança (verificar semanalmente)

---

## 9. Escalação

### Quando Escalar

- Problema não resolvido em 2 horas
- Múltiplos usuários afetados
- Perda de dados
- Segurança comprometida
- Sistema fora do ar

### Procedimento de Escalação

1. **Documentar:** Registrar problema com detalhes
2. **Notificar:** Informar admin/desenvolvedor
3. **Acompanhar:** Acompanhar resolução
4. **Comunicar:** Informar usuário do progresso
5. **Resolver:** Confirmar resolução com usuário

---

## 10. Documentação

### Documentos Disponíveis

- [ ] Manual do Administrador
- [ ] Manual do Assessor SAIN
- [ ] Manual do Coordenador
- [ ] Manual da Escola
- [ ] Guia Rápido de Demandas Externas
- [ ] Guia Rápido do Quadro de Mediadores
- [ ] FAQ (Perguntas Frequentes)
- [ ] Vídeos de Treinamento

### Distribuição de Documentação

- [ ] Email para todos os usuários
- [ ] Disponível no site do NEXUS
- [ ] Impressão para escolas sem acesso digital
- [ ] Treinamento presencial (opcional)

---

## Assinatura e Aprovação

**Preparado por:** Equipe de Suporte Técnico  
**Data:** 01 de maio de 2026  
**Aprovado por:** Administrador do Sistema  
**Data de Aprovação:** ___/___/______

---

**Última atualização:** 01 de maio de 2026  
**Próxima revisão:** 01 de junho de 2026
