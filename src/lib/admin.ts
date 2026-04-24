import {
  AdminSessionFilters,
  AdminSessionSort,
  CrossTeamComparison,
  DatabaseStats,
  SessionComparisonRecord,
  SubmissionRecord,
  TeamDetailRecord,
  TeamDetailSubmission,
} from "@/types/assessment";
import { getMaturityLabel } from "@/lib/scoring";
import { buildTeamStats } from "@/lib/teamStats";

interface SessionComparisonInput {
  id: string;
  code: string;
  name: string;
  ownerEmail: string;
  createdAt: string;
  submissions: SubmissionRecord[];
}

interface TeamDetailInput {
  code: string;
  name: string;
  ownerEmail: string;
  createdAt: string;
  submissions: SubmissionRecord[];
}

function averageCompletion(submissions: SubmissionRecord[]): number {
  if (submissions.length === 0) {
    return 0;
  }

  return Number(
    (
      submissions.reduce(
        (total, submission) => total + (submission.completion ?? submission.result.completion),
        0,
      ) / submissions.length
    ).toFixed(1),
  );
}

export function isAdminEmail(email?: string | null): boolean {
  const normalized = email?.toLowerCase().trim();
  if (!normalized) {
    return false;
  }

  const configuredAdmins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.toLowerCase().trim())
    .filter(Boolean);

  return configuredAdmins.includes(normalized);
}

export function buildSessionComparisonRecord(input: SessionComparisonInput): SessionComparisonRecord {
  const stats = buildTeamStats(input.submissions);
  const latestSubmissionAt = input.submissions.at(-1)?.submittedAt ?? null;

  return {
    id: input.id,
    code: input.code,
    name: input.name,
    ownerEmail: input.ownerEmail,
    createdAt: input.createdAt,
    latestSubmissionAt,
    totalSubmissions: stats.totalSubmissions,
    uniqueParticipants: stats.uniqueParticipants,
    averageTotalScore: stats.averageTotalScore,
    averageCompletion: averageCompletion(input.submissions),
    maxScore: stats.maxTotalScore,
    maturityLabel: getMaturityLabel(Math.round(stats.averageTotalScore)),
    categoryAverages: stats.categoryAverages,
  };
}

export function buildCrossTeamComparison(
  databaseStats: DatabaseStats,
  sessions: SessionComparisonInput[],
): CrossTeamComparison {
  return {
    databaseStats,
    sessions: sessions
      .map(buildSessionComparisonRecord)
      .sort((left, right) => right.averageTotalScore - left.averageTotalScore || left.name.localeCompare(right.name)),
  };
}

function normalizeFilterDate(value?: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function toIsoDate(value: string): string {
  return value.slice(0, 10);
}

function sortSessions(
  sessions: SessionComparisonRecord[],
  sort: AdminSessionSort,
): SessionComparisonRecord[] {
  const list = [...sessions];

  if (sort === "created-asc") {
    return list.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }
  if (sort === "score-desc") {
    return list.sort(
      (left, right) =>
        right.averageTotalScore - left.averageTotalScore ||
        right.createdAt.localeCompare(left.createdAt),
    );
  }
  if (sort === "score-asc") {
    return list.sort(
      (left, right) =>
        left.averageTotalScore - right.averageTotalScore ||
        left.createdAt.localeCompare(right.createdAt),
    );
  }

  return list.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function applySessionFilters(
  sessions: SessionComparisonRecord[],
  filters: AdminSessionFilters,
): SessionComparisonRecord[] {
  const fromDate = normalizeFilterDate(filters.fromDate);
  const toDate = normalizeFilterDate(filters.toDate);

  const filtered = sessions.filter((session) => {
    const createdDate = toIsoDate(session.createdAt);
    if (fromDate && createdDate < fromDate) {
      return false;
    }
    if (toDate && createdDate > toDate) {
      return false;
    }
    return true;
  });

  return sortSessions(filtered, filters.sort);
}

export function buildAdminReportHref(filters: AdminSessionFilters): string {
  return buildAdminReportHrefWithPage(filters);
}

export function buildAdminReportHrefWithPage(filters: AdminSessionFilters, page?: number): string {
  const search = new URLSearchParams();
  if (filters.fromDate) {
    search.set("from", filters.fromDate);
  }
  if (filters.toDate) {
    search.set("to", filters.toDate);
  }
  search.set("sort", filters.sort);
  if (page && page > 1) {
    search.set("page", String(page));
  }

  const query = search.toString();
  return query ? `/admin?${query}` : "/admin";
}

export function buildAdminTeamDetailHref(teamCode: string, filters: AdminSessionFilters, page?: number): string {
  const encodedCode = encodeURIComponent(teamCode.trim().toUpperCase());
  const reportHref = buildAdminReportHrefWithPage(filters, page);
  return reportHref === "/admin"
    ? `/admin/team/${encodedCode}`
    : `/admin/team/${encodedCode}?${reportHref.slice("/admin?".length)}`;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const normalizedPageSize = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / normalizedPageSize));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);
  const start = (normalizedPage - 1) * normalizedPageSize;

  return {
    items: items.slice(start, start + normalizedPageSize),
    page: normalizedPage,
    pageSize: normalizedPageSize,
    totalItems,
    totalPages,
  };
}

export function buildTeamDetail(input: TeamDetailInput): TeamDetailRecord {
  const submissionsSorted = [...input.submissions].sort((left, right) =>
    left.submittedAt.localeCompare(right.submittedAt),
  );
  const uniqueParticipants = new Set(submissionsSorted.map((submission) => submission.email)).size;

  let runningTotal = 0;
  const timeline: TeamDetailSubmission[] = submissionsSorted.map((submission, index) => {
    const totalScore = submission.totalScore ?? submission.result.totalScore;
    const maxScore = submission.maxScore ?? submission.result.maxScore;
    const completion = submission.completion ?? submission.result.completion;
    const maturityLabel = submission.maturityLabel ?? submission.result.maturityLabel;
    runningTotal += totalScore;
    return {
      id: submission.id,
      email: submission.email,
      submittedAt: submission.submittedAt,
      totalScore,
      maxScore,
      completion,
      maturityLabel,
      runningAverageScore: Number((runningTotal / (index + 1)).toFixed(2)),
    };
  });

  return {
    code: input.code,
    name: input.name,
    ownerEmail: input.ownerEmail,
    createdAt: input.createdAt,
    totalSubmissions: timeline.length,
    uniqueParticipants,
    submissions: timeline,
  };
}