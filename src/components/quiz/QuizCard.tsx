"use client";

import type { QuizQuestion } from "@/types";
import { ChoiceButton } from "./ChoiceButton";
import { SourceToggle } from "./SourceToggle";
import { DIFFICULTY_LABELS } from "@/lib/quiz/constants";

interface QuizCardProps {
  question: Partial<QuizQuestion> &
    Pick<QuizQuestion, "id" | "question" | "choices"> & {
      answerIndex?: number;
      explanation?: string;
      sourceText?: string;
    };
  questionNumber: number;
  totalQuestions: number;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  showFeedback?: boolean;
}

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  onSelect,
  showFeedback = false,
}: QuizCardProps) {
  function getChoiceState(idx: number) {
    if (showFeedback && selectedIndex !== null && question.answerIndex !== undefined) {
      if (idx === question.answerIndex) return "correct";
      if (idx === selectedIndex) return "wrong";
      return "idle";
    }
    return selectedIndex === idx ? "selected" : "idle";
  }

  const answered = selectedIndex !== null;
  const isCorrect =
    answered &&
    question.answerIndex !== undefined &&
    selectedIndex === question.answerIndex;
  const feedbackId = `feedback-${question.id}`;

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:space-y-5 sm:rounded-2xl sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs text-gray-500 font-medium sm:text-sm">
          문제 {questionNumber} / {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          {question.category && (
            <span className="hidden rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 sm:inline">
              {question.category}
            </span>
          )}
          {question.difficulty && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_BADGE[question.difficulty] ?? ""}`}
            >
              {DIFFICULTY_LABELS[question.difficulty] ?? question.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-semibold leading-6 text-gray-900 sm:text-base sm:leading-relaxed">
        {question.question}
      </p>

      {/* Choices */}
      <div className="space-y-2 sm:space-y-2.5">
        {question.choices.map((choice, idx) => (
          <ChoiceButton
            key={idx}
            label={choice}
            index={idx}
            state={getChoiceState(idx)}
            onClick={() => onSelect(idx)}
            disabled={showFeedback && answered}
          />
        ))}
      </div>

      {showFeedback && answered && question.answerIndex !== undefined && (
        <details
          id={feedbackId}
          open={!isCorrect}
          className={`rounded-xl border p-3 sm:p-4 ${
            isCorrect ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
          }`}
        >
          <summary className="cursor-pointer text-sm font-semibold text-gray-800">
            {isCorrect ? "정답입니다." : "오답입니다."}
            <span className="ml-2 text-xs font-medium text-gray-500">해설</span>
          </summary>
          <div className="mt-2">
            {question.explanation && (
              <p className="text-sm leading-relaxed text-gray-700">
                {question.explanation}
              </p>
            )}
            {question.sourceText && (
              <SourceToggle
                sourceText={question.sourceText}
                documentName={question.documentName ?? ""}
                page={question.page}
              />
            )}
          </div>
        </details>
      )}
    </div>
  );
}
