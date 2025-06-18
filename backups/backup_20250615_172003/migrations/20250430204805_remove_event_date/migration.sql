/*
  Warnings:

  - You are about to drop the column `date` on the `events` table. All the data in the column will be lost.
  - Made the column `end_date` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `start_date` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "date",
ALTER COLUMN "end_date" SET NOT NULL,
ALTER COLUMN "start_date" SET NOT NULL;
