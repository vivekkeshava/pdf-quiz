"use client";

import type { Question } from "@/types/quiz";

interface ResultsSummaryProps {
  questions: Question[];
  answers: (number | null)[];
  onRetry: () => void;
}

export default function ResultsSummary({
  questions,
  answers,
  onRetry,
}: ResultsSummaryProps) {
  const correct = answers.filter(
    (a, i) => a === questions[i].correctAnswer
  ).length;
  const total = questions.length;
  const pct = Math.round((correct / total) * 100);

  const grade =
    pct >= 90
      ? { label: "Excellent!", color: "text-green-600" }
      : pct >= 70
      ? { label: "Good job!", color: "text-blue-600" }
      : pct >= 50
      ? { label: "Keep studying!", color: "text-yellow-600" }
      : { label: "Needs improvement", color: "text-red-600" };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Score card */}
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="text-6xl font-bold text-gray-800 mb-2">{pct}%</div>
        <div className={`text-xl font-semibold mb-1 ${grade.color}`}>
          {grade.label}
        </div>
        <p className="text-gray-500">
          You got <strong>{correct}</strong> out of <strong>{total}</strong> correct
        </p>
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-4">
        {questions.map((q, i) => {
          const userAnswer = answers[i];
          const isCorrect = userAnswer === q.correctAnswer;
          const isUnanswered = userAnswer === null;

          return (
            <div
              key={i}
              className={`bg-white rounded-xl shadow-sm border-l-4 p-5
                ${isCorrect ? "border-green-500" : "border-red-400"}
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">
                  {isCorrect ? "✅" : isUnanswered ? "⬜" : "❌"}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 mb-3">{q.question}</p>

                  <div className="space-y-1.5 mb-3">
                    {q.options.map((opt, j) => {
                      const isUserPick = userAnswer === j;
                      const isRight = j === q.correctAnswer;

                      return (
                        <div
                          key={j}
                          className={`text-sm px-3 py-1.5 rounded-lg
                            ${isRight ? "bg-green-100 text-green-800 font-medium" : ""}
                            ${isUserPick && !isRight ? "bg-red-100 text-red-700 line-through" : ""}
                            ${!isRight && !isUserPick ? "text-gray-500" : ""}
                          `}
                        >
                          {opt}
                          {isRight && " ✓"}
                          {isUserPick && !isRight && " ✗"}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium">Explanation: </span>
                    {q.explanation}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center pb-8">
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Try Another PDF
        </button>
      </div>
    </div>
  );
}
