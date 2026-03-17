import Anthropic from "@anthropic-ai/sdk";
import type { Question } from "@/types/quiz";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable is required");
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateQuiz(
  text: string,
  count: number
): Promise<Question[]> {
  const prompt = `You are a quiz generator for students. Given the text below, generate exactly ${count} multiple-choice questions that test understanding of the key concepts.

Return ONLY valid JSON — an array of objects with this exact shape:
[
  {
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why the correct answer is right."
  }
]

Rules:
- Each question must have exactly 4 options.
- correctAnswer is the 0-based index of the correct option (must be 0, 1, 2, or 3).
- All options must be strings.
- Questions should cover different parts of the text.
- Avoid trivially easy questions.

TEXT:
${text}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const raw = textBlock.text.trim();

  // Strip markdown code fences if present
  const jsonStr = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Claude returned invalid JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Claude response is not an array");
  }

  const questions: Question[] = parsed.map((item: unknown, i: number) => {
    const q = item as Record<string, unknown>;
    if (
      typeof q.question !== "string" ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      !q.options.every((o) => typeof o === "string") ||
      typeof q.correctAnswer !== "number" ||
      !Number.isInteger(q.correctAnswer) ||
      q.correctAnswer < 0 ||
      q.correctAnswer >= q.options.length ||
      typeof q.explanation !== "string"
    ) {
      throw new Error(`Invalid question shape at index ${i}`);
    }
    return {
      question: q.question,
      options: q.options as string[],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    };
  });

  return questions;
}
