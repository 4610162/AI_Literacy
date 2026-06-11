import type { QuizResult, QuestionResult } from "@/types";
import { SourceToggle } from "./SourceToggle";

interface ResultSummaryProps {
  result: QuizResult;
  onRetryAll: () => void;
  onRetryWrong: () => void;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-600"
      : score >= 60
      ? "text-yellow-600"
      : "text-red-600";

  const bgColor =
    score >= 80
      ? "bg-green-50 border-green-200"
      : score >= 60
      ? "bg-yellow-50 border-yellow-200"
      : "bg-red-50 border-red-200";

  return (
    <div className={`rounded-xl border p-4 text-center sm:rounded-2xl sm:p-8 ${bgColor}`}>
      <div className={`text-4xl font-black sm:text-6xl ${color}`}>{score}%</div>
      <div className="mt-1 text-xs text-gray-600 sm:text-sm">
        {score >= 80 ? "훌륭해요!" : score >= 60 ? "잘했어요!" : "더 공부해봐요"}
      </div>
    </div>
  );
}

function QuestionResultItem({ qr }: { qr: QuestionResult }) {
  return (
    <div
      className={`rounded-xl border p-3 sm:p-4 ${
        qr.isCorrect
          ? "border-green-200 bg-green-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <div className="mb-2 flex items-start gap-2">
        <span className={`mt-0.5 text-base sm:text-lg ${qr.isCorrect ? "text-green-500" : "text-red-500"}`}>
          {qr.isCorrect ? "✓" : "✗"}
        </span>
        <p className="text-sm font-medium text-gray-800 leading-snug">{qr.question}</p>
      </div>

      {!qr.isCorrect && (
        <div className="ml-6 space-y-1 text-xs text-gray-600 sm:ml-7">
          <div>
            <span className="text-red-600 font-medium">내 답: </span>
            {qr.selectedIndex >= 0
              ? qr.choices[qr.selectedIndex]
              : "(미선택)"}
          </div>
          <div>
            <span className="text-green-600 font-medium">정답: </span>
            {qr.choices[qr.correctIndex]}
          </div>
          <p className="mt-2 text-gray-600 leading-relaxed">{qr.explanation}</p>
          <SourceToggle
            sourceText={qr.sourceText}
            documentName={qr.documentName}
            page={qr.page}
          />
        </div>
      )}
    </div>
  );
}

export function ResultSummary({ result, onRetryAll, onRetryWrong }: ResultSummaryProps) {
  const wrongQuestions = result.questionResults.filter((r) => !r.isCorrect);

  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
      <ScoreBadge score={result.score} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: "총 문제", value: result.totalQuestions, color: "text-gray-700" },
          { label: "정답", value: result.correctCount, color: "text-green-600" },
          {
            label: "오답",
            value: result.totalQuestions - result.correctCount,
            color: "text-red-600",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-3 text-center sm:p-4">
            <div className={`text-xl font-bold sm:text-2xl ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          onClick={onRetryAll}
          className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:py-3"
        >
          다시 풀기
        </button>
        {wrongQuestions.length > 0 && (
          <button
            onClick={onRetryWrong}
            className="flex-1 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 sm:py-3"
          >
            오답만 다시 풀기 ({wrongQuestions.length}개)
          </button>
        )}
      </div>

      {/* Question breakdown */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-700 sm:mb-3">
          문제별 결과
        </h2>
        <div className="space-y-2 sm:space-y-3">
          {result.questionResults.map((qr) => (
            <QuestionResultItem key={qr.questionId} qr={qr} />
          ))}
        </div>
      </div>
    </div>
  );
}
