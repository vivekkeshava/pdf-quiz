// Request pipeline:
//
//   POST /api/quiz
//       │
//       ▼
//   auth() ──── no session ──▶ 401
//       │
//       ▼
//   per-user quota check (5 req / 60s via QuizRecord count)
//       │   ── over limit ──▶ 429
//       ▼
//   validate form data (file type, size, question count)
//       │   ── invalid ──▶ 400 / 413 / 422
//       ▼
//   extractTextFromPdf()
//       │   ── error ──▶ 500
//       │   ── no text ──▶ 422
//       ▼
//   generateQuiz() with one retry
//       │   ── both fail ──▶ 502 / 422
//       ▼
//   prisma.quizRecord.create() ── error ──▶ log + continue (T-1A)
//       │
//       ▼
//   return { questions, pageCount, quizRecordId }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractTextFromPdf } from "@/lib/pdf";
import { generateQuiz } from "@/lib/claude";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

async function checkUserQuota(userId: string): Promise<boolean> {
  const count = await prisma.quizRecord.count({
    where: {
      userId,
      createdAt: { gte: new Date(Date.now() - RATE_WINDOW_MS) },
    },
  });
  return count < RATE_LIMIT;
}

const RequestSchema = z.object({
  count: z.number().int().min(1).max(20),
});

export async function POST(req: NextRequest) {
  // Auth check — must be logged in
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Per-user rate limit (replaces old IP-based limiter)
  const withinQuota = await checkUserQuota(userId);
  if (!withinQuota) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before trying again." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const countRaw = formData.get("count");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are supported" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File exceeds 10MB limit" },
      { status: 413 }
    );
  }

  const parsed = RequestSchema.safeParse({ count: Number(countRaw) });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid question count", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { count } = parsed.data;

  // Extract text from PDF (stays server-side, never sent to browser)
  let text: string;
  let pageCount: number;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    ({ text, pageCount } = await extractTextFromPdf(buffer));
  } catch (err) {
    console.error("PDF extraction error:", err);
    return NextResponse.json(
      { error: "Failed to parse PDF" },
      { status: 500 }
    );
  }

  if (!text || text.trim().length < 50) {
    return NextResponse.json(
      {
        error:
          "Could not extract readable text from this PDF. It may be a scanned document with images only.",
      },
      { status: 422 }
    );
  }

  // Generate quiz — retry once on failure
  let questions: Awaited<ReturnType<typeof generateQuiz>>;
  try {
    questions = await generateQuiz(text, count);
  } catch (firstErr) {
    console.error("First Claude attempt failed:", firstErr);

    try {
      questions = await generateQuiz(text, count);
    } catch (secondErr) {
      console.error("Second Claude attempt failed:", secondErr);

      const message =
        secondErr instanceof Error ? secondErr.message : "Unknown error";

      if (
        message.includes("invalid JSON") ||
        message.includes("Invalid question")
      ) {
        return NextResponse.json(
          { error: "Quiz generation returned malformed data. Please try again." },
          { status: 422 }
        );
      }

      return NextResponse.json(
        { error: "Quiz generation failed. Please try again later." },
        { status: 502 }
      );
    }
  }

  // Save quiz record — T-1A: return quiz even if DB write fails
  let quizRecordId: string | undefined;
  try {
    const record = await prisma.quizRecord.create({
      data: {
        userId,
        fileName: file.name,
        pageCount,
        questions: JSON.stringify(questions),
      },
    });
    quizRecordId = record.id;
  } catch (dbErr) {
    console.error("Failed to save quiz record (quiz still returned):", dbErr);
  }

  return NextResponse.json({ questions, pageCount, quizRecordId });
}
