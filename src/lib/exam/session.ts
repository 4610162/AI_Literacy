import type { ExamQuestionPublic, QuestionBankItem } from "@/types";

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sampleQuestions(
  questions: QuestionBankItem[],
  count: number,
  shuffleQuestions: boolean
): QuestionBankItem[] {
  const source = shuffleQuestions ? shuffleArray(questions) : [...questions];
  return source.slice(0, count);
}

function normalizeQuestionText(question: string): string {
  return question.replace(/\s+/g, " ").trim();
}

export function uniqueByQuestionText(questions: QuestionBankItem[]): QuestionBankItem[] {
  const seen = new Set<string>();
  const unique: QuestionBankItem[] = [];

  for (const question of questions) {
    const key = normalizeQuestionText(question.question);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(question);
  }

  return unique;
}

export function buildChoiceOrder(question: QuestionBankItem, shuffleChoices: boolean): number[] {
  const order = question.choices.map((_, index) => index);
  return shuffleChoices ? shuffleArray(order) : order;
}

export function toExamQuestionPublic(
  question: QuestionBankItem,
  choiceOrder: number[]
): ExamQuestionPublic {
  const displayedAnswerIndex = choiceOrder.indexOf(question.answerIndex);

  return {
    id: question.id,
    documentId: question.documentId,
    documentName: question.documentName,
    documentHash: question.documentHash,
    chunkHash: question.chunkHash,
    page: question.page,
    question: question.question,
    choices: choiceOrder.map((index) => question.choices[index]),
    answerIndex: displayedAnswerIndex,
    explanation: alignExplanationAnswerNumber(question.explanation, displayedAnswerIndex),
    sourceText: question.sourceText,
    category: question.category,
    difficulty: question.difficulty,
  };
}

export function mapDisplayedAnswerToOriginal(
  displayedIndex: number,
  choiceOrder: number[] | undefined
): number {
  if (!choiceOrder) return displayedIndex;
  return choiceOrder[displayedIndex] ?? -1;
}

export function alignExplanationAnswerNumber(
  explanation: string,
  displayedAnswerIndex: number
): string {
  if (displayedAnswerIndex < 0) return explanation;
  return explanation.replace(
    /^정답은\s*\d+번입니다\./,
    `정답은 ${displayedAnswerIndex + 1}번입니다.`
  );
}
