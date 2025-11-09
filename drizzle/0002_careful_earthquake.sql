CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text DEFAULT 'Ny note' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sender_id` integer NOT NULL,
	`receiver_id` integer NOT NULL,
	`content` text NOT NULL,
	`timestamp` integer DEFAULT (unixepoch('now') * 1000)
);
--> statement-breakpoint
INSERT INTO `__new_messages`("id", "sender_id", "receiver_id", "content", "timestamp") SELECT "id", "sender_id", "receiver_id", "content", "timestamp" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;