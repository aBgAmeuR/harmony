/*
  Warnings:

  - You are about to drop the column `userid` on the `Playback` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[spotifyUri]` on the table `Album` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spotifyUri]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spotifyUri]` on the table `Track` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `packageId` to the `Playback` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Playback" DROP CONSTRAINT "Playback_userid_fkey";

-- AlterTable
ALTER TABLE "Playback" DROP COLUMN "userid",
ADD COLUMN     "packageId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Package" (
    "id" SERIAL NOT NULL,
    "spotify_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Album_spotifyUri_key" ON "Album"("spotifyUri");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_name_key" ON "Artist"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_spotifyUri_key" ON "Artist"("spotifyUri");

-- CreateIndex
CREATE UNIQUE INDEX "Track_spotifyUri_key" ON "Track"("spotifyUri");

-- AddForeignKey
ALTER TABLE "Playback" ADD CONSTRAINT "Playback_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
