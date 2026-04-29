-- Create case_evolutions table for tracking case evolution (Progresso, Estável, Regressão, Encerrado)
CREATE TABLE IF NOT EXISTS `case_evolutions` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `caseId` int NOT NULL,
  `numeroCaso` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `status` enum('Progresso', 'Estável', 'Regressão', 'Encerrado') NOT NULL,
  `description` text NOT NULL,
  `createdBy` int NOT NULL,
  `createdByName` varchar(255) NOT NULL,
  `createdByRole` varchar(50),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_caseId` (`caseId`),
  KEY `idx_numeroCaso` (`numeroCaso`),
  KEY `idx_date` (`date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_case_evolutions_caseId` FOREIGN KEY (`caseId`) REFERENCES `farol_cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
