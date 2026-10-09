import { expect, test } from "@playwright/test";

test("native bid confirmation preserves its same-origin security header", async ({ page }) => {
  let origin: string | undefined;
  await page.route("**/api/season/bids/confirm", async (route) => {
    origin = route.request().headers().origin;
    expect(route.request().method()).toBe("POST");
    await route.fulfill({ status: 303, headers: { location: "/season/confirm?result=confirmed&spot=banner-1" } });
  });
  await page.goto("/season/confirm?token=browser-regression-token");
  const siteOrigin = new URL(page.url()).origin;
  await page.getByRole("button", { name: "Confirm my bid", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Bid confirmed.", exact: true })).toBeVisible();
  expect(origin).toBe(siteOrigin);
});

test("bid confirmation does not send its token URL to another site", async ({ page }) => {
  let referrer: string | undefined;
  await page.route("https://privacy-check.example/**", async (route) => {
    referrer = route.request().headers().referer;
    await route.fulfill({ status: 200, contentType: "text/html", body: "External destination" });
  });
  await page.goto("/season/confirm?token=browser-regression-token");
  await page.evaluate(() => {
    const link = document.createElement("a");
    link.href = "https://privacy-check.example/";
    link.textContent = "External privacy check";
    document.body.append(link);
  });
  await page.getByRole("link", { name: "External privacy check" }).click();
  await expect(page.getByText("External destination")).toBeVisible();
  expect(referrer).toBeUndefined();
});
