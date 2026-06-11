import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listQuestionBankItems } from "@/lib/storage/json-store";
import {
  alignExplanationAnswerNumber,
  buildChoiceOrder,
  shuffleArray,
  uniqueByQuestionText,
} from "@/lib/exam/session";
import type { QuestionBankItem, QuizCategory } from "@/types";
import { logger } from "@/lib/logger";
import { PRACTICE_CATEGORIES } from "@/lib/quiz/constants";

const QuerySchema = z.object({
  category: z.enum(PRACTICE_CATEGORIES),
  count: z.coerce.number().int().min(1).max(30).default(10),
});

function toPracticeQuestion(question: QuestionBankItem) {
  const choiceOrder = buildChoiceOrder(question, true);
  const answerIndex = choiceOrder.indexOf(question.answerIndex);

  return {
    id: question.id,
    question: question.question,
    choices: choiceOrder.map((index) => question.choices[index]),
    answerIndex,
    explanation: alignExplanationAnswerNumber(question.explanation, answerIndex),
    sourceText: question.sourceText,
    category: question.category,
    difficulty: question.difficulty,
    documentName: question.documentName,
    page: question.page,
  };
}

export async function GET(request: NextRequest) {
  const parsed = QuerySchema.safeParse({
    category: request.nextUrl.searchParams.get("category"),
    count: request.nextUrl.searchParams.get("count") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const { category, count } = parsed.data;
    const questions = uniqueByQuestionText(await listQuestionBankItems({
      status: "active",
      category: category as QuizCategory,
    }));

    if (questions.length === 0) {
      return NextResponse.json({ error: "해당 주제의 문제가 없습니다." }, { status: 404 });
    }

    const selected = shuffleArray(questions).slice(0, Math.min(count, questions.length));
    return NextResponse.json({
      category,
      totalAvailable: questions.length,
      questions: selected.map(toPracticeQuestion),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("GET /api/practice failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
