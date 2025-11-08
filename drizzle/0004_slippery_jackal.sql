CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text
);
--> statement-breakpoint
ALTER TABLE `friends` ADD `status` text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `friends` ADD `created_at` text DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `messages` ADD `chat_id` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `edited_at` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `expires_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_url` text;--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` text DEFAULT 'CURRENT_TIMESTAMP';