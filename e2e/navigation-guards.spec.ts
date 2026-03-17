import { test, expect } from "@playwright/test";

test.describe("Navigation guards", () => {
  test("navigating directly to /quiz redirects to / when no state", async ({
    page,
  }) => {
    await page.goto("/quiz");
    await expect(page).toHaveURL("/");
  });

  test("navigating directly to /results redirects when no state", async ({
    page,
  }) => {
    await page.goto("/results");
    // Should land at / or /quiz, not stay at /results
    await expect(page).not.toHaveURL("/results");
  });

  test("navigating to /results with unsubmitted quiz redirects to /quiz", async ({
    page,
  }) => {
    // Inject quiz state without submitted=true
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
          answers: [null],
          submitted: false,
          fileName: "test.pdf",
          pageCount: 1,
        })
      );
    });
    await page.goto("/results");
    await expect(page).toHaveURL("/quiz");
  });
});
