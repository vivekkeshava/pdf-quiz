"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import { saveQuizState } from "@/lib/session";

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function LandingPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === "loading";

  async function handleStart() {
    if (!file) return;
    setError(null);
    setStatus("loading");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("count", String(questionCount));

      const res = await fetch("/api/quiz", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate quiz");
      }

      const { questions, pageCount } = await res.json();

      saveQuizState({
        questions,
        currentIndex: 0,
        answers: new Array(questions.length).fill(null),
        submitted: false,
        pageCount,
        fileName: file.name,
      });

      router.push("/quiz");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            PDF Quiz Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Upload a PDF and get an AI-generated quiz in seconds
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <FileUpload onFileSelect={setFile} disabled={isLoading} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of questions
            </label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  disabled={isLoading}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm
                    ${
                      questionCount === n
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                <span className="text-blue-700 font-medium">
                  Generating your quiz with AI…
                </span>
              </div>
              <p className="text-blue-500 text-sm mt-2">This may take 5–15 seconds</p>
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!file || isLoading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            Generate Quiz
          </button>
        </div>
      </div>
    </main>
  );
}
