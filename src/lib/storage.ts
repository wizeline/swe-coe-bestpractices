import { assessmentTemplate } from "@/data/assessmentTemplate";
import {
  AnswerMap,
  AssessmentResult,
  LastResultRecord,
  SubmissionRecord,
  TeamStats,
} from "@/types/assessment";

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function saveDraft(email: string, answers: AnswerMap): Promise<void> {
  await requestJson("/api/drafts", {
    method: "PUT",
    body: JSON.stringify({ email: normalizeEmail(email), answers }),
  });
}

export async function loadDraft(email: string): Promise<AnswerMap> {
  const normalized = normalizeEmail(email);
  const result = await requestJson<{ answers: AnswerMap | null }>(
    `/api/drafts?email=${encodeURIComponent(normalized)}`,
  );
  return result.answers ?? {};
}

export async function clearDraft(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  await requestJson("/api/drafts", {
    method: "DELETE",
    body: JSON.stringify({ email: normalized }),
  });
}

export async function saveLastResult(email: string, result: AssessmentResult): Promise<void> {
  await requestJson("/api/last-result", {
    method: "PUT",
    body: JSON.stringify({ email: normalizeEmail(email), result }),
  });
}

export async function loadLastResult(email: string): Promise<LastResultRecord | null> {
  const normalized = normalizeEmail(email);
  const result = await requestJson<{ data: LastResultRecord | null }>(
    `/api/last-result?email=${encodeURIComponent(normalized)}`,
  );
  return result.data;
}

export async function addSubmission(
  email: string,
  answers: AnswerMap,
  result: AssessmentResult,
): Promise<SubmissionRecord> {
  return requestJson<SubmissionRecord>("/api/submissions", {
    method: "POST",
    body: JSON.stringify({ email: normalizeEmail(email), answers, result }),
  });
}

export async function loadAllSubmissions(): Promise<SubmissionRecord[]> {
  return requestJson<SubmissionRecord[]>("/api/submissions");
}

export async function getSubmissionsByEmail(email: string): Promise<SubmissionRecord[]> {
  const normalized = normalizeEmail(email);
  return requestJson<SubmissionRecord[]>(
    `/api/submissions?email=${encodeURIComponent(normalized)}`,
  );
}

export async function getLatestSubmissionByEmail(email: string): Promise<SubmissionRecord | null> {
  const normalized = normalizeEmail(email);
  return requestJson<SubmissionRecord | null>(
    `/api/submissions?email=${encodeURIComponent(normalized)}&latest=true`,
  );
}

export function buildTeamStats(submissions: SubmissionRecord[]): TeamStats {
  const submissionsByEmail: Record<string, SubmissionRecord[]> = {};

  submissions.forEach((sub) => {
    if (!submissionsByEmail[sub.email]) {
      submissionsByEmail[sub.email] = [];
    }
    submissionsByEmail[sub.email].push(sub);
  });

  const totalScores = submissions.map((s) => s.result.totalScore);
  const averageTotalScore =
    totalScores.length > 0
      ? Number((totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(1))
      : 0;

  const maxTotalScore = submissions[0]?.result.maxScore ?? assessmentTemplate.categories.reduce(
    (acc, category) => acc + category.questions.length * 4,
    0,
  );

  const categoryAverages: Record<string, number> = {};
  if (submissions.length > 0) {
    const categoryCount = submissions[0].result.categories.length;
    for (let i = 0; i < categoryCount; i++) {
      const categoryScores = submissions.map((s) => s.result.categories[i].score);
      const categoryId = submissions[0].result.categories[i].id;
      categoryAverages[categoryId] = Number(
        (categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length).toFixed(2),
      );
    }
  }

  return {
    totalSubmissions: submissions.length,
    uniqueParticipants: Object.keys(submissionsByEmail).length,
    averageTotalScore,
    maxTotalScore,
    categoryAverages,
    submissionsByEmail,
  };
}

export async function getTeamStats(): Promise<TeamStats> {
  const submissions = await loadAllSubmissions();
  return buildTeamStats(submissions);
}

export async function deleteSubmission(id: string): Promise<void> {
  await requestJson(`/api/submissions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
