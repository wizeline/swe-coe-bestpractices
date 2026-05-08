import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { MAX_RECOMMENDATIONS_PER_PILLAR } from "@/lib/config";
import { assessmentTemplate } from "@/data/assessmentTemplate";
import { prisma } from "@/lib/prisma";

interface AnalysisPayload {
  analysis: {
    pillars: {
      [key: string]: {
        title: string;
        questions: Array<{
          id: string;
          score: number;
          title?: string;
        }>;
        pillar_score: number;
      };
    };
    raw_score: number;
    score_level: "Foundational" | "Disciplined" | "Optimized" | "Strategic";
  };
}

const STANDARD_PILLAR_IDS = assessmentTemplate.categories.map((category) => category.id);
const TEMPLATE_MAX_SCORE = assessmentTemplate.categories.reduce(
  (acc, category) => acc + category.questions.length * 4,
  0,
);

function isValidScoreValue(value: number): boolean {
  return Number.isFinite(value) && value >= 1 && value <= 4;
}

function getTemplateSuggestions(categoryId: string, pillarScore: number) {
  const category = assessmentTemplate.categories.find((item) => item.id === categoryId);
  if (!category) {
    return [];
  }

  // Convert 1-4 pillar score into 12-48 band to match recommendation thresholds.
  const scoreBand = Math.round(Math.max(1, Math.min(4, pillarScore)) * 12);

  return [...category.recommendations]
    .sort((a, b) => a.maxScoreInclusive - b.maxScoreInclusive)
    .filter((item) => scoreBand <= item.maxScoreInclusive)
    .slice(0, MAX_RECOMMENDATIONS_PER_PILLAR);
}

function buildCategoryResults(payload: AnalysisPayload) {
  return assessmentTemplate.categories.map((templateCategory) => {
    const pillarKey = templateCategory.id;
    const pillarData = payload.analysis.pillars[pillarKey];
    const pillarScore = Math.max(0, Math.min(4, pillarData.pillar_score));
    const suggestions = getTemplateSuggestions(templateCategory.id, pillarScore);

    return {
      id: templateCategory.id,
      title: templateCategory.title,
      score: Number(pillarScore.toFixed(2)),
      answered: Math.min(pillarData.questions.length, templateCategory.questions.length),
      total: templateCategory.questions.length,
      weight: templateCategory.weight,
      suggestions,
    };
  });
}

function validateAnalysisPayload(data: unknown): data is AnalysisPayload {
  const payload = data as AnalysisPayload;

  if (!payload.analysis) {
    return false;
  }

  if (typeof payload.analysis.raw_score !== "number" || payload.analysis.raw_score < 0 || payload.analysis.raw_score > TEMPLATE_MAX_SCORE) {
    return false;
  }

  if (!["Foundational", "Disciplined", "Optimized", "Strategic"].includes(payload.analysis.score_level)) {
    return false;
  }

  if (!payload.analysis.pillars || typeof payload.analysis.pillars !== "object") {
    return false;
  }

  const keys = Object.keys(payload.analysis.pillars);
  const hasAllStandardPillars =
    STANDARD_PILLAR_IDS.every((pillarId) => keys.includes(pillarId)) &&
    keys.length >= STANDARD_PILLAR_IDS.length;

  if (!hasAllStandardPillars) {
    return false;
  }

  for (const pillarId of STANDARD_PILLAR_IDS) {
    const pillar = payload.analysis.pillars[pillarId];
    if (!pillar || typeof pillar.title !== "string") {
      return false;
    }
    if (!Array.isArray(pillar.questions) || pillar.questions.length === 0) {
      return false;
    }
    if (typeof pillar.pillar_score !== "number" || !isValidScoreValue(pillar.pillar_score)) {
      return false;
    }
  }

  return true;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase().trim();
  
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!validateAnalysisPayload(body)) {
    return NextResponse.json({ error: "Invalid analysis payload" }, { status: 400 });
  }

  try {
    const categories = buildCategoryResults(body);
    const totalAnswered = categories.reduce((acc, category) => acc + category.answered, 0);
    const totalQuestions = categories.reduce((acc, category) => acc + category.total, 0);
    const completion = totalQuestions === 0 ? 0 : Math.round((totalAnswered / totalQuestions) * 100);

    const weightedSum = categories.reduce((acc, cat) => acc + cat.score * cat.weight, 0);
    const weightTotal = categories.reduce((acc, cat) => acc + cat.weight, 0);
    const overallScore = Number((weightTotal === 0 ? 0 : weightedSum / weightTotal).toFixed(2));

    const created = await prisma.submission.create({
      data: {
        email: userEmail,
        sessionId: null,
        totalScore: body.analysis.raw_score,
        maxScore: TEMPLATE_MAX_SCORE,
        completion,
        scoreLevel: body.analysis.score_level,
        answers: {} as unknown as Prisma.InputJsonValue,
        result: {
          overallScore,
          totalScore: body.analysis.raw_score,
          maxScore: TEMPLATE_MAX_SCORE,
          completion,
          scoreLevel: body.analysis.score_level,
          categories,
        } as unknown as Prisma.InputJsonValue,
      },
      include: { session: { select: { code: true, name: true } } },
    });

    return NextResponse.json({
      id: created.id,
      email: created.email,
      totalScore: created.totalScore,
      maxScore: created.maxScore,
      scoreLevel: created.scoreLevel,
      submittedAt: created.submittedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }
}
