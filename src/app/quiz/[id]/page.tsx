"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import type { ExamQuestionPublic, QuestionResult, QuizResult } from "@/types";
import { QuizCard } from "@/components/quiz/QuizCard";
import { ProgressBar } from "@/components/quiz/ProgressBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { ResultSummary } from "@/components/quiz/ResultSummary";
import { alignExplanationAnswerNumber } from "@/lib/exam/session";

type QuizSetPublic = {
  id: string;
  title: string;
  totalQuestions: number;
  documentNames: string[];
  difficulty: string;
};

export default function QuizTakePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = params.id as string;
  const isMockMode = searchParams.get("mode") === "mock";

  const [quizSet, setQuizSet] = useState<QuizSetPublic | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [examStarted, setExamStarted] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestionPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(90 * 60);

  const fetchQuizSet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quiz/${quizId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "문제 세트를 불러올 수 없습니다.");
      setQuizSet(data.quizSet);
      setQuestionCount(isMockMode ? 80 : Math.min(10, data.quizSet.totalQuestions));
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, [isMockMode, quizId]);

  useEffect(() => {
    if (!examStarted || result || !isMockMode) return;

    setRemainingSeconds(90 * 60);
    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [examStarted, isMockMode, result]);

  useEffect(() => {
    fetchQuizSet();
  }, [fetchQuizSet]);

  async function handleStart() {
    if (!quizSet) return;
    setStarting(true);
    setError(null);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);

    try {
      const res = await fetch("/api/exams/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionSetId: quizSet.id,
          questionCount,
          shuffleQuestions: true,
          shuffleChoices: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "시험을 시작할 수 없습니다.");
      setQuestions(data.questions);
      setExamStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "시험 시작 오류");
    } finally {
      setStarting(false);
    }
  }

  function buildResult(title = "퀴즈 결과", onlyAnswered = false): QuizResult | null {
    setError(null);

    const targetQuestions = onlyAnswered
      ? questions.filter((question) => answers[question.id] !== undefined)
      : questions;

    if (targetQuestions.length === 0) {
      setError("먼저 한 문제 이상 풀어주세요.");
      return null;
    }

    const questionResults: QuestionResult[] = targetQuestions.map((question) => {
      const selectedIndex = answers[question.id] ?? -1;
      const isCorrect = selectedIndex === question.answerIndex;

      return {
        questionId: question.id,
        question: question.question,
        choices: question.choices,
        selectedIndex,
        correctIndex: question.answerIndex,
        isCorrect,
        explanation: alignExplanationAnswerNumber(question.explanation, question.answerIndex),
        sourceText: question.sourceText ?? "",
        documentName: question.documentName ?? "",
        page: question.page,
        difficulty: question.difficulty ?? "medium",
      };
    });

    const correctCount = questionResults.filter((question) => question.isCorrect).length;
    const score = Math.round((correctCount / questionResults.length) * 100);

    return {
      resultId: `${quizId}-${Date.now()}`,
      quizSetId: quizId,
      title,
      totalQuestions: questionResults.length,
      correctCount,
      score,
      completedAt: new Date().toISOString(),
      questionResults,
    };
  }

  function handleSubmit() {
    const finalResult = buildResult("퀴즈 결과");
    if (finalResult) setResult(finalResult);
  }

  function handleExitEarly() {
    const partialResult = buildResult("중간 종료 결과", true);
    if (partialResult) setResult(partialResult);
  }

  function resetExam() {
    setExamStarted(false);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setRemainingSeconds(90 * 60);
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timerLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" label="문제 세트를 불러오는 중..." />
      </div>
    );
  }

  if (error && questions.length === 0 && !result) {
    return <ErrorAlert message={error} onRetry={fetchQuizSet} />;
  }

  if (!quizSet) {
    return <ErrorAlert message="문제 세트가 없습니다." />;
  }

  if (result) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          {result.title ?? "퀴즈 결과"}
        </h1>
        <ResultSummary
          result={result}
          onRetryAll={resetExam}
          onRetryWrong={resetExam}
        />
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {isMockMode ? "Mock 시험" : quizSet.title}
          </h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            {isMockMode
              ? "80문항, 100점, 제한시간 90분 구성으로 진행합니다."
              : "저장된 문제은행에서 출제됩니다. 시험 시작 중에는 AI 호출이 발생하지 않습니다."}
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:space-y-5 sm:rounded-2xl sm:p-6">
          <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
            <div>
              <div className="text-xs text-gray-400">문항</div>
              <div className="font-medium text-gray-800">
                {isMockMode ? "80문항" : `${questionCount}문항`}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">배점</div>
              <div className="font-medium text-gray-800">{isMockMode ? "100점" : "자동 채점"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">시간</div>
              <div className="font-medium text-gray-800">{isMockMode ? "90분" : "제한 없음"}</div>
            </div>
          </div>

          {!isMockMode && (
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                출제 문항 수: {questionCount}개
              </span>
              <input
                type="range"
                min={1}
                max={Math.max(1, quizSet.totalQuestions)}
                value={questionCount}
                onChange={(event) => setQuestionCount(Number(event.target.value))}
                className="mt-3 w-full accent-blue-600"
              />
            </label>
          )}

          {error && <ErrorAlert message={error} onRetry={() => setError(null)} />}

          <button
            onClick={handleStart}
            disabled={starting || quizSet.totalQuestions === 0}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
          >
            {starting ? "시험 시작 중..." : isMockMode ? "80문항 Mock 시작" : "시험 시작"}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const allAnswered = questions.every((question) => answers[question.id] !== undefined);

  return (
    <div className="space-y-3 pb-20 sm:space-y-6 sm:pb-0">
      <div className="sticky top-12 z-30 -mx-3 space-y-2 border-b border-gray-200 bg-gray-50/95 px-3 py-2 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <div className="flex items-center justify-between gap-3">
          <h1 className="min-w-0 truncate text-base font-bold text-gray-900 sm:text-xl">
            {quizSet.title}
          </h1>
          {isMockMode && (
            <span className="shrink-0 rounded-full bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white">
              {timerLabel}
            </span>
          )}
        </div>
        <p className="hidden text-xs text-gray-500 sm:block">
          답을 선택하면 정답과 해설이 바로 표시됩니다.
        </p>
        <ProgressBar
          current={currentIndex + 1}
          total={questions.length}
          answeredCount={Object.keys(answers).length}
        />
      </div>

      {currentQuestion && (
        <QuizCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedIndex={answers[currentQuestion.id] ?? null}
          onSelect={(index) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }))}
          showFeedback
        />
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-gray-200 bg-white/95 p-3 backdrop-blur-sm sm:static sm:flex-wrap sm:border-0 sm:bg-transparent sm:p-0">
        {currentIndex > 0 && (
          <button
            onClick={() => setCurrentIndex((index) => index - 1)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:px-4"
          >
            이전
          </button>
        )}
        <button
          onClick={handleExitEarly}
          disabled={Object.keys(answers).length === 0}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
        >
          종료
        </button>
        <div className="flex-1" />
        {error && <p className="hidden self-center text-sm text-red-600 sm:block">{error}</p>}
        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
          >
            최종 제출
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((index) => index + 1)}
            disabled={answers[currentQuestion.id] === undefined}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
}
