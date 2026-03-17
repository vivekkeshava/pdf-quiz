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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const { questions, currentIndex, answers } = state;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* File name badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-xs text-slate-400">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {state.fileName}
          </div>
        </div>

        {saveError && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
            {saveError}
          </div>
        )}

        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedAnswer={currentAnswer}
          onAnswer={handleAnswer}
          onNext={handleNext}
          canGoNext={currentAnswer !== null}
        />

        <div className="flex gap-3 mt-6 max-w-2xl mx-auto">
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 py-3 border border-white/20 text-slate-400 font-semibold rounded-xl hover:border-white/30 hover:text-slate-300 transition-all"
            >
              ← Previous
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={currentAnswer === null}
            className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-[0.98] text-white font-semibold rounded-xl
              disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
          >
            {isLast ? "Submit Quiz" : "Next →"}
          </button>
        </div>
      </div>
    </main>
  );
}
