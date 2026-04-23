CREATE TABLE `emailSubscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`source` varchar(64),
	`syncedToMailchimp` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailSubscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `emailSubscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`stripeSessionId` varchar(128),
	`stripePaymentIntentId` varchar(128),
	`stripeInvoiceId` varchar(128),
	`amount` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'usd',
	`type` enum('one_time','subscription') NOT NULL,
	`status` varchar(32) NOT NULL,
	`rewriteId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rewrites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalFileName` varchar(255),
	`originalFileKey` varchar(255),
	`originalText` text NOT NULL,
	`roleType` varchar(255),
	`industry` varchar(255),
	`jobDescription` text,
	`concerns` json,
	`yearsToHighlight` varchar(16),
	`rewrittenText` text,
	`rewrittenJson` json,
	`changeAnnotations` json,
	`ageBiasFlags` json,
	`tips` json,
	`atsScore` int,
	`keywordScore` int,
	`formattingScore` int,
	`structureScore` int,
	`ageBiasScore` int,
	`status` enum('draft','scored','rewritten') NOT NULL DEFAULT 'draft',
	`paid` boolean NOT NULL DEFAULT false,
	`pdfFileKey` varchar(255),
	`docxFileKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rewrites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `emailSubscribed` boolean DEFAULT false NOT NULL;