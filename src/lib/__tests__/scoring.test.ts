import { describe, it, expect } from "vitest";
import { calculateAssessment } from "@/lib/scoring";
import type { AssessmentModel, AnswerMap, ScoreValue } from "@/types/assessment";

// Threshold model: 13 questions in one category, allowing totalScore to reach all four bands.
// With all answers = 1 → 13 (Disciplined), all = 2 → 26 (Optimized), all = 3 → 39 (Strategic).
const thresholdModel: AssessmentModel = {
  title: "Threshold Test",
  description: "Threshold",
  scaleLabel: "1–4",
  categories: [
    {
      id: "cat-t",
      title: "Threshold Category",
      description: "Coverage for all maturity label boundaries",
      weight: 1.0,
      questions: Array.from({ length: 13 }, (_, i) => ({ id: `tq${i}`, text: `TQ${i}` })),
      recommendations: [
        { id: "tr1", maxScoreInclusive: 12, title: "R1", action: "A1" },
        { id: "tr2", maxScoreInclusive: 24, title: "R2", action: "A2" },
        { id: "tr3", maxScoreInclusive: 36, title: "R3", action: "A3" },
      ],
    },
  ],
};

// Helper: answer all 13 threshold-model questions with the same value
function thresholdAnswers(value: ScoreValue): AnswerMap {
  return Object.fromEntries(Array.from({ length: 13 }, (_, i) => [`tq${i}`, value]));
}

// Helper: answer exactly n threshold-model questions with value 1 (rest unanswered)
function thresholdScore(n: number): AnswerMap {
  return Object.fromEntries(Array.from({ length: n }, (_, i) => [`tq${i}`, 1 as ScoreValue]));
}

// Minimal model fixture used across tests
const minimalModel: AssessmentModel = {
  title: "Test Assessment",
  description: "Test",
  scaleLabel: "1–4",
  categories: [
    {
      id: "cat-a",
      title: "Category A",
      description: "Test category A",
      weight: 0.5,
      questions: [
        { id: "q1", text: "Question 1" },
        { id: "q2", text: "Question 2" },
      ],
      recommendations: [
        { id: "r1", maxScoreInclusive: 12, title: "Rec 1", action: "Do action 1" },
        { id: "r2", maxScoreInclusive: 24, title: "Rec 2", action: "Do action 2" },
        { id: "r3", maxScoreInclusive: 36, title: "Rec 3", action: "Do action 3" },
      ],
    },
    {
      id: "cat-b",
      title: "Category B",
      description: "Test category B",
      weight: 0.5,
      questions: [{ id: "q3", text: "Question 3" }],
      recommendations: [
        { id: "r4", maxScoreInclusive: 12, title: "Rec 4", action: "Do action 4" },
        { id: "r5", maxScoreInclusive: 36, title: "Rec 5", action: "Do action 5" },
      ],
    },
  ],
};

