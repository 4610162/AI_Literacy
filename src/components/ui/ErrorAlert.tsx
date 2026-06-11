interface ErrorAlertProps {
  message: string;
  details?: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message, details, onRetry }: ErrorAlertProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-lg mt-0.5">⚠</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">{message}</p>
          {details && (
            <p className="mt-1 text-xs text-red-600 font-mono">{details}</p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs text-red-700 underline hover:text-red-900"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
