import { expect, test } from "@playwright/test";

for (const path of ["/follow/confirm?t=synthetic-follow-token", "/season/confirm?token=synthetic-bid-token"]) {
  test(`analytics excludes ${path.split("?")[0]} on direct load and client navigation`, async ({ page }) => {
    // Leave the SDK queue intact so the real app's registered beforeSend can be inspected.
    await page.route("**/_vercel/insights/script.js", (route) => route.fulfill({ contentType: "application/javascript", body: "" }));
    await page.goto(path);
    const filtered = () => page.evaluate(() => {
      const queue = (window as unknown as { vaq?: [string, (event: { type: string; url: string }) => unknown][] }).vaq;
      const filter = queue?.filter(([command]) => command === "beforeSend").at(-1)?.[1];
      if (!filter) return false;
      return ["pageview", "event"].every((type) => filter({ type, url: location.href }) === null);
    });
    await expect.poll(filtered).toBe(true);
    await page.getByRole("link", { name: "Noobwork home", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(path.split("?")[0]));
    await expect.poll(filtered).toBe(true);
  });
}
