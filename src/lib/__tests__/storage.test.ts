import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addSubmission,
  buildTeamStats,
  clearDraft,
  deleteSubmission,
  getLatestSubmissionByEmail,
  getSubmissionsByEmail,
  loadAllSubmissions,
  loadDraft,
  loadLastResult,
  saveDraft,
  saveLastResult,
} from "@/lib/storage";
import type { AssessmentResult, SubmissionRecord } from "@/types/assessment";

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

describe("draft API storage", () => {
  it("loads draft answers by email", async () => {
    mockJsonResponse({ answers: { q1: 2, q2: 3 } });

    await expect(loadDraft("dev@example.com")).resolves.toEqual({ q1: 2, q2: 3 });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/drafts?email=dev%40example.com",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("saves draft answers with normalized email", async () => {
    mockJsonResponse({ ok: true });

    await saveDraft("Dev@Example.com", { q1: 4 });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/drafts",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ email: "dev@example.com", answers: { q1: 4 } }),
      }),
    );
  });

  it("clears a draft for an email", async () => {
    mockJsonResponse({ ok: true });

    await clearDraft("dev@example.com");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/drafts",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ email: "dev@example.com" }),
      }),
    );
  });
});

describe("submission API storage", () => {
  it("adds submission with normalized email", async () => {
    const payload: SubmissionRecord = {
      id: "sub-1",
      email: "dev@example.com",
      answers: { q1: 3 },
      result: makeResult(3),
      submittedAt: new Date().toISOString(),
    };
    mockJsonResponse(payload, true, 201);

    await expect(addSubmission(" Dev@Example.com ", { q1: 3 }, makeResult(3))).resolves.toEqual(payload);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/submissions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "dev@example.com",
          answers: { q1: 3 },
          result: makeResult(3),
        }),
      }),
    );
  });

  it("loads submissions filtered by email", async () => {
    const payload: SubmissionRecord[] = [];
    mockJsonResponse(payload);

    await expect(getSubmissionsByEmail("dev@example.com")).resolves.toEqual(payload);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/submissions?email=dev%40example.com",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("loads latest submission by email", async () => {
    const payload: SubmissionRecord = {
      id: "sub-2",
      email: "dev@example.com",
      answers: { q1: 2 },
      result: makeResult(2),
      submittedAt: new Date().toISOString(),
    };
    mockJsonResponse(payload);

    await expect(getLatestSubmissionByEmail("dev@example.com")).resolves.toEqual(payload);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/submissions?email=dev%40example.com&latest=true",
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
});

describe("last result API storage", () => {
  it("saves last result", async () => {
    mockJsonResponse({ ok: true });

    await saveLastResult("USER@example.com", makeResult(2));

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/last-result",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ email: "user@example.com", result: makeResult(2) }),
      }),
    );
  });

  it("loads last result", async () => {
    const result = makeResult(4);
    mockJsonResponse({
      data: {
        email: "user@example.com",
        result,
        savedAt: new Date().toISOString(),
      },
    });

    await expect(loadLastResult("user@example.com")).resolves.toEqual(
      expect.objectContaining({ email: "user@example.com", result }),
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
    expect(Object.keys(stats.submissionsByEmail)).toHaveLength(2);
  });
});
