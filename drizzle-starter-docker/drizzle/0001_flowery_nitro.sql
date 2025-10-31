CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sender_id` integer NOT NULL,
	`receiver_id` integer NOT NULL,
	`content` text NOT NULL,
	`timestamp` integer DEFAULT 1761913253527
);
--> statement-breakpoint
DROP INDEX `users_email_unique`;--> statement-breakpoint
ALTER TABLE `users` ADD `username` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `password` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `status` text DEFAULT 'online';--> statement-breakpoint
ALTER TABLE `users` ADD `note` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `email`;