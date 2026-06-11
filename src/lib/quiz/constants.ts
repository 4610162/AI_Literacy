import type { Difficulty, DifficultyOrMixed, QuizCategory } from "@/types";

export const DIFFICULTIES = ["easy", "medium", "hard"] as const satisfies readonly Difficulty[];
export const DIFFICULTIES_WITH_MIXED = [
  ...DIFFICULTIES,
  "mixed",
] as const satisfies readonly DifficultyOrMixed[];

export const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "쉬움", description: "기본 개념 암기형" },
  { value: "medium", label: "보통", description: "개념 이해형" },
  { value: "hard", label: "어려움", description: "심화 적용형" },
  { value: "mixed", label: "혼합", description: "다양한 난이도" },
] as const satisfies readonly {
  value: DifficultyOrMixed;
  label: string;
  description: string;
}[];

export const DIFFICULTY_LABELS = Object.fromEntries(
  DIFFICULTY_OPTIONS.map((option) => [option.value, option.label])
) as Record<DifficultyOrMixed, string>;

export const QUIZ_CATEGORIES = [
  "AI 기초 이해",
  "AI 개념 및 주요 AI 기술의 이해",
  "금융 데이터의 이해",
  "금융 AI 활용",
  "금융 AI의 이해와 활용",
  "금융 AI 윤리",
  "AI 윤리 및 관련 법률",
  "금융 AI 규제",
  "AI 리스크관리",
  "금융 AI 보안, 리스크 관리 및 거버넌스",
  "AI 거버넌스",
] as const satisfies readonly QuizCategory[];

export const PRACTICE_CATEGORIES = [
  "AI 개념 및 주요 AI 기술의 이해",
  "금융 데이터의 이해",
  "금융 AI의 이해와 활용",
  "AI 윤리 및 관련 법률",
  "금융 AI 보안, 리스크 관리 및 거버넌스",
] as const satisfies readonly QuizCategory[];

export const DEFAULT_CATEGORY: QuizCategory = "AI 기초 이해";

export const CATEGORY_DESCRIPTIONS = {
  "AI 기초 이해": "AI/ML 기본 개념, 알고리즘, 모델 유형, 학습 방법",
  "AI 개념 및 주요 AI 기술의 이해": "AI 주요 기술, 생성형 AI, 모델 학습과 평가",
  "금융 데이터의 이해": "금융 데이터 유형, 품질, 처리, 분석 기반",
  "금융 AI 활용": "금융 서비스에서의 AI 적용 사례 및 활용 방법",
  "금융 AI의 이해와 활용": "금융 AI 개념, 활용 영역, 업무 적용 사례",
  "금융 AI 윤리": "AI 편향, 공정성, 설명가능성, 투명성, 책임성",
  "AI 윤리 및 관련 법률": "AI 윤리 원칙, 개인정보, 저작권, 관련 법률",
  "금융 AI 규제": "금융 AI 관련 법규, 감독 체계, 컴플라이언스",
  "AI 리스크관리": "AI 모델 리스크, 운영 리스크, 데이터 리스크, 보안 리스크",
  "금융 AI 보안, 리스크 관리 및 거버넌스": "금융권 AI 보안, 리스크 관리, 거버넌스 체계",
  "AI 거버넌스": "AI 조직 체계, 정책, 내부통제, 감사",
} as const satisfies Record<QuizCategory, string>;
