import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  findQuestionBankItemsByIds,
  findQuestionSetById,
} from "@/lib/storage/json-store";
import {
  buildChoiceOrder,
  sampleQuestions,
  shuffleArray,
  toExamQuestionPublic,
  uniqueByQuestionText,
} from "@/lib/exam/session";
import type { Difficulty, QuestionBankItem, QuestionSet } from "@/types";
import { logger } from "@/lib/logger";
import { DIFFICULTIES } from "@/lib/quiz/constants";

const StartSchema = z.object({
  questionSetId: z.string().min(1),
  questionCount: z.number().int().min(1).max(100).optional(),
  shuffleQuestions: z.boolean().default(true),
  shuffleChoices: z.boolean().default(true),
});

function allocateCounts(total: number, weights: Partial<Record<Difficulty, number>>): Record<Difficulty, number> {
  const weighted = DIFFICULTIES.map((difficulty) => ({
    difficulty,
    weight: weights[difficulty] ?? 1,
  }));
  const weightTotal = weighted.reduce((sum, item) => sum + item.weight, 0);
  const raw = weighted.map((item) => ({
    ...item,
    exact: (total * item.weight) / weightTotal,
  }));

  const counts = Object.fromEntries(
    raw.map((item) => [item.difficulty, Math.floor(item.exact)])
  ) as Record<Difficulty, number>;
  let remaining = total - Object.values(counts).reduce((sum, count) => sum + count, 0);

  for (const item of raw.sort((a, b) => (b.exact % 1) - (a.exact % 1))) {
    if (remaining <= 0) break;
    counts[item.difficulty] += 1;
    remaining -= 1;
  }

  return counts;
}

function sampleConfiguredQuestions(
  items: QuestionBankItem[],
  questionSet: QuestionSet,
  fallbackCount: number,
  shuffleQuestions: boolean
): QuestionBankItem[] {
  const config = questionSet.examConfig;
  if (
    !config ||
    config.sampling !== "category-and-difficulty-random" ||
    fallbackCount !== config.totalQuestions
  ) {
    return sampleQuestions(items, fallbackCount, shuffleQuestions);
  }

  const selected: QuestionBankItem[] = [];
  const difficultyWeights = config.difficultyAllocation ?? { easy: 24, medium: 36, hard: 20 };
  const targetDifficultyCounts = allocateCounts(config.totalQuestions, difficultyWeights);
  const categoryDifficultyCounts = config.categoryAllocation.map((allocation) => ({
    category: allocation.category,
    questionCount: allocation.questionCount,
    counts: allocateCounts(allocation.questionCount, difficultyWeights),
  }));

  for (const difficulty of DIFFICULTIES) {
    let current = categoryDifficultyCounts.reduce((sum, plan) => sum + plan.counts[difficulty], 0);
    while (current > targetDifficultyCounts[difficulty]) {
      const deficit = DIFFICULTIES.find(
        (candidate) =>
          categoryDifficultyCounts.reduce((sum, plan) => sum + plan.counts[candidate], 0) <
          targetDifficultyCounts[candidate]
      );
      if (!deficit) break;

      const adjustable = categoryDifficultyCounts.find((plan) => {
        const categoryItems = items.filter((item) => item.category === plan.category);
        const deficitPool = categoryItems.filter((item) => item.difficulty === deficit).length;
        return plan.counts[difficulty] > 0 && plan.counts[deficit] < deficitPool;
      });

      if (!adjustable) break;
      adjustable.counts[difficulty] -= 1;
      adjustable.counts[deficit] += 1;
      current -= 1;
    }
  }

  for (const allocation of config.categoryAllocation) {
    const categoryItems = items.filter((item) => item.category === allocation.category);
    if (categoryItems.length < allocation.questionCount) {
      throw new Error(
        `${allocation.category} 영역의 active 문제가 부족합니다. 요청: ${allocation.questionCount}개, 사용 가능: ${categoryItems.length}개`
      );
    }

    const difficultyCounts =
      categoryDifficultyCounts.find((plan) => plan.category === allocation.category)?.counts ??
      allocateCounts(allocation.questionCount, difficultyWeights);
    const categorySelected: QuestionBankItem[] = [];
    const leftovers: QuestionBankItem[] = [];

    for (const difficulty of DIFFICULTIES) {
      const pool = shuffleArray(categoryItems.filter((item) => item.difficulty === difficulty));
      categorySelected.push(...pool.slice(0, difficultyCounts[difficulty]));
      leftovers.push(...pool.slice(difficultyCounts[difficulty]));
    }

    if (categorySelected.length < allocation.questionCount) {
      const pickedIds = new Set(categorySelected.map((item) => item.id));
      const filler = shuffleArray(categoryItems.filter((item) => !pickedIds.has(item.id)));
      categorySelected.push(...filler.slice(0, allocation.questionCount - categorySelected.length));
    }

    selected.push(...categorySelected.slice(0, allocation.questionCount));
    void leftovers;
  }

  return shuffleQuestions ? shuffleArray(selected) : selected;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = StartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { questionSetId, shuffleQuestions, shuffleChoices } = parsed.data;

  try {
    const questionSet = await findQuestionSetById(questionSetId);
    if (!questionSet || questionSet.status !== "active") {
      return NextResponse.json({ error: "활성화된 문제 세트를 찾을 수 없습니다." }, { status: 404 });
    }

    const bankItems = await findQuestionBankItemsByIds(questionSet.questionIds);
    const activeItems = uniqueByQuestionText(bankItems.filter((item) => item.status === "active"));

    const questionCount = parsed.data.questionCount ?? questionSet.examConfig?.totalQuestions ?? 80;

    if (activeItems.length < questionCount) {
      return NextResponse.json(
        {
          error: `저장된 active 문제가 부족합니다. 요청: ${questionCount}개, 사용 가능: ${activeItems.length}개`,
        },
        { status: 422 }
      );
    }

    let selected: QuestionBankItem[];
    try {
      selected = sampleConfiguredQuestions(activeItems, questionSet, questionCount, shuffleQuestions);
    } catch (samplingError) {
      const message = samplingError instanceof Error ? samplingError.message : "문제 샘플링에 실패했습니다.";
      return NextResponse.json({ error: message }, { status: 422 });
    }
    const choiceOrders = Object.fromEntries(
      selected.map((question) => [question.id, buildChoiceOrder(question, shuffleChoices)])
    );
    const questions = selected.map((question) =>
      toExamQuestionPublic(question, choiceOrders[question.id])
    );

    return NextResponse.json({
      questionSet: {
        id: questionSet.id,
        name: questionSet.name,
        totalQuestions: questionSet.totalQuestions,
      },
      questions,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("POST /api/exams/start failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
