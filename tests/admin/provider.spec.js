// @ts-check
import { test, expect } from "@playwright/test";

test.describe.serial("Provider Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://172.26.120.49/cpms/");

    await page.fill('[name="username"]', "HASINADJAN");
    await page.fill('[name="password"]', "12345");

    await page.getByRole("button", { name: "SIGN IN" }).click();

    await page.waitForTimeout(3000);

    await expect(page.url()).toContain("/admin");
  });

  test.afterEach(async ({ page }) => {
    await page.waitForTimeout(3000);

    //logout
    await page.locator('a.nav-link:has-text("Logout")').click();

    const logoutModal = await page.locator("#logoutmodal");
    await expect(logoutModal).toBeVisible();

    console.log("logout modal visible");
    
    await logoutModal.getByRole("link", { name: "Logout" }).click();

    await expect(page.url()).toContain("/cpms/index.php");
  });

  test("Can add valid provider record.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Successfully Adding Company!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //click add button
    await page.locator('a[data-target="#AddProvider"]').click();

    //wait for modal
    const modal = page.locator("#AddProvider");
    await expect(modal).toBeVisible();

    //fill form and save
    await page.fill('[name="addresseename"]', "Test Addressee Name");
    await page.fill('[name="addresseeposition"]', "Test Position");
    await page.fill('[name="addresseetomention"]', "Test Addressee To Mention");
    await page.fill('[name="companyname"]', "Test Company Name");
    await page.fill('[name="companyaddress"]', "Test Company Address");

    await modal.getByRole("button", { name: "Save" }).click();

    await page.waitForTimeout(3000);

    // await page.getByRole("search", { name: "Search" }).fill("Test Addressee Name");

    //verify added provider is in the table
    await page.waitForSelector('table');
    await expect(page.getByRole("cell", { name: "Test Addressee Name" })).toBeVisible();
  });

  test("Limit special characters in the text fields.", async ({ page }) => {
    //click add button
    await page.locator('a[data-target="#AddProvider"]').click();

    const modal = page.locator("#AddProvider");
    await expect(modal).toBeVisible();

    //fill out form with numbers and special characters and save
    await page.fill('[name="addresseename"]', "123!@#$%^&*()-.,");
    await page.fill('[name="addresseeposition"]', "123!@#$%^&*()-.,");
    await page.fill('[name="addresseetomention"]', "123!@#$%^&*()-.,");
    await page.fill('[name="companyname"]', "123!@#$%^&*()-.,");
    await page.fill('[name="companyaddress"]', "123!@#$%^&*()-.,");

    await modal.getByRole("button", { name: "Save" }).click();

    await page.waitForTimeout(3000);

    //search for created provider
    await page.getByRole("search", { name: "Search" }).fill("123!@#$%^&*()-.,");

    //view provider details
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "View" }).click();

    //view modal
    const viewModal = page.locator("#ProviderInfo");
    await expect(viewModal).toBeVisible();

    //verify that some special characters are not saved
    await expect(page.locator('#addresseename')).toHaveValue("-.,");
    await expect(page.locator('#addresseeposition')).toHaveValue("-.,");
    await expect(page.locator('#addresseetomention')).toHaveValue("-.,");
    await expect(page.locator('#companyname')).toHaveValue("123!@#$%^&*()-.,");
    await expect(page.locator('#companyaddress')).toHaveValue("123!@#$%^&*()-.,");
    
    //close modal
    await modal.getByLabel('Close').click();
  });

  test("Cannot add service provider if one or more required fields is/are empty.", async ({ page }) => {
    //click add button
    await page.locator('a[data-target="#AddProvider"]').click();

    const modal = page.locator("#AddProvider")
    await expect(modal).toBeVisible();

    //fill out form and leave one or more required fields empty
    await page.fill('[name="addresseename"]', "Juan Dela Cruz");
    await page.fill('[name="addresseeposition"]', "The Manager");
    await page.fill('[name="addresseetomention"]', "Juana Dela Cruz");

    await modal.getByRole("button", { name: "Save" }).click();

    await page.waitForTimeout(3000);

    //capture if there is a validation message
    const checkValidationMessage = (el) => {
      if (el instanceof HTMLInputElement) {
        return el.validationMessage;
      }
      return null;
    };

    //verify validation message
    const companynamemsg = await page.locator('#companyname').evaluate(checkValidationMessage);
    expect(companynamemsg).toBe("Please fill out this field.");

    //close modal
    await modal.getByLabel('Close').click();
  });

  test("Can add service provider if one or more optional fields is/are empty.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Successfully Adding Company!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });
    
    //click add button
    await page.locator('a[data-target="#AddProvider"]').click();

    const modal = page.locator("#AddProvider")
    await expect(modal).toBeVisible();

    //fill out form and leave one or more required fields empty
    await page.fill('[name="addresseeposition"]', "The Manager");
    await page.fill('[name="addresseetomention"]', "Juana Dela Cruz");
    await page.fill('[name="companyname"]', "Juan Company Name");
    await page.fill('[name="companyaddress"]', "Juan Company Address");

    await modal.getByRole("button", { name: "Save" }).click();

    await page.waitForTimeout(3000);

    //verify added provider is in the table
    await page.waitForSelector('table');
    await expect(page.getByRole("cell", { name: "Juan Company Name" })).toBeVisible();
  });

  test("Cannot add duplicate provider record.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Company Already Exist!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Provider list is empty. Skipping test.");
    }

    const row = page.locator('table tbody tr').nth(10);
    await row.locator('button:has-text("View")').click();

    //click view button
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "View" }).click();

    //view modal
    const viewModal = page.locator("#ProviderInfo");
    await expect(viewModal).toBeVisible();

    //get provider information
    const addresseename = await viewModal.locator("#addresseename").innerText();
    const addresseeposition = await viewModal.locator("#addresseeposition").innerText();
    const addresseetomention = await viewModal.locator("#tomention").innerText();
    const companyname = await viewModal.locator("#companyname").innerText();
    const companyaddress = await viewModal.locator("#companyaddress").innerText();

    //close modal
    await viewModal.getByLabel('Close').click();

    //click add button
    await page.locator('a[data-target="#AddProvider"]').click();

    const modal = page.locator("#AddProvider")
    await expect(modal).toBeVisible();

    //fill out form and leave one or more required fields empty
    await page.fill('[name="addresseename"]', addresseename);
    await page.fill('[name="addresseeposition"]', addresseeposition);
    await page.fill('[name="addresseetomention"]', addresseetomention);
    await page.fill('[name="companyname"]', companyname);
    await page.fill('[name="companyaddress"]', companyaddress);

    await modal.getByRole("button", { name: "Save" }).click();

    await page.waitForTimeout(3000);
  });

  test("Able to view provider information.", async ({ page }) => {
    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Provider list is empty. Skipping test.");
    }

    //search for a provider
    await page.getByRole("search", { name: "Search" }).fill("Test Addressee Name");

    //click view button
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "View" }).click();

    //view modal
    const viewModal1 = page.locator("#ProviderInfo");
    await expect(viewModal1).toBeVisible();

    //verify provider information
    expect(await viewModal1.locator("#addresseename").innerText()).toBe("Test Addressee Name");

    //close modal
    await viewModal1.getByLabel('Close').click();

    //view another provider information
    const row = page.locator('table tbody tr').nth(8);
    const companyName = row.locator('td:nth-child(1)').innerText();
    await row.locator('button:has-text("View")').click();

    //view modal
    const viewModal2 = page.locator("#ProviderInfo");
    await expect(viewModal2).toBeVisible();

    //verify provider information
    expect(await viewModal2.locator("#addresseename").innerText()).toBe(companyName);

    //close modal
    await viewModal2.getByLabel('Close').click();
  });

  test("Can update provider information.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Successfully Updating Company!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Provider list is empty. Skipping test.");
    }

    //search for a provider
    await page.getByRole("search", { name: "Search" }).fill("Test Addressee Name");

    //click update button
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "Update" }).click();

    //update modal
    const updateModal = page.locator("#UpdateProvider");
    await expect(updateModal).toBeVisible();

    //update provider information
    await updateModal.locator("#addresseename").fill(' Edited');
    await updateModal.locator("#addresseeposition").fill(' Edited');
    await updateModal.locator("#addresseetomention").fill(' Edited');
    await updateModal.locator("companyname").fill(' Edited');
    await updateModal.locator("#companyaddress").fill(' Edited'); 

    await updateModal.getByRole("button", { name: "Update" }).click();

    //verify that the information is updated
    await page.waitForTimeout(3000);
    await page.getByRole("search", { name: "Search" }).fill("Test Addressee Name Edited");
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "View" }).click();

    //view modal
    const viewModal = page.locator("#ProviderInfo");
    await expect(viewModal).toBeVisible();

    //verify provider information
    expect(await viewModal.locator("#addresseename").innerText()).toBe("Test Addressee Name Edited");
    expect(await viewModal.locator("#addresseeposition").innerText()).toBe("Test Position Edited");
    expect(await viewModal.locator("#tomention").innerText()).toBe("Test Addressee To Mention Edited");
    expect(await viewModal.locator("#companyname").innerText()).toBe("Test Company Name Edited");
    expect(await viewModal.locator("#companyaddress").innerText()).toBe("Test Company Address Edited");

    //close modal
    await viewModal.getByLabel('Close').click();

  });

  test("Limit special characters in the text fields when updating provider information.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Successfully Updating Company!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Provider list is empty. Skipping test.");
    }

    //search for a provider
    await page.getByRole("search", { name: "Search" }).fill("Test Addressee Name Edited");

    //click update button
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "Update" }).click();

    //update modal
    const updateModal = page.locator("#UpdateProvider");
    await expect(updateModal).toBeVisible();

    //update provider information
    await updateModal.locator("#addresseename").fill(' !@#$%^&*()_+-.,');
    await updateModal.locator("#addresseeposition").fill(' !@#$%^&*()_+-.,');
    await updateModal.locator("#addresseetomention").fill(' !@#$%^&*()_+-.,');
    await updateModal.locator("companyname").fill(' !@#$%^&*()_+-.,');
    await updateModal.locator("#companyaddress").fill(' !@#$%^&*()_+-.,'); 

    await updateModal.getByRole("button", { name: "Update" }).click();

    //verify that the information is updated
    await page.waitForTimeout(3000);
    await page.getByRole("search", { name: "Search" }).fill("Test Addressee Name Edited");
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "View" }).click();

    //view modal
    const viewModal = page.locator("#ProviderInfo");
    await expect(viewModal).toBeVisible();

    //verify provider information
    expect(await viewModal.locator("#addresseename").innerText()).toBe("Test Addressee Name Edited -.,");
    expect(await viewModal.locator("#addresseeposition").innerText()).toBe("Test Position Edited -.,");
    expect(await viewModal.locator("#tomention").innerText()).toBe("Test Addressee To Mention Edited -.,");
    expect(await viewModal.locator("#companyname").innerText()).toBe("Test Company Name Edited -.,");
    expect(await viewModal.locator("#companyaddress").innerText()).toBe("Test Company Address Edited -.,");

    //close modal
    await viewModal.getByLabel('Close').click();

  });

  test("Cannot update service provider if one or more required fields is/are empty.", async ({ page }) => {
    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Provider list is empty. Skipping test.");
    }

    //search for a provider
    await page.getByRole("search", { name: "Search" }).fill("Test Addressee Name Edited");

    //click update button
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "Update" }).click();

    //update modal
    const updateModal = page.locator("#UpdateProvider");
    await expect(updateModal).toBeVisible();

    //update provider information
    await updateModal.locator("#addresseename").fill(' !@#$%^&*()_+-.,');
    await updateModal.locator("#addresseeposition").fill(' !@#$%^&*()_+-.,');
    await updateModal.locator("#addresseetomention").fill(' !@#$%^&*()_+-.,');

    await updateModal.getByRole("button", { name: "Update" }).click();

    //capture if there is a validation message
    const checkValidationMessage = (el) => {
      if (el instanceof HTMLInputElement) {
        return el.validationMessage;
      }
      return null;
    };

    //verify validation message
    const companynamemsg = await updateModal.locator('#companyname').evaluate(checkValidationMessage);
    expect(companynamemsg).toBe("Please fill out this field.");

    //close modal
    await updateModal.getByLabel('Close').click();

  });

  test("Can update service provider if one or more optional fields is/are empty.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Successfully Updating Company!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Provider list is empty. Skipping test.");
    }

    //search for a provider
    await page.getByRole("search", { name: "Search" }).fill("Juan Company Name");

    //click update button
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "Update" }).click();

    //update modal
    const updateModal = page.locator("#UpdateProvider");
    await expect(updateModal).toBeVisible();

    //update provider information
    await updateModal.locator("#addresseeposition").fill(' Edited');
    await updateModal.locator("#addresseetomention").fill(' Edited');
    await updateModal.locator("companyname").fill(' Edited');
    await updateModal.locator("#companyaddress").fill(' Edited'); 

    await updateModal.getByRole("button", { name: "Update" }).click();

    //verify that the information is updated
    await page.waitForTimeout(3000);
    await page.getByRole("search", { name: "Search" }).fill("Juan Company Name Edited");
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "View" }).click();

    //view modal
    const viewModal = page.locator("#ProviderInfo");
    await expect(viewModal).toBeVisible();

    //verify provider information
    expect(await viewModal.locator("#addresseeposition").innerText()).toBe("The Manager Edited");
    expect(await viewModal.locator("#tomention").innerText()).toBe("Juana Dela Cruz Edited");
    expect(await viewModal.locator("#companyname").innerText()).toBe("Juana Dela Cruz Edited");
    expect(await viewModal.locator("#companyaddress").innerText()).toBe("Juan Company Address Edited");

    //close modal
    await viewModal.getByLabel('Close').click();

  });

  test("Cannot update service provider if information already exists.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Company Already Exist!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Provider list is empty. Skipping test.");
    }

    //click view button
    const row1 = page.locator('table tbody tr').nth(2);
    await row1.locator('button:has-text("View")').click();

    //view modal
    const viewModal = page.locator("#ProviderInfo");
    await expect(viewModal).toBeVisible();

    //get provider information
    const addresseename = await viewModal.locator("#addresseename").innerText();
    const addresseeposition = await viewModal.locator("#addresseeposition").innerText();
    const addresseetomention = await viewModal.locator("#tomention").innerText();
    const companyname = await viewModal.locator("#companyname").innerText();
    const companyaddress = await viewModal.locator("#companyaddress").innerText();

    //close modal
    await viewModal.getByLabel('Close').click();

    //click update button
    const row2 = page.locator('table tbody tr').nth(3);
    await row2.locator('button:has-text("Update")').click();

    const updateModal = page.locator("#UpdateProvider");
    await expect(updateModal).toBeVisible();

    //update provider information
    await updateModal.locator("#addresseename").fill(addresseename);
    await updateModal.locator("#addresseeposition").fill(addresseeposition);
    await updateModal.locator("#addresseetomention").fill(addresseetomention);
    await updateModal.locator("companyname").fill(companyname);
    await updateModal.locator("#companyaddress").fill(companyaddress); 

    await updateModal.getByRole("button", { name: "Update" }).click();

    await page.waitForTimeout(3000);
  });
});
