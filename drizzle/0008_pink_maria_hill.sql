ALTER TABLE `schools` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `schools` ADD `type` varchar(50) DEFAULT 'EM';