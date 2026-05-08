import { buildTeamStats } from "@/lib/teamStats";
import {
  AnalysisSubmissionResponse,
  AssessmentSessionRecord,
  AnswerMap,
  AssessmentResult,
  SubmissionRecord,
  TeamStats,
} from "@/types/assessment";

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as { error?: unknown };
      if (typeof payload?.error === "string" && payload.error.trim()) {
        message = payload.error;
      }
    } catch {
      // Keep fallback message when response body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function addSubmission(
  answers: AnswerMap,
  result: AssessmentResult,
  sessionCode?: string
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
  return requestJson<SubmissionRecord[]>(
    `/api/submissions?sessionCode=${encodeURIComponent(sessionCode)}&team=true`
  );
}

export async function getLatestSubmissionByEmail(
  sessionCode?: string
): Promise<SubmissionRecord | null> {
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
  return requestJson<AssessmentSessionRecord | null>(
    `/api/sessions?code=${encodeURIComponent(code)}`
  );
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

export async function submitRepositoryAnalysis(
  analysisData: string
): Promise<AnalysisSubmissionResponse> {
  let payload: unknown;
  try {
    payload = JSON.parse(analysisData);
  } catch {
    throw new Error("Invalid JSON format");
  }

  if (isInsufficientDataError(payload)) {
    const reason =
      (payload as { reason?: string }).reason ??
      "Provide more context and re-run the analysis prompt.";
    throw new Error(`Cannot submit: insufficient repository data. ${reason}`);
  }

  return requestJson<AnalysisSubmissionResponse>("/api/submissions/analysis", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function isInsufficientDataError(payload: unknown): boolean {
  return (
    typeof payload === "object" &&
    payload !== null &&
    (payload as Record<string, unknown>).error === "INSUFFICIENT_DATA"
  );
}
