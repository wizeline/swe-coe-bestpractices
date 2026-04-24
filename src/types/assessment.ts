export type ScoreValue = 1 | 2 | 3 | 4;

export type AnswerMap = Record<string, ScoreValue | undefined>;

export interface Recommendation {
  id: string;
  maxScoreInclusive: number;
  title: string;
  action: string;
}

export interface Question {
  id: string;
  text: string;
  hint?: string;
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
  maturityLabel: "Foundational" | "Disciplined" | "Optimized" | "Strategic";
  categories: CategoryResult[];
}

export interface SubmissionRecord {
  id: string;
  email: string;
  sessionId?: string | null;
  sessionCode?: string | null;
  sessionName?: string | null;
  answers: AnswerMap;
  result: AssessmentResult;
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
  submissionsByEmail: Record<string, SubmissionRecord[]>;
}

export interface LastResultRecord {
  email: string;
  sessionKey: string;
  result: AssessmentResult;
  savedAt: string;
}
