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
  totalScore?: number;
  maxScore?: number;
  completion?: number;
  maturityLabel?: AssessmentResult["maturityLabel"];
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
  categorySuggestions: Record<string, Recommendation[]>;
  submissionsByEmail: Record<string, SubmissionRecord[]>;
}

export interface DatabaseStats {
  totalAssessments: number;
  totalSessions: number;
  totalLastResults: number;
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
  maturityLabel: AssessmentResult["maturityLabel"];
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
  maturityLabel: AssessmentResult["maturityLabel"];
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

export interface LastResultRecord {
  email: string;
  sessionKey: string;
  result: AssessmentResult;
  savedAt: string;
}
