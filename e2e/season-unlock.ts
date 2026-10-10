import { expect, type Page } from "@playwright/test";

/** Soft page password used in .env.example and local/CI e2e. */
export const SEASON_E2E_PASSWORD = "Julia123";

/** Submit the Season soft gate so subsequent /season viewer routes render. */
export async function unlockSeason(page: Page): Promise<void> {
  await page.goto("/season");
  const password = page.getByLabel("Password");
  if (await password.count()) {
    await password.fill(SEASON_E2E_PASSWORD);
    await page.getByRole("button", { name: "Continue" }).click();
  }
  await expect(page.getByRole("link", { name: "Noobwork home", exact: true })).toBeVisible({ timeout: 15_000 });
}
