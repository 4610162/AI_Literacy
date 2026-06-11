import { z } from "zod";
import type { RawLlmQuestion, QuizQuestion } from "@/types";
import { logger } from "../logger";
import { DEFAULT_CATEGORY, DIFFICULTIES, QUIZ_CATEGORIES } from "./constants";

const RawQuestionSchema = z.object({
  question: z.string().min(5, "question too short"),
  choices: z
    .array(z.string().min(1))
    .length(4, "choices must have exactly 4 items"),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(5, "explanation too short"),
  difficulty: z.enum(DIFFICULTIES),
  category: z
    .enum(QUIZ_CATEGORIES)
    .catch(DEFAULT_CATEGORY), // tolerate unrecognised values by falling back
  sourceText: z.string().min(10, "sourceText too short"),
});

export type ValidationError = { index: number; reason: string };

export function validateRawQuestion(
  raw: unknown,
  index: number
): { valid: true; data: RawLlmQuestion } | { valid: false; error: ValidationError } {
  const result = RawQuestionSchema.safeParse(raw);

  if (!result.success) {
    const reason = result.error.errors.map((e) => e.message).join("; ");
    return { valid: false, error: { index, reason } };
  }

  const data = result.data;

  // Extra semantic checks
  const answer = data.choices[data.answerIndex];
  if (!answer || answer.trim().length === 0) {
    return {
      valid: false,
      error: { index, reason: "answerIndex points to an empty choice" },
    };
  }

  const uniqueChoices = new Set(data.choices.map((c) => c.trim().toLowerCase()));
  if (uniqueChoices.size < 3) {
    return {
      valid: false,
      error: { index, reason: "too many duplicate choices" },
    };
  }

  return { valid: true, data: data as RawLlmQuestion };
}

export function deduplicateQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const seen = new Set<string>();
  const deduped: QuizQuestion[] = [];

  for (const q of questions) {
    // Normalize question text for comparison
    const key = q.question
      .toLowerCase()
      .replace(/[^가-힣a-z0-9]/g, "")
      .slice(0, 80);

    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(q);
    } else {
      logger.debug(`Duplicate question removed: ${q.question.slice(0, 60)}`);
    }
  }

  return deduped;
}

export function validateAndFilter(
  rawArray: unknown[]
): { questions: RawLlmQuestion[]; errors: ValidationError[] } {
  const questions: RawLlmQuestion[] = [];
  const errors: ValidationError[] = [];

  for (let i = 0; i < rawArray.length; i++) {
    const result = validateRawQuestion(rawArray[i], i);
    if (result.valid) {
      questions.push(result.data);
    } else {
      errors.push(result.error);
      logger.warn(`Question ${i} failed validation: ${result.error.reason}`);
    }
  }

  return { questions, errors };
}
