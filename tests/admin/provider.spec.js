// @ts-check
import { test, expect } from "@playwright/test";

test.describe.serial("Provider Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://172.26.120.49/cpms/");

    await page.fill('[name="username"]', "MTSARABIA");
    await page.fill('[name="password"]', "12345");

    await page.getByRole("button", { name: "SIGN IN" }).click();

    await page.waitForTimeout(3000);

    await expect(page.url()).toBe("https://172.26.120.49/cpms/admin/home.php");
  });

  test.afterEach(async ({ page }) => {
    //logout
    await page.getByRole("link", { name: "Logout" }).click();

    const modal = page.locator("#logoutmodal");
    await expect(modal).toBeVisible();
    await modal.getByRole("link", { name: "Logout" }).click();

    await expect(page.url()).toContain("/cpms/index.php");
  });

  test("Can add valid provider record.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches your specific message
      if (dialog.message() === 'Successfully Adding Company!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, you might want to fail the test or dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    await page.getByRole("link", { name: "Add Provider" }).click();

    const modal = page.locator("#AddProvider");
    await expect(modal).toBeVisible();

    await page.fill('[name="addresseename"]', "Test Addressee Name");
    await page.fill('[name="addresseeposition"]', "Test Position");
    await page.fill('[name="addresseetomention"]', "Test Addressee To Mention");
    await page.fill('[name="companyname"]', "Test Company Name");
    await page.fill('[name="companyaddress"]', "Test Company Address");

    await modal.getByRole("button", { name: "Save" }).click();

    await page.waitForTimeout(3000);

    // await page.getByRole("search", { name: "Search" }).fill("Test Addressee Name");

    await page.waitForSelector('table');
    await expect(page.getByRole("cell", { name: "Client Feedback" })).toBeVisible();
  });

  test("Limit special characters in the text fields.", async ({ page }) => {

    await page.getByRole("link", { name: "Add Provider" }).click();

    const modal = page.locator("#AddProvider");
    await expect(modal).toBeVisible();

    await page.fill('[name="addresseename"]', "Test Addressee Name");
    await page.fill('[name="addresseeposition"]', "Test Position");
    await page.fill('[name="addresseetomention"]', "Test Addressee To Mention");
    await page.fill('[name="companyname"]', "Test Company Name");
    await page.fill('[name="companyaddress"]', "Test Company Address");

    await modal.getByRole("button", { name: "Save" }).click();

    await page.waitForTimeout(3000);

    // await page.getByRole("search", { name: "Search" }).fill("Test Addressee Name");

    await page.waitForSelector('table');
    await expect(page.getByRole("cell", { name: "Client Feedback" })).toBeVisible();
  });
});
