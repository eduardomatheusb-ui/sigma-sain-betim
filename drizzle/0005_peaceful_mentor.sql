CREATE TABLE `demands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320),
	`schoolName` varchar(255) NOT NULL,
	`studentName` varchar(255) NOT NULL,
	`dateOfBirth` date,
	`cpf` varchar(30),
	`shift` enum('morning','afternoon','full','evening') NOT NULL,
	`grade` varchar(50),
	`disabilities` text,
	`attendanceStatus` enum('with_attendant','without_attendant','awaiting_substitution','partially_attended') NOT NULL,
	`attendantStatus` enum('active','inactive') NOT NULL,
	`hasAttendant` boolean NOT NULL DEFAULT false,
	`attendantName` varchar(255),
	`isShared` boolean NOT NULL DEFAULT false,
	`notes` text,
	`usesWheelchair` boolean DEFAULT false,
	`usesWalker` boolean DEFAULT false,
	`usesProsthesis` boolean DEFAULT false,
	`homeCare` boolean DEFAULT false,
	`needsAttendant` enum('yes','no','nam') DEFAULT 'yes',
	`schoolId` int,
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mediator_students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mediatorId` int NOT NULL,
	`studentId` int NOT NULL,
	`demandId` int,
	`isPrimary` boolean NOT NULL DEFAULT true,
	`startDate` date,
	`endDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mediator_students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `status_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mediatorId` int NOT NULL,
	`previousStatus` varchar(50) NOT NULL,
	`newStatus` varchar(50) NOT NULL,
	`reason` text,
	`changedBy` int,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schoolId` int NOT NULL,
	`weekReference` varchar(20) NOT NULL,
	`submittedBy` int,
	`submittedByName` varchar(255),
	`snapshotData` text,
	`status` enum('submitted','validated','rejected') NOT NULL DEFAULT 'submitted',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weekly_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `students` MODIFY COLUMN `shift` enum('morning','afternoon','full','evening');--> statement-breakpoint
ALTER TABLE `attendances` ADD `result` text;--> statement-breakpoint
ALTER TABLE `mediators` ADD `otherSchoolId` int;--> statement-breakpoint
ALTER TABLE `students` ADD `usesWheelchair` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `students` ADD `usesWalker` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `students` ADD `usesProsthesis` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `students` ADD `homeCare` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `students` ADD `needsAttendant` enum('yes','no','nam') DEFAULT 'yes';