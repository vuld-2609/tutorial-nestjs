/*
  Warnings:

  - The primary key for the `Favorite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Favorite` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Favorite_userId_articleId_key";

-- AlterTable
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId", "articleId");
