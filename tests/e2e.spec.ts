import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("displays hero section with correct heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/WedBridge/);
    const hero = page.locator("h1").first();
    await expect(hero).toBeVisible();
  });

  test("navigation links are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/search"]')).toBeVisible();
    await expect(page.locator('a[href="/about"]')).toBeVisible();
    await expect(page.locator('a[href="/contact"]')).toBeVisible();
  });

  test("FAQ section is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Frequently Asked Questions")).toBeVisible();
  });
});

test.describe("Auth Pages", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("input[type=email], input[name=email]")).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/\/register/);
  });

  test("forgot password page loads", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});

test.describe("Protected Routes", () => {
  test("redirects unauthenticated user from dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects unauthenticated user from search to login", async ({ page }) => {
    await page.goto("/search");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects unauthenticated user from admin to admin login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("Public Pages", () => {
  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveURL(/\/about/);
  });

  test("services page loads", async ({ page }) => {
    await page.goto("/services");
    await expect(page).toHaveURL(/\/services/);
  });

  test("membership page loads", async ({ page }) => {
    await page.goto("/membership");
    await expect(page).toHaveURL(/\/membership/);
  });

  test("vendor search loads", async ({ page }) => {
    await page.goto("/vendor/search");
    await expect(page).toHaveURL(/\/vendor\/search/);
  });
});

test.describe("SEO", () => {
  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.ok()).toBeTruthy();
    const content = await response?.text();
    expect(content).toContain("User-agent");
    expect(content).toContain("Sitemap");
  });

  test("sitemap.xml is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.ok()).toBeTruthy();
    const content = await response?.text();
    expect(content).toContain("<urlset");
  });

  test("manifest is accessible", async ({ page }) => {
    const response = await page.goto("/manifest.webmanifest");
    expect(response?.ok()).toBeTruthy();
    const content = await response?.text();
    expect(content).toContain("WedBridge");
  });

  test("structured data is present on home page", async ({ page }) => {
    await page.goto("/");
    const ldJson = page.locator('script[type="application/ld+json"]');
    await expect(ldJson).toHaveCount(await ldJson.count());
    const content = await ldJson.first().textContent();
    expect(content).toContain("schema.org");
  });
});

test.describe("PWA", () => {
  test("service worker is registered", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForTimeout(2000);
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration().then((r) => r !== undefined);
    });
    expect(swRegistered).toBeTruthy();
    await context.close();
  });
});
