import { afterEach, describe, expect, it } from "vitest";
import {
  applySessionFilters,
  buildAdminReportHref,
  buildAdminReportHrefWithPage,
  buildAdminTeamDetailHref,
  buildCrossTeamComparison,
  buildTeamDetail,
  isAdminEmail,
  paginateItems,
} from "@/lib/admin";
import type { AssessmentResult, DatabaseStats, SubmissionRecord } from "@/types/assessment";

const originalAdminEmails = process.env.ADMIN_EMAILS;

function getLabel(totalScore: number): AssessmentResult["maturityLabel"] {
  if (totalScore < 13) {
    return "Foundational";
  }
  if (totalScore < 25) {
    return "Disciplined";
  }
  if (totalScore < 37) {
    return "Optimized";
  }
  return "Strategic";
}

function makeResult(totalScore: number, completion = 100): AssessmentResult {
  return {
    overallScore: totalScore,
    totalScore,
    maxScore: 48,
    completion,
    maturityLabel: getLabel(totalScore),
    categories: [
      {
        id: "pillar-1",
        title: "Pillar 1",
        score: totalScore / 2,
        answered: 2,
        total: 2,
        weight: 1,
        suggestions: [],
      },
      {
        id: "pillar-2",
        title: "Pillar 2",
        score: totalScore / 2,
        answered: 2,
        total: 2,
        weight: 1,
        suggestions: [],
      },
    ],
  };
}

function makeSubmission(id: string, email: string, totalScore: number, submittedAt: string): SubmissionRecord {
  return {
    id,
    email,
    answers: { q1: 3 },
    result: makeResult(totalScore),
    submittedAt,
  };
}

afterEach(() => {
  process.env.ADMIN_EMAILS = originalAdminEmails;
});

describe("isAdminEmail", () => {
  it("matches configured admin emails case-insensitively", () => {
    process.env.ADMIN_EMAILS = "admin@example.com, owner@example.com";

    expect(isAdminEmail("ADMIN@example.com")).toBe(true);
    expect(isAdminEmail("owner@example.com")).toBe(true);
    expect(isAdminEmail("user@example.com")).toBe(false);
  });

  it("returns false when no admins are configured", () => {
    process.env.ADMIN_EMAILS = "";

    expect(isAdminEmail("admin@example.com")).toBe(false);
  });
});

describe("buildCrossTeamComparison", () => {
  it("sorts sessions by average score and preserves database stats", () => {
    const databaseStats: DatabaseStats = {
      totalAssessments: 5,
      totalSessions: 2,
      totalLastResults: 4,
      uniqueParticipants: 3,
      uniqueSessionOwners: 2,
    };

    const comparison = buildCrossTeamComparison(databaseStats, [
      {
        id: "session-1",
        code: "AAA111",
        name: "Alpha",
        ownerEmail: "owner-a@example.com",
        createdAt: "2026-04-24T10:00:00.000Z",
        submissions: [
          makeSubmission("sub-1", "dev-a@example.com", 18, "2026-04-24T10:30:00.000Z"),
          makeSubmission("sub-2", "dev-b@example.com", 22, "2026-04-24T10:45:00.000Z"),
        ],
      },
      {
        id: "session-2",
        code: "BBB222",
        name: "Beta",
        ownerEmail: "owner-b@example.com",
        createdAt: "2026-04-24T11:00:00.000Z",
        submissions: [makeSubmission("sub-3", "dev-c@example.com", 40, "2026-04-24T11:30:00.000Z")],
      },
    ]);

    expect(comparison.databaseStats).toEqual(databaseStats);
    expect(comparison.sessions).toHaveLength(2);
    expect(comparison.sessions[0]).toEqual(expect.objectContaining({
      id: "session-2",
      averageTotalScore: 40,
      totalSubmissions: 1,
      uniqueParticipants: 1,
      maturityLabel: "Strategic",
      latestSubmissionAt: "2026-04-24T11:30:00.000Z",
    }));
    expect(comparison.sessions[1]).toEqual(expect.objectContaining({
      id: "session-1",
      averageTotalScore: 20,
      totalSubmissions: 2,
      uniqueParticipants: 2,
      maturityLabel: "Disciplined",
      latestSubmissionAt: "2026-04-24T10:45:00.000Z",
    }));
  });

  it("handles sessions without submissions", () => {
    const comparison = buildCrossTeamComparison(
      {
        totalAssessments: 0,
        totalSessions: 1,
        totalLastResults: 0,
        uniqueParticipants: 0,
        uniqueSessionOwners: 1,
      },
      [
        {
          id: "session-empty",
          code: "EMPTY1",
          name: "Empty Session",
          ownerEmail: "owner@example.com",
          createdAt: "2026-04-24T09:00:00.000Z",
          submissions: [],
        },
      ],
    );

    expect(comparison.sessions[0]).toEqual(expect.objectContaining({
      totalSubmissions: 0,
      uniqueParticipants: 0,
      averageTotalScore: 0,
      averageCompletion: 0,
      maturityLabel: "Foundational",
      latestSubmissionAt: null,
    }));
  });
});

