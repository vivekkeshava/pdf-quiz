"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuizQuestion from "@/components/QuizQuestion";
import { saveQuizState, loadQuizState } from "@/lib/session";
import type { QuizState } from "@/types/quiz";

export default function QuizPage() {
  const router = useRouter();
  const [state, setState] = useState<QuizState | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const parsed = loadQuizState();
    if (!parsed || !parsed.questions || parsed.questions.length === 0) {
      router.replace("/");
      return;
    }
    setState(parsed);
  }, [router]);

  function handleAnswer(answerIndex: number) {
    if (!state) return;
    const newAnswers = [...state.answers];
    newAnswers[state.currentIndex] = answerIndex;
    const updated = { ...state, answers: newAnswers };
    setState(updated);
    try {
      saveQuizState(updated);
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save progress");
    }
  }

  function handleNext() {
    if (!state) return;
    const { currentIndex, questions } = state;

    if (currentIndex < questions.length - 1) {
      const updated = { ...state, currentIndex: currentIndex + 1 };
      setState(updated);
      try {
        saveQuizState(updated);
        setSaveError(null);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Failed to save progress");
      }
    } else {
      const updated = { ...state, submitted: true };
      try {
        saveQuizState(updated);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Failed to save progress");
        return;
      }
      router.push("/results");
    }
  }

  function handlePrev() {
    if (!state || state.currentIndex === 0) return;
    const updated = { ...state, currentIndex: state.currentIndex - 1 };
    setState(updated);
    try {
      saveQuizState(updated);
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save progress");
    }
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const { questions, currentIndex, answers } = state;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <p className="text-center text-sm text-gray-500 mb-6">
          Quiz from: <span className="font-medium">{state.fileName}</span>
        </p>

        {saveError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedAnswer={currentAnswer}
          onAnswer={handleAnswer}
        />

        <div className="flex gap-3 mt-6 max-w-2xl mx-auto">
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Previous
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={currentAnswer === null}
            className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLast ? "Submit Quiz" : "Next →"}
          </button>
        </div>
      </div>
    </main>
  );
}
