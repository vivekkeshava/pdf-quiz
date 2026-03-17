import React from "react";
import { render, screen } from "@testing-library/react";
import ResultsSummary from "@/components/ResultsSummary";
import type { Question } from "@/types/quiz";

const questions: Question[] = [
  {
    question: "Q1",
    options: ["A) a", "B) b", "C) c", "D) d"],
    correctAnswer: 0,
    explanation: "A is correct",
  },
  {
    question: "Q2",
    options: ["A) a", "B) b", "C) c", "D) d"],
    correctAnswer: 1,
    explanation: "B is correct",
  },
  {
    question: "Q3",
    options: ["A) a", "B) b", "C) c", "D) d"],
    correctAnswer: 2,
    explanation: "C is correct",
  },
  {
    question: "Q4",
    options: ["A) a", "B) b", "C) c", "D) d"],
    correctAnswer: 3,
    explanation: "D is correct",
  },
  {
    question: "Q5",
    options: ["A) a", "B) b", "C) c", "D) d"],
    correctAnswer: 0,
    explanation: "A is correct",
  },
];

describe("ResultsSummary — score calculation", () => {
  it("shows 100% when all answers are correct", () => {
    const answers = [0, 1, 2, 3, 0];
    render(
      <ResultsSummary questions={questions} answers={answers} onRetry={() => {}} />
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
    // "You got 5 out of 5 correct" — text split across <strong> elements
    expect(screen.getByText(/you got/i).textContent).toMatch(/5.*5/);
  });

  it("shows 60% when 3 out of 5 are correct", () => {
    const answers = [0, 1, 0, 0, 0]; // Q1, Q2, Q5 correct; Q3, Q4 wrong
    render(
      <ResultsSummary questions={questions} answers={answers} onRetry={() => {}} />
    );
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText(/you got/i).textContent).toMatch(/3.*5/);
  });

  it("shows 0% when all answers are wrong", () => {
    const answers = [1, 0, 0, 0, 1]; // all wrong
    render(
      <ResultsSummary questions={questions} answers={answers} onRetry={() => {}} />
    );
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText(/you got/i).textContent).toMatch(/0.*5/);
  });
});

describe("ResultsSummary — grade thresholds", () => {
  const makeAnswers = (correctCount: number) =>
    questions.map((q, i) => (i < correctCount ? q.correctAnswer : -1));

  it("shows Excellent! at 90%+ (5/5 = 100%)", () => {
    render(
      <ResultsSummary
        questions={questions}
        answers={makeAnswers(5)}
        onRetry={() => {}}
      />
    );
    expect(screen.getByText("Excellent!")).toBeInTheDocument();
  });

  it("shows Good job! at 70–89% (4/5 = 80%)", () => {
    render(
      <ResultsSummary
        questions={questions}
        answers={makeAnswers(4)}
        onRetry={() => {}}
      />
    );
    expect(screen.getByText("Good job!")).toBeInTheDocument();
  });

  it("shows Keep studying! at 50–69% (3/5 = 60%)", () => {
    render(
      <ResultsSummary
        questions={questions}
        answers={makeAnswers(3)}
        onRetry={() => {}}
      />
    );
    expect(screen.getByText("Keep studying!")).toBeInTheDocument();
  });

  it("shows Needs improvement below 50% (2/5 = 40%)", () => {
    render(
      <ResultsSummary
        questions={questions}
        answers={makeAnswers(2)}
        onRetry={() => {}}
      />
    );
    expect(screen.getByText("Needs improvement")).toBeInTheDocument();
  });
});
