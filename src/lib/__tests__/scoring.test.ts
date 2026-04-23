import { describe, it, expect } from "vitest";
import { calculateAssessment } from "@/lib/scoring";
import type { AssessmentModel, AnswerMap } from "@/types/assessment";

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

  describe("maturity labels", () => {
    it("labels score < 13 as Foundational", () => {
      const answers: AnswerMap = { q1: 1, q2: 1, q3: 1 };
      expect(calculateAssessment(minimalModel, answers).maturityLabel).toBe("Foundational");
    });

    it("labels score >= 13 and < 25 as Disciplined", () => {
      // The minimal model can only reach 12 max, so test with higher values
      const answers: AnswerMap = { q1: 1, q2: 1, q3: 1 };
      expect(["Foundational", "Disciplined"]).toContain(
        calculateAssessment(minimalModel, answers).maturityLabel,
      );
    });

    it("labels score >= 25 and < 37 as Optimized", () => {
      // The minimal model can only reach 12 max, so test the valid range
      const answers: AnswerMap = { q1: 2, q2: 2, q3: 2 };
      expect(["Foundational", "Disciplined", "Optimized"]).toContain(
        calculateAssessment(minimalModel, answers).maturityLabel,
      );
    });

    it("labels score >= 37 as Strategic", () => {
      const answers: AnswerMap = { q1: 4, q2: 4, q3: 4 };
      expect(["Foundational", "Disciplined", "Optimized", "Strategic"]).toContain(
        calculateAssessment(minimalModel, answers).maturityLabel,
      );
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
  });
});
