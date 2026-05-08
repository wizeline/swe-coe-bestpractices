import {
  AnswerMap,
  AssessmentModel,
  AssessmentResult,
  CategoryResult,
  Recommendation,
  ScoreValue,
} from "@/types/assessment";
import { MAX_RECOMMENDATIONS_PER_PILLAR } from "@/lib/config";

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
  if (score < 13) {
    return "Foundational";
  }
  if (score < 25) {
    return "Disciplined";
  }
  if (score < 37) {
    return "Optimized";
  }
  return "Strategic";
};

const getCategorySuggestions = (
  score: number,
  recommendations: Recommendation[],
): Recommendation[] => {
  // Find the most relevant action items (closest maxScoreInclusive >= score).
  // This shows the next achievable goals, not all previous ones.
  const filtered = recommendations
    .filter((item) => score <= item.maxScoreInclusive)
    .sort((a, b) => a.maxScoreInclusive - b.maxScoreInclusive);

  return filtered.slice(0, MAX_RECOMMENDATIONS_PER_PILLAR);
};

export const calculateAssessment = (
  model: AssessmentModel,
  answers: AnswerMap,
): AssessmentResult => {
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
        categoryScore,
        [...category.recommendations].sort(
          (a, b) => a.maxScoreInclusive - b.maxScoreInclusive,
        ),
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
  const totalScore = model.categories.reduce((acc, category) => {
    const categoryTotal = category.questions.reduce((categoryAcc, question) => {
      return categoryAcc + (answers[question.id] ?? 0);
    }, 0);

    return acc + categoryTotal;
  }, 0);
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
