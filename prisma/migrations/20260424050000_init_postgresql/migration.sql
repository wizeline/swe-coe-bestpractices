-- PostgreSQL baseline migration for SWE Best Practices Pulse

CREATE TABLE IF NOT EXISTS "AssessmentSession" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "ownerEmail" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssessmentSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AssessmentSession_code_key" ON "AssessmentSession"("code");
CREATE INDEX IF NOT EXISTS "AssessmentSession_ownerEmail_createdAt_idx" ON "AssessmentSession"("ownerEmail", "createdAt");

CREATE TABLE IF NOT EXISTS "Submission" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "sessionId" TEXT,
  "answers" JSONB NOT NULL,
  "result" JSONB NOT NULL,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Submission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Submission_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Submission_email_submittedAt_idx" ON "Submission"("email", "submittedAt");
CREATE INDEX IF NOT EXISTS "Submission_sessionId_submittedAt_idx" ON "Submission"("sessionId", "submittedAt");

CREATE TABLE IF NOT EXISTS "Draft" (
  "email" TEXT NOT NULL,
  "sessionKey" TEXT NOT NULL DEFAULT 'personal',
  "answers" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Draft_pkey" PRIMARY KEY ("email", "sessionKey")
);

CREATE TABLE IF NOT EXISTS "LastResult" (
  "email" TEXT NOT NULL,
  "sessionKey" TEXT NOT NULL DEFAULT 'personal',
  "result" JSONB NOT NULL,
  "savedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LastResult_pkey" PRIMARY KEY ("email", "sessionKey")
);
