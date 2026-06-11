/**
 * CLI validation script for saved question-bank data.
 * Usage: npm run validate
 */

import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "..");
const BANK_DIR = path.join(ROOT, "data", "question-bank");
const SET_DIR = path.join(ROOT, "data", "question-sets");

type JsonObject = Record<string, unknown>;

function readJsonFiles(dir: string): { filePath: string; data: JsonObject }[] {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const filePath = path.join(dir, file);
      return {
        filePath,
        data: JSON.parse(fs.readFileSync(filePath, "utf-8")) as JsonObject,
      };
    });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateQuestion(fileName: string, data: JsonObject): string[] {
  const issues: string[] = [];
  const choices = data.choices;
  const answerIndex = data.answerIndex;

  if (!isNonEmptyString(data.id)) issues.push("id is required");
  if (!isNonEmptyString(data.question)) issues.push("question is required");
  if (!Array.isArray(choices) || choices.length !== 4) {
    issues.push("choices must have exactly 4 items");
  } else if (!choices.every(isNonEmptyString)) {
    issues.push("choices must be non-empty strings");
  }
  if (
    typeof answerIndex !== "number" ||
    !Number.isInteger(answerIndex) ||
    answerIndex < 0 ||
    answerIndex > 3
  ) {
    issues.push("answerIndex must be an integer from 0 to 3");
  }
  if (!isNonEmptyString(data.explanation)) issues.push("explanation is required");
  if (!["active", "needs_review", "archived"].includes(String(data.status))) {
    issues.push("status must be active, needs_review, or archived");
  }

  if (issues.length > 0) return issues.map((issue) => `${fileName}: ${issue}`);
  return [];
}

function validateQuestionSet(
  fileName: string,
  data: JsonObject,
  questionIds: Set<string>
): string[] {
  const issues: string[] = [];
  const setQuestionIds = data.questionIds;

  if (!isNonEmptyString(data.id)) issues.push("id is required");
  if (!isNonEmptyString(data.name)) issues.push("name is required");
  if (!Array.isArray(setQuestionIds) || setQuestionIds.length === 0) {
    issues.push("questionIds must be a non-empty array");
  } else {
    for (const id of setQuestionIds) {
      if (!isNonEmptyString(id)) {
        issues.push("questionIds contains a non-string id");
      } else if (!questionIds.has(id)) {
        issues.push(`question id not found in bank: ${id}`);
      }
    }

    if (
      typeof data.totalQuestions === "number" &&
      data.totalQuestions !== setQuestionIds.length
    ) {
      issues.push("totalQuestions does not match questionIds length");
    }
  }
  if (!["draft", "active", "archived"].includes(String(data.status))) {
    issues.push("status must be draft, active, or archived");
  }

  if (issues.length > 0) return issues.map((issue) => `${fileName}: ${issue}`);
  return [];
}

function main() {
  console.log("=== Question Bank Validator ===\n");

  const questionFiles = readJsonFiles(BANK_DIR);
  const setFiles = readJsonFiles(SET_DIR);
  const questionIds = new Set<string>();
  const issues: string[] = [];

  for (const { filePath, data } of questionFiles) {
    const fileName = path.basename(filePath);
    issues.push(...validateQuestion(fileName, data));

    if (isNonEmptyString(data.id)) {
      if (questionIds.has(data.id)) issues.push(`${fileName}: duplicate question id`);
      questionIds.add(data.id);
    }
  }

  for (const { filePath, data } of setFiles) {
    issues.push(...validateQuestionSet(path.basename(filePath), data, questionIds));
  }

  console.log(`Questions: ${questionFiles.length}`);
  console.log(`Question sets: ${setFiles.length}`);

  if (issues.length > 0) {
    console.log(`\nInvalid: ${issues.length}`);
    issues.forEach((issue) => console.log(`- ${issue}`));
    process.exit(1);
  }

  console.log("\nAll question-bank data is valid.");
}

main();
