-- Fase 51: Expansão completa do módulo Demandas Externas
-- Adiciona novos campos à tabela externalDemands existente
-- e cria tabelas de movimentações e auditoria próprias

-- 1. Adicionar novos campos à tabela externalDemands
ALTER TABLE `externalDemands`
  ADD COLUMN IF NOT EXISTS `protocolo` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `origem` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `orgaoSetor` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `tipoDocumento` ENUM('oficio','notificacao','recomendacao','requisicao','encaminhamento','solicitacao','denuncia','outros') NOT NULL DEFAULT 'oficio',
  ADD COLUMN IF NOT EXISTS `dataRecebimento` DATE NULL,
  ADD COLUMN IF NOT EXISTS `prazoResposta` DATE NULL,
  ADD COLUMN IF NOT EXISTS `dataEncaminhamento` DATE NULL,
  ADD COLUMN IF NOT EXISTS `prioridade` ENUM('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
  ADD COLUMN IF NOT EXISTS `responsavelId` INT NULL,
  ADD COLUMN IF NOT EXISTS `responsavelNome` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `studentName` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `resumo` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `descricaoCompleta` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `documentosLinks` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `respostaElaborada` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `situacaoFinal` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `createdBy` INT NULL,
  ADD COLUMN IF NOT EXISTS `createdByName` VARCHAR(255) NULL;

-- 2. Alterar o enum de status para os novos valores institucionais
-- MySQL não suporta ALTER COLUMN para ENUM diretamente, então modificamos a coluna
ALTER TABLE `externalDemands`
  MODIFY COLUMN `status` ENUM(
    'Recebida',
    'Triagem/Protocolo',
    'Em instrução técnica',
    'Devolvida para complementação',
    'Em validação do gabinete',
    'Aguardando assinatura',
    'Assinada',
    'Encaminhada à SEMED',
    'Arquivada',
    'pending',
    'in_progress',
    'resolved',
    'closed'
  ) NOT NULL DEFAULT 'Recebida';

-- 3. Criar tabela de movimentações de demandas externas
CREATE TABLE IF NOT EXISTS `externalDemandMovements` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `demandId` INT NOT NULL,
  `statusAnterior` VARCHAR(100) NULL,
  `statusNovo` VARCHAR(100) NOT NULL,
  `observacao` TEXT NULL,
  `userId` INT NOT NULL,
  `userName` VARCHAR(255) NOT NULL,
  `userRole` VARCHAR(50) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criar tabela de auditoria de demandas externas
CREATE TABLE IF NOT EXISTS `externalDemandAudit` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `demandId` INT NOT NULL,
  `acao` ENUM('criacao','edicao','mudanca_status','exclusao') NOT NULL,
  `campoAlterado` VARCHAR(100) NULL,
  `valorAnterior` TEXT NULL,
  `valorNovo` TEXT NULL,
  `userId` INT NOT NULL,
  `userName` VARCHAR(255) NOT NULL,
  `userRole` VARCHAR(50) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tornar schoolId opcional (era NOT NULL)
ALTER TABLE `externalDemands`
  MODIFY COLUMN `schoolId` INT NULL;
