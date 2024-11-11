/*
  Warnings:

  - You are about to drop the column `coverUri` on the `Track` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Track" DROP COLUMN "coverUri",
ADD COLUMN     "duration" INTEGER NOT NULL;
