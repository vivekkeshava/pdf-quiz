"use client";

import type { Question } from "@/types/quiz";

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswer: (index: number) => void;
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
}: QuizQuestionProps) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Question {questionNumber} of {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 leading-relaxed">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(index)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium
                ${
                  selectedAnswer === index
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700"
                }
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