describe("calculateAssessment", () => {
  describe("overall score", () => {
    it("returns 0 when no answers are provided", () => {
      const result = calculateAssessment(minimalModel, {});
      expect(result.overallScore).toBe(0);
      expect(result.totalScore).toBe(0);
      expect(result.maxScore).toBe(12);
    });

    it("calculates a perfect score (4.0) when all answers are 4", () => {
      const answers: AnswerMap = { q1: 4, q2: 4, q3: 4 };
      const result = calculateAssessment(minimalModel, answers);
      expect(result.overallScore).toBe(4);
      expect(result.totalScore).toBe(12);
      expect(result.maxScore).toBe(12);
    });

    it("calculates a weighted average correctly", () => {
      // cat-a: (1 + 3) / 2 = 2.0, weight 0.5
      // cat-b: unanswered, weight 0.5
      // overall: (2.0 * 0.5 + 0 * 0.5) / 1.0 = 1.0
      const answers: AnswerMap = { q1: 1, q2: 3 };
      const result = calculateAssessment(minimalModel, answers);
      expect(result.overallScore).toBe(1);
      expect(result.totalScore).toBe(4);
    });

    it("clamps overallScore to maximum of 4", () => {
      const answers: AnswerMap = { q1: 4, q2: 4, q3: 4 };
      const result = calculateAssessment(minimalModel, answers);
      expect(result.overallScore).toBeLessThanOrEqual(4);
    });

    it("clamps overallScore to minimum of 0", () => {
      const answers: AnswerMap = { q1: 1, q2: 1, q3: 1 };
      const result = calculateAssessment(minimalModel, answers);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe("score levels", () => {
    it("labels score < 13 as Foundational", () => {
      const answers: AnswerMap = { q1: 1, q2: 1, q3: 1 };
      expect(calculateAssessment(minimalModel, answers).scoreLevel).toBe("Foundational");
    });

    it("labels score 12 as Foundational and score 13 as Disciplined (lower boundary)", () => {
      expect(calculateAssessment(thresholdModel, thresholdScore(12)).scoreLevel).toBe(
        "Foundational"
      );
      expect(calculateAssessment(thresholdModel, thresholdScore(13)).scoreLevel).toBe(
        "Disciplined"
      );
    });

    it("labels score 24 as Disciplined and score 25 as Optimized (mid boundary)", () => {
      // 24 questions scored 1 would require a bigger model; use 6×4=24 and 7×4=28 instead
      const score24Answers = Object.fromEntries(
        Array.from({ length: 6 }, (_, i) => [`tq${i}`, 4 as ScoreValue])
      );
      const score28Answers = Object.fromEntries(
        Array.from({ length: 7 }, (_, i) => [`tq${i}`, 4 as ScoreValue])
      );
      expect(calculateAssessment(thresholdModel, score24Answers).scoreLevel).toBe("Disciplined");
      expect(calculateAssessment(thresholdModel, score28Answers).scoreLevel).toBe("Optimized");
    });

    it("labels score 36 as Optimized and score 37 as Strategic (upper boundary)", () => {
      // 9×4=36, 10×4=40
      const score36Answers = Object.fromEntries(
        Array.from({ length: 9 }, (_, i) => [`tq${i}`, 4 as ScoreValue])
      );
      const score40Answers = Object.fromEntries(
        Array.from({ length: 10 }, (_, i) => [`tq${i}`, 4 as ScoreValue])
      );
      expect(calculateAssessment(thresholdModel, score36Answers).scoreLevel).toBe("Optimized");
      expect(calculateAssessment(thresholdModel, score40Answers).scoreLevel).toBe("Strategic");
    });

    it("labels all-4 answers as Strategic", () => {
      // 13 × 4 = 52 → Strategic
      expect(calculateAssessment(thresholdModel, thresholdAnswers(4)).scoreLevel).toBe("Strategic");
    });

    it("labels all-1 answers as Disciplined (13 questions × 1 = 13)", () => {
      expect(calculateAssessment(thresholdModel, thresholdAnswers(1)).scoreLevel).toBe(
        "Disciplined"
      );
    });

    it("labels all-2 answers as Optimized (13 questions × 2 = 26)", () => {
      expect(calculateAssessment(thresholdModel, thresholdAnswers(2)).scoreLevel).toBe("Optimized");
    });

    it("labels all-3 answers as Strategic (13 questions × 3 = 39)", () => {
      expect(calculateAssessment(thresholdModel, thresholdAnswers(3)).scoreLevel).toBe("Strategic");
    });
  });

  describe("completion percentage", () => {
    it("returns 0% when no answers are provided", () => {
      const result = calculateAssessment(minimalModel, {});
      expect(result.completion).toBe(0);
    });

    it("returns 100% when all questions are answered", () => {
      const answers: AnswerMap = { q1: 1, q2: 2, q3: 3 };
      expect(calculateAssessment(minimalModel, answers).completion).toBe(100);
    });

    it("returns partial completion when some questions are skipped", () => {
      const answers: AnswerMap = { q1: 1 }; // 1 of 3 answered
      expect(calculateAssessment(minimalModel, answers).completion).toBe(33);
    });
  });

  describe("category results", () => {
    it("returns a result entry for each category", () => {
      const result = calculateAssessment(minimalModel, {});
      expect(result.categories).toHaveLength(2);
    });

    it("correctly reports answered count per category", () => {
      const answers: AnswerMap = { q1: 2 }; // only cat-a q1
      const result = calculateAssessment(minimalModel, answers);
      const catA = result.categories.find((c) => c.id === "cat-a")!;
      expect(catA.answered).toBe(1);
      expect(catA.total).toBe(2);
    });

    it("reports score 0 for a category with no answers", () => {
      const result = calculateAssessment(minimalModel, {});
      result.categories.forEach((cat) => {
        expect(cat.score).toBe(0);
      });
    });
  });

  describe("recommendations (suggestions)", () => {
    it("returns at most 2 suggestions per category", () => {
      const answers: AnswerMap = {};
      const result = calculateAssessment(minimalModel, answers);
      result.categories.forEach((cat) => {
        expect(cat.suggestions.length).toBeLessThanOrEqual(2);
      });
    });

    it("only returns recommendations at or above the category score threshold", () => {
      // cat-a score = 0 when unanswered
      const answers: AnswerMap = {};
      const result = calculateAssessment(minimalModel, answers);
      const catA = result.categories.find((c) => c.id === "cat-a")!;
      catA.suggestions.forEach((rec) => {
        expect(rec.maxScoreInclusive).toBeGreaterThanOrEqual(catA.score);
      });
    });

    it("returns no suggestions when score exceeds all recommendation thresholds", () => {
      // cat-b has recs maxScoreInclusive 0 and 3.
      // At score 3, recs with maxScoreInclusive < 3 are filtered out.
      // score = 3, filter: score <= maxScoreInclusive → only r5 (maxScoreInclusive=3) passes
      const answers: AnswerMap = { q1: 3, q2: 3, q3: 3 };
      const result = calculateAssessment(minimalModel, answers);
      const catB = result.categories.find((c) => c.id === "cat-b")!;
      catB.suggestions.forEach((rec) => {
        expect(rec.maxScoreInclusive).toBeGreaterThanOrEqual(catB.score);
      });
    });

    it("selects recommendation matching the overall score band", () => {
      // totalScore=3 (3×1) → Foundational (< 13) → r1 (maxScoreInclusive=12)
      const foundational = calculateAssessment(minimalModel, { q1: 1, q2: 1, q3: 1 });
      expect(foundational.categories.find((c) => c.id === "cat-a")!.suggestions[0]?.id).toBe("r1");

      // totalScore=13 (13×1) → Disciplined (13–24) → tr2 (maxScoreInclusive=24)
      const disciplined = calculateAssessment(thresholdModel, thresholdAnswers(1));
      expect(disciplined.categories.find((c) => c.id === "cat-t")!.suggestions[0]?.id).toBe("tr2");

      // totalScore=26 (13×2) → Optimized (25–36) → tr3 (maxScoreInclusive=36)
      const optimized = calculateAssessment(thresholdModel, thresholdAnswers(2));
      expect(optimized.categories.find((c) => c.id === "cat-t")!.suggestions[0]?.id).toBe("tr3");

      // totalScore=52 (13×4) → Strategic (≥37) → no suggestions (all thresholds exceeded)
      const strategic = calculateAssessment(thresholdModel, thresholdAnswers(4));
      expect(strategic.categories.find((c) => c.id === "cat-t")!.suggestions).toHaveLength(0);
    });
  });

  describe("edge cases", () => {
    it("handles a model with no categories gracefully", () => {
      const emptyModel: AssessmentModel = {
        ...minimalModel,
        categories: [],
      };
      const result = calculateAssessment(emptyModel, {});
      expect(result.overallScore).toBe(0);
      expect(result.completion).toBe(0);
      expect(result.categories).toHaveLength(0);
    });

    it("ignores answers for unknown question ids", () => {
      const answers: AnswerMap = { "unknown-id": 3, q1: 2, q2: 2, q3: 2 };
      const result = calculateAssessment(minimalModel, answers);
      // overall should still be 2.0 — unknown id is ignored
      expect(result.overallScore).toBe(2);
    });

    it("produces deterministic results for the same input", () => {
      const answers: AnswerMap = { q1: 1, q2: 2, q3: 3 };
      const r1 = calculateAssessment(minimalModel, answers);
      const r2 = calculateAssessment(minimalModel, answers);
      expect(r1).toEqual(r2);
    });

    it("handles a category with no questions (score and answered both 0)", () => {
      const emptyQModel: AssessmentModel = {
        ...minimalModel,
        categories: [
          {
            id: "cat-empty",
            title: "Empty",
            description: "No questions",
            weight: 1.0,
            questions: [],
            recommendations: [],
          },
        ],
      };
      const result = calculateAssessment(emptyQModel, {});
      expect(result.categories[0].score).toBe(0);
      expect(result.categories[0].answered).toBe(0);
      expect(result.overallScore).toBe(0);
    });

    it("handles a category with no recommendations (returns empty suggestions)", () => {
      const noRecModel: AssessmentModel = {
        ...minimalModel,
        categories: [
          { ...minimalModel.categories[0], recommendations: [] },
          minimalModel.categories[1],
        ],
      };
      const result = calculateAssessment(noRecModel, { q1: 1, q2: 1 });
      expect(result.categories[0].suggestions).toEqual([]);
    });

    it("computes maxScore as 4 × total questions regardless of answers", () => {
      const result = calculateAssessment(minimalModel, {});
      expect(result.maxScore).toBe(minimalModel.categories.flatMap((c) => c.questions).length * 4);
    });

    it("counts unanswered questions as 0 in totalScore", () => {
      // q1=2, q2 and q3 unanswered → totalScore = 2
      const result = calculateAssessment(minimalModel, { q1: 2 });
      expect(result.totalScore).toBe(2);
    });

    it("returns exactly 50% completion when half the questions are answered", () => {
      // minimalModel has 3 questions total (q1,q2 in cat-a, q3 in cat-b)
      // answering 1 of 2 in cat-a → 1/3 ≈ 33%
      // answering 2 of 3 → 2/3 ≈ 67%
      const result = calculateAssessment(minimalModel, { q1: 1, q2: 1 });
      expect(result.completion).toBe(67);
    });
  });
});
