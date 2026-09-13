import { expect, test, type Page } from "@playwright/test";

async function preferReducedMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
}

/** Assert #inquiry is near the top of the viewport after hash / soft-nav scroll. */
async function expectInquiryInView(page: Page) {
  const inquiry = page.locator("#inquiry");
  await expect(inquiry).toBeVisible();
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const el = document.getElementById("inquiry");
          if (!el) return null;
          const top = el.getBoundingClientRect().top;
          return top >= -80 && top < window.innerHeight * 0.85;
        }),
      { timeout: 10_000 }
    )
    .toBe(true);
}

async function fillAndSubmitInquiry(page: Page) {
  await page.getByLabel("Name").fill("E2E Partner");
  await page.getByLabel("Email").fill("e2e-partner@example.com");
  await page.getByLabel(/Company \/ Brand/).fill("Example Brand");
  await page.getByLabel("Message").fill(
    "We would love to explore a Q3 sponsored video across YouTube for our training launch."
  );
  await page.getByRole("button", { name: "Send partnership inquiry" }).click();
  await expect(page.getByRole("status")).toContainText("Message sent.");
}

test.describe("Partnership funnel", () => {
  test.beforeEach(async ({ page }) => {
    await preferReducedMotion(page);
  });

  test("home Explore partnerships opens the media kit", async ({ page }) => {
    await page.goto("/");
    await page
      .locator('a[data-partnership-source="hero"]', { hasText: "Explore partnerships" })
      .click();
    await expect(page).toHaveURL(/\/media-kit\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Work with Noobwork" })
    ).toBeVisible();
  });

  test("soft-nav Send a brief lands on the inquiry form", async ({ page }) => {
    await page.goto("/");
    await page
      .locator('a[data-partnership-source="homepage-partner"]', { hasText: "Send a brief" })
      .click();
    await expect(page).toHaveURL(/\/media-kit#inquiry/);
    await expectInquiryInView(page);
    await expect(page.getByLabel("Name")).toBeVisible();
  });

  test("Connect send-a-brief CTA reaches inquiry", async ({ page }) => {
    await page.goto("/");
    await page
      .locator('a[data-partnership-source="connect"]', { hasText: "send a brief" })
      .click();
    await expect(page).toHaveURL(/\/media-kit#inquiry/);
    await expectInquiryInView(page);
  });

  test("?inquiry= forces scroll onto the inquiry section", async ({ page }) => {
    await page.goto("/media-kit?inquiry=sent");
    await expectInquiryInView(page);
    await expect(page.getByRole("status")).toContainText("Message sent.");
  });

  test("inquiry form happy path (stubbed email)", async ({ page }) => {
    await page.goto("/media-kit#inquiry");
    await expectInquiryInView(page);
    await fillAndSubmitInquiry(page);
  });
});
