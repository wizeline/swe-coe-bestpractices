export type ScoreValue = 1 | 2 | 3 | 4;

export type AnswerMap = Record<string, ScoreValue | undefined>;

/**
 * Symbolic name for a score band used in recommendations.
 * Maps to a numeric maxScoreInclusive threshold via SCORE_BANDS in scoring.ts.
 * "strategic" maps to Infinity — always shown to users who have reached the top band.
 */
export type RecommendationBand = "foundational" | "disciplined" | "optimized" | "strategic";

export interface Recommendation {
  id: string;
  /**
   * Preferred: use `band` to stay independent of raw score thresholds.
   * The runtime resolves this to maxScoreInclusive via SCORE_BANDS.
   */
  band?: RecommendationBand;
  /** Legacy / explicit override. Ignored when `band` is set. */
  maxScoreInclusive?: number;
  title: string;
  action: string;
}

export interface Question {
  id: string;
  text: string;
  /**
   * Per-level descriptions shown next to each answer option in the form.
   * Keyed by ScoreValue so TypeScript enforces all four levels are present.
   */
  hint?: Record<ScoreValue, string>;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  weight: number;
  questions: Question[];
  recommendations: Recommendation[];
}

export interface AssessmentModel {
  title: string;
  description: string;
  scaleLabel: string;
  categories: Category[];
}

export interface CategoryResult {
  id: string;
  title: string;
  score: number;
  answered: number;
  total: number;
  weight: number;
  suggestions: Recommendation[];
}

export interface AssessmentResult {
  overallScore: number;
  totalScore: number;
  maxScore: number;
  completion: number;
  scoreLevel: "Foundational" | "Disciplined" | "Optimized" | "Strategic";
  categories: CategoryResult[];
}

export interface SubmissionRecord {
  id: string;
  email: string;
  sessionId?: string | null;
  sessionCode?: string | null;
  sessionName?: string | null;
  totalScore?: number;
  maxScore?: number;
  completion?: number;
  scoreLevel?: AssessmentResult["scoreLevel"];
  answers: AnswerMap;
  result: AssessmentResult;
  submittedAt: string;
}

export interface AnalysisSubmissionResponse {
  id: string;
  email: string;
  totalScore: number;
  maxScore: number;
  scoreLevel: AssessmentResult["scoreLevel"];
  submittedAt: string;
}

export interface AssessmentSessionRecord {
  id: string;
  code: string;
  name: string;
  ownerEmail: string;
  createdAt: string;
  isOwner: boolean;
}

export interface TeamStats {
  totalSubmissions: number;
  uniqueParticipants: number;
  averageTotalScore: number;
  maxTotalScore: number;
  categoryAverages: Record<string, number>;
  categorySuggestions: Record<string, Recommendation[]>;
  submissionsByEmail: Record<string, SubmissionRecord[]>;
}

export interface DatabaseStats {
  totalAssessments: number;
  totalSessions: number;
  uniqueParticipants: number;
  uniqueSessionOwners: number;
}

export interface SessionComparisonRecord {
  id: string;
  code: string;
  name: string;
  ownerEmail: string;
  createdAt: string;
  latestSubmissionAt: string | null;
  totalSubmissions: number;
  uniqueParticipants: number;
  averageTotalScore: number;
  averageCompletion: number;
  maxScore: number;
  scoreLevel: AssessmentResult["scoreLevel"];
  categoryAverages: Record<string, number>;
}

export interface CrossTeamComparison {
  databaseStats: DatabaseStats;
  sessions: SessionComparisonRecord[];
}

export type AdminSessionSort = "created-desc" | "created-asc" | "score-desc" | "score-asc";

export interface AdminSessionFilters {
  fromDate?: string;
  toDate?: string;
  sort: AdminSessionSort;
}

export interface TeamDetailSubmission {
  id: string;
  email: string;
  submittedAt: string;
  totalScore: number;
  maxScore: number;
  completion: number;
  scoreLevel: AssessmentResult["scoreLevel"];
  runningAverageScore: number;
}

export interface TeamDetailRecord {
  code: string;
  name: string;
  ownerEmail: string;
  createdAt: string;
  totalSubmissions: number;
  uniqueParticipants: number;
  submissions: TeamDetailSubmission[];
}

export interface AdminPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
