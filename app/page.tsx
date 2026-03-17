"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import { saveQuizState } from "@/lib/session";

const QUESTION_COUNTS = [5, 10, 15, 20];

type LoadingStep = "uploading" | "extracting" | "generating" | "done";

const LOADING_STEPS: { key: LoadingStep; label: string }[] = [
  { key: "uploading", label: "Upload" },
  { key: "extracting", label: "Extract" },
  { key: "generating", label: "Generate" },
];

export default function LandingPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("uploading");

  const isLoading = status === "loading";

  async function handleStart() {
    if (!file) return;
    setError(null);
    setStatus("loading");
    setLoadingStep("uploading");

    const t1 = setTimeout(() => setLoadingStep("extracting"), 1200);
    const t2 = setTimeout(() => setLoadingStep("generating"), 3500);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("count", String(questionCount));

      const res = await fetch("/api/quiz", {
        method: "POST",
        body: formData,
      });

      clearTimeout(t1);
      clearTimeout(t2);
      setLoadingStep("done");

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate quiz");
      }

      const { questions, pageCount, quizRecordId } = await res.json();

      saveQuizState({
        questions,
        currentIndex: 0,
        answers: new Array(questions.length).fill(null),
        submitted: false,
        pageCount,
        fileName: file.name,
        quizRecordId,
      });

      router.push("/quiz");
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  const stepIndex = LOADING_STEPS.findIndex((s) => s.key === loadingStep);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8 animate-fade-slide-up">
          {/* Powered by Claude pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-xs text-slate-300 mb-6">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Powered by Claude AI
          </div>

          <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
            PDF Quiz Generator
          </h1>
          <p className="text-slate-400 text-lg">
            Upload a PDF and get an AI-generated quiz in seconds
          </p>
        </div>

        <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl p-8 space-y-6">
          <FileUpload
            onFileSelect={setFile}
            onClear={() => setFile(null)}
            selectedFile={file}
            disabled={isLoading}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Number of questions
            </label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  disabled={isLoading}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm
                    ${
                      questionCount === n
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                        : "bg-white/8 text-slate-400 border border-white/10 hover:border-indigo-500/40 hover:text-slate-200"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              {/* Step dots */}
              <div className="flex items-center justify-center gap-2 mb-3">
                {LOADING_STEPS.map((step, i) => (
                  <div key={step.key} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5`}>
                      <div
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i < stepIndex
                            ? "bg-indigo-400"
                            : i === stepIndex
                            ? "bg-indigo-400 scale-125"
                            : "bg-white/20"
                        }`}
                      />
                      <span
                        className={`text-xs transition-colors duration-300 ${
                          i === stepIndex ? "text-indigo-300" : i < stepIndex ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < LOADING_STEPS.length - 1 && (
                      <div className={`w-6 h-px transition-colors duration-300 ${i < stepIndex ? "bg-indigo-500/50" : "bg-white/10"}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent" />
                <span className="text-slate-300 text-sm font-medium">
                  {loadingStep === "uploading" && "Uploading your PDF…"}
                  {loadingStep === "extracting" && "Extracting text…"}
                  {loadingStep === "generating" && "Generating quiz with AI…"}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!file || isLoading}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-[0.98] text-white font-semibold rounded-xl
              disabled:opacity-40 disabled:cursor-not-allowed transition-all text-lg shadow-lg shadow-indigo-500/25"
          >
            Generate Quiz
          </button>
        </div>
      </div>
    </main>
  );
}
