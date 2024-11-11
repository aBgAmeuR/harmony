/*
  Warnings:

  - The primary key for the `Album` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `spotifyUri` on the `Album` table. All the data in the column will be lost.
  - The primary key for the `Artist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `spotifyUri` on the `Artist` table. All the data in the column will be lost.
  - The primary key for the `Track` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `spotifyUri` on the `Track` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Album" DROP CONSTRAINT "Album_artistid_fkey";

-- DropForeignKey
ALTER TABLE "Playback" DROP CONSTRAINT "Playback_trackid_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_albumid_fkey";

-- DropIndex
DROP INDEX "Album_spotifyUri_key";

-- DropIndex
DROP INDEX "Artist_spotifyUri_key";

-- DropIndex
DROP INDEX "Track_spotifyUri_key";

-- AlterTable
ALTER TABLE "Album" DROP CONSTRAINT "Album_pkey",
DROP COLUMN "spotifyUri",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(22),
ALTER COLUMN "artistid" SET DATA TYPE TEXT,
ADD CONSTRAINT "Album_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Album_id_seq";

-- AlterTable
ALTER TABLE "Artist" DROP CONSTRAINT "Artist_pkey",
DROP COLUMN "spotifyUri",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(22),
ADD CONSTRAINT "Artist_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Artist_id_seq";

-- AlterTable
ALTER TABLE "Playback" ALTER COLUMN "trackid" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Track" DROP CONSTRAINT "Track_pkey",
DROP COLUMN "spotifyUri",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(22),
ALTER COLUMN "albumid" SET DATA TYPE TEXT,
ADD CONSTRAINT "Track_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Track_id_seq";

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_albumid_fkey" FOREIGN KEY ("albumid") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_artistid_fkey" FOREIGN KEY ("artistid") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playback" ADD CONSTRAINT "Playback_trackid_fkey" FOREIGN KEY ("trackid") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
