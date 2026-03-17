// Set env var before module is loaded so the startup guard passes
process.env.ANTHROPIC_API_KEY = "test-key";

// Capture mockCreate in closure so it's available after hoisting
let mockCreate: jest.Mock;

jest.mock("@anthropic-ai/sdk", () => {
  mockCreate = jest.fn();
  return {
    __esModule: true,
    default: jest.fn(() => ({
      messages: { create: mockCreate },
    })),
  };
});

import { generateQuiz } from "@/lib/claude";

function setClaudeResponse(text: string) {
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text }],
  });
}

const validQuestion = {
  question: "What is the capital of France?",
  options: ["A) London", "B) Berlin", "C) Paris", "D) Madrid"],
  correctAnswer: 2,
  explanation: "Paris is the capital of France.",
};

describe("generateQuiz — valid input", () => {
  it("returns parsed questions for valid Claude response", async () => {
    setClaudeResponse(JSON.stringify([validQuestion]));
    const result = await generateQuiz("Some text about France.", 1);
    expect(result).toHaveLength(1);
    expect(result[0].question).toBe("What is the capital of France?");
    expect(result[0].correctAnswer).toBe(2);
  });

  it("strips markdown code fences from response", async () => {
    setClaudeResponse("```json\n" + JSON.stringify([validQuestion]) + "\n```");
    const result = await generateQuiz("Some text.", 1);
    expect(result).toHaveLength(1);
  });
});

describe("generateQuiz — validation errors", () => {
  it("throws on invalid JSON", async () => {
    setClaudeResponse("not json at all");
    await expect(generateQuiz("text", 1)).rejects.toThrow("invalid JSON");
  });

  it("throws when response is not an array", async () => {
    setClaudeResponse(JSON.stringify({ question: "Q?" }));
    await expect(generateQuiz("text", 1)).rejects.toThrow("not an array");
  });

  it("throws when correctAnswer is out of range (>= options.length)", async () => {
    setClaudeResponse(JSON.stringify([{ ...validQuestion, correctAnswer: 5 }]));
    await expect(generateQuiz("text", 1)).rejects.toThrow("Invalid question shape");
  });

  it("throws when correctAnswer is negative", async () => {
    setClaudeResponse(JSON.stringify([{ ...validQuestion, correctAnswer: -1 }]));
    await expect(generateQuiz("text", 1)).rejects.toThrow("Invalid question shape");
  });

  it("throws when options contains a non-string", async () => {
    setClaudeResponse(
      JSON.stringify([
        {
          ...validQuestion,
          options: ["A) London", null, "C) Paris", "D) Madrid"],
        },
      ])
    );
    await expect(generateQuiz("text", 1)).rejects.toThrow("Invalid question shape");
  });

  it("throws when options has fewer than 4 items", async () => {
    setClaudeResponse(
      JSON.stringify([{ ...validQuestion, options: ["A) a", "B) b", "C) c"] }])
    );
    await expect(generateQuiz("text", 1)).rejects.toThrow("Invalid question shape");
  });

  it("throws when explanation is missing", async () => {
    const { explanation: _removed, ...withoutExplanation } = validQuestion;
    setClaudeResponse(JSON.stringify([withoutExplanation]));
    await expect(generateQuiz("text", 1)).rejects.toThrow("Invalid question shape");
  });
});
