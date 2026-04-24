import { assessmentTemplate } from "@/data/assessmentTemplate";
import {
  AssessmentSessionRecord,
  AnswerMap,
  AssessmentResult,
  LastResultRecord,
  SubmissionRecord,
  TeamStats,
} from "@/types/assessment";

function withSessionKey(path: string, sessionKey = "personal"): string {
  const search = new URLSearchParams({ sessionKey });
  return `${path}?${search.toString()}`;
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

export async function saveDraft(answers: AnswerMap, sessionKey = "personal"): Promise<void> {
  await requestJson("/api/drafts", {
    method: "PUT",
    body: JSON.stringify({ answers, sessionKey }),
  });
}

export async function loadDraft(sessionKey = "personal"): Promise<AnswerMap> {
  const result = await requestJson<{ answers: AnswerMap | null }>(withSessionKey("/api/drafts", sessionKey));
  return result.answers ?? {};
}

export async function clearDraft(sessionKey = "personal"): Promise<void> {
  await requestJson("/api/drafts", {
    method: "DELETE",
    body: JSON.stringify({ sessionKey }),
  });
}

export async function saveLastResult(result: AssessmentResult, sessionKey = "personal"): Promise<void> {
  await requestJson("/api/last-result", {
    method: "PUT",
    body: JSON.stringify({ result, sessionKey }),
  });
}

export async function loadLastResult(sessionKey = "personal"): Promise<LastResultRecord | null> {
  const result = await requestJson<{ data: LastResultRecord | null }>(withSessionKey("/api/last-result", sessionKey));
  return result.data;
}

export async function addSubmission(
  answers: AnswerMap,
  result: AssessmentResult,
  sessionCode?: string,
): Promise<SubmissionRecord> {
  return requestJson<SubmissionRecord>("/api/submissions", {
    method: "POST",
    body: JSON.stringify({ answers, result, sessionCode }),
  });
}

export async function loadAllSubmissions(sessionCode?: string): Promise<SubmissionRecord[]> {
  const search = new URLSearchParams();
  if (sessionCode) {
    search.set("sessionCode", sessionCode);
  }
  const path = search.size > 0 ? `/api/submissions?${search.toString()}` : "/api/submissions";
  return requestJson<SubmissionRecord[]>(path);
}

export async function loadTeamSubmissions(sessionCode: string): Promise<SubmissionRecord[]> {
  return requestJson<SubmissionRecord[]>(`/api/submissions?sessionCode=${encodeURIComponent(sessionCode)}&team=true`);
}

export async function getLatestSubmissionByEmail(sessionCode?: string): Promise<SubmissionRecord | null> {
  const search = new URLSearchParams({ latest: "true" });
  if (sessionCode) {
    search.set("sessionCode", sessionCode);
  }
  return requestJson<SubmissionRecord | null>(`/api/submissions?${search.toString()}`);
}

export async function loadOwnedSessions(): Promise<AssessmentSessionRecord[]> {
  return requestJson<AssessmentSessionRecord[]>("/api/sessions");
}

export async function getSessionByCode(code: string): Promise<AssessmentSessionRecord | null> {
  return requestJson<AssessmentSessionRecord | null>(`/api/sessions?code=${encodeURIComponent(code)}`);
}

export async function createAssessmentSession(name: string): Promise<AssessmentSessionRecord> {
  return requestJson<AssessmentSessionRecord>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function deleteAssessmentSession(id: string): Promise<void> {
  await requestJson("/api/sessions", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
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
