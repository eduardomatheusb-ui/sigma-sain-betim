-- Expand farol_cases table with complete fields
ALTER TABLE `farol_cases` 
ADD COLUMN `nomeEstudante` varchar(255) NOT NULL AFTER `numeroCaso`,
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
ADD COLUMN `updatedByName` varchar(255) AFTER `updatedBy`,
MODIFY COLUMN `dataEntrada` date NOT NULL,
MODIFY COLUMN `responsavel` varchar(255),
DROP COLUMN `nome`,
DROP COLUMN `escola`,
DROP COLUMN `segmento`,
DROP COLUMN `tipoDemanda`,
DROP COLUMN `origem`,
DROP COLUMN `situacao`,
DROP COLUMN `status`,
DROP COLUMN `classificacao`,
DROP COLUMN `descricao`,
DROP COLUMN `encaminhamentos`,
DROP COLUMN `assignedTo`,
DROP COLUMN `assignedToName`;

-- Recreate farol_cases with correct structure
DROP TABLE IF EXISTS `farol_cases`;

CREATE TABLE `farol_cases` (
  `id` int AUTO_INCREMENT NOT NULL,
  `numeroCaso` varchar(50) NOT NULL UNIQUE,
  `dataEntrada` date NOT NULL,
  `nomeEstudante` varchar(255) NOT NULL,
  `diagnostico` text,
  `responsavel` varchar(255),
  `telefone` varchar(20),
  `escola` varchar(255),
  `schoolId` int,
  `regional` varchar(100),
  `segmento` varchar(100),
  `tipoDemanda` varchar(100),
  `origem` varchar(100),
  `analiseConjunta` text,
  `setorCraei` varchar(255),
  `profissionalResponsavelId` int,
  `coordenadorResponsavelId` int,
  `situacao` enum('Ativo','Inativo','Arquivado','Suspenso') NOT NULL DEFAULT 'Ativo',
  `status` enum('Novo','Em acompanhamento','Aguardando retorno','Encaminhado','Resolvido','Encerrado') NOT NULL DEFAULT 'Novo',
  `classificacaoCaso` varchar(100),
  `alerta` boolean DEFAULT false,
  `observacaoGeral` text,
  `driveFolderUrl` varchar(500),
  `active` boolean DEFAULT true NOT NULL,
  `createdBy` int NOT NULL,
  `createdByName` varchar(255) NOT NULL,
  `updatedBy` int,
  `updatedByName` varchar(255),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `resolvedAt` timestamp,
  `isDeleted` boolean NOT NULL DEFAULT false,
  `deletedAt` timestamp,
  `deletedBy` int,
  `deletionReason` text,
  CONSTRAINT `farol_cases_id` PRIMARY KEY(`id`),
  CONSTRAINT `farol_cases_numeroCaso_unique` UNIQUE(`numeroCaso`)
);

-- Update farol_case_history with new fields
ALTER TABLE `farol_case_history` 
CHANGE COLUMN `tipoAcao` `actionType` varchar(100) NOT NULL,
CHANGE COLUMN `descricao` `description` text,
ADD COLUMN `forwarding` text AFTER `description`,
ADD COLUMN `internalNote` text AFTER `forwarding`,
ADD COLUMN `createdByRole` varchar(50) AFTER `createdByName`;

-- Create farol_audit table
CREATE TABLE `farol_audit` (
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

-- Create farol_advisors table
CREATE TABLE `farol_advisors` (
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
