interface ChoiceButtonProps {
  label: string;
  index: number;
  state: "idle" | "selected" | "correct" | "wrong" | "reveal-correct";
  onClick: () => void;
  disabled: boolean;
}

const LABELS = ["①", "②", "③", "④"];

export function ChoiceButton({
  label,
  index,
  state,
  onClick,
  disabled,
}: ChoiceButtonProps) {
  const base =
    "w-full flex items-start gap-2.5 rounded-xl border p-3 text-left text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:gap-3 sm:border-2 sm:p-4";

  const styles: Record<typeof state, string> = {
    idle: "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer",
    selected: "border-blue-400 bg-blue-50 cursor-pointer",
    correct:
      "border-green-500 bg-green-50 text-green-800 cursor-default",
    wrong: "border-red-400 bg-red-50 text-red-800 cursor-default",
    "reveal-correct":
      "border-green-400 bg-green-50 text-green-700 cursor-default",
  };

  const iconMap: Record<typeof state, string> = {
    idle: "",
    selected: "",
    correct: "✓",
    wrong: "✗",
    "reveal-correct": "✓",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[state]}`}
    >
      <span
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold sm:h-7 sm:w-7 sm:text-xs ${
          state === "idle" || state === "selected"
            ? "bg-gray-100 text-gray-600"
            : state === "correct" || state === "reveal-correct"
            ? "bg-green-200 text-green-700"
            : "bg-red-200 text-red-700"
        }`}
      >
        {iconMap[state] || LABELS[index]}
      </span>
      <span className="flex-1 leading-snug">{label}</span>
    </button>
  );
}
