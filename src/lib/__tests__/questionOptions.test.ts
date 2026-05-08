import { describe, expect, it } from "vitest";

import { hintToScoreGuides } from "@/lib/questionOptions";

describe("hintToScoreGuides", () => {
  it("converts a full hint Record into ordered score-description pairs", () => {
    const hint = {
      1: "Foundational behavior.",
      2: "Disciplined behavior.",
      3: "Optimized behavior.",
      4: "Strategic behavior.",
    } as const;

    expect(hintToScoreGuides(hint)).toEqual([
      { score: 1, description: "Foundational behavior." },
      { score: 2, description: "Disciplined behavior." },
      { score: 3, description: "Optimized behavior." },
      { score: 4, description: "Strategic behavior." },
    ]);
  });

  it("returns an empty array when hint is undefined", () => {
    expect(hintToScoreGuides(undefined)).toEqual([]);
  });
});
