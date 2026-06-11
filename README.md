# AI Literacy Quiz

저장된 문제은행 JSON을 기반으로 KBI AI Literacy Mock 시험과 주제별 연습을 제공하는 Next.js 앱입니다. PDF 파싱이나 AI 문제 생성은 런타임 기능에서 제거했고, 문제 데이터는 `data/question-bank`와 `data/question-sets`를 직접 업데이트해서 관리합니다.

## 주요 기능

- **Mock 시험**: 저장된 문제 세트에서 80문항 시험 시작, 제출, 채점
- **주제별 연습**: 영역별 10문항 랜덤 연습과 즉시 정답/해설 확인
- **정적 문제은행**: 별도 DB 없이 `data/` 폴더의 JSON 파일로 문제/세트 관리
- **Stateless 채점**: 풀이 결과는 서버에 저장하지 않고 브라우저에서 즉시 계산
- **선택지 셔플**: 시험/연습 시 선택지 순서를 섞고 정답 인덱스를 보정

## 빠른 시작

```bash
cd /home/dlxorals212/project/AI_Literacy
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                  # /quiz로 리다이렉트
│   ├── practice/page.tsx         # 주제별 연습
│   ├── quiz/
│   │   ├── page.tsx              # Mock 시험 및 연습 진입
│   │   └── [id]/page.tsx         # 시험 풀이 및 결과
│   └── api/
│       ├── practice/route.ts     # 주제별 연습 문제
│       ├── exams/start/route.ts  # 시험 문제 샘플링
│       └── quiz/                 # 퀴즈 목록/상세
├── components/
│   ├── quiz/                     # 시험/결과 UI
│   └── ui/                       # 공용 상태 UI
└── lib/
    ├── exam/session.ts           # 시험 샘플링/선택지 셔플
    ├── storage/json-store.ts     # JSON 파일 저장소
    └── quiz/
        ├── constants.ts          # 난이도/카테고리 공용 상수
        └── validator.ts          # 데이터 검증

data/
├── question-bank/  # 개별 문제 JSON
├── question-sets/  # 시험/연습용 문제 세트
└── quizzes/        # 레거시 퀴즈 세트
```

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/quiz` | 활성 문제 세트 목록 |
| `GET` | `/api/quiz/:id` | 퀴즈 상세 |
| `POST` | `/api/exams/start` | 저장된 문제 세트에서 시험 문제 샘플링 |
| `GET` | `/api/practice?category=...` | 주제별 연습 문제 |

## 문제 데이터 업데이트

문제 추가/수정은 `data/question-bank/*.json` 파일과 `data/question-sets/*.json` 파일을 업데이트해서 관리합니다. 새 seed 문제은행을 다시 만들 때는 아래 스크립트를 사용할 수 있습니다.

```bash
npm run seed:question-bank
```

생성/수정 후 데이터 검증:

```bash
npm run validate
```

## 로컬 테스트

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

- 개발 서버: http://localhost:3000
- 퀴즈/시험 목록: http://localhost:3000/quiz
- 별도 API 키나 PDF 환경변수는 필요하지 않습니다.
- Railway나 별도 백엔드가 필요하지 않습니다. Vercel 단독 배포를 기준으로 합니다.

## Vercel 배포

GitHub에 프로젝트를 푸시한 뒤 Vercel에서 해당 저장소를 Import합니다.

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: 비워둠
- Environment Variables: 없음

배포 전 확인:

```bash
npm run validate
npm run typecheck
npm run lint
npm run build
```

GitHub 푸시 예시:

```bash
git add .
git commit -m "Prepare stateless Vercel deployment"
git push origin main
```

## 용량 메모

현재 앱 실행에 꼭 필요한 데이터는 `data/question-bank`, `data/question-sets`, `data/quizzes` 정도이며 모두 합쳐도 작습니다. 큰 용량은 대부분 개발 의존성(`node_modules`)과 빌드 산출물(`.next`)입니다.

원본 PDF(`Workbook_*.pdf`)는 문제를 새로 생성하지 않는 현재 구조에서는 런타임에 필요하지 않습니다. 다만 문제 출처 보관용 원본 자료라면 프로젝트 밖에 아카이브해두는 것을 권장합니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Storage**: JSON 파일 (`data/` 폴더)
