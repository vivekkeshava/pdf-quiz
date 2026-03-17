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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Results</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-xs text-slate-400">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {state.fileName}
          </div>
        </div>

        <ResultsSummary
          questions={state.questions}
          answers={state.answers}
          onRetry={handleRetry}
        />
      </div>
    </main>
  );
}
