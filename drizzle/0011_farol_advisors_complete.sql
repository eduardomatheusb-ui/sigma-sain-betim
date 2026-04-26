-- Fase 33: Módulo de Assessores do Farol
-- Tabela farol_advisors com 15 campos obrigatórios

ALTER TABLE `farol_advisors` ADD COLUMN `email` varchar(255) NOT NULL DEFAULT '';
ALTER TABLE `farol_advisors` ADD COLUMN `telefone` varchar(20) NOT NULL DEFAULT '';
ALTER TABLE `farol_advisors` ADD COLUMN `cargo` varchar(100) NOT NULL DEFAULT '';
ALTER TABLE `farol_advisors` ADD COLUMN `areaAtuacao` varchar(100) NOT NULL DEFAULT '';
ALTER TABLE `farol_advisors` ADD COLUMN `createdBy` int DEFAULT NULL;
ALTER TABLE `farol_advisors` ADD COLUMN `updatedBy` int DEFAULT NULL;
ALTER TABLE `farol_advisors` ADD COLUMN `isDeleted` boolean DEFAULT false;
ALTER TABLE `farol_advisors` ADD COLUMN `deletedAt` datetime DEFAULT NULL;
ALTER TABLE `farol_advisors` ADD COLUMN `deletedBy` int DEFAULT NULL;

-- Criar índices para melhor performance
CREATE INDEX `idx_farol_advisors_regional` ON `farol_advisors` (`regional`);
CREATE INDEX `idx_farol_advisors_ativo` ON `farol_advisors` (`active`);
CREATE INDEX `idx_farol_advisors_isDeleted` ON `farol_advisors` (`isDeleted`);
CREATE INDEX `idx_farol_advisors_areaAtuacao` ON `farol_advisors` (`areaAtuacao`);
