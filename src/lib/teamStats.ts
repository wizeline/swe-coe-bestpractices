import { assessmentTemplate } from "@/data/assessmentTemplate";
import { SubmissionRecord, TeamStats } from "@/types/assessment";
import { MAX_RECOMMENDATIONS_PER_PILLAR } from "@/lib/config";

function getTotalScore(submission: SubmissionRecord): number {
  return submission.totalScore ?? submission.result.totalScore;
}

export function buildTeamStats(submissions: SubmissionRecord[]): TeamStats {
  const submissionsByEmail: Record<string, SubmissionRecord[]> = {};

  submissions.forEach((sub) => {
    if (!submissionsByEmail[sub.email]) {
      submissionsByEmail[sub.email] = [];
    }
    submissionsByEmail[sub.email].push(sub);
  });

  const totalScores = submissions.map(getTotalScore);
  const averageTotalScore =
    totalScores.length > 0
      ? Number((totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(1))
      : 0;

  const maxTotalScore = submissions[0]?.result.maxScore ?? assessmentTemplate.categories.reduce(
    (acc, category) => acc + category.questions.length * 4,
    0,
  );

  const categoryAverages: Record<string, number> = {};
  const categorySuggestions: Record<string, TeamStats["categorySuggestions"][string]> = {};

  if (submissions.length > 0) {
    const categoryIds = Array.from(
      new Set(
        submissions.flatMap((submission) => submission.result.categories.map((category) => category.id)),
      ),
    );

    for (const categoryId of categoryIds) {
      const categoryEntries = submissions
        .map((submission) => submission.result.categories.find((category) => category.id === categoryId))
        .filter((entry): entry is SubmissionRecord["result"]["categories"][number] => Boolean(entry));

      if (categoryEntries.length === 0) {
        continue;
      }

      const categoryScores = categoryEntries.map((entry) => entry.score);
      const averageScore = Number(
        (categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length).toFixed(2),
      );

      categoryAverages[categoryId] = averageScore;

      const suggestionsFromSubmissions = categoryEntries
        .flatMap((entry) => entry.suggestions)
        .filter((suggestion, index, array) => {
          return array.findIndex((item) => item.id === suggestion.id) === index;
        })
        .slice(0, MAX_RECOMMENDATIONS_PER_PILLAR);

      if (suggestionsFromSubmissions.length > 0) {
        categorySuggestions[categoryId] = suggestionsFromSubmissions;
        continue;
      }

      const categoryTemplate = assessmentTemplate.categories.find((category) => category.id === categoryId);
      categorySuggestions[categoryId] = categoryTemplate
        ? [...categoryTemplate.recommendations]
          .sort((a, b) => a.maxScoreInclusive - b.maxScoreInclusive)
          .filter((item) => averageScore <= item.maxScoreInclusive)
          .slice(0, MAX_RECOMMENDATIONS_PER_PILLAR)
        : [];
    }
  }

  return {
    totalSubmissions: submissions.length,
    uniqueParticipants: Object.keys(submissionsByEmail).length,
    averageTotalScore,
    maxTotalScore,
    categoryAverages,
    categorySuggestions,
    submissionsByEmail,
  };
}