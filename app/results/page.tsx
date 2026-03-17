"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResultsSummary from "@/components/ResultsSummary";
import { loadQuizState, clearQuizState } from "@/lib/session";
import type { QuizState } from "@/types/quiz";

export default function ResultsPage() {
  const router = useRouter();
  const [state, setState] = useState<QuizState | null>(null);

  useEffect(() => {
    const parsed = loadQuizState();
    if (!parsed || !parsed.submitted || !parsed.questions?.length) {
      router.replace(parsed ? "/quiz" : "/");
      return;
    }
    setState(parsed);
  }, [router]);

  function handleRetry() {
    clearQuizState();
    router.push("/");
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Your Results
        </h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          From: <span className="font-medium">{state.fileName}</span>
        </p>

        <ResultsSummary
          questions={state.questions}
          answers={state.answers}
          onRetry={handleRetry}
        />
      </div>
    </main>
  );
}
