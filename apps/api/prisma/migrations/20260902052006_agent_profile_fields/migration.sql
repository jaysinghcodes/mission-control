-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "channel" TEXT,
ADD COLUMN     "currentTask" TEXT,
ADD COLUMN     "emoji" TEXT,
ADD COLUMN     "personalityTags" JSONB,
ADD COLUMN     "recentActivity" TEXT,
ADD COLUMN     "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0;
