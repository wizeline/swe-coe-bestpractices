import { buildTeamStats } from "@/lib/teamStats";
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

export { buildTeamStats };

export async function getTeamStats(): Promise<TeamStats> {
  const submissions = await loadAllSubmissions();
  return buildTeamStats(submissions);
}

export async function deleteSubmission(id: string): Promise<void> {
  await requestJson(`/api/submissions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
