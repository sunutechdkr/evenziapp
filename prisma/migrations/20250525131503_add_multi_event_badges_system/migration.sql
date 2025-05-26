-- CreateEnum
CREATE TYPE "BadgeStatus" AS ENUM ('GENERATED', 'PRINTED', 'DELIVERED');

-- CreateTable
CREATE TABLE "badge_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "canvas_data" TEXT NOT NULL,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "event_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badge_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participant_badges" (
    "id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "status" "BadgeStatus" NOT NULL DEFAULT 'GENERATED',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "printed_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "custom_data" TEXT,
    "qr_code_data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participant_badges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participant_badges_registration_id_event_id_key" ON "participant_badges"("registration_id", "event_id");

-- AddForeignKey
ALTER TABLE "badge_templates" ADD CONSTRAINT "badge_templates_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_badges" ADD CONSTRAINT "participant_badges_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_badges" ADD CONSTRAINT "participant_badges_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_badges" ADD CONSTRAINT "participant_badges_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "badge_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
