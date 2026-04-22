CREATE TABLE `attendances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`mediatorId` int NOT NULL,
	`schoolId` int NOT NULL,
	`attendanceDate` date NOT NULL,
	`startTime` time,
	`endTime` time,
	`description` text,
	`status` enum('completed','pending','cancelled') NOT NULL DEFAULT 'pending',
	`type` enum('individual','shared') NOT NULL DEFAULT 'individual',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `externalDemands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int,
	`schoolId` int NOT NULL,
	`demandType` varchar(100),
	`source` varchar(100),
	`description` text,
	`status` enum('pending','in_progress','resolved','closed') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`assignedTo` int,
	`dueDate` date,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `externalDemands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mediators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cpf` varchar(20),
	`professionalLicense` varchar(100),
	`specialization` varchar(255),
	`schoolId` int NOT NULL,
	`status` enum('active','inactive','on_leave') NOT NULL DEFAULT 'active',
	`maxAttendances` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mediators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`address` text,
	`phone` varchar(20),
	`principal` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schools_id` PRIMARY KEY(`id`),
	CONSTRAINT `schools_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `sharedAttendances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attendanceId` int NOT NULL,
	`mediatorId` int NOT NULL,
	`role` varchar(50) DEFAULT 'support',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sharedAttendances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`dateOfBirth` date,
	`cpf` varchar(20),
	`schoolId` int NOT NULL,
	`specialNeeds` text,
	`status` enum('active','inactive','transferred') NOT NULL DEFAULT 'active',
	`enrollmentNumber` varchar(50),
	`guardianName` varchar(255),
	`guardianPhone` varchar(20),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','school_user') NOT NULL DEFAULT 'school_user';--> statement-breakpoint
ALTER TABLE `users` ADD `schoolId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;