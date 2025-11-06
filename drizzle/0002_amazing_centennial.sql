-- DROP TABLE `friends`;--> statement-breakpoint
-- DROP TABLE `notes`;--> statement-breakpoint

PRAGMA foreign_keys=OFF;--> statement-breakpoint

CREATE TABLE `__new_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`receiver_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_messages`
	("id", "sender_id", "receiver_id", "content", "created_at")
	SELECT "id", "sender_id", "receiver_id", "content", "created_at"
	FROM `messages`;
--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint

PRAGMA foreign_keys=ON;--> statement-breakpoint

CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL
);
--> statement-breakpoint
-- INSERT INTO `__new_sessions`("id", "user_id", "token")
--     SELECT "id", "user_id", "token" FROM `sessions`;
-- DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint

-- ALTER TABLE `users` DROP COLUMN `created_at`;
