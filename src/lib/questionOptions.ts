import type { ScoreValue } from "@/types/assessment";

export interface ScoreGuideOption {
  score: ScoreValue;
  description: string;
}

/**
 * Converts a hint Record into an ordered array of score-description pairs.
 * Returns an empty array when no hint is provided.
 */
export function hintToScoreGuides(hint: Record<ScoreValue, string> | undefined): ScoreGuideOption[] {
  if (!hint) return [];
  return ([1, 2, 3, 4] as ScoreValue[]).map((score) => ({
    score,
    description: hint[score],
  }));
}
