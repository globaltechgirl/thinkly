export type ID = string;

export type Participant = {
  id: ID;
  name: string;
  avatar?: string;
};

export type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type RuntimeStatus =
  | "PUBLISHED"
  | "INACTIVE"
  | "ACTIVE"
  | "PAUSED"
  | "ENDED";

export type Attempt = {
  id: ID;
  guestId?: string | null;
  score: number;
  totalScore: number;
  percentage: number;
  status: "IN_PROGRESS" | "SUBMITTED" | "NOT_STARTED";
  submittedAt?: string;
};

export type Quiz = {
  id: ID;
  quizName: string;
  description?: string;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  slug: string;
  subdomain: string;
  quizLink: string;
  creatorName?: string;
  creatorImage?: string | null;
  status: QuizStatus;
  runtimeStatus?: RuntimeStatus;
  startTime?: string | null;
  endTime?: string | null;
  activeDuration?: number;
  lastStartedAt?: string | null;
  progress: number;
  responses: number;
  participants: Participant[];
  position: number;
  createdAt?: string;
  updatedAt?: string;
  attempt?: Attempt | null;
};

export type QuizQuestion = {
  id: ID;
  question: string;
  options: string[];
  correctOption: number | null;
  explanation?: string;
};

export type QuizWithQuestions = {
  quiz: Quiz;
  questions: QuizQuestion[];
  attempts: any[];
};

export type QuizQuestionPayload = {
  question: string;
  options: string[];
  correctOption: number;
};

export type CreateQuizPayload = {
  quizName: string;
  description?: string;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  endTime?: string;
  questions: QuizQuestionPayload[];
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

export type CreateQuizResponse = ApiResponse<{
  quizId: ID;
  questionCount: number;
}>;

export type GetQuizzesResponse = ApiResponse<Quiz[]>;

export type GetQuizResponse = {
  quiz: Quiz;
  questions: QuizQuestion[];
};

export type QuizPlayResponse = {
  quiz: Quiz;
  questions: QuizQuestion[];
  hasSubmitted: boolean;
  attempt: Attempt | null;
  attempts: any[];
};
