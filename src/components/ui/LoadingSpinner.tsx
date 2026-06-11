interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`animate-spin rounded-full border-gray-200 border-t-blue-600 ${sizeClasses[size]}`}
        role="status"
        aria-label={label ?? "로딩 중"}
      />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}
