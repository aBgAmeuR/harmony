/*
  Warnings:

  - Added the required column `duration` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "track_number" INTEGER;
