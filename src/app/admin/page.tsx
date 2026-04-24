import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminOverview } from "@/components/assessment/AdminOverview";
import { applySessionFilters, buildCrossTeamComparison, isAdminEmail, paginateItems } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminSessionFilters, AdminSessionSort, AnswerMap, AssessmentResult, SubmissionRecord } from "@/types/assessment";

const RESET_CONFIRMATION = "RESET DATABASE";

interface AdminPageProps {
  searchParams: Promise<{ status?: string; from?: string; to?: string; sort?: string; page?: string }>;
}

type ResetStatus = "invalid-confirmation" | "reset-success" | null;

const allowedSorts: AdminSessionSort[] = ["created-desc", "created-asc", "score-desc", "score-asc"];
const ADMIN_PAGE_SIZE = 10;

function normalizeSort(value?: string): AdminSessionSort {
  return allowedSorts.includes(value as AdminSessionSort)
    ? (value as AdminSessionSort)
    : "created-desc";
}

function normalizePage(value?: string): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function toSubmissionRecord(data: {
  id: string;
  email: string;
  sessionId: string | null;
  totalScore: number | null;
  maxScore: number | null;
  completion: number | null;
  maturityLabel: string | null;
  answers?: Prisma.JsonValue | null;
  result: Prisma.JsonValue;
  submittedAt: Date;
  session?: {
    code: string;
    name: string;
  } | null;
}): SubmissionRecord {
  return {
    id: data.id,
    email: data.email,
    sessionId: data.sessionId,
    sessionCode: data.session?.code ?? null,
    sessionName: data.session?.name ?? null,
    totalScore: data.totalScore ?? undefined,
    maxScore: data.maxScore ?? undefined,
    completion: data.completion ?? undefined,
    maturityLabel: (data.maturityLabel as SubmissionRecord["maturityLabel"]) ?? undefined,
    answers: (data.answers ?? {}) as unknown as AnswerMap,
    result: data.result as unknown as AssessmentResult,
    submittedAt: data.submittedAt.toISOString(),
  };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase().trim();
  const params = await searchParams;
  const filters: AdminSessionFilters = {
    fromDate: params.from,
    toDate: params.to,
    sort: normalizeSort(params.sort),
  };
  const resetStatus: ResetStatus =
    params.status === "invalid-confirmation" || params.status === "reset-success"
      ? params.status
      : null;
  const requestedPage = normalizePage(params.page);

  if (!userEmail) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminEmail(userEmail)) {
    redirect("/dashboard");
  }

  async function resetDatabaseAction(formData: FormData) {
    "use server";

    const actionSession = await auth();
    const actionEmail = actionSession?.user?.email?.toLowerCase().trim();

    if (!actionEmail || !isAdminEmail(actionEmail)) {
      redirect("/dashboard");
    }

    const confirmation = String(formData.get("confirmation") ?? "").trim();
    if (confirmation !== RESET_CONFIRMATION) {
      redirect("/admin?status=invalid-confirmation");
    }

    await prisma.$transaction([
      prisma.submission.deleteMany(),
      prisma.assessmentSession.deleteMany(),
    ]);

    redirect("/admin?status=reset-success");
  }

  const [sessions, totalAssessments, uniqueParticipants, uniqueSessionOwners] = await Promise.all([
    prisma.assessmentSession.findMany({
      include: {
        submissions: {
          select: {
            id: true,
            email: true,
            sessionId: true,
            totalScore: true,
            maxScore: true,
            completion: true,
            maturityLabel: true,
            result: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.submission.count(),
    prisma.submission.findMany({ distinct: ["email"], select: { email: true } }),
    prisma.assessmentSession.findMany({ distinct: ["ownerEmail"], select: { ownerEmail: true } }),
  ]);

  const comparison = buildCrossTeamComparison(
    {
      totalAssessments,
      totalSessions: sessions.length,
      uniqueParticipants: uniqueParticipants.length,
      uniqueSessionOwners: uniqueSessionOwners.length,
    },
    sessions.map((assessmentSession) => ({
      id: assessmentSession.id,
      code: assessmentSession.code,
      name: assessmentSession.name,
      ownerEmail: assessmentSession.ownerEmail,
      createdAt: assessmentSession.createdAt.toISOString(),
      submissions: assessmentSession.submissions.map(toSubmissionRecord),
    })),
  );

  const filteredSessions = applySessionFilters(comparison.sessions, filters);
  const paginatedSessions = paginateItems(filteredSessions, requestedPage, ADMIN_PAGE_SIZE);

  return (
    <section className="page-container">
      <div className="page-header">
        <h1>Cross-Team Comparison</h1>
        <p>
          Compare team-session maturity side by side and monitor high-level database activity across assessments,
          sessions, and saved results.
        </p>
      </div>
      <AdminOverview
        data={comparison}
        sessions={paginatedSessions.items}
        filters={filters}
        pagination={{
          page: paginatedSessions.page,
          pageSize: paginatedSessions.pageSize,
          totalItems: paginatedSessions.totalItems,
          totalPages: paginatedSessions.totalPages,
        }}
        resetStatus={resetStatus}
        resetConfirmation={RESET_CONFIRMATION}
        onResetDatabase={resetDatabaseAction}
      />
    </section>
  );
}