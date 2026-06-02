-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bestRank" INTEGER,
ADD COLUMN     "weeklyScore" INTEGER NOT NULL DEFAULT 0;
