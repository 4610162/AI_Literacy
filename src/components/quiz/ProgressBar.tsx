interface ProgressBarProps {
  current: number;
  total: number;
  answeredCount?: number;
}

export function ProgressBar({ current, total, answeredCount }: ProgressBarProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600 sm:text-sm">
        <span>
          {current} / {total} 문제
        </span>
        {answeredCount !== undefined && (
          <span className="text-blue-600 font-medium">답변 {answeredCount}개</span>
        )}
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200 sm:h-2">
        <div
          className="h-1.5 rounded-full bg-blue-500 transition-all duration-300 sm:h-2"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
