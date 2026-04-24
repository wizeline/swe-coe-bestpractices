/*
  Warnings:

  - The primary key for the `Draft` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LastResult` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateTable
CREATE TABLE "AssessmentSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Draft" (
    "email" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL DEFAULT 'personal',
    "answers" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("email", "sessionKey")
);
INSERT INTO "new_Draft" ("answers", "email", "updatedAt") SELECT "answers", "email", "updatedAt" FROM "Draft";
DROP TABLE "Draft";
ALTER TABLE "new_Draft" RENAME TO "Draft";
CREATE TABLE "new_LastResult" (
    "email" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL DEFAULT 'personal',
    "result" JSONB NOT NULL,
    "savedAt" DATETIME NOT NULL,

    PRIMARY KEY ("email", "sessionKey")
);
INSERT INTO "new_LastResult" ("email", "result", "savedAt") SELECT "email", "result", "savedAt" FROM "LastResult";
DROP TABLE "LastResult";
ALTER TABLE "new_LastResult" RENAME TO "LastResult";
CREATE TABLE "new_Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "sessionId" TEXT,
    "answers" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("answers", "email", "id", "result", "submittedAt") SELECT "answers", "email", "id", "result", "submittedAt" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
CREATE INDEX "Submission_email_submittedAt_idx" ON "Submission"("email", "submittedAt");
CREATE INDEX "Submission_sessionId_submittedAt_idx" ON "Submission"("sessionId", "submittedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentSession_code_key" ON "AssessmentSession"("code");

-- CreateIndex
CREATE INDEX "AssessmentSession_ownerEmail_createdAt_idx" ON "AssessmentSession"("ownerEmail", "createdAt");
