import { assessmentTemplate } from "@/data/assessmentTemplate";
import { SubmissionRecord, TeamStats } from "@/types/assessment";

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
    const categoryCount = submissions[0].result.categories.length;
    for (let i = 0; i < categoryCount; i += 1) {
      const categoryScores = submissions.map((submission) => submission.result.categories[i].score);
      const categoryId = submissions[0].result.categories[i].id;
      const averageScore = Number(
        (categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length).toFixed(2),
      );

      categoryAverages[categoryId] = averageScore;

      const categoryTemplate = assessmentTemplate.categories.find((category) => category.id === categoryId);
      categorySuggestions[categoryId] = categoryTemplate
        ? [...categoryTemplate.recommendations]
          .sort((a, b) => a.maxScoreInclusive - b.maxScoreInclusive)
          .filter((item) => averageScore <= item.maxScoreInclusive)
          .slice(0, 2)
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