import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

const MOCK_SET_ID = "kbi-ai-literacy-80-balanced";

const TOPICS = [
  {
    title: "AI 개념 및 주요 AI 기술의 이해",
    count: 20,
  },
  {
    title: "금융 데이터의 이해",
    count: 12,
  },
  {
    title: "금융 AI의 이해와 활용",
    count: 20,
  },
  {
    title: "AI 윤리 및 관련 법률",
    count: 16,
  },
  {
    title: "금융 AI 보안, 리스크 관리 및 거버넌스",
    count: 12,
  },
];

async function hasMockSet(): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/quiz`, { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    return (data.quizzes ?? []).some((quiz: { id: string }) => quiz.id === MOCK_SET_ID);
  } catch {
    return false;
  }
}

export default async function QuizListPage() {
  const ready = await hasMockSet();

  if (!ready) {
    return (
      <EmptyState
        icon="📝"
        title="Mock 시험 세트가 없습니다"
        description="먼저 문제은행 seed를 생성하세요."
        action={
          <div className="mt-2 rounded-lg bg-gray-100 p-3 text-left text-xs text-gray-600 font-mono">
            npm run seed:question-bank
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-600 sm:text-sm">KBI AI Literacy</p>
            <h1 className="mt-1 text-2xl font-bold tracking-normal text-gray-950 sm:mt-2 sm:text-3xl">
              Mock 시험
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-5 text-gray-600 sm:mt-2 sm:text-sm sm:leading-6">
              실제 시험처럼 80문항을 풀고 제출 후 전체 점수, 정답, 해설을 확인합니다.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-80">
            {[
              ["문항", "80"],
              ["배점", "100점"],
              ["시간", "90분"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center sm:rounded-xl sm:p-3">
                <div className="text-xs text-gray-500">{label}</div>
                <div className="mt-0.5 text-base font-bold text-gray-900 sm:mt-1 sm:text-lg">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
          <Link
            href={`/quiz/${MOCK_SET_ID}?mode=mock`}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700 sm:py-3"
          >
            Mock 시험 시작
          </Link>
          <span className="hidden text-xs text-gray-500 sm:inline">
            영역별 배점 비율과 난이도 분포에 맞춰 저장된 문제은행에서 랜덤 출제됩니다.
          </span>
        </div>
      </section>

      <section className="space-y-3 sm:space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">주제별 연습</h2>
          <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">
            주제를 하나 선택해서 10문항씩 풀고, 선택 즉시 정답과 해설을 확인하세요.
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-2 md:gap-3">
          {TOPICS.map((topic) => (
            <Link
              key={topic.title}
              href={`/practice?category=${encodeURIComponent(topic.title)}`}
              className="group rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-blue-300 hover:shadow-md sm:rounded-2xl sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold leading-5 text-gray-900 group-hover:text-blue-700 sm:leading-6">
                  {topic.title}
                </h3>
                <span className="shrink-0 text-xs font-medium text-gray-700">시작</span>
              </div>
              <div className="mt-2 hidden items-center justify-between text-xs text-gray-500 sm:flex">
                <span>Mock 기준 {topic.count}문항 출제</span>
                <span className="font-medium text-gray-700">연습 시작</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
