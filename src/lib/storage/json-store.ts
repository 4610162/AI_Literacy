import fsPromises from "fs/promises";
import path from "path";
import crypto from "crypto";
import type {
  Difficulty,
  QuestionBankFilters,
  QuestionBankItem,
  QuestionSet,
  QuizQuestion,
  QuizSet,
} from "@/types";
import { logger } from "@/lib/logger";

const DATA_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
const QUIZ_DIR = path.join(DATA_DIR, "quizzes");
const QUESTION_BANK_DIR = path.join(DATA_DIR, "question-bank");
const QUESTION_SET_DIR = path.join(DATA_DIR, "question-sets");

async function listJsonFiles(dir: string): Promise<string[]> {
  try {
    const files = await fsPromises.readdir(dir);
    return files.filter((file) => file.endsWith(".json"));
  } catch (err) {
    logger.warn(`Failed to list JSON files in ${dir}`, err);
    return [];
  }
}

function hashText(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function toQuestionBankItem(
  question: QuizQuestion,
  now = new Date().toISOString()
): QuestionBankItem {
  return {
    id: question.id,
    documentId: question.documentName,
    documentName: question.documentName,
    chunkHash: hashText(question.sourceText || question.question),
    page: question.page,
    question: question.question,
    choices: question.choices,
    answerIndex: question.answerIndex,
    explanation: question.explanation,
    sourceText: question.sourceText,
    category: question.category,
    difficulty: question.difficulty as Difficulty,
    status: "active",
    usageCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    qualityScore: 1,
    createdAt: now,
    updatedAt: now,
  };
}

function legacyQuizToQuestionSet(quiz: QuizSet): QuestionSet {
  return {
    id: quiz.id,
    name: quiz.title,
    documentIds: quiz.documentNames,
    documentNames: quiz.documentNames,
    difficulty: quiz.difficulty,
    questionIds: quiz.questions.map((q) => q.id),
    totalQuestions: quiz.questions.length,
    status: "active",
    createdAt: quiz.createdAt,
    updatedAt: quiz.createdAt,
  };
}

// ─── Quiz Sets ────────────────────────────────────────────────────────────────

export async function loadQuizSet(id: string): Promise<QuizSet | null> {
  const filePath = path.join(QUIZ_DIR, `${id}.json`);
  try {
    const raw = await fsPromises.readFile(filePath, "utf-8");
    return JSON.parse(raw) as QuizSet;
  } catch {
    return null;
  }
}

export async function listQuizSets(): Promise<QuizSet[]> {
  const files = await listJsonFiles(QUIZ_DIR);
  const quizzes: QuizSet[] = [];

  for (const file of files) {
    try {
      const raw = await fsPromises.readFile(path.join(QUIZ_DIR, file), "utf-8");
      quizzes.push(JSON.parse(raw) as QuizSet);
    } catch (err) {
      logger.warn(`Failed to load quiz file ${file}`, err);
    }
  }

  return quizzes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ─── Question Bank / Question Sets ───────────────────────────────────────────

export async function listQuestionBankItems(
  filters: QuestionBankFilters = {}
): Promise<QuestionBankItem[]> {
  const items: QuestionBankItem[] = [];

  const bankFiles = await listJsonFiles(QUESTION_BANK_DIR);
  for (const file of bankFiles) {
    try {
      const raw = await fsPromises.readFile(path.join(QUESTION_BANK_DIR, file), "utf-8");
      items.push(JSON.parse(raw) as QuestionBankItem);
    } catch (err) {
      logger.warn(`Failed to load question bank file ${file}`, err);
    }
  }

  const legacyQuizzes = await listQuizSets();
  const existingIds = new Set(items.map((item) => item.id));
  for (const quiz of legacyQuizzes) {
    for (const question of quiz.questions) {
      if (!existingIds.has(question.id)) {
        items.push(toQuestionBankItem(question, quiz.createdAt));
      }
    }
  }

  return items.filter((item) => {
    if (filters.ids && !filters.ids.includes(item.id)) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.documentId && item.documentId !== filters.documentId) return false;
    return true;
  });
}

export async function findQuestionBankItemsByIds(ids: string[]): Promise<QuestionBankItem[]> {
  const byId = new Map((await listQuestionBankItems()).map((item) => [item.id, item]));
  return ids.map((id) => byId.get(id)).filter((item): item is QuestionBankItem => Boolean(item));
}

export async function listQuestionSets(): Promise<QuestionSet[]> {
  const sets: QuestionSet[] = [];
  const files = await listJsonFiles(QUESTION_SET_DIR);

  for (const file of files) {
    try {
      const raw = await fsPromises.readFile(path.join(QUESTION_SET_DIR, file), "utf-8");
      sets.push(JSON.parse(raw) as QuestionSet);
    } catch (err) {
      logger.warn(`Failed to load question set file ${file}`, err);
    }
  }

  const existingIds = new Set(sets.map((set) => set.id));
  const legacyQuizzes = await listQuizSets();
  for (const quiz of legacyQuizzes) {
    if (!existingIds.has(quiz.id)) sets.push(legacyQuizToQuestionSet(quiz));
  }

  return sets.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function findQuestionSetById(id: string): Promise<QuestionSet | null> {
  const sets = await listQuestionSets();
  return sets.find((set) => set.id === id) ?? null;
}
