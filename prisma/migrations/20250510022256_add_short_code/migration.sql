/*
  Warnings:

  - A unique constraint covering the columns `[short_code]` on the table `registrations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "registrations" ADD COLUMN     "short_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "registrations_short_code_key" ON "registrations"("short_code");
