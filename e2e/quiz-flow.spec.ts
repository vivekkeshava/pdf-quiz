import { test, expect, type Page } from "@playwright/test";

// Inject a pre-built quiz state to bypass PDF upload + AI generation
// (those are covered by unit tests; here we test the UI flow)
async function injectQuizState(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    sessionStorage.setItem(
      "quizState",
      JSON.stringify({
        questions: [
          {
            question: "What color is the sky?",
            options: ["A) Red", "B) Blue", "C) Green", "D) Yellow"],
            correctAnswer: 1,
            explanation: "The sky appears blue due to Rayleigh scattering.",
          },
          {
            question: "What is 2 + 2?",
            options: ["A) 3", "B) 4", "C) 5", "D) 6"],
            correctAnswer: 1,
            explanation: "2 + 2 equals 4.",
          },
        ],
        currentIndex: 0,
        answers: [null, null],
        submitted: false,
        fileName: "test.pdf",
        pageCount: 3,
      })
    );
  });
}

test.describe("Quiz flow", () => {
  test("shows question 1 of 2 on /quiz", async ({ page }) => {
    await injectQuizState(page);
    await page.goto("/quiz");

    await expect(page.getByText("Question 1 of 2")).toBeVisible();
    await expect(page.getByText("What color is the sky?")).toBeVisible();
  });

  test("Previous button is not shown on first question", async ({ page }) => {
    await injectQuizState(page);
    await page.goto("/quiz");

    await expect(page.getByText("← Previous")).not.toBeVisible();
  });

  test("Next button is disabled until an answer is selected", async ({
    page,
  }) => {
    await injectQuizState(page);
    await page.goto("/quiz");

    const nextBtn = page.getByRole("button", { name: /Next →/i });
    await expect(nextBtn).toBeDisabled();

    await page.getByText("B) Blue").click();
    await expect(nextBtn).toBeEnabled();
  });

  test("answer persists when navigating back", async ({ page }) => {
    await injectQuizState(page);
    await page.goto("/quiz");

    // Answer Q1
    await page.getByText("B) Blue").click();
    await page.getByRole("button", { name: /Next →/i }).click();

    // Now on Q2 — go back
    await page.getByText("← Previous").click();

    // Q1's answer (B) Blue) should still be selected
    const blueOption = page.getByText("B) Blue");
    await expect(blueOption).toHaveClass(/border-blue-500/);
  });

  test("submitting quiz navigates to /results", async ({ page }) => {
    await injectQuizState(page);
    await page.goto("/quiz");

    // Answer Q1
    await page.getByText("B) Blue").click();
    await page.getByRole("button", { name: /Next →/i }).click();

    // Answer Q2
    await page.getByText("B) 4").click();
    await page.getByRole("button", { name: /Submit Quiz/i }).click();

    await expect(page).toHaveURL("/results");
  });

  test("results page shows correct score", async ({ page }) => {
    await injectQuizState(page);
    await page.goto("/quiz");

    // Answer both correctly
    await page.getByText("B) Blue").click();
    await page.getByRole("button", { name: /Next →/i }).click();
    await page.getByText("B) 4").click();
    await page.getByRole("button", { name: /Submit Quiz/i }).click();

    await expect(page).toHaveURL("/results");
    await expect(page.getByText("100%")).toBeVisible();
    await expect(page.getByText("Excellent!")).toBeVisible();
  });

  test("Try Another PDF clears state and returns to home", async ({ page }) => {
    // Inject a submitted state
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.setItem(
        "quizState",
        JSON.stringify({
          questions: [
            {
              question: "Q?",
              options: ["A) a", "B) b", "C) c", "D) d"],
              correctAnswer: 0,
              explanation: "A",
            },
          ],
          currentIndex: 0,
          answers: [0],
          submitted: true,
          fileName: "test.pdf",
          pageCount: 1,
        })
      );
    });

    await page.goto("/results");
    await page.getByRole("button", { name: /Try Another PDF/i }).click();

    await expect(page).toHaveURL("/");
    const stored = await page.evaluate(() => sessionStorage.getItem("quizState"));
    expect(stored).toBeNull();
  });
});

test.describe("Home page", () => {
  test("shows the upload area and question count buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("PDF Quiz Generator")).toBeVisible();
    await expect(page.getByText("Drag & drop a PDF, or click to browse")).toBeVisible();
    await expect(page.getByRole("button", { name: "10" })).toBeVisible();
  });

  test("Generate Quiz button is disabled when no file is selected", async ({
    page,
  }) => {
    await page.goto("/");
    const btn = page.getByRole("button", { name: "Generate Quiz" });
    await expect(btn).toBeDisabled();
  });

  test("shows error for non-PDF file upload", async ({ page }) => {
    await page.goto("/");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello"),
    });
    await expect(page.getByText(/only pdf/i)).toBeVisible();
  });
});
