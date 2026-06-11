import { NextRequest, NextResponse } from "next/server";
import { findQuestionSetById } from "@/lib/storage/json-store";
import { logger } from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
  }

  try {
    const questionSet = await findQuestionSetById(id);

    if (!questionSet || questionSet.status !== "active") {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({
      quizSet: {
        id: questionSet.id,
        title: questionSet.name,
        documentNames: questionSet.documentNames ?? questionSet.documentIds ?? [],
        difficulty: questionSet.difficulty ?? "mixed",
        totalQuestions: questionSet.totalQuestions,
        createdAt: questionSet.createdAt,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error(`GET /api/quiz/${id} failed`, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
