CREATE TABLE `metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`record_id` text NOT NULL,
	`key` text NOT NULL,
	`value` real NOT NULL,
	`unit` text,
	`status` text NOT NULL,
	FOREIGN KEY (`record_id`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_metrics_record_id` ON `metrics` (`record_id`);--> statement-breakpoint
CREATE INDEX `idx_metrics_key` ON `metrics` (`key`);--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`date` integer NOT NULL,
	`summary_value` real,
	`raw_content` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_records_user_id` ON `records` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_records_type` ON `records` (`type`);--> statement-breakpoint
CREATE INDEX `idx_records_date` ON `records` (`date`);