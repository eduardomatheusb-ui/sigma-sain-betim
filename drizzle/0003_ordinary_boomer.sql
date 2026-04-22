ALTER TABLE `schools` ADD `responsible` varchar(255);--> statement-breakpoint
ALTER TABLE `schools` ADD `weeklyStatus` enum('updated','pending','with_vacancy','with_leave') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `schools` ADD `lastWeeklyUpdate` timestamp;