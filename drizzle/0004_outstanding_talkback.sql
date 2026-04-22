ALTER TABLE `mediators` ADD `isShared` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `mediators` ADD `additionalStudents` text;--> statement-breakpoint
ALTER TABLE `mediators` ADD `inactivityReason` varchar(255);--> statement-breakpoint
ALTER TABLE `mediators` ADD `inactivityDate` date;--> statement-breakpoint
ALTER TABLE `mediators` ADD `returnDate` date;--> statement-breakpoint
ALTER TABLE `students` ADD `disability` varchar(255);--> statement-breakpoint
ALTER TABLE `students` ADD `shift` enum('morning','afternoon','full');--> statement-breakpoint
ALTER TABLE `students` ADD `grade` varchar(50);