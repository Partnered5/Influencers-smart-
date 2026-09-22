ALTER TABLE `content_items` MODIFY COLUMN `kind` enum('image','video','caption','campaign','export') NOT NULL;--> statement-breakpoint
CREATE TABLE `video_jobs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `workspaceId` int NOT NULL,
  `title` varchar(180) NOT NULL,
  `objective` varchar(180) NOT NULL,
  `prompt` text NOT NULL,
  `script` text NOT NULL,
  `aspectRatio` enum('portrait','landscape') NOT NULL DEFAULT 'portrait',
  `durationSeconds` int NOT NULL DEFAULT 15,
  `voiceover` int NOT NULL DEFAULT 1,
  `assetKey` varchar(255),
  `assetUrl` varchar(500),
  `providerJobId` varchar(180),
  `status` enum('draft','queued','ready','failed') NOT NULL DEFAULT 'draft',
  `disclosureStamp` varchar(180) NOT NULL DEFAULT 'AI-generated virtual creator · Influencer Smart',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE now(),
  CONSTRAINT `video_jobs_id` PRIMARY KEY(`id`)
);
