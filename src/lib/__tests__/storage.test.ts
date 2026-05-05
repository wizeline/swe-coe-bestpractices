import { beforeEach, describe, expect, it, vi } from "vitest";
import { assessmentTemplate } from "@/data/assessmentTemplate";
import {
  addSubmission,
  buildTeamStats,
  createAssessmentSession,
  deleteAssessmentSession,
  deleteSubmission,
  getSessionByCode,
  getLatestSubmissionByEmail,
  isInsufficientDataError,
  loadAllSubmissions,
  loadOwnedSessions,
  loadTeamSubmissions,
  submitRepositoryAnalysis,
} from "@/lib/storage";
import type { AnalysisSubmissionResponse, AssessmentResult, AssessmentSessionRecord, SubmissionRecord } from "@/types/assessment";

const makeResult = (overallScore: number, totalScore = overallScore, maxScore = 4): AssessmentResult => ({
  overallScore,
  totalScore,
  maxScore,
  completion: 100,
  maturityLabel: "Optimized",
  categories: [
    {
      id: "cat-a",
      title: "Category A",
      score: overallScore,
      answered: 2,
      total: 2,
      weight: 1,
      suggestions: [],
    },
  ],
});

const mockFetch = vi.fn();

global.fetch = mockFetch as unknown as typeof fetch;

function mockJsonResponse(payload: unknown, ok = true, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    json: async () => payload,
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("submission API storage", () => {
  it("adds submission without sending email", async () => {
    const payload: SubmissionRecord = {
      id: "sub-1",
      email: "dev@example.com",
      answers: { q1: 3 },
      result: makeResult(3),
      submittedAt: new Date().toISOString(),
    };
    mockJsonResponse(payload, true, 201);

    await expect(addSubmission({ q1: 3 }, makeResult(3))).resolves.toEqual(payload);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/submissions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          answers: { q1: 3 },
          result: makeResult(3),
        }),
      }),
    );
  });

  it("loads latest submission for current session", async () => {
    const payload: SubmissionRecord = {
      id: "sub-2",
      email: "dev@example.com",
      answers: { q1: 2 },
      result: makeResult(2),
      submittedAt: new Date().toISOString(),
    };
    mockJsonResponse(payload);

    await expect(getLatestSubmissionByEmail()).resolves.toEqual(payload);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/submissions?latest=true",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("loads team submissions for a session owner", async () => {
    mockJsonResponse([]);

    await expect(loadTeamSubmissions("TEAM42")).resolves.toEqual([]);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/submissions?sessionCode=TEAM42&team=true",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("loads all submissions", async () => {
    mockJsonResponse([]);

    await expect(loadAllSubmissions()).resolves.toEqual([]);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/submissions",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("deletes submission by id", async () => {
    mockJsonResponse({ ok: true });

    await deleteSubmission("sub-77");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/submissions/sub-77",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("submits repository analysis with valid JSON", async () => {
    const analysisPayload = {
      email: "analyst@example.com",
      analysis: {
        pillars: {
          pillar_1_ideation: { title: "Ideation", questions: [], pillar_score: 3 },
          pillar_2_code: { title: "Code", questions: [], pillar_score: 3 },
          pillar_3_testing: { title: "Testing", questions: [], pillar_score: 2 },
          pillar_4_documentation: { title: "Docs", questions: [], pillar_score: 2 },
          pillar_5_operations: { title: "Operations", questions: [], pillar_score: 2 },
        },
        raw_score: 24,
        maturity_level: "Disciplined" as const,
      },
    };

    const response: AnalysisSubmissionResponse = {
      id: "sub-analysis-1",
      email: "analyst@example.com",
      totalScore: 24,
      maxScore: 56,
      maturityLabel: "Disciplined",
      submittedAt: new Date().toISOString(),
    };

    mockJsonResponse(response, true, 201);

    const result = await submitRepositoryAnalysis(JSON.stringify(analysisPayload));
    expect(result).toEqual(response);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/submissions/analysis",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(analysisPayload),
      }),
    );
  });

  it("rejects invalid JSON for repository analysis", async () => {
    await expect(submitRepositoryAnalysis("{ invalid json }")).rejects.toThrow("Invalid JSON format");
  });

  it("rejects INSUFFICIENT_DATA payload with reason", async () => {
    const payload = { error: "INSUFFICIENT_DATA", reason: "No commit history provided." };
    await expect(submitRepositoryAnalysis(JSON.stringify(payload))).rejects.toThrow(
      "Cannot submit: insufficient repository data. No commit history provided.",
    );
  });

  it("rejects INSUFFICIENT_DATA payload without reason using fallback message", async () => {
    const payload = { error: "INSUFFICIENT_DATA" };
    await expect(submitRepositoryAnalysis(JSON.stringify(payload))).rejects.toThrow(
      "Cannot submit: insufficient repository data.",
    );
  });
});

