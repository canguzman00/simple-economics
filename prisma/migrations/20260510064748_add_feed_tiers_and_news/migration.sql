-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('GLOBAL', 'NATIONAL', 'REGIONAL');

-- AlterTable
ALTER TABLE "EconEvent" ADD COLUMN     "isNews" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "newsSource" TEXT,
ADD COLUMN     "newsUrl" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "tier" "Tier" NOT NULL DEFAULT 'NATIONAL';

-- CreateTable
CREATE TABLE "NewsCache" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "fullExplanation" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "pillar" "Pillar" NOT NULL,
    "impact" "Impact" NOT NULL DEFAULT 'MEDIUM',
    "tier" "Tier" NOT NULL,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsCache_url_key" ON "NewsCache"("url");
