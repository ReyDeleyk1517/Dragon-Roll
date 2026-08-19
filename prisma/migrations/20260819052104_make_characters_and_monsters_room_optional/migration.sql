/*
  Warnings:

  - Made the column `ownerId` on table `Character` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `ownerId` to the `MonsterTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_roomId_fkey";

-- DropForeignKey
ALTER TABLE "MonsterTemplate" DROP CONSTRAINT "MonsterTemplate_roomId_fkey";

-- AlterTable
ALTER TABLE "Character" ALTER COLUMN "roomId" DROP NOT NULL,
ALTER COLUMN "ownerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MonsterTemplate" ADD COLUMN     "ownerId" TEXT NOT NULL,
ALTER COLUMN "roomId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "MonsterTemplate_ownerId_idx" ON "MonsterTemplate"("ownerId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterTemplate" ADD CONSTRAINT "MonsterTemplate_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterTemplate" ADD CONSTRAINT "MonsterTemplate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
