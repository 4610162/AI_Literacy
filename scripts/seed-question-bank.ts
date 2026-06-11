import fs from "fs";
import path from "path";
import crypto from "crypto";

type Difficulty = "easy" | "medium" | "hard";
type Status = "active" | "needs_review" | "archived";

type Category =
  | "AI 개념 및 주요 AI 기술의 이해"
  | "금융 데이터의 이해"
  | "금융 AI의 이해와 활용"
  | "AI 윤리 및 관련 법률"
  | "금융 AI 보안, 리스크 관리 및 거버넌스";

type QuestionBankItem = {
  id: string;
  documentId?: string;
  documentName?: string;
  documentHash?: string;
  chunkHash?: string;
  page?: number;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  sourceText?: string;
  category?: Category;
  difficulty?: Difficulty;
  status: Status;
  usageCount: number;
  correctCount: number;
  incorrectCount: number;
  qualityScore?: number;
  createdAt: string;
  updatedAt: string;
};

type Topic = {
  label: string;
  correct: string;
  distractors: string[];
  source: string;
  hardNote?: string;
};

type ChoiceOption = {
  label: string;
  text: string;
};

const ROOT = path.join(__dirname, "..");
const BANK_DIR = path.join(ROOT, "data", "question-bank");
const SET_DIR = path.join(ROOT, "data", "question-sets");
const NOW = "2026-06-11T00:00:00.000Z";
const DOCUMENT_ID = "kbi-ai-literacy-seed";
const DOCUMENT_NAME = "KBI AI Literacy Seed Bank";

