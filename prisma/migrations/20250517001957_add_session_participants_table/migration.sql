-- Create the session_participants table
CREATE TABLE "session_participants" (
  "id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "participant_id" TEXT NOT NULL,
  "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "attended_session" BOOLEAN NOT NULL DEFAULT false,
  "attendance_time" TIMESTAMP(3),

  CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id")
);

-- Create a unique constraint to prevent duplicate registrations
CREATE UNIQUE INDEX "session_participants_sessionId_participantId_key" ON "session_participants"("session_id", "participant_id");

-- Add foreign key constraints
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "event_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for better query performance
CREATE INDEX "idx_session_participants_session_id" ON "session_participants"("session_id");
CREATE INDEX "idx_session_participants_participant_id" ON "session_participants"("participant_id"); 