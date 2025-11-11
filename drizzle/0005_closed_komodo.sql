ALTER TABLE `messages` ADD `friendship_id` text;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `chat_id`;--> statement-breakpoint
ALTER TABLE `users` ADD `settings` text;