describe("isInsufficientDataError", () => {
  it("returns true for INSUFFICIENT_DATA error object", () => {
    expect(isInsufficientDataError({ error: "INSUFFICIENT_DATA" })).toBe(true);
    expect(isInsufficientDataError({ error: "INSUFFICIENT_DATA", reason: "Missing CI config." })).toBe(true);
  });

  it("returns false for valid analysis payload", () => {
    expect(isInsufficientDataError({ analysis: { pillars: {} } })).toBe(false);
  });

  it("returns false for non-object values", () => {
    expect(isInsufficientDataError(null)).toBe(false);
    expect(isInsufficientDataError("INSUFFICIENT_DATA")).toBe(false);
    expect(isInsufficientDataError(42)).toBe(false);
  });

  it("returns false for object with different error code", () => {
    expect(isInsufficientDataError({ error: "SOME_OTHER_ERROR" })).toBe(false);
  });
});

describe("session API storage", () => {
  it("loads owned sessions", async () => {
    const payload: AssessmentSessionRecord[] = [];
    mockJsonResponse(payload);

    await expect(loadOwnedSessions()).resolves.toEqual(payload);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/sessions",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("loads session by code", async () => {
    const payload: AssessmentSessionRecord = {
      id: "sess-1",
      code: "TEAM42",
      name: "Architecture Review",
      ownerEmail: "owner@test.com",
      createdAt: new Date().toISOString(),
      isOwner: true,
    };
    mockJsonResponse(payload);

    await expect(getSessionByCode("TEAM42")).resolves.toEqual(payload);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/sessions?code=TEAM42",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("creates a team session", async () => {
    const payload: AssessmentSessionRecord = {
      id: "sess-2",
      code: "ABC123",
      name: "Quarterly Review",
      ownerEmail: "owner@test.com",
      createdAt: new Date().toISOString(),
      isOwner: true,
    };
    mockJsonResponse(payload, true, 201);

    await expect(createAssessmentSession("Quarterly Review")).resolves.toEqual(payload);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/sessions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Quarterly Review" }),
      }),
    );
  });

  it("deletes a team session", async () => {
    mockJsonResponse({ ok: true });

    await deleteAssessmentSession("sess-2");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/sessions",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ id: "sess-2" }),
      }),
    );
  });
});

describe("buildTeamStats", () => {
  it("returns zeroed stats for empty submissions", () => {
    const stats = buildTeamStats([]);

    expect(stats.totalSubmissions).toBe(0);
    expect(stats.uniqueParticipants).toBe(0);
    expect(stats.averageTotalScore).toBe(0);
    expect(stats.maxTotalScore).toBeGreaterThan(0);
    expect(stats.categoryAverages).toEqual({});
    expect(stats.categorySuggestions).toEqual({});
    expect(stats.submissionsByEmail).toEqual({});
  });

  it("computes participant, average and category metrics", () => {
    const submissions: SubmissionRecord[] = [
      {
        id: "a-1",
        email: "a@test.com",
        answers: { q1: 1 },
        result: makeResult(2, 10, 48),
        submittedAt: "2026-04-23T00:00:00.000Z",
      },
      {
        id: "a-2",
        email: "a@test.com",
        answers: { q1: 2 },
        result: makeResult(3, 30, 48),
        submittedAt: "2026-04-23T01:00:00.000Z",
      },
      {
        id: "b-1",
        email: "b@test.com",
        answers: { q1: 4 },
        result: makeResult(4, 20, 48),
        submittedAt: "2026-04-23T02:00:00.000Z",
      },
    ];

    const stats = buildTeamStats(submissions);

    expect(stats.totalSubmissions).toBe(3);
    expect(stats.uniqueParticipants).toBe(2);
    expect(stats.averageTotalScore).toBe(20);
    expect(stats.maxTotalScore).toBe(48);
    expect(stats.categoryAverages["cat-a"]).toBe(3);
    expect(stats.categorySuggestions["cat-a"]).toEqual([]);
    expect(Object.keys(stats.submissionsByEmail)).toHaveLength(2);
  });

  it("derives team action items when category ids match template", () => {
    const category = assessmentTemplate.categories[0];
    const submissions: SubmissionRecord[] = [
      {
        id: "p-1",
        email: "one@test.com",
        answers: { q1: 1 },
        result: {
          ...makeResult(2, 12, 48),
          categories: [
            {
              id: category.id,
              title: category.title,
              score: 2,
              answered: category.questions.length,
              total: category.questions.length,
              weight: category.weight,
              suggestions: [],
            },
          ],
        },
        submittedAt: "2026-04-23T00:00:00.000Z",
      },
      {
        id: "p-2",
        email: "two@test.com",
        answers: { q1: 3 },
        result: {
          ...makeResult(3, 18, 48),
          categories: [
            {
              id: category.id,
              title: category.title,
              score: 3,
              answered: category.questions.length,
              total: category.questions.length,
              weight: category.weight,
              suggestions: [],
            },
          ],
        },
        submittedAt: "2026-04-23T01:00:00.000Z",
      },
    ];

    const stats = buildTeamStats(submissions);

    expect(stats.categoryAverages[category.id]).toBe(2.5);
    expect(stats.categorySuggestions[category.id]).toHaveLength(1);
    expect(stats.categorySuggestions[category.id][0].id).toBe(category.recommendations[0].id);
  });
});
