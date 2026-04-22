ALTER TABLE `mediators` MODIFY COLUMN `status` enum('active','inactive','on_leave','dismissed','substituted','vacancy','temp_leave') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `mediators` ADD `registration` varchar(100);--> statement-breakpoint
ALTER TABLE `mediators` ADD `responsible` varchar(255);--> statement-breakpoint
ALTER TABLE `mediators` ADD `changeType` varchar(100) DEFAULT 'Sem alteração';--> statement-breakpoint
ALTER TABLE `mediators` ADD `linkedStudents` text;--> statement-breakpoint
ALTER TABLE `mediators` ADD `note` text;