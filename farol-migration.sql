CREATE TABLE `farol_case_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`numeroCaso` varchar(50) NOT NULL,
	`tipoAcao` varchar(100) NOT NULL,
	`descricao` text,
	`createdBy` int NOT NULL,
	`createdByName` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `farol_case_history_id` PRIMARY KEY(`id`)
);

CREATE TABLE `farol_case_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`numeroCaso` varchar(50) NOT NULL,
	`action` varchar(100) NOT NULL,
	`metadata` text,
	`actorId` int NOT NULL,
	`actorName` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `farol_case_movements_id` PRIMARY KEY(`id`)
);

CREATE TABLE `farol_cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numeroCaso` varchar(50) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`escola` varchar(255),
	`schoolId` int,
	`regional` varchar(255),
	`segmento` varchar(100),
	`responsavel` varchar(255),
	`tipoDemanda` varchar(100),
	`origem` varchar(100),
	`situacao` enum('Ativo','Inativo','Arquivado','Suspenso') NOT NULL DEFAULT 'Ativo',
	`status` enum('Novo','Em acompanhamento','Aguardando retorno','Encaminhado','Resolvido','Encerrado') NOT NULL DEFAULT 'Novo',
	`classificacao` varchar(100),
	`descricao` text,
	`encaminhamentos` text,
	`assignedTo` int,
	`assignedToName` varchar(255),
	`createdBy` int NOT NULL,
	`createdByName` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`dataEntrada` date,
	`resolvedAt` timestamp,
	`isDeleted` boolean NOT NULL DEFAULT false,
	`deletedAt` timestamp,
	`deletedBy` int,
	`deletionReason` text,
	CONSTRAINT `farol_cases_id` PRIMARY KEY(`id`),
	CONSTRAINT `farol_cases_numeroCaso_unique` UNIQUE(`numeroCaso`)
);
