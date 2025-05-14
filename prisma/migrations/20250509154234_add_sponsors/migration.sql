-- CreateEnum
CREATE TYPE "SponsorLevel" AS ENUM ('PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER', 'MEDIA', 'OTHER');

-- CreateTable
CREATE TABLE "sponsors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "level" "SponsorLevel" NOT NULL DEFAULT 'GOLD',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
