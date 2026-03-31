import { test, expect } from "@playwright/test";

test("Can access page link", async ({ page }) => {
  const response = await page.goto("https://172.26.120.49/cpms/");
  await expect(response?.ok()).toBeTruthy();
});

test("Admin user requests change of position to social worker.", async ({
  page,
}) => {

    page.once('dialog', async dialog => {
      // Verify the text matches your specific message
      if (dialog.message() === 'Request Submitted! Wait for Admin Confirmation.') {
        console.log('Confirmed: Specific success alert appeared.');
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, you might want to fail the test or dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

  // 2. Trigger the action that opens the alert
  await page.getByRole('button', { name: 'Delete' }).click();

  await page.goto("https://172.26.120.49/cpms/");

  await page.fill('[name="username"]', "MTSARABIA");
  await page.fill('[name="password"]', "12345");

  await page.getByRole("button", { name: "SIGN IN" }).click();

  const modal = page.locator("#myModal");
  await expect(modal).toBeVisible();
  await modal.locator('[name="Request_change"]').click();

  const requestmodal = page.locator("#request_modal");
  await expect(requestmodal).toBeVisible();

  await page.selectOption('select[name="designation"]', { label: 'Admin' });
  await expect(page.locator('select[name="designation"]')).toContainText('Admin');

  await page.selectOption('select[name="designation"]', { label: 'Social Worker' });
  await expect(page.locator('select[name="designation"]')).toContainText('Social Worker');

  await page.getByRole("button", { name: "Confirm" }).click();
  //r_confirmation
  //requesr_confirmation

  


});
