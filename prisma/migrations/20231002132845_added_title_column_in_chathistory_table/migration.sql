/*
  Warnings:

  - Added the required column `title` to the `ChatHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatHistory" ADD COLUMN     "title" TEXT NOT NULL;
