import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractTextFromPdf } from "@/lib/pdf";
import { generateQuiz } from "@/lib/claude";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Simple in-memory rate limiter: max 5 requests per IP per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

const RequestSchema = z.object({
  count: z.number().int().min(1).max(20),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
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
  try {
    const questions = await generateQuiz(text, count);
    return NextResponse.json({ questions, pageCount });
  } catch (firstErr) {
    console.error("First Claude attempt failed:", firstErr);

    try {
      const questions = await generateQuiz(text, count);
      return NextResponse.json({ questions, pageCount });
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
}
