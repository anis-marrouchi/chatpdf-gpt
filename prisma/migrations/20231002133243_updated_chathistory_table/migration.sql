/*
  Warnings:

  - Made the column `childId` on table `ChatHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChatHistory" ALTER COLUMN "childId" SET NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;
