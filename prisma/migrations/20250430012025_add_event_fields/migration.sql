-- AlterTable
ALTER TABLE "events" ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "end_time" TEXT,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "sector" TEXT,
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "start_time" TEXT,
ADD COLUMN     "support_email" TEXT,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "video_url" TEXT;
