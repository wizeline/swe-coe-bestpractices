ALTER TABLE "Submission"
ADD COLUMN "totalScore" INTEGER,
ADD COLUMN "maxScore" INTEGER,
ADD COLUMN "completion" INTEGER,
ADD COLUMN "maturityLabel" TEXT;

UPDATE "Submission"
SET
  "totalScore" = ("result"->>'totalScore')::int,
  "maxScore" = ("result"->>'maxScore')::int,
  "completion" = ("result"->>'completion')::int,
  "maturityLabel" = "result"->>'maturityLabel'
WHERE "result" IS NOT NULL;

CREATE INDEX "Submission_sessionId_totalScore_idx" ON "Submission"("sessionId", "totalScore");
CREATE INDEX "Submission_submittedAt_idx" ON "Submission"("submittedAt");
