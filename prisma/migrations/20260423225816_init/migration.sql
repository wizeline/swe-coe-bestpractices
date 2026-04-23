-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Draft" (
    "email" TEXT NOT NULL PRIMARY KEY,
    "answers" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LastResult" (
    "email" TEXT NOT NULL PRIMARY KEY,
    "result" JSONB NOT NULL,
    "savedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Submission_email_submittedAt_idx" ON "Submission"("email", "submittedAt");
