const MAX_WORDS = 12000;

export async function extractTextFromPdf(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
}> {
  // Dynamic import to avoid issues with Next.js edge runtime
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PDFParse } = require("pdf-parse") as { PDFParse: new (opts: { data: Buffer }) => { getText: () => Promise<{ text: string; total: number }> } };
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();

  let text = data.text || "";

  // Truncate to MAX_WORDS if needed
  const words = text.split(/\s+/);
  if (words.length > MAX_WORDS) {
    text = words.slice(0, MAX_WORDS).join(" ");
  }

  return {
    text: text.trim(),
    pageCount: data.total,
  };
}
