/*
  Warnings:

  - You are about to drop the column `duration` on the `Track` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Track" DROP COLUMN "duration",
ADD COLUMN     "duration_ms" INTEGER;
