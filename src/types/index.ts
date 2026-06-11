export type Difficulty = "easy" | "medium" | "hard";
export type DifficultyOrMixed = Difficulty | "mixed";

export type QuizCategory =
  | "AI 기초 이해"
  | "AI 개념 및 주요 AI 기술의 이해"
  | "금융 데이터의 이해"
  | "금융 AI 활용"
  | "금융 AI의 이해와 활용"
  | "금융 AI 윤리"
  | "AI 윤리 및 관련 법률"
  | "금융 AI 규제"
  | "AI 리스크관리"
  | "금융 AI 보안, 리스크 관리 및 거버넌스"
  | "AI 거버넌스";

export interface QuizQuestion {
  id: string;
  documentName: string;
  page?: number;
  question: string;
  choices: string[]; // exactly 4 (KBI 금융 AI 리터러시 4지선다)
  answerIndex: number; // 0–3
  explanation: string;
  sourceText: string;
  difficulty: Difficulty;
  category: QuizCategory;
}

/** Public-facing question (no answer leaked to client during quiz) */
export type QuizQuestionPublic = Omit<QuizQuestion, "answerIndex" | "explanation">;

export interface QuestionBankItem {
  id: string;
  documentId?: string;
  documentName?: string;
  documentHash?: string;
  chunkHash?: string;
  page?: number;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  sourceText?: string;
  category?: QuizCategory;
  difficulty?: Difficulty;
  status: "active" | "needs_review" | "archived";
  usageCount: number;
  correctCount: number;
  incorrectCount: number;
  qualityScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionSet {
  id: string;
  name: string;
  description?: string;
  documentIds?: string[];
  documentNames?: string[];
  difficulty?: DifficultyOrMixed;
  questionIds: string[];
  totalQuestions: number;
  status: "draft" | "active" | "archived";
  examConfig?: {
    totalQuestions: number;
    categoryAllocation: Array<{
      category: QuizCategory;
      score: number;
      questionCount: number;
    }>;
    difficultyAllocation?: Partial<Record<Difficulty, number>>;
    sampling?: "random" | "category-and-difficulty-random";
  };
  createdAt: string;
  updatedAt: string;
}

export interface QuestionBankFilters {
  status?: QuestionBankItem["status"];
  difficulty?: Difficulty;
  category?: QuizCategory;
  documentId?: string;
  ids?: string[];
}

export interface QuestionBankStats {
  totalQuestions: number;
  activeQuestions: number;
  needsReviewQuestions: number;
  archivedQuestions: number;
  totalSets: number;
  activeSets: number;
  usageCount: number;
  correctCount: number;
  incorrectCount: number;
}

export type ExamQuestionPublic = Omit<
  QuestionBankItem,
  | "usageCount"
  | "correctCount"
  | "incorrectCount"
  | "qualityScore"
  | "status"
  | "createdAt"
  | "updatedAt"
>;

export interface DocumentInfo {
  id: string;
  fileName: string;
  filePath: string;
  pageCount: number;
  chunkCount: number;
  extractedAt: string;
}

export interface ExtractedPage {
  page: number;
  text: string;
}

export interface ExtractedDocument {
  fileName: string;
  filePath: string;
  pages: ExtractedPage[];
  totalPages: number;
  fileHash: string;
  extractedAt: string;
}

export interface DocumentChunk {
  id: string;
  documentName: string;
  fileName: string;
  page: number;
  text: string;
  chunkIndex: number;
}

export interface QuizSet {
  id: string;
  title: string;
  documentNames: string[];
  difficulty: DifficultyOrMixed;
  questions: QuizQuestion[];
  createdAt: string;
  totalQuestions: number;
}

export interface QuizSetSummary
  extends Omit<QuizSet, "questions"> {
  totalQuestions: number;
}

export interface QuestionResult {
  questionId: string;
  question: string;
  choices: string[];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  sourceText: string;
  documentName: string;
  page?: number;
  difficulty: Difficulty;
}

export interface QuizResult {
  resultId: string;
  quizSetId: string;
  title?: string;
  totalQuestions: number;
  correctCount: number;
  score: number; // 0–100 percentage
  completedAt: string;
  questionResults: QuestionResult[];
}

export interface GenerateQuizInput {
  documentIds: string[];
  difficulty: DifficultyOrMixed;
  count: number;
}

export interface ApiError {
  error: string;
  details?: string;
}

/** Raw question object returned from LLM before ID/metadata injection */
export interface RawLlmQuestion {
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  difficulty: Difficulty;
  category: QuizCategory;
  sourceText: string;
}
