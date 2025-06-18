-- DropIndex
DROP INDEX "idx_session_participants_participant_id";

-- DropIndex
DROP INDEX "idx_session_participants_session_id";

-- RenameIndex
ALTER INDEX "session_participants_sessionId_participantId_key" RENAME TO "session_participants_session_id_participant_id_key";
