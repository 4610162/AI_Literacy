"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ChoiceButton } from "@/components/quiz/ChoiceButton";
import { SourceToggle } from "@/components/quiz/SourceToggle";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { DIFFICULTY_LABELS } from "@/lib/quiz/constants";

type PracticeQuestion = {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  sourceText?: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  documentName?: string;
  page?: number;
};

function getChoiceState(
  index: number,
  selectedIndex: number | undefined,
  answerIndex: number
) {
  if (selectedIndex === undefined) return "idle";
  if (index === answerIndex) return "correct";
  if (index === selectedIndex) return "wrong";
  return "idle";
}

function PracticeClient() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPractice = useCallback(async () => {
    if (!category) {
      setError("연습할 주제를 선택해주세요.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setAnswers({});
    setCurrentIndex(0);

    try {
      const res = await fetch(`/api/practice?category=${encodeURIComponent(category)}&count=10`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "연습 문제를 불러올 수 없습니다.");
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "연습 문제 로딩 오류");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadPractice();
  }, [loadPractice]);

  const currentQuestion = questions[currentIndex];
  const selectedIndex = currentQuestion ? answers[currentQuestion.id] : undefined;
  const correctCount = useMemo(
    () =>
      questions.filter((question) => answers[question.id] === question.answerIndex).length,
    [answers, questions]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" label="연습 문제를 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={error} onRetry={loadPractice} />
        <Link href="/quiz" className="text-sm font-medium text-blue-600 hover:underline">
          첫 화면으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!currentQuestion) {
    return <ErrorAlert message="연습 문제가 없습니다." onRetry={loadPractice} />;
  }

  const answered = selectedIndex !== undefined;
  const isCorrect = selectedIndex === currentQuestion.answerIndex;

  return (
    <div className="space-y-3 pb-20 sm:space-y-6 sm:pb-0">
      <div className="sticky top-12 z-30 -mx-3 flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50/95 px-3 py-2 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <div className="min-w-0">
          <Link href="/quiz" className="text-xs font-medium text-blue-600 hover:underline">
            첫 화면
          </Link>
          <h1 className="mt-1 truncate text-base font-bold text-gray-900 sm:mt-2 sm:text-2xl">
            {category}
          </h1>
          <p className="mt-1 hidden text-sm text-gray-500 sm:block">
            한 문제씩 풀고 바로 정답과 해설을 확인합니다.
          </p>
        </div>
        <div className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 sm:px-4 sm:py-3 sm:text-sm">
          {currentIndex + 1} / {questions.length} · 정답 {correctCount}개
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-gray-500 sm:text-sm">
            문제 {currentIndex + 1}
          </span>
          {currentQuestion.difficulty && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {DIFFICULTY_LABELS[currentQuestion.difficulty]}
            </span>
          )}
        </div>

        <p className="mt-3 text-sm font-semibold leading-6 text-gray-900 sm:mt-5 sm:text-base sm:leading-relaxed">
          {currentQuestion.question}
        </p>

        <div className="mt-3 space-y-2 sm:mt-5 sm:space-y-2.5">
          {currentQuestion.choices.map((choice, index) => (
            <ChoiceButton
              key={choice}
              label={choice}
              index={index}
              state={getChoiceState(index, selectedIndex, currentQuestion.answerIndex)}
              onClick={() =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }))
              }
              disabled={answered}
            />
          ))}
        </div>

        {answered && (
          <details
            open={!isCorrect}
            className={`mt-5 rounded-xl border p-4 ${
              isCorrect
                ? "border-green-200 bg-green-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <summary className="cursor-pointer text-sm font-semibold text-gray-800">
              {isCorrect ? "정답입니다." : "오답입니다."}
              <span className="ml-2 text-xs font-medium text-gray-500">해설</span>
            </summary>
            <div className="mt-2">
              <p className="text-sm leading-relaxed text-gray-700">
                {currentQuestion.explanation}
              </p>
              {currentQuestion.sourceText && (
                <SourceToggle
                  sourceText={currentQuestion.sourceText}
                  documentName={currentQuestion.documentName ?? ""}
                  page={currentQuestion.page}
                />
              )}
            </div>
          </details>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-gray-200 bg-white/95 p-3 backdrop-blur-sm sm:static sm:gap-3 sm:border-0 sm:bg-transparent sm:p-0">
        <button
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          disabled={currentIndex === 0}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
        >
          이전
        </button>
        <button
          onClick={loadPractice}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:px-4"
        >
          섞기
        </button>
        <div className="flex-1" />
        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((index) => index + 1)}
            disabled={!answered}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
          >
            다음
          </button>
        ) : (
          <Link
            href="/quiz"
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 sm:px-6"
          >
            완료
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" label="연습 화면을 준비하는 중..." />
        </div>
      }
    >
      <PracticeClient />
    </Suspense>
  );
}