describe("applySessionFilters", () => {
  const sampleSessions = [
    {
      id: "s-1",
      code: "AAA111",
      name: "Alpha",
      ownerEmail: "owner-a@example.com",
      createdAt: "2026-04-20T10:00:00.000Z",
      latestSubmissionAt: "2026-04-21T10:00:00.000Z",
      totalSubmissions: 2,
      uniqueParticipants: 2,
      averageTotalScore: 18,
      averageCompletion: 95,
      maxScore: 48,
      maturityLabel: "Disciplined" as const,
      categoryAverages: {},
    },
    {
      id: "s-2",
      code: "BBB222",
      name: "Beta",
      ownerEmail: "owner-b@example.com",
      createdAt: "2026-04-24T10:00:00.000Z",
      latestSubmissionAt: "2026-04-24T11:00:00.000Z",
      totalSubmissions: 1,
      uniqueParticipants: 1,
      averageTotalScore: 40,
      averageCompletion: 100,
      maxScore: 48,
      maturityLabel: "Strategic" as const,
      categoryAverages: {},
    },
  ];

  it("filters sessions by createdAt range", () => {
    const result = applySessionFilters(sampleSessions, {
      fromDate: "2026-04-23",
      toDate: "2026-04-25",
      sort: "created-desc",
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("s-2");
  });

  it("sorts sessions by score ascending", () => {
    const result = applySessionFilters(sampleSessions, {
      sort: "score-asc",
    });

    expect(result.map((item) => item.id)).toEqual(["s-1", "s-2"]);
  });
});

describe("buildTeamDetail", () => {
  it("builds ordered submission timeline with running averages", () => {
    const detail = buildTeamDetail({
      code: "TEAM42",
      name: "Architecture Team",
      ownerEmail: "owner@example.com",
      createdAt: "2026-04-20T09:00:00.000Z",
      submissions: [
        makeSubmission("sub-2", "b@example.com", 30, "2026-04-20T11:00:00.000Z"),
        makeSubmission("sub-1", "a@example.com", 20, "2026-04-20T10:00:00.000Z"),
      ],
    });

    expect(detail.totalSubmissions).toBe(2);
    expect(detail.uniqueParticipants).toBe(2);
    expect(detail.submissions.map((item) => item.id)).toEqual(["sub-1", "sub-2"]);
    expect(detail.submissions.map((item) => item.runningAverageScore)).toEqual([20, 25]);
  });
});

describe("admin href builders", () => {
  it("builds report href preserving active filters", () => {
    expect(buildAdminReportHref({
      fromDate: "2026-04-01",
      toDate: "2026-04-30",
      sort: "score-desc",
    })).toBe("/admin?from=2026-04-01&to=2026-04-30&sort=score-desc");
  });

  it("builds team detail href and normalizes session code", () => {
    expect(buildAdminTeamDetailHref(" abc123 ", { sort: "created-desc" })).toBe(
      "/admin/team/ABC123?sort=created-desc",
    );
  });

  it("preserves page in report href when page is greater than one", () => {
    expect(buildAdminReportHrefWithPage({ sort: "created-desc" }, 3)).toBe("/admin?sort=created-desc&page=3");
  });
});

describe("paginateItems", () => {
  it("returns expected page window and metadata", () => {
    const result = paginateItems([1, 2, 3, 4, 5], 2, 2);
    expect(result.items).toEqual([3, 4]);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(3);
    expect(result.totalItems).toBe(5);
  });

  it("clamps out-of-range page values", () => {
    const result = paginateItems([1, 2, 3], 99, 2);
    expect(result.page).toBe(2);
    expect(result.items).toEqual([3]);
  });
});