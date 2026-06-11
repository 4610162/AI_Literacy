import { NextResponse } from "next/server";
import { listQuestionSets } from "@/lib/storage/json-store";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const questionSets = await listQuestionSets();

    const quizzes = questionSets
      .filter((set) => set.status === "active")
      .map((set) => ({
        id: set.id,
        title: set.name,
        documentNames: set.documentNames ?? set.documentIds ?? [],
        difficulty: set.difficulty ?? "mixed",
        createdAt: set.createdAt,
        totalQuestions: set.totalQuestions,
        status: set.status,
      }));

    return NextResponse.json({ quizzes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("GET /api/quiz failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
