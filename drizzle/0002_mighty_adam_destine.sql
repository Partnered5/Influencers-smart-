ALTER TABLE `avatar_profiles` ADD `variationGroup` varchar(64);--> statement-breakpoint
ALTER TABLE `avatar_profiles` ADD `variationIndex` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `avatar_profiles` ADD `isSelected` int DEFAULT 0 NOT NULL;