const CATEGORY_PLAN: Array<{
  category: Category;
  score: number;
  examCount: number;
  bankCount: number;
  topics: Topic[];
}> = [
  {
    category: "AI 개념 및 주요 AI 기술의 이해",
    score: 25,
    examCount: 20,
    bankCount: 50,
    topics: [
      {
        label: "지도학습",
        correct: "정답이 포함된 학습 데이터로 입력과 출력의 관계를 학습해 새로운 사례를 예측하는 방식이다.",
        distractors: [
          "정답 없이 데이터의 군집 구조만 찾는 방식이다.",
          "환경과 보상을 통해 행동 정책만 학습하는 방식이다.",
          "규칙 기반 전문가 시스템만을 의미한다.",
        ],
        source: "지도학습은 라벨이 있는 데이터로 분류나 회귀 모델을 학습하는 대표적인 머신러닝 방식이다.",
      },
      {
        label: "비지도학습",
        correct: "정답 라벨 없이 데이터의 숨은 구조, 군집, 패턴을 탐색하는 학습 방식이다.",
        distractors: [
          "사전에 정답이 표시된 데이터만 사용할 수 있다.",
          "모든 결과가 반드시 확률 점수로만 출력된다.",
          "학습 목표가 보상 최대화로 고정된다.",
        ],
        source: "비지도학습은 라벨이 없는 데이터에서 군집, 차원 축소, 이상 패턴 등을 찾는 데 활용된다.",
      },
      {
        label: "강화학습",
        correct: "에이전트가 환경과 상호작용하며 보상을 최대화하는 행동 정책을 학습하는 방식이다.",
        distractors: [
          "정답 라벨만 비교해 손실을 줄이는 방식이다.",
          "데이터를 압축하는 전처리 절차만 의미한다.",
          "텍스트를 토큰으로 나누는 규칙이다.",
        ],
        source: "강화학습은 상태, 행동, 보상, 정책을 기반으로 순차적 의사결정 문제를 해결한다.",
      },
      {
        label: "딥러닝",
        correct: "여러 층의 신경망을 이용해 데이터의 복잡한 표현을 자동으로 학습하는 기술이다.",
        distractors: [
          "단순 평균과 표준편차만 계산하는 통계 절차이다.",
          "반드시 사람이 직접 규칙을 모두 작성해야 한다.",
          "데이터 저장소를 암호화하는 보안 기술이다.",
        ],
        source: "딥러닝은 다층 신경망을 통해 이미지, 음성, 자연어 등 비정형 데이터의 표현을 학습한다.",
      },
      {
        label: "CNN",
        correct: "합성곱 필터로 공간적 특징을 추출해 이미지와 영상 분석에 강점을 갖는 신경망 구조이다.",
        distractors: [
          "문장의 순서를 모두 제거해 단어 빈도만 계산한다.",
          "보상 함수 없이도 행동 정책만 최적화한다.",
          "데이터베이스 트랜잭션을 검증하는 알고리즘이다.",
        ],
        source: "CNN은 합성곱과 풀링을 통해 이미지의 지역적 패턴과 공간 정보를 효과적으로 추출한다.",
      },
      {
        label: "RNN과 LSTM",
        correct: "순차 데이터의 이전 정보를 반영하며 LSTM은 장기 의존성 문제를 완화하도록 설계되었다.",
        distractors: [
          "이미지의 픽셀 위치만 분석하며 순서를 고려하지 않는다.",
          "모든 입력을 독립 표본으로만 처리한다.",
          "법률 준수 여부를 자동으로 보증하는 제도이다.",
        ],
        source: "RNN은 순차 정보를 처리하고 LSTM은 게이트 구조로 장기 의존성 문제를 개선한다.",
      },
      {
        label: "트랜스포머",
        correct: "셀프 어텐션을 이용해 입력 요소 간 관계를 병렬적으로 학습하는 모델 구조이다.",
        distractors: [
          "오직 이미지 압축에만 사용되는 손실 함수이다.",
          "정답 라벨 없이 군집 수만 자동 결정하는 방식이다.",
          "금융회사 내부통제 문서의 이름이다.",
        ],
        source: "트랜스포머는 셀프 어텐션으로 토큰 간 관계를 모델링하며 대규모 언어모델의 핵심 구조이다.",
      },
      {
        label: "LLM의 토큰화",
        correct: "입력 텍스트를 단어, 부분 단어, 기호 등 모델이 처리할 수 있는 토큰 단위로 나누는 과정이다.",
        distractors: [
          "모델이 생성한 답변을 사람이 승인하는 절차이다.",
          "개인정보를 법적으로 파기하는 행위이다.",
          "대출 포트폴리오 위험을 헤지하는 방식이다.",
        ],
        source: "토큰화는 텍스트를 모델 입력 단위로 분해하는 LLM 처리 과정의 출발점이다.",
      },
      {
        label: "생성형 AI",
        correct: "학습한 패턴을 바탕으로 텍스트, 이미지, 코드 등 새로운 콘텐츠를 생성하는 AI이다.",
        distractors: [
          "오직 표 형식 데이터의 평균만 계산한다.",
          "입력 데이터의 저장 위치를 백업하는 도구이다.",
          "학습 없이 사람이 쓴 규칙만 실행한다.",
        ],
        source: "생성형 AI는 대규모 데이터에서 학습한 확률적 패턴을 바탕으로 새로운 산출물을 만든다.",
      },
      {
        label: "과적합",
        correct: "모델이 학습 데이터에 지나치게 맞춰져 새로운 데이터에서 성능이 떨어지는 현상이다.",
        distractors: [
          "학습 데이터가 전혀 없어 모델을 만들 수 없는 상태이다.",
          "모델 설명가능성이 항상 높아지는 현상이다.",
          "암호키가 만료되어 인증이 실패하는 현상이다.",
        ],
        source: "과적합은 학습 데이터 성능은 높지만 일반화 성능이 낮아지는 대표적인 모델 위험이다.",
      },
    ],
  },
  {
    category: "금융 데이터의 이해",
    score: 15,
    examCount: 12,
    bankCount: 30,
    topics: [
      {
        label: "정형 데이터",
        correct: "테이블 형태로 구조화되어 거래금액, 잔액, 금리처럼 행과 열로 관리하기 쉬운 데이터이다.",
        distractors: [
          "영상, 음성처럼 고정된 열 구조가 없는 데이터만 의미한다.",
          "항상 외부 SNS에서만 수집되는 데이터이다.",
          "라벨이 없는 데이터만 정형 데이터라고 부른다.",
        ],
        source: "금융권의 거래내역, 계좌정보, 신용정보는 대표적인 정형 데이터로 분석과 모델링에 자주 활용된다.",
      },
      {
        label: "비정형 데이터",
        correct: "텍스트, 이미지, 음성처럼 고정된 행과 열 구조로 표현하기 어려운 데이터이다.",
        distractors: [
          "반드시 숫자형 변수만 포함하는 데이터이다.",
          "법적으로 활용이 항상 금지된 데이터이다.",
          "중복값이 제거된 데이터만 의미한다.",
        ],
        source: "상담 녹취, 민원 텍스트, 약관 문서, 이미지 등은 비정형 금융 데이터에 해당한다.",
      },
      {
        label: "대체 데이터",
        correct: "전통적 금융거래 데이터 외에 온라인 행동, 위치, 소비 패턴 등 신용평가나 투자분석에 보완적으로 쓰이는 데이터이다.",
        distractors: [
          "회계 기준상 반드시 폐기해야 하는 데이터이다.",
          "동일 데이터를 다른 파일명으로 복사한 것이다.",
          "정답 라벨만 모아둔 검증 데이터이다.",
        ],
        source: "대체 데이터는 전통 데이터로 설명하기 어려운 고객 행동과 시장 변화를 보완적으로 파악하는 데 쓰인다.",
      },
      {
        label: "데이터 품질",
        correct: "정확성, 완전성, 일관성, 최신성 등이 확보되어 분석 목적에 적합한지를 판단하는 기준이다.",
        distractors: [
          "데이터 파일의 색상과 아이콘을 통일하는 기준이다.",
          "모델이 반드시 높은 수익률을 내도록 보장하는 조건이다.",
          "학습률을 자동으로 낮추는 최적화 기법이다.",
        ],
        source: "금융 AI 모델은 데이터 품질에 민감하므로 정확성, 완전성, 일관성 검토가 중요하다.",
      },
      {
        label: "결측치 처리",
        correct: "누락된 값을 제거, 대체, 별도 범주화하는 등 분석 목적에 맞게 처리하는 과정이다.",
        distractors: [
          "모든 이상거래를 정상거래로 바꾸는 절차이다.",
          "정답 라벨을 무작위로 섞는 보안 조치이다.",
          "모델 결과를 사용자에게 설명하지 않는 방식이다.",
        ],
        source: "결측치는 제거나 대체 방식에 따라 모델 편향과 성능에 영향을 줄 수 있다.",
      },
      {
        label: "데이터 표준화와 정규화",
        correct: "변수의 스케일 차이를 줄여 모델 학습과 비교가 안정적으로 이뤄지도록 조정하는 전처리이다.",
        distractors: [
          "개인정보 수집 동의를 생략하는 절차이다.",
          "모든 범주형 변수를 삭제하는 조치이다.",
          "학습 데이터의 정답을 암호화해 제거하는 기술이다.",
        ],
        source: "표준화와 정규화는 변수 간 단위 차이가 큰 금융 데이터에서 모델 학습 안정성을 높인다.",
      },
    ],
  },
  {
    category: "금융 AI의 이해와 활용",
    score: 25,
    examCount: 20,
    bankCount: 50,
    topics: [
      {
        label: "신용평가 AI",
        correct: "고객의 상환 가능성과 부도 위험을 예측해 대출 심사와 한도 산정에 활용된다.",
        distractors: [
          "고객 동의 없이 민감정보를 무제한 수집하는 기술이다.",
          "주가를 항상 정확히 맞히는 보장형 알고리즘이다.",
          "은행 내부망 접근권한을 자동 부여하는 절차이다.",
        ],
        source: "신용평가 AI는 금융거래, 소득, 상환이력 등 다양한 데이터를 활용해 신용위험을 예측한다.",
      },
      {
        label: "이상거래탐지",
        correct: "거래 패턴에서 평소와 다른 행위를 찾아 금융사기나 부정거래 가능성을 탐지한다.",
        distractors: [
          "정상거래를 모두 삭제해 저장공간을 줄이는 기능이다.",
          "고객 상담 문구를 자동 번역하는 업무만 의미한다.",
          "모든 거래를 승인하도록 규칙을 완화하는 절차이다.",
        ],
        source: "이상거래탐지는 계좌이체, 카드결제 등에서 비정상 패턴을 조기에 발견하는 금융 AI 활용 분야이다.",
      },
      {
        label: "로보어드바이저",
        correct: "고객 성향과 시장 데이터를 분석해 포트폴리오 추천과 자산배분을 자동화한다.",
        distractors: [
          "고객의 인증 비밀번호를 대신 보관하는 장치이다.",
          "모든 투자손실을 법적으로 보전하는 제도이다.",
          "금융회사 임직원 평가만 자동화하는 시스템이다.",
        ],
        source: "로보어드바이저는 알고리즘 기반으로 투자자 성향에 맞는 자산배분과 리밸런싱을 지원한다.",
      },
      {
        label: "챗봇과 상담 자동화",
        correct: "자연어 처리 기술로 고객 문의를 이해하고 답변하거나 상담원을 보조하는 서비스이다.",
        distractors: [
          "모든 금융상품 가입을 강제로 승인하는 시스템이다.",
          "이미지의 픽셀만 분류하는 모델이다.",
          "회계 장부를 물리적으로 보관하는 장치이다.",
        ],
        source: "금융 챗봇은 자연어 이해와 검색, 생성 기술을 이용해 고객 응대 효율을 높인다.",
      },
      {
        label: "AI 기반 여신 심사",
        correct: "신청자의 재무정보와 거래행태를 분석해 심사 속도와 위험 평가의 정교함을 높인다.",
        distractors: [
          "심사 근거를 모두 삭제해 설명 책임을 없애는 방식이다.",
          "고객의 연령만으로 대출 가능 여부를 결정한다.",
          "모든 신청을 동일 조건으로 무조건 승인한다.",
        ],
        source: "AI 여신 심사는 자동화의 효율성과 함께 설명가능성, 차별 방지, 내부통제 검토가 필요하다.",
      },
      {
        label: "투자전략 AI",
        correct: "시장 데이터와 뉴스, 지표를 분석해 자산 가격 변동 가능성과 매매 신호를 탐색한다.",
        distractors: [
          "투자성과를 항상 확정적으로 보장한다.",
          "고객정보 보호 의무를 면제한다.",
          "거래소 운영규정을 자동 폐지한다.",
        ],
        source: "투자전략 AI는 시계열 데이터, 뉴스, 거시지표를 활용하지만 불확실성과 모델 위험 관리가 필수이다.",
      },
      {
        label: "보험 언더라이팅 AI",
        correct: "가입자의 위험 요인을 분석해 보험 인수 여부와 보험료 산정 보조에 활용된다.",
        distractors: [
          "보험금 지급 심사를 무조건 생략하는 절차이다.",
          "보험약관을 법률 검토 없이 자동 변경한다.",
          "고객 민원을 임의로 삭제하는 시스템이다.",
        ],
        source: "보험 분야 AI는 언더라이팅, 보험금 심사, 사고 탐지 등에서 위험 평가를 지원한다.",
      },
      {
        label: "자금세탁방지 AI",
        correct: "거래 네트워크와 패턴을 분석해 의심거래 후보를 탐지하고 AML 업무를 지원한다.",
        distractors: [
          "고객확인의무를 없애는 자동화 도구이다.",
          "모든 고액거래를 정상으로 처리하는 규칙이다.",
          "투자 포트폴리오 수익률만 계산하는 모델이다.",
        ],
        source: "AML AI는 의심거래 탐지, 고객 위험등급 평가, 네트워크 분석에 활용될 수 있다.",
      },
      {
        label: "문서 심사 자동화",
        correct: "OCR과 자연어 처리로 서류 내용을 추출하고 누락, 불일치, 위험 문구를 검토한다.",
        distractors: [
          "서류 원본을 임의로 폐기하는 절차이다.",
          "고객 동의 없이 모든 문서를 외부에 공개한다.",
          "정답 라벨 없이 투자 수익을 보장한다.",
        ],
        source: "문서 심사 자동화는 OCR, NLP, 규칙 검증을 결합해 금융 서류 처리 효율을 높인다.",
      },
      {
        label: "개인화 금융 추천",
        correct: "고객의 목적, 거래패턴, 위험성향을 분석해 적합한 상품이나 서비스를 추천한다.",
        distractors: [
          "모든 고객에게 동일 고위험 상품만 권유한다.",
          "적합성 원칙과 설명의무를 배제하는 절차이다.",
          "고객의 보안 인증을 우회하는 기술이다.",
        ],
        source: "개인화 추천은 고객 이해를 높이지만 적합성, 과잉권유 방지, 개인정보 보호가 함께 요구된다.",
      },
    ],
  },
  {
    category: "AI 윤리 및 관련 법률",
    score: 20,
    examCount: 16,
    bankCount: 40,
    topics: [
      {
        label: "공정성",
        correct: "AI 판단이 특정 집단에 불합리하게 불리한 결과를 만들지 않도록 관리하는 원칙이다.",
        distractors: [
          "모든 고객에게 같은 금리만 적용해야 한다는 뜻이다.",
          "모델 성능 평가를 생략해도 된다는 원칙이다.",
          "개인정보 수집 목적을 숨기는 절차이다.",
        ],
        source: "AI 공정성은 차별적 결과를 예방하고 취약집단에 대한 불합리한 불이익을 줄이는 핵심 윤리 원칙이다.",
      },
      {
        label: "설명가능성",
        correct: "AI의 주요 판단 근거를 사용자, 내부통제, 감독 목적에 맞게 이해 가능하게 제시하는 특성이다.",
        distractors: [
          "모델 코드를 모두 외부에 공개해야 한다는 의미만 있다.",
          "모델 성능이 낮아도 항상 허용된다는 뜻이다.",
          "정답 데이터를 삭제하는 전처리 방식이다.",
        ],
        source: "설명가능성은 금융 AI의 책임성, 소비자 보호, 내부 검증을 위해 중요하다.",
      },
      {
        label: "책임성",
        correct: "AI 시스템의 설계, 운영, 결과에 대해 역할과 책임 주체를 명확히 하는 원칙이다.",
        distractors: [
          "AI가 내린 결정은 누구도 책임지지 않는다는 원칙이다.",
          "외부 위탁 시 내부 책임이 모두 사라진다는 의미이다.",
          "데이터를 무기한 보관해야 한다는 규칙이다.",
        ],
        source: "책임성은 AI 생애주기 전반에서 담당자, 승인권자, 검증 절차를 명확히 하는 데서 출발한다.",
      },
      {
        label: "개인정보 보호",
        correct: "개인정보 처리 목적, 최소 수집, 안전성 확보, 정보주체 권리를 준수하며 데이터를 활용해야 한다.",
        distractors: [
          "AI 학습 목적이면 모든 개인정보를 동의 없이 사용할 수 있다.",
          "가명처리 후에는 재식별 위험을 검토할 필요가 없다.",
          "보관 기간 제한은 금융 AI에 적용되지 않는다.",
        ],
        source: "금융 AI는 개인정보와 신용정보를 다루므로 목적 제한, 최소 수집, 안전성 확보 조치가 중요하다.",
      },
      {
        label: "가명정보",
        correct: "추가 정보 없이는 특정 개인을 알아볼 수 없도록 처리한 정보로, 재식별 위험 관리가 필요하다.",
        distractors: [
          "개인을 직접 식별할 수 있는 원본 주민등록번호이다.",
          "한 번 처리하면 어떤 목적으로든 무제한 활용 가능하다.",
          "암호화하지 않은 공개 게시글만 의미한다.",
        ],
        source: "가명정보는 활용 가능성을 높이지만 결합, 접근권한, 재식별 위험 통제가 필요하다.",
      },
      {
        label: "알고리즘 차별",
        correct: "학습 데이터나 설계 편향으로 특정 집단에 체계적으로 불리한 판단이 발생하는 문제이다.",
        distractors: [
          "모델 정확도가 높아지면 항상 자동으로 사라진다.",
          "훈련 데이터를 늘리면 법적 검토가 필요 없다.",
          "오직 하드웨어 고장 때문에 발생한다.",
        ],
        source: "알고리즘 차별은 데이터 편향, 대리변수, 평가 기준의 부적절성 등에서 발생할 수 있다.",
      },
      {
        label: "AI 투명성",
        correct: "AI 사용 여부, 주요 기능, 한계와 위험을 이해관계자가 알 수 있도록 공개하고 관리하는 원칙이다.",
        distractors: [
          "모델의 모든 영업비밀을 무조건 공개하는 것만 뜻한다.",
          "소비자 고지를 생략해도 된다는 원칙이다.",
          "모델을 학습하지 않고 수기로만 처리한다는 뜻이다.",
        ],
        source: "투명성은 AI 활용 사실과 영향, 한계, 문의·이의제기 경로를 적절히 알리는 것을 포함한다.",
      },
      {
        label: "인간의 감독",
        correct: "중요한 금융 판단에서 사람이 AI 결과를 검토하고 개입할 수 있는 절차를 두는 원칙이다.",
        distractors: [
          "AI 결과는 사람이 절대 수정할 수 없게 하는 원칙이다.",
          "모든 업무에서 AI 사용을 금지한다는 뜻이다.",
          "데이터베이스 백업만 사람이 수행하는 절차이다.",
        ],
        source: "고위험 AI 활용에는 인간의 검토, 승인, 예외 처리 등 적절한 감독 체계가 요구된다.",
      },
    ],
  },
  {
    category: "금융 AI 보안, 리스크 관리 및 거버넌스",
    score: 15,
    examCount: 12,
    bankCount: 30,
    topics: [
      {
        label: "모델 리스크 관리",
        correct: "모델 개발, 검증, 승인, 운영, 변경, 폐기 전 과정의 위험을 식별하고 통제하는 체계이다.",
        distractors: [
          "모델 성능이 높으면 검증을 생략하는 절차이다.",
          "운영 중인 모델의 변경 이력을 삭제하는 방식이다.",
          "고객 인증을 우회해 속도를 높이는 기술이다.",
        ],
        source: "금융 AI 모델은 개발부터 운영까지 검증, 모니터링, 변경관리 등 모델 리스크 관리가 필요하다.",
      },
      {
        label: "데이터 드리프트",
        correct: "운영 환경의 입력 데이터 분포가 학습 시점과 달라져 모델 성능 저하가 발생할 수 있는 현상이다.",
        distractors: [
          "모델 설명자료를 최신화하는 문서 관리 절차이다.",
          "암호키가 주기적으로 교체되는 보안 정책이다.",
          "모든 데이터가 자동으로 고품질이 되는 현상이다.",
        ],
        source: "데이터 드리프트는 시장, 고객, 제도 변화로 발생할 수 있으며 운영 모니터링의 핵심 대상이다.",
      },
      {
        label: "적대적 공격",
        correct: "입력값을 교묘히 조작해 AI 모델이 오판하도록 유도하는 공격이다.",
        distractors: [
          "정상적인 모델 재학습을 의미한다.",
          "운영 로그를 장기 보관하는 정책이다.",
          "모델 정확도를 설명하는 통계 지표이다.",
        ],
        source: "적대적 공격은 모델 입력을 조작해 잘못된 예측을 유도할 수 있으므로 보안 통제가 필요하다.",
      },
      {
        label: "프롬프트 인젝션",
        correct: "생성형 AI에 악의적 지시를 삽입해 정책 우회, 정보 유출, 잘못된 행동을 유도하는 공격이다.",
        distractors: [
          "PDF 문서를 표준 포맷으로 변환하는 절차이다.",
          "모델의 하이퍼파라미터를 정기 점검하는 활동이다.",
          "정상적인 고객 인증 방식만 의미한다.",
        ],
        source: "프롬프트 인젝션은 LLM 기반 서비스에서 시스템 지시를 무력화하거나 민감정보 노출을 유도할 수 있다.",
      },
      {
        label: "접근통제",
        correct: "데이터와 모델, 운영도구에 대한 권한을 역할에 따라 제한하고 기록하는 보안 통제이다.",
        distractors: [
          "모든 직원에게 동일한 최고 권한을 부여하는 원칙이다.",
          "모델 성능지표를 숨기는 보고 방식이다.",
          "고객 민원을 자동 삭제하는 기능이다.",
        ],
        source: "접근통제는 최소권한, 인증, 권한 검토, 로그 기록을 통해 금융 AI 자산을 보호한다.",
      },
      {
        label: "AI 거버넌스",
        correct: "AI 전략, 정책, 역할, 승인, 모니터링, 감사 체계를 조직적으로 운영하는 관리 구조이다.",
        distractors: [
          "모델 개발자가 모든 결정을 단독으로 내리는 방식이다.",
          "AI 프로젝트의 문서화를 금지하는 원칙이다.",
          "데이터 품질 검토를 운영 후에만 수행하는 절차이다.",
        ],
        source: "AI 거버넌스는 책임 있는 AI 활용을 위해 정책, 역할, 위원회, 검증, 감사 체계를 포함한다.",
      },
    ],
  },
];

