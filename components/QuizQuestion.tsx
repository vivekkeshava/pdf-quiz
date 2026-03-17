"use client";

import { useEffect } from "react";
import type { Question } from "@/types/quiz";

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswer: (index: number) => void;
  onNext: () => void;
  canGoNext: boolean;
}

const LETTER_LABELS = ["A", "B", "C", "D"];

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onNext,
  canGoNext,
}: QuizQuestionProps) {
  const progress = (questionNumber / totalQuestions) * 100;

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "1") onAnswer(0);
      else if (e.key === "2") onAnswer(1);
      else if (e.key === "3") onAnswer(2);
      else if (e.key === "4") onAnswer(3);
      else if (e.key === "Enter" && canGoNext) onNext();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onAnswer, onNext, canGoNext]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-slate-400 px-2.5 py-1 rounded-full bg-white/8 border border-white/10">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 progress-shimmer">
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #6366f1, #818cf8)",
            }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6 leading-relaxed">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const label = option.replace(/^[A-D]\)\s*/, "");
            const isSelected = selectedAnswer === index;
            return (
              <button
                key={index}
                onClick={() => onAnswer(index)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 font-medium flex items-center gap-3
                  ${
                    isSelected
                      ? "border-indigo-500/70 bg-indigo-500/20 text-white"
                      : "border-white/10 hover:border-indigo-400/40 hover:bg-white/5 text-slate-300"
                  }
                `}
                style={isSelected ? { animation: "selectRipple 0.3s ease-out" } : undefined}
              >
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors
                    ${isSelected ? "bg-indigo-500 text-white" : "bg-white/8 text-slate-400 border border-white/10"}
                  `}
                >
                  {LETTER_LABELS[index]}
                </span>
                {label}
              </button>
            );
          })}
        </div>

        {/* Keyboard hint */}
        <div className="mt-5 pt-4 border-t border-white/8 flex items-center gap-3 text-xs text-slate-500">
          <span>Shortcuts:</span>
          {["1", "2", "3", "4"].map((k) => (
            <kbd key={k} className="px-1.5 py-0.5 rounded bg-white/8 border border-white/10 font-mono text-slate-400">
              {k}
            </kbd>
          ))}
          <span className="mx-1">to select</span>
          <kbd className="px-2 py-0.5 rounded bg-white/8 border border-white/10 font-mono text-slate-400">
            Enter
          </kbd>
          <span>to continue</span>
        </div>
      </div>
    </div>
  );
}
