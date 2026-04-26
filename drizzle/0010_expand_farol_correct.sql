-- Add missing columns to farol_cases table
ALTER TABLE `farol_cases` 
ADD COLUMN `nomeEstudante` varchar(255) AFTER `numeroCaso`,
ADD COLUMN `diagnostico` text AFTER `nomeEstudante`,
ADD COLUMN `telefone` varchar(20) AFTER `responsavel`,
ADD COLUMN `analiseConjunta` text AFTER `origem`,
ADD COLUMN `setorCraei` varchar(255) AFTER `analiseConjunta`,
ADD COLUMN `profissionalResponsavelId` int AFTER `setorCraei`,
ADD COLUMN `coordenadorResponsavelId` int AFTER `profissionalResponsavelId`,
ADD COLUMN `classificacaoCaso` varchar(100) AFTER `status`,
ADD COLUMN `alerta` boolean DEFAULT false AFTER `classificacaoCaso`,
ADD COLUMN `observacaoGeral` text AFTER `alerta`,
ADD COLUMN `driveFolderUrl` varchar(500) AFTER `observacaoGeral`,
ADD COLUMN `active` boolean DEFAULT true NOT NULL AFTER `driveFolderUrl`,
ADD COLUMN `updatedBy` int AFTER `createdByName`,
ADD COLUMN `updatedByName` varchar(255) AFTER `updatedBy`;

-- Update farol_case_history with new fields
ALTER TABLE `farol_case_history` 
CHANGE COLUMN `tipoAcao` `actionType` varchar(100) NOT NULL,
CHANGE COLUMN `descricao` `description` text,
ADD COLUMN `forwarding` text AFTER `description`,
ADD COLUMN `internalNote` text AFTER `forwarding`,
ADD COLUMN `createdByRole` varchar(50) AFTER `createdByName`;

-- Create farol_audit table if not exists
CREATE TABLE IF NOT EXISTS `farol_audit` (
  `id` int AUTO_INCREMENT NOT NULL,
  `caseId` int,
  `numeroCaso` varchar(50),
  `actionType` varchar(100) NOT NULL,
  `userId` int NOT NULL,
  `userName` varchar(255) NOT NULL,
  `userRole` varchar(50) NOT NULL,
  `targetField` varchar(100),
  `oldValue` text,
  `newValue` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `farol_audit_id` PRIMARY KEY(`id`)
);

-- Create farol_advisors table if not exists
CREATE TABLE IF NOT EXISTS `farol_advisors` (
  `id` int AUTO_INCREMENT NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(320),
  `regional` varchar(100) NOT NULL,
  `schools` text,
  `role` enum('admin','coordinator','advisor','childhood_coordination','viewer') NOT NULL DEFAULT 'advisor',
  `active` boolean DEFAULT true NOT NULL,
  `createdBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedBy` int,
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `farol_advisors_id` PRIMARY KEY(`id`)
);