function objectParticle(text: string): string {
  const lastChar = text.charCodeAt(text.length - 1);
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return "를";
  return (lastChar - 0xac00) % 28 === 0 ? "를" : "을";
}

const STEMS = [
  (topic: Topic) => `다음 중 '${topic.label}'에 대한 설명으로 가장 적절한 것은?`,
  (topic: Topic) => `금융 AI 리터러시 관점에서 '${topic.label}'${objectParticle(topic.label)} 바르게 이해한 것은?`,
  (topic: Topic) => `금융회사에서 '${topic.label}'${objectParticle(topic.label)} 다른 개념과 구분할 때 핵심 기준은?`,
  (topic: Topic) => `다음 설명 중 '${topic.label}'의 핵심 취지와 가장 가까운 것은?`,
  (topic: Topic) => `'${topic.label}'에 대한 오해를 피하기 위해 알아야 할 내용으로 옳은 것은?`,
];

const HARD_SUFFIX = "특히 금융권에서는 성능뿐 아니라 소비자 보호, 내부통제, 사후 모니터링과 함께 검토해야 한다.";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function hashText(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function buildEvidenceText(topic: Topic): string {
  return `${topic.source} ${topic.correct}`;
}

function difficultyPlan(total: number): Difficulty[] {
  const easy = Math.round(total * 0.3);
  const hard = Math.round(total * 0.25);
  const medium = total - easy - hard;
  return [
    ...Array(easy).fill("easy"),
    ...Array(medium).fill("medium"),
    ...Array(hard).fill("hard"),
  ] as Difficulty[];
}

function selectDistractors(
  categoryTopics: Topic[],
  topic: Topic,
  itemIndex: number
): ChoiceOption[] {
  const otherTopics = categoryTopics.filter((candidate) => candidate.label !== topic.label);
  const pool = otherTopics.map((candidate) => ({
    label: candidate.label,
    text: candidate.correct,
  }));

  return Array.from({ length: 3 }, (_, offset) => pool[(itemIndex + offset) % pool.length]);
}

function buildChoices(
  topic: Topic,
  categoryTopics: Topic[],
  itemIndex: number,
  answerIndex: number
): ChoiceOption[] {
  const choices = selectDistractors(categoryTopics, topic, itemIndex);
  choices.splice(answerIndex, 0, { label: topic.label, text: topic.correct });
  return choices;
}

function buildExplanation(
  topic: Topic,
  difficulty: Difficulty,
  choices: ChoiceOption[],
  answerIndex: number
): string {
  const evidence = buildEvidenceText(topic);
  const wrongLabels = choices
    .map((choice, index) => ({ ...choice, index }))
    .filter((choice) => choice.index !== answerIndex)
    .map((choice) => choice.label)
    .join(", ");
  const base =
    `정답은 ${answerIndex + 1}번입니다. ${topic.label}의 판단 근거는 "${evidence}"입니다. ` +
    `정답 선택지는 이 근거의 핵심 요건을 충족합니다. `;
  const wrongReason =
    `오답 선택지는 ${wrongLabels}에 관한 설명이거나, ${topic.label}의 핵심 요건과 다른 효과·통제 대상을 전제로 하므로 정답이 될 수 없습니다.`;

  if (difficulty === "hard") {
    return `${base}${wrongReason} ${topic.hardNote ? topic.hardNote : HARD_SUFFIX}`;
  }
  if (difficulty === "medium") {
    return `${base}${wrongReason} 실무에서는 유사 개념 간 적용 대상과 리스크 통제 포인트를 구분해야 합니다.`;
  }
  return `${base}${wrongReason}`;
}

function buildQuestionItems(): QuestionBankItem[] {
  const items: QuestionBankItem[] = [];

  for (const categoryPlan of CATEGORY_PLAN) {
    const difficulties = difficultyPlan(categoryPlan.bankCount);
    for (let index = 0; index < categoryPlan.bankCount; index++) {
      const topic = categoryPlan.topics[index % categoryPlan.topics.length];
      const topicOccurrence = Math.floor(index / categoryPlan.topics.length);
      const stem = STEMS[topicOccurrence % STEMS.length](topic);
      const difficulty = difficulties[index];
      const answerIndex = index % 4;
      const id = `seed-${hashText(`${categoryPlan.category}-${topic.label}-${index}`)}`;
      const choices = buildChoices(topic, categoryPlan.topics, index, answerIndex);

      items.push({
        id,
        documentId: DOCUMENT_ID,
        documentName: DOCUMENT_NAME,
        documentHash: hashText(DOCUMENT_NAME),
        chunkHash: hashText(buildEvidenceText(topic)),
        question: stem,
        choices: choices.map((choice) => choice.text),
        answerIndex,
        explanation: buildExplanation(topic, difficulty, choices, answerIndex),
        sourceText: buildEvidenceText(topic),
        category: categoryPlan.category,
        difficulty,
        status: "active",
        usageCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        qualityScore: 0.92,
        createdAt: NOW,
        updatedAt: NOW,
      });
    }
  }

  return items;
}

function main() {
  ensureDir(BANK_DIR);
  ensureDir(SET_DIR);

  const items = buildQuestionItems();
  for (const item of items) {
    fs.writeFileSync(
      path.join(BANK_DIR, `${item.id}.json`),
      JSON.stringify(item, null, 2),
      "utf-8"
    );
  }

  const questionSet = {
    id: "kbi-ai-literacy-80-balanced",
    name: "KBI AI Literacy 80문항 실전 문제 세트",
    description: "5개 평가영역 배점 구조를 반영한 200문항 문제은행 기반 80문항 실전 세트",
    documentIds: [DOCUMENT_ID],
    documentNames: [DOCUMENT_NAME],
    difficulty: "mixed",
    questionIds: items.map((item) => item.id),
    totalQuestions: items.length,
    status: "active",
    examConfig: {
      totalQuestions: 80,
      categoryAllocation: CATEGORY_PLAN.map((plan) => ({
        category: plan.category,
        score: plan.score,
        questionCount: plan.examCount,
      })),
      difficultyAllocation: {
        easy: 24,
        medium: 36,
        hard: 20,
      },
      sampling: "category-and-difficulty-random",
    },
    createdAt: NOW,
    updatedAt: NOW,
  };

  fs.writeFileSync(
    path.join(SET_DIR, `${questionSet.id}.json`),
    JSON.stringify(questionSet, null, 2),
    "utf-8"
  );

  console.log(`Seeded ${items.length} question-bank items.`);
  console.log(`Seeded question set: ${questionSet.id}`);
}

main();
