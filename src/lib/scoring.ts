import {
  AnswerMap,
  AssessmentModel,
  AssessmentResult,
  CategoryResult,
  RecommendationBand,
  Recommendation,
  ScoreValue,
} from "@/types/assessment";
import { MAX_RECOMMENDATIONS_PER_PILLAR } from "@/lib/config";

/**
 * SCORE_BANDS is the single source of truth for all scoring thresholds.
 *
 * Each band defines the inclusive upper bound of the raw score range.
 * Add or remove questions in assessmentTemplate.ts and update these
 * thresholds here — no other file needs to change.
 *
 * Current setup: 16 questions × 4 max = 64 raw points.
 *   Foundational : 0–12
 *   Disciplined  : 13–24
 *   Optimized    : 25–36
 *   Strategic    : 37–64
 */
export const SCORE_BANDS: Record<RecommendationBand, number> = {
  foundational: 12,
  disciplined: 24,
  optimized: 36,
  // strategic uses Infinity so users at the top band always receive these recommendations.
  strategic: Infinity,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const average = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((acc, value) => acc + value, 0) / values.length;
};

export const getScoreLevel = (
  score: number,
): AssessmentResult["scoreLevel"] => {
  if (score <= SCORE_BANDS.foundational) {
    return "Foundational";
  }
  if (score <= SCORE_BANDS.disciplined) {
    return "Disciplined";
  }
  if (score <= SCORE_BANDS.optimized) {
    return "Optimized";
  }
  return "Strategic";
};

const getCategorySuggestions = (
  score: number,
  recommendations: Recommendation[],
): Recommendation[] => {
  // Resolve band → numeric threshold at runtime so the template stays symbolic.
  const resolved = recommendations.map((item) => ({
    ...item,
    maxScoreInclusive: item.band ? SCORE_BANDS[item.band] : (item.maxScoreInclusive ?? 0),
  }));

  // Find the most relevant action items (closest maxScoreInclusive >= score).
  // This shows the next achievable goals, not all previous ones.
  const filtered = resolved
    .filter((item) => score <= item.maxScoreInclusive)
    .sort((a, b) => a.maxScoreInclusive - b.maxScoreInclusive);

  return filtered.slice(0, MAX_RECOMMENDATIONS_PER_PILLAR);
};

export const calculateAssessment = (
  model: AssessmentModel,
  answers: AnswerMap,
): AssessmentResult => {
  // Compute totalScore first so suggestion selection uses the correct score band.
  const totalScore = model.categories.reduce((acc, category) => {
    const categoryTotal = category.questions.reduce((categoryAcc, question) => {
      return categoryAcc + (answers[question.id] ?? 0);
    }, 0);
    return acc + categoryTotal;
  }, 0);

  const categoryResults: CategoryResult[] = model.categories.map((category) => {
    const questionScores = category.questions
      .map((question) => answers[question.id])
      .filter((score): score is ScoreValue => score !== undefined);

    const categoryScore = average(questionScores);

    return {
      id: category.id,
      title: category.title,
      score: Number(categoryScore.toFixed(2)),
      answered: questionScores.length,
      total: category.questions.length,
      weight: category.weight,
      suggestions: getCategorySuggestions(
        totalScore,
        [...category.recommendations].sort((a, b) => {
          const aMax = a.band ? SCORE_BANDS[a.band] : (a.maxScoreInclusive ?? 0);
          const bMax = b.band ? SCORE_BANDS[b.band] : (b.maxScoreInclusive ?? 0);
          return aMax - bMax;
        }),
      ),
    };
  });

  const totalAnswered = categoryResults.reduce(
    (acc, current) => acc + current.answered,
    0,
  );
  const totalQuestions = categoryResults.reduce(
    (acc, current) => acc + current.total,
    0,
  );

  const weightedScoreSum = categoryResults.reduce(
    (acc, current) => acc + current.score * current.weight,
    0,
  );
  const weightTotal = categoryResults.reduce(
    (acc, current) => acc + current.weight,
    0,
  );

  const overall = weightTotal === 0 ? 0 : weightedScoreSum / weightTotal;
  const completion = totalQuestions === 0 ? 0 : (totalAnswered / totalQuestions) * 100;
  const maxScore = totalQuestions * 4;

  return {
    overallScore: Number(clamp(overall, 0, 4).toFixed(2)),
    totalScore,
    maxScore,
    completion: Number(clamp(completion, 0, 100).toFixed(0)),
    scoreLevel: getScoreLevel(totalScore),
    categories: categoryResults,
  };
};
