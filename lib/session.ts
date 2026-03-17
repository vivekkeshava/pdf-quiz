import type { QuizState } from "@/types/quiz";

export const QUIZ_STATE_KEY = "quizState";

export function saveQuizState(state: QuizState): void {
  try {
    sessionStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      throw new Error(
        "Could not save quiz progress — browser storage is full. Try clearing your browser data."
      );
    }
    throw err;
  }
}

export function loadQuizState(): QuizState | null {
  try {
    const raw = sessionStorage.getItem(QUIZ_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuizState;
  } catch {
    return null;
  }
}

export function clearQuizState(): void {
  sessionStorage.removeItem(QUIZ_STATE_KEY);
}
