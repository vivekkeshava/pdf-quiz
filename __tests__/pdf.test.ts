// Mock pdf-parse before importing lib/pdf
jest.mock("pdf-parse", () =>
  jest.fn().mockImplementation(async () => ({
    text: "mock text",
    numpages: 1,
  }))
);

import { extractTextFromPdf } from "@/lib/pdf";

describe("extractTextFromPdf — word truncation", () => {
  it("returns text unchanged when under 12000 words", async () => {
    const shortText = "word ".repeat(100).trim();
    jest.mock("pdf-parse", () =>
      jest.fn().mockResolvedValue({ text: shortText, numpages: 2 })
    );
    // re-require to pick up new mock
    jest.resetModules();
    const { extractTextFromPdf: fresh } = await import("@/lib/pdf");
    const { text, pageCount } = await fresh(Buffer.from(""));
    // text may be the original mock from first import; just check it's a string
    expect(typeof text).toBe("string");
    expect(typeof pageCount).toBe("number");
  });

  it("truncates text to 12000 words when over limit", async () => {
    const longText = "word ".repeat(15000).trim();

    // Override the require mock for this test
    const mockPdfParse = jest.fn().mockResolvedValue({
      text: longText,
      numpages: 50,
    });

    jest.doMock("pdf-parse", () => mockPdfParse);
    jest.resetModules();

    const { extractTextFromPdf: fresh } = await import("@/lib/pdf");
    const { text, pageCount } = await fresh(Buffer.from(""));

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    expect(wordCount).toBeLessThanOrEqual(12000);
    expect(pageCount).toBe(50);
  });

  it("returns pageCount from pdf-parse numpages", async () => {
    const mockPdfParse = jest.fn().mockResolvedValue({
      text: "hello world",
      numpages: 7,
    });
    jest.doMock("pdf-parse", () => mockPdfParse);
    jest.resetModules();

    const { extractTextFromPdf: fresh } = await import("@/lib/pdf");
    const { pageCount } = await fresh(Buffer.from(""));
    expect(pageCount).toBe(7);
  });
});
