-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `createdAt` VARCHAR(191) NOT NULL,
    `progress` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `avatarInitials` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requirements` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `owner` VARCHAR(191) NOT NULL,
    `createdAt` VARCHAR(191) NOT NULL,
    `updatedAt` VARCHAR(191) NOT NULL,
    `dueDate` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `baseline` VARCHAR(191) NULL,
    `acceptanceCriteria` JSON NOT NULL,
    `implementationScore` INTEGER NOT NULL,
    `traceabilityLinks` JSON NOT NULL,
    `source` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `relatedFeature` VARCHAR(191) NULL,

    INDEX `requirements_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `versions` (
    `id` VARCHAR(191) NOT NULL,
    `requirementId` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `changedBy` VARCHAR(191) NOT NULL,
    `changedAt` VARCHAR(191) NOT NULL,
    `changeSummary` TEXT NOT NULL,
    `previousContent` TEXT NOT NULL,
    `currentContent` TEXT NOT NULL,

    INDEX `versions_requirementId_idx`(`requirementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `baselines` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `createdAt` VARCHAR(191) NOT NULL,
    `requirements` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analysis_findings` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `requirementIds` JSON NOT NULL,
    `description` TEXT NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `confidence` DOUBLE NOT NULL,
    `suggestedAction` TEXT NOT NULL,
    `aiExplanation` TEXT NULL,
    `similarityScore` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `builds` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `buildNumber` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `branch` VARCHAR(191) NOT NULL,
    `commitId` VARCHAR(191) NOT NULL,
    `commitMessage` TEXT NOT NULL,
    `testResult` VARCHAR(191) NOT NULL,
    `testPassed` INTEGER NOT NULL,
    `testTotal` INTEGER NOT NULL,
    `requirementProgress` INTEGER NOT NULL,
    `progressChange` INTEGER NOT NULL,
    `changedRequirements` JSON NOT NULL,
    `failedRequirements` JSON NOT NULL,
    `relatedFiles` JSON NOT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `createdAt` VARCHAR(191) NOT NULL,

    INDEX `builds_projectId_idx`(`projectId`),
    INDEX `builds_buildNumber_idx`(`buildNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `snapshots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `buildNumber` INTEGER NOT NULL,
    `requirementId` VARCHAR(191) NOT NULL,
    `progress` INTEGER NOT NULL,
    `createdAt` VARCHAR(191) NOT NULL,

    INDEX `snapshots_buildNumber_idx`(`buildNumber`),
    INDEX `snapshots_requirementId_idx`(`requirementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `validation_details` (
    `requirementId` VARCHAR(191) NOT NULL,
    `matches` JSON NOT NULL,
    `missingLogic` JSON NOT NULL,
    `aiExplanation` TEXT NOT NULL,
    `acceptanceCriteriaStatus` JSON NOT NULL,
    `buildVerification` JSON NOT NULL,

    PRIMARY KEY (`requirementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `generatedAt` VARCHAR(191) NOT NULL,
    `sourceRequirements` JSON NOT NULL,

    INDEX `documents_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `generated_documents` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,

    INDEX `generated_documents_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `traceability_records` (
    `requirementId` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `requirementTitle` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `linkedDocuments` JSON NOT NULL,
    `linkedCodeFiles` JSON NOT NULL,
    `linkedBuilds` JSON NOT NULL,
    `linkedTests` JSON NOT NULL,
    `similarityScore` DOUBLE NOT NULL,
    `linkStatus` VARCHAR(191) NOT NULL,

    INDEX `traceability_records_projectId_idx`(`projectId`),
    PRIMARY KEY (`requirementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webhook_events` (
    `id` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `createdAt` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_state` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `activeProjectId` VARCHAR(191) NOT NULL,
    `currentUserId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `requirements` ADD CONSTRAINT `requirements_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `versions` ADD CONSTRAINT `versions_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `requirements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `builds` ADD CONSTRAINT `builds_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
