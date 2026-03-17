"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/types/quiz";

interface ResultsSummaryProps {
  questions: Question[];
  answers: (number | null)[];
  onRetry: () => void;
}

const LETTER_LABELS = ["A", "B", "C", "D"];
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ResultsSummary({
  questions,
  answers,
  onRetry,
}: ResultsSummaryProps) {
  const correct = answers.filter((a, i) => a === questions[i].correctAnswer).length;
  const total = questions.length;
  const pct = Math.round((correct / total) * 100);

  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    let rafId: number;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayPct(Math.round(eased * pct));
      if (t < 1) rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [pct]);

  const strokeOffset = CIRCUMFERENCE * (1 - displayPct / 100);
  const ringColor =
    pct >= 70 ? "#34d399" : pct >= 50 ? "#fbbf24" : "#f87171";

  const grade =
    pct >= 90
      ? { label: "Excellent!", chip: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" }
      : pct >= 70
      ? { label: "Good job!", chip: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" }
      : pct >= 50
      ? { label: "Keep studying!", chip: "bg-amber-500/20 border-amber-500/40 text-amber-300" }
      : { label: "Needs improvement", chip: "bg-red-500/20 border-red-500/40 text-red-300" };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Score card */}
      <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl p-8 text-center animate-score-pop">
        {/* Accessible score label (hidden visually, used by tests + screen readers) */}
        <span className="sr-only" aria-live="polite">{pct}%</span>

        {/* SVG Ring */}
        <div className="flex justify-center mb-4">
          <svg
            width="140"
            height="140"
            aria-hidden="true"
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* Track */}
            <circle
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="10"
            />
            {/* Progress arc */}
            <circle
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
              style={{
                transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            />
            {/* Counter text — counter-rotated */}
            <text
              x="70"
              y="70"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                transform: "rotate(90deg)",
                transformOrigin: "70px 70px",
                fontSize: "24px",
                fontWeight: "700",
                fill: "white",
              }}
            >
              {displayPct}
            </text>
          </svg>
        </div>

        <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium mb-3 ${grade.chip}`}>
          {grade.label}
        </div>
        <p className="text-slate-400">
          You got <strong className="text-white">{correct}</strong> out of{" "}
          <strong className="text-white">{total}</strong> correct
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
              className={`rounded-xl border p-5 opacity-0 animate-fade-slide-up
                ${isCorrect ? "bg-emerald-500/8 border-emerald-500/25" : "bg-white/5 border-white/10"}
              `}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                {/* Check/X icon */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5
                    ${isCorrect ? "bg-emerald-500/20" : isUnanswered ? "bg-white/10" : "bg-red-500/20"}
                  `}
                >
                  {isCorrect ? (
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isUnanswered ? (
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white mb-3">{q.question}</p>

                  <div className="space-y-1.5 mb-3">
                    {q.options.map((opt, j) => {
                      const isUserPick = userAnswer === j;
                      const isRight = j === q.correctAnswer;
                      const label = opt.replace(/^[A-D]\)\s*/, "");

                      return (
                        <div
                          key={j}
                          className={`text-sm px-3 py-2 rounded-lg flex items-center gap-2
                            ${isRight ? "bg-emerald-500/15 border border-emerald-500/30" : ""}
                            ${isUserPick && !isRight ? "bg-red-500/15 border border-red-500/20" : ""}
                            ${!isRight && !isUserPick ? "text-slate-500" : ""}
                          `}
                        >
                          <span
                            className={`flex-shrink-0 w-5 h-5 rounded text-xs font-bold flex items-center justify-center
                              ${isRight ? "bg-emerald-500/30 text-emerald-300" : isUserPick ? "bg-red-500/30 text-red-300" : "bg-white/8 text-slate-500"}
                            `}
                          >
                            {LETTER_LABELS[j]}
                          </span>
                          <span className={`${isRight ? "text-emerald-200 font-medium" : isUserPick && !isRight ? "text-red-300 line-through" : ""}`}>
                            {label}
                          </span>
                          {isRight && (
                            <svg className="ml-auto w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-sm text-slate-400 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    <span className="font-medium text-slate-300">Explanation: </span>
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
          className="bg-indigo-500 hover:bg-indigo-400 active:scale-[0.98] text-white px-8 py-3 rounded-xl font-semibold
            transition-all shadow-lg shadow-indigo-500/25"
        >
          Try Another PDF
        </button>
      </div>
    </div>
  );
}
